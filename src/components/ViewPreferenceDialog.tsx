import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, Maximize2 } from "lucide-react";

interface ViewPreferenceDialogProps {
    open: boolean;
    onSelect: (preference: "modal" | "page") => void;
}

export function ViewPreferenceDialog({ open, onSelect }: ViewPreferenceDialogProps) {
    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-2xl">Choose Your Viewing Preference</DialogTitle>
                    <DialogDescription className="text-base">
                        How would you like to view vocabulary details?
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Modal View Option */}
                    <Card
                        className="p-6 cursor-pointer hover:border-primary hover:shadow-lg transition-all group"
                        onClick={() => onSelect("modal")}
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <Maximize2 className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Modal View</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Quick popup overlay that shows details without leaving the page. Perfect for browsing multiple words quickly.
                                </p>
                                <Button className="w-full" onClick={() => onSelect("modal")}>
                                    Choose Modal
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Details Page Option */}
                    <Card
                        className="p-6 cursor-pointer hover:border-primary hover:shadow-lg transition-all group"
                        onClick={() => onSelect("page")}
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <ExternalLink className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Details Page</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Full dedicated page with more space and better focus. Ideal for in-depth study and taking notes.
                                </p>
                                <Button className="w-full" variant="outline" onClick={() => onSelect("page")}>
                                    Choose Page
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                    💡 This preference will be saved in your browser for future visits
                </p>
            </DialogContent>
        </Dialog>
    );
}
