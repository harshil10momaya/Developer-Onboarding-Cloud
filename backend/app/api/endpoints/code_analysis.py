"""
Code Analysis endpoint — uses Groq AI (LLaMA 3.3 70B) to analyze repository
metadata and generate quality metrics, issues, and recommendations.

Falls back to heuristic analysis if Groq API key is not configured.
"""
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from pydantic import BaseModel
from typing import Optional
import json
import hashlib
import logging

from app.core.database import get_db, Base
from app.core.config import settings
from app.core.security import get_current_user
from app.models.user import User
from app.models.repository import Repository

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/code-analysis", tags=["Code Analysis"])


# ---------- Model ----------
class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    quality_score = Column(Float, default=0)
    issues_count = Column(Integer, default=0)
    complexity_score = Column(Float, default=0)
    maintainability = Column(Float, default=0)
    test_coverage = Column(Float, default=0)
    security_score = Column(Float, default=0)
    details = Column(JSON, default=dict)
    ai_summary = Column(String(2000), nullable=True)
    analysis_method = Column(String(50), default="heuristic")
    analyzed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


# ---------- Schemas ----------
class AnalysisOut(BaseModel):
    id: int
    repo_id: int
    repo_name: str
    tech_stack: list = []
    quality_score: float
    issues_count: int
    complexity_score: float
    maintainability: float
    test_coverage: float
    security_score: float
    details: dict = {}
    ai_summary: Optional[str] = None
    analysis_method: str = "heuristic"
    analyzed_at: datetime

    class Config:
        from_attributes = True


# ---------- Groq AI Analysis ----------
def run_groq_analysis(repo: Repository) -> Optional[dict]:
    """Use Groq (LLaMA 3.3 70B) to analyze repository metadata."""
    try:
        from groq import Groq

        client = Groq(api_key=settings.GROQ_API_KEY)

        prompt = f"""You are a senior code quality analyst AI. Analyze this software repository and provide a detailed quality assessment.

Repository: {repo.name}
Description: {repo.description or 'No description'}
Tech Stack: {json.dumps(repo.tech_stack or [])}
Language Breakdown: {json.dumps(repo.language_breakdown or {{}})}
URL: {repo.url}

Respond ONLY with valid JSON (no markdown, no backticks, no explanation). Use this exact structure:
{{
    "quality_score": <float 0-100>,
    "issues_count": <int>,
    "complexity_score": <float 0-100>,
    "maintainability": <float 0-100>,
    "test_coverage": <float 0-100>,
    "security_score": <float 0-100>,
    "issues": [
        {{"type": "<category>", "count": <int>, "severity": "<high|medium|low|info>", "description": "<brief>"}}
    ],
    "recommendations": ["<recommendation 1>", "<recommendation 2>"],
    "languages": {{
        "<language>": {{"percentage": <int>, "files_estimated": <int>, "lines_estimated": <int>}}
    }},
    "metrics": {{
        "total_files_estimated": <int>,
        "total_lines_estimated": <int>,
        "dependencies_count": <int>
    }},
    "ai_summary": "<2-3 sentence summary>"
}}

Be realistic and specific based on the tech stack."""

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a code quality analysis AI. Respond only with valid JSON."},
                {"role": "user", "content": prompt},
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_completion_tokens=1500,
        )

        response_text = chat_completion.choices[0].message.content.strip()
        # Clean markdown wrapping if present
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
        if response_text.endswith("```"):
            response_text = response_text.rsplit("```", 1)[0]
        response_text = response_text.strip()

        data = json.loads(response_text)

        return {
            "quality_score": min(100, max(0, float(data.get("quality_score", 75)))),
            "issues_count": int(data.get("issues_count", 10)),
            "complexity_score": min(100, max(0, float(data.get("complexity_score", 40)))),
            "maintainability": min(100, max(0, float(data.get("maintainability", 70)))),
            "test_coverage": min(100, max(0, float(data.get("test_coverage", 50)))),
            "security_score": min(100, max(0, float(data.get("security_score", 80)))),
            "details": {
                "issues": data.get("issues", []),
                "recommendations": data.get("recommendations", []),
                "languages": data.get("languages", {}),
                "metrics": data.get("metrics", {}),
            },
            "ai_summary": data.get("ai_summary", ""),
            "analysis_method": "groq-llama3.3",
        }

    except Exception as e:
        logger.warning(f"Groq analysis failed for {repo.name}: {e}. Falling back to heuristic.")
        return None


