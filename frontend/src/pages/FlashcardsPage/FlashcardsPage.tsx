import { useState, useEffect } from 'react';
import { 
  Layers, ArrowLeft, ArrowRight, RotateCw, CheckCircle2, 
  Sparkles, Trash2, Award 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { flashcardService, curriculumService } from '../../services';
import type { FlashcardDeck, FlashcardItem, Curriculum } from '../../types';
import './FlashcardsPage.css';

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [decksData, currData] = await Promise.allSettled([
        flashcardService.list(),
        curriculumService.getMyCurriculum(),
      ]);

      if (currData.status === 'fulfilled') setCurriculum(currData.value);

      if (decksData.status === 'fulfilled' && decksData.value.length > 0) {
        setDecks(decksData.value);
        setActiveDeck(decksData.value[0]);
      }
    } catch {
      toast.error('Failed to load flashcard decks');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDeck = (deck: FlashcardDeck) => {
    setActiveDeck(deck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleNextCard = () => {
    if (!activeDeck) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % activeDeck.items.length);
  };

  const handlePrevCard = () => {
    if (!activeDeck) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + activeDeck.items.length) % activeDeck.items.length);
  };

  const handleToggleMastery = async (item: FlashcardItem) => {
    try {
      const res = await flashcardService.toggleMaster(item.id);
      if (activeDeck) {
        const updatedItems = activeDeck.items.map((i) =>
          i.id === item.id ? { ...i, is_mastered: res.is_mastered } : i
        );
        const updatedDeck = { ...activeDeck, items: updatedItems };
        setActiveDeck(updatedDeck);
        setDecks((prev) => prev.map((d) => (d.id === activeDeck.id ? updatedDeck : d)));
      }
      toast.success(res.is_mastered ? 'Card marked as mastered! ⭐' : 'Card unmarked');
    } catch {
      toast.error('Could not update card status');
    }
  };

  const handleDeleteDeck = async (e: React.MouseEvent, deckId: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this deck?')) return;
    try {
      await flashcardService.delete(deckId);
      const remaining = decks.filter((d) => d.id !== deckId);
      setDecks(remaining);
      if (activeDeck?.id === deckId) {
        setActiveDeck(remaining.length > 0 ? remaining[0] : null);
        setCurrentCardIndex(0);
      }
      toast.success('Deck deleted');
    } catch {
      toast.error('Failed to delete deck');
    }
  };

  const handleGenerateFromWeek = async (weekId: number) => {
    setGenerating(true);
    const toastId = toast.loading('AI generating interactive flashcard deck...');
    try {
      const newDeck = await flashcardService.generateForWeek(weekId);
      setDecks((prev) => [newDeck, ...prev]);
      setActiveDeck(newDeck);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      toast.success(`Deck "${newDeck.title}" ready! 🃏`, { id: toastId });
    } catch {
      toast.error('Failed to generate flashcards', { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  const currentCard = activeDeck?.items[currentCardIndex];
  const masteredCount = activeDeck?.items.filter((i) => i.is_mastered).length || 0;
  const totalCount = activeDeck?.items.length || 0;
  const progressPct = totalCount > 0 ? (masteredCount / totalCount) * 100 : 0;

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <span className="badge badge-purple text-xs mb-2 block" style={{ width: 'fit-content' }}>
              Version 3 Active Recall & Spaced Repetition
            </span>
            <h1 className="page-title">Interactive AI Flashcards</h1>
            <p className="page-subtitle">
              Study high-yield definitions, architecture patterns, and syntax prompts with 3D flip card review.
            </p>
          </div>

          {/* Quick Generator from Curriculum */}
          {curriculum && curriculum.weeks.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                className="form-input text-xs"
                style={{ width: 'auto' }}
                onChange={(e) => {
                  if (e.target.value) handleGenerateFromWeek(Number(e.target.value));
                }}
                defaultValue=""
                disabled={generating}
              >
                <option value="" disabled>+ Generate Deck for Topic...</option>
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
            <p className="text-sm text-secondary">Loading study decks...</p>
          </div>
        ) : decks.length === 0 ? (
          <div className="card-3d text-center py-16">
            <Layers size={44} className="text-primary mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-1">No Flashcard Decks Yet</h3>
            <p className="text-xs text-secondary max-w-sm mx-auto mb-6">
              Generate an active recall deck for any curriculum week or from your uploaded PDFs.
            </p>
            {curriculum?.weeks?.[0] && (
              <button
                className="btn btn-primary btn-sm mx-auto flex items-center gap-2"
                onClick={() => handleGenerateFromWeek(curriculum.weeks[0].id)}
                disabled={generating}
              >
                <Sparkles size={16} /> Generate Week 1 Flashcards
              </button>
            )}
          </div>
        ) : (
          <div className="flashcards-layout">
            {/* Left: Decks List */}
            <aside className="fc-decks-sidebar card-3d">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Layers size={16} className="text-primary" /> Your Study Decks ({decks.length})
              </h3>
              <div className="fc-decks-list">
                {decks.map((d) => (
                  <div
                    key={d.id}
                    className={`fc-deck-item ${d.id === activeDeck?.id ? 'active' : ''}`}
                    onClick={() => handleSelectDeck(d)}
                  >
                    <div className="flex-1 truncate">
                      <h4 className="font-bold text-xs truncate">{d.title}</h4>
                      <span className="text-[11px] text-secondary">
                        {d.items.length} cards • {d.items.filter((i) => i.is_mastered).length} mastered
                      </span>
                    </div>
                    <button
                      className="fc-deck-del-btn"
                      onClick={(e) => handleDeleteDeck(e, d.id)}
                      title="Delete deck"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </aside>

            {/* Right: Active Card Viewer */}
            {activeDeck && currentCard ? (
              <main className="fc-study-main">
                {/* Deck progress header */}
                <div className="fc-study-header card-3d mb-4">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-bold">{activeDeck.title}</span>
                    <span className="text-secondary">
                      Card {currentCardIndex + 1} of {totalCount} ({masteredCount} Mastered)
                    </span>
                  </div>
                  <div className="progress-bar-bg" style={{ height: 6 }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${progressPct}%`,
                        background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                      }}
                    />
                  </div>
                </div>

                {/* 3D Flip Card Container */}
                <div className="fc-card-scene" onClick={() => setIsFlipped(!isFlipped)}>
                  <div className={`fc-card-3d ${isFlipped ? 'flipped' : ''}`}>
                    {/* Front: Question / Concept */}
                    <div className="fc-card-face fc-card-front card-3d">
                      <div className="fc-face-header">
                        <span className="badge badge-indigo text-xs">Prompt / Question</span>
                        <span className={`badge text-xs badge-${currentCard.difficulty === 'hard' ? 'red' : currentCard.difficulty === 'easy' ? 'emerald' : 'amber'}`}>
                          {currentCard.difficulty}
                        </span>
                      </div>
                      <div className="fc-face-content">
                        <p className="fc-face-text">{currentCard.front_text}</p>
                      </div>
                      <div className="fc-face-footer">
                        <span className="text-xs text-muted flex items-center gap-1">
                          <RotateCw size={12} /> Click card or press Space to reveal answer
                        </span>
                      </div>
                    </div>

                    {/* Back: Answer / Explanation */}
                    <div className="fc-card-face fc-card-back card-3d">
                      <div className="fc-face-header">
                        <span className="badge badge-emerald text-xs">Answer & Solution</span>
                        {currentCard.is_mastered && (
                          <span className="badge badge-emerald text-xs flex items-center gap-1">
                            <CheckCircle2 size={12} /> Mastered
                          </span>
                        )}
                      </div>
                      <div className="fc-face-content">
                        <p className="fc-face-text back-text">{currentCard.back_text}</p>
                      </div>
                      <div className="fc-face-footer">
                        <span className="text-xs text-muted flex items-center gap-1">
                          <RotateCw size={12} /> Click to flip back
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Controls */}
                <div className="fc-controls-bar mt-6 flex justify-between items-center">
                  <button
                    className="btn btn-secondary btn-sm flex items-center gap-1"
                    onClick={handlePrevCard}
                  >
                    <ArrowLeft size={16} /> Previous
                  </button>

                  <button
                    className={`btn btn-sm flex items-center gap-1.5 ${currentCard.is_mastered ? 'btn-secondary text-emerald-400' : 'btn-primary'}`}
                    onClick={() => handleToggleMastery(currentCard)}
                  >
                    <Award size={16} />
                    <span>{currentCard.is_mastered ? 'Marked Mastered' : 'Mark as Mastered'}</span>
                  </button>

                  <button
                    className="btn btn-primary btn-sm flex items-center gap-1"
                    onClick={handleNextCard}
                  >
                    Next <ArrowRight size={16} />
                  </button>
                </div>
              </main>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
