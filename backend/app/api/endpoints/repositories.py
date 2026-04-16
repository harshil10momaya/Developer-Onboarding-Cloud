from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.repository import Repository
from app.schemas.repository import RepositoryCreate, RepositoryOut, RepositoryUpdate

router = APIRouter(prefix="/repositories", tags=["Repositories"])


@router.get("/", response_model=List[RepositoryOut])
def list_repositories(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repos = db.query(Repository).offset(skip).limit(limit).all()
    return repos


@router.post("/", response_model=RepositoryOut, status_code=status.HTTP_201_CREATED)
def create_repository(
    payload: RepositoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("admin", "mentor"):
        raise HTTPException(status_code=403, detail="Only admins and mentors can add repositories")
    repo = Repository(
        name=payload.name,
        url=payload.url,
        description=payload.description,
        tech_stack=payload.tech_stack,
        added_by_id=current_user.id,
    )
    db.add(repo)
    db.commit()
    db.refresh(repo)
    return repo


@router.get("/{repo_id}", response_model=RepositoryOut)
def get_repository(
    repo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    return repo


@router.put("/{repo_id}", response_model=RepositoryOut)
def update_repository(
    repo_id: int,
    payload: RepositoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("admin", "mentor"):
        raise HTTPException(status_code=403, detail="Only admins and mentors can update repositories")
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(repo, field, value)

    db.commit()
    db.refresh(repo)
    return repo


@router.delete("/{repo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_repository(
    repo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("admin", "mentor"):
        raise HTTPException(status_code=403, detail="Only admins and mentors can delete repositories")
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    db.delete(repo)
    db.commit()
