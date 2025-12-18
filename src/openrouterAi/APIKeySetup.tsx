import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { OpenRouterApiKeyManager } from "@/openrouterAi/OpenRouterApiKeyManager";

export default function APIKeySetup() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate("/auth");
        }
    }, [user, loading, navigate]);

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
                        <div>
                            <h1 className="text-2xl font-bold">AI API Setup</h1>
                            <p className="text-primary-foreground/80 text-sm">
                                Configure your OpenRouter API key and track usage
                            </p>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-4xl mx-auto px-4 -mt-6">
                {/* API Key Management */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >

                    <OpenRouterApiKeyManager />
                </motion.div>



                {/* Info Footer */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="p-4 bg-muted/30">
                        <p className="text-xs text-muted-foreground">
                            💡 Your API key is stored securely in your browser and never sent to our servers.
                            All usage data is tracked locally for transparency.
                        </p>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
