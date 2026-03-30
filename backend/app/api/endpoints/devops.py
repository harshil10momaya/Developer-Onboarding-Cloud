from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, DateTime, JSON
from pydantic import BaseModel

from app.core.database import get_db, Base
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/pipelines", tags=["DevOps"])


# ---------- Model ----------
class Pipeline(Base):
    __tablename__ = "pipelines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    status = Column(String(50), default="Active")
    success_rate = Column(Integer, default=0)
    tools = Column(String(500), nullable=True)
    last_run = Column(DateTime(timezone=True), nullable=True)
    created_by_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


# ---------- Schemas ----------
class PipelineCreate(BaseModel):
    name: str
    status: str = "Active"
    success_rate: int = 0
    tools: Optional[str] = None


class PipelineOut(BaseModel):
    id: int
    name: str
    status: str
    success_rate: int
    tools: Optional[str] = None
    last_run: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Endpoints ----------
@router.get("/", response_model=List[PipelineOut])
def list_pipelines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Pipeline).order_by(Pipeline.created_at.desc()).all()


@router.post("/", response_model=PipelineOut, status_code=status.HTTP_201_CREATED)
def create_pipeline(
    payload: PipelineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pipeline = Pipeline(
        name=payload.name,
        status=payload.status,
        success_rate=payload.success_rate,
        tools=payload.tools,
        created_by_id=current_user.id,
    )
    db.add(pipeline)
    db.commit()
    db.refresh(pipeline)
    return pipeline


@router.put("/{pipeline_id}/run", response_model=PipelineOut)
def trigger_pipeline(
    pipeline_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    pipeline.last_run = datetime.now(timezone.utc)
    pipeline.status = "Active"
    db.commit()
    db.refresh(pipeline)
    return pipeline


@router.delete("/{pipeline_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pipeline(
    pipeline_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    db.delete(pipeline)
    db.commit()
