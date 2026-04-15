from sqlmodel import create_engine
from app.core.config import settings

engine = create_engine(
    settings.database_url,
    echo=True,         
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=1800,
)