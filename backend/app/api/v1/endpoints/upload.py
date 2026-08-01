import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.logging import logger
from app.models.document import DocumentModel
from app.schemas.document import DocumentResponse

router = APIRouter()


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Uploads a university PDF document, validates format, stores file in uploads directory,
    and registers metadata in SQLite database.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename cannot be empty."
        )

    # Validate PDF file extension
    if not file.filename.lower().endswith(".pdf"):
        logger.warning(f"Rejected non-PDF upload attempt: '{file.filename}'")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported."
        )

    target_path = settings.UPLOAD_DIR / file.filename

    # Save uploaded file to disk
    try:
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = target_path.stat().st_size
        logger.info(f"File uploaded successfully: '{file.filename}' ({file_size} bytes)")
    except Exception as e:
        logger.error(f"Failed to save uploaded file '{file.filename}': {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )

    # Check if document already exists in SQLite database
    existing_doc = db.query(DocumentModel).filter(DocumentModel.filename == file.filename).first()
    if existing_doc:
        existing_doc.file_size = file_size
        existing_doc.is_ingested = False
        db.commit()
        db.refresh(existing_doc)
        logger.info(f"Updated existing document record for '{file.filename}'.")
        return existing_doc

    # Create new document record in database
    new_doc = DocumentModel(
        filename=file.filename,
        file_path=str(target_path),
        file_size=file_size,
        is_ingested=False,
        total_pages=0,
        total_chunks=0
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    logger.info(f"Registered new document ID {new_doc.id} in SQLite database.")
    return new_doc
