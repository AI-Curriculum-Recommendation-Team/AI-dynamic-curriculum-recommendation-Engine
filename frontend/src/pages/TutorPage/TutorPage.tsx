import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Bot, User, Send, Plus, Trash2, FileText, 
  Sparkles, MessageSquare, Quote 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { tutorService, curriculumService, documentService } from '../../services';
import type { ChatSession, ChatMessage, CitationSource, DocumentItem, Curriculum } from '../../types';
import './TutorPage.css';

export default function TutorPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      loadSessionHistory(activeSessionId);
    }
  }, [activeSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [sessList, curr, docs] = await Promise.allSettled([
        tutorService.listSessions(),
        curriculumService.getMyCurriculum(),
        documentService.list(),
      ]);

      if (docs.status === 'fulfilled') setDocuments(docs.value);
      if (curr.status === 'fulfilled') setCurriculum(curr.value);

      if (sessList.status === 'fulfilled' && sessList.value.length > 0) {
        setSessions(sessList.value);
        setActiveSessionId(sessList.value[0].id);
      } else {
        // Create first session automatically
        createNewSession('AI Study Tutor');
      }
    } catch {
      toast.error('Failed to load tutor data');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionHistory = async (sessionId: number) => {
    try {
      const hist = await tutorService.getHistory(sessionId);
      setMessages(hist);
    } catch {
      toast.error('Could not load chat history');
    }
  };

  const createNewSession = async (title?: string, weekId?: number) => {
    try {
      const sess = await tutorService.startSession(title || 'New AI Tutor Chat', weekId);
      setSessions(prev => [sess, ...prev]);
      setActiveSessionId(sess.id);
      loadSessionHistory(sess.id);
      toast.success('New tutoring session started! 💬');
    } catch {
      toast.error('Could not create new session');
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: number) => {
    e.stopPropagation();
    try {
      await tutorService.deleteSession(sessionId);
      const remaining = sessions.filter(s => s.id !== sessionId);
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
        } else {
          createNewSession('AI Study Tutor');
        }
      }
      toast.success('Session deleted');
    } catch {
      toast.error('Failed to delete session');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || !activeSessionId || sending) return;

    setInputMessage('');
    setSending(true);

    // Optimistic user message
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await tutorService.sendMessage(activeSessionId, text, selectedTopic || undefined);
      setMessages(prev => {
        const withoutTemp = prev.filter(m => m.id !== tempUserMsg.id);
        return [...withoutTemp, res.user_message, res.ai_message];
      });
    } catch {
      toast.error('Failed to get AI response. Please try again.');
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="page-container tutor-page">
      <div className="container tutor-layout">
        {/* Left Sidebar: Sessions & Topics */}
        <aside className="tutor-sidebar card-3d">
          <div className="tutor-sidebar-header">
            <div className="flex items-center gap-2">
              <Bot className="text-primary" size={22} />
              <h2 className="text-base font-bold">AI Chat Tutor</h2>
            </div>
            <button 
              className="btn btn-primary btn-sm flex items-center gap-1"
              onClick={() => createNewSession()}
            >
              <Plus size={16} /> New Chat
            </button>
          </div>

          {/* Topic Context Selector */}
          <div className="tutor-topic-select-wrap">
            <label className="text-xs font-semibold text-secondary flex items-center gap-1 mb-1">
              <Sparkles size={14} className="text-indigo-400" /> Grounded Topic Context:
            </label>
            <select
              className="form-input text-xs"
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
            >
              <option value="">General Curriculum & CS</option>
              {curriculum?.weeks.map(w => (
                <option key={w.id} value={w.topic}>
                  Week {w.week_number}: {w.topic}
                </option>
              ))}
            </select>
          </div>

          {/* Session List */}
          <div className="tutor-session-list">
            <span className="text-xs font-semibold text-muted px-2 uppercase tracking-wider block mb-1">
              Your Sessions
            </span>
            {sessions.map(s => (
              <div
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`tutor-session-item ${s.id === activeSessionId ? 'active' : ''}`}
              >
                <MessageSquare size={16} className="text-secondary shrink-0" />
                <span className="truncate text-sm flex-1">{s.title}</span>
                <button
                  className="tutor-session-del-btn"
                  onClick={(e) => handleDeleteSession(e, s.id)}
                  title="Delete session"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Knowledge Base Status Indicator */}
          <div className="tutor-kb-badge">
            <div className="flex items-center gap-2 text-xs">
              <FileText size={16} className="text-accent" />
              <div>
                <span className="font-semibold block">{documents.length} Docs Indexed</span>
                <span className="text-muted text-[11px]">RAG Vector Grounding Active</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Chat Area */}
        <main className="tutor-chat-main card-3d">
          {/* Chat Header */}
          <div className="tutor-chat-header">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-400" />
                {sessions.find(s => s.id === activeSessionId)?.title || 'AI Study Tutor'}
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Version 3 RAG Tutor • Grounded in your uploaded study notes and curriculum
              </p>
            </div>
            {selectedTopic && (
              <span className="badge badge-indigo text-xs">
                Context: {selectedTopic}
              </span>
            )}
          </div>

          {/* Chat Messages */}
          <div className="tutor-messages-container">
            {messages.length === 0 && !loading && (
              <div className="tutor-empty-state">
                <Bot size={48} className="text-primary mb-3 mx-auto" />
                <h4 className="font-bold text-base mb-1">Start Your Learning Session</h4>
                <p className="text-xs text-secondary max-w-md mx-auto mb-4">
                  Ask questions, request code snippets, or get step-by-step explanations grounded in your curriculum.
                </p>
                <div className="tutor-quick-prompts">
                  <button onClick={() => handleQuickPrompt('Can you explain this week\'s topic in simple terms with an analogy?')}>
                    💡 Explain with simple analogy
                  </button>
                  <button onClick={() => handleQuickPrompt('Give me a step-by-step Python code example.')}>
                    💻 Show Python code example
                  </button>
                  <button onClick={() => handleQuickPrompt('What are the top 3 common pitfalls or bugs students encounter here?')}>
                    ⚠️ Top 3 common pitfalls
                  </button>
                  <button onClick={() => handleQuickPrompt('Quiz me with 2 quick conceptual questions!')}>
                    🎯 Quiz me on this
                  </button>
                </div>
              </div>
            )}

            {messages.map((m) => {
              const isAi = m.role === 'assistant';
              return (
                <div key={m.id} className={`tutor-msg-row ${isAi ? 'ai-row' : 'user-row'}`}>
                  <div className={`tutor-avatar ${isAi ? 'ai-avatar' : 'user-avatar'}`}>
                    {isAi ? <Bot size={18} /> : <User size={18} />}
                  </div>
                  <div className={`tutor-msg-bubble ${isAi ? 'ai-bubble' : 'user-bubble'}`}>
                    <div className="tutor-msg-text">
                      {isAi ? (
                        <div className="markdown-content">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      ) : (
                        m.content.split('\n').map((paragraph, pIdx) => (
                          <p key={pIdx} className="mb-1 last:mb-0">
                            {paragraph}
                          </p>
                        ))
                      )}
                    </div>

                    {/* RAG Citations & Sources */}
                    {isAi && m.source_chunks && m.source_chunks.length > 0 && (
                      <div className="tutor-citations">
                        <span className="tutor-citations-title flex items-center gap-1">
                          <Quote size={12} /> Grounded Sources from Knowledge Base:
                        </span>
                        <div className="tutor-citation-pills">
                          {m.source_chunks.map((src: CitationSource, sIdx: number) => (
                            <span key={sIdx} className="tutor-citation-pill" title={src.snippet}>
                              📄 {src.filename} (Chunk #{src.chunk_index})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="tutor-msg-row ai-row">
                <div className="tutor-avatar ai-avatar">
                  <Bot size={18} />
                </div>
                <div className="tutor-msg-bubble ai-bubble flex items-center gap-2 text-xs text-secondary py-3">
                  <div className="spinner" style={{ width: 18, height: 18 }} />
                  <span>Searching documents & generating grounded response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form 
            className="tutor-input-area"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="text"
              className="form-input tutor-input"
              placeholder="Ask anything about your syllabus or uploaded PDFs..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={sending}
            />
            <button 
              type="submit" 
              className="btn btn-primary tutor-send-btn"
              disabled={!inputMessage.trim() || sending}
            >
              <Send size={18} />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
