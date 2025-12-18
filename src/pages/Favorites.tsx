import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { VocabCard } from "@/components/VocabCard";
import { Heart, Loader2, Download } from "lucide-react";
import { useVocabularies, useVocabularyMutations } from "@/hooks/useVocabularies";
import { useFavorites } from "@/hooks/useFavorites";
import { WordChatModal } from "@/components/WordChatModal";
import { Vocabulary } from "@/types/vocabulary";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateFavoritesPDF } from "@/lib/pdf/generateFavoritesPdf";
import { motion } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import { VocabularyDetailsModal } from "@/components/VocabularyDetailsModal";

export default function Favorites() {
  const { data: vocabularies = [], isLoading } = useVocabularies();
  const { updateVocabulary } = useVocabularyMutations();

  // Use Dexie-backed favorites
  const { favorites, toggleFavorite } = useFavorites();

  const [exporting, setExporting] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Chat State
  const [chatVocab, setChatVocab] = useState<Vocabulary | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);

  // Modal State
  const [selectedVocab, setSelectedVocab] = useState<Vocabulary | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  // Close details modal on mobile/tablet resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && isDetailsModalOpen) {
        setIsDetailsModalOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDetailsModalOpen]);

  const favoriteVocabs = vocabularies
    .filter(v => favorites.includes(v.id))
    .sort((a, b) => {
      return favorites.indexOf(b.id) - favorites.indexOf(a.id);
    });

  const handleImproveMeaning = async (id: string) => {
    const vocab = vocabularies.find(v => v.id === id);
    if (!vocab) return;

    if (window.innerWidth < 1024) {
      navigate(`/chat/${id}`, {
        state: {
          initialPrompt: `The current Bangla meaning "${vocab.bangla}" is confusing. Please provide a better, easier, native-style Bangla meaning.`
        }
      });
    } else {
      setChatVocab(vocab);
      setChatInitialPrompt(`The current Bangla meaning "${vocab.bangla}" is confusing. Please provide a better, easier, native-style Bangla meaning.`);
      setIsChatOpen(true);
    }
  };

  const handleExport = async () => {
    if (favoriteVocabs.length === 0) {
      toast.error("No favorites to export");
      return;
    }

    setExporting(true);
    try {
      await generateFavoritesPDF({
        vocabularies: favoriteVocabs,
        userName: user?.displayName || "User",
        userEmail: user?.email || "",
      });
      toast.success("PDF exported successfully");
    } catch (error) {
      toast.error("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  // Virtual scrolling ref
  const parentRef = useRef<HTMLDivElement>(null);

  // Virtual scrolling setup
  const rowVirtualizer = useVirtualizer({
    count: favoriteVocabs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 250, // Estimated card height (increased for better spacing)
    overscan: 3,
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground px-4 pt-8 pb-12 rounded-b-[2rem] shadow-lg mb-6"
      >
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">Favorites</h1>
            <p className="text-destructive-foreground/80 text-sm">
              {favoriteVocabs.length} favorite words
            </p>
          </div>
          {favoriteVocabs.length > 0 && (
            <Button
              onClick={handleExport}
              disabled={exporting}
              variant="secondary"
              size="sm"
              className="shadow-md"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </>
              )}
            </Button>
          )}
        </div>
      </motion.header>

      <div className="max-w-lg mx-auto px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : favoriteVocabs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-destructive/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Tap the heart icon on any vocabulary card to add it to your collection.
            </p>
          </div>
        ) : (
          <div
            ref={parentRef}
            className="pb-8"
            style={{
              maxHeight: 'calc(100vh - 280px)',
              overflow: 'auto',
            }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const vocab = favoriteVocabs[virtualItem.index];
                return (
                  <div
                    key={virtualItem.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <div className="pb-4">
                      <VocabCard
                        vocab={vocab}
                        index={virtualItem.index}
                        isFavorite={true}
                        onToggleFavorite={toggleFavorite}
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            navigate(`/vocabularies/${vocab.id}`);
                          } else {
                            setSelectedVocab(vocab);
                            setIsDetailsModalOpen(true);
                          }
                        }}
                        onImproveMeaning={handleImproveMeaning}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <WordChatModal
        vocabulary={chatVocab}
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        initialPrompt={chatInitialPrompt}
      />

      <VocabularyDetailsModal
        vocabulary={selectedVocab}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        isFavorite={true}
        onToggleFavorite={toggleFavorite}
        isAdmin={isAdmin}
        onNext={() => {
          const currentIndex = favoriteVocabs.findIndex(v => v.id === selectedVocab?.id);
          if (currentIndex !== -1 && currentIndex < favoriteVocabs.length - 1) {
            setSelectedVocab(favoriteVocabs[currentIndex + 1]);
          }
        }}
        onPrevious={() => {
          const currentIndex = favoriteVocabs.findIndex(v => v.id === selectedVocab?.id);
          if (currentIndex > 0) {
            setSelectedVocab(favoriteVocabs[currentIndex - 1]);
          }
        }}
        hasNext={selectedVocab ? favoriteVocabs.findIndex(v => v.id === selectedVocab.id) !== -1 && favoriteVocabs.findIndex(v => v.id === selectedVocab.id) < favoriteVocabs.length - 1 : false}
        hasPrevious={selectedVocab ? favoriteVocabs.findIndex(v => v.id === selectedVocab.id) > 0 : false}
      />
    </div >
  );
}
