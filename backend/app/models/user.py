import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Enum as SQLEnum, Text,
)
from app.core.database import Base


class UserRole(str, enum.Enum):
    DEVELOPER = "developer"
    MENTOR = "mentor"
    ADMIN = "admin"


class DevRole(str, enum.Enum):
    FRONTEND = "frontend"
    BACKEND = "backend"
    DEVOPS = "devops"
    FULLSTACK = "fullstack"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)

    role = Column(SQLEnum(UserRole), default=UserRole.DEVELOPER, nullable=False)
    dev_role = Column(SQLEnum(DevRole), default=DevRole.BACKEND, nullable=True)

    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
