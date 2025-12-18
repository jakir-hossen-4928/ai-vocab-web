import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { collection, writeBatch, doc } from "firebase/firestore"; // Restored
import { db } from "@/lib/firebase"; // Restored
import { useAuth } from "@/contexts/AuthContext";
import { Vocabulary, VerbForms, RelatedWord } from "@/types/vocabulary";
import { dexieService } from "@/lib/dexieDb"; // Restored
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, Upload, FileJson, FileSpreadsheet, CheckCircle2, AlertCircle, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert as UIAlert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useVocabularies } from "@/hooks/useVocabularies"; // Restored
import { checkBulkVocabularyDuplicates, getDuplicateStats, filterNonDuplicates } from "@/utils/vocabularyDuplicateChecker"; // Restored

interface BulkVocabulary {
    english: string;
    bangla: string;
    partOfSpeech?: string;
    pronunciation?: string;
    explanation?: string;
    synonyms?: string[];
    antonyms?: string[];
    examples?: { en: string; bn: string }[];
    verbForms?: VerbForms;
    relatedWords?: RelatedWord[];
}

const TEMPLATE_DATA = [
    {
        "english": "Write",
        "bangla": "লেখা",
        "partOfSpeech": "Verb",
        "pronunciation": "us: BD:রাইট",
        "explanation": "Mark (letters, words, or other symbols) on a surface, typically paper, with a pen, pencil, or similar implement.",
        "synonyms": ["inscribe", "pen", "record", "draft", "compose"],
        "antonyms": ["read", "erase"],
        "examples": [{ "en": "He wrote a very famous book.", "bn": "সে একটি খুব বিখ্যাত বই লিখেছিল।" }],
        "verbForms": { "base": "write", "v2": "wrote", "v3": "written", "ing": "writing", "s_es": "writes" },
        "relatedWords": [{ "word": "writer", "partOfSpeech": "Noun", "meaning": "লেখক", "example": "She is a famous writer." }]
    }
];


// Supabase sync removed: data is persisted to Firebase and cached in Dexie only.

const parseCSV = (csv: string): BulkVocabulary[] => {
    const lines = csv.trim().split("\n");
    if (lines.length < 2) throw new Error("CSV must have at least a header row and one data row");

    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
    const data: BulkVocabulary[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, ""));

        if (cleanValues.length === 0) continue;

        const row: any = {};
        headers.forEach((header, index) => {
            const value = cleanValues[index] || "";
            if (header === "synonyms" || header === "antonyms") {
                row[header] = value ? value.split(";").map(s => s.trim()).filter(Boolean) : [];
            } else if (header === "examples_en" || header === "examples_bn") {
                if (!row.examples) row.examples = [];
                if (header === "examples_en" && value) {
                    row.examples.push({ en: value, bn: "" });
                } else if (header === "examples_bn" && value && row.examples.length > 0) {
                    row.examples[row.examples.length - 1].bn = value;
                }
            } else {
                row[header] = value;
            }
        });

        if (row.english && row.bangla) {
            data.push(row);
        }
    }
    return data;
};

const validateVocabulary = (vocab: BulkVocabulary): string | null => {
    if (!vocab.english || !vocab.bangla) {
        return "English and Bangla fields are required";
    }
    if (vocab.english.trim().length === 0 || vocab.bangla.trim().length === 0) {
        return "English and Bangla cannot be empty";
    }
    return null;
};

