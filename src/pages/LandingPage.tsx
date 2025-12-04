import { useNavigate } from "react-router-dom";
import { Sparkles, Zap, Brain, BookOpen, Trophy, Star, TrendingUp, Target, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function LandingPage() {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    // Features for the landing page
    const features = [
        {
            icon: Brain,
            title: "AI-Powered Learning",
            description: "Smart vocabulary suggestions tailored to your learning level",
            color: "from-blue-500 to-blue-600"
        },
        {
            icon: Zap,
            title: "Quick Practice",
            description: "Master pronunciation with text-to-speech technology",
            color: "from-purple-500 to-purple-600"
        },
        {
            icon: TrendingUp,
            title: "Track Progress",
            description: "Monitor your vocabulary growth with detailed analytics",
            color: "from-green-500 to-green-600"
        },
        {
            icon: Target,
            title: "Spaced Repetition",
            description: "Scientifically proven method for long-term retention",
            color: "from-orange-500 to-orange-600"
        }
    ];

    // App screenshots - ALL images
    const screenshots = [
        { id: 1, title: "Home", description: "Browse and search through thousands of words", image: "/app-image-1.jpg" },
        { id: 2, title: "Vocabulary Collection", description: "In-depth meanings, examples, and pronunciation", image: "/app-image-2.jpg" },
        { id: 3, title: "Favorites", description: "Interactive exercises for better retention", image: "/app-image-3.jpg" },
        { id: 4, title: "Recourses", description: "Visualize your learning journey", image: "/app-image-4.jpg" },
        { id: 5, title: "Vocabulary Details", description: "Grammar guides and study materials", image: "/app-image-5.jpg" },
        { id: 6, title: "Profile", description: "Specialized content for exam success", image: "/app-image-6.jpg" }
    ];

    const stats = [
        { label: "Words Available", value: "5000+", icon: BookOpen },
        { label: "Active Learners", value: "10K+", icon: Trophy },
        { label: "Success Rate", value: "95%", icon: Star }
    ];

    const benefits = [
        "Access 5000+ carefully curated vocabulary words",
        "Practice pronunciation with AI text-to-speech",
        "Track your progress with detailed analytics",
        "Learn at your own pace, anytime, anywhere",
        "Get personalized word recommendations",
        "Prepare for IELTS and other English exams"
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative overflow-hidden"
            >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-blue-600">
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
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 lg:py-24">
                    <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
                        {/* Left: Hero Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center lg:text-left order-2 lg:order-1"
                        >
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                                Master Vocabulary with
                                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-300 mt-2">
                                    AI-Powered Learning
                                </span>
                            </h1>

                            <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 leading-relaxed max-w-xl lg:max-w-none mx-auto lg:mx-0">
                                Transform your language skills with smart, interactive vocabulary building.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                                <Button
                                    onClick={() => navigate("/auth")}
                                    size="lg"
                                    className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all group"
                                >
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button
                                    onClick={() => navigate("/vocabularies")}
                                    size="lg"
                                    variant="outline"
                                    className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold border-2 border-white text-white hover:bg-white/10"
                                >
                                    Browse Words
                                </Button>
                            </div>

                            {/* Stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-6"
                            >
                                {stats.map((stat, i) => (
                                    <div key={i} className="text-center">
                                        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm mb-2 mx-auto">
                                            <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                        </div>
                                        <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                                        <p className="text-xs sm:text-sm text-white/70">{stat.label}</p>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Right: App Preview */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative order-1 lg:order-2 mb-8 lg:mb-0"
                        >
                            <div className="relative max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px] xl:max-w-[450px] mx-auto">
                                <motion.div
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative z-10"
                                >
                                    <img
                                        src="/app-image-1.jpg"
                                        alt="App Preview"
                                        className="rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-4 border-white/20 w-full h-auto object-cover"
                                        style={{ aspectRatio: "9/16" }}
                                    />
                                </motion.div>

                                {/* Floating cards - Hidden on mobile */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                    className="hidden sm:block absolute -right-4 lg:-right-8 top-8 lg:top-12 bg-white rounded-xl shadow-2xl p-3 sm:p-4 max-w-[140px] sm:max-w-[160px] lg:max-w-[180px]"
                                >
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs sm:text-sm font-bold">500+</p>
                                            <p className="text-[10px] sm:text-xs text-muted-foreground">Words</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="hidden sm:block absolute -left-4 lg:-left-8 bottom-8 lg:bottom-12 bg-white rounded-xl shadow-2xl p-3 sm:p-4 max-w-[140px] sm:max-w-[160px] lg:max-w-[180px]"
                                >
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs sm:text-sm font-bold">15 Days</p>
                                            <p className="text-[10px] sm:text-xs text-muted-foreground">Streak</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 space-y-16 sm:space-y-20 lg:space-y-24">
                {/* Features Section */}
                <section>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-8 sm:mb-12 lg:mb-16"
                    >
                        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Features</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                            Everything You Need to Excel
                        </h2>
                        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                            Powerful tools designed to accelerate your vocabulary learning journey
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="p-5 sm:p-6 h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/50">
                                    <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${feature.color} mb-3 sm:mb-4 shadow-lg`}>
                                        <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold mb-2">{feature.title}</h3>
                                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* App Screenshots Gallery - ALL 6 IMAGES */}
                <section className="px-4 sm:px-0">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-8 sm:mb-12 lg:mb-16"
                    >
                        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Explore</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                            See It In Action
                        </h2>
                        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                            Discover all the features that make vocabulary learning effortless
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {screenshots.map((screenshot, i) => (
                            <motion.div
                                key={screenshot.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                className="group cursor-pointer"
                            >
                                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 h-full">
                                    <div className="relative aspect-[9/16] overflow-hidden bg-muted">
                                        <img
                                            src={screenshot.image}
                                            alt={screenshot.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
                                        <div className="absolute inset-0 flex flex-col items-start justify-end p-4 sm:p-6">
                                            <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl mb-1 sm:mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                                {screenshot.title}
                                            </h3>
                                            <p className="text-white/80 text-xs sm:text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                                                {screenshot.description}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Benefits Section */}
                <section>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-8 sm:mb-12 lg:mb-16"
                    >
                        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Why Choose Us</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                            Your Path to Fluency
                        </h2>
                        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                            Join thousands of successful learners who achieved their language goals
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto px-4 sm:px-0">
                        {benefits.map((benefit, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mt-0.5 sm:mt-1">
                                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-sm sm:text-base text-foreground font-medium">{benefit}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden px-4 sm:px-0"
                >
                    <Card className="border-0 shadow-2xl bg-gradient-to-br from-primary via-primary/90 to-blue-600 p-6 sm:p-8 lg:p-12 xl:p-16 text-center relative overflow-hidden">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-white/10 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="absolute bottom-0 left-0 w-48 h-48 sm:w-80 sm:h-80 bg-white/5 rounded-full blur-3xl"
                        />
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6">
                                Ready to Transform Your Vocabulary?
                            </h2>
                            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 lg:mb-10 leading-relaxed">
                                Join thousands of learners achieving fluency with AI-powered practice. Start your journey today!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                <Button
                                    onClick={() => navigate("/auth")}
                                    size="lg"
                                    className="h-12 sm:h-14 lg:h-16 px-6 sm:px-8 lg:px-12 text-base sm:text-lg font-semibold bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-3xl transition-all group"
                                >
                                    Start Learning Now
                                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button
                                    onClick={() => navigate("/vocabularies")}
                                    size="lg"
                                    variant="outline"
                                    className="h-12 sm:h-14 lg:h-16 px-6 sm:px-8 lg:px-12 text-base sm:text-lg font-semibold border-2 border-white text-white hover:bg-white/10"
                                >
                                    Browse Vocabulary
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.section>
            </div>

            {/* Footer */}
            <footer className="bg-muted/30 border-t mt-12 sm:mt-16 lg:mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
                                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                            <span className="text-lg sm:text-xl font-bold">AI Vocabulary Coach</span>
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground mb-4">
                            Master vocabulary with AI-powered learning
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            © {currentYear} AI Vocabulary Coach. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}