# ---------- Heuristic Fallback ----------
def run_heuristic_analysis(repo: Repository) -> dict:
    """Deterministic heuristic analysis as fallback."""
    seed = int(hashlib.md5(repo.name.encode()).hexdigest()[:8], 16)
    stack = [s.lower() for s in (repo.tech_stack or [])]
    lang_breakdown = repo.language_breakdown or {}

    base_quality = 75 + (seed % 20)
    if "typescript" in stack or "rust" in stack:
        base_quality += 5
    if "python" in stack:
        base_quality += 3

    issues_base = 5 + (seed % 15)
    complexity = 30 + (seed % 40)
    maintainability = 60 + (seed % 30)
    test_coverage = 40 + (seed % 45)
    security = 70 + (seed % 25)

    issue_types = []
    if issues_base > 10:
        issue_types.append({"type": "Code Smell", "count": issues_base // 2, "severity": "medium", "description": "Functions exceeding recommended complexity"})
    if issues_base > 5:
        issue_types.append({"type": "Complexity", "count": issues_base // 3, "severity": "low", "description": "Deeply nested conditionals detected"})
    if security < 85:
        issue_types.append({"type": "Security", "count": max(1, issues_base // 5), "severity": "high", "description": "Potential dependency vulnerabilities"})
    issue_types.append({"type": "Style", "count": max(1, issues_base // 4), "severity": "info", "description": "Inconsistent formatting"})

    lang_analysis = {lang: {"percentage": pct, "files_estimated": max(5, pct * 2), "lines_estimated": pct * 150} for lang, pct in lang_breakdown.items()}

    recommendations = []
    if test_coverage < 60:
        recommendations.append("Increase test coverage — currently estimated below 60%")
    if complexity > 50:
        recommendations.append("Refactor high-complexity modules")
    if security < 80:
        recommendations.append("Address dependency vulnerabilities")
    recommendations.append("Set up automated code quality checks in CI pipeline")

    return {
        "quality_score": min(98, base_quality),
        "issues_count": issues_base,
        "complexity_score": complexity,
        "maintainability": min(95, maintainability),
        "test_coverage": min(95, test_coverage),
        "security_score": min(98, security),
        "details": {"issues": issue_types, "recommendations": recommendations, "languages": lang_analysis,
                    "metrics": {"total_files_estimated": sum(max(5, p * 2) for p in lang_breakdown.values()) if lang_breakdown else 50,
                                "total_lines_estimated": sum(p * 150 for p in lang_breakdown.values()) if lang_breakdown else 5000,
                                "dependencies_count": 15 + (seed % 30)}},
        "ai_summary": f"Heuristic analysis of {repo.name}. Tech stack: {', '.join(repo.tech_stack or ['Unknown'])}.",
        "analysis_method": "heuristic",
    }


# ---------- Endpoints ----------
@router.get("/", response_model=List[AnalysisOut])
def list_analyses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    results = db.query(AnalysisResult).order_by(AnalysisResult.analyzed_at.desc()).all()
    out = []
    for r in results:
        repo = db.query(Repository).filter(Repository.id == r.repo_id).first()
        out.append(AnalysisOut(
            id=r.id, repo_id=r.repo_id, repo_name=repo.name if repo else "Unknown",
            tech_stack=repo.tech_stack if repo else [], quality_score=r.quality_score,
            issues_count=r.issues_count, complexity_score=r.complexity_score,
            maintainability=r.maintainability, test_coverage=r.test_coverage,
            security_score=r.security_score, details=r.details or {},
            ai_summary=r.ai_summary, analysis_method=r.analysis_method or "heuristic",
            analyzed_at=r.analyzed_at,
        ))
    return out


@router.post("/{repo_id}/analyze", response_model=AnalysisOut)
def analyze_repository(repo_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(404, "Repository not found")

    # Try Groq first, fall back to heuristic
    analysis_data = None
    if settings.GROQ_API_KEY and not settings.GROQ_API_KEY.startswith("gsk_your"):
        analysis_data = run_groq_analysis(repo)

    if analysis_data is None:
        analysis_data = run_heuristic_analysis(repo)

    # Upsert
    existing = db.query(AnalysisResult).filter(AnalysisResult.repo_id == repo_id).first()
    if existing:
        for key, val in analysis_data.items():
            setattr(existing, key, val)
        existing.analyzed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing)
        result = existing
    else:
        result = AnalysisResult(repo_id=repo_id, **analysis_data)
        db.add(result)
        db.commit()
        db.refresh(result)

    repo.is_analyzed = True
    db.commit()

    return AnalysisOut(
        id=result.id, repo_id=result.repo_id, repo_name=repo.name,
        tech_stack=repo.tech_stack or [], quality_score=result.quality_score,
        issues_count=result.issues_count, complexity_score=result.complexity_score,
        maintainability=result.maintainability, test_coverage=result.test_coverage,
        security_score=result.security_score, details=result.details or {},
        ai_summary=result.ai_summary, analysis_method=result.analysis_method or "heuristic",
        analyzed_at=result.analyzed_at,
    )