export default function BulkAddVocabulary() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: existingVocabularies = [] } = useVocabularies();

    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResults, setUploadResults] = useState<any>(null);
    const [jsonInput, setJsonInput] = useState("");
    const [csvInput, setCsvInput] = useState("");
    const [validationPreview, setValidationPreview] = useState<any>(null);

    const handleBulkUpload = async (vocabularies: BulkVocabulary[]) => {
        if (vocabularies.length === 0) {
            toast.error("No valid vocabularies to upload");
            return;
        }

        setLoading(true);
        setUploadProgress(0);
        setUploadResults(null);

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[],
        };

        const successfulVocabs: Vocabulary[] = [];

        try {
            const batch = writeBatch(db);
            const timestamp = new Date().toISOString();

            // 1. Prepare Firebase Batch and Valid Data
            for (let i = 0; i < vocabularies.length; i++) {
                const vocab = vocabularies[i];
                const error = validateVocabulary(vocab);

                if (error) {
                    results.failed++;
                    results.errors.push(`Row ${i + 1}: ${error}`);
                    continue;
                }

                try {
                    const docRef = doc(collection(db, "vocabularies"));
                    const data: Omit<Vocabulary, "id"> = {
                        english: vocab.english.trim(),
                        bangla: vocab.bangla.trim(),
                        partOfSpeech: vocab.partOfSpeech || "",
                        pronunciation: vocab.pronunciation || "",
                        explanation: vocab.explanation || "",
                        synonyms: vocab.synonyms || [],
                        antonyms: vocab.antonyms || [],
                        examples: vocab.examples || [],
                        userId: user!.uid,
                        createdAt: timestamp,
                        updatedAt: timestamp,
                    };

                    const isVerb = vocab.partOfSpeech?.toLowerCase().includes("verb");
                    if (isVerb && vocab.verbForms) {
                        data.verbForms = vocab.verbForms;
                    }

                    if (vocab.relatedWords && vocab.relatedWords.length > 0) {
                        data.relatedWords = vocab.relatedWords;
                    }

                    // Add to Firebase batch
                    batch.set(docRef, data);

                    // Add to local success list for Dexie and Supabase
                    successfulVocabs.push({ id: docRef.id, ...data } as Vocabulary);
                    results.success++;
                } catch (err) {
                    results.failed++;
                    results.errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : "Unknown error"}`);
                }
                setUploadProgress(((i + 1) / vocabularies.length) * 0.5); // 50% progress for preparation
            }

            if (results.success > 0) {
                // 2. Commit to Firebase
                await batch.commit();
                console.log(`[Firebase] Batch committed ${results.success} records`);

                // 3. Update Dexie Cache
                await dexieService.addVocabularies(successfulVocabs);
                await dexieService.updateSyncMetadata('vocabularies');
                console.log(`[Dexie] Cached ${successfulVocabs.length} bulk uploaded vocabularies`);


                // Invalidate React Query cache
                await queryClient.invalidateQueries({ queryKey: ["vocabularies"] });
                toast.success(`Successfully uploaded ${results.success} vocabularies`);
            }

            if (results.failed > 0) {
                toast.error(`Failed to upload ${results.failed} vocabularies`);
            }

            setUploadResults(results);
        } catch (error) {
            console.error("Error uploading vocabularies:", error);
            toast.error("Failed to upload vocabularies");
        } finally {
            setLoading(false);
            setUploadProgress(100);
        }
    };

    const handleValidateJSON = () => {
        try {
            const data = JSON.parse(jsonInput);
            const vocabularies = Array.isArray(data) ? data : [data];
            validateAndPreview(vocabularies);
        } catch (error) {
            toast.error("Invalid JSON format");
        }
    };

    const handleValidateCSV = () => {
        try {
            const vocabularies = parseCSV(csvInput);
            validateAndPreview(vocabularies);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Invalid CSV format");
            console.error(error);
        }
    };

    const validateAndPreview = (vocabularies: BulkVocabulary[]) => {
        const errors: string[] = [];
        const validVocabs: BulkVocabulary[] = [];

        vocabularies.forEach((vocab, index) => {
            const error = validateVocabulary(vocab);
            if (error) {
                errors.push(`Row ${index + 1}: ${error}`);
            } else {
                validVocabs.push(vocab);
            }
        });

        const duplicateCheckResults = checkBulkVocabularyDuplicates(validVocabs, existingVocabularies);
        const duplicateStats = getDuplicateStats(duplicateCheckResults);
        const duplicateEntries = duplicateCheckResults.filter(r => r.isDuplicate);

        setValidationPreview({
            total: vocabularies.length,
            valid: validVocabs.length,
            invalid: errors.length,
            errors,
            vocabularies: validVocabs,
            duplicates: duplicateStats.duplicates,
            duplicateList: duplicateEntries.map(d => ({
                index: d.index,
                vocabulary: d.vocabulary as BulkVocabulary,
                duplicates: d.duplicates
            }))
        });

        if (validVocabs.length > 0) {
            const duplicateMsg = duplicateStats.duplicates > 0
                ? `, ${duplicateStats.duplicates} duplicate(s) detected`
                : "";
            toast.success(`Validation complete: ${validVocabs.length} valid, ${errors.length} invalid${duplicateMsg}`);
        } else {
            toast.error("No valid vocabularies found");
        }
    };

    const handleConfirmUpload = async () => {
        if (!validationPreview || validationPreview.valid === 0) {
            toast.error("No valid vocabularies to upload");
            return;
        }

        const duplicateCheckResults = checkBulkVocabularyDuplicates(
            validationPreview.vocabularies,
            existingVocabularies
        );
        const nonDuplicateVocabs = filterNonDuplicates(
            validationPreview.vocabularies,
            duplicateCheckResults
        );

        if (nonDuplicateVocabs.length === 0) {
            toast.error("All vocabularies are duplicates. Nothing to upload.");
            return;
        }

        if (nonDuplicateVocabs.length < validationPreview.vocabularies.length) {
            const skipped = validationPreview.vocabularies.length - nonDuplicateVocabs.length;
            toast.warning(`Skipping ${skipped} duplicates. Uploading ${nonDuplicateVocabs.length} unique items.`);
        }

        await handleBulkUpload(nonDuplicateVocabs);
        setValidationPreview(null);
    };

    const handlePaste = async (type: 'json' | 'csv') => {
        try {
            const text = await navigator.clipboard.readText();
            if (type === 'json') setJsonInput(text);
            else setCsvInput(text);
            toast.success("Pasted from clipboard!");
        } catch (err) { toast.error("Failed to read clipboard"); }
    };

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-8">
            <motion.header
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-3 sm:px-4 pt-4 sm:pt-6 md:pt-8 pb-6 sm:pb-8 md:pb-12"
            >
                <div className="max-w-5xl mx-auto">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mb-3 sm:mb-4 text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 sm:h-9 sm:w-9">
                        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <h1 className="text-xl sm:text-2xl font-bold mb-1">Bulk Add Vocabularies</h1>
                    <p className="text-primary-foreground/80 text-xs sm:text-sm">
                        Upload to Firebase & Sync to Supabase
                    </p>
                </div>
            </motion.header>

            <div className="max-w-5xl mx-auto px-3 sm:px-4 -mt-4 sm:-mt-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                    <Card className="p-3 sm:p-4 md:p-6 shadow-hover">
                        <div className="mb-4 sm:mb-6">
                            <Button
                                onClick={async () => {
                                    if (validationPreview && validationPreview.valid > 0) {
                                        await handleConfirmUpload();
                                    } else if (jsonInput.trim()) {
                                        handleValidateJSON();
                                        toast.info("Validated! Click 'Upload' to proceed.");
                                    } else if (csvInput.trim()) {
                                        handleValidateCSV();
                                        toast.info("Validated! Click 'Upload' to proceed.");
                                    } else {
                                        toast.error("Please provide data first");
                                    }
                                }}
                                disabled={loading}
                                className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold bg-primary hover:bg-primary/90"
                                size="lg"
                            >
                                <Upload className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                {loading ? "Uploading..." : "Bulk Upload Vocabularies"}
                            </Button>
                        </div>

                        <Tabs defaultValue="json" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 h-9 sm:h-10">
                                <TabsTrigger value="json" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                    <FileJson className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> JSON
                                </TabsTrigger>
                                <TabsTrigger value="csv" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                    <FileSpreadsheet className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> CSV
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex justify-end gap-2 mb-2">
                                <Button variant="outline" size="sm" onClick={() => copyTemplate("prompt")}>
                                    <Sparkles className="h-3 w-3 mr-1" /> AI Prompt
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => copyTemplate(jsonInput ? "json" : "csv")}>
                                    <Copy className="h-3 w-3 mr-1" /> Template
                                </Button>
                            </div>

                            <TabsContent value="json" className="space-y-3 sm:space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label>Paste JSON</Label>
                                    <Button variant="ghost" size="sm" onClick={() => handlePaste("json")}>Paste</Button>
                                </div>
                                <Textarea
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                    placeholder="Paste JSON array..."
                                    className="min-h-[250px] font-mono text-xs sm:text-sm"
                                />
                                <Button onClick={handleValidateJSON} disabled={loading} className="w-full" variant="secondary">
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Validate JSON
                                </Button>
                            </TabsContent>

                            <TabsContent value="csv" className="space-y-3 sm:space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label>Paste CSV</Label>
                                    <Button variant="ghost" size="sm" onClick={() => handlePaste("csv")}>Paste</Button>
                                </div>
                                <Textarea
                                    value={csvInput}
                                    onChange={(e) => setCsvInput(e.target.value)}
                                    placeholder="Paste CSV content..."
                                    className="min-h-[250px] font-mono text-xs sm:text-sm"
                                />
                                <Button onClick={handleValidateCSV} disabled={loading} className="w-full" variant="secondary">
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Validate CSV
                                </Button>
                            </TabsContent>
                        </Tabs>

                        {validationPreview && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                                <UIAlert>
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertTitle>Validation Summary</AlertTitle>
                                    <AlertDescription>
                                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                            <div>Total: {validationPreview.total}</div>
                                            <div className="text-green-600">Valid: {validationPreview.valid}</div>
                                            <div className="text-destructive">Invalid: {validationPreview.invalid}</div>
                                            {validationPreview.duplicates !== undefined && (
                                                <div className="text-yellow-600">Duplicates: {validationPreview.duplicates}</div>
                                            )}
                                        </div>
                                        {validationPreview.errors.length > 0 && (
                                            <div className="mt-2 text-xs text-destructive max-h-32 overflow-y-auto border p-2 bg-white/50 rounded">
                                                {validationPreview.errors.map((e, i) => <div key={i}>{e}</div>)}
                                            </div>
                                        )}
                                    </AlertDescription>
                                </UIAlert>
                            </motion.div>
                        )}

                        {loading && (
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Uploading...</span>
                                    <span>{Math.round(uploadProgress)}%</span>
                                </div>
                                <Progress value={uploadProgress} />
                            </div>
                        )}
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
