from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.discussion import Discussion, DiscussionReply

router = APIRouter(prefix="/discussions", tags=["Discussions"])


# ---------- Schemas ----------
class DiscussionCreate(BaseModel):
    title: str
    body: Optional[str] = None
    category: str


class ReplyCreate(BaseModel):
    body: str


class ReplyOut(BaseModel):
    id: int
    discussion_id: int
    author_id: int
    author_name: Optional[str] = None
    body: str
    created_at: datetime

    class Config:
        from_attributes = True


class DiscussionOut(BaseModel):
    id: int
    title: str
    body: Optional[str] = None
    category: str
    author_id: int
    author_name: Optional[str] = None
    views: int
    reply_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Endpoints ----------
@router.get("/", response_model=List[DiscussionOut])
def list_discussions(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Discussion)
    if category:
        query = query.filter(Discussion.category == category)
    discussions = query.order_by(Discussion.created_at.desc()).all()

    result = []
    for d in discussions:
        reply_count = db.query(func.count(DiscussionReply.id)).filter(
            DiscussionReply.discussion_id == d.id
        ).scalar()
        author = db.query(User).filter(User.id == d.author_id).first()
        result.append(DiscussionOut(
            id=d.id,
            title=d.title,
            body=d.body,
            category=d.category,
            author_id=d.author_id,
            author_name=author.full_name if author else "Unknown",
            views=d.views,
            reply_count=reply_count or 0,
            created_at=d.created_at,
        ))
    return result


@router.post("/", response_model=DiscussionOut, status_code=status.HTTP_201_CREATED)
def create_discussion(
    payload: DiscussionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    discussion = Discussion(
        title=payload.title,
        body=payload.body,
        category=payload.category,
        author_id=current_user.id,
    )
    db.add(discussion)
    db.commit()
    db.refresh(discussion)
    return DiscussionOut(
        id=discussion.id,
        title=discussion.title,
        body=discussion.body,
        category=discussion.category,
        author_id=discussion.author_id,
        author_name=current_user.full_name,
        views=discussion.views,
        reply_count=0,
        created_at=discussion.created_at,
    )


@router.get("/{discussion_id}", response_model=DiscussionOut)
def get_discussion(
    discussion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    d = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Discussion not found")
    # Increment views
    d.views += 1
    db.commit()
    db.refresh(d)
    reply_count = db.query(func.count(DiscussionReply.id)).filter(
        DiscussionReply.discussion_id == d.id
    ).scalar()
    author = db.query(User).filter(User.id == d.author_id).first()
    return DiscussionOut(
        id=d.id, title=d.title, body=d.body, category=d.category,
        author_id=d.author_id, author_name=author.full_name if author else "Unknown",
        views=d.views, reply_count=reply_count or 0, created_at=d.created_at,
    )


@router.delete("/{discussion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_discussion(
    discussion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    d = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Discussion not found")
    if d.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(d)
    db.commit()


# ---------- Replies ----------
@router.get("/{discussion_id}/replies", response_model=List[ReplyOut])
def list_replies(
    discussion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    replies = (
        db.query(DiscussionReply)
        .filter(DiscussionReply.discussion_id == discussion_id)
        .order_by(DiscussionReply.created_at.asc())
        .all()
    )
    result = []
    for r in replies:
        author = db.query(User).filter(User.id == r.author_id).first()
        result.append(ReplyOut(
            id=r.id, discussion_id=r.discussion_id, author_id=r.author_id,
            author_name=author.full_name if author else "Unknown",
            body=r.body, created_at=r.created_at,
        ))
    return result


@router.post("/{discussion_id}/replies", response_model=ReplyOut, status_code=status.HTTP_201_CREATED)
def create_reply(
    discussion_id: int,
    payload: ReplyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    d = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Discussion not found")
    reply = DiscussionReply(
        discussion_id=discussion_id,
        author_id=current_user.id,
        body=payload.body,
    )
    db.add(reply)
    db.commit()
    db.refresh(reply)
    return ReplyOut(
        id=reply.id, discussion_id=reply.discussion_id, author_id=reply.author_id,
        author_name=current_user.full_name, body=reply.body, created_at=reply.created_at,
    )
