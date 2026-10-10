import { useState, useEffect } from 'react';
import { 
  Upload, FileText, Trash2, RefreshCw, 
  Layers, BookOpen, CheckCircle2, AlertCircle, File 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { documentService, noteService, flashcardService } from '../../services';
import type { DocumentItem } from '../../types';
import './DocumentsPage.css';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await documentService.list();
      setDocuments(data);
    } catch {
      toast.error('Failed to load knowledge base documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(pdf|txt|md)$/i)) {
      toast.error('Please upload a PDF, TXT, or Markdown document');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Extracting text & generating Gemini vector embeddings...');
    try {
      const doc = await documentService.upload(file);
      setDocuments(prev => [doc, ...prev.filter(d => d.id !== doc.id)]);
      toast.success(`Indexed "${doc.filename}" into Vector DB (${doc.chunk_count} chunks)! 🚀`, { id: toastId });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Document upload or indexing failed', { id: toastId });
      loadDocuments();
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: number, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}" and its vector index?`)) return;
    try {
      await documentService.delete(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const handleReindex = async (id: number) => {
    setProcessingId(id);
    const toastId = toast.loading('Re-indexing vector chunks with Gemini embeddings...');
    try {
      const updated = await documentService.reindex(id);
      setDocuments(prev => prev.map(d => (d.id === id ? updated : d)));
      toast.success('Document re-indexed successfully!', { id: toastId });
    } catch {
      toast.error('Re-indexing failed', { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  const handleGenerateSummary = async (doc: DocumentItem) => {
    setProcessingId(doc.id);
    const toastId = toast.loading(`AI summarizing "${doc.filename}" into Study Notes...`);
    try {
      await noteService.summarizeDocument(doc.id);
      toast.success('Study Notes created! Redirecting...', { id: toastId });
      navigate('/notes');
    } catch {
      toast.error('Failed to summarize document', { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  const handleGenerateFlashcards = async (doc: DocumentItem) => {
    setProcessingId(doc.id);
    const toastId = toast.loading(`Generating Flashcards from "${doc.filename}"...`);
    try {
      await flashcardService.generateCustom(doc.filename, doc.id, 6);
      toast.success('Flashcard Deck generated! Redirecting...', { id: toastId });
      navigate('/flashcards');
    } catch {
      toast.error('Failed to generate flashcards', { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <span className="badge badge-indigo text-xs mb-2 block" style={{ width: 'fit-content' }}>
              Version 3 Knowledge Base & RAG
            </span>
            <h1 className="page-title">Personal Document Knowledge Base</h1>
            <p className="page-subtitle">
              Upload textbook chapters, syllabi, or lecture notes. Our AI indexes them into a vector database for hallucination-free tutoring.
            </p>
          </div>

          {/* Upload Button */}
          <label className="btn btn-primary cursor-pointer flex items-center gap-2">
            <Upload size={18} />
            <span>{uploading ? 'Indexing into Vector DB...' : 'Upload Study Document'}</span>
            <input
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Upload Zone / Drag area */}
        <div className="upload-dropzone card-3d mb-8 text-center p-8">
          <FileText size={42} className="mx-auto text-primary mb-3" />
          <h3 className="text-base font-bold mb-1">Upload Your Course Materials</h3>
          <p className="text-xs text-secondary mb-4 max-w-md mx-auto">
            Supports PDF, Markdown, and TXT documents. Files are split into semantic chunks and embedded with Gemini's embedding model for semantic retrieval.
          </p>
          <label className="btn btn-secondary btn-sm cursor-pointer inline-flex items-center gap-2">
            <Upload size={14} /> Select File
            <input
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-3" style={{ width: 40, height: 40 }} />
            <p className="text-sm text-secondary">Loading indexed documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="card-3d text-center py-12">
            <AlertCircle size={40} className="text-muted mx-auto mb-2" />
            <h3 className="font-bold text-base mb-1">No Documents Uploaded Yet</h3>
            <p className="text-xs text-secondary max-w-sm mx-auto">
              Upload your first syllabus or textbook PDF above to enable AI tutoring with source citations.
            </p>
          </div>
        ) : (
          <div className="docs-grid">
            {documents.map((doc) => (
              <div key={doc.id} className="doc-card card-3d">
                <div className="doc-card-header">
                  <div className="doc-icon-wrap">
                    <File size={22} className="text-primary" />
                  </div>
                  <div className="doc-title-wrap truncate">
                    <h3 className="doc-name truncate font-bold text-sm" title={doc.filename}>
                      {doc.filename}
                    </h3>
                    <span className="text-xs text-secondary">
                      {formatSize(doc.file_size)} • {new Date(doc.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="doc-badge-row my-3 flex items-center justify-between text-xs">
                  <span className="badge badge-emerald flex items-center gap-1">
                    <CheckCircle2 size={12} /> {doc.is_indexed ? 'Vector Indexed' : 'Processing'}
                  </span>
                  <span className="text-muted font-medium">
                    {doc.chunk_count} Semantic Chunks
                  </span>
                </div>

                {/* AI Actions */}
                <div className="doc-actions-grid pt-3 border-t border-[var(--border-color)]">
                  <button
                    className="btn btn-ghost btn-sm flex items-center gap-1.5 text-xs"
                    onClick={() => handleGenerateSummary(doc)}
                    disabled={processingId === doc.id}
                    title="Generate AI Notes"
                  >
                    <BookOpen size={14} className="text-indigo-400" />
                    <span>Summarize Notes</span>
                  </button>

                  <button
                    className="btn btn-ghost btn-sm flex items-center gap-1.5 text-xs"
                    onClick={() => handleGenerateFlashcards(doc)}
                    disabled={processingId === doc.id}
                    title="Generate Flashcards"
                  >
                    <Layers size={14} className="text-purple-400" />
                    <span>Make Flashcards</span>
                  </button>

                  <button
                    className="btn btn-ghost btn-sm flex items-center gap-1 text-xs text-secondary"
                    onClick={() => handleReindex(doc.id)}
                    disabled={processingId === doc.id}
                    title="Re-index embeddings"
                  >
                    <RefreshCw size={13} />
                    <span>Re-index</span>
                  </button>

                  <button
                    className="btn btn-ghost btn-sm flex items-center gap-1 text-xs text-red-400 hover:text-red-500"
                    onClick={() => handleDelete(doc.id, doc.filename)}
                    title="Delete document"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
