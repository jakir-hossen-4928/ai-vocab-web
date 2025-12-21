import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { VocabCard } from "@/components/VocabCard";
import { useVocabularies, useVocabularyMutations } from "@/hooks/useVocabularies";
import { useFavorites } from "@/hooks/useFavorites";
import { WordChatModal } from "@/components/WordChatModal";
import { Vocabulary } from "@/types/vocabulary";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateFavoritesPDF } from "@/lib/pdf/generateFavoritesPdf";
import { motion } from "framer-motion";
import { List, AutoSizer, WindowScroller, CellMeasurer, CellMeasurerCache } from "react-virtualized";
import { VocabularyDetailsModal } from "@/components/VocabularyDetailsModal";
import { Search, X, Loader2, Heart, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

export default function Favorites() {
  const { data: vocabularies = [], isLoading } = useVocabularies();
  const { updateVocabulary } = useVocabularyMutations();

  // Use Dexie-backed favorites
  const { favorites, toggleFavorite } = useFavorites();

  const [exporting, setExporting] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(searchQuery, 300);

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
    .filter(v => {
      const searchLower = debouncedSearch.toLowerCase();
      return v.english.toLowerCase().includes(searchLower) ||
        v.bangla.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      return favorites.indexOf(b.id) - favorites.indexOf(a.id);
    });

  // Sync search with URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) params.set("search", debouncedSearch);
    else params.delete("search");
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, setSearchParams]);

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

  // Grid configuration
  const [columns, setColumns] = useState(1);
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1024) setColumns(3);
      else if (width >= 768) setColumns(2);
      else setColumns(1);
    };
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // react-virtualized Cache
  const cache = useRef(new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 300,
  }));

  // Clear cache when search or data changes
  useEffect(() => {
    cache.current.clearAll();
  }, [debouncedSearch, favoriteVocabs]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground px-4 pt-8 pb-12 rounded-b-[2rem] shadow-lg mb-6"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex justify-between items-center w-full sm:w-auto">
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
                className="shadow-md sm:hidden"
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

          <div className="w-full flex gap-2">
            <div className="relative flex-1 group bg-white/10 backdrop-blur-md rounded-xl flex items-center transition-all duration-200 focus-within:ring-2 focus-within:ring-white/20 overflow-hidden border border-white/20">
              <Search className="absolute left-3 h-4 w-4 text-white" />
              <Input
                placeholder="Search favorites..."
                className="pl-9 pr-10 h-10 border-0 bg-transparent focus-visible:ring-0 text-white placeholder:text-white/80 text-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                aria-label="Search favorites"
                enterKeyHint="search"
                type="search"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  setSearchQuery("");
                  (e.currentTarget.closest('.relative')?.querySelector('input') as HTMLInputElement)?.blur();
                }}
                className={`absolute right-1 h-8 w-8 rounded-full hover:bg-white/20 text-white transition-opacity ${searchQuery ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {favoriteVocabs.length > 0 && (
              <Button
                onClick={handleExport}
                disabled={exporting}
                variant="secondary"
                size="sm"
                className="shadow-md hidden sm:flex h-10"
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
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
          <div className="pb-32 md:pb-8">
            <WindowScroller>
              {({ height, isScrolling, onChildScroll, scrollTop }) => (
                <AutoSizer disableHeight>
                  {({ width }) => (
                    <List
                      autoHeight
                      height={height}
                      isScrolling={isScrolling}
                      onScroll={onChildScroll}
                      scrollTop={scrollTop}
                      width={width}
                      rowCount={Math.ceil(favoriteVocabs.length / columns)}
                      rowHeight={cache.current.rowHeight}
                      deferredMeasurementCache={cache.current}
                      overscanRowCount={10}
                      rowRenderer={({ index, key, parent, style }) => {
                        const itemsRow = [];
                        for (let i = 0; i < columns; i++) {
                          const itemIndex = index * columns + i;
                          if (itemIndex < favoriteVocabs.length) {
                            itemsRow.push({ item: favoriteVocabs[itemIndex], index: itemIndex });
                          }
                        }

                        return (
                          <CellMeasurer
                            cache={cache.current}
                            columnIndex={0}
                            key={key}
                            parent={parent}
                            rowIndex={index}
                          >
                            {({ registerChild }) => (
                              <div
                                ref={registerChild as any}
                                style={style}
                                className="py-3"
                              >
                                <div
                                  className="grid gap-4 sm:gap-6"
                                  style={{
                                    gridTemplateColumns: itemsRow.length < columns && favoriteVocabs.length < columns
                                      ? `repeat(${itemsRow.length}, minmax(0, 500px))`
                                      : `repeat(${columns}, 1fr)`,
                                    justifyContent: itemsRow.length < columns && favoriteVocabs.length < columns ? 'center' : 'start',
                                  }}
                                >
                                  {itemsRow.map(({ item, index }) => (
                                    <div key={item.id} className="h-full">
                                      <VocabCard
                                        vocab={item}
                                        index={index}
                                        isFavorite={true}
                                        onToggleFavorite={toggleFavorite}
                                        onClick={() => {
                                          if (window.innerWidth < 1024) {
                                            navigate(`/vocabularies/${item.id}`);
                                          } else {
                                            setSelectedVocab(item);
                                            setIsDetailsModalOpen(true);
                                          }
                                        }}
                                        onImproveMeaning={handleImproveMeaning}
                                        className="h-full"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CellMeasurer>
                        );
                      }}
                    />
                  )}
                </AutoSizer>
              )}
            </WindowScroller>
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
