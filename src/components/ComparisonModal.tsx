import { useState } from "react";
import { Vocabulary } from "@/types/vocabulary";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Volume2,
    Calendar,
    CheckCircle2,
    Circle,
    ArrowRight,
    Merge,
    Eye,
    EyeOff,
} from "lucide-react";
import { speakText } from "@/services/ttsService";
import { cn } from "@/lib/utils";

interface ComparisonModalProps {
    vocabularies: Vocabulary[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMerge?: () => void;
    onKeepOne?: (id: string) => void;
}

export function ComparisonModal({
    vocabularies,
    open,
    onOpenChange,
    onMerge,
    onKeepOne,
}: ComparisonModalProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);

    if (!vocabularies || vocabularies.length === 0) return null;

    // Sort by creation date (newest first)
    const sortedVocabs = [...vocabularies].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Find differences and similarities
    const analysis = analyzeVocabularies(sortedVocabs);

    const handleSpeak = (text: string) => {
        speakText(text);
    };

    const handleSelect = (id: string) => {
        setSelectedId(selectedId === id ? null : id);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl max-h-[95vh] p-0">
                <ScrollArea className="max-h-[95vh]">
                    <div className="p-4 sm:p-6">
                        <DialogHeader className="mb-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <DialogTitle className="text-xl sm:text-2xl mb-2">
                                        Compare Duplicates
                                    </DialogTitle>
                                    <DialogDescription className="text-sm sm:text-base">
                                        Comparing {vocabularies.length} vocabularies - Select one to keep or
                                        merge all
                                    </DialogDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowDifferencesOnly(!showDifferencesOnly)}
                                    className="flex-shrink-0"
                                >
                                    {showDifferencesOnly ? (
                                        <>
                                            <Eye className="h-3 w-3 mr-1" />
                                            Show All
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="h-3 w-3 mr-1" />
                                            Differences Only
                                        </>
                                    )}
                                </Button>
                            </div>
                        </DialogHeader>

