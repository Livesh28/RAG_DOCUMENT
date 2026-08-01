from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# SQLite Database File Path
DB_PATH: Path = settings.BASE_DIR / "uniguide.db"
SQLALCHEMY_DATABASE_URL: str = f"sqlite:///{DB_PATH}"

# Create SQLAlchemy engine for SQLite with thread safety flag
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Session factory for handling database sessions per request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base class for models
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a database session per request,
    ensuring proper closing upon completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
