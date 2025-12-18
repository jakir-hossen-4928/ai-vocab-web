import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useVocabularies } from "@/hooks/useVocabularies";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Shuffle, Layers, Volume2, Check, X, RotateCcw, Clock, Grid3x3, CreditCard } from "lucide-react";
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

interface FlashcardProgress {
    vocabularyId: string;
    nextReview: number;
    interval: number;
    easeFactor: number;
    streak: number;
    lastReviewed: number;
}

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
                    const progress = allProgress.find(p => p.vocabularyId === vocab.id);
                    return {
                        ...vocab,
                        progress: progress || null,
                        isDue: !progress || progress.nextReview <= now
                    };
                });

                // Filter due cards
                const dueCards = vocabWithProgress.filter(v => v.isDue);
                setDueCount(dueCards.length);

                // If we have due cards, prioritize them. Otherwise show all (review mode)
                let cardsToReview = dueCards.length > 0 ? dueCards : vocabWithProgress;

                // Sort by due date (oldest due first)
                cardsToReview.sort((a, b) => {
                    const timeA = a.progress?.nextReview || 0;
                    const timeB = b.progress?.nextReview || 0;
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
                vocabularyId,
                nextReview,
                interval,
                easeFactor,
                streak,
                lastReviewed: Date.now()
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

    if (isLoading || loadingProgress) {
        return (
            <div className="h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-4 text-center">
                <Layers className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Flashcards Available</h2>
                <p className="text-muted-foreground mb-6">Add some vocabulary words to start practicing!</p>
                <Button onClick={() => navigate('/vocabularies')}>
                    Go to Vocabulary
                </Button>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-3 sm:px-4 pt-3 sm:pt-4 pb-3 sm:pb-4 shadow-md">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(-1)}
                                className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9"
                            >
                                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                            <div>
                                <h1 className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2">
                                    <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Flashcards
                                </h1>
                                <p className="text-xs text-primary-foreground/80">
                                    {dueCount > 0 ? `${dueCount} cards due` : 'Review Mode'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1.5 sm:gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={resetSession}
                                className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9"
                                title="Reset Session"
                            >
                                <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleShuffle}
                                className={cn("text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9", isShuffled && "bg-white/20")}
                                title="Shuffle Cards"
                            >
                                <Shuffle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 sm:space-y-2">
                        <Progress value={progressPercentage} className="h-1.5 sm:h-2 bg-white/20" />
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <span className="flex items-center gap-1">
                                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                                    <span className="font-medium">{sessionStats.correct}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <X className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
                                    <span className="font-medium">{sessionStats.incorrect}</span>
                                </span>
                            </div>
                            <span className="text-primary-foreground/80">
                                {currentIndex + 1}/{cards.length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Area */}
            <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
                <div className="w-full max-w-lg mx-auto h-full flex items-center" {...swipeHandlers}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{
                                opacity: 0,
                                x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
                                scale: 0.9
                            }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{
                                opacity: 0,
                                x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
                                scale: 0.9
                            }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full max-h-[500px] sm:max-h-[550px] md:max-h-[600px]"
                        >
                            <ReactCardFlip
                                isFlipped={isFlipped}
                                flipDirection="horizontal"
                                containerStyle={{ width: '100%', height: '100%' }}
                            >
                                {/* Front of Card */}
                                <Card
                                    className={cn(
                                        "w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center shadow-2xl border-2 cursor-pointer transition-all relative",
                                        "border-primary/10 bg-gradient-to-br from-background to-accent/5 hover:shadow-xl"
                                    )}
                                    onClick={handleFlip}
                                >
                                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => handleSpeak(e, currentCard.english)}
                                            className="text-muted-foreground hover:text-primary h-7 w-7 sm:h-8 sm:w-8"
                                        >
                                            <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        </Button>
                                    </div>

                                    <span className="inline-block px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3 sm:mb-4">
                                        {currentCard.partOfSpeech}
                                    </span>

                                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 text-foreground px-2 break-words">
                                        {currentCard.english}
                                    </h2>

                                    {currentCard.pronunciation && (
                                        <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-mono mb-3 sm:mb-4">
                                            /{currentCard.pronunciation}/
                                        </p>
                                    )}

                                    <p className="absolute bottom-4 sm:bottom-6 text-xs text-muted-foreground animate-pulse">
                                        Tap to flip • Swipe to navigate
                                    </p>
                                </Card>

                                {/* Back of Card */}
                                <Card
                                    className={cn(
                                        "w-full h-full flex flex-col p-4 sm:p-6 md:p-8 shadow-2xl border-2 cursor-pointer transition-all overflow-y-auto",
                                        "border-primary/10 bg-gradient-to-br from-primary/5 to-background hover:shadow-xl"
                                    )}
                                    onClick={handleFlip}
                                >
                                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-primary text-center break-words">
                                        {currentCard.bangla}
                                    </h3>

                                    <div className="space-y-2.5 sm:space-y-3 w-full flex-1 overflow-y-auto">
                                        {currentCard.explanation && (
                                            <div className="bg-background/50 p-2.5 sm:p-3 rounded-lg border">
                                                <p className="text-xs font-semibold text-muted-foreground mb-1">Explanation</p>
                                                <p className="text-xs sm:text-sm leading-relaxed">{currentCard.explanation}</p>
                                            </div>
                                        )}

                                        {currentCard.examples && currentCard.examples.length > 0 && (
                                            <div className="bg-background/50 p-2.5 sm:p-3 rounded-lg border">
                                                <p className="text-xs font-semibold text-muted-foreground mb-1.5">Example</p>
                                                <p className="text-xs sm:text-sm italic leading-relaxed">{currentCard.examples[0].en}</p>
                                                {currentCard.examples[0].bn && (
                                                    <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">{currentCard.examples[0].bn}</p>
                                                )}
                                            </div>
                                        )}

                                        {currentCard.synonyms && currentCard.synonyms.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground mb-1.5">Synonyms</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {currentCard.synonyms.slice(0, 5).map((syn, i) => (
                                                        <span key={i} className="text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded-md">
                                                            {syn}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </ReactCardFlip>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex-shrink-0 bg-card border-t p-2 sm:p-3 md:p-4 safe-bottom">
                <div className="max-w-2xl mx-auto space-y-2">
                    {/* Mark Buttons - Only show when flipped */}
                    {isFlipped && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-1.5 sm:gap-2"
                        >
                            <Button
                                variant="outline"
                                onClick={() => markCard('incorrect')}
                                className="flex-1 border-red-500/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 h-9 sm:h-11 text-xs sm:text-sm"
                            >
                                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                                Hard (Reset)
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => markCard('correct')}
                                className="flex-1 border-green-500/50 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 h-9 sm:h-11 text-xs sm:text-sm"
                            >
                                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                                Easy (Next)
                            </Button>
                        </motion.div>
                    )}

                    {/* Navigation Buttons */}
                    {!isFlipped && (
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            <Button
                                variant="default"
                                onClick={handleFlip}
                                className="w-full h-9 sm:h-11 text-xs sm:text-sm px-2 sm:px-4"
                            >
                                Show Answer
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}