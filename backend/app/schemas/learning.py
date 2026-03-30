from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ---------- Module ----------
class ModuleCreate(BaseModel):
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    order: int = 0
    repository_id: int


class ModuleOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    order: int
    status: str
    repository_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Learning Path ----------
class LearningPathCreate(BaseModel):
    title: str
    dev_role: str
    level: str = "Beginner"
    description: Optional[str] = None
    module_ids: List[int] = []


class LearningPathOut(BaseModel):
    id: int
    title: str
    dev_role: str
    level: str
    description: Optional[str] = None
    module_ids: list = []
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Progress ----------
class ProgressUpdate(BaseModel):
    status: str                           # not_started | in_progress | completed
    score: Optional[int] = None
    time_spent_minutes: Optional[int] = None


class ProgressOut(BaseModel):
    id: int
    user_id: int
    module_id: int
    learning_path_id: Optional[int] = None
    status: str
    score: Optional[int] = None
    time_spent_minutes: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------- Dashboard Stats ----------
class DashboardStats(BaseModel):
    total_repositories: int
    modules_generated: int
    active_developers: int
    completion_rate: float
    modules_completed: int
    total_modules: int
    time_spent_hours: int
    average_score: float
