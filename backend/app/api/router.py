from fastapi import APIRouter
from app.api.endpoints import auth, repositories, learning, dashboard, mentors

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(repositories.router)
api_router.include_router(learning.router)
api_router.include_router(dashboard.router)
api_router.include_router(mentors.router)
