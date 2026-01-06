import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useVocabularies, useVocabularyMutations } from "@/hooks/useVocabularies";
import { Vocabulary } from "@/types/vocabulary";
import { useResourcesSimple } from "@/hooks/useResources";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    ArrowLeft,
    Wand2,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Search,
    Filter,
    Layers,
    Bot,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import PARTS_OF_SPEECH from "@/data/partOfSpeech.json";
import { enhanceVocabulary } from "@/services/enhanceVocabularyService";

interface EnhancementResult {
    id: string;
    english: string;
    status: "pending" | "processing" | "success" | "error";
    error?: string;
    enhanced?: Partial<Vocabulary>;
}

type FilterType = "all" | "missing-verb" | "missing-synonyms" | "missing-antonyms" | "missing-examples" | "missing-related" | "missing-pronunciation" | "missing-explanation";

export default function AiEnhancementStudio() {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const { data: vocabularies = [], isLoading } = useVocabularies();
    const { updateVocabulary } = useVocabularyMutations();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<FilterType>("all");
    const [filterPos, setFilterPos] = useState<string>("all");
    const [selectedVocabs, setSelectedVocabs] = useState<Set<string>>(new Set());
    const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set(["all"]));
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<EnhancementResult[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [previewVocab, setPreviewVocab] = useState<Vocabulary | null>(null);
    const [enhancedData, setEnhancedData] = useState<Partial<Vocabulary> | null>(null);

    // Resource data for stats
    const { data: resources = [], isLoading: isLoadingResources } = useResourcesSimple();

    const hasMissingFields = useCallback((vocab: Vocabulary) => {
        const missing = [];
        if (vocab.partOfSpeech === "Verb" && !vocab.verbForms) missing.push("verbForms");
        if (!vocab.synonyms || vocab.synonyms.length < 3) missing.push("synonyms");
        if (!vocab.antonyms || vocab.antonyms.length < 3) missing.push("antonyms");
        if (!vocab.examples || vocab.examples.length === 0) missing.push("examples");
        if (!vocab.relatedWords || vocab.relatedWords.length === 0) missing.push("relatedWords");
        if (!vocab.pronunciation || vocab.pronunciation.trim() === "") missing.push("pronunciation");
        if (!vocab.explanation || vocab.explanation.length < 50) missing.push("explanation");
        return missing.length > 0;
    }, []);

    if (!user || !isAdmin) {
        navigate("/");
        return null;
    }

    const filterVocabularies = () => {
        let filtered = vocabularies;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(v =>
                v.english.toLowerCase().includes(query) ||
                v.bangla.toLowerCase().includes(query)
            );
        }

        if (filterPos !== "all") {
            filtered = filtered.filter(v => v.partOfSpeech === filterPos);
        }

        if (filterType === "missing-verb") filtered = filtered.filter(v => v.partOfSpeech === "Verb" && !v.verbForms);
        else if (filterType === "missing-synonyms") filtered = filtered.filter(v => !v.synonyms || v.synonyms.length < 3);
        else if (filterType === "missing-antonyms") filtered = filtered.filter(v => !v.antonyms || v.antonyms.length < 3);
        else if (filterType === "missing-examples") filtered = filtered.filter(v => !v.examples || v.examples.length === 0);
        else if (filterType === "missing-related") filtered = filtered.filter(v => !v.relatedWords || v.relatedWords.length === 0);
        else if (filterType === "missing-pronunciation") filtered = filtered.filter(v => !v.pronunciation || v.pronunciation.trim() === "");
        else if (filterType === "missing-explanation") filtered = filtered.filter(v => !v.explanation || v.explanation.length < 50);
        else if (filterType === "all") filtered = filtered.filter(v => hasMissingFields(v));

        return filtered;
    };

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedVocabs);
        if (newSelection.has(id)) newSelection.delete(id);
        else newSelection.add(id);
        setSelectedVocabs(newSelection);
    };

    const selectAll = () => {
        const filtered = filterVocabularies();
        setSelectedVocabs(new Set(filtered.map(v => v.id)));
    };

    const clearSelection = () => setSelectedVocabs(new Set());

    const handleEnhanceSelected = async () => {
        if (selectedVocabs.size === 0) {
            toast.error("Please select vocabularies to enhance");
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setResults([]);

        const selected = vocabularies.filter(v => selectedVocabs.has(v.id));
        const newResults: EnhancementResult[] = selected.map(v => ({
            id: v.id,
            english: v.english,
            status: "pending",
        }));
        setResults(newResults);

        for (let i = 0; i < selected.length; i++) {
            const vocab = selected[i];
            setResults(prev => prev.map(r => r.id === vocab.id ? { ...r, status: "processing" } : r));

            try {
                const fieldsToEnhance = selectedFields.has("all") ? undefined : Array.from(selectedFields);
                const enhanced = await enhanceVocabulary(vocab, undefined, fieldsToEnhance);
                await updateVocabulary.mutateAsync({ id: vocab.id, data: enhanced });
                setResults(prev => prev.map(r => r.id === vocab.id ? { ...r, status: "success", enhanced } : r));
            } catch (error) {
                console.error(`Error enhancing ${vocab.english}:`, error);
                setResults(prev => prev.map(r => r.id === vocab.id ? { ...r, status: "error", error: error instanceof Error ? error.message : "Unknown error" } : r));
            }
            setProgress(((i + 1) / selected.length) * 100);
        }

        setIsProcessing(false);
        toast.success(`Enhanced ${selected.length} vocabularies!`);
    };

    const handlePreviewEnhancement = async (vocab: Vocabulary) => {
        setPreviewVocab(vocab);
        setEnhancedData(null);
        setShowPreview(true);

        try {
            const fieldsToEnhance = selectedFields.has("all") ? undefined : Array.from(selectedFields);
            const enhanced = await enhanceVocabulary(vocab, undefined, fieldsToEnhance);
            setEnhancedData(enhanced);
        } catch (error) {
            console.error("Error generating preview:", error);
            toast.error("Failed to generate preview");
            setShowPreview(false);
        }
    };

    const handleApplyPreview = async () => {
        if (!previewVocab || !enhancedData) return;
        try {
            await updateVocabulary.mutateAsync({ id: previewVocab.id, data: enhancedData });
            toast.success("Vocabulary enhanced successfully!");
            setShowPreview(false);
        } catch (error) {
            console.error("Error applying enhancement:", error);
            toast.error("Failed to apply enhancement");
        }
    };

    const filteredVocabs = filterVocabularies();

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-background border-b sticky top-0 z-30 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-background/80"
            >
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent flex items-center gap-2">
                            <Bot className="h-6 w-6 text-primary" />
                            AI Enhancement Studio
                        </h1>
                        <p className="text-xs font-medium text-muted-foreground">Automated Vocabulary Enrichment</p>
                    </div>
                </div>
                {isProcessing && (
                    <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-full border">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm font-medium">Processing... {Math.round(progress)}%</span>
                    </div>
                )}
            </motion.header>

            <div className="max-w-[1600px] mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">

                    {/* LEFT COLUMN: Controls & Config (4 cols) */}
                    <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                        {/* 1. Filters */}
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-secondary/5">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-primary" />
                                    Filter Vocabularies
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Search Term</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search english or bangla..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 bg-background/50 border-input/50 focus:bg-background transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Part of Speech</Label>
                                        <Select value={filterPos} onValueChange={setFilterPos}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                {PARTS_OF_SPEECH.map(pos => <SelectItem key={pos} value={pos}>{pos}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Missing Field</Label>
                                        <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Any Incomplete</SelectItem>
                                                <SelectItem value="missing-explanation">Explanation</SelectItem>
                                                <SelectItem value="missing-examples">Examples</SelectItem>
                                                <SelectItem value="missing-synonyms">Synonyms</SelectItem>
                                                <SelectItem value="missing-antonyms">Antonyms</SelectItem>
                                                <SelectItem value="missing-verb">Verb Forms</SelectItem>
                                                <SelectItem value="missing-related">Related Words</SelectItem>
                                                <SelectItem value="missing-pronunciation">Pronunciation</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                        {/* 2. Enhancement Config */}
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5 ring-1 ring-primary/10">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-primary" />
                                    Configure Enhancement
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">Select fields to regenerate using the AI model.</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${selectedFields.has("all") ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"}`}>
                                        <input type="checkbox" checked={selectedFields.has("all")} onChange={(e) => e.target.checked ? setSelectedFields(new Set(["all"])) : setSelectedFields(new Set())} className="hidden" />
                                        <span className="text-xs font-bold">● All Fields</span>
                                    </label>
                                    {[
                                        { id: "explanation", label: "Explanation" },
                                        { id: "examples", label: "Examples" },
                                        { id: "synonyms", label: "Synonyms" },
                                        { id: "antonyms", label: "Antonyms" },
                                        { id: "verbForms", label: "Verb Forms" },
                                        { id: "relatedWords", label: "Related Words" },
                                        { id: "pronunciation", label: "Pronunciation" },
                                    ].map(field => (
                                        <label key={field.id} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${selectedFields.has(field.id) ? "bg-primary/10 border-primary/50 text-foreground" : "hover:bg-accent"}`}>
                                            <input type="checkbox" checked={selectedFields.has(field.id)} onChange={(e) => {
                                                const newFields = new Set(selectedFields);
                                                newFields.delete("all");
                                                if (e.target.checked) newFields.add(field.id);
                                                else newFields.delete(field.id);
                                                setSelectedFields(newFields);
                                            }} className="hidden" />
                                            <span className="text-xs font-medium">{field.label}</span>
                                        </label>
                                    ))}
                                </div>
                                <Button
                                    onClick={handleEnhanceSelected}
                                    disabled={selectedVocabs.size === 0 || isProcessing}
                                    className="w-full font-bold shadow-md shadow-primary/20"
                                >
                                    <Wand2 className="h-4 w-4 mr-2" />
                                    Enhance {selectedVocabs.size > 0 ? `${selectedVocabs.size} Selected` : "Selected"}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Process Monitor */}
                        <AnimatePresence>
                            {results.length > 0 && <Card className="border-0 shadow-inner bg-muted/30">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold">Live Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 text-xs">
                                        {results.map((r, i) => (
                                            <div key={i} className="flex items-center justify-between p-2 rounded bg-background border">
                                                <span>{r.english}</span>
                                                {r.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                                                {r.status === 'success' && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                                                {r.status === 'error' && <AlertCircle className="h-3 w-3 text-destructive" />}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>}
                        </AnimatePresence>
                    </div>

                    {/* RIGHT COLUMN: List (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col h-full bg-card/50 rounded-xl border overflow-hidden shadow-sm">
                        <div className="p-4 border-b flex items-center justify-between bg-card">
                            <div>
                                <h2 className="font-bold text-lg">Vocabulary List</h2>
                                <p className="text-xs text-muted-foreground">Showing {filteredVocabs.length} items requiring attention</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={selectAll} className="text-xs">Select All</Button>
                                <Button variant="ghost" size="sm" onClick={clearSelection} className="text-xs">Clear</Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {filteredVocabs.map((vocab) => {
                                const missingCount = [
                                    vocab.partOfSpeech === "Verb" && !vocab.verbForms,
                                    !vocab.synonyms || vocab.synonyms.length < 3,
                                    !vocab.antonyms || vocab.antonyms.length < 3,
                                    !vocab.examples || vocab.examples.length === 0,
                                    !vocab.relatedWords || vocab.relatedWords.length === 0,
                                    !vocab.pronunciation || vocab.pronunciation.trim() === "",
                                    !vocab.explanation || vocab.explanation.length < 50
                                ].filter(Boolean).length;

                                return (
                                    <div key={vocab.id} className={`group relative p-4 rounded-xl border transition-all ${selectedVocabs.has(vocab.id) ? "bg-primary/5 border-primary/30" : "hover:border-primary/30 hover:shadow-md bg-card"}`}>
                                        <div className="flex items-start gap-4">
                                            <div className="pt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedVocabs.has(vocab.id)}
                                                    onChange={() => toggleSelection(vocab.id)}
                                                    className="w-5 h-5 rounded border-primary/50 text-primary focus:ring-primary cursor-pointer"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-bold">{vocab.english}</h3>
                                                    <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">{vocab.partOfSpeech}</Badge>
                                                    {missingCount > 0 && <Badge variant="destructive" className="text-[10px] h-5 rounded-full px-2">{missingCount} Issues</Badge>}
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-3">{vocab.bangla}</p>

                                                <div className="flex flex-wrap gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {(vocab.partOfSpeech === "Verb" && !vocab.verbForms) && <Badge variant="secondary" className="text-[10px] bg-red-50 text-red-600 border-red-100">Verb Forms</Badge>}
                                                    {(!vocab.synonyms || vocab.synonyms.length < 3) && <Badge variant="secondary" className="text-[10px] bg-orange-50 text-orange-600 border-orange-100">Synonyms</Badge>}
                                                    {(!vocab.examples || vocab.examples.length === 0) && <Badge variant="secondary" className="text-[10px] bg-yellow-50 text-yellow-600 border-yellow-100">Examples</Badge>}
                                                    {(!vocab.explanation || vocab.explanation.length < 50) && <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-600 border-blue-100">Explanation</Badge>}
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handlePreviewEnhancement(vocab)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                            >
                                                Preview
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredVocabs.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                    <CheckCircle2 className="h-12 w-12 mb-3 text-green-500/50" />
                                    <p className="font-medium">All valid! No missing fields found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-card to-secondary/10">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Bot className="h-5 w-5 text-primary" />
                            AI Enhancement Preview
                        </DialogTitle>
                        <DialogDescription>
                            Review generated content for <span className="font-bold text-foreground">{previewVocab?.english}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 bg-muted/5 space-y-4">
                        {!enhancedData ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                                    <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground animate-pulse">Consulting AI Model...</p>
                            </div>
                        ) : Object.keys(enhancedData).length === 0 ? (
                            <div className="text-center py-20">
                                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                <p className="text-lg font-bold">Perfect!</p>
                                <p className="text-muted-foreground">No missing fields detected for this item.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(enhancedData).map(([key, value]) => (
                                    <motion.div
                                        key={key}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-card rounded-xl border shadow-sm overflow-hidden"
                                    >
                                        <div className="bg-muted/30 px-4 py-2 border-b flex items-center gap-2">
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase text-[10px] tracking-wider font-bold">New Content</Badge>
                                            <span className="font-mono text-xs font-semibold uppercase text-muted-foreground">{key}</span>
                                        </div>
                                        <div className="p-0">
                                            <textarea
                                                value={JSON.stringify(value, null, 2)}
                                                onChange={(e) => {
                                                    try {
                                                        const parsed = JSON.parse(e.target.value);
                                                        setEnhancedData(prev => prev ? { ...prev, [key]: parsed } : { [key]: parsed });
                                                    } catch { }
                                                }}
                                                className="w-full h-full min-h-[120px] p-4 bg-transparent font-mono text-sm resize-y focus:outline-none focus:bg-primary/5 transition-colors"
                                                spellCheck={false}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-4 border-t bg-card">
                        <Button variant="outline" onClick={() => setShowPreview(false)}>Cancel</Button>
                        <Button
                            onClick={handleApplyPreview}
                            disabled={!enhancedData || Object.keys(enhancedData).length === 0 || updateVocabulary.isPending}
                            className="bg-green-600 hover:bg-green-700 font-bold shadow-lg shadow-green-600/20"
                        >
                            {updateVocabulary.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Apply Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
