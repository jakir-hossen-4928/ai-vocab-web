import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation, useNavigationType } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VocabCard } from "@/components/VocabCard";
import { Plus, Search, Filter, X, RefreshCw, Globe, Mic, History as HistoryIcon } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { Vocabulary } from "@/types/vocabulary";
import { WordChatModal } from "@/components/WordChatModal";
import { VocabularyDetailsModal } from "@/components/VocabularyDetailsModal";
import { ViewPreferenceDialog } from "@/components/ViewPreferenceDialog";
import { toast } from "sonner";
import { getSelectedModel } from "@/openrouterAi/apiKeyStorage";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { useViewPreference } from "@/hooks/useViewPreference";
import { vocabularyService } from "@/services/vocabularyService";
import { List, AutoSizer, WindowScroller, CellMeasurer, CellMeasurerCache } from "react-virtualized";

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
  // Modal & Search State
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [model, setModel] = useState<string | null>(getSelectedModel() || null);

  // View Preference State
  const { preference, savePreference, clearPreference } = useViewPreference();
  const [showPreferenceDialog, setShowPreferenceDialog] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState<Vocabulary | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Voice search
  const { isListening, startListening, language, toggleLanguage, interimTranscript } = useVoiceSearch((transcript) => {
    setSearchQuery(transcript);
    setSearchParams({ search: transcript });
  });

  // Real-time voice search update
  useEffect(() => {
    if (isListening && interimTranscript) {
      setSearchQuery(interimTranscript);
    }
  }, [isListening, interimTranscript]);

  const debouncedSearch = useDebounce(searchQuery, 150);

  const parentRef = useRef<HTMLDivElement>(null);

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

  // Close details modal on mobile/tablet resize

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Sync selectedVocab with updated data from cache (e.g. after edit)
  useEffect(() => {
    if (selectedVocab && vocabularies.length > 0) {
      const updatedVocab = vocabularies.find(v => v.id === selectedVocab.id);
      // Only update if the object reference has changed (meaning data has been updated in cache)
      if (updatedVocab && updatedVocab !== selectedVocab) {
        setSelectedVocab(updatedVocab);
      }
    }
  }, [vocabularies, selectedVocab]);

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

  // Clear cache when search or data changes
  useEffect(() => {
    cache.current.clearAll();
  }, [debouncedSearch, filteredVocabs]);

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
          // Use vocabularyService.search which already handles local -> cache -> online logic
          const results = await vocabularyService.search(debouncedSearch);
          // For this page, we only show results that came from outside the normal local dataset
          const onlineOnly = results.filter(r => r.isOnline || r.isFromAPI);
          setOnlineResults(onlineOnly);
        } catch (error) {
          console.error('[Vocabularies] Online search failed:', error);
          setOnlineResults([]);
        } finally {
          setIsSearchingOnline(false);
        }
      } else {
        setOnlineResults([]);
      }

      // Refresh search history
      if (debouncedSearch) {
        const history = await vocabularyService.getSearchHistory(10);
        setSearchHistory(history);
      }
    };

    // Load initial history
    if (!debouncedSearch) {
      vocabularyService.getSearchHistory(10).then(setSearchHistory);
    }

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

  const handleVocabClick = (vocab: Vocabulary) => {
    // Check if mobile/tablet device
    if (window.innerWidth < 1024) {
      navigate(`/vocabularies/${vocab.id}`);
      return;
    }

    // Check preference for desktop
    if (!preference) {
      setSelectedVocab(vocab);
      setShowPreferenceDialog(true);
    } else if (preference === "modal") {
      setSelectedVocab(vocab);
      setIsDetailsModalOpen(true);
    } else {
      navigate(`/vocabularies/${vocab.id}`);
    }
  };

  const handlePreferenceSelect = (pref: "modal" | "page") => {
    savePreference(pref);
    setShowPreferenceDialog(false);

    if (selectedVocab) {
      if (pref === "modal") {
        setIsDetailsModalOpen(true);
      } else {
        navigate(`/vocabularies/${selectedVocab.id}`);
        setSelectedVocab(null);
      }
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-3 sm:px-4 pt-3 sm:pt-6 pb-4 sm:pb-6 shadow-md flex-shrink-0 z-50"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1 truncate">Vocabularies</h1>
              <p className="text-primary-foreground/80 text-xs sm:text-sm h-4 sm:h-5 flex items-center">
                <span className="truncate">
                  {filteredVocabs.length + onlineResults.length} words found
                </span>
                {onlineResults.length > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] sm:text-xs shrink-0">
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                (e.currentTarget.querySelector('input') as HTMLInputElement)?.blur();
              }}
              className="relative flex-1 group bg-white shadow-lg rounded-xl flex items-center transition-all duration-200 focus-within:ring-2 focus-within:ring-white/20"
            >
              <Search className="absolute left-3 sm:left-4 h-4 w-4 text-foreground/80 transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Find words..."
                className="pl-9 sm:pl-10 h-10 sm:h-12 border-0 bg-transparent focus-visible:ring-0 text-foreground text-sm sm:text-base pr-24 sm:pr-32"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                aria-label="Search vocabulary"
                enterKeyHint="search"
                type="search"
                className="pl-9 sm:pl-10 h-10 sm:h-12 border-0 bg-transparent focus-visible:ring-0 text-foreground text-sm sm:text-base pr-24 sm:pr-32 placeholder:text-muted-foreground"
              />

              <div className="absolute right-2 sm:right-3 flex items-center gap-1.5 sm:gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    setSearchQuery("");
                    setOnlineResults([]);
                    (e.currentTarget.closest('.relative')?.querySelector('input') as HTMLInputElement)?.blur();
                  }}
                  className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-slate-100 transition-opacity text-foreground ${searchQuery ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
                <div className="flex items-center gap-1 border-l pl-1.5 sm:pl-2 border-slate-100">
                  <button
                    type="button"
                    onClick={toggleLanguage}
                    className="text-[10px] sm:text-xs font-bold text-muted-foreground hover:text-primary transition-colors px-1 sm:px-2"
                    aria-label={language === 'en-US' ? "Switch to Bengali" : "Switch to English"}
                    title={`Switch language (Current: ${language === 'en-US' ? 'English' : 'Bangla'})`}
                  >
                    {language === 'en-US' ? 'EN' : 'BN'}
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={startListening}
                    className={`h-7 sm:h-8 w-7 sm:w-8 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-slate-100 text-muted-foreground'}`}
                    aria-label="Voice search"
                  >
                    <Mic className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isListening ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Search History Dropdown */}
              <AnimatePresence>
                {isSearchFocused && !searchQuery.trim() && searchHistory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-zinc-800 z-[100] overflow-hidden"
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
                    <div className="max-h-[240px] overflow-y-auto">
                      {searchHistory.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent blur
                            setSearchQuery(item);
                            setSearchParams({ search: item });
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

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" className="bg-white shadow-lg text-foreground hover:bg-slate-50 border-0 relative h-10 sm:h-12 w-10 sm:w-12 p-0 flex-shrink-0">
                  <Filter className="h-4 w-4 text-muted-foreground" />
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

                  {/* View Preference Reset */}
                  <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                    <div className="space-y-0.5 flex-1 pr-2">
                      <Label className="text-sm sm:text-base">View Preference</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Current: {preference ? (preference === "modal" ? "Modal View" : "Details Page") : "Not Set"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        clearPreference();
                        toast.success("View preference reset");
                      }}
                    >
                      Reset
                    </Button>
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
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
      >
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <LoadingSpinner />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Gathering your vocabulary...</p>
          </div>
        ) : isWorkerFiltering && filteredVocabs.length === 0 && onlineResults.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <LoadingSpinner />
            <p className="text-sm font-medium text-muted-foreground">Searching locally...</p>
          </div>
        ) : isSearchingOnline ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <LoadingSpinner />
            <p className="text-sm font-medium text-muted-foreground">Consulting online dictionary...</p>
          </div>
        ) : filteredVocabs.length === 0 && onlineResults.length === 0 ? (
          <div className="text-center py-20 px-4 max-w-md mx-auto">
            <div className="bg-primary/5 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-primary/30" />
            </div>
            <h3 className="text-xl font-bold mb-2">No words matched</h3>
            <p className="text-muted-foreground mb-8 text-sm">
              {searchQuery ? `We couldn't find any results for "${searchQuery}".` : "Your collection is empty or filters are too restrictive."}
            </p>
            <Button variant="outline" onClick={clearFilters} className="rounded-xl px-8 border-primary/20 hover:bg-primary/5 text-primary">
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="pt-4 pb-32 md:pb-8">
            {/* Local Results Grid */}
            {filteredVocabs.length > 0 && (
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
                        rowCount={Math.ceil(filteredVocabs.length / columns)}
                        rowHeight={cache.current.rowHeight}
                        deferredMeasurementCache={cache.current}
                        overscanRowCount={10}
                        rowRenderer={({ index, key, parent, style }) => {
                          const itemsRow = [];
                          for (let i = 0; i < columns; i++) {
                            const itemIndex = index * columns + i;
                            if (itemIndex < filteredVocabs.length) {
                              itemsRow.push({ item: filteredVocabs[itemIndex], index: itemIndex });
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
                                      gridTemplateColumns: itemsRow.length < columns && filteredVocabs.length < columns
                                        ? `repeat(${itemsRow.length}, minmax(0, 500px))`
                                        : `repeat(${columns}, 1fr)`,
                                      justifyContent: itemsRow.length < columns && filteredVocabs.length < columns ? 'center' : 'start',
                                    }}
                                  >
                                    {itemsRow.map(({ item, index }) => (
                                      <div key={item.id} className="h-full">
                                        <VocabCard
                                          vocab={item}
                                          index={index}
                                          isFavorite={favorites.includes(item.id)}
                                          onToggleFavorite={toggleFavorite}
                                          searchQuery={searchQuery}
                                          onClick={() => handleVocabClick(item)}
                                          onDelete={handleDelete}
                                          onImproveMeaning={handleImproveMeaning}
                                          isAdmin={isAdmin}
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
            )}

            {/* Online Results */}
            {onlineResults.length > 0 && (
              <div className="mt-8 mb-4">
                <div className="flex items-center gap-2 mb-4 px-2">
                  <div className="h-px flex-1 bg-primary/10" />
                  <div className="flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-primary/70">Online Results</h3>
                  </div>
                  <div className="h-px flex-1 bg-primary/10" />
                </div>
                <div
                  className="grid gap-4 sm:gap-6 py-4 px-1"
                  style={{
                    gridTemplateColumns: onlineResults.length < columns
                      ? `repeat(${onlineResults.length}, minmax(0, 500px))`
                      : `repeat(${columns}, 1fr)`,
                    justifyContent: onlineResults.length < columns ? 'center' : 'start',
                  }}
                >
                  {onlineResults.map((vocab, index) => (
                    <VocabCard
                      key={vocab.id}
                      vocab={vocab}
                      index={index}
                      isFavorite={false}
                      onToggleFavorite={() => { }}
                      searchQuery={searchQuery}
                      onClick={() => { }} // Don't navigate for online results
                      isAdmin={false}
                      className="h-full"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <WordChatModal
        vocabulary={chatVocab}
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        initialPrompt={chatInitialPrompt}

        model={model}
      />

      <ViewPreferenceDialog
        open={showPreferenceDialog}
        onSelect={handlePreferenceSelect}
      />

      <VocabularyDetailsModal
        vocabulary={selectedVocab}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        isFavorite={selectedVocab ? favorites.includes(selectedVocab.id) : false}
        onToggleFavorite={toggleFavorite}
        isAdmin={isAdmin}
        onNext={() => {
          const currentIndex = filteredVocabs.findIndex(v => v.id === selectedVocab?.id);
          if (currentIndex !== -1 && currentIndex < filteredVocabs.length - 1) {
            setSelectedVocab(filteredVocabs[currentIndex + 1]);
          }
        }}
        onPrevious={() => {
          const currentIndex = filteredVocabs.findIndex(v => v.id === selectedVocab?.id);
          if (currentIndex > 0) {
            setSelectedVocab(filteredVocabs[currentIndex - 1]);
          }
        }}
        hasNext={selectedVocab ? filteredVocabs.findIndex(v => v.id === selectedVocab.id) !== -1 && filteredVocabs.findIndex(v => v.id === selectedVocab.id) < filteredVocabs.length - 1 : false}
        hasPrevious={selectedVocab ? filteredVocabs.findIndex(v => v.id === selectedVocab.id) > 0 : false}
      />
    </div>
  );
}
