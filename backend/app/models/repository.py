from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    tech_stack = Column(JSON, default=list)          # ["React", "Django", "PostgreSQL"]
    language_breakdown = Column(JSON, default=dict)  # {"Python": 40, "JS": 35, ...}

    is_analyzed = Column(Boolean, default=False)
    local_path = Column(String(500), nullable=True) # Where the repo is cloned
    analysis_summary = Column(Text, nullable=True)
    architecture_overview = Column(Text, nullable=True)

    added_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    modules = relationship("Module", back_populates="repository", cascade="all, delete-orphan")
