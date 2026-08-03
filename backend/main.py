import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.core.database import init_db
from app.api.v1.router import api_router

# Initialize MongoDB Atlas database indexes on startup
init_db()


# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="UniGuide AI – Indian University Information Assistant using RAG with strict PDF page citations.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware for React frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

# Ensure uploads directory exists and mount static files endpoint for browser PDF viewer
uploads_path = backend_dir / "uploads"
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/api/v1/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads_root")

# Include API v1 router
app.include_router(api_router, prefix="/api/v1")
# Also mount root endpoint aliases for direct compatibility
app.include_router(api_router)


@app.get("/", tags=["Health Check"])
async def root():
    """
    Health check root endpoint returning application metadata.
    """
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    logger.info("Starting UniGuide AI FastAPI backend server...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
