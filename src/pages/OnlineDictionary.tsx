import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Search, Volume2, BookOpen, Loader2, AlertCircle, History, Sparkles, X, Languages, BookText, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import TranslateButton from "@/components/TranslateButton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Phonetic {
    text: string;
    audio?: string;
}

interface Definition {
    definition: string;
    example?: string;
    synonyms: string[];
    antonyms: string[];
}

interface Meaning {
    partOfSpeech: string;
    definitions: Definition[];
}

interface DictionaryEntry {
    word: string;
    phonetic?: string;
    phonetics: Phonetic[];
    origin?: string;
    meanings: Meaning[];
}

const RECENT_SEARCHES_KEY = "recent_dictionary_searches";
const MAX_RECENT_SEARCHES = 5;

export default function OnlineDictionary() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DictionaryEntry | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Initial search if search param exists & Load recent searches
    useEffect(() => {
        const query = searchParams.get("search");
        if (query) {
            searchWord(query);
        }

        const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, [searchParams]);

    const saveRecentSearch = (word: string) => {
        const cleanedWord = word.trim().toLowerCase();
        if (!cleanedWord) return;

        const updated = [cleanedWord, ...recentSearches.filter(s => s !== cleanedWord)].slice(0, MAX_RECENT_SEARCHES);
        setRecentSearches(updated);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    };

    const removeRecentSearch = (e: React.MouseEvent, word: string) => {
        e.stopPropagation();
        const updated = recentSearches.filter(s => s !== word);
        setRecentSearches(updated);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    };

    const searchWord = async (word: string) => {
        if (!word.trim()) {
            toast.error("Please enter a word to search");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const baseUrl = import.meta.env.VITE_DICTIONARY_API || "https://api.dictionaryapi.dev/api/v2/entries/en";
            const finalUrl = `${baseUrl}/${word.trim().toLowerCase()}`;

            const response = await fetch(finalUrl);

            if (!response.ok) {
                if (response.status === 404) {
                    setError(`No definition found for "${word}"`);
                } else {
                    setError("Failed to fetch definition. Please try again.");
                }
                return;
            }

            const data = await response.json();
            setResult(data[0]);
            saveRecentSearch(word);
        } catch (err) {
            setError("Network error. Please check your connection.");
            console.error("Dictionary API error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery) {
            setSearchParams({ search: trimmedQuery });
            searchWord(trimmedQuery);
            setIsInputFocused(false);
            searchInputRef.current?.blur();
        } else {
            setSearchParams({});
            setIsInputFocused(false);
            searchInputRef.current?.blur();
        }
    };

    const playAudio = (audioUrl: string) => {
        if (!audioUrl) {
            toast.error("Audio not available");
            return;
        }
        const audio = new Audio(audioUrl.startsWith("//") ? `https:${audioUrl}` : audioUrl);
        audio.play().catch(() => toast.error("Failed to play audio"));
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-black flex flex-col pb-32 overflow-x-hidden">
            {/* Elegant Header with Floating Search */}
            <header className="sticky top-[calc(52px+var(--safe-area-top))] md:top-0 z-50 w-full bg-white dark:bg-black md:bg-white/80 md:dark:bg-black/80 md:backdrop-blur-xl border-b border-border/40 pb-4 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 pt-4">
                    <div className="hidden md:flex items-center gap-3 mb-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/")}
                            className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors h-10 w-10 flex-shrink-0"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent truncate">
                            Smart Dictionary
                        </h1>
                    </div>

                    <div className="relative">
                        <form onSubmit={handleSearch} className="flex gap-2 items-center">
                            <div className={cn(
                                "flex-1 relative flex items-center bg-zinc-50 dark:bg-zinc-900 border transition-all duration-300 rounded-2xl overflow-hidden shadow-inner group",
                                isInputFocused ? "border-primary ring-4 ring-primary/10" : "border-border/60"
                            )}>
                                <div className="pl-4 pr-1 py-3 flex items-center justify-center text-muted-foreground">
                                    <Search className={cn("h-5 w-5 transition-colors", isInputFocused ? "text-primary" : "text-foreground/80")} />
                                </div>
                                <Input
                                    ref={searchInputRef}
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsInputFocused(true)}
                                    onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                                    placeholder="Search any word..."
                                    className="border-0 bg-transparent focus-visible:ring-0 text-base md:text-lg h-12 flex-1 pl-1 text-foreground placeholder:text-muted-foreground"
                                    enterKeyHint="search"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.currentTarget.blur();
                                        }
                                    }}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            setSearchQuery("");
                                            setSearchParams({});
                                            (e.currentTarget.closest('.relative')?.querySelector('input') as HTMLInputElement)?.blur();
                                        }}
                                        className="p-2 mr-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-muted-foreground transition-colors"
                                    >
                                        <X className="h-4 w-4 text-foreground" />
                                    </button>
                                )}
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 text-white p-0 flex items-center justify-center shrink-0"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Search className="h-5 w-5" />
                                )}
                            </Button>
                        </form>

                        {/* Recent Searches Dropdown */}
                        <AnimatePresence>
                            {isInputFocused && recentSearches.length > 0 && !searchQuery && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-border/60 rounded-2xl shadow-xl z-50 overflow-hidden"
                                >
                                    <div className="p-2 border-b border-border/40 bg-muted/30">
                                        <p className="text-xs font-semibold text-muted-foreground px-3 py-1 flex items-center gap-2">
                                            <History className="h-3 w-3" /> Recent Searches
                                        </p>
                                    </div>
                                    <div className="p-1">
                                        {recentSearches.map((word) => (
                                            <button
                                                key={word}
                                                type="button"
                                                onClick={() => {
                                                    setSearchQuery(word);
                                                    searchWord(word);
                                                    // Hide keyboard
                                                    if (document.activeElement instanceof HTMLElement) {
                                                        document.activeElement.blur();
                                                    }
                                                }}
                                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted transition-colors text-left"
                                            >
                                                <span className="capitalize">{word}</span>
                                                <X
                                                    className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors"
                                                    onClick={(e) => removeRecentSearch(e, word)}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 p-4 md:pt-8 w-full max-w-4xl mx-auto mt-4 md:mt-0">
                <AnimatePresence mode="wait">
                    {/* Empty State / Hero */}
                    {!loading && !result && !error && (
                        <motion.div
                            key="hero"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center pt-8 md:pt-12 text-center px-4"
                        >
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                <div className="relative w-28 h-28 md:w-32 md:h-32 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl flex items-center justify-center border border-border/40 rotate-12 hover:rotate-0 transition-transform duration-500">
                                    <BookOpen className="h-12 w-12 md:h-14 md:w-14 text-primary" />
                                </div>
                                <div className="absolute -bottom-4 -right-4 w-14 h-14 md:w-16 md:h-16 bg-blue-500 rounded-3xl shadow-xl flex items-center justify-center border-4 border-white dark:border-black -rotate-12">
                                    <Languages className="h-6 w-6 md:h-7 md:w-7 text-white" />
                                </div>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-extrabold mb-4 tracking-tight">
                                Explore the <span className="text-primary">English Language</span>
                            </h2>
                            <p className="text-muted-foreground max-w-sm mb-8 text-base md:text-lg">
                                Instant definitions, pronunciations, and examples at your fingertips.
                            </p>

                            <div className="grid grid-cols-2 gap-4 w-full max-w-xs md:max-w-sm">
                                <Card className="p-4 bg-white dark:bg-zinc-900 border-none shadow-sm flex flex-col items-center gap-2">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                        <BookText className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-semibold">Vocabulary</span>
                                </Card>
                                <Card className="p-4 bg-white dark:bg-zinc-900 border-none shadow-sm flex flex-col items-center gap-2">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                                        <GraduationCap className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <span className="text-sm font-semibold">IELTS Prep</span>
                                </Card>
                            </div>
                        </motion.div>
                    )}

                    {/* Error State */}
                    {error && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-md mx-auto pt-8"
                        >
                            <Card className="p-8 border-none shadow-lg text-center bg-white dark:bg-zinc-900 overflow-hidden relative group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-destructive/50" />
                                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="h-8 w-8 text-destructive" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Word Not Found</h3>
                                <p className="text-muted-foreground mb-6">{error}</p>
                                <Button
                                    onClick={() => setSearchQuery("")}
                                    variant="outline"
                                    className="rounded-xl"
                                >
                                    Try another word
                                </Button>
                            </Card>
                        </motion.div>
                    )}

                    {/* Result View */}
                    {result && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-border/40 overflow-hidden mt-6"
                        >
                            {/* Streamlined Word Header */}
                            <div className="p-6 md:p-10 border-b border-border/40">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground capitalize tracking-tight">
                                                {result.word}
                                            </h2>
                                            <TranslateButton
                                                text={`${result.word}: ${result.meanings[0]?.definitions[0]?.definition || ''}`}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 text-muted-foreground/80">
                                            {result.phonetic && (
                                                <span className="text-xl font-mono tracking-tight font-medium">
                                                    /{result.phonetic}/
                                                </span>
                                            )}
                                            {result.phonetics.find(p => p.audio) && (
                                                <button
                                                    onClick={() => {
                                                        const audio = result.phonetics.find(p => p.audio);
                                                        if (audio?.audio) playAudio(audio.audio);
                                                    }}
                                                    className="p-2.5 rounded-full bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
                                                    title="Listen pronunciation"
                                                >
                                                    <Volume2 className="h-6 w-6" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {result.meanings.map((m, i) => (
                                            <Badge key={i} variant="secondary" className="text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-500 dark:text-zinc-400">
                                                {m.partOfSpeech}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Unified Results Flow */}
                            <div className="divide-y divide-border/20">
                                {result.meanings.map((meaning, idx) => (
                                    <div key={idx} className="p-6 md:p-10">
                                        <div className="flex items-center gap-2 mb-8">
                                            <div className="bg-primary/5 text-primary border border-primary/10 px-4 py-1.5 rounded-2xl text-xs font-black uppercase tracking-widest">
                                                {meaning.partOfSpeech}
                                            </div>
                                        </div>

                                        <div className="space-y-12">
                                            {meaning.definitions.map((def, defIdx) => (
                                                <div key={defIdx} className="group">
                                                    <div className="flex gap-4 md:gap-6">
                                                        <span className="text-primary/20 font-mono font-black text-xl shrink-0 leading-none">
                                                            {(defIdx + 1).toString().padStart(2, '0')}
                                                        </span>
                                                        <div className="space-y-6 flex-1">
                                                            <div className="space-y-3">
                                                                <p className="text-xl text-foreground leading-relaxed font-medium">
                                                                    {def.definition}
                                                                </p>
                                                                <TranslateButton text={def.definition} />
                                                            </div>

                                                            {def.example && (
                                                                <div className="relative pl-6 py-1">
                                                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary/10 rounded-full" />
                                                                    <p className="text-muted-foreground text-lg italic leading-relaxed">
                                                                        "{def.example}"
                                                                    </p>
                                                                    <div className="mt-2">
                                                                        <TranslateButton text={def.example} />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {(def.synonyms.length > 0 || def.antonyms.length > 0) && (
                                                                <div className="flex flex-col gap-3 pt-2">
                                                                    {def.synonyms.length > 0 && (
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Synonyms</span>
                                                                            <div className="flex flex-wrap gap-1.5">
                                                                                {def.synonyms.slice(0, 4).map((syn, sIdx) => (
                                                                                    <button
                                                                                        key={sIdx}
                                                                                        onClick={() => {
                                                                                            setSearchQuery(syn);
                                                                                            searchWord(syn);
                                                                                        }}
                                                                                        className="text-xs font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                                                                    >
                                                                                        {syn}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {def.antonyms.length > 0 && (
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Antonyms</span>
                                                                            <div className="flex flex-wrap gap-1.5">
                                                                                {def.antonyms.slice(0, 4).map((ant, aIdx) => (
                                                                                    <button
                                                                                        key={aIdx}
                                                                                        onClick={() => {
                                                                                            setSearchQuery(ant);
                                                                                            searchWord(ant);
                                                                                        }}
                                                                                        className="text-xs font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                                                    >
                                                                                        {ant}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Minimal Footer origin if exists */}
                            {result.origin && (
                                <div className="p-6 md:p-8 bg-zinc-50 dark:bg-zinc-800/20 border-t border-border/40">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Word Origin</p>
                                    <p className="text-sm text-foreground/70 italic leading-relaxed">
                                        {result.origin}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
