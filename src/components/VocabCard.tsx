// ... (I will construct the cleaner file content)
import { Volume2, Heart, Trash2, Languages, X, Share2, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vocabulary } from "@/types/vocabulary";
import { speakText } from "@/services/ttsService";
import { confirmAction, showSuccessToast } from "@/utils/sweetAlert";
import React, { memo, useState } from "react";
import { translateText } from "@/services/googleTranslateService";
import { toast } from "sonner";
import { useNative } from "@/hooks/useNative";
import { useVocabularyShare } from "@/hooks/useVocabularyShare";
import { ShareableVocabularyCard } from "./ShareableVocabularyCard";

interface VocabCardProps {
  vocab: Vocabulary;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClick?: () => void;
  index?: number;
  onDelete?: (id: string) => void;

  isAdmin?: boolean;
  searchQuery?: string;
  style?: React.CSSProperties;
  className?: string;
}

// Helper function to determine text size based on length
const getBanglaTextSize = (text: string) => {
  const length = text.length;
  if (length > 50) return "text-sm sm:text-base md:text-lg";
  if (length > 30) return "text-base sm:text-lg md:text-xl";
  return "text-base sm:text-xl md:text-2xl";
};

const getEnglishTextSize = (text: string) => {
  const length = text.length;
  if (length > 50) return "text-sm sm:text-base md:text-lg";
  if (length > 30) return "text-base sm:text-lg md:text-xl";
  return "text-base sm:text-xl md:text-2xl";
};

export const VocabCard = memo(({
  vocab,
  isFavorite,
  onToggleFavorite,
  onClick,
  onDelete,
  isAdmin = false,
  searchQuery,
  style,
  className
}: VocabCardProps) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedWord, setTranslatedWord] = useState<string>("");
  const { haptic } = useNative();
  const { shareAsImage, shareRef, itemToShare, isItemSharing } = useVocabularyShare();
  const isSharingImage = isItemSharing(vocab.id);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic('light');
    shareAsImage(vocab);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic('light');
    onToggleFavorite(vocab.id);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic('light');
    speakText(vocab.english);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      const isConfirmed = await confirmAction(
        'Are you sure?',
        `Are you sure you want to delete "${vocab.english}"?`,
        'Yes, delete it!'
      );

      if (isConfirmed) {
        haptic('success');
        onDelete(vocab.id);
        showSuccessToast('Vocabulary deleted successfully');
      }
    }
  };

  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic('light');

    if (showTranslation) {
      setShowTranslation(false);
      return;
    }

    if (translatedWord) {
      setShowTranslation(true);
      return;
    }

    setIsTranslating(true);
    setShowTranslation(true);

    try {
      // Only translate the main word as requested
      const result = await translateText(vocab.english);
      setTranslatedWord(result.translatedText);
    } catch (error) {
      toast.error("Translation failed. Please try again.");
      setShowTranslation(false);
    } finally {
      setIsTranslating(false);
    }
  };

  const displayBangla = (showTranslation && translatedWord) ? translatedWord : vocab.bangla;

  const banglaTextSize = getBanglaTextSize(displayBangla);
  const englishTextSize = getEnglishTextSize(vocab.english);

  // Deep search match detection
  const lowerQuery = searchQuery?.toLowerCase().trim();

  const matchedRelated = lowerQuery ? vocab.relatedWords?.find(rw =>
    rw.word.toLowerCase().includes(lowerQuery) ||
    rw.meaning.toLowerCase().includes(lowerQuery)
  ) : null;

  const matchedVerbForm = lowerQuery && vocab.verbForms ? Object.entries(vocab.verbForms).find(([key, value]) =>
    value.toLowerCase().includes(lowerQuery)
  ) : null;


  return (
    <div
      style={style}
      className={`${className} group/card`}
    >
      <Card
        className="relative p-5 sm:p-6 md:p-8 cursor-pointer border-slate-200/60 dark:border-zinc-800/60 hover:border-primary/30 transition-all duration-300 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 h-full flex flex-col group"
        onClick={onClick}
      >
        {/* Hover Highlight Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative flex flex-col h-full z-10">
          <div className="flex justify-between items-start mb-3 gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
                >
                  {vocab.partOfSpeech}
                </Badge>
              </div>

              <h3 className={`${banglaTextSize} font-bold text-foreground leading-relaxed flex items-center gap-2 group-hover:text-primary transition-colors duration-300`}>
                {displayBangla}
                {isTranslating && (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                )}
              </h3>

              <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                <p className={`${englishTextSize} text-primary font-bold tracking-normal leading-relaxed`}>
                  {vocab.english}
                </p>
                {vocab.pronunciation && (
                  <p className="text-[11px] sm:text-xs text-muted-foreground/70 font-medium italic">
                    [{vocab.pronunciation}]
                  </p>
                )}
              </div>
            </div>

            {/* Top Right Desktop Actions */}
            <div className="hidden sm:flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSpeak}
                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
                aria-label="Speak word"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              {vocab.isOnline && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleTranslate}
                  className={`h-8 w-8 rounded-full transition-all active:scale-95 ${showTranslation ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-primary hover:bg-primary/10'}`}
                  disabled={isTranslating}
                  aria-label={showTranslation ? "Hide translation" : "Show translation"}
                >
                  {showTranslation ? <X className="h-4 w-4" /> : <Languages className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>



          {/* Deep Search Match Context */}
          {(matchedRelated || matchedVerbForm) && (
            <div className="mb-4 p-2.5 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 group-hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-1.5 mb-1">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-[9px] font-black uppercase tracking-widest px-1.5 py-0">
                  {matchedRelated ? 'Related Word' : 'Verb Form'}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2 overflow-hidden">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-bold text-foreground leading-normal">
                    {matchedRelated ? matchedRelated.word : (matchedVerbForm as any)[1]}
                  </span>
                  <span className="text-[11px] text-muted-foreground/70 leading-normal">
                    {matchedRelated ? matchedRelated.meaning : vocab.bangla}
                  </span>
                </div>
                <Search className="h-3 w-3 text-primary/30 flex-shrink-0" />
              </div>
            </div>
          )}

          {/* Bottom Actions Row */}
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="h-9 px-2 sm:px-4 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 rounded-lg gap-1.5 transition-all"
                disabled={isSharingImage}
                aria-label="Share vocabulary card"
              >
                {isSharingImage ? <Loader2 className="h-3 w-3 animate-spin" /> : <Share2 className="h-3 w-3" />}
                <span className="xs:inline">Share</span>
              </Button>
            </div>

            <div className="flex items-center gap-1">
              {/* Mobile Speak Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSpeak}
                className="sm:hidden h-9 w-9 rounded-full hover:bg-primary/10"
                aria-label="Speak word"
              >
                <Volume2 className="h-4 w-4" />
              </Button>

              {!vocab.isOnline && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(vocab.id);
                    }}
                    className={`h-9 w-9 rounded-full transition-colors ${isFavorite ? "text-red-500 bg-red-50 dark:bg-red-500/10" : "text-muted-foreground hover:text-red-500 hover:bg-red-50"}`}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>

                  {isAdmin && onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(vocab.id);
                      }}
                      className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      aria-label="Delete vocabulary"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Hidden view for sharing as image - MOVED: Now handled globally by GlobalShareProxy */}
    </div>
  );
});

VocabCard.displayName = "VocabCard";
