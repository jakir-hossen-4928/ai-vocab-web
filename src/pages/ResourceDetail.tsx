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
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import parse from "html-react-parser";
import { useResourcesSimple } from "@/hooks/useResources";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipe } from "@/hooks/useSwipe";
import { metaService } from "@/services/metaService";
import { Helmet } from "react-helmet-async";
import { CachedImage } from "@/components/CachedImage";

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
                return;
            }

            try {
                // First try to fetch as ID
                const docRef = doc(db, "grammar_images", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setGrammar({ id: docSnap.id, ...docSnap.data() } as GrammarImage);
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
                        setGrammar({ id: resDoc.id, ...resDoc.data() } as GrammarImage);
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
    }, [id, navigate, resources]);

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

    // Check if content looks like HTML
    const trimmedDesc = grammar.description?.trim() || '';
    // Improved detection: starts with tag or contains common block tags at start of lines or inside
    const isHtml = /^<[a-z]/i.test(trimmedDesc) ||
        /<\/?(p|div|ul|ol|li|h[1-6]|br|table|section|article|header|footer|span|b|i|strong|em)\b/i.test(trimmedDesc);

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
                    <article className="max-w-3xl mx-auto px-4 py-8 md:py-12">
                        {/* Article Header */}
                        <motion.header
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 md:mb-12 text-center space-y-6"
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
                                className="mb-10 md:mb-16 -mx-4 md:mx-0"
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
                                className="resource-content-container"
                            >
                                <div className="prose prose-blue dark:prose-invert max-w-none
                            prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight
                            prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mb-4 prose-h2:mt-8
                            prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mb-3 prose-h3:mt-6
                            prose-p:leading-relaxed prose-p:text-muted-foreground/90 prose-p:mb-5
                            prose-ul:my-6 prose-li:my-1 prose-li:text-muted-foreground/90
                            prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                            prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-10 prose-img:border
                            prose-blockquote:border-l-4 prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:italic
                            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:text-primary prose-code:font-medium"
                                >
                                    {isHtml ? parse(grammar.description, {
                                        replace: (domNode: any) => {
                                            if (domNode.type === 'tag' && domNode.name === 'img') {
                                                const { attribs } = domNode;
                                                if (!attribs.loading) attribs.loading = 'lazy';
                                                if (!attribs.decoding) attribs.decoding = 'async';
                                                if (!attribs.style) attribs.style = '';
                                                attribs.className = `${attribs.className || ''} rounded-2xl shadow-lg my-8 border`.trim();
                                                return domNode;
                                            }
                                        }
                                    }) : <ReactMarkdown
                                        rehypePlugins={[rehypeRaw]}
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            img: (props) => (
                                                <CachedImage src={props.src || ""} alt={props.alt || ""} className="rounded-2xl shadow-lg my-10 border mx-auto max-h-[500px] object-contain bg-muted/30" />
                                            ),
                                            h1: ({ node, ...props }) => <h1 className="text-3xl md:text-4xl font-extrabold mb-8 mt-12 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 pb-2" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-10 text-foreground flex items-center gap-2" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-xl md:text-2xl font-semibold mb-4 mt-8 text-foreground/90 border-l-4 border-primary/20 pl-4" {...props} />,
                                            p: ({ node, ...props }) => <p className="leading-relaxed mb-6 text-lg text-muted-foreground/90" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-none pl-0 mb-8 space-y-3" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-8 space-y-3 marker:text-primary marker:font-bold" {...props} />,
                                            li: ({ node, children, ...props }) => (
                                                <li className="flex items-start gap-3 text-muted-foreground/90 leading-relaxed" {...props}>
                                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                                    <span>{children}</span>
                                                </li>
                                            ),
                                            blockquote: ({ node, ...props }) => (
                                                <blockquote className="border-l-4 border-primary bg-primary/5 py-6 px-8 rounded-r-xl italic my-10 text-lg relative quote-icon" {...props} />
                                            ),
                                            hr: ({ node, ...props }) => (
                                                <hr className="my-10 border-none h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" {...props} />
                                            ),
                                            strong: ({ node, ...props }) => (
                                                <span className="font-bold text-foreground bg-primary/5 px-1 py-0.5 rounded" {...props} />
                                            ),
                                            em: ({ node, ...props }) => (
                                                <span className="italic text-primary font-medium" {...props} />
                                            ),
                                            table: ({ node, ...props }) => (
                                                <div className="overflow-x-auto my-8 rounded-xl border shadow-sm">
                                                    <table className="w-full text-left border-collapse" {...props} />
                                                </div>
                                            ),
                                            thead: ({ node, ...props }) => (
                                                <thead className="bg-muted/50 text-foreground" {...props} />
                                            ),
                                            tbody: ({ node, ...props }) => (
                                                <tbody className="divide-y" {...props} />
                                            ),
                                            tr: ({ node, ...props }) => (
                                                <tr className="hover:bg-muted/30 transition-colors" {...props} />
                                            ),
                                            th: ({ node, ...props }) => (
                                                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider" {...props} />
                                            ),
                                            td: ({ node, ...props }) => (
                                                <td className="px-6 py-4 text-sm" {...props} />
                                            ),
                                            code: ({ node, className, children, ...props }: any) => {
                                                const match = /language-(\w+)/.exec(className || '')
                                                return !match ? (
                                                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary font-medium" {...props}>
                                                        {children}
                                                    </code>
                                                ) : (
                                                    <pre className="bg-muted p-4 rounded-xl overflow-x-auto my-6 border shadow-inner">
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    </pre>
                                                )
                                            }
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
