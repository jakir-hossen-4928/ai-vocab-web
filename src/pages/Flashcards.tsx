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
    ChevronRight,
    Loader2
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
import { useAuth } from "@/contexts/AuthContext";

import { FlashcardProgress } from "@/lib/dexieDb";

export default function Flashcards() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: vocabularies = [], isLoading } = useVocabularies();
    const [cards, setCards] = useState<Vocabulary[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isShuffled, setIsShuffled] = useState(false);
    const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
    const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, total: 0 });
    const [loadingProgress, setLoadingProgress] = useState(true);
    const [dueCount, setDueCount] = useState(0);
    const [viewMode, setViewMode] = useState<'study' | 'browse'>('study');
    const [resuming, setResuming] = useState(false);

    // Load cards and progress
    useEffect(() => {
        const prepareCards = async () => {
            if (vocabularies.length === 0) return;

            setLoadingProgress(true);
            try {
                const now = Date.now();
                const allProgress = await dexieService.getAllFlashcardProgress();

                // 1. Map progress to vocabularies
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

                // If we have due cards, prioritize them. Otherwise show all
                let initialCards = dueCards.length > 0 ? dueCards : vocabWithProgress;

                // Sort by due date
                initialCards.sort((a, b) => {
                    const timeA = a.progress?.nextReviewDate || 0;
                    const timeB = b.progress?.nextReviewDate || 0;
                    return timeA - timeB;
                });

                // Cast to Vocabulary[] for cards state
                const finalCards = initialCards as Vocabulary[];

                // 2. Check for local resume state
                const savedState = localStorage.getItem('flashcard_session_state');
                if (savedState) {
                    const resumeData = JSON.parse(savedState);
                    setResuming(true);

                    if (resumeData.sessionStats) {
                        setSessionStats(resumeData.sessionStats);
                    }

                    let currentCards = [...finalCards];
                    if (resumeData.isShuffled) {
                        currentCards.sort(() => Math.random() - 0.5);
                        setIsShuffled(true);
                    }

                    const lastIndex = currentCards.findIndex(c => c.id === resumeData.lastCardId);
                    if (lastIndex !== -1) {
                        setCards(currentCards);
                        setCurrentIndex(lastIndex);
                    } else {
                        setCards(currentCards);
                        const safeIndex = Math.min(resumeData.currentIndex, currentCards.length - 1);
                        setCurrentIndex(Math.max(0, safeIndex));
                    }
                    setResuming(false);
                } else {
                    setCards(finalCards);
                }
            } catch (error) {
                console.error("Error preparing flashcards:", error);
                setCards(vocabularies);
            } finally {
                setLoadingProgress(false);
            }
        };

        if (!isLoading) {
            prepareCards();
        }
    }, [vocabularies, isLoading]);

    // Save resume state when currentIndex, isShuffled or sessionStats changes
    useEffect(() => {
        if (cards.length > 0 && !resuming) {
            const currentCard = cards[currentIndex];
            if (currentCard) {
                localStorage.setItem('flashcard_session_state', JSON.stringify({
                    lastCardId: currentCard.id,
                    currentIndex,
                    isShuffled,
                    sessionStats
                }));
            }
        }
    }, [currentIndex, isShuffled, sessionStats, cards, resuming]);

    const handleShuffle = () => {
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsShuffled(true);
    };

    const handleNext = () => {
        if (currentIndex < cards.length - 1) {
            setDirection('next');
            setIsFlipped(false);
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setDirection('prev');
            setIsFlipped(false);
            setCurrentIndex(prev => prev - 1);
        }
    };

    const variants = {
        enter: (direction: 'next' | 'prev' | null) => ({
            x: direction === 'next' ? 300 : direction === 'prev' ? -300 : 0,
            opacity: 0,
            scale: 0.9,
            rotate: direction === 'next' ? 5 : direction === 'prev' ? -5 : 0
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: {
                x: { type: "spring" as const, stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            }
        },
        exit: (direction: 'next' | 'prev' | null) => ({
            x: direction === 'next' ? -300 : direction === 'prev' ? 300 : 0,
            opacity: 0,
            scale: 0.9,
            rotate: direction === 'next' ? -5 : direction === 'prev' ? 5 : 0,
            transition: {
                x: { type: "spring" as const, stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            }
        })
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleSpeak = (e: React.MouseEvent, text: string) => {
        e.stopPropagation();
        speakText(text);
    };

    // Spaced Repetition Logic (SuperMemo-2 inspired)
    const updateProgress = async (card: Vocabulary & { progress: FlashcardProgress | null }, isKnow: boolean) => {
        try {
            // Update progress using SRS algorithm (SuperMemo-2 based)
            const currentProgress = card.progress || {
                id: card.id,
                lastReviewed: 0,
                reviewCount: 0,
                correctCount: 0,
                incorrectCount: 0,
                easeFactor: 2.5,
                nextReviewDate: 0,
                interval: 0,
                streak: 0
            };

            const isCorrect = isKnow;
            const newReviewCount = currentProgress.reviewCount + 1;
            const newCorrectCount = currentProgress.correctCount + (isCorrect ? 1 : 0);
            const newIncorrectCount = currentProgress.incorrectCount + (isCorrect ? 0 : 1);

            let newInterval: number;
            let newEaseFactor = currentProgress.easeFactor;
            let newStreak = isCorrect ? currentProgress.streak + 1 : 0;

            if (isCorrect) {
                if (currentProgress.streak === 0) {
                    newInterval = 1;
                } else if (currentProgress.streak === 1) {
                    newInterval = 6;
                } else {
                    newInterval = Math.round(currentProgress.interval * currentProgress.easeFactor);
                }
                // Increase ease factor for correct answers
                newEaseFactor = Math.min(3.0, currentProgress.easeFactor + 0.1);
            } else {
                newInterval = 1; // Review again tomorrow
                // Decrease ease factor for incorrect answers
                newEaseFactor = Math.max(1.3, currentProgress.easeFactor - 0.2);
            }

            const newProgress: FlashcardProgress = {
                ...currentProgress,
                lastReviewed: Date.now(),
                reviewCount: newReviewCount,
                correctCount: newCorrectCount,
                incorrectCount: newIncorrectCount,
                easeFactor: newEaseFactor,
                interval: newInterval,
                streak: newStreak,
                nextReviewDate: Date.now() + (newInterval * 24 * 60 * 60 * 1000)
            };

            // Save progress locally
            await dexieService.saveFlashcardProgress(newProgress);

            // Update local state to reflect change immediately
            setCards(prev => prev.map(c => c.id === card.id ? { ...c, progress: newProgress } : c));

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

        // Quality: 5 for correct, 1 for incorrect (handled by isKnow)
        await updateProgress(currentCard as any, status === 'correct');

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
        localStorage.removeItem('flashcard_session_state');
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
        <div className="h-dvh bg-background flex flex-col items-center justify-center p-4 overflow-hidden">
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

            <div className="w-full max-w-lg flex flex-col gap-4 sm:gap-6">
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
                <div className="relative group/nav py-2 sm:py-4" {...swipeHandlers}>
                    <div className="w-full h-[380px] sm:h-[450px] md:h-[500px] overflow-hidden">
                        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={(_, info) => {
                                    if (info.offset.x < -100) handleNext();
                                    else if (info.offset.x > 100) handlePrev();
                                }}
                                whileTap={{ cursor: "grabbing" }}
                                className="w-full h-full relative cursor-grab active:cursor-grabbing"
                            >
                                {resuming && (
                                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-[2.5rem]">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                )}
                                <ReactCardFlip
                                    isFlipped={isFlipped}
                                    flipDirection="horizontal"
                                    containerStyle={{ width: '100%', height: '100%' }}
                                >
                                    {/* Minimalist Front */}
                                    <div
                                        onClick={handleFlip}
                                        className="w-full h-full bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/20 transition-all shadow-sm group"
                                    >
                                        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => handleSpeak(e, currentCard.english)}
                                                className="rounded-full bg-secondary text-primary h-8 w-8 sm:h-10 sm:w-10 hover:bg-primary/10"
                                            >
                                                <Volume2 className="h-4 w-5 sm:h-5 sm:w-5" />
                                            </Button>
                                        </div>

                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary/40 mb-3 sm:mb-6 px-3 py-0.5 sm:px-4 sm:py-1 bg-primary/5 rounded-full">
                                            {currentCard.partOfSpeech}
                                        </span>

                                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-2 sm:mb-4">
                                            {currentCard.english}
                                        </h2>

                                        {currentCard.pronunciation && (
                                            <p className="text-base sm:text-lg font-mono text-muted-foreground/40 italic">
                                                /{currentCard.pronunciation}/
                                            </p>
                                        )}
                                    </div>

                                    {/* Minimalist Back */}
                                    <div
                                        onClick={handleFlip}
                                        className="w-full h-full bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/20 transition-all shadow-sm relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20" />

                                        <div className="flex-1 w-full flex flex-col items-center justify-center overflow-y-auto">
                                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary/30 mb-2 sm:mb-4">Meaning</p>
                                            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-tight mb-6 sm:mb-10">
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
                <div className="h-14 sm:h-20 max-w-xs mx-auto w-full">
                    <AnimatePresence mode="wait">
                        {isFlipped ? (
                            <motion.div
                                key="flipped"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="grid grid-cols-2 gap-3 h-full"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => { e.stopPropagation(); markCard('incorrect'); }}
                                    className="flex items-center justify-center h-full w-full rounded-xl sm:rounded-2xl border-2 border-red-100 text-red-500 hover:bg-red-50 text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-white transition-colors"
                                >
                                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                                    Hard
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => { e.stopPropagation(); markCard('correct'); }}
                                    className="flex items-center justify-center h-full w-full rounded-xl sm:rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                                >
                                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                                    Easy
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="front"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="h-full"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={handleFlip}
                                    className="w-full h-full rounded-xl sm:rounded-2xl bg-primary text-primary-foreground text-xs sm:text-sm font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/25 hover:bg-primary/90 flex items-center justify-center"
                                >
                                    Reveal
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
