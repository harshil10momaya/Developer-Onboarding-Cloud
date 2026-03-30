from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class RepositoryCreate(BaseModel):
    name: str
    url: str
    description: Optional[str] = None
    tech_stack: List[str] = []


class RepositoryOut(BaseModel):
    id: int
    name: str
    url: str
    description: Optional[str] = None
    tech_stack: list = []
    language_breakdown: dict = {}
    is_analyzed: bool
    analysis_summary: Optional[str] = None
    architecture_overview: Optional[str] = None
    added_by_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class RepositoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[List[str]] = None
