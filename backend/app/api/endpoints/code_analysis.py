from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
import random

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.repository import Repository

router = APIRouter(prefix="/code-analysis", tags=["Code Analysis"])


class AnalysisOut(BaseModel):
    repo_id: int
    repo_name: str
    issues: int
    quality: str
    last_analyzed: str


@router.get("/", response_model=List[AnalysisOut])
def get_code_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repos = db.query(Repository).filter(Repository.is_analyzed == True).all()
    results = []
    for repo in repos:
        # Simulated analysis data based on repo
        random.seed(repo.id)
        issues = random.randint(2, 20)
        quality = random.randint(78, 98)
        results.append(AnalysisOut(
            repo_id=repo.id,
            repo_name=repo.name,
            issues=issues,
            quality=f"{quality}%",
            last_analyzed=repo.updated_at.strftime("%Y-%m-%d") if repo.updated_at else "N/A",
        ))
    return results


@router.post("/{repo_id}/analyze", response_model=AnalysisOut)
def analyze_repository(
    repo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Repository not found")
    repo.is_analyzed = True
    db.commit()
    db.refresh(repo)
    random.seed(repo.id)
    issues = random.randint(2, 20)
    quality = random.randint(78, 98)
    return AnalysisOut(
        repo_id=repo.id,
        repo_name=repo.name,
        issues=issues,
        quality=f"{quality}%",
        last_analyzed=repo.updated_at.strftime("%Y-%m-%d") if repo.updated_at else "N/A",
    )
