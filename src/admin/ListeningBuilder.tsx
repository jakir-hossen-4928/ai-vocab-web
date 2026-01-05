import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listeningService } from "@/services/listeningService";
import { ListeningTest, ListeningSection, ListeningQuestion } from "@/data/listeningData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, MoreVertical, Search, Upload, LayoutGrid, LayoutList, Music, Check, X, Wand2, ArrowLeft, FileText, ChevronLeft, ChevronRight, AlertCircle, RefreshCw, Copy } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

// --- Audio Switcher Component ---
const AudioUpdaterDialog = ({ tests, onUpdate }: { tests: ListeningTest[], onUpdate: (updates: { id: string, audioUrl: string }[]) => Promise<void> }) => {
    const [mode, setMode] = useState<'pattern' | 'json'>('pattern');
    const [pattern, setPattern] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [jsonData, setJsonData] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const preview = useMemo(() => {
        if (mode === 'pattern') {
            if (!pattern) return [];
            try {
                return tests.filter(t => t.title.toLowerCase().includes(pattern.toLowerCase()));
            } catch (e) {
                return [];
            }
        } else {
            // JSON mode preview
            try {
                const parsed = JSON.parse(jsonData);
                if (!Array.isArray(parsed)) return [];
                const ids = new Set(parsed.map((item: any) => item.id));
                return tests.filter(t => ids.has(t.id));
            } catch (e) {
                return [];
            }
        }
    }, [pattern, jsonData, tests, mode]);

    const handleApply = async () => {
        if (mode === 'pattern') {
            if (!newUrl) return toast.error("Enter a new URL");
            if (preview.length === 0) return toast.error("No tests matched");
            if (!confirm(`Update audio for ${preview.length} tests?`)) return;

            const updates = preview.map(t => ({ id: t.id, audioUrl: newUrl }));
            await onUpdate(updates);
        } else {
            // JSON mode
            try {
                const parsed = JSON.parse(jsonData);
                if (!Array.isArray(parsed)) {
                    return toast.error("JSON must be an array");
                }

                const updates = parsed.map((item: any) => ({
                    id: item.id,
                    audioUrl: item.audioUrl
                }));

                if (updates.length === 0) return toast.error("No updates found");
                if (!confirm(`Update audio for ${updates.length} tests?`)) return;

                await onUpdate(updates);
            } catch (e) {
                return toast.error("Invalid JSON format");
            }
        }

        setIsOpen(false);
        setPattern("");
        setNewUrl("");
        setJsonData("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
                    <Wand2 className="h-4 w-4 text-primary" />
                    Audio Script
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Batch Update Audio URLs</DialogTitle>
                    <DialogDescription>
                        Update audio URLs using pattern matching or JSON upload
                    </DialogDescription>
                </DialogHeader>

                {/* Mode Tabs */}
                <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg">
                    <button
                        onClick={() => setMode('pattern')}
                        className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all ${mode === 'pattern' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                            }`}
                    >
                        Pattern Match
                    </button>
                    <button
                        onClick={() => setMode('json')}
                        className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all ${mode === 'json' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                            }`}
                    >
                        JSON Upload
                    </button>
                </div>

                <div className="grid gap-4 py-4">
                    {mode === 'pattern' ? (
                        <>
                            <div className="grid gap-2">
                                <Label>Title Pattern (Case Insensitive)</Label>
                                <Input
                                    value={pattern}
                                    onChange={(e) => setPattern(e.target.value)}
                                    placeholder="e.g. Test 12"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>New Audio URL</Label>
                                <Input
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </>
                    ) : (
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label>JSON Data</Label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const sample = JSON.stringify([
                                            {
                                                id: "test-40",
                                                fileName: "test-40.ogg",
                                                audioUrl: "https://drive.google.com/file/d/1mhgIt3dVlnvaTqh8r40ALbiQ7XlEYW6l/preview"
                                            },
                                            {
                                                id: "test-39",
                                                fileName: "test-39.ogg",
                                                audioUrl: "https://drive.google.com/file/d/14R-Y_1stP5Xlzil34iYsbGxkLJZ4Rl9F/preview"
                                            }
                                        ], null, 2);
                                        navigator.clipboard.writeText(sample);
                                        toast.success("Sample format copied!");
                                    }}
                                    className="gap-2"
                                >
                                    <Plus className="h-3 w-3" /> Copy Sample
                                </Button>
                            </div>
                            <Textarea
                                value={jsonData}
                                onChange={(e) => setJsonData(e.target.value)}
                                placeholder={`[\n  {\n    "id": "test-40",\n    "fileName": "test-40.ogg",\n    "audioUrl": "https://..."\n  }\n]`}
                                className="min-h-[200px] font-mono text-xs"
                            />
                        </div>
                    )}

                    <div className="rounded-md bg-muted p-3 max-h-[150px] overflow-y-auto">
                        <p className="font-semibold mb-2 text-sm text-muted-foreground">
                            Matching Tests ({preview.length}):
                        </p>
                        {preview.length > 0 ? (
                            <div className="space-y-1">
                                {preview.slice(0, 50).map(t => (
                                    <div key={t.id} className="text-xs truncate flex items-center gap-2">
                                        <Check className="h-3 w-3 text-green-500" />
                                        <span className="font-mono text-muted-foreground">{t.id}</span>
                                        <span>-</span>
                                        <span>{t.title}</span>
                                    </div>
                                ))}
                                {preview.length > 50 && (
                                    <p className="text-xs text-muted-foreground italic pt-2">+ {preview.length - 50} more tests...</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">No tests matched</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleApply} disabled={preview.length === 0}>
                        Apply Update ({preview.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ListeningBuilder = () => {
    const queryClient = useQueryClient();
    const [selectedTest, setSelectedTest] = useState<ListeningTest | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
    const [bulkJson, setBulkJson] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [bulkConflictMode, setBulkConflictMode] = useState<'skip' | 'overwrite'>('skip');
    const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
    const ITEMS_PER_PAGE = 24;

    // Sanitization utility
    const sanitizeData = (data: any[]): any[] => {
        return data.map(test => ({
            ...test,
            title: test.title?.trim() || "",
            id: test.id?.trim() || crypto.randomUUID(),
            sections: test.sections?.map((section: any) => ({
                ...section,
                title: section.title?.trim() || "",
                instruction: section.instruction?.trim() || "",
                questions: section.questions?.map((q: any) => ({
                    ...q,
                    answer: q.answer?.trim() || "",
                    beforeInput: q.beforeInput?.trim() || "",
                    afterInput: q.afterInput?.trim() || ""
                }))
            }))
        }));
    };

    const bulkAnalysis = useMemo(() => {
        if (!isBulkUploadOpen || !bulkJson.trim()) return { valid: [], duplicates: [], errors: [] };
        try {
            const parsed = JSON.parse(bulkJson);
            if (!Array.isArray(parsed)) return { valid: [], duplicates: [], errors: ["Root must be an array of tests"] };

            const sanitized = sanitizeData(parsed);
            const valid: any[] = [];
            const duplicates: any[] = [];
            const errors: string[] = [];

            sanitized.forEach((test, index) => {
                const validation = listeningService.validateTest(test);
                if (!validation.success) {
                    errors.push(`Test #${index + 1} (${test.title || 'Untitled'}): ${validation.error}`);
                } else {
                    const exists = allTests.some(t => t.id === test.id);
                    if (exists) {
                        duplicates.push(test);
                    } else {
                        valid.push(test);
                    }
                }
            });

            return { valid, duplicates, errors };
        } catch (e) {
            return { valid: [], duplicates: [], errors: ["Invalid JSON format"] };
        }
    }, [bulkJson, isBulkUploadOpen, allTests]);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    // Debounce search input for performance with large datasets
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch tests with increased limit for 1K+ support
    const { data: allTests = [], isLoading } = useQuery({
        queryKey: ['ielts-admin-all'],
        queryFn: async () => {
            // Fetch up to 1000 tests for admin builder
            const res = await listeningService.getTestsPaginated(null, 1000);
            return res.tests;
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    const filteredTests = useMemo(() => {
        let result = allTests;

        if (showDuplicatesOnly) {
            const idCounts = allTests.reduce((acc, t) => {
                acc[t.id] = (acc[t.id] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            result = result.filter(t => idCounts[t.id] > 1);
        }

        if (debouncedSearch) {
            const search = debouncedSearch.toLowerCase();
            result = result.filter(t =>
                t.title.toLowerCase().includes(search) ||
                t.id.toLowerCase().includes(search)
            );
        }

        return result;
    }, [allTests, debouncedSearch, showDuplicatesOnly]);

    // Count pure duplicates for badge
    const duplicateCount = useMemo(() => {
        const idCounts = allTests.reduce((acc, t) => {
            acc[t.id] = (acc[t.id] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.values(idCounts).filter(count => count > 1).length;
    }, [allTests]);

    // Pagination calculations
    const paginatedTests = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTests.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredTests, currentPage]);

    const totalPages = Math.ceil(filteredTests.length / ITEMS_PER_PAGE);

    const updateTestMutation = useMutation({
        mutationFn: (test: ListeningTest) => listeningService.saveTest(test),
        onSuccess: () => {
            toast.success("Saved successfully");
            queryClient.invalidateQueries({ queryKey: ['ielts-admin-all'] });
            // Optimistic update logic could go here
        },
        onError: () => toast.error("Failed to save")
    });

    const deleteTestMutation = useMutation({
        mutationFn: (id: string) => listeningService.deleteTest(id),
        onSuccess: () => {
            toast.success("Deleted test");
            queryClient.invalidateQueries({ queryKey: ['ielts-admin-all'] });
            if (selectedTest) setSelectedTest(null);
        }
    });

    const duplicateTestMutation = useMutation({
        mutationFn: async (test: ListeningTest) => {
            const newTest = {
                ...test,
                id: `${test.id}-copy-${Date.now().toString().slice(-4)}`,
                title: `${test.title} (Copy)`
            };
            await listeningService.saveTest(newTest);
            return newTest;
        },
        onSuccess: () => {
            toast.success("Test duplicated!");
            queryClient.invalidateQueries({ queryKey: ['ielts-admin-all'] });
        },
        onError: () => toast.error("Failed to duplicate")
    });

    const batchAudioUpdateMutation = useMutation({
        mutationFn: async (updates: { id: string, audioUrl: string }[]) => {
            const promises = updates.map(u => listeningService.updateAudioUrl(u.id, u.audioUrl));
            await Promise.all(promises);
        },
        onSuccess: () => {
            toast.success("Batch updated audio URLs");
            queryClient.invalidateQueries({ queryKey: ['ielts-admin-all'] });
        },
        onError: (e) => toast.error("Batch update failed")
    });

    const handleCreateNew = () => {
        const newTest: ListeningTest = {
            id: crypto.randomUUID(),
            title: "New IELTS Listening Test",
            audioUrl: "",
            sections: []
        };
        setSelectedTest(newTest);
    };

    const handleSave = async () => {
        if (!selectedTest) return;
        updateTestMutation.mutate(selectedTest);
    };

    const handleDelete = async () => {
        if (!selectedTest) return;
        if (confirm("Delete this test?")) {
            deleteTestMutation.mutate(selectedTest.id);
        }
    };

    const updateField = (field: keyof ListeningTest, value: any) => {
        if (!selectedTest) return;
        setSelectedTest({ ...selectedTest, [field]: value });
    };

    // --- Bulk Upload ---
    const handleBulkUpload = async () => {
        const { valid, duplicates, errors } = bulkAnalysis;
        if (errors.length > 0) {
            return toast.error("Please fix validation errors before importing");
        }

        let toUpload = [...valid];
        if (bulkConflictMode === 'overwrite') {
            toUpload = [...toUpload, ...duplicates];
        }

        if (toUpload.length === 0) {
            return toast.error("No tests to upload");
        }

        try {
            const res = await listeningService.bulkAddTests(toUpload);
            if (res.errors.length > 0) {
                toast.error(`Uploaded with ${res.errors.length} errors`);
            } else {
                toast.success(`Successfully uploaded ${res.added} tests`);
                setIsBulkUploadOpen(false);
                setBulkJson("");
                queryClient.invalidateQueries({ queryKey: ['ielts-admin-all'] });
            }
        } catch (e) {
            toast.error("Bulk upload failed");
        }
    };

    if (selectedTest) {
        // EDITOR MODE
        return (
            <div className="flex flex-col h-[calc(100vh-0rem)] bg-background animate-in slide-in-from-right-10 duration-300">
                {/* Header */}
                <div className="h-16 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur-xl sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedTest(null)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h2 className="font-bold text-lg">Edit Test</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteTestMutation.isPending}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                        <Button onClick={handleSave} disabled={updateTestMutation.isPending} className="min-w-[100px]">
                            {updateTestMutation.isPending ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save</>}
                        </Button>
                    </div>
                </div>

                {/* Editor Content */}
                <ScrollArea className="flex-1 p-6 md:p-10">
                    <div className="max-w-5xl mx-auto space-y-8">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={selectedTest.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    placeholder="e.g. IELTS Listening Test 12"
                                    className="text-lg font-bold h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Audio URL (Embed/Stream)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={selectedTest.audioUrl}
                                        onChange={(e) => updateField('audioUrl', e.target.value)}
                                        placeholder="https://..."
                                        className="font-mono text-sm"
                                    />
                                    <Button variant="outline" size="icon" title="Test Audio" onClick={() => window.open(selectedTest.audioUrl, '_blank')}>
                                        <Music className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <LayoutList className="h-5 w-5" /> Sections
                                </h3>
                                <Button variant="outline" onClick={() => {
                                    const newSection: ListeningSection = {
                                        title: `Part ${selectedTest.sections.length + 1}`,
                                        instruction: "Answer the questions below.",
                                        questions: []
                                    };
                                    updateField('sections', [...selectedTest.sections, newSection]);
                                }}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Section
                                </Button>
                            </div>

                            {selectedTest.sections.map((section, sIdx) => (
                                <Card key={sIdx} className="overflow-hidden border-muted">
                                    <CardHeader className="bg-muted/30 pb-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <Input
                                                value={section.title}
                                                onChange={(e) => {
                                                    const newSections = [...selectedTest.sections];
                                                    newSections[sIdx].title = e.target.value;
                                                    updateField('sections', newSections);
                                                }}
                                                className="font-bold border-transparent hover:border-border focus:border-primary max-w-[200px]"
                                            />
                                            <Button variant="ghost" size="sm" onClick={() => {
                                                const newSections = [...selectedTest.sections];
                                                newSections.splice(sIdx, 1);
                                                updateField('sections', newSections);
                                            }} className="text-destructive hover:bg-destructive/10">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Textarea
                                            value={section.instruction}
                                            onChange={(e) => {
                                                const newSections = [...selectedTest.sections];
                                                newSections[sIdx].instruction = e.target.value;
                                                updateField('sections', newSections);
                                            }}
                                            placeholder="Instructions..."
                                            className="resize-none mt-2 text-sm text-muted-foreground bg-transparent border-transparent hover:border-border focus:bg-background transition-all"
                                        />
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-4">
                                        {section.questions.map((q, qIdx) => (
                                            <div key={q.id} className="grid grid-cols-12 gap-2 items-start p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                                                <div className="col-span-1 pt-2 flex justify-center">
                                                    <span className="bg-primary/10 text-primary font-bold text-xs h-6 w-6 rounded-full flex items-center justify-center">
                                                        {q.number}
                                                    </span>
                                                </div>
                                                <div className="col-span-11 space-y-2">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Input
                                                            value={q.answer}
                                                            onChange={(e) => {
                                                                const newSections = [...selectedTest.sections];
                                                                newSections[sIdx].questions[qIdx].answer = e.target.value;
                                                                updateField('sections', newSections);
                                                            }}
                                                            placeholder="Answer"
                                                            className="h-8 text-sm font-semibold text-green-600 dark:text-green-400"
                                                        />
                                                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                                                                const newSections = [...selectedTest.sections];
                                                                newSections[sIdx].questions.splice(qIdx, 1);
                                                                updateField('sections', newSections);
                                                            }}>
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={q.beforeInput || ""}
                                                            onChange={(e) => {
                                                                const newSections = [...selectedTest.sections];
                                                                newSections[sIdx].questions[qIdx].beforeInput = e.target.value;
                                                                updateField('sections', newSections);
                                                            }}
                                                            placeholder="Text before..."
                                                            className="h-8 text-xs bg-muted/20"
                                                        />
                                                        <Input
                                                            value={q.afterInput || ""}
                                                            onChange={(e) => {
                                                                const newSections = [...selectedTest.sections];
                                                                newSections[sIdx].questions[qIdx].afterInput = e.target.value;
                                                                updateField('sections', newSections);
                                                            }}
                                                            placeholder="Text after..."
                                                            className="h-8 text-xs bg-muted/20"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <Button variant="secondary" size="sm" className="w-full mt-2" onClick={() => {
                                            const newSections = [...selectedTest.sections];
                                            const lastQNumber = newSections.flatMap(s => s.questions).length > 0
                                                ? Math.max(...newSections.flatMap(s => s.questions).map(q => q.number))
                                                : 0;
                                            const newQ: ListeningQuestion = {
                                                id: Math.max(0, ...newSections.flatMap(s => s.questions).map(q => q.id || 0)) + 1,
                                                number: lastQNumber + 1,
                                                answer: "",
                                                beforeInput: "",
                                                afterInput: ""
                                            };
                                            newSections[sIdx].questions.push(newQ);
                                            updateField('sections', newSections);
                                        }}>
                                            <Plus className="h-3 w-3 mr-2" /> Add Question
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </ScrollArea>
            </div>
        );
    }

    // DASHBOARD MODE
    return (
        <div className="flex flex-col h-[calc(100vh-0rem)] bg-background">
            <div className="h-20 border-b flex items-center justify-between px-8 bg-card/50 backdrop-blur-xl">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <LayoutGrid className="h-6 w-6 text-primary" /> IELTS Builder
                    </h1>
                    <p className="text-muted-foreground text-sm">Manage listening practice materials</p>
                </div>
                <div className="flex items-center gap-3">
                    {duplicateCount > 0 && (
                        <Button
                            variant={showDuplicatesOnly ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => setShowDuplicatesOnly(!showDuplicatesOnly)}
                            className={`gap-2 ${!showDuplicatesOnly ? "border-orange-500 text-orange-600 hover:bg-orange-50" : ""}`}
                        >
                            <AlertCircle className="h-4 w-4" />
                            {showDuplicatesOnly ? "Showing Duplicates" : `${duplicateCount} Duplicates Hidden`}
                        </Button>
                    )}
                    <AudioUpdaterDialog tests={allTests} onUpdate={(updates) => batchAudioUpdateMutation.mutateAsync(updates)} />
                    <Button variant="outline" className="gap-2" onClick={() => setIsBulkUploadOpen(true)}>
                        <Upload className="h-4 w-4" /> Bulk Upload
                    </Button>
                    <Button onClick={handleCreateNew} className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                        <Plus className="h-4 w-4" /> New Test
                    </Button>
                </div>
            </div>

            <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                {/* Search & Filter */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-12 rounded-xl bg-muted/40 border-transparent focus:bg-background transition-all"
                    />
                </div>


                {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-48 rounded-xl" />
                                <Skeleton className="h-12 rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : filteredTests.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <p className="text-lg font-semibold">No tests found</p>
                        <p className="text-sm mt-2">Try adjusting your search or create a new test</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredTests.length)} of {filteredTests.length} tests
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paginatedTests.map((test) => (
                                <Card
                                    key={test.id}
                                    className="group cursor-pointer hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 border-dashed hover:border-solid"
                                    onClick={() => setSelectedTest(test)}
                                >
                                    <div className="p-6 h-48 flex flex-col justify-between bg-gradient-to-br from-muted/30 to-transparent group-hover:from-primary/5 transition-colors relative">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className="bg-background/50 backdrop-blur">
                                                {test.sections.reduce((acc, s) => acc + s.questions.length, 0)} Qs
                                            </Badge>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-primary/10 hover:text-primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        duplicateTestMutation.mutate(test);
                                                    }}
                                                    title="Duplicate Test"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm("Delete this test?")) deleteTestMutation.mutate(test.id);
                                                    }}
                                                    title="Delete Test"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>

                                                {test.audioUrl ? (
                                                    <div className="h-8 w-8 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center">
                                                        <Check className="h-4 w-4" />
                                                    </div>
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center">
                                                        <X className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">{test.title}</h3>
                                            <p className="text-xs text-muted-foreground mt-2 font-mono opacity-50 truncate">{test.id}</p>
                                        </div>
                                    </div>
                                    <CardFooter className="p-4 bg-muted/20 border-t flex justify-between text-xs text-muted-foreground">
                                        <span>{test.sections.length} Parts</span>
                                        <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-primary font-bold">
                                            Edit <ArrowLeft className="h-3 w-3 rotate-180" />
                                        </span>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                        let pageNum: number;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? "default" : "outline"}
                                                size="sm"
                                                className="w-9"
                                                onClick={() => setCurrentPage(pageNum)}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className="gap-2"
                                >
                                    Next <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bulk Upload Dialog */}
            <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
                <DialogContent className="sm:max-w-[1000px] h-[90vh] p-0 gap-0 flex flex-col">
                    {/* Blue Header */}
                    <div className="bg-primary text-primary-foreground p-6 flex items-center justify-center gap-3 flex-shrink-0">
                        <Upload className="h-5 w-5" />
                        <h2 className="text-xl font-bold">Bulk Upload IELTS Listening Tests</h2>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <p className="text-center text-muted-foreground text-sm">
                            Upload multiple IELTS listening test entries at once to Firestore
                        </p>

                        {/* Format Tabs */}
                        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg">
                            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-background shadow-sm font-medium text-sm">
                                <FileText className="h-4 w-4" />
                                JSON Format
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Paste JSON Data</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                        try {
                                            const text = await navigator.clipboard.readText();
                                            setBulkJson(text);
                                            toast.success("Pasted from clipboard!");
                                        } catch (e) {
                                            toast.error("Failed to paste from clipboard");
                                        }
                                    }}
                                    className="gap-2"
                                >
                                    <FileText className="h-4 w-4" />
                                    Paste
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const sampleData = JSON.stringify([
                                            {
                                                id: "test-001",
                                                title: "IELTS Listening Test 1",
                                                audioUrl: "https://example.com/audio/test1.mp3",
                                                sections: [
                                                    {
                                                        title: "Part 1",
                                                        instruction: "Questions 1-5: Complete the form below. Write NO MORE THAN TWO WORDS.",
                                                        questions: [
                                                            {
                                                                id: 1,
                                                                number: 1,
                                                                beforeInput: "Name:",
                                                                answer: "John Smith",
                                                                afterInput: ""
                                                            },
                                                            {
                                                                id: 2,
                                                                number: 2,
                                                                beforeInput: "Phone number:",
                                                                answer: "555-0123",
                                                                afterInput: ""
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ], null, 2);
                                        navigator.clipboard.writeText(sampleData);
                                        toast.success("Template copied to clipboard!");
                                    }}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Copy Template
                                </Button>
                            </div>
                        </div>

                        {/* JSON Textarea */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Label className="text-sm font-bold flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> JSON Input
                                </Label>
                                <Textarea
                                    value={bulkJson}
                                    onChange={(e) => setBulkJson(e.target.value)}
                                    placeholder={`[\n  {\n    "id": "test-001",\n    "title": "IELTS Listening Test 1",\n    ...\n  }\n]`}
                                    className="h-[500px] font-mono text-[10px] bg-muted/20 border-2 resize-none focus:bg-background transition-all"
                                />
                            </div>

                            <div className="flex flex-col h-[550px] space-y-4">
                                <Label className="text-sm font-bold flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Preview & Analysis
                                </Label>

                                <div className="flex-1 border-2 rounded-xl bg-muted/10 overflow-hidden flex flex-col">
                                    <div className="p-3 bg-muted/50 border-b flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                                        <span>Status Panel</span>
                                        <div className="flex gap-3">
                                            <span className="text-green-600">New: {bulkAnalysis.valid.length}</span>
                                            <span className="text-orange-600">Dup: {bulkAnalysis.duplicates.length}</span>
                                            <span className="text-red-600">Err: {bulkAnalysis.errors.length}</span>
                                        </div>
                                    </div>

                                    <ScrollArea className="flex-1 p-4">
                                        {bulkAnalysis.errors.length > 0 && (
                                            <div className="mb-6 space-y-2">
                                                <h4 className="text-xs font-black text-red-600 uppercase flex items-center gap-2">
                                                    <AlertCircle className="h-3 w-3" /> Errors ({bulkAnalysis.errors.length})
                                                </h4>
                                                {bulkAnalysis.errors.map((err, i) => (
                                                    <div key={i} className="p-2 rounded bg-red-500/10 text-red-600 text-[10px] border border-red-200/50">
                                                        {err}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {bulkAnalysis.duplicates.length > 0 && (
                                            <div className="mb-6 space-y-2">
                                                <h4 className="text-xs font-black text-orange-600 uppercase flex items-center gap-2">
                                                    <RefreshCw className="h-3 w-3" /> Existing IDs ({bulkAnalysis.duplicates.length})
                                                </h4>
                                                <div className="grid grid-cols-1 gap-1">
                                                    {bulkAnalysis.duplicates.map((t, i) => (
                                                        <div key={i} className="text-[10px] flex items-center gap-2 p-1.5 rounded bg-orange-500/5 border border-orange-200/30">
                                                            <Badge variant="outline" className="text-[9px] h-4 bg-orange-100">DUP</Badge>
                                                            <span className="font-mono opacity-60 truncate max-w-[80px]">{t.id}</span>
                                                            <span className="truncate font-medium">{t.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {bulkAnalysis.valid.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-black text-green-600 uppercase flex items-center gap-2">
                                                    <Check className="h-3 w-3" /> New Tests ({bulkAnalysis.valid.length})
                                                </h4>
                                                <div className="grid grid-cols-1 gap-1">
                                                    {bulkAnalysis.valid.map((t, i) => (
                                                        <div key={i} className="text-[10px] flex items-center gap-2 p-1.5 rounded bg-green-500/5 border border-green-200/30">
                                                            <Badge variant="outline" className="text-[9px] h-4 bg-green-100">NEW</Badge>
                                                            <span className="font-mono opacity-60 truncate max-w-[80px]">{t.id}</span>
                                                            <span className="truncate font-medium">{t.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {!bulkJson.trim() && (
                                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-3 py-20">
                                                <Upload className="h-10 w-10 animate-bounce" />
                                                <p className="text-sm font-medium">Paste JSON to start analysis</p>
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>

                                {bulkAnalysis.duplicates.length > 0 && (
                                    <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-orange-800 dark:text-orange-200">Conflict Management</p>
                                                <p className="text-[10px] text-orange-600">ID collisions detected. Choose action:</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant={bulkConflictMode === 'skip' ? 'default' : 'outline'}
                                                    onClick={() => setBulkConflictMode('skip')}
                                                    className="h-8 text-[10px] px-3 font-bold"
                                                >
                                                    Skip Duplicates
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={bulkConflictMode === 'overwrite' ? 'destructive' : 'outline'}
                                                    onClick={() => setBulkConflictMode('overwrite')}
                                                    className="h-8 text-[10px] px-3 font-bold"
                                                >
                                                    Overwrite
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tip Section */}
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                💡 <strong>Pro Tip:</strong> Ensure your JSON follows the required schema. Sanitization will automatically trim extra spaces from titles and answers.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t p-4 flex items-center justify-end gap-2 bg-muted/20 flex-shrink-0">
                        <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBulkUpload}
                            disabled={!bulkJson.trim() || bulkAnalysis.errors.length > 0 || (bulkAnalysis.valid.length === 0 && (bulkAnalysis.duplicates.length === 0 || bulkConflictMode === 'skip'))}
                            className="gap-2 min-w-[140px]"
                        >
                            <Upload className="h-4 w-4" />
                            {bulkAnalysis.errors.length > 0 ? "Fix Errors" : `Import ${bulkAnalysis.valid.length + (bulkConflictMode === 'overwrite' ? bulkAnalysis.duplicates.length : 0)} Tests`}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// BulkUploadDialog removed in favor of integrated version above

export default ListeningBuilder;
