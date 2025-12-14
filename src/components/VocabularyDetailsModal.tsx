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
import { Button } from "@/components/ui/button";
import { Volume2, BookOpen, MessageSquare, Activity, Layers, ArrowRightLeft, Copy, Heart, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { speakText } from "@/services/ttsService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useVocabularyMutations } from "@/hooks/useVocabularies";
import { confirmAction, showSuccessToast, showErrorToast } from "@/utils/sweetAlert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import PARTS_OF_SPEECH from "@/data/partOfSpeech.json";

interface VocabularyDetailsModalProps {
    vocabulary: Vocabulary | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isFavorite?: boolean;
    onToggleFavorite?: (id: string) => void;
    isAdmin?: boolean;
    onNext?: () => void;
    onPrevious?: () => void;
    hasNext?: boolean;
    hasPrevious?: boolean;
}

// Helper component for TTS button
const TTSButton = ({ text, className }: { text: string; className?: string }) => (
    <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
            e.stopPropagation();
            speakText(text);
        }}
        className={`h-6 w-6 text-muted-foreground hover:text-primary rounded-full hover:bg-primary/10 transition-colors ${className}`}
        title="Listen"
    >
        <Volume2 className="h-3 w-3" />
    </Button>
);

export function VocabularyDetailsModal({
    vocabulary,
    open,
    onOpenChange,
    isFavorite = false,
    onToggleFavorite,
    isAdmin = false,
    onNext,
    onPrevious,
    hasNext = false,
    hasPrevious = false,
}: VocabularyDetailsModalProps) {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editedVocab, setEditedVocab] = useState<Vocabulary | null>(null);
    const { updateVocabulary } = useVocabularyMutations();

    useEffect(() => {
        if (vocabulary) {
            setEditedVocab(vocabulary);
        }
    }, [vocabulary]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return;

            if (e.key === "ArrowLeft" && hasPrevious && onPrevious && !isEditing) {
                onPrevious();
            } else if (e.key === "ArrowRight" && hasNext && onNext && !isEditing) {
                onNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, hasNext, hasPrevious, onNext, onPrevious, isEditing]);

    if (!vocabulary) return null;

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedVocab(vocabulary);
    };



    const handleSave = async () => {
        if (!editedVocab) return;
        try {
            await updateVocabulary.mutateAsync({
                id: editedVocab.id,
                data: editedVocab
            });
            setIsEditing(false);
            showSuccessToast("Vocabulary updated successfully");
        } catch (error) {
            showErrorToast("Failed to update vocabulary");
        }
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border-none shadow-2xl">
                {/* Navigation Buttons - Desktop */}
                {(hasPrevious || hasNext) && (
                    <>
                        {hasPrevious && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onPrevious}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-background/50 hover:bg-primary hover:text-primary-foreground border border-muted-foreground/20 hover:border-primary shadow-md backdrop-blur-sm hidden sm:flex transition-all duration-300"
                                aria-label="Previous vocabulary"
                            >
                                <ChevronLeft className="h-8 w-8" />
                            </Button>
                        )}
                        {hasNext && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-background/50 hover:bg-primary hover:text-primary-foreground border border-muted-foreground/20 hover:border-primary shadow-md backdrop-blur-sm hidden sm:flex transition-all duration-300"
                                aria-label="Next vocabulary"
                            >
                                <ChevronRight className="h-8 w-8" />
                            </Button>
                        )}
                    </>
                )}
                <ScrollArea className="flex-1 h-full [&>[data-radix-scroll-area-viewport]]:!overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    <div className="py-6 px-6 sm:px-20 space-y-8 pb-20">
                        {/* Header Section */}
                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 -mx-6 sm:-mx-20 -mt-6 p-8 sm:px-20 border-b relative">
                            {/* Action Buttons */}
                            <div className="absolute top-4 right-12 flex gap-2">
                                {isEditing ? (
                                    <>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={handleSave}
                                            className="shadow-sm"
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancelEdit}
                                            className="shadow-sm"
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        {onToggleFavorite && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onToggleFavorite(vocabulary.id)}
                                                className="h-9 w-9 rounded-full bg-background/50 hover:bg-background shadow-sm backdrop-blur-sm"
                                                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                                            >
                                                <Heart className={`h-5 w-5 ${isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                                            </Button>
                                        )}
                                        {isAdmin && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={handleEditClick}
                                                    className="h-9 w-9 rounded-full bg-background/50 hover:bg-background shadow-sm backdrop-blur-sm"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-5 w-5 text-muted-foreground" />
                                                </Button>

                                            </>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Mobile Navigation - Top */}
                            {(hasPrevious || hasNext) && (
                                <div className="flex sm:hidden justify-between items-center mb-4 -mt-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onPrevious}
                                        disabled={!hasPrevious}
                                        className={`h-8 w-8 rounded-full ${!hasPrevious ? 'opacity-0' : ''}`}
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <span className="text-xs text-muted-foreground font-medium">Swipe to navigate</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onNext}
                                        disabled={!hasNext}
                                        className={`h-8 w-8 rounded-full ${!hasNext ? 'opacity-0' : ''}`}
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            )}

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 flex-wrap">
                                    {isEditing && editedVocab ? (
                                        <>
                                            <Select
                                                value={editedVocab.partOfSpeech}
                                                onValueChange={(value) => setEditedVocab({
                                                    ...editedVocab,
                                                    partOfSpeech: value,
                                                    verbForms: value === "Verb" && !editedVocab.verbForms
                                                        ? { base: "", v2: "", v3: "", ing: "", s_es: "" }
                                                        : editedVocab.verbForms
                                                })}
                                            >
                                                <SelectTrigger className="w-[140px] h-8 text-xs">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PARTS_OF_SPEECH.map((pos) => (
                                                        <SelectItem key={pos} value={pos}>
                                                            {pos}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                value={editedVocab.pronunciation || ""}
                                                onChange={(e) => setEditedVocab({ ...editedVocab, pronunciation: e.target.value })}
                                                placeholder="Pronunciation"
                                                className="h-8 text-xs w-[200px]"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Badge className="text-sm px-3 py-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                                                {vocabulary.partOfSpeech}
                                            </Badge>
                                            {vocabulary.pronunciation && (
                                                <span className="text-sm text-muted-foreground font-mono bg-background/50 px-3 py-1 rounded-full border shadow-sm backdrop-blur-sm">
                                                    {vocabulary.pronunciation}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {isEditing && editedVocab ? (
                                        <div className="space-y-4 max-w-xl">
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground">Bangla</label>
                                                <Input
                                                    value={editedVocab.bangla}
                                                    onChange={(e) => setEditedVocab({ ...editedVocab, bangla: e.target.value })}
                                                    className="text-2xl font-bold"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground">English</label>
                                                <Input
                                                    value={editedVocab.english}
                                                    onChange={(e) => setEditedVocab({ ...editedVocab, english: e.target.value })}
                                                    className="text-xl"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <DialogTitle className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                                                {vocabulary.bangla}
                                            </DialogTitle>
                                            <div className="flex items-center gap-3">
                                                <DialogDescription className="text-xl sm:text-2xl font-medium text-primary">
                                                    {vocabulary.english}
                                                </DialogDescription>
                                                <TTSButton text={vocabulary.english} className="h-10 w-10" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Explanation */}
                        {vocabulary.explanation && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/80">
                                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                        <MessageSquare className="h-4 w-4" />
                                    </div>
                                    Explanation
                                </h3>
                                <Card className="p-5 bg-muted/30 border-none shadow-sm">
                                    {isEditing && editedVocab ? (
                                        <Textarea
                                            value={editedVocab.explanation}
                                            onChange={(e) => setEditedVocab({ ...editedVocab, explanation: e.target.value })}
                                            className="min-h-[100px] bg-background"
                                        />
                                    ) : (
                                        <p className="text-base leading-relaxed text-foreground/90">
                                            {vocabulary.explanation}
                                        </p>
                                    )}
                                </Card>
                            </div>
                        )}

                        {/* Verb Forms - Show if Verb and (has forms OR is editing) */}
                        {editedVocab && (editedVocab.partOfSpeech === "Verb" || (vocabulary.verbForms && vocabulary.partOfSpeech?.toLowerCase().includes("verb"))) && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/80">
                                    <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-500">
                                        <Activity className="h-4 w-4" />
                                    </div>
                                    Verb Forms
                                </h3>
                                {isEditing ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {[
                                            { key: "base", label: "Base" },
                                            { key: "v2", label: "Past (V2)" },
                                            { key: "v3", label: "Past Part (V3)" },
                                            { key: "ing", label: "Present Part (-ing)" },
                                            { key: "s_es", label: "3rd Person (s/es)" },
                                        ].map((field) => (
                                            <div key={field.key} className="space-y-1">
                                                <label className="text-xs text-muted-foreground">{field.label}</label>
                                                <Input
                                                    value={editedVocab.verbForms?.[field.key as keyof typeof editedVocab.verbForms] || ""}
                                                    onChange={(e) => setEditedVocab({
                                                        ...editedVocab,
                                                        verbForms: {
                                                            ...(editedVocab.verbForms || { base: "", v2: "", v3: "", ing: "", s_es: "" }),
                                                            [field.key]: e.target.value
                                                        }
                                                    })}
                                                    className="h-8 text-sm"
                                                    placeholder={field.label}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    vocabulary.verbForms && vocabulary.verbForms.base && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                            {[
                                                { label: "Base", value: vocabulary.verbForms.base },
                                                { label: "Past (V2)", value: vocabulary.verbForms.v2 },
                                                { label: "Past Part (V3)", value: vocabulary.verbForms.v3 },
                                                { label: "Present Part (-ing)", value: vocabulary.verbForms.ing },
                                                { label: "3rd Person (s/es)", value: vocabulary.verbForms.s_es },
                                            ].map((form, idx) => (
                                                <Card key={idx} className="p-3 flex flex-col items-center justify-center text-center bg-background border hover:border-primary/30 hover:shadow-md transition-all duration-200">
                                                    <span className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">{form.label}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-sm">{form.value}</span>
                                                        <TTSButton text={form.value} className="h-5 w-5" />
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        {/* Examples */}
                        {(isEditing || (vocabulary.examples && vocabulary.examples.length > 0)) && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/80">
                                        <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                        Examples
                                    </h3>
                                    {isEditing && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditedVocab(prev => ({
                                                ...prev!,
                                                examples: [...(prev!.examples || []), { bn: "", en: "" }]
                                            }))}
                                            className="h-7 text-xs"
                                        >
                                            <Plus className="h-3 w-3 mr-1" /> Add
                                        </Button>
                                    )}
                                </div>

                                {isEditing && editedVocab ? (
                                    <div className="space-y-3">
                                        {editedVocab.examples?.map((example, index) => (
                                            <Card key={index} className="p-4 bg-background border space-y-3 relative group">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-6 w-6 text-destructive hover:bg-destructive/10"
                                                    onClick={() => setEditedVocab(prev => ({
                                                        ...prev!,
                                                        examples: prev!.examples?.filter((_, i) => i !== index)
                                                    }))}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-muted-foreground">English</label>
                                                    <Input
                                                        value={example.en}
                                                        onChange={(e) => {
                                                            const newExamples = [...(editedVocab.examples || [])];
                                                            newExamples[index] = { ...newExamples[index], en: e.target.value };
                                                            setEditedVocab({ ...editedVocab, examples: newExamples });
                                                        }}
                                                        className="h-8"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-muted-foreground">Bangla</label>
                                                    <Input
                                                        value={example.bn}
                                                        onChange={(e) => {
                                                            const newExamples = [...(editedVocab.examples || [])];
                                                            newExamples[index] = { ...newExamples[index], bn: e.target.value };
                                                            setEditedVocab({ ...editedVocab, examples: newExamples });
                                                        }}
                                                        className="h-8"
                                                    />
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {vocabulary.examples.map((example, index) => (
                                            <Card key={index} className="p-4 bg-background border hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-1.5">
                                                        <p className="text-base font-medium text-foreground/90 leading-snug">{example.en}</p>
                                                        <p className="text-sm text-muted-foreground">{example.bn}</p>
                                                    </div>
                                                    <TTSButton text={example.en} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Related Words */}
                        {vocabulary.relatedWords && Array.isArray(vocabulary.relatedWords) && vocabulary.relatedWords.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/80">
                                    <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500">
                                        <Layers className="h-4 w-4" />
                                    </div>
                                    Related Words
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {vocabulary.relatedWords.map((word, index) => (
                                        <Card
                                            key={index}
                                            className="p-4 bg-background border hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
                                            onClick={() => speakText(word.word)}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                        <span className="font-bold text-base group-hover:text-primary transition-colors">{word.word}</span>
                                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                                            {word.partOfSpeech}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">{word.meaning}</p>
                                                    {word.example && (
                                                        <p className="text-xs text-muted-foreground/80 italic border-l-2 pl-2 border-primary/20">
                                                            "{word.example}"
                                                        </p>
                                                    )}
                                                </div>
                                                <Volume2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Synonyms & Antonyms */}
                        {(isEditing || vocabulary.synonyms?.length > 0 || vocabulary.antonyms?.length > 0) && (
                            <div className="grid sm:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/80">
                                        <div className="p-1.5 rounded-md bg-green-500/10 text-green-500">
                                            <Copy className="h-4 w-4" />
                                        </div>
                                        Synonyms
                                    </h3>
                                    {isEditing && editedVocab ? (
                                        <Input
                                            value={editedVocab.synonyms?.join(", ") || ""}
                                            onChange={(e) => setEditedVocab({
                                                ...editedVocab,
                                                synonyms: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                                            })}
                                            placeholder="Comma separated (e.g. happy, joyful)"
                                        />
                                    ) : (
                                        vocabulary.synonyms && vocabulary.synonyms.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {vocabulary.synonyms.map((synonym, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="secondary"
                                                        className="pl-3 pr-2 py-1.5 flex items-center gap-2 hover:bg-primary/20 hover:text-primary cursor-pointer transition-all text-sm font-normal group"
                                                        onClick={() => speakText(synonym)}
                                                    >
                                                        {synonym}
                                                        <Volume2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </Badge>
                                                ))}
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/80">
                                        <div className="p-1.5 rounded-md bg-red-500/10 text-red-500">
                                            <ArrowRightLeft className="h-4 w-4" />
                                        </div>
                                        Antonyms
                                    </h3>
                                    {isEditing && editedVocab ? (
                                        <Input
                                            value={editedVocab.antonyms?.join(", ") || ""}
                                            onChange={(e) => setEditedVocab({
                                                ...editedVocab,
                                                antonyms: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                                            })}
                                            placeholder="Comma separated (e.g. sad, unhappy)"
                                        />
                                    ) : (
                                        vocabulary.antonyms && vocabulary.antonyms.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {vocabulary.antonyms.map((antonym, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="outline"
                                                        className="pl-3 pr-2 py-1.5 flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-all text-sm font-normal group border-destructive/20"
                                                        onClick={() => speakText(antonym)}
                                                    >
                                                        {antonym}
                                                        <Volume2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </Badge>
                                                ))}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
