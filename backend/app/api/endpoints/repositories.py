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


@router.get("/{repo_id}/files")
def list_repo_files(
    repo_id: int,
    path: str = ".",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    import os
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(404, "Repository not found")
    
    # Use repo.local_path if set, else fallback to current directory for demo
    base_dir = repo.local_path or os.getcwd()
    target_dir = os.path.normpath(os.path.join(base_dir, path))
    
    # Security check: ensure path is within base_dir
    if not target_dir.startswith(os.path.normpath(base_dir)):
        raise HTTPException(403, "Access denied")
    
    if not os.path.exists(target_dir):
        raise HTTPException(404, "Directory not found")
    
    files = []
    try:
        for item in os.listdir(target_dir):
            if item.startswith(".") or "node_modules" in item or "venv" in item:
                continue
            item_path = os.path.join(target_dir, item)
            is_dir = os.path.isdir(item_path)
            files.append({
                "name": item,
                "path": os.path.relpath(item_path, base_dir).replace("\\", "/"),
                "type": "directory" if is_dir else "file",
                "size": os.path.getsize(item_path) if not is_dir else None
            })
    except Exception as e:
        raise HTTPException(500, str(e))
        
    return sorted(files, key=lambda x: (x["type"] != "directory", x["name"]))


@router.get("/{repo_id}/files/content")
def get_file_content(
    repo_id: int,
    path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    import os
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(404, "Repository not found")
    
    base_dir = repo.local_path or os.getcwd()
    target_file = os.path.normpath(os.path.join(base_dir, path))
    
    if not target_file.startswith(os.path.normpath(base_dir)):
        raise HTTPException(403, "Access denied")
    
    if not os.path.isfile(target_file):
        raise HTTPException(404, "File not found")
    
    try:
        with open(target_file, "r", encoding="utf-8") as f:
            content = f.read()
        return {"content": content, "path": path}
    except Exception as e:
        raise HTTPException(500, f"Cannot read file: {str(e)}")
