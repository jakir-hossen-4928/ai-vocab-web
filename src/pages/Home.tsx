import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Sparkles, Zap, Loader2, X, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useVocabularies } from "@/hooks/useVocabularies";
import { useFavorites } from "@/hooks/useFavorites";
import { VocabCard } from "@/components/VocabCard";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { WordChatModal } from "@/components/WordChatModal";
import { Vocabulary } from "@/types/vocabulary";
import { searchDictionaryAPI, convertDictionaryToVocabulary } from "@/services/dictionaryApiService";
import { toast } from "sonner";
import { getSelectedModel } from "@/openrouterAi/apiKeyStorage";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data, isLoading } = useVocabularies();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Use Dexie-backed favorites
  const { favorites, toggleFavorite } = useFavorites();

  // Online dictionary state
  const [onlineResults, setOnlineResults] = useState<Vocabulary[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);

  // Chat State
  const [chatVocab, setChatVocab] = useState<Vocabulary | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);

  const [model, setModel] = useState<string | null>(getSelectedModel() || null);

  useEffect(() => {
    const savedModel = getSelectedModel();
    setModel(savedModel || null);
    const handler = () => {
      setModel(getSelectedModel() || null);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Sync search query with URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    setSearchParams(params, { replace: true });
  }, [debouncedSearch, setSearchParams]);

  // Search online dictionary when no local results
  useEffect(() => {
    const searchOnline = async () => {
      if (!debouncedSearch.trim() || isLoading) {
        setOnlineResults([]);
        return;
      }

      // Check if we have local results
      const localResults = vocabularies.filter(v =>
        v.bangla.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        v.english.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        v.partOfSpeech.toLowerCase().includes(debouncedSearch.toLowerCase())
      );

      // Only search online if no local results
      if (localResults.length === 0) {
        setIsSearchingOnline(true);
        try {
          const result = await searchDictionaryAPI(debouncedSearch);
          if (result) {
            const vocab = convertDictionaryToVocabulary(result, `online-${Date.now()}`);
            setOnlineResults([vocab]);
            console.log('[Home] Found online dictionary result:', vocab.english);
          } else {
            setOnlineResults([]);
          }
        } catch (error) {
          console.error('[Home] Online dictionary search failed:', error);
          setOnlineResults([]);
        } finally {
          setIsSearchingOnline(false);
        }
      } else {
        setOnlineResults([]);
      }
    };

    searchOnline();
  }, [debouncedSearch, isLoading, data]);

  const clearSearch = () => {
    setSearchQuery("");
    setOnlineResults([]);
  };

  const vocabularies = [...(data || [])].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const handleImproveMeaning = async (id: string) => {
    const vocab = vocabularies.find(v => v.id === id);
    if (!vocab) return;

    setChatVocab(vocab);
    setChatInitialPrompt(`The current Bangla meaning "${vocab.bangla}" is confusing. Please provide a better, easier, native-style Bangla meaning.`);
    setIsChatOpen(true);
  };

  const filteredVocabs = debouncedSearch.trim()
    ? vocabularies.filter(v =>
      v.bangla.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      v.english.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      v.partOfSpeech.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    : vocabularies.slice(0, 8);

  // Combine local and online results
  const allResults = [...filteredVocabs, ...onlineResults];
  const hasResults = allResults.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Reduced Height */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden"
      >
        {/* Background - Stable (No Animation) */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-blue-600">
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl transform rotate-45" />
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* Reduced padding from py-8 sm:py-16 lg:py-20 to py-6 sm:py-10 lg:py-12 */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-4 sm:mb-6"
          >
            {/* Welcome Badge */}
            <div
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full mb-3 sm:mb-4"
            >
              <span className="text-white/90 text-xs sm:text-sm font-medium">
                Welcome back, {user?.displayName?.split(" ")[0] || "Learner"}! 👋
              </span>
            </div>

            {/* Main Heading - Reduced margins */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight px-4">
              Continue Your <span className="text-yellow-300">Learning Journey</span>
            </h1>

            {/* Reduced text size and margins */}
            <p className="text-sm sm:text-base lg:text-lg text-white/80 mb-4 sm:mb-6 leading-relaxed max-w-2xl mx-auto px-4">
              Search for vocabulary, track your progress, and master new words every day.
            </p>

            {/* Search - Stable Layout */}
            <div className="relative max-w-2xl mx-auto px-4">
              <div
                className={`relative bg-white rounded-2xl shadow-2xl flex items-center transition-all duration-200 ${isSearchFocused ? 'ring-4 ring-blue-500/20' : ''
                  }`}
              >
                <Search className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search your vocabulary..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-12 pr-12 h-12 sm:h-14 text-base border-0 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/70"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={clearSearch}
                      className="absolute right-3 p-1.5 rounded-full hover:bg-slate-100 text-muted-foreground transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Search Results or Recent Vocabularies */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          {isLoading || isSearchingOnline ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8 gap-2"
            >
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              {isSearchingOnline && (
                <p className="text-sm text-muted-foreground">Searching online dictionary...</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-4 sm:px-0">
                <h2 className="text-lg sm:text-xl font-bold">
                  {searchQuery.trim() ? (
                    <>
                      Search Results ({allResults.length})
                      {onlineResults.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          <Globe className="h-3 w-3 mr-1" />
                          Online
                        </Badge>
                      )}
                    </>
                  ) : (
                    "Recent Vocabularies"
                  )}
                </h2>
                {searchQuery.trim() && (
                  <button
                    onClick={clearSearch}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                  >
                    Clear search
                  </button>
                )}
              </div>

              {hasResults ? (
                <div className="grid gap-3 px-4 sm:px-0">
                  {allResults.map((vocab, index) => (
                    <VocabCard
                      key={vocab.id}
                      vocab={vocab}
                      index={index}
                      isFavorite={favorites.includes(vocab.id)}
                      onToggleFavorite={toggleFavorite}
                      onClick={() => {
                        // Don't navigate for online results
                        if (!vocab.isOnline) {
                          navigate(`/vocabularies/${vocab.id}`);
                        }
                      }}
                      onImproveMeaning={vocab.isOnline ? undefined : handleImproveMeaning}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-4 sm:px-0">
                  <Card className="p-6 sm:p-8 text-center border-2 border-dashed border-muted">
                    <div className="bg-muted rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-3">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-semibold mb-2">No matches found</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Try a different search term or{" "}
                      <button
                        onClick={clearSearch}
                        className="text-primary hover:underline font-medium"
                      >
                        clear your search
                      </button>
                    </p>
                  </Card>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily Tip - Reduced margins */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 sm:mt-10 px-4 sm:px-0"
        >
          <Card className="p-4 sm:p-6 border-0 shadow-lg bg-gradient-to-br from-accent/10 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Sparkles className="h-16 w-16 sm:h-20 sm:w-20 text-accent" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-accent/20">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground dark:text-accent" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Daily Learning Tip</h3>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Practice speaking new words aloud using the text-to-speech feature.
                Hearing pronunciation helps with retention and builds confidence!
              </p>
            </div>
          </Card>
        </motion.section>
      </div>
      <WordChatModal
        vocabulary={chatVocab}
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        initialPrompt={chatInitialPrompt}

        model={model}
      />
    </div>
  );
}
