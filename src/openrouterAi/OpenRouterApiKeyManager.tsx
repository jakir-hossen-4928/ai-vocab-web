import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Key, Check, Trash2, DollarSign, Zap, ExternalLink } from "lucide-react";
import {
    saveOpenRouterApiKey,
    getOpenRouterApiKey,
    removeOpenRouterApiKey,
    saveSelectedModel,
    getSelectedModel,
    getTotalSpending
} from "@/openrouterAi/apiKeyStorage";
import { OPENROUTER_MODELS, DEFAULT_MODEL, formatCost } from "@/openrouterAi/openRouterConfig";
import { toast } from "sonner";

export function OpenRouterApiKeyManager() {
    const [apiKey, setApiKey] = useState("");
    const [isKeySaved, setIsKeySaved] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
    const [spending, setSpending] = useState({ totalCost: 0, totalTokens: 0, recordCount: 0 });

    useEffect(() => {
        setIsKeySaved(!!getOpenRouterApiKey());
        const savedModel = getSelectedModel();
        if (savedModel) setSelectedModel(savedModel);
        updateSpending();
    }, []);

    const updateSpending = async () => {
        const stats = await getTotalSpending();
        setSpending(stats);
    };

    const handleSave = () => {
        const trimmedKey = apiKey.trim();
        if (!trimmedKey) {
            toast.error("Please enter an API key");
            return;
        }

        if (!trimmedKey.startsWith("sk-or-")) {
            toast.warning("OpenRouter keys usually start with 'sk-or-'");
        }

        saveOpenRouterApiKey(trimmedKey);
        setIsKeySaved(true);
        setApiKey("");
        toast.success("OpenRouter API Key saved successfully!");
    };

    const handleRemove = () => {
        removeOpenRouterApiKey();
        setIsKeySaved(false);
        toast.info("OpenRouter key removed.");
    };

    const handleModelChange = (modelId: string) => {
        setSelectedModel(modelId);
        saveSelectedModel(modelId);
        toast.success(`Model changed to ${OPENROUTER_MODELS.find(m => m.id === modelId)?.name}`);
    };

    const selectedModelData = OPENROUTER_MODELS.find(m => m.id === selectedModel);

    return (
        <div className="space-y-4">
            {/* OpenRouter API Key Section */}
            <Card className="p-4 border-purple-200 bg-purple-50 dark:bg-purple-950/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${isKeySaved ? "bg-purple-100 dark:bg-purple-900" : "bg-muted/10"}`}>
                            <Check className={`h-4 w-4 ${isKeySaved ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                            <h3 className="font-medium text-purple-900 dark:text-purple-100">{isKeySaved ? "OpenRouter API Key Active" : "OpenRouter API Key"}</h3>
                            <p className="text-xs text-purple-700 dark:text-purple-300">{isKeySaved ? "Ready to chat with AI" : "No OpenRouter key saved"}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemove} disabled={!isKeySaved} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                    </Button>
                </div>
            </Card>

            {/* OpenRouter API Key Input */}
            <Card className="p-4">
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="openrouter-api-key" className="text-sm font-semibold">OpenRouter API Key</Label>
                        <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center">
                            Get Key <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                id="openrouter-api-key"
                                type={showKey ? "text" : "password"}
                                placeholder="sk-or-..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <Button onClick={handleSave} disabled={!apiKey}>
                            <Key className="h-4 w-4 mr-2" />
                            Save
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Model Selection */}
            <Card className="p-4">
                <div className="space-y-3">
                    <Label htmlFor="model-select" className="text-sm font-semibold">AI Model</Label>
                    <Select value={selectedModel} onValueChange={handleModelChange}>
                        <SelectTrigger id="model-select">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {OPENROUTER_MODELS.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                    <div className="flex items-center justify-between w-full">
                                        <span>{model.name}</span>
                                        <span className="text-xs text-muted-foreground ml-2">
                                            Free
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {selectedModelData && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-2">
                            <p className="text-xs text-muted-foreground">{selectedModelData.description}</p>
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3 text-green-600" />
                                    <span>Input: Free</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3 text-blue-600" />
                                    <span>Output: Free</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Zap className="h-3 w-3" />
                                <span>Context: {selectedModelData.contextWindow.toLocaleString()} tokens</span>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Usage Statistics */}
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <div className="space-y-2">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Total Spending (All Time)
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded">
                            <p className="text-xs text-muted-foreground">Cost</p>
                            <p className="text-lg font-bold text-green-600">{formatCost(spending.totalCost)}</p>
                        </div>
                        <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded">
                            <p className="text-xs text-muted-foreground">Tokens</p>
                            <p className="text-lg font-bold text-blue-600">{spending.totalTokens.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded">
                            <p className="text-xs text-muted-foreground">Requests</p>
                            <p className="text-lg font-bold text-purple-600">{spending.recordCount}</p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                        💡 All data stored locally on your device
                    </p>
                </div>
            </Card>
        </div>
    );
}
