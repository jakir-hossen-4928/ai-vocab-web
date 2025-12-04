import { Volume2, Heart, Trash2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vocabulary } from "@/types/vocabulary";
import { speakText } from "@/services/ttsService";
import { memo, useState } from "react";

interface VocabCardProps {
  vocab: Vocabulary;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClick?: () => void;
  index?: number;
  onDelete?: (id: string) => void;
  onImproveMeaning?: (id: string) => Promise<void>;
  isAdmin?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const VocabCard = memo(({
  vocab,
  isFavorite,
  onToggleFavorite,
  onClick,
  onDelete,
  onImproveMeaning,
  isAdmin = false,
  style,
  className
}: VocabCardProps) => {
  const [isImproving, setIsImproving] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(vocab.id);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(vocab.english);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm(`Are you sure you want to delete "${vocab.english}"?`)) {
      onDelete(vocab.id);
    }
  };

  const handleImprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onImproveMeaning) {
      setIsImproving(true);
      try {
        await onImproveMeaning(vocab.id);
      } catch (error) {
        console.error("Failed to improve meaning:", error);
      } finally {
        setIsImproving(false);
      }
    }
  };

  // Debug logging
  console.log(`[VocabCard] ${vocab.english} - isOnline: ${vocab.isOnline}, onImproveMeaning: ${!!onImproveMeaning}`);

  return (
    <div
      style={style}
      className={className}
    >
      <Card
        className="p-3 sm:p-4 cursor-pointer hover:shadow-hover transition-all duration-300 bg-vocab-card hover:bg-vocab-card-hover h-full flex flex-col justify-between"
        onClick={onClick}
      >
        <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-start sm:items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
              <h3 className="text-base sm:text-xl font-bold text-foreground break-words">{vocab.bangla}</h3>
              {onImproveMeaning && !vocab.isOnline && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 sm:h-6 sm:w-6 -ml-1 text-muted-foreground"
                  onClick={handleImprove}
                  disabled={isImproving}
                  title="Chat with AI for improved meaning"
                >
                  {isImproving ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
              )}
              <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">
                {vocab.partOfSpeech}
              </Badge>
            </div>
            <p className="text-sm sm:text-lg text-primary font-medium break-words">{vocab.english}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 break-words">{vocab.pronunciation}</p>
          </div>
          <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSpeak}
              className="h-7 w-7 sm:h-8 sm:w-8"
            >
              <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            {!vocab.isOnline && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteClick}
                className="h-7 w-7 sm:h-8 sm:w-8"
              >
                <Heart
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`}
                />
              </Button>
            )}
            {isAdmin && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </div>

        {vocab.explanation && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 break-words mt-auto">
            {vocab.explanation}
          </p>
        )}
      </Card>
    </div>
  );
});

VocabCard.displayName = "VocabCard";
