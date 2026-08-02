export interface DocumentItem {
  id: number;
  filename: string;
  file_size: number;
  upload_date: string;
  is_ingested: boolean;
  total_pages: number;
  total_chunks: number;
}

export interface DocumentListResponse {
  documents: DocumentItem[];
  total_count: number;
}

export interface SystemStats {
  total_documents: number;
  total_ingested: number;
  total_pages: number;
  total_chunks: number;
  embedding_model: string;
  llm_model: string;
  status: string;
}

export interface SourceCitation {
  document: string;
  page: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: SourceCitation[];
  timestamp: string;
  execution_time_ms?: number;
  confidence_score?: number;
  confidence_label?: string;
  isError?: boolean;
  document_name?: string;
  feedback?: 'like' | 'dislike' | null;
}

export interface IngestResponse {
  message: string;
  processed_documents: number;
  total_chunks: number;
}

export interface FAQItem {
  question: string;
  answer: string;
  sources: SourceCitation[];
}

export interface FAQResponse {
  document_id: number;
  filename: string;
  faqs: FAQItem[];
}
