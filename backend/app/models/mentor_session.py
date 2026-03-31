from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Boolean,
)
from app.core.database import Base


class MentorSession(Base):
    """Mentor session request/approval workflow."""
    __tablename__ = "mentor_sessions"

    id = Column(Integer, primary_key=True, index=True)
    developer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String(500), nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(20), default="pending")  # pending, accepted, rejected
    mentor_note = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))


class Notification(Base):
    """In-app notifications."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(500), nullable=True)
    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
