import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration settings loaded dynamically from environment variables or .env file.
    Provides central configuration for storage paths, vector database, embeddings, and LLM settings.
    """

    # Application details
    APP_NAME: str = "UniGuide AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Base directory paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    CHROMA_DB_DIR: Path = BASE_DIR / "chroma_db"

    # Embedding Model Configuration (Fast 80MB sentence-transformers/all-MiniLM-L6-v2)
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"

    # Vector DB Collection Configuration
    CHROMA_COLLECTION_NAME: str = "uniguide_university_docs"

    # Google Gemini API Settings
    GEMINI_API_KEY: str = ""
    LLM_MODEL_NAME: str = "gemini-1.5-flash"
    LLM_TEMPERATURE: float = 0.0

    # Text Chunking Default Parameters
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


# Global settings singleton instance
settings = Settings()

# Ensure mandatory runtime storage directories exist automatically
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.CHROMA_DB_DIR.mkdir(parents=True, exist_ok=True)
