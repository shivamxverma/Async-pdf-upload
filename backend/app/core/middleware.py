from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

def setup_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            settings.frontend_url,
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )