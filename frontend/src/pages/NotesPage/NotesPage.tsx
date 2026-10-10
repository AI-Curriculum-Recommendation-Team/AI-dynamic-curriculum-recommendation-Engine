import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  BookOpen, Sparkles, Copy, Trash2, CheckCircle2, 
  FileText, Calendar 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { noteService, curriculumService } from '../../services';
import type { StudentNote, Curriculum } from '../../types';
import './NotesPage.css';

export default function NotesPage() {
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [activeNote, setActiveNote] = useState<StudentNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notesData, currData] = await Promise.allSettled([
        noteService.list(),
        curriculumService.getMyCurriculum(),
      ]);

      if (currData.status === 'fulfilled') setCurriculum(currData.value);

      if (notesData.status === 'fulfilled' && notesData.value.length > 0) {
        setNotes(notesData.value);
        setActiveNote(notesData.value[0]);
      }
    } catch {
      toast.error('Failed to load study notes');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateForWeek = async (weekId: number) => {
    setGenerating(true);
    const toastId = toast.loading('AI generating comprehensive study notes...');
    try {
      const newNote = await noteService.summarizeWeek(weekId);
      setNotes((prev) => [newNote, ...prev]);
      setActiveNote(newNote);
      toast.success('Study notes ready! 📝', { id: toastId });
    } catch {
      toast.error('Failed to generate notes', { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this study note?')) return;
    try {
      await noteService.delete(noteId);
      const remaining = notes.filter((n) => n.id !== noteId);
      setNotes(remaining);
      if (activeNote?.id === noteId) {
        setActiveNote(remaining.length > 0 ? remaining[0] : null);
      }
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const handleCopy = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(
      `${activeNote.title}\n\nKey Takeaways:\n` +
      activeNote.key_takeaways.map((t) => `- ${t}`).join('\n') +
      `\n\n${activeNote.summary_text}`
    );
    toast.success('Copied notes to clipboard! 📋');
  };

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <span className="badge badge-indigo text-xs mb-2 block" style={{ width: 'fit-content' }}>
              Version 3 AI Study Synthesizer
            </span>
            <h1 className="page-title">AI Study Notes & Summaries</h1>
            <p className="page-subtitle">
              High-yield concept breakdowns, implementation guides, and key takeaways generated from your curriculum and PDFs.
            </p>
          </div>

          {/* Generate from Week Dropdown */}
          {curriculum && curriculum.weeks.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                className="form-input text-xs"
                style={{ width: 'auto' }}
                onChange={(e) => {
                  if (e.target.value) handleGenerateForWeek(Number(e.target.value));
                }}
                defaultValue=""
                disabled={generating}
              >
                <option value="" disabled>+ Generate Notes for Topic...</option>
                {curriculum.weeks.map((w) => (
                  <option key={w.id} value={w.id}>
                    Week {w.week_number}: {w.topic}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="spinner mx-auto mb-3" style={{ width: 44, height: 44 }} />
            <p className="text-sm text-secondary">Loading study notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="card-3d text-center py-16">
            <BookOpen size={44} className="text-primary mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-1">No Study Notes Yet</h3>
            <p className="text-xs text-secondary max-w-sm mx-auto mb-6">
              Generate notes for any syllabus topic above or upload PDFs in your Knowledge Base to synthesize study guides.
            </p>
            {curriculum?.weeks?.[0] && (
              <button
                className="btn btn-primary btn-sm mx-auto flex items-center gap-2"
                onClick={() => handleGenerateForWeek(curriculum.weeks[0].id)}
                disabled={generating}
              >
                <Sparkles size={16} /> Summarize Week 1: {curriculum.weeks[0].topic}
              </button>
            )}
          </div>
        ) : (
          <div className="notes-layout">
            {/* Sidebar list */}
            <aside className="notes-sidebar card-3d">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <FileText size={16} className="text-primary" /> Saved Notes ({notes.length})
              </h3>
              <div className="notes-list">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className={`note-item ${n.id === activeNote?.id ? 'active' : ''}`}
                    onClick={() => setActiveNote(n)}
                  >
                    <h4 className="font-bold text-xs truncate">{n.title}</h4>
                    <span className="text-[11px] text-secondary flex items-center gap-1 mt-0.5">
                      <Calendar size={11} /> {new Date(n.generated_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </aside>

            {/* Main Reader View */}
            {activeNote && (
              <main className="note-reader card-3d">
                <div className="note-reader-header flex justify-between items-center pb-4 mb-4 border-b border-[var(--border-color)]">
                  <div>
                    <h2 className="text-lg font-bold">{activeNote.title}</h2>
                    <span className="text-xs text-secondary">
                      Synthesized on {new Date(activeNote.generated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn btn-ghost btn-sm flex items-center gap-1.5 text-xs"
                      onClick={handleCopy}
                      title="Copy notes"
                    >
                      <Copy size={14} /> Copy
                    </button>
                    <button
                      className="btn btn-ghost btn-sm text-red-400 hover:text-red-500 text-xs"
                      onClick={() => handleDeleteNote(activeNote.id)}
                      title="Delete note"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

                {/* Key Takeaways */}
                {activeNote.key_takeaways && activeNote.key_takeaways.length > 0 && (
                  <div className="note-takeaways card-3d mb-6 p-4">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles size={14} /> High-Yield Key Takeaways
                    </h4>
                    <div className="takeaways-grid">
                      {activeNote.key_takeaways.map((takeaway, tIdx) => (
                        <div key={tIdx} className="takeaway-chip flex items-start gap-2 text-xs">
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{takeaway}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Note Body */}
                <div className="note-body markdown-content leading-relaxed text-sm">
                  <ReactMarkdown>{activeNote.summary_text}</ReactMarkdown>
                </div>
              </main>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
