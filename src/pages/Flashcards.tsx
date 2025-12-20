import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useVocabularies } from "@/hooks/useVocabularies";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    ArrowLeft,
    Volume2,
    RotateCcw,
    Shuffle,
    X,
    Check,
    Layers,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Vocabulary } from "@/types/vocabulary";
import { cn } from "@/lib/utils";
import ReactCardFlip from 'react-card-flip';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { dexieService } from "@/lib/dexieDb";
import { toast } from "sonner";
import { speakText } from "@/services/ttsService";

import { FlashcardProgress } from "@/lib/dexieDb";

export default function Flashcards() {
    const navigate = useNavigate();
    const { data: vocabularies = [], isLoading } = useVocabularies();
    const [cards, setCards] = useState<Vocabulary[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isShuffled, setIsShuffled] = useState(false);
    const [direction, setDirection] = useState<'left' | 'right' | null>(null);
    const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, total: 0 });
    const [loadingProgress, setLoadingProgress] = useState(true);
    const [dueCount, setDueCount] = useState(0);
    const [viewMode, setViewMode] = useState<'study' | 'browse'>('study');
    const [browseFlippedCards, setBrowseFlippedCards] = useState<Set<string>>(new Set());

    // Virtual scrolling ref for browse mode
    const parentRef = useRef<HTMLDivElement>(null);

    // Load cards and progress
    useEffect(() => {
        const loadCards = async () => {
            if (vocabularies.length === 0) return;

            setLoadingProgress(true);
            try {
                // Get all progress from Dexie
                const allProgress = await dexieService.getAllFlashcardProgress();
                const now = Date.now();

                // Map progress to vocabularies
                const vocabWithProgress = vocabularies.map(vocab => {
                    const progress = allProgress.find(p => p.id === vocab.id);
                    return {
                        ...vocab,
                        progress: progress || null,
                        isDue: !progress || progress.nextReviewDate <= now
                    };
                });

                // Filter due cards
                const dueCards = vocabWithProgress.filter(v => v.isDue);
                setDueCount(dueCards.length);

                // If we have due cards, prioritize them. Otherwise show all (review mode)
                let cardsToReview = dueCards.length > 0 ? dueCards : vocabWithProgress;

                // Sort by due date (oldest due first)
                cardsToReview.sort((a, b) => {
                    const timeA = a.progress?.nextReviewDate || 0;
                    const timeB = b.progress?.nextReviewDate || 0;
                    return timeA - timeB;
                });

                setCards(cardsToReview);
            } catch (error) {
                console.error("Error loading flashcard progress:", error);
                setCards(vocabularies);
            } finally {
                setLoadingProgress(false);
            }
        };

        if (!isLoading) {
            loadCards();
        }
    }, [vocabularies, isLoading]);

    const handleShuffle = () => {
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsShuffled(true);
    };

    const handleNext = () => {
        if (currentIndex < cards.length - 1) {
            setDirection('left');
            setIsFlipped(false);
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
                setDirection(null);
            }, 300);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setDirection('right');
            setIsFlipped(false);
            setTimeout(() => {
                setCurrentIndex(prev => prev - 1);
                setDirection(null);
            }, 300);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleSpeak = (e: React.MouseEvent, text: string) => {
        e.stopPropagation();
        speakText(text);
    };

    // Spaced Repetition Logic (SuperMemo-2 inspired)
    const updateProgress = async (vocabularyId: string, quality: number) => {
        try {
            const currentProgress = await dexieService.getFlashcardProgress(vocabularyId);

            let interval = 1;
            let easeFactor = 2.5;
            let streak = 0;

            if (currentProgress) {
                interval = currentProgress.interval;
                easeFactor = currentProgress.easeFactor;
                streak = currentProgress.streak;
            }

            if (quality >= 3) { // Correct
                if (streak === 0) {
                    interval = 1;
                } else if (streak === 1) {
                    interval = 6;
                } else {
                    interval = Math.round(interval * easeFactor);
                }
                streak++;
            } else { // Incorrect
                streak = 0;
                interval = 1;
            }

            // Update ease factor
            easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
            if (easeFactor < 1.3) easeFactor = 1.3;

            const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;

            await dexieService.saveFlashcardProgress({
                id: vocabularyId,
                lastReviewed: Date.now(),
                reviewCount: (currentProgress?.reviewCount || 0) + 1,
                correctCount: (currentProgress?.correctCount || 0) + (quality >= 3 ? 1 : 0),
                incorrectCount: (currentProgress?.incorrectCount || 0) + (quality < 3 ? 1 : 0),
                easeFactor,
                nextReviewDate: nextReview,
                interval,
                streak
            });

            return true;
        } catch (error) {
            console.error("Error updating progress:", error);
            return false;
        }
    };

    const markCard = async (status: 'correct' | 'incorrect') => {
        const currentCard = cards[currentIndex];

        // Update session stats
        setSessionStats(prev => ({
            ...prev,
            [status]: prev[status] + 1,
            total: prev.total + 1
        }));

        // Quality: 5 for correct, 1 for incorrect
        const quality = status === 'correct' ? 5 : 1;
        await updateProgress(currentCard.id, quality);

        // Auto-advance
        if (currentIndex < cards.length - 1) {
            setTimeout(() => handleNext(), 200);
        } else {
            toast.success("Session complete! Great job!");
        }
    };

    const resetSession = () => {
        setSessionStats({ correct: 0, incorrect: 0, total: 0 });
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => handleNext(),
        onSwipedRight: () => handlePrev(),
        trackMouse: false,
        preventScrollOnSwipe: true,
    });

    const progressPercentage = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (viewMode === 'browse') return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    handleFlip();
                    break;
                case 'ArrowRight':
                    handleNext();
                    break;
                case 'ArrowLeft':
                    handlePrev();
                    break;
                case 'Enter':
                    if (isFlipped) {
                        markCard('correct');
                    }
                    break;
                case 'Escape':
                    if (isFlipped) {
                        setIsFlipped(false);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFlipped, currentIndex, viewMode]);

    if (isLoading || loadingProgress) {
        return (
            <div className="h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
                <LoadingSpinner />
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-4 text-center bg-white dark:bg-zinc-950">
                <Layers className="h-16 w-16 text-zinc-300 mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Flashcards Available</h2>
                <p className="text-zinc-500 mb-6 font-medium">Add some vocabulary words to start practicing!</p>
                <Button
                    onClick={() => navigate('/vocabularies')}
                    className="rounded-xl px-8 h-12 font-bold"
                >
                    Go to Vocabulary
                </Button>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <div className="h-screen bg-background flex flex-col items-center justify-center p-4">
            {/* Minimal Navigation Overlay */}
            <div className="absolute top-[var(--safe-area-top)] right-4 z-50 flex gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShuffle}
                    className={cn(
                        "rounded-full h-10 w-10 transition-all",
                        isShuffled ? "bg-primary text-primary-foreground" : "bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm"
                    )}
                >
                    <Shuffle className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetSession}
                    className="rounded-full bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm h-10 w-10"
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>

            <div className="w-full max-w-lg flex flex-col gap-6">
                {/* Clean Progress Indicator */}
                <div className="space-y-2 px-2">
                    <div className="flex justify-between items-end">
                        <div className="flex gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                            <span className="text-green-600/60 font-mono tracking-tighter">Known: {sessionStats.correct}</span>
                            <span className="text-red-500/60 font-mono tracking-tighter">Repeat: {sessionStats.incorrect}</span>
                        </div>
                        <span className="text-[10px] font-mono font-black text-muted-foreground/30">
                            {currentIndex + 1} / {cards.length}
                        </span>
                    </div>
                    <Progress value={progressPercentage} className="h-1 bg-muted" />
                </div>

                {/* Main Card Area */}
                <div className="relative group/nav" {...swipeHandlers}>
                    <div className="w-full h-[450px] md:h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="w-full h-full"
                            >
                                <ReactCardFlip
                                    isFlipped={isFlipped}
                                    flipDirection="horizontal"
                                    containerStyle={{ width: '100%', height: '100%' }}
                                >
                                    {/* Minimalist Front */}
                                    <div
                                        onClick={handleFlip}
                                        className="w-full h-full bg-card border border-border rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/20 transition-all shadow-sm group"
                                    >
                                        <div className="absolute top-6 right-6">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => handleSpeak(e, currentCard.english)}
                                                className="rounded-full bg-secondary text-primary h-10 w-10 hover:bg-primary/10"
                                            >
                                                <Volume2 className="h-5 w-5" />
                                            </Button>
                                        </div>

                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-6 px-4 py-1 bg-primary/5 rounded-full">
                                            {currentCard.partOfSpeech}
                                        </span>

                                        <h2 className="text-5xl md:text-6xl font-black text-foreground mb-4">
                                            {currentCard.english}
                                        </h2>

                                        {currentCard.pronunciation && (
                                            <p className="text-lg font-mono text-muted-foreground/40 italic">
                                                /{currentCard.pronunciation}/
                                            </p>
                                        )}
                                    </div>

                                    {/* Minimalist Back */}
                                    <div
                                        onClick={handleFlip}
                                        className="w-full h-full bg-card border border-border rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/20 transition-all shadow-sm relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20" />

                                        <div className="flex-1 w-full flex flex-col items-center justify-center overflow-y-auto">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/30 mb-4">Meaning</p>
                                            <h3 className="text-4xl md:text-5xl font-black text-foreground leading-tight mb-10">
                                                {currentCard.bangla}
                                            </h3>

                                            <div className="w-full max-w-xs space-y-6">
                                                {currentCard.synonyms && currentCard.synonyms.length > 0 && (
                                                    <div className="space-y-3">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Synonyms</p>
                                                        <div className="flex flex-wrap justify-center gap-1.5">
                                                            {currentCard.synonyms.slice(0, 4).map((syn, i) => (
                                                                <span key={i} className="text-[11px] font-bold bg-secondary/50 text-foreground/70 px-3 py-1.5 rounded-xl border border-border">
                                                                    {syn}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {currentCard.antonyms && currentCard.antonyms.length > 0 && (
                                                    <div className="space-y-3">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Antonyms</p>
                                                        <div className="flex flex-wrap justify-center gap-1.5">
                                                            {currentCard.antonyms.slice(0, 4).map((ant, i) => (
                                                                <span key={i} className="text-[11px] font-bold bg-destructive/5 text-destructive font-mono px-3 py-1.5 rounded-xl border border-destructive/10">
                                                                    {ant}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </ReactCardFlip>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Desktop Navigation Buttons - Clearly Visible */}
                    <div className="hidden lg:block">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrev}
                            className="absolute -left-16 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-md hover:bg-secondary transition-all text-primary"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNext}
                            className="absolute -right-16 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-md hover:bg-secondary transition-all text-primary"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                {/* Compact Controls */}
                <div className="h-20 max-w-xs mx-auto w-full">
                    <AnimatePresence mode="wait">
                        {isFlipped ? (
                            <motion.div
                                key="flipped"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="grid grid-cols-2 gap-3 h-full"
                            >
                                <Button
                                    variant="outline"
                                    onClick={(e) => { e.stopPropagation(); markCard('incorrect'); }}
                                    className="h-full rounded-2xl border-2 border-red-100 text-red-500 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest"
                                >
                                    <X className="h-4 w-4 mr-1.5" />
                                    Hard
                                </Button>
                                <Button
                                    onClick={(e) => { e.stopPropagation(); markCard('correct'); }}
                                    className="h-full rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                                >
                                    <Check className="h-4 w-4 mr-1.5" />
                                    Easy
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="front"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="h-full"
                            >
                                <Button
                                    onClick={handleFlip}
                                    className="w-full h-full rounded-2xl bg-primary text-primary-foreground text-sm font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/25 hover:bg-primary/90"
                                >
                                    Reveal
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
