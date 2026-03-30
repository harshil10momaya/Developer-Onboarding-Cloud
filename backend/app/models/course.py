import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Boolean,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    learning_path_id = Column(Integer, ForeignKey("learning_paths.id"), nullable=True)
    order = Column(Integer, default=0)
    image_url = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    lectures = relationship("Lecture", back_populates="course", cascade="all, delete-orphan",
                            order_by="Lecture.order")


class Lecture(Base):
    __tablename__ = "lectures"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=True)          # markdown content
    youtube_id = Column(String(20), nullable=True)  # YouTube video embed ID
    duration_minutes = Column(Integer, default=0)
    order = Column(Integer, default=0)

    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    course = relationship("Course", back_populates="lectures")


class LectureProgress(Base):
    """Tracks whether a user has viewed/completed a lecture."""
    __tablename__ = "lecture_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lecture_id = Column(Integer, ForeignKey("lectures.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    is_completed = Column(Boolean, default=False)
    watched_seconds = Column(Integer, default=0)

    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
