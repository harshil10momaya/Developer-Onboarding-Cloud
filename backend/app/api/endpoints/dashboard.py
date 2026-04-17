from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.redis_client import get_cache, set_cache
from app.models.user import User, UserRole
from app.models.repository import Repository
from app.models.learning import Module, UserProgress, LearningPath
from app.models.course import Course, Lecture, LectureProgress
from app.models.mentor_session import MentorSession, Notification

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


class DashboardStats(BaseModel):
    total_repositories: int = 0
    modules_generated: int = 0
    active_developers: int = 0
    completion_rate: float = 0
    modules_completed: int = 0
    total_modules: int = 0
    time_spent_hours: int = 0
    average_score: float = 0
    # Course-based progress
    total_courses: int = 0
    total_lectures: int = 0
    completed_lectures: int = 0
    lectures_completion_rate: float = 0
    # Role-specific
    pending_sessions: int = 0
    unread_notifications: int = 0
    # Admin-specific
    total_users: int = 0
    total_mentors: int = 0


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cache_key = f"dashboard_stats_{current_user.id}"
    cached_data = get_cache(cache_key)
    if cached_data:
        return DashboardStats(**cached_data)

    total_repos = db.query(func.count(Repository.id)).scalar() or 0
    total_modules = db.query(func.count(Module.id)).scalar() or 0
    active_devs = db.query(func.count(User.id)).filter(User.is_active == True, User.role == UserRole.DEVELOPER).scalar() or 0

    total_courses = db.query(func.count(Course.id)).scalar() or 0
    total_lectures = db.query(func.count(Lecture.id)).scalar() or 0

    # User-specific lecture progress
    completed_lectures = db.query(func.count(LectureProgress.id)).filter(
        LectureProgress.user_id == current_user.id,
        LectureProgress.is_completed == True,
    ).scalar() or 0

    # User-specific module progress
    user_progress = db.query(UserProgress).filter(UserProgress.user_id == current_user.id).all()
    completed_mods = sum(1 for p in user_progress if p.status == "completed")
    total_assigned = len(user_progress) if user_progress else total_modules
    completion_rate = (completed_mods / total_assigned * 100) if total_assigned > 0 else 0
    time_spent = sum(p.time_spent_minutes for p in user_progress)
    scores = [p.score for p in user_progress if p.score is not None]
    avg_score = sum(scores) / len(scores) if scores else 0

    # ... rest of calculations ...
    lectures_rate = (completed_lectures / total_lectures * 100) if total_lectures > 0 else 0
    unread = db.query(func.count(Notification.id)).filter(Notification.user_id == current_user.id, Notification.is_read == False).scalar() or 0

    if current_user.role in (UserRole.MENTOR, UserRole.ADMIN):
        pending = db.query(func.count(MentorSession.id)).filter(MentorSession.mentor_id == current_user.id, MentorSession.status == "pending").scalar() or 0
    else:
        pending = db.query(func.count(MentorSession.id)).filter(MentorSession.developer_id == current_user.id, MentorSession.status == "pending").scalar() or 0

    total_users = db.query(func.count(User.id)).scalar() or 0
    total_mentors = db.query(func.count(User.id)).filter(User.role == UserRole.MENTOR).scalar() or 0

    stats = DashboardStats(
        total_repositories=total_repos,
        modules_generated=total_modules,
        active_developers=active_devs,
        completion_rate=round(completion_rate, 1),
        modules_completed=completed_mods,
        total_modules=total_assigned,
        time_spent_hours=time_spent // 60,
        average_score=round(avg_score, 1),
        total_courses=total_courses,
        total_lectures=total_lectures,
        completed_lectures=completed_lectures,
        lectures_completion_rate=round(lectures_rate, 1),
        pending_sessions=pending,
        unread_notifications=unread,
        total_users=total_users,
        total_mentors=total_mentors,
    )
    
    set_cache(cache_key, stats.model_dump())
    return stats
