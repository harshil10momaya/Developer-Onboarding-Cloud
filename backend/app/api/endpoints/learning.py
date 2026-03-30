from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.learning import Module, LearningPath, UserProgress
from app.schemas.learning import (
    ModuleCreate, ModuleOut,
    LearningPathCreate, LearningPathOut,
    ProgressUpdate, ProgressOut,
)

router = APIRouter(tags=["Learning"])


# ==================== MODULES ====================

@router.get("/modules", response_model=List[ModuleOut])
def list_modules(
    repo_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Module)
    if repo_id:
        query = query.filter(Module.repository_id == repo_id)
    return query.order_by(Module.order).all()


@router.post("/modules", response_model=ModuleOut, status_code=status.HTTP_201_CREATED)
def create_module(
    payload: ModuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    module = Module(**payload.model_dump())
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


@router.get("/modules/{module_id}", response_model=ModuleOut)
def get_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


# ==================== LEARNING PATHS ====================

@router.get("/learning-paths", response_model=List[LearningPathOut])
def list_learning_paths(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(LearningPath).all()


@router.post("/learning-paths", response_model=LearningPathOut, status_code=status.HTTP_201_CREATED)
def create_learning_path(
    payload: LearningPathCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    path = LearningPath(**payload.model_dump())
    db.add(path)
    db.commit()
    db.refresh(path)
    return path


@router.get("/learning-paths/{path_id}", response_model=LearningPathOut)
def get_learning_path(
    path_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    path = db.query(LearningPath).filter(LearningPath.id == path_id).first()
    if not path:
        raise HTTPException(status_code=404, detail="Learning path not found")
    return path


# ==================== PROGRESS ====================

@router.get("/progress", response_model=List[ProgressOut])
def get_my_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(UserProgress).filter(UserProgress.user_id == current_user.id).all()


@router.put("/progress/{module_id}", response_model=ProgressOut)
def update_progress(
    module_id: int,
    payload: ProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    progress = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == current_user.id, UserProgress.module_id == module_id)
        .first()
    )

    now = datetime.now(timezone.utc)

    if not progress:
        progress = UserProgress(
            user_id=current_user.id,
            module_id=module_id,
            status=payload.status,
            score=payload.score,
            time_spent_minutes=payload.time_spent_minutes or 0,
            started_at=now if payload.status == "in_progress" else None,
            completed_at=now if payload.status == "completed" else None,
        )
        db.add(progress)
    else:
        progress.status = payload.status
        if payload.score is not None:
            progress.score = payload.score
        if payload.time_spent_minutes is not None:
            progress.time_spent_minutes += payload.time_spent_minutes
        if payload.status == "in_progress" and not progress.started_at:
            progress.started_at = now
        if payload.status == "completed":
            progress.completed_at = now

    db.commit()
    db.refresh(progress)
    return progress
