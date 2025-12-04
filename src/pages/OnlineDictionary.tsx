import { useState } from "react";
import { ArrowLeft, Search, Volume2, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import TranslateButton from "@/components/TranslateButton";

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

export default function OnlineDictionary() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DictionaryEntry | null>(null);
    const [error, setError] = useState<string | null>(null);

    const searchWord = async (word: string) => {
        if (!word.trim()) {
            toast.error("Please enter a word to search");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const baseUrl = import.meta.env.VITE_DICTIONARY_API;
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

        } catch (err) {
            setError("Network error. Please check your connection.");
            console.error("Dictionary API error:", err);
        } finally {
            setLoading(false);
        }

    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchWord(searchQuery);
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
        <div className="min-h-screen bg-background flex flex-col pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg">
                {/* Search Bar */}
                <div className="p-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for a word..."
                            className="flex-1 bg-white text-foreground h-12 text-base"
                        />
                        <Button
                            type="submit"
                            size="lg"
                            disabled={loading}
                            className="bg-white text-primary hover:bg-white/90 h-12 px-6"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Search className="h-5 w-5" />
                            )}
                        </Button>
                    </form>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-4 space-y-4 max-w-4xl mx-auto w-full">
                {/* Error State */}
                {error && (
                    <Card className="p-6 border-destructive/50 bg-destructive/5">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-destructive">Not Found</h3>
                                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Result */}
                {result && (
                    <div className="space-y-4">
                        {/* Word Header */}
                        <Card className="overflow-hidden">
                            <div className="bg-gradient-to-r from-primary/10 to-blue-50 dark:from-primary/5 dark:to-blue-950/20 p-6 border-b">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex flex-col gap-2 w-full">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h2 className="text-3xl font-bold text-primary mb-2">
                                                {result.word}
                                            </h2>
                                            <TranslateButton text={`${result.word}: ${result.meanings[0]?.definitions[0]?.definition || ''}`} />
                                        </div>
                                        {result.phonetic && (
                                            <p className="text-lg text-muted-foreground font-mono">
                                                /{result.phonetic}/
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {result.phonetics.find(p => p.audio) && (
                                            <Button
                                                size="lg"
                                                variant="secondary"
                                                className="shrink-0"
                                                onClick={() => {
                                                    const audioPhonetic = result.phonetics.find(p => p.audio);
                                                    if (audioPhonetic?.audio) {
                                                        playAudio(audioPhonetic.audio);
                                                    }
                                                }}
                                            >
                                                <Volume2 className="h-5 w-5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* All Phonetics */}
                                {result.phonetics.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {result.phonetics.map((phonetic, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                {phonetic.text && (
                                                    <Badge variant="outline" className="font-mono">
                                                        {phonetic.text}
                                                    </Badge>
                                                )}
                                                {phonetic.audio && (
                                                    <button
                                                        onClick={() => playAudio(phonetic.audio!)}
                                                        className="text-primary hover:text-primary/80"
                                                        title="Play pronunciation"
                                                    >
                                                        <Volume2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Origin */}
                            {result.origin && (
                                <div className="p-6 border-b bg-muted/30">
                                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">
                                        Origin
                                    </h3>
                                    <p className="text-sm leading-relaxed">{result.origin}</p>
                                </div>
                            )}
                        </Card>

                        {/* Meanings */}
                        {result.meanings.map((meaning, idx) => (
                            <Card key={idx} className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    <Badge className="text-sm">{meaning.partOfSpeech}</Badge>
                                </div>

                                <div className="space-y-4">
                                    {meaning.definitions.map((def, defIdx) => (
                                        <div key={defIdx} className="pl-4 border-l-2 border-primary/20">
                                            <div className="font-medium leading-relaxed mb-2">
                                                <span className="mr-2">{defIdx + 1}. {def.definition}</span>
                                                <TranslateButton text={def.definition} className="inline-block align-middle" />
                                            </div>

                                            {def.example && (
                                                <div className="mt-2 p-3 bg-muted/50 rounded-lg border-l-2 border-blue-500">
                                                    <div className="text-sm italic text-muted-foreground">
                                                        "{def.example}"
                                                        <TranslateButton text={def.example} className="ml-2 inline-block align-middle scale-90" />
                                                    </div>
                                                </div>
                                            )}

                                            {def.synonyms.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                                                        Synonyms
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {def.synonyms.map((syn, synIdx) => (
                                                            <Badge
                                                                key={synIdx}
                                                                variant="secondary"
                                                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                                                onClick={() => {
                                                                    setSearchQuery(syn);
                                                                    searchWord(syn);
                                                                }}
                                                            >
                                                                {syn}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {def.antonyms.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                                                        Antonyms
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {def.antonyms.map((ant, antIdx) => (
                                                            <Badge
                                                                key={antIdx}
                                                                variant="outline"
                                                                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                                                onClick={() => {
                                                                    setSearchQuery(ant);
                                                                    searchWord(ant);
                                                                }}
                                                            >
                                                                {ant}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !result && !error && (
                    <Card className="p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Search for a Word</h3>
                            <p className="text-muted-foreground">
                                Enter any English word to get its definition, pronunciation, examples, and more.
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
