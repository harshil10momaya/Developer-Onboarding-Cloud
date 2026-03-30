from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.repository import Repository
from app.models.learning import Module, UserProgress
from app.schemas.learning import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_repos = db.query(func.count(Repository.id)).scalar() or 0
    total_modules = db.query(func.count(Module.id)).scalar() or 0
    active_devs = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0

    # User-specific progress
    user_progress = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == current_user.id)
        .all()
    )

    completed = sum(1 for p in user_progress if p.status == "completed")
    total_assigned = len(user_progress) if user_progress else total_modules
    completion_rate = (completed / total_assigned * 100) if total_assigned > 0 else 0

    time_spent = sum(p.time_spent_minutes for p in user_progress)
    scores = [p.score for p in user_progress if p.score is not None]
    avg_score = sum(scores) / len(scores) if scores else 0

    return DashboardStats(
        total_repositories=total_repos,
        modules_generated=total_modules,
        active_developers=active_devs,
        completion_rate=round(completion_rate, 1),
        modules_completed=completed,
        total_modules=total_assigned,
        time_spent_hours=time_spent // 60,
        average_score=round(avg_score, 1),
    )
