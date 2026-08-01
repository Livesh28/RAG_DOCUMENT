from pathlib import Path
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.logging import logger
from app.models.document import DocumentModel
from app.schemas.ingest import IngestRequest, IngestResponse
from app.services.pdf_service import PDFService
from app.rag.text_splitter import ChunkingService
from app.rag.vector_store import VectorStoreManager

router = APIRouter()


@router.post("/ingest", response_model=IngestResponse, status_code=status.HTTP_200_OK)
async def ingest_documents(
    payload: IngestRequest = IngestRequest(),
    db: Session = Depends(get_db)
):
    """
    Ingests uploaded PDF documents into the RAG vector pipeline:
    - Extracts page text via PyMuPDF/fallback engines while retaining page numbers.
    - Chunks text into contextual segments with metadata.
    - Generates vector embeddings.
    - Stores vector representations in ChromaDB persistent store.
    """
    if payload.document_id:
        target_docs = db.query(DocumentModel).filter(DocumentModel.id == payload.document_id).all()
    else:
        target_docs = db.query(DocumentModel).filter(DocumentModel.is_ingested == False).all()

    if not target_docs:
        logger.info("No documents found matching ingestion criteria.")
        return IngestResponse(
            message="No pending documents to ingest.",
            processed_documents=0,
            total_chunks=0
        )

    chunker = ChunkingService()
    vector_store = VectorStoreManager()
    total_processed = 0
    total_chunks_created = 0

    for doc in target_docs:
        file_path = Path(doc.file_path)
        if not file_path.exists():
            logger.error(f"File path missing for document ID {doc.id}: '{doc.file_path}'")
            continue

        try:
            logger.info(f"Starting ingestion process for '{doc.filename}' (ID: {doc.id})...")

            # Step 1: Extract page text and metadata
            extracted_pages = PDFService.extract_text_from_pdf(file_path)

            if not extracted_pages:
                logger.warning(f"No text extracted from document '{doc.filename}'. Skipping.")
                continue

            # Step 2: Create chunked documents
            chunk_documents = chunker.create_chunks(extracted_pages)

            # Step 3: Delete stale vectors if replacing/re-ingesting file
            vector_store.delete_documents_by_filename(doc.filename)

            # Step 4: Index chunks into ChromaDB
            vector_store.add_documents(chunk_documents)

            # Step 5: Update SQLite database record
            doc.is_ingested = True
            doc.total_pages = len(extracted_pages)
            doc.total_chunks = len(chunk_documents)
            db.commit()

            total_processed += 1
            total_chunks_created += len(chunk_documents)

            logger.info(f"Finished ingestion for '{doc.filename}': {len(extracted_pages)} pages, {len(chunk_documents)} chunks indexed.")

        except Exception as e:
            db.rollback()
            logger.error(f"Ingestion failed for document ID {doc.id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to ingest document '{doc.filename}': {str(e)}"
            )

    return IngestResponse(
        message=f"Successfully ingested {total_processed} document(s).",
        processed_documents=total_processed,
        total_chunks=total_chunks_created
    )
