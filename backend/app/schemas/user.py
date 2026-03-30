from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ---------- Auth ----------
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "developer"       # developer | mentor | admin
    dev_role: Optional[str] = "backend"  # frontend | backend | devops | fullstack


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- User Response ----------
class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    dev_role: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    dev_role: Optional[str] = None
    avatar_url: Optional[str] = None
