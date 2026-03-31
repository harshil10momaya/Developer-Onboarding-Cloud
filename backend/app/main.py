from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api.router import api_router

# Import all models so Base.metadata knows about them
from app.models import *  # noqa: F401, F403
from app.models.course import Course, Lecture, LectureProgress  # noqa: F401
from app.models.mentor_session import MentorSession, Notification  # noqa: F401
from app.api.endpoints.documentation import DocArticle  # noqa: F401
from app.api.endpoints.devops import Pipeline  # noqa: F401

# Create all tables (use Alembic in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Cloud-based developer onboarding platform — API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routes
app.include_router(api_router)


@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": "1.0.0",
    }


@app.get("/api/health", tags=["Health"])
def api_health():
    return {"status": "ok"}
