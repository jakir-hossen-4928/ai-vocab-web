import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GrammarImage } from "@/types/grammar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Calendar, Share2, Download } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import parse from "html-react-parser";
import { useResourcesSimple } from "@/hooks/useResources";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipe } from "@/hooks/useSwipe";

const SwipeHint = ({ onDismiss }: { onDismiss: () => void }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onAnimationComplete={() => setTimeout(onDismiss, 2500)}
        className="fixed bottom-8 left-0 right-0 pointer-events-none z-50 flex justify-center pb-4"
    >
        <div className="bg-black/60 text-white px-6 py-2 rounded-full flex items-center gap-3 backdrop-blur-md shadow-lg">
            <ArrowLeft className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-medium">Swipe to navigate</span>
            <ArrowRight className="w-4 h-4 animate-pulse" />
        </div>
    </motion.div>
);

export default function ResourceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [grammar, setGrammar] = useState<GrammarImage | null>(null);
    const [loading, setLoading] = useState(true);

    const { data: resources = [] } = useResourcesSimple();
    const isMobile = useIsMobile();
    const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
    const [showSwipeHint, setShowSwipeHint] = useState(true);

    useEffect(() => {
        if (isMobile) {
            const timer = setTimeout(() => setShowSwipeHint(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isMobile]);

    const handleSwipeLeft = () => {
        const currentIndex = resources.findIndex(r => r.id === id);
        if (currentIndex !== -1 && currentIndex < resources.length - 1) {
            setSlideDirection('right');
            navigate(`/resources/${resources[currentIndex + 1].id}`);
        }
    };

    const handleSwipeRight = () => {
        const currentIndex = resources.findIndex(r => r.id === id);
        if (currentIndex > 0) {
            setSlideDirection('left');
            navigate(`/resources/${resources[currentIndex - 1].id}`);
        }
    };

    const swipeHandlers = useSwipe({
        onSwipeLeft: handleSwipeLeft,
        onSwipeRight: handleSwipeRight,
    });

    const containerProps = isMobile ? swipeHandlers : {};

    useEffect(() => {
        const loadResource = async () => {
            if (!id) return;
            setLoading(true);

            // Try to find in cache first
            const cachedResource = resources.find(r => r.id === id);
            if (cachedResource) {
                setGrammar(cachedResource);
                setLoading(false);
                return;
            }

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

        loadResource();
    }, [id, navigate, resources]);

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
        <div className="min-h-screen bg-background pb-20 overflow-x-hidden" {...containerProps}>
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

            <AnimatePresence mode="popLayout" initial={false} custom={slideDirection}>
                <motion.div
                    key={id}
                    custom={slideDirection}
                    initial={{ x: slideDirection === 'right' ? 300 : -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: slideDirection === 'right' ? -300 : 300, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-full"
                >
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
                                    {isHtml ? parse(grammar.description, {
                                        replace: (domNode) => {
                                            if (domNode.type === 'tag' && domNode.name === 'img') {
                                                const { attribs } = domNode;
                                                // Ensure basic optimization attributes are present if not already
                                                if (!attribs.loading) attribs.loading = 'lazy';
                                                if (!attribs.decoding) attribs.decoding = 'async';
                                                // Optional: add a class for smooth loading transition if you had CSS for it
                                                return domNode;
                                            }
                                        }
                                    }) : <ReactMarkdown
                                        components={{
                                            img: (props) => (
                                                <img {...props} loading="lazy" decoding="async" className="rounded-xl shadow-lg" />
                                            )
                                        }}
                                    >{grammar.description}</ReactMarkdown>}
                                </div>
                            </motion.div>
                        )}

                        {/* Footer / Divider */}
                        <div className="mt-16 pt-8 border-t text-center text-muted-foreground">
                            <p className="text-sm">Thanks for reading! Keep practicing to master this topic.</p>
                        </div>
                    </article>
                </motion.div>
            </AnimatePresence>

            {isMobile && showSwipeHint && (
                <AnimatePresence>
                    <SwipeHint onDismiss={() => setShowSwipeHint(false)} />
                </AnimatePresence>
            )}
        </div>
    );
}
