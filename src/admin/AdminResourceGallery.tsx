import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadImage } from "@/services/imageService";
import { GrammarImage } from "@/types/grammar";
import { useResourcesSimple, useResourceMutations } from "@/hooks/useResources";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Loader2,
    MoreVertical,
    ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { showSuccessToast, showErrorToast, confirmAction } from "@/utils/sweetAlert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CachedImage } from "@/components/CachedImage";
import { ResourcePlaceholder } from "@/components/ResourcePlaceholder";
import { cleanTextContent } from "@/utils/textCleaner";
import RichTextEditor from "@/components/RichTextEditor";

import { useNavigate } from "react-router-dom";
import { processContentImages } from "@/utils/contentImageProcessor";
import { slugify } from "@/utils/slugify";

export default function AdminResourceGallery() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const { data: images = [], isLoading: loading } = useResourcesSimple();
    const { deleteResource } = useResourceMutations();

    const [searchQuery, setSearchQuery] = useState("");

    const handleDelete = async (id: string) => {
        const isConfirmed = await confirmAction(
            'Are you sure?',
            "Are you sure you want to delete this resource?",
            'Yes, delete it!'
        );

        if (isConfirmed) {
            await deleteResource.mutateAsync(id);
        }
    };

    const filteredImages = images.filter((img) => {
        const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    if (!isAdmin) return null;

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Resource Manager</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your educational resources and guides
                    </p>
                </div>
                <Button onClick={() => navigate("/admin/resources/add")} className="shadow-sm">
                    <Plus className="mr-2 h-4 w-4" /> Add New Resource
                </Button>
            </div>

            <div className="bg-card rounded-lg border shadow-sm">
                <div className="p-4 border-b">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search resources..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 flex justify-center">
                        <LoadingSpinner />
                    </div>
                ) : filteredImages.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        No resources found.
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredImages.map((img: GrammarImage) => (
                                <Card key={img.id} className="group flex flex-col overflow-hidden border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                        {img.imageUrl ? (
                                            <>
                                                <CachedImage
                                                    src={img.thumbnailUrl || img.imageUrl}
                                                    alt=""
                                                    className="absolute inset-0 h-full w-full object-cover blur-xl opacity-40 scale-110"
                                                />
                                                <CachedImage
                                                    src={img.imageUrl}
                                                    alt={img.title}
                                                    className="relative z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </>
                                        ) : (
                                            <ResourcePlaceholder title={img.title} />
                                        )}

                                        {/* Admin Actions Overlay */}
                                        <div className="absolute top-2 right-2 z-20">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border-none">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => navigate(`/admin/resources/edit/${img.id}`)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(img.id)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                    <div className="flex flex-col flex-1 p-5">
                                        <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                            {img.title}
                                        </h3>
                                        <div className="mt-auto flex items-center justify-between text-muted-foreground">
                                            <span className="text-xs font-medium bg-muted px-2 py-1 rounded-full">
                                                {new Date(img.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
