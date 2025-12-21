import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Smartphone,
    Apple,
    Laptop,
    Download,
    ArrowLeft,
    CheckCircle2,
    ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DownloadPage() {
    const navigate = useNavigate();

    const androidUrl = "https://github.com/jakir-hossen-4928/ai-vocab-web/releases/download/app/ai-vicab-web.apk";

    return (
        <div className="min-h-screen relative font-sans text-foreground selection:bg-primary/10 overflow-x-hidden">
            {/* Background Image & Overlay */}
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
                style={{ backgroundImage: "url('/background3.jpg')" }}
            />
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-0" />

            <div className="relative z-10">

                <main className="max-w-4xl mx-auto px-6 pb-24 pt-24">
                    {/* Hero */}
                    <div className="mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white"
                        >
                            Download the App
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-200 max-w-2xl"
                        >
                            Master vocabulary on the go. Currently available for Android, with more platforms coming soon.
                        </motion.p>
                    </div>

                    {/* Primary Download (Android) */}
                    <section className="mb-20">
                        <div className="bg-card border rounded-2xl p-8 sm:p-12 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-bold mb-4">
                                        <Smartphone className="h-3 w-3" />
                                        Android • v1.0.0
                                    </div>
                                    <h2 className="text-3xl font-bold mb-3">Download for Android</h2>
                                    <p className="text-muted-foreground mb-6">
                                        Get the official APK to start your learning journey.
                                    </p>
                                    <Button
                                        size="lg"
                                        className="h-14 px-8 text-lg font-bold rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1"
                                        onClick={() => window.open(androidUrl, '_blank')}
                                    >
                                        <Download className="mr-3 h-5 w-5" />
                                        Download APK
                                    </Button>
                                </div>

                                <div className="flex-shrink-0 grid grid-cols-1 gap-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                        <span>AI Pronunciation</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                        <span>Daily Vocabulary</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                        <span>Sync Progress</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Other Platforms */}
                    <section className="mb-20">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-6">Other Platforms</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="group p-6 rounded-2xl border bg-white shadow-sm flex items-center justify-between transition-all">
                                <div className="flex items-center gap-4 opacity-40 grayscale">
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <Apple className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">iOS (iPhone)</h4>
                                        <p className="text-xs font-medium text-slate-500">Coming Soon</p>
                                    </div>
                                </div>
                            </div>
                            <div className="group p-6 rounded-2xl border bg-white shadow-sm flex items-center justify-between transition-all">
                                <div className="flex items-center gap-4 opacity-40 grayscale">
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <Laptop className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Windows Desktop</h4>
                                        <p className="text-xs font-medium text-slate-500">Coming Soon</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>


            </div>
        </div>
    );
}
