import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Search, 
  FileCheck,
  Database,
  HelpCircle,
  X,
  Sparkles
} from 'lucide-react';
import { DocumentItem } from '../types';
import { apiService } from '../services/api';

interface DocumentManagerProps {
  documents: DocumentItem[];
  onUpload: (file: File) => Promise<void>;
  onIngest: (documentId?: number) => Promise<void>;
  onDelete: (documentId: number) => Promise<void>;
  isUploading: boolean;
  isIngesting: boolean;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  onUpload,
  onIngest,
  onDelete,
  isUploading,
  isIngesting,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [faqModalData, setFaqModalData] = useState<{ filename: string; faqs: any[] } | null>(null);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    await onUpload(selectedFile);
    setSelectedFile(null);
  };

  const handleFetchFaqs = async (doc: DocumentItem) => {
    setIsLoadingFaqs(true);
    try {
      const data = await apiService.getDocumentFAQs(doc.id);
      setFaqModalData({ filename: doc.filename, faqs: data.faqs });
    } catch (err: any) {
      alert(`Failed to fetch FAQs: ${err.message}`);
    } finally {
      setIsLoadingFaqs(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Upload Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 glass-card shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              <UploadCloud className="w-4 h-4 text-brand-600" />
              <span>Upload University PDF Document</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Upload official syllabi, regulations, fee structures, or brochures (.pdf, max 50MB).
            </p>
          </div>
          <span className="text-[9px] uppercase font-bold tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 shrink-0">
            OCR Enabled
          </span>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-3">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl cursor-pointer bg-slate-50 hover:bg-brand-50/30 transition duration-200 group relative overflow-hidden">
            <div className="flex flex-col items-center justify-center pt-4 pb-5 text-center">
              <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl group-hover:scale-110 transition duration-200 mb-1.5 border border-brand-200">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-700 font-semibold">
                {selectedFile ? (
                  <span className="text-brand-700 font-bold">{selectedFile.name} ({formatBytes(selectedFile.size)})</span>
                ) : (
                  <span><strong className="text-brand-600 font-bold">Click to browse</strong> or drag & drop PDF here</span>
                )}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Magic %PDF- header signature validation enabled</p>
            </div>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {selectedFile && (
            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-4 py-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-xs font-bold text-white rounded-xl shadow-md shadow-brand-600/20 transition flex items-center gap-2 disabled:opacity-50 tracking-wide"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Confirm & Upload</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Document Catalog Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 glass-card shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              <Database className="w-4 h-4 text-brand-600" />
              <span>Document Knowledge Repository</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Manage uploaded PDFs and ChromaDB vector index synchronization.
            </p>
          </div>

          {documents.some((d) => !d.is_ingested) && (
            <button
              onClick={() => onIngest()}
              disabled={isIngesting}
              className="px-3 py-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-[11px] font-bold rounded-xl shadow-md shadow-brand-600/20 transition flex items-center gap-1.5 disabled:opacity-50 shrink-0 tracking-wide"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isIngesting ? 'animate-spin' : ''}`} />
              <span>{isIngesting ? 'Processing...' : 'Ingest Pending PDFs'}</span>
            </button>
          )}
        </div>

        {/* Filter Input */}
        {documents.length > 0 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter documents..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition shadow-inner font-medium"
            />
          </div>
        )}

        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8 border border-slate-200 rounded-xl bg-slate-50">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">
              {documents.length === 0 ? 'No documents uploaded yet.' : 'No matching documents.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse table-fixed">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 w-[30%]">Filename</th>
                  <th className="py-2.5 px-3 w-[15%]">Size</th>
                  <th className="py-2.5 px-3 w-[20%]">Status</th>
                  <th className="py-2.5 px-3 w-[20%]">Index Details</th>
                  <th className="py-2.5 px-3 text-right w-[15%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition duration-150">
                    <td className="py-3 px-3 font-semibold text-slate-900 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-brand-50 text-brand-600 rounded border border-brand-200 shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate block font-semibold" title={doc.filename}>{doc.filename}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[10px] whitespace-nowrap">{formatBytes(doc.file_size)}</td>
                    <td className="py-3 px-3">
                      {doc.is_ingested ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 shrink-0" /> Indexed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                          <Clock className="w-3 h-3 shrink-0" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                      {doc.is_ingested ? (
                        <span className="flex items-center gap-1 text-[10px]">
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono border border-slate-200">{doc.total_pages} pgs</span>
                          <span className="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-mono border border-brand-200">{doc.total_chunks} chks</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">Unprocessed</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                      {doc.is_ingested && (
                        <button
                          onClick={() => handleFetchFaqs(doc)}
                          className="px-2 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg text-[10px] font-bold transition inline-flex items-center gap-1"
                          title="Auto-Generate FAQs"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>FAQs</span>
                        </button>
                      )}
                      {!doc.is_ingested && (
                        <button
                          onClick={() => onIngest(doc.id)}
                          disabled={isIngesting}
                          className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg text-[10px] font-bold transition"
                        >
                          Ingest
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(doc.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition inline-block align-middle"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Auto-Generated FAQs Modal */}
      {faqModalData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-2xl w-full max-h-[85vh] shadow-2xl flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div className="flex items-center gap-2 text-brand-700 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Auto-Generated Admission FAQs — {faqModalData.filename}</span>
              </div>
              <button
                onClick={() => setFaqModalData(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {faqModalData.faqs.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No FAQs extracted from this document.</p>
              ) : (
                faqModalData.faqs.map((faq, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="text-brand-600 font-extrabold">Q{idx + 1}.</span>
                      <span>{faq.question}</span>
                    </h4>
                    <div className="text-slate-700 leading-relaxed font-normal bg-white p-2.5 rounded-lg border border-slate-200 whitespace-pre-wrap">
                      {faq.answer}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 text-right border-t shrink-0">
              <button
                onClick={() => setFaqModalData(null)}
                className="px-4 py-1.5 bg-brand-600 text-white font-semibold text-xs rounded-xl hover:bg-brand-700 transition"
              >
                Close FAQs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
