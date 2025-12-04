import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation, useNavigationType } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VocabCard } from "@/components/VocabCard";
import { Plus, Search, Filter, X, RefreshCw, Globe } from "lucide-react";
import { useVocabularies, useVocabularyMutations } from "@/hooks/useVocabularies";
import { useFavorites } from "@/hooks/useFavorites";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { searchDictionaryAPI, convertDictionaryToVocabulary } from "@/services/dictionaryApiService";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useDebounce } from "@/hooks/useDebounce";
import { Vocabulary } from "@/types/vocabulary";
import { WordChatModal } from "@/components/WordChatModal";
import { toast } from "sonner";
import { getSelectedModel } from "@/openrouterAi/apiKeyStorage";

export default function Vocabularies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: vocabularies = [], isLoading, refresh, isRefetching } = useVocabularies();
  const { deleteVocabulary, updateVocabulary } = useVocabularyMutations();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navType = useNavigationType();

  // Advanced Filters State
  const [selectedPos, setSelectedPos] = useState<string>(searchParams.get("pos") || "all");
  const [sortOrder, setSortOrder] = useState<string>(searchParams.get("sort") || "newest");
  const [showFavorites, setShowFavorites] = useState<boolean>(searchParams.get("fav") === "true");

  // Use Dexie-backed favorites
  const { favorites, toggleFavorite } = useFavorites();

  // Worker State
  const [filteredVocabs, setFilteredVocabs] = useState<Vocabulary[]>([]);
  const [isWorkerFiltering, setIsWorkerFiltering] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  // Online dictionary state
  const [onlineResults, setOnlineResults] = useState<Vocabulary[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);

  // Chat State
  const [chatVocab, setChatVocab] = useState<Vocabulary | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);

  const [model, setModel] = useState<string | null>(getSelectedModel() || null);

  const debouncedSearch = useDebounce(searchQuery, 150);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredVocabs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180, // Increased estimate for better initial render
    overscan: 10, // Increased overscan for smoother fast scrolling
  });

  // Manual Scroll Restoration for Virtual List
  useEffect(() => {
    const scrollKey = `scroll_pos_${location.key}_vocabularies_list`;

    // Only save if we have data to scroll through
    const handleScroll = () => {
      if (parentRef.current && filteredVocabs.length > 0) {
        sessionStorage.setItem(scrollKey, parentRef.current.scrollTop.toString());
      }
    };

    // Attach listener
    const scrollElement = parentRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Restore scroll position
    // We only attempt restoration if we have data and it's a POP navigation (back/forward)
    if (navType === 'POP' && filteredVocabs.length > 0) {
      const savedPosition = sessionStorage.getItem(scrollKey);

      if (savedPosition) {
        const offset = parseInt(savedPosition, 10);

        // We use a timeout to ensure the virtualizer has had a chance to measure items
        // after the data update.
        const attemptRestore = () => {
          if (rowVirtualizer && parentRef.current) {
            rowVirtualizer.scrollToOffset(offset);
          }
        };

        // Attempt immediately and after short delays to catch layout shifts
        attemptRestore();
        requestAnimationFrame(attemptRestore);
        setTimeout(attemptRestore, 50);
        setTimeout(attemptRestore, 150);
      }
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [filteredVocabs.length, navType, location.key, rowVirtualizer]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL("../workers/vocabWorker.ts", import.meta.url), {
      type: "module",
    });

    workerRef.current.onmessage = (e) => {
      setFilteredVocabs(e.data);
      setIsWorkerFiltering(false);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Post message to worker
  useEffect(() => {
    if (workerRef.current && vocabularies.length > 0) {
      // Only show loading for search queries or filter changes, not initial load
      if (debouncedSearch || selectedPos !== "all" || showFavorites || sortOrder !== "newest") {
        setIsWorkerFiltering(true);
      }
      workerRef.current.postMessage({
        vocabularies,
        searchQuery: debouncedSearch,
        selectedPos,
        sortOrder,
        showFavorites,
        favorites,
      });
    }
  }, [vocabularies, debouncedSearch, selectedPos, sortOrder, showFavorites, favorites]);

  // Search online dictionary when no local results
  useEffect(() => {
    const searchOnline = async () => {
      // Only search if there's a search query and no filters active
      if (!debouncedSearch.trim() || selectedPos !== "all" || showFavorites || isLoading) {
        setOnlineResults([]);
        return;
      }

      // Check if we have local results
      if (filteredVocabs.length === 0 && !isWorkerFiltering) {
        setIsSearchingOnline(true);
        try {
          const result = await searchDictionaryAPI(debouncedSearch);
          if (result) {
            const vocab = convertDictionaryToVocabulary(result, `online-${Date.now()}`);
            setOnlineResults([vocab]);
            console.log('[Vocabularies] Found online dictionary result:', vocab.english);
          } else {
            setOnlineResults([]);
          }
        } catch (error) {
          console.error('[Vocabularies] Online dictionary search failed:', error);
          setOnlineResults([]);
        } finally {
          setIsSearchingOnline(false);
        }
      } else {
        setOnlineResults([]);
      }
    };

    searchOnline();
  }, [debouncedSearch, filteredVocabs.length, isWorkerFiltering, selectedPos, showFavorites, isLoading]);

  // Sync filters with URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (debouncedSearch) params.set("search", debouncedSearch);
    else params.delete("search");

    if (selectedPos !== "all") params.set("pos", selectedPos);
    else params.delete("pos");

    if (sortOrder !== "newest") params.set("sort", sortOrder);
    else params.delete("sort");

    if (showFavorites) params.set("fav", "true");
    else params.delete("fav");

    setSearchParams(params, { replace: true });
  }, [debouncedSearch, selectedPos, sortOrder, showFavorites, setSearchParams]);

  const activeFiltersCount = (selectedPos !== "all" ? 1 : 0) + (showFavorites ? 1 : 0) + (sortOrder !== "newest" ? 1 : 0);

  const clearFilters = () => {
    setSelectedPos("all");
    setSortOrder("newest");
    setShowFavorites(false);
    setSearchQuery("");
    setOnlineResults([]);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVocabulary.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete vocabulary:", error);
    }
  };

  const handleImproveMeaning = async (id: string) => {
    const vocab = vocabularies.find(v => v.id === id);
    if (!vocab) return;

    if (window.innerWidth < 768) {
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

  const handleRefresh = async () => {
    try {
      await refresh();
      toast.success("Vocabularies refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh vocabularies");
    }
  };

  // Keep model in sync with stored selection
  useEffect(() => {
    const storedModel = getSelectedModel();
    setModel(storedModel || null);
    const handler = () => {
      setModel(getSelectedModel() || null);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-3 sm:px-4 pt-4 sm:pt-8 pb-4 sm:pb-6 shadow-md flex-shrink-0"
      >
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1 truncate">Vocabularies</h1>
              <p className="text-primary-foreground/80 text-xs sm:text-sm">
                {filteredVocabs.length + onlineResults.length} words found
                {onlineResults.length > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] sm:text-xs">
                    <Globe className="h-3 w-3" />
                    {onlineResults.length} online
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Refresh Button */}
              <Button
                onClick={handleRefresh}
                disabled={isRefetching}
                size="sm"
                variant="secondary"
                className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 shadow-sm h-8 sm:h-9 w-8 sm:w-9 p-0"
                title="Refresh vocabularies"
              >
                <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              </Button>
              {isAdmin && (
                <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                  <Button
                    onClick={() => navigate("/vocabularies/add")}
                    size="sm"
                    className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-sm text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Add</span>
                  </Button>
                  <Button
                    onClick={() => navigate("/vocabularies/bulk-add")}
                    size="sm"
                    variant="secondary"
                    className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 shadow-sm text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 hidden xs:flex"
                  >
                    <span className="hidden sm:inline">Bulk Upload</span>
                    <span className="sm:hidden">Bulk</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex gap-1.5 sm:gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 sm:pl-10 pr-8 sm:pr-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground/30 h-9 sm:h-10 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-primary-foreground/50 hover:text-primary-foreground"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 border-primary-foreground/20 relative h-9 sm:h-10 w-9 sm:w-10 p-0 flex-shrink-0">
                  <Filter className="h-4 w-4" />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-red-500 rounded-full border-2 border-primary text-[10px] sm:text-xs flex items-center justify-center font-bold text-white">{activeFiltersCount}</span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-[20px] h-[85vh] sm:h-[80vh] px-4 sm:px-6">
                <SheetHeader className="mb-4 sm:mb-6">
                  <SheetTitle className="text-lg sm:text-xl">Filter & Sort</SheetTitle>
                  <SheetDescription className="text-xs sm:text-sm">
                    Customize how you view your vocabulary list.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(85vh-180px)] sm:max-h-[calc(80vh-180px)]">
                  {/* Sort Order */}
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Sort By</Label>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Select sort order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="a-z">A-Z (English)</SelectItem>
                        <SelectItem value="z-a">Z-A (English)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Part of Speech */}
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Part of Speech</Label>
                    <Select value={selectedPos} onValueChange={setSelectedPos}>
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="noun">Noun</SelectItem>
                        <SelectItem value="verb">Verb</SelectItem>
                        <SelectItem value="adjective">Adjective</SelectItem>
                        <SelectItem value="adverb">Adverb</SelectItem>
                        <SelectItem value="preposition">Preposition</SelectItem>
                        <SelectItem value="conjunction">Conjunction</SelectItem>
                        <SelectItem value="pronoun">Pronoun</SelectItem>
                        <SelectItem value="interjection">Interjection</SelectItem>
                        <SelectItem value="phrase">Phrase</SelectItem>
                        <SelectItem value="idiom">Idiom</SelectItem>
                        <SelectItem value="phrasal verb">Phrasal Verb</SelectItem>
                        <SelectItem value="collocation">Collocation</SelectItem>
                        <SelectItem value="linking phrase">Linking Phrase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Favorites Toggle */}
                  <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                    <div className="space-y-0.5 flex-1 pr-2">
                      <Label className="text-sm sm:text-base">Favorites Only</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Show only words you've marked as favorite
                      </p>
                    </div>
                    <Switch
                      checked={showFavorites}
                      onCheckedChange={setShowFavorites}
                    />
                  </div>

                  {/* Active Filters Summary */}
                  {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2">
                      {selectedPos !== "all" && (
                        <Badge variant="secondary" onClick={() => setSelectedPos("all")} className="cursor-pointer text-xs sm:text-sm">
                          Type: {selectedPos} <X className="ml-1 h-3 w-3" />
                        </Badge>
                      )}
                      {sortOrder !== "newest" && (
                        <Badge variant="secondary" onClick={() => setSortOrder("newest")} className="cursor-pointer text-xs sm:text-sm">
                          Sort: {sortOrder} <X className="ml-1 h-3 w-3" />
                        </Badge>
                      )}
                      {showFavorites && (
                        <Badge variant="secondary" onClick={() => setShowFavorites(false)} className="cursor-pointer text-xs sm:text-sm">
                          Favorites Only <X className="ml-1 h-3 w-3" />
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs text-muted-foreground">
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>

                <SheetFooter className="mt-4 sm:mt-8">
                  <SheetClose asChild>
                    <Button className="w-full h-10 sm:h-11 text-sm sm:text-base">Show {filteredVocabs.length} Results</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>

      <div
        ref={parentRef}
        className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto pb-20 md:pb-0"
      >
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner />
            <p className="text-sm text-muted-foreground">Loading vocabularies...</p>
          </div>
        ) : isWorkerFiltering && filteredVocabs.length === 0 && onlineResults.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner />
            <p className="text-sm text-muted-foreground">Searching...</p>
          </div>
        ) : isSearchingOnline ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner />
            <p className="text-sm text-muted-foreground">Searching online dictionary...</p>
          </div>
        ) : filteredVocabs.length === 0 && onlineResults.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <div className="bg-muted/50 rounded-full h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Search className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">No words found</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-xs mx-auto">
              {searchQuery ? `No results for "${searchQuery}"` : "Try adjusting your filters to find what you're looking for."}
            </p>
            <Button variant="outline" onClick={clearFilters} className="h-9 sm:h-10 text-sm sm:text-base">
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Local Results */}
            {filteredVocabs.length > 0 && (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const vocab = filteredVocabs[virtualItem.index];
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
                      className="px-3 sm:px-4 py-3"
                    >
                      <VocabCard
                        vocab={vocab}
                        index={virtualItem.index}
                        isFavorite={favorites.includes(vocab.id)}
                        onToggleFavorite={toggleFavorite}
                        onClick={() => navigate(`/vocabularies/${vocab.id}`)}
                        onDelete={handleDelete}
                        onImproveMeaning={handleImproveMeaning}
                        isAdmin={isAdmin}
                        className="h-full"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Online Results */}
            {onlineResults.length > 0 && (
              <div className="px-3 sm:px-4 py-3">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-muted-foreground">Online Dictionary Results</h3>
                </div>
                {onlineResults.map((vocab, index) => (
                  <div key={vocab.id} className="mb-3">
                    <VocabCard
                      vocab={vocab}
                      index={index}
                      isFavorite={false}
                      onToggleFavorite={() => { }}
                      onClick={() => { }} // Don't navigate for online results
                      isAdmin={false}
                      className="h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <WordChatModal
        vocabulary={chatVocab}
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        initialPrompt={chatInitialPrompt}

        model={model}
      />
    </div >
  );
}
