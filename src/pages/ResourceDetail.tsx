import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GrammarImage } from "@/types/grammar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Share2, Download } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import parse from "html-react-parser";

export default function ResourceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [grammar, setGrammar] = useState<GrammarImage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrammar = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, "grammar_images", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setGrammar({ id: docSnap.id, ...docSnap.data() } as GrammarImage);
                } else {
                    toast.error("Resource not found");
                    navigate("/resources");
                }
            } catch (error) {
                toast.error("Failed to load resource details");
            } finally {
                setLoading(false);
            }
        };

        fetchGrammar();
    }, [id, navigate]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: grammar?.title,
                    text: `Check out this resource: ${grammar?.title}`,
                    url: window.location.href,
                });
            } catch (error) {
                // Ignore share errors
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!grammar) return null;

    const isHtml = /<[a-z][\s\S]*>/i.test(grammar.description || '');

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/resources")} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Gallery
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={handleShare}>
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </nav>

            <article className="max-w-3xl mx-auto px-4 py-8 md:py-12">
                {/* Article Header */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 md:mb-12 text-center space-y-6"
                >
                    <div className="space-y-4">
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
                            {grammar.title}
                        </h1>

                        {grammar.createdAt && (
                            <div className="flex items-center justify-center gap-4 text-muted-foreground text-sm">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    <time dateTime={grammar.createdAt}>
                                        {format(new Date(grammar.createdAt), "MMMM d, yyyy")}
                                    </time>
                                </div>
                                <span>•</span>
                                <span>Resource Guide</span>
                            </div>
                        )}
                    </div>
                </motion.header>

                {/* Featured Image */}
                {grammar.imageUrl && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-10 md:mb-14"
                    >
                        <div className="relative w-full rounded-2xl overflow-hidden shadow-xl bg-muted/30 flex items-center justify-center" style={{ minHeight: '400px', maxHeight: '600px' }}>
                            <img
                                src={grammar.imageUrl}
                                alt={grammar.title}
                                className="w-full h-full object-contain max-h-[600px]"
                            />
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute top-4 right-4 shadow-sm bg-background/80 backdrop-blur-sm hover:bg-background"
                                onClick={() => window.open(grammar.imageUrl, '_blank')}
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Article Content */}
                {grammar.description && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="prose prose-lg dark:prose-invert max-w-none
                            prose-headings:font-bold prose-headings:tracking-tight
                            prose-p:leading-relaxed prose-p:text-muted-foreground
                            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                            prose-img:rounded-xl prose-img:shadow-lg
                            prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none"
                        >
                            {isHtml ? parse(grammar.description) : <ReactMarkdown>{grammar.description}</ReactMarkdown>}
                        </div>
                    </motion.div>
                )}

                {/* Footer / Divider */}
                <div className="mt-16 pt-8 border-t text-center text-muted-foreground">
                    <p className="text-sm">Thanks for reading! Keep practicing to master this topic.</p>
                </div>
            </article>
        </div>
    );
}
