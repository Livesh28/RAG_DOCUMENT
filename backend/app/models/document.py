from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Boolean
from app.core.database import Base


class DocumentModel(Base):
    """
    SQLAlchemy model representing an uploaded university PDF document in SQLite.
    Tracks metadata including file path, status, page count, and chunk count.
    """
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String, nullable=False, unique=True, index=True)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)  # size in bytes
    upload_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_ingested = Column(Boolean, default=False, nullable=False)
    total_pages = Column(Integer, default=0, nullable=False)
    total_chunks = Column(Integer, default=0, nullable=False)
