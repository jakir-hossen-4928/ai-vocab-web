import { Dialog, DialogContent } from "@/components/ui/dialog";
import { VocabularyChat } from "@/components/VocabularyChat";
import { Vocabulary } from "@/types/vocabulary";
import { cn } from "@/lib/utils";
import { hasOpenRouterApiKey, getSelectedModel } from "@/openrouterAi/apiKeyStorage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface WordChatModalProps {
    vocabulary: Vocabulary | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialPrompt?: string;
    model?: string | null;
}

export function WordChatModal({ vocabulary, open, onOpenChange, initialPrompt, model }: WordChatModalProps) {
    if (!vocabulary) return null;

    const storedModel = model ?? getSelectedModel();
    const hasKey = hasOpenRouterApiKey();
    const navigate = useNavigate();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "flex flex-col p-0 bg-background border shadow-lg",
                // Mobile: full screen with safe area insets
                "w-[100vw] h-[100vh] max-w-none max-h-none rounded-none",
                // Tablet: slightly smaller
                "md:w-[95vw] md:h-[95vh] md:rounded-xl",
                // Desktop: fixed size
                "lg:w-[80vw] lg:max-w-[900px] lg:h-[85vh]",
                // Large desktop
                "xl:w-[70vw] xl:max-w-[1000px]",
                // Positioning
                "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                // Safe area for mobile devices
                "safe-area-inset-bottom safe-area-inset-top"
            )}>
                {/* If no keys exist, show the API required prompt only */}
                {!hasKey ? (
                    <div className="p-6 md:p-8 flex flex-col items-center justify-center h-full w-full">
                        <Card className="p-6 max-w-lg w-full text-center">
                            <Alert>
                                <AlertDescription>
                                    AI access is required to chat. Please add your OpenRouter API key in the API Key Setup page.
                                </AlertDescription>
                            </Alert>

                            <div className="mt-6 space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    You need an OpenRouter API key to access AI features. Your key is stored locally in your browser.
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <Button onClick={() => navigate("/api-key-setup")}>
                                        Add API Key
                                    </Button>
                                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    // When keys are present, render VocabularyChat as normal
                    <VocabularyChat
                        vocabulary={vocabulary}
                        onClose={() => onOpenChange(false)}
                        initialPrompt={initialPrompt}
                        isPageMode={false}
                        model={storedModel}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}