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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
                        {/* Desktop View: Table */}
                        <div className="hidden lg:block rounded-md border overflow-x-auto">
                            <Table className="min-w-[800px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[120px]">Image</TableHead>
                                        <TableHead className="min-w-[200px]">Title</TableHead>
                                        <TableHead className="w-[150px]">Created</TableHead>
                                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredImages.map((img: GrammarImage) => (
                                        <TableRow key={img.id}>
                                            <TableCell>
                                                <div className="aspect-video w-24 overflow-hidden rounded-md bg-muted flex items-center justify-center border relative">
                                                    {img.imageUrl ? (
                                                        <>
                                                            <img src={img.thumbnailUrl || img.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover blur-sm opacity-30" />
                                                            <img src={img.thumbnailUrl || img.imageUrl} alt={img.title} className="relative z-10 h-full w-full object-contain" />
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center">
                                                            <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                                                            <span className="text-[5px] font-bold text-muted-foreground/20 mt-0.5 tracking-tighter">1920x1080</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="line-clamp-2" title={img.title}>{img.title}</div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground whitespace-nowrap">
                                                {new Date(img.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
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
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile/Tablet View: Cards */}
                        <div className="lg:hidden grid gap-4 grid-cols-1 sm:grid-cols-2 p-4">
                            {filteredImages.map((img: GrammarImage) => (
                                <Card key={img.id} className="p-4 flex gap-4 items-start">
                                    <div className="aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-muted flex items-center justify-center border relative">
                                        {img.imageUrl ? (
                                            <>
                                                <img src={img.thumbnailUrl || img.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover blur-sm opacity-30" />
                                                <img src={img.thumbnailUrl || img.imageUrl} alt={img.title} className="relative z-10 h-full w-full object-contain" />
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center">
                                                <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                                                <span className="text-[7px] font-bold text-muted-foreground/20 mt-1 tracking-widest">1920x1080</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col h-full justify-between py-0.5">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-base leading-tight line-clamp-2">{img.title}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(img.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex justify-end mt-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
