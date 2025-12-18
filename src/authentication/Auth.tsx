import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Sparkles, Brain, Zap, CheckCircle2 } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export default function Auth() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/home");
        }
    }, [user, navigate]);

    const handleGoogleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            toast.success("Welcome! You're signed in.");
            navigate("/home");
        } catch (error: any) {
            console.error("Sign in error:", error);
            toast.error(error.message || "Failed to sign in. Please try again.");
        }
    };

    const features = [
        { icon: Brain, text: "AI-Powered Learning" },
        { icon: Zap, text: "Quick Practice" },
        { icon: CheckCircle2, text: "Track Progress" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-blue-600 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Animated Background */}
            <motion.div
                animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1]
                }}
                transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-white/10 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    rotate: -360,
                    scale: [1, 1.3, 1]
                }}
                transition={{
                    rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                    scale: { duration: 10, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute bottom-0 left-0 w-48 h-48 sm:w-80 sm:h-80 bg-white/5 rounded-full blur-3xl"
            />

            <div className="relative z-10 w-full max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left: Branding & Features */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center lg:text-left"
                    >
                        {/* Logo */}
                        <div className="inline-flex items-center gap-3 mb-6 lg:mb-8">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                            </div>
                            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                                AI Vocabulary Coach
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                            Master Vocabulary with
                            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-300">
                                AI-Powered Learning
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-white/80 mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Transform your language skills with smart, interactive vocabulary building.
                        </p>

                        {/* Features List */}
                        <div className="hidden sm:flex flex-col gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0">
                            {features.map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + i * 0.1 }}
                                    className="flex items-center gap-3 text-white/90"
                                >
                                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <feature.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                    <span className="text-base sm:text-lg font-medium">{feature.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right: Auth Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Card className="p-6 sm:p-8 lg:p-10 border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                            <div className="text-center mb-6 sm:mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-blue-600 mb-4 sm:mb-6">
                                    <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome!</h2>
                                <p className="text-muted-foreground text-sm sm:text-base">
                                    Sign in to start your learning journey
                                </p>
                            </div>

                            {/* Google Sign In Button */}
                            <Button
                                onClick={handleGoogleSignIn}
                                size="lg"
                                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg transition-all group"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </Button>

                            <div className="mt-6 sm:mt-8 text-center">
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    By signing in, you agree to our Terms of Service
                                </p>
                            </div>

                            {/* Mobile Features (only on small screens) */}
                            <div className="sm:hidden mt-6 pt-6 border-t space-y-3">
                                {features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 text-foreground">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <feature.icon className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="text-sm font-medium">{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Stats - Desktop Only */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="hidden lg:grid grid-cols-3 gap-4 mt-6"
                        >
                            {[
                                { label: "Words", value: "5000+" },
                                { label: "Learners", value: "10K+" },
                                { label: "Success", value: "95%" }
                            ].map((stat, i) => (
                                <div key={i} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3">
                                    <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-xs sm:text-sm text-white/70">{stat.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
