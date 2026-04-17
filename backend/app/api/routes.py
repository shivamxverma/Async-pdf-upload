from fastapi import APIRouter
from app.api.task.router import router as task_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(task_router, prefix="/task", tags=["Task"])