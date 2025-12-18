import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDuplicateManagement } from "@/hooks/useDuplicateManagement";
import { useVocabularies } from "@/hooks/useVocabularies";
import { useWorkerDuplicateDetection } from "@/hooks/useWorkerDuplicateDetection";
import { DuplicateGroup } from "@/utils/duplicateDetection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { VocabularyDetailsModal } from "@/components/VocabularyDetailsModal";
import { ComparisonModal } from "@/components/ComparisonModal";
import { dexieService } from "@/lib/dexieDb";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    ArrowLeft,
    Merge,
    CheckCircle2,
    Sparkles,
    Info,
    Search,
    Eye,
    RefreshCw,
    Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Vocabulary } from "@/types/vocabulary";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import PARTS_OF_SPEECH from "@/data/partOfSpeech.json";


const ITEMS_PER_PAGE = 20;

export default function DuplicateManagerOptimized() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    // Load vocabularies using the shared hook for automatic updates
    const { data: vocabularies = [], isLoading } = useVocabularies();
    const { mergeDuplicates, keepOne, autoMergeExactDuplicates } = useDuplicateManagement();

    const [similarityThreshold, setSimilarityThreshold] = useState(85);
    const [showAutoMergeDialog, setShowAutoMergeDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVocab, setSelectedVocab] = useState<Vocabulary | null>(null);
    const [filterPos, setFilterPos] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"count" | "word" | "newest" | "oldest">("count");
    const [comparisonGroup, setComparisonGroup] = useState<DuplicateGroup | null>(null);

    // Use Web Worker for duplicate detection
    const { result: duplicateData, isProcessing, progress, error, redetect } =
        useWorkerDuplicateDetection(vocabularies, similarityThreshold);

    // Redirect if not admin
    if (!isAdmin) {
        navigate("/");
        return null;
    }

    // Filter and sort duplicate groups
    const filteredExact = useMemo(() => {
        if (!duplicateData?.exact) return [];

        let filtered = duplicateData.exact;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((group) =>
                group.duplicates.some((v) =>
                    v.english.toLowerCase().includes(query) ||
                    v.bangla.toLowerCase().includes(query)
                )
            );
        }

        if (filterPos !== "all") {
            filtered = filtered.filter((group) =>
                group.duplicates.some((v) => v.partOfSpeech === filterPos)
            );
        }

        return filtered.sort((a, b) => {
            if (sortBy === "count") {
                return b.duplicates.length - a.duplicates.length;
            }
            if (sortBy === "word") {
                return a.duplicates[0].english.localeCompare(b.duplicates[0].english);
            }
            if (sortBy === "newest") {
                const dateA = new Date(a.duplicates[0].createdAt).getTime();
                const dateB = new Date(b.duplicates[0].createdAt).getTime();
                return dateB - dateA;
            }
            if (sortBy === "oldest") {
                const dateA = new Date(a.duplicates[0].createdAt).getTime();
                const dateB = new Date(b.duplicates[0].createdAt).getTime();
                return dateA - dateB;
            }
            return 0;
        });
    }, [duplicateData?.exact, searchQuery, sortBy, filterPos]);

    const filteredSimilar = useMemo(() => {
        if (!duplicateData?.similar) return [];

        let filtered = duplicateData.similar;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((group) =>
                group.duplicates.some((v) =>
                    v.english.toLowerCase().includes(query) ||
                    v.bangla.toLowerCase().includes(query)
                )
            );
        }

        if (filterPos !== "all") {
            filtered = filtered.filter((group) =>
                group.duplicates.some((v) => v.partOfSpeech === filterPos)
            );
        }

        return filtered.sort((a, b) => {
            if (sortBy === "count") {
                return b.duplicates.length - a.duplicates.length;
            }
            if (sortBy === "word") {
                return a.duplicates[0].english.localeCompare(b.duplicates[0].english);
            }
            if (sortBy === "newest") {
                const dateA = new Date(a.duplicates[0].createdAt).getTime();
                const dateB = new Date(b.duplicates[0].createdAt).getTime();
                return dateB - dateA;
            }
            if (sortBy === "oldest") {
                const dateA = new Date(a.duplicates[0].createdAt).getTime();
                const dateB = new Date(b.duplicates[0].createdAt).getTime();
                return dateA - dateB;
            }
            return 0;
        });
    }, [duplicateData?.similar, searchQuery, sortBy, filterPos]);

    const handleMerge = async (group: DuplicateGroup) => {
        await mergeDuplicates.mutateAsync({ group });
        redetect();
    };

    const handleKeepOne = async (group: DuplicateGroup, keepId: string) => {
        await keepOne.mutateAsync({ group, keepId });
        redetect();
    };

    const handleAutoMerge = async () => {
        if (!filteredExact.length) return;
        await autoMergeExactDuplicates.mutateAsync(filteredExact);
        setShowAutoMergeDialog(false);
        redetect();
    };

    const handleViewDetails = (vocab: Vocabulary) => {
        setSelectedVocab(vocab);
    };

    const handleShowComparison = (group: DuplicateGroup) => {
        setComparisonGroup(group);
    };

    const handleMergeFromComparison = async () => {
        if (!comparisonGroup) return;
        await handleMerge(comparisonGroup);
        setComparisonGroup(null);
    };

    const handleKeepOneFromComparison = async (keepId: string) => {
        if (!comparisonGroup) return;
        await handleKeepOne(comparisonGroup, keepId);
        setComparisonGroup(null);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-3 sm:px-4 pt-4 sm:pt-6 pb-4 sticky top-0 z-10 shadow-md"
            >
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 sm:h-10 sm:w-10"
                        >
                            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg sm:text-2xl font-bold truncate">Duplicate Manager</h1>
                            <p className="text-primary-foreground/80 text-xs sm:text-sm">
                                Advanced duplicate detection & management
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={redetect}
                            disabled={isProcessing}
                            className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 sm:h-10 sm:w-10"
                        >
                            <RefreshCw className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
                        </Button>
                    </div>

                    {/* Processing Progress */}
                    {isProcessing && (
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-primary-foreground/80">
                                    Analyzing {vocabularies.length} vocabularies...
                                </span>
                                <span className="text-xs text-primary-foreground/80">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                        </div>
                    )}

                    {/* Stats Cards */}
                    {duplicateData?.stats && !isProcessing && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                            <Card className="p-2 sm:p-3 bg-primary-foreground/10 border-primary-foreground/20">
                                <p className="text-[10px] sm:text-xs text-primary-foreground/70">Total Words</p>
                                <p className="text-lg sm:text-2xl font-bold text-primary-foreground">
                                    {duplicateData.stats.totalVocabularies}
                                </p>
                            </Card>
                            <Card className="p-2 sm:p-3 bg-primary-foreground/10 border-primary-foreground/20">
                                <p className="text-[10px] sm:text-xs text-primary-foreground/70">Groups</p>
                                <p className="text-lg sm:text-2xl font-bold text-primary-foreground">
                                    {duplicateData.stats.duplicateGroups}
                                </p>
                            </Card>
                            <Card className="p-2 sm:p-3 bg-primary-foreground/10 border-primary-foreground/20">
                                <p className="text-[10px] sm:text-xs text-primary-foreground/70">Exact</p>
                                <p className="text-lg sm:text-2xl font-bold text-primary-foreground">
                                    {duplicateData.exact.length}
                                </p>
                            </Card>
                            <Card className="p-2 sm:p-3 bg-primary-foreground/10 border-primary-foreground/20">
                                <p className="text-[10px] sm:text-xs text-primary-foreground/70">Similar</p>
                                <p className="text-lg sm:text-2xl font-bold text-primary-foreground">
                                    {duplicateData.similar.length}
                                </p>
                            </Card>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="space-y-2">
                        {/* Search and Filter */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary-foreground/50" />
                                <Input
                                    placeholder="Search duplicates..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 h-9 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select value={filterPos} onValueChange={setFilterPos}>
                                    <SelectTrigger className="w-[110px] h-9 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                                        <SelectValue placeholder="POS" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All POS</SelectItem>
                                        {PARTS_OF_SPEECH.map((pos) => (
                                            <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                                    <SelectTrigger className="w-[110px] h-9 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="count">By Count</SelectItem>
                                        <SelectItem value="word">By Word</SelectItem>
                                        <SelectItem value="newest">Newest</SelectItem>
                                        <SelectItem value="oldest">Oldest</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Auto-merge button */}
                        {duplicateData && duplicateData.exact.length > 0 && (
                            <Button
                                onClick={() => setShowAutoMergeDialog(true)}
                                disabled={isProcessing || autoMergeExactDuplicates.isPending || filteredExact.length === 0}
                                className="w-full h-9 bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-sm"
                            >
                                <Sparkles className="h-3.5 w-3.5 mr-2" />
                                Auto-Merge {filteredExact.length} Exact Duplicate Groups
                            </Button>
                        )}
                    </div>
                </div>
            </motion.header>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
                {error && (
                    <Card className="p-4 mb-4 bg-destructive/10 border-destructive">
                        <p className="text-sm text-destructive">{error}</p>
                    </Card>
                )}

                {!duplicateData || (duplicateData.exact.length === 0 && duplicateData.similar.length === 0) ? (
                    <Card className="p-8 text-center">
                        <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-success mx-auto mb-4" />
                        <h3 className="text-lg sm:text-xl font-semibold mb-2">No Duplicates Found!</h3>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Your vocabulary database is clean and duplicate-free.
                        </p>
                    </Card>
                ) : (
                    <Tabs defaultValue="exact" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="exact" className="text-xs sm:text-sm">
                                Exact ({filteredExact.length})
                            </TabsTrigger>
                            <TabsTrigger value="similar" className="text-xs sm:text-sm">
                                Similar ({filteredSimilar.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="exact">
                            <VirtualizedDuplicateList
                                groups={filteredExact}
                                onMerge={handleMerge}
                                onKeepOne={handleKeepOne}
                                onViewDetails={handleViewDetails}
                                onShowComparison={handleShowComparison}
                                isProcessing={mergeDuplicates.isPending || keepOne.isPending}
                            />
                        </TabsContent>

                        <TabsContent value="similar">
                            <Card className="p-3 bg-muted/50 mb-3">
                                <div className="flex items-start gap-2">
                                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-muted-foreground">
                                        Similar duplicates use fuzzy matching ({similarityThreshold}% threshold).
                                        Review carefully before merging.
                                    </p>
                                </div>
                            </Card>
                            <VirtualizedDuplicateList
                                groups={filteredSimilar}
                                onMerge={handleMerge}
                                onKeepOne={handleKeepOne}
                                onViewDetails={handleViewDetails}
                                onShowComparison={handleShowComparison}
                                isProcessing={mergeDuplicates.isPending || keepOne.isPending}
                            />
                        </TabsContent>
                    </Tabs>
                )}
            </div>

            {/* Vocabulary Details Modal */}
            <VocabularyDetailsModal
                vocabulary={selectedVocab}
                open={!!selectedVocab}
                onOpenChange={(open) => !open && setSelectedVocab(null)}
            />

            {/* Comparison Modal */}
            <ComparisonModal
                vocabularies={comparisonGroup?.duplicates || []}
                open={!!comparisonGroup}
                onOpenChange={(open) => !open && setComparisonGroup(null)}
                onMerge={handleMergeFromComparison}
                onKeepOne={handleKeepOneFromComparison}
            />

            {/* Auto-merge confirmation dialog */}
            <AlertDialog open={showAutoMergeDialog} onOpenChange={setShowAutoMergeDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Auto-Merge Exact Duplicates?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will automatically merge {filteredExact.length} exact duplicate groups.
                            The most complete entry in each group will be kept, and all information will be combined.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAutoMerge}
                            disabled={autoMergeExactDuplicates.isPending}
                            className="bg-primary"
                        >
                            {autoMergeExactDuplicates.isPending ? "Merging..." : "Auto-Merge All"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// Virtualized List Component for Performance
interface VirtualizedDuplicateListProps {
    groups: DuplicateGroup[];
    onMerge: (group: DuplicateGroup) => void;
    onKeepOne: (group: DuplicateGroup, keepId: string) => void;
    onViewDetails: (vocab: Vocabulary) => void;
    onShowComparison: (group: DuplicateGroup) => void;
    isProcessing: boolean;
}

function VirtualizedDuplicateList({
    groups,
    onMerge,
    onKeepOne,
    onViewDetails,
    onShowComparison,
    isProcessing,
}: VirtualizedDuplicateListProps) {
    const parentRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: groups.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 150,
        overscan: 5,
    });

    if (groups.length === 0) {
        return (
            <Card className="p-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
                <p className="text-muted-foreground">No duplicates found</p>
            </Card>
        );
    }

    return (
        <div ref={parentRef} className="h-[calc(100vh-400px)] overflow-auto">
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                }}
            >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                    const group = groups[virtualItem.index];
                    return (
                        <div
                            key={virtualItem.key}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                transform: `translateY(${virtualItem.start}px)`,
                            }}
                        >
                            <div className="pb-3">
                                <DuplicateGroupCard
                                    group={group}
                                    onMerge={onMerge}
                                    onKeepOne={onKeepOne}
                                    onViewDetails={onViewDetails}
                                    onShowComparison={onShowComparison}
                                    isProcessing={isProcessing}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Duplicate Group Card Component (Optimized)
interface DuplicateGroupCardProps {
    group: DuplicateGroup;
    onMerge: (group: DuplicateGroup) => void;
    onKeepOne: (group: DuplicateGroup, keepId: string) => void;
    onViewDetails: (vocab: Vocabulary) => void;
    onShowComparison: (group: DuplicateGroup) => void;
    isProcessing: boolean;
}

function DuplicateGroupCard({
    group,
    onMerge,
    onKeepOne,
    onViewDetails,
    onShowComparison,
    isProcessing,
}: DuplicateGroupCardProps) {
    return (
        <Card className="overflow-hidden">
            <div className="p-3 sm:p-4 bg-muted/30">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-sm sm:text-base break-words">
                                {group.duplicates[0].english}
                            </h3>
                            <Badge
                                variant={group.type === "exact" ? "destructive" : "secondary"}
                                className="text-xs flex-shrink-0"
                            >
                                {group.type === "exact" ? "Exact" : "Similar"}
                            </Badge>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                                {group.duplicates.length} items
                            </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground break-words">
                            {group.duplicates[0].bangla}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onShowComparison(group)}
                        className="flex-shrink-0 text-xs h-8"
                    >
                        Compare
                    </Button>
                </div>

                <div className="flex gap-2 mt-3">
                    <Button
                        size="sm"
                        onClick={() => onMerge(group)}
                        disabled={isProcessing}
                        className="flex-1 text-xs h-8"
                    >
                        <Merge className="h-3 w-3 mr-1" />
                        Merge All
                    </Button>
                </div>
            </div>
        </Card>
    );
}

// Individual Vocabulary Item
interface VocabDuplicateItemProps {
    vocab: Vocabulary;
    index: number;
    isSelected: boolean;
    onSelect: () => void;
    onViewDetails: () => void;
}

function VocabDuplicateItem({
    vocab,
    index,
    isSelected,
    onSelect,
    onViewDetails,
}: VocabDuplicateItemProps) {
    return (
        <div
            className={`p-2 sm:p-3 rounded-lg border-2 transition-all ${isSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0" onClick={onSelect}>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">
                            #{index + 1}
                        </Badge>
                        {index === 0 && (
                            <Badge className="text-[10px] sm:text-xs bg-success flex-shrink-0">
                                Newest
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs sm:text-sm font-medium break-words cursor-pointer">
                        {vocab.english}
                    </p>
                    <p className="text-xs text-muted-foreground break-words">{vocab.bangla}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {vocab.examples.length} examples
                        </span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">•</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {vocab.synonyms.length} synonyms
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                    {isSelected && (
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onViewDetails}
                        className="h-7 w-7"
                        title="View Details"
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
