from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.course import Course, Lecture, LectureProgress

router = APIRouter(tags=["Courses & Lectures"])


# ---------- Schemas ----------
class LectureOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    youtube_id: Optional[str] = None
    duration_minutes: int
    order: int
    course_id: int
    is_completed: Optional[bool] = False

    class Config:
        from_attributes = True


class CourseOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    learning_path_id: Optional[int] = None
    order: int
    image_url: Optional[str] = None
    lectures: List[LectureOut] = []
    total_lectures: int = 0
    completed_lectures: int = 0
    progress_percent: float = 0

    class Config:
        from_attributes = True


class LectureProgressUpdate(BaseModel):
    is_completed: bool = False
    watched_seconds: int = 0


class LectureProgressOut(BaseModel):
    id: int
    user_id: int
    lecture_id: int
    course_id: int
    is_completed: bool
    watched_seconds: int
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------- Course Endpoints ----------
@router.get("/courses", response_model=List[CourseOut])
def list_courses(
    learning_path_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Course)
    if learning_path_id:
        query = query.filter(Course.learning_path_id == learning_path_id)
    courses = query.order_by(Course.order).all()

    result = []
    for course in courses:
        lectures = db.query(Lecture).filter(Lecture.course_id == course.id).order_by(Lecture.order).all()
        total = len(lectures)
        completed = db.query(func.count(LectureProgress.id)).filter(
            LectureProgress.user_id == current_user.id,
            LectureProgress.course_id == course.id,
            LectureProgress.is_completed == True,
        ).scalar() or 0

        lecture_outs = []
        for lec in lectures:
            prog = db.query(LectureProgress).filter(
                LectureProgress.user_id == current_user.id,
                LectureProgress.lecture_id == lec.id,
            ).first()
            lecture_outs.append(LectureOut(
                id=lec.id, title=lec.title, description=lec.description,
                content=lec.content, youtube_id=lec.youtube_id,
                duration_minutes=lec.duration_minutes, order=lec.order,
                course_id=lec.course_id,
                is_completed=prog.is_completed if prog else False,
            ))

        result.append(CourseOut(
            id=course.id, title=course.title, description=course.description,
            learning_path_id=course.learning_path_id, order=course.order,
            image_url=course.image_url, lectures=lecture_outs,
            total_lectures=total, completed_lectures=completed,
            progress_percent=round(completed / total * 100, 1) if total > 0 else 0,
        ))
    return result


@router.get("/courses/{course_id}", response_model=CourseOut)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    lectures = db.query(Lecture).filter(Lecture.course_id == course.id).order_by(Lecture.order).all()
    total = len(lectures)
    completed = db.query(func.count(LectureProgress.id)).filter(
        LectureProgress.user_id == current_user.id,
        LectureProgress.course_id == course.id,
        LectureProgress.is_completed == True,
    ).scalar() or 0

    lecture_outs = []
    for lec in lectures:
        prog = db.query(LectureProgress).filter(
            LectureProgress.user_id == current_user.id,
            LectureProgress.lecture_id == lec.id,
        ).first()
        lecture_outs.append(LectureOut(
            id=lec.id, title=lec.title, description=lec.description,
            content=lec.content, youtube_id=lec.youtube_id,
            duration_minutes=lec.duration_minutes, order=lec.order,
            course_id=lec.course_id,
            is_completed=prog.is_completed if prog else False,
        ))

    return CourseOut(
        id=course.id, title=course.title, description=course.description,
        learning_path_id=course.learning_path_id, order=course.order,
        image_url=course.image_url, lectures=lecture_outs,
        total_lectures=total, completed_lectures=completed,
        progress_percent=round(completed / total * 100, 1) if total > 0 else 0,
    )


# ---------- Lecture Endpoints ----------
@router.get("/lectures/{lecture_id}", response_model=LectureOut)
def get_lecture(
    lecture_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")

    # Auto-create progress when a user views a lecture
    prog = db.query(LectureProgress).filter(
        LectureProgress.user_id == current_user.id,
        LectureProgress.lecture_id == lecture.id,
    ).first()
    if not prog:
        prog = LectureProgress(
            user_id=current_user.id,
            lecture_id=lecture.id,
            course_id=lecture.course_id,
        )
        db.add(prog)
        db.commit()
        db.refresh(prog)

    return LectureOut(
        id=lecture.id, title=lecture.title, description=lecture.description,
        content=lecture.content, youtube_id=lecture.youtube_id,
        duration_minutes=lecture.duration_minutes, order=lecture.order,
        course_id=lecture.course_id,
        is_completed=prog.is_completed,
    )


# ---------- Progress Endpoints ----------
@router.put("/lectures/{lecture_id}/progress", response_model=LectureProgressOut)
def update_lecture_progress(
    lecture_id: int,
    payload: LectureProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")

    # Find or create progress record
    prog = db.query(LectureProgress).filter(
        LectureProgress.user_id == current_user.id,
        LectureProgress.lecture_id == lecture_id,
    ).first()

    now = datetime.now(timezone.utc)

    if not prog:
        prog = LectureProgress(
            user_id=current_user.id,
            lecture_id=lecture_id,
            course_id=lecture.course_id,
            is_completed=payload.is_completed,
            watched_seconds=payload.watched_seconds,
            completed_at=now if payload.is_completed else None,
        )
        db.add(prog)
    else:
        prog.watched_seconds = max(prog.watched_seconds, payload.watched_seconds)
        if payload.is_completed and not prog.is_completed:
            prog.is_completed = True
            prog.completed_at = now

    try:
        db.commit()
        db.refresh(prog)
    except Exception:
        db.rollback()
        # If unique constraint fails, fetch the existing one
        prog = db.query(LectureProgress).filter(
            LectureProgress.user_id == current_user.id,
            LectureProgress.lecture_id == lecture_id,
        ).first()
        if prog and payload.is_completed and not prog.is_completed:
            prog.is_completed = True
            prog.completed_at = now
            db.commit()
            db.refresh(prog)

    return prog


@router.get("/courses/{course_id}/progress", response_model=List[LectureProgressOut])
def get_course_progress(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(LectureProgress)
        .filter(LectureProgress.user_id == current_user.id, LectureProgress.course_id == course_id)
        .all()
    )
