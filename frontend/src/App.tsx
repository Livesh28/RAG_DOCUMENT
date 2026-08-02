import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { DocumentManager } from './components/DocumentManager';
import { SettingsPage } from './pages/SettingsPage';
import { DocumentItem, ChatMessage } from './types';
import { apiService } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'documents' | 'settings'>('dashboard');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Load document list from backend on mount
  const fetchDocuments = async () => {
    try {
      const data = await apiService.getDocuments();
      setDocuments(data.documents);
    } catch (error) {
      console.error('Failed to fetch document catalog:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle PDF upload
  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      await apiService.uploadDocument(file);
      await fetchDocuments();
    } catch (error: any) {
      alert(`Upload failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle document ingestion into ChromaDB
  const handleIngest = async (documentId?: number) => {
    setIsIngesting(true);
    try {
      const res = await apiService.ingestDocuments(documentId);
      alert(`Ingestion complete! ${res.message} (${res.total_chunks} chunks indexed)`);
      await fetchDocuments();
    } catch (error: any) {
      alert(`Ingestion failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsIngesting(false);
    }
  };

  // Handle document deletion
  const handleDelete = async (documentId: number) => {
    if (!window.confirm('Are you sure you want to delete this document and its vector embeddings?')) return;

    try {
      await apiService.deleteDocument(documentId);
      await fetchDocuments();
    } catch (error: any) {
      alert(`Deletion failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  // Handle chat submission with document scope
  const handleSendMessage = async (question: string, documentName?: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    // Format recent chat turns for multi-turn history memory
    const conversationHistory = messages.slice(-6).map((m) => ({
      role: m.sender,
      content: m.text,
    }));

    try {
      const res = await apiService.askQuestion(question, documentName, conversationHistory);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.answer,
        sources: res.sources,
        execution_time_ms: res.execution_time_ms,
        confidence_score: res.confidence_score,
        confidence_label: res.confidence_label,
        document_name: documentName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Error fetching answer: ${error.response?.data?.detail || error.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        documents={documents}
        onIngestAll={() => handleIngest()}
        isIngesting={isIngesting}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar activeTab={activeTab} />

        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && (
            <Dashboard
              documents={documents}
              messages={messages}
              onUpload={handleUpload}
              onIngest={handleIngest}
              onDelete={handleDelete}
              onSendMessage={handleSendMessage}
              onClearChat={() => setMessages([])}
              isUploading={isUploading}
              isIngesting={isIngesting}
              isChatLoading={isChatLoading}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentManager
              documents={documents}
              onUpload={handleUpload}
              onIngest={handleIngest}
              onDelete={handleDelete}
              isUploading={isUploading}
              isIngesting={isIngesting}
            />
          )}

          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
