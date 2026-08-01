from pathlib import Path
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.logging import logger
from app.models.document import DocumentModel
from app.schemas.document import DocumentListResponse, DocumentResponse, DeleteDocumentResponse
from app.rag.vector_store import VectorStoreManager

router = APIRouter()


from app.core.config import settings


@router.get("/documents/stats", status_code=status.HTTP_200_OK)
async def get_document_stats(db: Session = Depends(get_db)):
    """
    Returns aggregate stats on uploaded documents, total indexed vector chunks, and system configuration.
    """
    documents = db.query(DocumentModel).all()
    total_docs = len(documents)
    total_ingested = sum(1 for d in documents if d.is_ingested)
    total_pages = sum(d.total_pages or 0 for d in documents)
    total_chunks = sum(d.total_chunks or 0 for d in documents)

    return {
        "total_documents": total_docs,
        "total_ingested": total_ingested,
        "total_pages": total_pages,
        "total_chunks": total_chunks,
        "embedding_model": settings.EMBEDDING_MODEL_NAME,
        "llm_model": settings.LLM_MODEL_NAME,
        "status": "operational"
    }


from app.rag.pipeline import RAGPipeline

rag_pipeline = RAGPipeline()


@router.get("/documents/{document_id}/faqs", status_code=status.HTTP_200_OK)
async def get_document_faqs(document_id: int, db: Session = Depends(get_db)):
    """
    Auto-generates structured FAQs (questions and verified answers) extracted from an ingested PDF document.
    """
    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found."
        )

    try:
        # Search document vectors for key topics (courses, eligibility, fees, placement)
        faq_topics = [
            "What programs and courses are offered?",
            "What is the admission eligibility criteria?",
            "What is the fee structure?",
            "What placement and career support is available?",
            "What infrastructure and campus facilities exist?"
        ]

        faqs = []
        for q in faq_topics:
            res = rag_pipeline.answer_question(question=q, top_k=3, document_name=doc.filename)
            if res.answer and "couldn't find" not in res.answer.lower():
                faqs.append({
                    "question": q,
                    "answer": res.answer,
                    "sources": res.sources
                })

        return {
            "document_id": document_id,
            "filename": doc.filename,
            "faqs": faqs
        }
    except Exception as e:
        logger.error(f"Failed to generate FAQs for document {document_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate FAQs: {str(e)}"
        )


@router.get("/documents", response_model=DocumentListResponse, status_code=status.HTTP_200_OK)
async def list_documents(db: Session = Depends(get_db)):
    """
    Lists all uploaded university PDF documents and their ingestion metadata.
    """
    documents = db.query(DocumentModel).order_by(DocumentModel.upload_date.desc()).all()
    doc_responses = [DocumentResponse.model_validate(doc) for doc in documents]
    return DocumentListResponse(documents=doc_responses, total_count=len(doc_responses))


@router.delete("/documents/{document_id}", response_model=DeleteDocumentResponse, status_code=status.HTTP_200_OK)
async def delete_document(document_id: int, db: Session = Depends(get_db)):
    """
    Deletes a university PDF document from disk storage, removes vector embeddings
    from ChromaDB, and removes document record from SQLite database.
    """
    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()

    if not doc:
        logger.warning(f"Deletion requested for non-existent document ID: {document_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found."
        )

    try:
        # Step 1: Remove vectors from ChromaDB
        vector_store = VectorStoreManager()
        vector_store.delete_documents_by_filename(doc.filename)

        # Step 2: Delete physical file from uploads folder
        file_path = Path(doc.file_path)
        if file_path.exists():
            file_path.unlink()
            logger.info(f"Deleted physical file: '{file_path}'")

        # Step 3: Remove record from database
        db.delete(doc)
        db.commit()

        logger.info(f"Successfully deleted document ID {document_id} ('{doc.filename}').")
        return DeleteDocumentResponse(
            message=f"Document '{doc.filename}' and its associated vector embeddings were deleted.",
            document_id=document_id
        )

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete document ID {document_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}"
        )
