import axios from 'axios';
import { DocumentListResponse, DocumentItem, IngestResponse, SourceCitation, SystemStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Get aggregate system stats
  async getSystemStats(): Promise<SystemStats> {
    const response = await apiClient.get<SystemStats>('/documents/stats');
    return response.data;
  },

  // Get all documents
  async getDocuments(): Promise<DocumentListResponse> {
    const response = await apiClient.get<DocumentListResponse>('/documents');
    return response.data;
  },

  // Upload PDF document
  async uploadDocument(file: File): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<DocumentItem>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Ingest documents
  async ingestDocuments(documentId?: number): Promise<IngestResponse> {
    const response = await apiClient.post<IngestResponse>('/ingest', {
      document_id: documentId || null,
    });
    return response.data;
  },

  // Ask RAG chat question with optional targeted document scope and conversation history
  async askQuestion(
    question: string,
    documentName?: string,
    conversationHistory: { role: string; content: string }[] = []
  ): Promise<{ answer: string; sources: SourceCitation[]; execution_time_ms?: number; confidence_score?: number; confidence_label?: string }> {
    const response = await apiClient.post<{ answer: string; sources: SourceCitation[]; execution_time_ms?: number; confidence_score?: number; confidence_label?: string }>('/chat', {
      question,
      document_name: documentName || null,
      conversation_history: conversationHistory,
    });
    return response.data;
  },

  // Auto-generate FAQs for a document
  async getDocumentFAQs(documentId: number): Promise<{ document_id: number; filename: string; faqs: any[] }> {
    const response = await apiClient.get<{ document_id: number; filename: string; faqs: any[] }>(`/documents/${documentId}/faqs`);
    return response.data;
  },

  // Get full browser URL for streaming PDF document
  getPDFUrl(filename: string): string {
    return `${API_BASE_URL}/uploads/${encodeURIComponent(filename)}`;
  },

  // Delete document by ID
  async deleteDocument(documentId: number): Promise<{ message: string; document_id: number }> {
    const response = await apiClient.delete<{ message: string; document_id: number }>(`/documents/${documentId}`);
    return response.data;
  },
};
