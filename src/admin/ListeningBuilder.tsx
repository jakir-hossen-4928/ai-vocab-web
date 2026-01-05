import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listeningService } from "@/services/listeningService";
import { ListeningTest, ListeningSection, ListeningQuestion } from "@/data/listeningData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, MoreVertical, Search, Upload, LayoutGrid, LayoutList, Music, Check, X, Wand2, ArrowLeft, FileText } from "lucide-react";
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
        if (!debouncedSearch) return allTests;
        const search = debouncedSearch.toLowerCase();
        return allTests.filter(t =>
            t.title.toLowerCase().includes(search) ||
            t.id.toLowerCase().includes(search)
        );
    }, [allTests, debouncedSearch]);

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
        try {
            const data = JSON.parse(bulkJson);
            if (!Array.isArray(data)) throw new Error("Root must be array");
            await listeningService.bulkAddTests(data);
            toast.success("Uploaded successfully");
            setIsBulkUploadOpen(false);
            setBulkJson("");
            queryClient.invalidateQueries({ queryKey: ['ielts-admin-all'] });
        } catch (e) {
            toast.error("Invalid JSON");
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
                                Showing {Math.min(filteredTests.length, 24)} of {filteredTests.length} tests
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredTests.slice(0, 24).map((test) => (
                                <Card
                                    key={test.id}
                                    className="group cursor-pointer hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 border-dashed hover:border-solid"
                                    onClick={() => setSelectedTest(test)}
                                >
                                    <div className="p-6 h-48 flex flex-col justify-between bg-gradient-to-br from-muted/30 to-transparent group-hover:from-primary/5 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className="bg-background/50 backdrop-blur">
                                                {test.sections.reduce((acc, s) => acc + s.questions.length, 0)} Qs
                                            </Badge>
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
                        <Textarea
                            value={bulkJson}
                            onChange={(e) => setBulkJson(e.target.value)}
                            placeholder={`[\n  {\n    "id": "test-001",\n    "title": "IELTS Listening Test 1",\n    "audioUrl": "https://example.com/audio/test1.mp3",\n    "sections": [\n      {\n        "title": "Part 1",\n        "instruction": "Questions 1-5: Complete the form.",\n        "questions": [\n          {\n            "id": 1,\n            "number": 1,\n            "beforeInput": "Name:",\n            "answer": "John Smith",\n            "afterInput": ""\n          }\n        ]\n      }\n    ]\n  }\n]`}
                            className="min-h-[400px] font-mono text-xs bg-muted/20 border-2 resize-none"
                        />

                        {/* Tip Section */}
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                💡 <strong>Pro Tip:</strong> After uploading tests with placeholder audio URLs, use the{" "}
                                <strong className="text-primary">"Audio Script"</strong> button on the dashboard to batch update audio URLs for multiple tests at once!
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
                            disabled={!bulkJson.trim()}
                            className="gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            Import Tests
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

function BulkUploadDialog({ onUpload, isOpen, onOpenChange }: {
    onUpload: (data: any[]) => Promise<void>,
    isOpen: boolean,
    onOpenChange: (open: boolean) => void
}) {
    const [jsonText, setJsonText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            setJsonText(result);
            toast.success("File content loaded");
            e.target.value = "";
        };
        reader.readAsText(file);
    };

    const handleProcess = async () => {
        if (!jsonText.trim()) {
            toast.error("Please provide JSON data");
            return;
        }

        setIsLoading(true);
        try {
            const parsed = JSON.parse(jsonText);
            if (!Array.isArray(parsed)) {
                throw new Error("Must be array");
            }
            await onUpload(parsed);
            setJsonText("");
            onOpenChange(false);
        } catch (e) {
            console.error(e);
            toast.error("Invalid JSON");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Tests</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag JSON</p>
                            </div>
                            <input id="dropzone-file" type="file" accept=".json" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>
                    <Textarea
                        placeholder="Paste JSON array..."
                        className="font-mono text-xs min-h-[200px]"
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleProcess} disabled={isLoading}>
                        {isLoading ? "Processing..." : "Import"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ListeningBuilder;
