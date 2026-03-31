from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.learning import UserProgress
from app.models.mentor_session import MentorSession, Notification
from app.schemas.user import UserOut

router = APIRouter(prefix="/mentors", tags=["Mentor & Admin"])


# ---------- Schemas ----------
class SessionRequest(BaseModel):
    mentor_id: int
    topic: str
    scheduled_at: datetime


class SessionAction(BaseModel):
    status: str  # accepted or rejected
    mentor_note: Optional[str] = None


class SessionOut(BaseModel):
    id: int
    developer_id: int
    developer_name: Optional[str] = None
    mentor_id: int
    mentor_name: Optional[str] = None
    topic: str
    scheduled_at: datetime
    status: str
    mentor_note: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationOut(BaseModel):
    id: int
    user_id: int
    message: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Mentor List ----------
@router.get("/", response_model=List[UserOut])
def list_mentors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(User)
        .filter(User.role.in_([UserRole.MENTOR, UserRole.ADMIN]))
        .filter(User.is_active == True)
        .all()
    )


# ---------- Mentor Availability ----------
@router.get("/{mentor_id}/availability")
def check_availability(
    mentor_id: int,
    scheduled_at: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Check if mentor has a conflicting accepted session within 1 hour."""
    try:
        dt = datetime.fromisoformat(scheduled_at.replace("Z", "+00:00"))
    except Exception:
        raise HTTPException(400, "Invalid datetime format")

    from datetime import timedelta
    conflict = (
        db.query(MentorSession)
        .filter(
            MentorSession.mentor_id == mentor_id,
            MentorSession.status == "accepted",
            MentorSession.scheduled_at.between(dt - timedelta(hours=1), dt + timedelta(hours=1)),
        )
        .first()
    )
    return {"available": conflict is None, "conflict": conflict.topic if conflict else None}


# ---------- Session CRUD ----------
@router.post("/sessions", response_model=SessionOut)
def request_session(
    payload: SessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Developer requests a session with a mentor."""
    mentor = db.query(User).filter(User.id == payload.mentor_id).first()
    if not mentor or mentor.role not in (UserRole.MENTOR, UserRole.ADMIN):
        raise HTTPException(404, "Mentor not found")

    session = MentorSession(
        developer_id=current_user.id,
        mentor_id=payload.mentor_id,
        topic=payload.topic,
        scheduled_at=payload.scheduled_at,
    )
    db.add(session)
    db.flush()

    # Notify mentor
    notif = Notification(
        user_id=payload.mentor_id,
        message=f"New session request from {current_user.full_name}: \"{payload.topic}\"",
        link="/mentor-support",
    )
    db.add(notif)
    db.commit()
    db.refresh(session)

    return SessionOut(
        id=session.id, developer_id=session.developer_id,
        developer_name=current_user.full_name,
        mentor_id=session.mentor_id, mentor_name=mentor.full_name,
        topic=session.topic, scheduled_at=session.scheduled_at,
        status=session.status, mentor_note=session.mentor_note,
        created_at=session.created_at,
    )


@router.get("/sessions", response_model=List[SessionOut])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List sessions relevant to current user."""
    sessions = (
        db.query(MentorSession)
        .filter(
            or_(
                MentorSession.developer_id == current_user.id,
                MentorSession.mentor_id == current_user.id,
            )
        )
        .order_by(MentorSession.created_at.desc())
        .all()
    )
    result = []
    for s in sessions:
        dev = db.query(User).filter(User.id == s.developer_id).first()
        mentor = db.query(User).filter(User.id == s.mentor_id).first()
        result.append(SessionOut(
            id=s.id, developer_id=s.developer_id,
            developer_name=dev.full_name if dev else "Unknown",
            mentor_id=s.mentor_id, mentor_name=mentor.full_name if mentor else "Unknown",
            topic=s.topic, scheduled_at=s.scheduled_at,
            status=s.status, mentor_note=s.mentor_note,
            created_at=s.created_at,
        ))
    return result


@router.put("/sessions/{session_id}", response_model=SessionOut)
def respond_session(
    session_id: int,
    payload: SessionAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mentor accepts or rejects a session request."""
    session = db.query(MentorSession).filter(MentorSession.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session not found")
    if session.mentor_id != current_user.id:
        raise HTTPException(403, "Only the assigned mentor can respond")
    if session.status != "pending":
        raise HTTPException(400, "Session already responded to")

    session.status = payload.status
    session.mentor_note = payload.mentor_note
    db.flush()

    # Notify developer
    status_text = "accepted" if payload.status == "accepted" else "declined"
    notif = Notification(
        user_id=session.developer_id,
        message=f"Your session with {current_user.full_name} has been {status_text}."
               + (f" Note: {payload.mentor_note}" if payload.mentor_note else ""),
        link="/mentor-support",
    )
    db.add(notif)
    db.commit()
    db.refresh(session)

    dev = db.query(User).filter(User.id == session.developer_id).first()
    return SessionOut(
        id=session.id, developer_id=session.developer_id,
        developer_name=dev.full_name if dev else "Unknown",
        mentor_id=session.mentor_id, mentor_name=current_user.full_name,
        topic=session.topic, scheduled_at=session.scheduled_at,
        status=session.status, mentor_note=session.mentor_note,
        created_at=session.created_at,
    )


# ---------- Developer Progress (for mentors/admins) ----------
@router.get("/developers", response_model=List[dict])
def list_developer_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in (UserRole.MENTOR, UserRole.ADMIN):
        raise HTTPException(403, "Only mentors and admins can view this")

    developers = db.query(User).filter(User.role == UserRole.DEVELOPER, User.is_active == True).all()
    result = []
    for dev in developers:
        progress_records = db.query(UserProgress).filter(UserProgress.user_id == dev.id).all()
        completed = sum(1 for p in progress_records if p.status == "completed")
        total = len(progress_records)
        time_spent = sum(p.time_spent_minutes for p in progress_records)
        result.append({
            "id": dev.id, "full_name": dev.full_name, "email": dev.email,
            "dev_role": dev.dev_role,
            "modules_completed": completed, "total_modules": total,
            "completion_rate": round(completed / total * 100, 1) if total > 0 else 0,
            "time_spent_hours": time_spent // 60,
        })
    return result


# ---------- Notifications ----------
@router.get("/notifications", response_model=List[NotificationOut])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(20)
        .all()
    )


@router.put("/notifications/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id, Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(404, "Notification not found")
    notif.is_read = True
    db.commit()
    return {"status": "ok"}


@router.put("/notifications/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id, Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"status": "ok"}
