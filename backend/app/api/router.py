from fastapi import APIRouter
from app.api.endpoints import (
    auth, repositories, learning, dashboard, mentors,
    discussions, documentation, devops, code_analysis,
)

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(repositories.router)
api_router.include_router(learning.router)
api_router.include_router(dashboard.router)
api_router.include_router(mentors.router)
api_router.include_router(discussions.router)
api_router.include_router(documentation.router)
api_router.include_router(devops.router)
api_router.include_router(code_analysis.router)
