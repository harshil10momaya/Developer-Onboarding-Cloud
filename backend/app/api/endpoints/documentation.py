from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Text, DateTime
from pydantic import BaseModel

from app.core.database import get_db, Base
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/docs", tags=["Documentation"])


# ---------- Model (inline since it's a simple addition) ----------
from datetime import timezone

class DocArticle(Base):
    __tablename__ = "doc_articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    content = Column(Text, nullable=True)
    views = Column(Integer, default=0)
    created_by_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


# ---------- Schemas ----------
class DocCreate(BaseModel):
    title: str
    category: str
    content: Optional[str] = None


class DocOut(BaseModel):
    id: int
    title: str
    category: str
    content: Optional[str] = None
    views: int
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- Endpoints ----------
@router.get("/", response_model=List[DocOut])
def list_docs(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(DocArticle)
    if category:
        query = query.filter(DocArticle.category == category)
    return query.order_by(DocArticle.updated_at.desc()).all()


@router.post("/", response_model=DocOut, status_code=status.HTTP_201_CREATED)
def create_doc(
    payload: DocCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = DocArticle(
        title=payload.title,
        category=payload.category,
        content=payload.content,
        created_by_id=current_user.id,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/{doc_id}", response_model=DocOut)
def get_doc(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(DocArticle).filter(DocArticle.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.views += 1
    db.commit()
    db.refresh(doc)
    return doc


@router.put("/{doc_id}", response_model=DocOut)
def update_doc(
    doc_id: int,
    payload: DocCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(DocArticle).filter(DocArticle.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.title = payload.title
    doc.category = payload.category
    doc.content = payload.content
    db.commit()
    db.refresh(doc)
    return doc


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_doc(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(DocArticle).filter(DocArticle.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
