import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Sparkles, Zap, Loader2, X, Globe, Mic, Languages, History as HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useVocabularies } from "@/hooks/useVocabularies";
import { useFavorites } from "@/hooks/useFavorites";
import { VocabCard } from "@/components/VocabCard";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { VocabularyDetailsModal } from "@/components/VocabularyDetailsModal";
import { Vocabulary } from "@/types/vocabulary";
import { searchDictionaryAPI, convertDictionaryToVocabulary } from "@/services/dictionaryApiService";
import { toast } from "sonner";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { safeTimestamp } from "@/utils/dateUtils";
import { vocabularyService } from "@/services/vocabularyService";
import { History } from "lucide-react";
import { metaService } from "@/services/metaService";
import { Helmet } from "react-helmet-async";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data, isLoading, isRefetching } = useVocabularies(debouncedSearch);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // Use Dexie-backed favorites
  const { favorites, toggleFavorite } = useFavorites();




  // Modal State
  const [selectedVocab, setSelectedVocab] = useState<Vocabulary | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);

  // Responsive Grid columns
  const [columns, setColumns] = useState(1);
  // Consolidated Window Event Listeners
  useEffect(() => {
    const handleUIUpdates = () => {
      const width = window.innerWidth;
      // 1. Update grid columns
      if (width >= 1024) setColumns(3);
      else if (width >= 768) setColumns(2);
      else setColumns(1);

      // 2. Auto-close details modal on mobile/tablet resize
      if (width < 1024) {
        setIsDetailsModalOpen(prev => prev ? false : prev);
      }
    };



    handleUIUpdates();
    window.addEventListener('resize', handleUIUpdates);

    return () => {
      window.removeEventListener('resize', handleUIUpdates);
    };
  }, []);

  const [searchHistory, setSearchHistory] = useState<string[]>([]);



  // Voice search
  const { isListening, startListening, interimTranscript, detectedLanguage, language, toggleLanguage } = useVoiceSearch((transcript) => {
    setSearchQuery(transcript);
    setSearchParams({ search: transcript });
  });

  // Real-time voice search update
  useEffect(() => {
    if (isListening && interimTranscript) {
      setSearchQuery(interimTranscript);
    }
  }, [isListening, interimTranscript]);


  useEffect(() => {
    metaService.resetToDefault();
  }, []);

  // Close details modal on mobile/tablet resize

  // Sync search query with URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    setSearchParams(params, { replace: true });
    setDisplayCount(20); // Reset display count on new search
  }, [debouncedSearch, setSearchParams]);

  // Refresh search history when query changes
  useEffect(() => {
    vocabularyService.getSearchHistory(10).then(setSearchHistory);
  }, [debouncedSearch]);
  const clearSearch = () => {
    setSearchQuery("");
    setDisplayCount(20);
  };

  const vocabularies = useMemo(() => {
    return [...(data || [])].sort((a, b) => {
      return safeTimestamp(b.createdAt) - safeTimestamp(a.createdAt);
    });
  }, [data]);





  // Combine local and online results
  const allResults = useMemo(() => {
    if (!debouncedSearch.trim()) return vocabularies.slice(0, 8);
    return vocabularies;
  }, [debouncedSearch, vocabularies]);
  const hasResults = allResults.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Ai Vocab | Master English Vocabulary</title>
        <meta name="description" content="Enhance your English vocabulary with AI-powered tools, personalized learning, and interactive resources." />
        <meta property="og:title" content="Ai Vocab | Master English Vocabulary" />
        <meta property="og:description" content="Personalized AI vocabulary builder and English learning platform." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-blue-600 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl transform rotate-45" />
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6 sm:mb-8"
          >
            {/* Welcome Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full mb-4 sm:mb-6">
              <span className="text-white/90 text-xs sm:text-sm font-medium">
                Welcome back, {user?.displayName?.split(" ")[0] || "Learner"}! 👋
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Continue Your <span className="text-yellow-300">Learning Journey</span>
            </h1>

            {/* Search Bar container */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                (e.currentTarget.querySelector('input') as HTMLInputElement)?.blur();
              }}
              className="relative max-w-2xl mx-auto"
            >
              <div
                className={`relative bg-white rounded-2xl shadow-2xl flex items-center transition-all duration-200 ${isSearchFocused ? 'ring-4 ring-blue-500/20' : ''}`}
              >
                <Search className="absolute left-4 h-5 w-5 text-foreground/80 pointer-events-none" />
                <Input
                  placeholder={window.innerWidth < 640 ? "Find words..." : "Search your vocabulary..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setIsSearchFocused(false), 200);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-full pl-10 sm:pl-12 pr-24 sm:pr-32 h-12 sm:h-14 text-sm sm:text-base border-0 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground text-foreground"
                  aria-label="Search vocabulary"
                  enterKeyHint="search"
                  type="search"
                />

                {/* Clear and Voice Actions */}
                <div className="absolute right-2 sm:right-3 flex items-center gap-1.5 sm:gap-2">
                  <div className="flex items-center">
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={(e) => {
                          clearSearch();
                          (e.currentTarget.closest('.relative')?.querySelector('input') as HTMLInputElement)?.blur();
                        }}
                        className="p-1.5 rounded-full hover:bg-slate-100 text-foreground transition-colors mr-1 sm:mr-2"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 border-l pl-1 sm:pl-2 border-slate-100">
                    <button
                      type="button"
                      onClick={toggleLanguage}
                      className="text-[10px] sm:text-xs font-bold text-muted-foreground/80 hover:text-foreground bg-slate-50 dark:bg-zinc-800 px-2 py-1 rounded-lg transition-colors uppercase tracking-wider h-8 sm:h-9 flex items-center justify-center min-w-[32px] sm:min-w-[40px]"
                      aria-label={language === 'en-US' ? "Switch to Bengali" : "Switch to English"}
                    >
                      {language === 'en-US' ? 'EN' : 'BN'}
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={startListening}
                      className={`h-8 sm:h-9 w-8 sm:w-9 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-slate-100 text-muted-foreground'}`}
                      aria-label="Voice search"
                    >
                      <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* History Dropdown */}
              <AnimatePresence>
                {isSearchFocused && !searchQuery.trim() && searchHistory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-zinc-800 z-[100] overflow-hidden text-left"
                  >
                    <div className="p-3 border-b border-slate-50 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-800/50">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                        <HistoryIcon className="h-3 w-3" /> Recent Searches
                      </span>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await vocabularyService.clearSearchHistory();
                          setSearchHistory([]);
                        }}
                        className="text-[9px] font-bold text-primary hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-[280px] overflow-y-auto scroll-smooth">
                      {searchHistory.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchQuery(item);
                            // Hide keyboard on history selection
                            if (document.activeElement instanceof HTMLElement) {
                              document.activeElement.blur();
                            }
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-left transition-colors group"
                        >
                          <Search className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                          <span className="flex-1 text-sm text-foreground truncate">{item}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-[400px] pb-32 md:pb-12">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 gap-3"
            >
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground animate-pulse">Consulting database...</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  {searchQuery.trim() ? (
                    <>
                      Search Results
                      <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-0">
                        {allResults.length}
                      </Badge>
                    </>
                  ) : (
                    "Recent Vocabularies"
                  )}
                </h2>
                {searchQuery.trim() && (
                  <button
                    onClick={clearSearch}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors underline decoration-dotted underline-offset-4"
                  >
                    Clear Search
                  </button>
                )}
              </div>

              {/* Grid or Empty State */}
              {hasResults ? (
                <div
                  className={`grid gap-4 sm:gap-6 ${allResults.length === 1 ? 'max-w-md mx-auto w-full' : ''}`}
                  style={{
                    gridTemplateColumns: allResults.length === 1 ? '1fr' : `repeat(${columns}, 1fr)`,
                  }}
                >
                  {allResults.slice(0, displayCount).map((vocab, index) => (
                    <VocabCard
                      key={vocab.id}
                      vocab={vocab}
                      index={index}
                      isFavorite={favorites.includes(vocab.id)}
                      onToggleFavorite={toggleFavorite}
                      searchQuery={debouncedSearch}
                      onClick={() => {
                        if (!vocab.isOnline) {
                          if (window.innerWidth < 1024) {
                            navigate(`/vocabularies/${vocab.id}`);
                          } else {
                            setSelectedVocab(vocab);
                            setIsDetailsModalOpen(true);
                          }
                        }
                      }}

                      className="h-full"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 px-4 max-w-md mx-auto">
                  <div className="bg-primary/5 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-primary/30" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No words matched</h3>
                  <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                    {searchQuery ? `We couldn't find any results for "${searchQuery}". Maybe try a different keyword?` : "Your recent collection is empty."}
                  </p>
                  <Button
                    variant="outline"
                    onClick={clearSearch}
                    className="rounded-xl px-8 border-primary/20 hover:bg-primary/5 text-primary"
                  >
                    Clear Search
                  </Button>
                </div>
              )}

              {/* Load More */}
              {allResults.length > displayCount && hasResults && (
                <div className="flex justify-center mt-8 pb-10">
                  <Button
                    onClick={() => setDisplayCount(prev => prev + 20)}
                    variant="outline"
                    className="px-8 py-6 rounded-2xl border-primary/20 hover:bg-primary/5 text-primary font-bold transition-all"
                  >
                    View More Results
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily Tip Section */}
        {!searchQuery.trim() && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 sm:mt-16"
          >
            <Card className="p-6 sm:p-8 border-0 shadow-lg bg-gradient-to-br from-accent/10 to-transparent relative overflow-hidden rounded-3xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="h-24 w-24 text-accent" />
              </div>
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="p-3 sm:p-4 rounded-2xl bg-accent/20">
                  <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-accent-foreground dark:text-accent" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black">Daily Learning Tip</h3>
                  <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                    Practice speaking new words aloud using the text-to-speech feature.
                    Hearing pronunciation helps with retention and builds confidence!
                  </p>
                </div>
              </div>
            </Card>
          </motion.section >
        )}
      </div>

      <VocabularyDetailsModal
        vocabulary={selectedVocab}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        isFavorite={selectedVocab ? favorites.includes(selectedVocab.id) : false}
        onToggleFavorite={toggleFavorite}
        isAdmin={isAdmin}
        onNext={() => {
          const currentIndex = allResults.findIndex(v => v.id === selectedVocab?.id);
          if (currentIndex !== -1 && currentIndex < allResults.length - 1) {
            setSelectedVocab(allResults[currentIndex + 1]);
          }
        }}
        onPrevious={() => {
          const currentIndex = allResults.findIndex(v => v.id === selectedVocab?.id);
          if (currentIndex > 0) {
            setSelectedVocab(allResults[currentIndex - 1]);
          }
        }}
        hasNext={selectedVocab ? allResults.findIndex(v => v.id === selectedVocab.id) !== -1 && allResults.findIndex(v => v.id === selectedVocab.id) < allResults.length - 1 : false}
        hasPrevious={selectedVocab ? allResults.findIndex(v => v.id === selectedVocab.id) > 0 : false}
      />
    </div>
  );
}
