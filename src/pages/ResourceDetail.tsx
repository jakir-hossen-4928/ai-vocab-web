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
import parse from "html-react-parser";
import { LexkitViewer } from "@/components/LexkitViewer";
import { useResourcesSimple } from "@/hooks/useResources";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipe } from "@/hooks/useSwipe";
import { metaService } from "@/services/metaService";
import { Helmet } from "react-helmet-async";
import { CachedImage } from "@/components/CachedImage";
import { useTrackResource } from "@/hooks/useAnalytics";

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
    const { slug } = useParams();
    const id = slug ? decodeURIComponent(slug) : undefined;
    const navigate = useNavigate();
    const [grammar, setGrammar] = useState<GrammarImage | null>(null);
    const [loading, setLoading] = useState(true);

    const { data: resources = [] } = useResourcesSimple();
    const isMobile = useIsMobile();
    const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
    const [showSwipeHint, setShowSwipeHint] = useState(true);

    // Analytics tracking
    const trackResource = useTrackResource();

    useEffect(() => {
        if (isMobile) {
            const timer = setTimeout(() => setShowSwipeHint(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isMobile]);

    const handleSwipeLeft = () => {
        const currentIndex = resources.findIndex(r => r.id === id || r.slug === id);
        if (currentIndex !== -1 && currentIndex < resources.length - 1) {
            setSlideDirection('right');
            const nextResource = resources[currentIndex + 1];
            navigate(`/resources/${nextResource.slug || nextResource.id}`);
        }
    };

    const handleSwipeRight = () => {
        const currentIndex = resources.findIndex(r => r.id === id || r.slug === id);
        if (currentIndex > 0) {
            setSlideDirection('left');
            const prevResource = resources[currentIndex - 1];
            navigate(`/resources/${prevResource.slug || prevResource.id}`);
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

            // Try to find in cache first (by ID or Slug)
            const cachedResource = resources.find(r => r.id === id || r.slug === id);
            if (cachedResource) {
                setGrammar(cachedResource);
                setLoading(false);

                // Track resource view
                trackResource(cachedResource.id, true);
                return;
            }

            try {
                // First try to fetch as ID
                const docRef = doc(db, "grammar_images", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const resourceData = { id: docSnap.id, ...docSnap.data() } as GrammarImage;
                    setGrammar(resourceData);
                    trackResource(resourceData.id, true);
                } else {
                    // Try to fetch by slug if ID lookup fails
                    const { collection, query, where, getDocs, limit } = await import("firebase/firestore");
                    const q = query(
                        collection(db, "grammar_images"),
                        where("slug", "==", id),
                        limit(1)
                    );
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const resDoc = querySnapshot.docs[0];
                        const resourceData = { id: resDoc.id, ...resDoc.data() } as GrammarImage;
                        setGrammar(resourceData);
                        trackResource(resourceData.id, true);
                    } else {
                        toast.error("Resource not found");
                        navigate("/resources");
                    }
                }
            } catch (error) {
                console.error("Error loading resource:", error);
                toast.error("Failed to load resource details");
            } finally {
                setLoading(false);
            }
        };

        loadResource();
    }, [id, navigate, resources, trackResource]);

    // Meta tags are now handles by react-helmet-async in the render

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

    // Check if content looks like HTML (basic heuristic)
    const description = grammar.description || "";
    const isHtml = description.trim().startsWith("<") && (description.includes("</") || description.includes("/>"));

    return (
        <div className="min-h-screen bg-background pb-20 overflow-x-hidden" {...containerProps}>
            {grammar && (
                <Helmet>
                    <title>{grammar.title} | Ai Vocab Resources</title>
                    <meta name="description" content={grammar.description?.substring(0, 160).replace(/[#*`]/g, '') || 'Educational resource'} />
                    <meta property="og:title" content={grammar.title} />
                    <meta property="og:description" content={grammar.description?.substring(0, 160).replace(/[#*`]/g, '') || 'Educational resource'} />
                    <meta property="og:image" content={grammar.imageUrl || '/og_image.png'} />
                    <meta property="og:type" content="article" />
                    <meta name="twitter:card" content="summary_large_image" />
                </Helmet>
            )}
            {/* Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/resources")} className="gap-2 font-medium">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Gallery
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={handleShare} className="rounded-full">
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
                    <article className="max-w-3xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
                        {/* Article Header */}
                        <motion.header
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 md:mb-12 text-center space-y-6 w-full"
                        >
                            <div className="space-y-4">
                                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground balance-text">
                                    {grammar.title}
                                </h1>

                                {grammar.createdAt && (
                                    <div className="flex items-center justify-center gap-4 text-muted-foreground text-sm font-medium">
                                        <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <time dateTime={grammar.createdAt}>
                                                {format(new Date(grammar.createdAt), "MMMM d, yyyy")}
                                            </time>
                                        </div>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full hidden sm:inline">Resource Guide</span>
                                    </div>
                                )}
                            </div>
                        </motion.header>

                        {/* Article Cover Image */}
                        {grammar.imageUrl && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mb-10 md:mb-16 -mx-4 md:mx-0 w-full"
                            >
                                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border bg-muted flex items-center justify-center">
                                    <CachedImage
                                        src={grammar.thumbnailUrl || grammar.imageUrl}
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110"
                                        loading="lazy"
                                    />
                                    <CachedImage
                                        src={grammar.imageUrl}
                                        alt={grammar.title}
                                        className="relative z-10 w-full h-full object-cover"
                                        width={1920}
                                        height={1080}
                                    />
                                </div>
                            </motion.div>
                        )}


                        {/* Article Content */}
                        {grammar.description && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="resource-content-container w-full"
                            >
                                {isHtml ? (
                                    <div className="prose prose-blue dark:prose-invert max-w-none">
                                        {parse(grammar.description)}
                                    </div>
                                ) : (
                                    <LexkitViewer markdown={grammar.description} className="min-h-[200px]" />
                                )}
                            </motion.div>
                        )}

                        {/* Footer / Divider */}
                        <div className="mt-16 pt-8 border-t text-center text-muted-foreground w-full">
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
