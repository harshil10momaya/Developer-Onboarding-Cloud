from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.learning import UserProgress
from app.schemas.user import UserOut

router = APIRouter(prefix="/mentors", tags=["Mentor & Admin"])


@router.get("/", response_model=List[UserOut])
def list_mentors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all users with mentor or admin role."""
    mentors = (
        db.query(User)
        .filter(User.role.in_([UserRole.MENTOR, UserRole.ADMIN]))
        .filter(User.is_active == True)
        .all()
    )
    return mentors


@router.get("/developers", response_model=List[dict])
def list_developer_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mentor view: see all developers and their progress summary."""
    if current_user.role not in (UserRole.MENTOR, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Only mentors and admins can view this")

    developers = (
        db.query(User)
        .filter(User.role == UserRole.DEVELOPER, User.is_active == True)
        .all()
    )

    result = []
    for dev in developers:
        progress_records = (
            db.query(UserProgress).filter(UserProgress.user_id == dev.id).all()
        )
        completed = sum(1 for p in progress_records if p.status == "completed")
        total = len(progress_records)
        time_spent = sum(p.time_spent_minutes for p in progress_records)

        result.append({
            "id": dev.id,
            "full_name": dev.full_name,
            "email": dev.email,
            "dev_role": dev.dev_role,
            "modules_completed": completed,
            "total_modules": total,
            "completion_rate": round(completed / total * 100, 1) if total > 0 else 0,
            "time_spent_hours": time_spent // 60,
        })

    return result