                        {/* Analysis Summary */}
                        <Card className="p-3 sm:p-4 mb-4 bg-muted/50">
                            <h3 className="font-semibold mb-2 text-sm sm:text-base">
                                Quick Analysis
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm">
                                <div>
                                    <span className="text-muted-foreground">Same English:</span>
                                    <span className="ml-2 font-medium">
                                        {analysis.sameEnglish ? "✓" : "✗"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Same Bangla:</span>
                                    <span className="ml-2 font-medium">
                                        {analysis.sameBangla ? "✓" : "✗"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Total Examples:</span>
                                    <span className="ml-2 font-medium">{analysis.totalExamples}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Total Synonyms:</span>
                                    <span className="ml-2 font-medium">{analysis.totalSynonyms}</span>
                                </div>
                            </div>
                            {analysis.recommendation && (
                                <div className="mt-2 p-2 bg-primary/10 rounded text-xs sm:text-sm">
                                    <strong>Recommendation:</strong> {analysis.recommendation}
                                </div>
                            )}
                        </Card>

                        {/* Comparison Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4">
                            {sortedVocabs.map((vocab, index) => (
                                <ComparisonCard
                                    key={vocab.id}
                                    vocabulary={vocab}
                                    index={index}
                                    isSelected={selectedId === vocab.id}
                                    onSelect={() => handleSelect(vocab.id)}
                                    onSpeak={() => handleSpeak(vocab.english)}
                                    differences={analysis.differences[vocab.id] || []}
                                    showDifferencesOnly={showDifferencesOnly}
                                    isNewest={index === 0}
                                    isMostComplete={vocab.id === analysis.mostComplete?.id}
                                />
                            ))}
                        </div>

                        {/* Detailed Comparison Table */}
                        <Card className="p-3 sm:p-4 mb-4">
                            <h3 className="font-semibold mb-3 text-sm sm:text-base">
                                Side-by-Side Comparison
                            </h3>
                            <div className="overflow-x-auto">
                                <ComparisonTable
                                    vocabularies={sortedVocabs}
                                    showDifferencesOnly={showDifferencesOnly}
                                />
                            </div>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 sticky bottom-0 bg-background pt-4 border-t">
                            {selectedId && onKeepOne && (
                                <Button
                                    onClick={() => onKeepOne(selectedId)}
                                    className="flex-1"
                                    variant="default"
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Keep Selected & Delete Others
                                </Button>
                            )}
                            {onMerge && (
                                <Button
                                    onClick={onMerge}
                                    className="flex-1"
                                    variant={selectedId ? "outline" : "default"}
                                >
                                    <Merge className="h-4 w-4 mr-2" />
                                    Merge All Into One
                                </Button>
                            )}
                            <Button
                                onClick={() => onOpenChange(false)}
                                variant="outline"
                                className="flex-1 sm:flex-initial"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

// Individual Comparison Card
interface ComparisonCardProps {
    vocabulary: Vocabulary;
    index: number;
    isSelected: boolean;
    onSelect: () => void;
    onSpeak: () => void;
    differences: string[];
    showDifferencesOnly: boolean;
    isNewest: boolean;
    isMostComplete: boolean;
}

function ComparisonCard({
    vocabulary,
    index,
    isSelected,
    onSelect,
    onSpeak,
    differences,
    showDifferencesOnly,
    isNewest,
    isMostComplete,
}: ComparisonCardProps) {
    return (
        <Card
            className={cn(
                "p-3 sm:p-4 cursor-pointer transition-all border-2",
                isSelected
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-border hover:border-primary/50 hover:shadow-md"
            )}
            onClick={onSelect}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                        #{index + 1}
                    </Badge>
                    {isNewest && (
                        <Badge className="text-xs bg-success">Newest</Badge>
                    )}
                    {isMostComplete && (
                        <Badge className="text-xs bg-blue-500">Most Complete</Badge>
                    )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSpeak();
                        }}
                        className="h-7 w-7"
                    >
                        <Volume2 className="h-3.5 w-3.5" />
                    </Button>
                    {isSelected ? (
                        <CheckCircle2 className="h-7 w-7 text-primary" />
                    ) : (
                        <Circle className="h-7 w-7 text-muted-foreground" />
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
                <div>
                    <p className="text-sm font-semibold text-foreground">
                        {vocabulary.english}
                    </p>
                    <p className="text-sm text-muted-foreground">{vocabulary.bangla}</p>
                </div>

                <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                        {vocabulary.partOfSpeech}
                    </Badge>
                    {vocabulary.pronunciation && (
                        <Badge variant="outline" className="text-xs">
                            {vocabulary.pronunciation}
                        </Badge>
                    )}
                </div>

                {(!showDifferencesOnly || vocabulary.explanation) && (
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                            Explanation:
                        </p>
                        <p className="text-xs line-clamp-2">
                            {vocabulary.explanation || "No explanation"}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="p-1 bg-muted/50 rounded">
                        <div className="font-medium">{vocabulary.examples.length}</div>
                        <div className="text-muted-foreground">Examples</div>
                    </div>
                    <div className="p-1 bg-muted/50 rounded">
                        <div className="font-medium">{vocabulary.synonyms.length}</div>
                        <div className="text-muted-foreground">Synonyms</div>
                    </div>
                    <div className="p-1 bg-muted/50 rounded">
                        <div className="font-medium">{vocabulary.antonyms.length}</div>
                        <div className="text-muted-foreground">Antonyms</div>
                    </div>
                </div>

                {differences.length > 0 && (
                    <div className="pt-2 border-t">
                        <p className="text-xs font-medium text-destructive mb-1">
                            Unique/Different:
                        </p>
                        <ul className="text-xs space-y-0.5">
                            {differences.slice(0, 3).map((diff, i) => (
                                <li key={i} className="text-muted-foreground">
                                    • {diff}
                                </li>
                            ))}
                            {differences.length > 3 && (
                                <li className="text-muted-foreground italic">
                                    +{differences.length - 3} more...
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                <div className="text-xs text-muted-foreground pt-2 border-t">
                    Created: {new Date(vocabulary.createdAt).toLocaleDateString()}
                </div>
            </div>
        </Card>
    );
}

// Comparison Table
interface ComparisonTableProps {
    vocabularies: Vocabulary[];
    showDifferencesOnly: boolean;
}

function ComparisonTable({
    vocabularies,
    showDifferencesOnly,
}: ComparisonTableProps) {
    const fields = [
        { key: "english", label: "English" },
        { key: "bangla", label: "Bangla" },
        { key: "partOfSpeech", label: "Part of Speech" },
        { key: "pronunciation", label: "Pronunciation" },
        { key: "explanation", label: "Explanation" },
        { key: "examples", label: "Examples Count" },
        { key: "synonyms", label: "Synonyms Count" },
        { key: "antonyms", label: "Antonyms Count" },
    ];

    // Check if all values are the same for a field
    const allSame = (key: string) => {
        const values = vocabularies.map((v) => {
            if (key === "examples" || key === "synonyms" || key === "antonyms") {
                return (v[key] as any[]).length;
            }
            return v[key as keyof Vocabulary];
        });
        return values.every((val) => val === values[0]);
    };

    return (
        <table className="w-full text-xs sm:text-sm">
            <thead>
                <tr className="border-b">
                    <th className="text-left p-2 font-semibold min-w-[120px]">Field</th>
                    {vocabularies.map((vocab, index) => (
                        <th key={vocab.id} className="text-left p-2 font-semibold min-w-[150px]">
                            Vocabulary #{index + 1}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {fields.map((field) => {
                    const isSame = allSame(field.key);
                    if (showDifferencesOnly && isSame) return null;

                    return (
                        <tr
                            key={field.key}
                            className={cn(
                                "border-b",
                                !isSame && "bg-yellow-50 dark:bg-yellow-950/20"
                            )}
                        >
                            <td className="p-2 font-medium text-muted-foreground">
                                {field.label}
                                {!isSame && (
                                    <Badge variant="destructive" className="ml-2 text-xs">
                                        Different
                                    </Badge>
                                )}
                            </td>
                            {vocabularies.map((vocab) => {
                                let value: any;
                                if (field.key === "examples") {
                                    value = vocab.examples.length;
                                } else if (field.key === "synonyms") {
                                    value = vocab.synonyms.length;
                                } else if (field.key === "antonyms") {
                                    value = vocab.antonyms.length;
                                } else {
                                    value = vocab[field.key as keyof Vocabulary];
                                }

                                return (
                                    <td key={vocab.id} className="p-2">
                                        {field.key === "explanation" ? (
                                            <div className="max-w-xs line-clamp-2" title={value}>
                                                {value || "-"}
                                            </div>
                                        ) : (
                                            <div className="break-words">{value || "-"}</div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

// Analysis Helper
function analyzeVocabularies(vocabularies: Vocabulary[]) {
    if (vocabularies.length === 0) {
        return {
            sameEnglish: false,
            sameBangla: false,
            totalExamples: 0,
            totalSynonyms: 0,
            differences: {},
            mostComplete: null,
            recommendation: "",
        };
    }

    const first = vocabularies[0];
    const sameEnglish = vocabularies.every((v) => v.english === first.english);
    const sameBangla = vocabularies.every((v) => v.bangla === first.bangla);

    const totalExamples = vocabularies.reduce(
        (sum, v) => sum + v.examples.length,
        0
    );
    const totalSynonyms = vocabularies.reduce(
        (sum, v) => sum + v.synonyms.length,
        0
    );

    // Find most complete vocabulary
    const mostComplete = vocabularies.reduce((best, current) => {
        const bestScore =
            best.examples.length +
            best.synonyms.length +
            best.antonyms.length +
            (best.explanation?.length || 0);
        const currentScore =
            current.examples.length +
            current.synonyms.length +
            current.antonyms.length +
            (current.explanation?.length || 0);
        return currentScore > bestScore ? current : best;
    });

    // Find differences for each vocabulary
    const differences: { [key: string]: string[] } = {};
    vocabularies.forEach((vocab) => {
        const diffs: string[] = [];

        if (vocab.english !== first.english) {
            diffs.push(`English: "${vocab.english}"`);
        }
        if (vocab.bangla !== first.bangla) {
            diffs.push(`Bangla: "${vocab.bangla}"`);
        }
        if (vocab.partOfSpeech !== first.partOfSpeech) {
            diffs.push(`POS: ${vocab.partOfSpeech}`);
        }
        if (vocab.pronunciation !== first.pronunciation) {
            diffs.push(`Pronunciation: ${vocab.pronunciation}`);
        }
        if (vocab.examples.length !== first.examples.length) {
            diffs.push(`${vocab.examples.length} examples`);
        }
        if (vocab.synonyms.length !== first.synonyms.length) {
            diffs.push(`${vocab.synonyms.length} synonyms`);
        }

        differences[vocab.id] = diffs;
    });

    // Generate recommendation
    let recommendation = "";
    if (sameEnglish && sameBangla) {
        recommendation =
            "These are exact duplicates. Safe to merge - all information will be combined.";
    } else if (sameEnglish) {
        recommendation =
            "Same English word but different Bangla meanings. Review carefully before merging.";
    } else {
        recommendation =
            "Different words. Review the comparison carefully to ensure they are actually duplicates.";
    }

    return {
        sameEnglish,
        sameBangla,
        totalExamples,
        totalSynonyms,
        differences,
        mostComplete,
        recommendation,
    };
}
