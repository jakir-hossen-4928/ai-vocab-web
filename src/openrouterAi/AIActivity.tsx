import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Download, Trash2, Settings } from "lucide-react";
import { getAllTokenUsage, clearAllData } from "@/openrouterAi/apiKeyStorage";
import { getModelById, formatCost, isGoogleModel } from "@/openrouterAi/openRouterConfig";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


export default function AIActivity() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [allUsage, setAllUsage] = useState<any[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            navigate("/auth");
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        loadActivity();
    }, []);

    const loadActivity = async () => {
        const usage = await getAllTokenUsage();
        setAllUsage(usage.reverse()); // Most recent first
    };

    const handleClearHistory = async () => {
        await clearAllData();
        await loadActivity();
        toast.success("AI activity history cleared");
    };

    const handleExportData = () => {
        const dataStr = JSON.stringify(allUsage, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai-activity-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Activity data exported");
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12"
            >
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="text-white hover:bg-white/20"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">AI Activity</h1>
                            <p className="text-primary-foreground/80 text-sm">
                                Vocabularies generated with AI
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/api-key-setup")}
                            className="text-white hover:bg-white/20"
                            title="API Settings"
                        >
                            <Settings className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-4xl mx-auto px-4 -mt-6">
                {/* Quick Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <Card className="p-6 shadow-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Total AI Generations</p>
                                <p className="text-3xl font-bold">{allUsage.length}</p>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <TrendingUp className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-3 mb-6"
                >
                    <Button
                        onClick={handleExportData}
                        variant="outline"
                        disabled={allUsage.length === 0}
                        className="flex-1"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                disabled={allUsage.length === 0}
                                className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear History
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Clear AI Activity History?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete all your AI usage records and chat sessions. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearHistory} className="bg-destructive hover:bg-destructive/90">
                                    Clear History
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </motion.div>

                {/* Activity History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">Activity History</h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/api-key-setup")}
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            View Stats
                        </Button>
                    </div>

                    {allUsage.length > 0 ? (
                        <Card className="p-6">
                            <div className="space-y-2">
                                {allUsage.map((record) => {
                                    const model = getModelById(record.modelId);

                                    return (
                                        <div key={record.id} className="flex items-center justify-between text-sm p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex-1">
                                                <p className="font-medium">{record.vocabularyWord}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(record.timestamp).toLocaleString()} • {model?.name || record.modelId} • OpenRouter
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-green-600">{formatCost(record.cost || 0)}</p>
                                                <p className="text-xs text-muted-foreground">{(record.totalTokens || 0).toLocaleString()} tokens</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <TrendingUp className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No Activity Yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Your AI-generated vocabularies will appear here when you start using AI features.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/api-key-setup")}
                                >
                                    <Settings className="h-4 w-4 mr-2" />
                                    Setup API Key
                                </Button>
                            </div>
                        </Card>
                    )}
                </motion.div>

                {/* Info Footer */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="p-4 bg-muted/30">
                        <p className="text-xs text-muted-foreground">
                            💡 This shows which vocabularies were generated using AI. For detailed token usage and cost tracking, visit the API Key Setup page.
                        </p>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
