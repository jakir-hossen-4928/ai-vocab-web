import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { GrammarImage } from "@/types/grammar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, ImageIcon, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useResourceMutations } from "@/hooks/useResources";
import { motion } from "framer-motion";
import { uploadImage } from "@/services/imageService";
import { processContentImages } from "@/utils/contentImageProcessor";
import { cleanTextContent } from "@/utils/textCleaner";
import { slugify } from "@/utils/slugify";
import RichTextEditor from "@/components/RichTextEditor";

export default function AdminAddResource() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const { addResource, updateResource } = useResourceMutations();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form states
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [imageWidth, setImageWidth] = useState<number | undefined>();
    const [imageHeight, setImageHeight] = useState<number | undefined>();
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!user || !isAdmin) {
            navigate("/");
            return;
        }

        if (id) {
            fetchResource();
        }
    }, [user, isAdmin, id, navigate]);

    const fetchResource = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const docRef = doc(db, "grammar_images", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as GrammarImage;
                setTitle(data.title);
                setSlug(data.slug || "");
                setIsSlugManuallyEdited(!!data.slug);
                setDescription(data.description || "");
                setCurrentImageUrl(data.imageUrl || null);
                setCurrentThumbnailUrl(data.thumbnailUrl || null);
                setImageWidth(data.imageWidth);
                setImageHeight(data.imageHeight);
            } else {
                toast.error("Resource not found");
                navigate("/admin/resources");
            }
        } catch (error) {
            console.error("Error fetching resource:", error);
            toast.error("Failed to load resource");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);

        if (selectedFile) {
            const img = new Image();
            img.onload = () => {
                setImageWidth(img.width);
                setImageHeight(img.height);
                const ratio = img.width / img.height;
                if (Math.abs(ratio - 16 / 9) > 0.05) {
                    toast.info("Image is not 16:9. Recommended: 1920x1080.");
                }
            };
            img.src = URL.createObjectURL(selectedFile);
        }
    };

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
        if (!isSlugManuallyEdited) {
            setSlug(slugify(newTitle));
        }
    };

    const handleSlugChange = (newSlug: string) => {
        setSlug(newSlug);
        setIsSlugManuallyEdited(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Please provide a title");
            return;
        }

        setSaving(true);
        try {
            const processedDescription = await processContentImages(description);

            let imageUrl = currentImageUrl || "";
            let thumbnailUrl = "";

            if (file) {
                const uploadResponse = await uploadImage(file);
                imageUrl = uploadResponse.url;
                thumbnailUrl = uploadResponse.thumbnailUrl || "";
            }

            const docData: any = {
                title: title.trim(),
                slug: slug.trim() || slugify(title),
                description: cleanTextContent(processedDescription),
                userId: user!.uid,
                imageUrl,
                updatedAt: new Date().toISOString(),
            };

            if (imageWidth !== undefined) docData.imageWidth = imageWidth;
            if (imageHeight !== undefined) docData.imageHeight = imageHeight;
            if (thumbnailUrl || currentThumbnailUrl) docData.thumbnailUrl = thumbnailUrl || currentThumbnailUrl;

            if (id) {
                await updateResource.mutateAsync({ id, ...docData });
            } else {
                docData.createdAt = new Date().toISOString();
                await addResource.mutateAsync(docData);
            }

            navigate("/admin/resources");
        } catch (error) {
            console.error("Error saving resource:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading && id) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-8">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12 shadow-lg"
            >
                <div className="max-w-4xl mx-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="mb-4 text-primary-foreground hover:bg-primary-foreground/10"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">
                                {id ? "Edit Resource" : "Create New Resource"}
                            </h1>
                            <p className="text-primary-foreground/70 font-medium">
                                Design and publish engaging educational content
                            </p>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-4xl mx-auto px-4 -mt-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="p-6 md:p-8 shadow-2xl border-0 bg-card/50 backdrop-blur-sm">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-6">
                                {/* Title Section */}
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-black uppercase tracking-wider opacity-70">Resource Title</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        placeholder="Enter a compelling title..."
                                        className="h-12 text-lg font-bold bg-background/50 border-primary/10 focus:border-primary/30 transition-all"
                                        required
                                    />
                                </div>

                                {/* Slug Section */}
                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="text-sm font-black uppercase tracking-wider opacity-70">URL Slug</Label>
                                    <div className="flex items-center group">
                                        <div className="h-12 px-4 flex items-center bg-muted/50 border border-r-0 border-primary/10 rounded-l-xl text-muted-foreground text-sm font-medium">
                                            /resources/
                                        </div>
                                        <Input
                                            id="slug"
                                            value={slug}
                                            onChange={(e) => handleSlugChange(e.target.value)}
                                            placeholder="resource-url-path"
                                            className="h-12 rounded-l-none bg-background/50 border-primary/10 focus:border-primary/30 transition-all font-mono text-sm"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium opacity-60">
                                        SEO-friendly URL path. Automatically generated from title, but can be customized.
                                    </p>
                                </div>

                                {/* Image Section */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-black uppercase tracking-wider opacity-70">Cover Presentation</Label>
                                    <div className="grid md:grid-cols-2 gap-6 bg-muted/20 p-4 rounded-2xl border border-primary/5">
                                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-background border-2 border-dashed border-primary/10 flex flex-col items-center justify-center relative group/img cursor-pointer transition-all hover:bg-background/80" onClick={() => document.getElementById('image-upload')?.click()}>
                                            {(file || currentThumbnailUrl || currentImageUrl) ? (
                                                <>
                                                    <img
                                                        src={file ? URL.createObjectURL(file) : (currentThumbnailUrl || currentImageUrl!)}
                                                        alt=""
                                                        className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110"
                                                    />
                                                    <img
                                                        src={file ? URL.createObjectURL(file) : (currentThumbnailUrl || currentImageUrl!)}
                                                        alt="Preview"
                                                        className="relative z-10 w-full h-full object-contain transition-transform group-hover/img:scale-105"
                                                    />
                                                </>
                                            ) : (
                                                <div className="text-center p-4">
                                                    <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <ImageIcon className="h-6 w-6 text-primary/40" />
                                                    </div>
                                                    <p className="text-xs font-bold text-muted-foreground">Click to Upload Cover</p>
                                                    <p className="text-[9px] text-muted-foreground/60 uppercase mt-1">1920x1080 Recommended</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-center space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold">Image Specifications</p>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    Choose a high-quality image that represents your content. 16:9 aspect ratio is enforced for consistency.
                                                </p>
                                            </div>
                                            <Input
                                                id="image-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="bg-background/50 border-primary/10"
                                            />
                                            {imageWidth && imageHeight && (
                                                <div className="flex gap-4">
                                                    <div className="bg-primary/5 px-2 py-1 rounded text-[10px] font-bold text-primary">
                                                        {imageWidth} × {imageHeight}
                                                    </div>
                                                    <div className={`px-2 py-1 rounded text-[10px] font-bold ${Math.abs((imageWidth / imageHeight) - (16 / 9)) < 0.1 ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                        Ratio: {(imageWidth / imageHeight).toFixed(2)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Editor Section */}
                                <div className="space-y-3">
                                    <Label htmlFor="description" className="text-sm font-black uppercase tracking-wider opacity-70">Rich Content Builder</Label>
                                    <div className="rounded-2xl border border-primary/10 overflow-hidden bg-background">
                                        <RichTextEditor
                                            value={description}
                                            onChange={setDescription}
                                            placeholder="Start crafting your resource using Markdown or HTML..."
                                            className="min-h-[400px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-primary/5 flex flex-col md:flex-row gap-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => navigate("/admin/resources")}
                                    className="flex-1 h-14 rounded-2xl font-bold text-muted-foreground hover:bg-muted/50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 group"
                                >
                                    {saving ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                    )}
                                    {id ? "Update Publication" : "Publish Resource"}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
