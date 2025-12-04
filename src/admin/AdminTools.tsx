import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useVocabularies, useVocabularyMutations } from "@/hooks/useVocabularies";
import { Vocabulary } from "@/types/vocabulary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    Sparkles,
    Search,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
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
import { testDexieDatabase } from "@/lib/dexieTest";


interface EnhancementResult {
    id: string;
    english: string;
    status: "pending" | "processing" | "success" | "error";
    error?: string;
    enhanced?: Partial<Vocabulary>;
}

type FilterType = "all" | "missing-verb" | "missing-synonyms" | "missing-antonyms" | "missing-examples" | "missing-related" | "missing-pronunciation" | "missing-explanation";

export default function AdminTools() {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const { data: vocabularies = [], isLoading } = useVocabularies();
    const { updateVocabulary } = useVocabularyMutations();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<FilterType>("all");
    const [filterPos, setFilterPos] = useState<string>("all");
    const [selectedVocabs, setSelectedVocabs] = useState<Set<string>>(new Set());
    const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set(["all"])); // Fields to enhance
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<EnhancementResult[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [previewVocab, setPreviewVocab] = useState<Vocabulary | null>(null);
    const [enhancedData, setEnhancedData] = useState<Partial<Vocabulary> | null>(null);

    if (!user || !isAdmin) {
        navigate("/");
        return null;
    }



    const handleTestDatabase = async () => {
        const toastId = toast.loading("Testing Dexie database...");
        try {
            const success = await testDexieDatabase();
            if (success) {
                toast.success("Database test passed! Check console for details.", { id: toastId });
            } else {
                toast.error("Database test failed. Check console for details.", { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during the test.", { id: toastId });
        }
    };

    // Helper function to check if vocabulary has missing fields
    const hasMissingFields = (vocab: Vocabulary) => {
        const missing = [];

        // Check verb forms (only for verbs)
        if (vocab.partOfSpeech === "Verb" && !vocab.verbForms) {
            missing.push("verbForms");
        }

        // Check synonyms
        if (!vocab.synonyms || vocab.synonyms.length < 3) {
            missing.push("synonyms");
        }

        // Check antonyms
        if (!vocab.antonyms || vocab.antonyms.length < 3) {
            missing.push("antonyms");
        }

        // Check examples
        if (!vocab.examples || vocab.examples.length === 0) {
            missing.push("examples");
        }

        // Check related words
        if (!vocab.relatedWords || vocab.relatedWords.length === 0) {
            missing.push("relatedWords");
        }

        // Check pronunciation
        if (!vocab.pronunciation || vocab.pronunciation.trim() === "") {
            missing.push("pronunciation");
        }

        // Check explanation
        if (!vocab.explanation || vocab.explanation.length < 50) {
            missing.push("explanation");
        }

        return missing.length > 0;
    };

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

        if (filterType === "missing-verb") {
            filtered = filtered.filter(v =>
                v.partOfSpeech === "Verb" && !v.verbForms
            );
        } else if (filterType === "missing-synonyms") {
            filtered = filtered.filter(v => !v.synonyms || v.synonyms.length < 3);
        } else if (filterType === "missing-antonyms") {
            filtered = filtered.filter(v => !v.antonyms || v.antonyms.length < 3);
        } else if (filterType === "missing-examples") {
            filtered = filtered.filter(v => !v.examples || v.examples.length === 0);
        } else if (filterType === "missing-related") {
            filtered = filtered.filter(v => !v.relatedWords || v.relatedWords.length === 0);
        } else if (filterType === "missing-pronunciation") {
            filtered = filtered.filter(v => !v.pronunciation || v.pronunciation.trim() === "");
        } else if (filterType === "missing-explanation") {
            filtered = filtered.filter(v => !v.explanation || v.explanation.length < 50);
        } else if (filterType === "all") {
            // When "all" is selected, only show vocabularies with at least one missing field
            filtered = filtered.filter(v => hasMissingFields(v));
        }

        return filtered;
    };

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedVocabs);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedVocabs(newSelection);
    };

    const selectAll = () => {
        const filtered = filterVocabularies();
        setSelectedVocabs(new Set(filtered.map(v => v.id)));
    };

    const clearSelection = () => {
        setSelectedVocabs(new Set());
    };
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

            setResults(prev => prev.map(r =>
                r.id === vocab.id ? { ...r, status: "processing" } : r
            ));

            try {
                const fieldsToEnhance = selectedFields.has("all") ? undefined : Array.from(selectedFields);
                const enhanced = await enhanceVocabulary(vocab, undefined, fieldsToEnhance);

                await updateVocabulary.mutateAsync({
                    id: vocab.id,
                    ...enhanced,
                });

                setResults(prev => prev.map(r =>
                    r.id === vocab.id ? { ...r, status: "success", enhanced } : r
                ));
            } catch (error) {
                console.error(`Error enhancing ${vocab.english}:`, error);
                setResults(prev => prev.map(r =>
                    r.id === vocab.id ? {
                        ...r,
                        status: "error",
                        error: error instanceof Error ? error.message : "Unknown error"
                    } : r
                ));
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
            await updateVocabulary.mutateAsync({
                id: previewVocab.id,
                ...enhancedData,
            });
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
            <motion.header
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-6 pb-8"
            >
                <div className="max-w-6xl mx-auto flex justify-between items-start">
                    <div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="mb-4 text-primary-foreground hover:bg-primary-foreground/20"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-3 mb-2">
                            <Wand2 className="h-8 w-8" />
                            <h1 className="text-3xl font-bold">AI Enhancement Tools</h1>
                        </div>
                        <p className="text-primary-foreground/80">
                            Automatically enhance vocabularies with OpenAI
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleTestDatabase}
                        className="mt-4"
                    >
                        Test Database
                    </Button>
                </div>
            </motion.header>

            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {/* Filters */}
                <Card className="p-6">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold mb-1">Find Vocabularies to Enhance</h2>
                        <p className="text-sm text-muted-foreground">
                            Filter vocabularies by missing fields. Select which fields to enhance below.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <Label>Search</Label>
                            <div className="relative mt-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Part of Speech</Label>
                            <Select value={filterPos} onValueChange={setFilterPos}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {PARTS_OF_SPEECH.map((pos) => (
                                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Filter by Missing Field</Label>
                            <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Incomplete</SelectItem>
                                    <SelectItem value="missing-verb">Verb Forms</SelectItem>
                                    <SelectItem value="missing-synonyms">Synonyms</SelectItem>
                                    <SelectItem value="missing-antonyms">Antonyms</SelectItem>
                                    <SelectItem value="missing-examples">Examples</SelectItem>
                                    <SelectItem value="missing-related">Related Words</SelectItem>
                                    <SelectItem value="missing-pronunciation">Pronunciation</SelectItem>
                                    <SelectItem value="missing-explanation">Explanation</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">
                                Found {filteredVocabs.length} vocabularies • {selectedVocabs.size} selected
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {selectedFields.has("all")
                                    ? "All missing fields will be enhanced"
                                    : `Selected fields: ${Array.from(selectedFields).join(", ")}`
                                }
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
                            <Button variant="outline" size="sm" onClick={clearSelection}>Clear</Button>
                            <Button onClick={handleEnhanceSelected} disabled={selectedVocabs.size === 0 || isProcessing} size="sm">
                                <Wand2 className="h-4 w-4 mr-2" />
                                Enhance All Fields ({selectedVocabs.size})
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Field Selection */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Select Fields to Enhance</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Choose which fields you want to enhance. Only selected fields will be filled.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <label className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors">
                            <input
                                type="checkbox"
                                checked={selectedFields.has("all")}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedFields(new Set(["all"]));
                                    } else {
                                        setSelectedFields(new Set());
                                    }
                                }}
                                className="cursor-pointer"
                            />
                            <span className="text-sm font-medium">All Fields</span>
                        </label>
                        {[
                            { id: "verbForms", label: "Verb Forms" },
                            { id: "synonyms", label: "Synonyms" },
                            { id: "antonyms", label: "Antonyms" },
                            { id: "examples", label: "Examples" },
                            { id: "relatedWords", label: "Related Words" },
                            { id: "pronunciation", label: "Pronunciation" },
                            { id: "explanation", label: "Explanation" }
                        ].map(field => (
                            <label key={field.id} className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors">
                                <input
                                    type="checkbox"
                                    checked={selectedFields.has(field.id) || selectedFields.has("all")}
                                    onChange={(e) => {
                                        const newFields = new Set(selectedFields);
                                        newFields.delete("all"); // Remove "all" when individual field is selected
                                        if (e.target.checked) {
                                            newFields.add(field.id);
                                        } else {
                                            newFields.delete(field.id);
                                        }
                                        setSelectedFields(newFields);
                                    }}
                                    disabled={selectedFields.has("all")}
                                    className="cursor-pointer"
                                />
                                <span className="text-sm">{field.label}</span>
                            </label>
                        ))}
                    </div>
                </Card>


                {/* Progress and Results */}
                {(isProcessing || results.length > 0) && (
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                                {isProcessing ? "Processing..." : "Enhancement Complete"}
                            </span>
                            {isProcessing && (
                                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                            )}
                        </div>
                        {isProcessing && <Progress value={progress} className="mb-4" />}

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {results.map((result) => (
                                <motion.div
                                    key={result.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-lg border bg-card"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm">{result.english}</span>
                                                {result.status === "pending" && <Badge variant="secondary" className="text-xs">Pending</Badge>}
                                                {result.status === "processing" && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                        Processing
                                                    </Badge>
                                                )}
                                                {result.status === "success" && (
                                                    <Badge variant="default" className="bg-green-500 text-xs">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Success
                                                    </Badge>
                                                )}
                                                {result.status === "error" && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        Error
                                                    </Badge>
                                                )}
                                            </div>

                                            {result.status === "success" && result.enhanced && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {Object.keys(result.enhanced).map((field) => (
                                                        <Badge key={field} variant="outline" className="text-xs bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                                                            ✓ {field}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            {result.status === "error" && result.error && (
                                                <p className="text-xs text-destructive mt-1">{result.error}</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {!isProcessing && results.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {results.filter(r => r.status === "success").length} succeeded, {results.filter(r => r.status === "error").length} failed
                                    </span>
                                    <Button variant="outline" size="sm" onClick={() => setResults([])}>
                                        Clear Results
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                )}


                {/* Vocabulary List */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Vocabularies</h2>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {filteredVocabs.map((vocab) => (
                            <div key={vocab.id} className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={selectedVocabs.has(vocab.id)}
                                    onChange={() => toggleSelection(vocab.id)}
                                    className="mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold">{vocab.english}</h3>
                                        <Badge variant="outline" className="text-xs">{vocab.partOfSpeech}</Badge>
                                        {(() => {
                                            const missingCount = [
                                                vocab.partOfSpeech === "Verb" && !vocab.verbForms,
                                                !vocab.synonyms || vocab.synonyms.length < 3,
                                                !vocab.antonyms || vocab.antonyms.length < 3,
                                                !vocab.examples || vocab.examples.length === 0,
                                                !vocab.relatedWords || vocab.relatedWords.length === 0,
                                                !vocab.pronunciation || vocab.pronunciation.trim() === "",
                                                !vocab.explanation || vocab.explanation.length < 50
                                            ].filter(Boolean).length;

                                            if (missingCount > 0) {
                                                return (
                                                    <Badge variant="secondary" className="text-xs bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300">
                                                        {missingCount} field{missingCount > 1 ? 's' : ''} to enhance
                                                    </Badge>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">{vocab.bangla}</p>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {vocab.partOfSpeech === "Verb" && !vocab.verbForms && (
                                            <Badge variant="destructive" className="text-xs">Missing Verb Forms</Badge>
                                        )}
                                        {(!vocab.synonyms || vocab.synonyms.length < 3) && (
                                            <Badge variant="destructive" className="text-xs">Missing Synonyms</Badge>
                                        )}
                                        {(!vocab.antonyms || vocab.antonyms.length < 3) && (
                                            <Badge variant="destructive" className="text-xs">Missing Antonyms</Badge>
                                        )}
                                        {(!vocab.examples || vocab.examples.length === 0) && (
                                            <Badge variant="destructive" className="text-xs">Missing Examples</Badge>
                                        )}
                                        {(!vocab.relatedWords || vocab.relatedWords.length === 0) && (
                                            <Badge variant="secondary" className="text-xs">No Related Words</Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handlePreviewEnhancement(vocab)} disabled={isProcessing}>
                                        <Wand2 className="h-3 w-3 mr-1" />
                                        Enhance All Missing
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Enhanced Preview Dialog with Editing */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Enhancement Preview</DialogTitle>
                        <DialogDescription>Review and edit AI-generated enhancements before applying</DialogDescription>
                    </DialogHeader>

                    {previewVocab && (
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            <div className="sticky top-0 bg-background pb-3 border-b">
                                <h3 className="font-semibold text-lg">{previewVocab.english}</h3>
                                <p className="text-muted-foreground text-sm">{previewVocab.bangla} • {previewVocab.partOfSpeech}</p>
                            </div>

                            {!enhancedData ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                                    <p className="text-sm text-muted-foreground">Generating enhancements...</p>
                                </div>
                            ) : Object.keys(enhancedData).length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-lg font-medium mb-2">Already Complete!</p>
                                    <p className="text-sm text-muted-foreground">This vocabulary has all fields filled.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(enhancedData).map(([key, value]) => (
                                        <motion.div
                                            key={key}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 rounded-lg border bg-card"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <Label className="text-green-600 font-medium capitalize">{key}</Label>
                                            </div>
                                            <textarea
                                                value={JSON.stringify(value, null, 2)}
                                                onChange={(e) => {
                                                    try {
                                                        const parsed = JSON.parse(e.target.value);
                                                        setEnhancedData(prev => prev ? { ...prev, [key]: parsed } : { [key]: parsed });
                                                    } catch {
                                                        // Invalid JSON, don't update
                                                    }
                                                }}
                                                className="w-full p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded text-sm font-mono resize-y min-h-[100px]"
                                                spellCheck={false}
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">Edit the JSON above to customize this field</p>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="border-t pt-4">
                        <Button variant="outline" onClick={() => setShowPreview(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApplyPreview}
                            disabled={!enhancedData || Object.keys(enhancedData).length === 0 || updateVocabulary.isPending}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {updateVocabulary.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Applying...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Apply Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
