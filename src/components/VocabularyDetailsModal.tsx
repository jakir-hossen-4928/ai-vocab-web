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
import { Volume2, Calendar, User, BookOpen, MessageSquare, Activity, Layers } from "lucide-react";
import { speakText } from "@/services/ttsService";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VocabularyDetailsModalProps {
    vocabulary: Vocabulary | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function VocabularyDetailsModal({
    vocabulary,
    open,
    onOpenChange,
}: VocabularyDetailsModalProps) {
    if (!vocabulary) return null;

    const handleSpeak = () => {
        speakText(vocabulary.english);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0">
                <ScrollArea className="max-h-[90vh]">
                    <div className="p-6">
                        <DialogHeader className="mb-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <DialogTitle className="text-2xl sm:text-3xl mb-2">
                                        {vocabulary.bangla}
                                    </DialogTitle>
                                    <DialogDescription className="text-lg sm:text-xl font-medium text-primary">
                                        {vocabulary.english}
                                    </DialogDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleSpeak}
                                    className="flex-shrink-0"
                                >
                                    <Volume2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Part of Speech & Pronunciation */}
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="text-sm">
                                    {vocabulary.partOfSpeech}
                                </Badge>
                                {vocabulary.pronunciation && (
                                    <Badge variant="outline" className="text-sm">
                                        {vocabulary.pronunciation}
                                    </Badge>
                                )}
                            </div>

                            <Separator />

                            {/* Explanation */}
                            {vocabulary.explanation && (
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Explanation
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {vocabulary.explanation}
                                    </p>
                                </div>
                            )}

                            {/* Verb Forms */}
                            {vocabulary.verbForms && vocabulary.partOfSpeech?.toLowerCase().includes("verb") && vocabulary.verbForms.base && (
                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        Verb Forms
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        <div className="p-2 bg-muted/30 rounded-md border text-center">
                                            <span className="text-xs text-muted-foreground block mb-1">Base</span>
                                            <span className="font-medium text-sm break-all">{vocabulary.verbForms.base}</span>
                                        </div>
                                        <div className="p-2 bg-muted/30 rounded-md border text-center">
                                            <span className="text-xs text-muted-foreground block mb-1">Past (V2)</span>
                                            <span className="font-medium text-sm break-all">{vocabulary.verbForms.v2}</span>
                                        </div>
                                        <div className="p-2 bg-muted/30 rounded-md border text-center">
                                            <span className="text-xs text-muted-foreground block mb-1">Past Participle (V3)</span>
                                            <span className="font-medium text-sm break-all">{vocabulary.verbForms.v3}</span>
                                        </div>
                                        <div className="p-2 bg-muted/30 rounded-md border text-center">
                                            <span className="text-xs text-muted-foreground block mb-1">Present Participle (-ing)</span>
                                            <span className="font-medium text-sm break-all">{vocabulary.verbForms.ing}</span>
                                        </div>
                                        <div className="p-2 bg-muted/30 rounded-md border text-center">
                                            <span className="text-xs text-muted-foreground block mb-1">Third Person (s/es)</span>
                                            <span className="font-medium text-sm break-all">{vocabulary.verbForms.s_es}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Related Words */}
                            {vocabulary.relatedWords && Array.isArray(vocabulary.relatedWords) && vocabulary.relatedWords.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Layers className="h-4 w-4" />
                                        Related Words
                                    </h3>
                                    <div className="grid gap-3">
                                        {vocabulary.relatedWords.map((word, index) => (
                                            <Card key={index} className="p-3 bg-muted/30 border-l-4 border-l-primary/50">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2 sm:gap-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold break-all">{word.word}</span>
                                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 flex-shrink-0">
                                                            {word.partOfSpeech}
                                                        </Badge>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">{word.meaning}</span>
                                                </div>
                                                {word.example && (
                                                    <p className="text-xs text-muted-foreground italic mt-1">
                                                        "{word.example}"
                                                    </p>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Examples */}
                            {vocabulary.examples && vocabulary.examples.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        Examples ({vocabulary.examples.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {vocabulary.examples.map((example, index) => (
                                            <Card key={index} className="p-3 bg-muted/30">
                                                <p className="text-sm mb-1">{example.en}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {example.bn}
                                                </p>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Synonyms */}
                            {vocabulary.synonyms && vocabulary.synonyms.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2">
                                        Synonyms ({vocabulary.synonyms.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {vocabulary.synonyms.map((synonym, index) => (
                                            <Badge key={index} variant="outline" className="text-sm">
                                                {synonym}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Antonyms */}
                            {vocabulary.antonyms && vocabulary.antonyms.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2">
                                        Antonyms ({vocabulary.antonyms.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {vocabulary.antonyms.map((antonym, index) => (
                                            <Badge key={index} variant="outline" className="text-sm">
                                                {antonym}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Separator />

                            {/* Metadata */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                        Created: {new Date(vocabulary.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                        Updated: {new Date(vocabulary.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 sm:col-span-2">
                                    <User className="h-3 w-3" />
                                    <span className="truncate">ID: {vocabulary.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
