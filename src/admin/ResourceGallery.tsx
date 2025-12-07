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

export default function AdminResourceGallery() {
    const { user } = useAuth();
    const { data: images = [], isLoading: loading } = useResourcesSimple();
    const { addResource, updateResource, deleteResource } = useResourceMutations();

    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form states
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            await handleUpdate();
        } else {
            await handleAdd();
        }
    };

    const handleAdd = async () => {
        if (!title.trim()) {
            showErrorToast("Please provide a title");
            return;
        }

        setUploading(true);
        try {
            let imageUrl = "";
            if (file) {
                imageUrl = await uploadImage(file);
            }

            const docData: any = {
                title: title.trim(),
                description: cleanTextContent(description),
                createdAt: new Date().toISOString(),
                userId: user!.uid
            };

            if (imageUrl) {
                docData.imageUrl = imageUrl;
            }

            await addResource.mutateAsync(docData);
            showSuccessToast("Resource added successfully");
            resetForm();
        } catch (error) {
            console.error("Error adding resource:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingId || !title.trim()) return;

        setUploading(true);
        try {
            const updateData: any = {
                id: editingId,
                title: title.trim(),
                description: cleanTextContent(description),
            };

            if (file) {
                const imageUrl = await uploadImage(file);
                updateData.imageUrl = imageUrl;
            }

            await updateResource.mutateAsync(updateData);
            showSuccessToast("Resource updated successfully");
            resetForm();
        } catch (error) {
            console.error("Error updating resource:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const isConfirmed = await confirmAction(
            'Are you sure?',
            "Are you sure you want to delete this resource?",
            'Yes, delete it!'
        );

        if (isConfirmed) {
            try {
                await deleteResource.mutateAsync(id);
                showSuccessToast('Resource deleted successfully');
            } catch (error) {
                console.error("Error deleting resource:", error);
            }
        }
    };

    const startEditing = (img: GrammarImage) => {
        setEditingId(img.id);
        setTitle(img.title);
        setDescription(img.description || "");
        setCurrentImageUrl(img.imageUrl || null);
        setFile(null);
        setIsDialogOpen(true);
    };

    const openAddDialog = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setFile(null);
        setEditingId(null);
        setCurrentImageUrl(null);
        setIsDialogOpen(false);
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const filteredImages = images.filter((img) => {
        const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Resource Manager</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your educational resources and guides
                    </p>
                </div>
                <Button onClick={openAddDialog} className="shadow-sm">
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
                        No resources found. Create one to get started.
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
                                    {filteredImages.map((img) => (
                                        <TableRow key={img.id}>
                                            <TableCell>
                                                <div className="h-12 w-20 overflow-hidden rounded-md bg-muted flex items-center justify-center border">
                                                    {img.imageUrl ? (
                                                        <img src={img.imageUrl} alt={img.title} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
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
                                                        <DropdownMenuItem onClick={() => startEditing(img)}>
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
                            {filteredImages.map((img) => (
                                <Card key={img.id} className="p-4 flex gap-4 items-start">
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted flex items-center justify-center border">
                                        {img.imageUrl ? (
                                            <img src={img.imageUrl} alt={img.title} className="h-full w-full object-cover" />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
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
                                                    <DropdownMenuItem onClick={() => startEditing(img)}>
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

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-[95vw] max-w-4xl h-[90vh] md:max-h-[85vh] flex flex-col p-0 gap-0 sm:rounded-lg overflow-hidden">
                    <DialogHeader className="px-4 md:px-6 py-4 border-b shrink-0">
                        <DialogTitle>{editingId ? "Edit Resource" : "Add New Resource"}</DialogTitle>
                        <DialogDescription>
                            {editingId ? "Update the resource details below" : "Create a new educational resource"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
                        <form id="resource-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Resource Title"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Cover Image</Label>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        {currentImageUrl && !file && (
                                            <div className="h-20 w-32 shrink-0 rounded-md overflow-hidden bg-muted border">
                                                <img src={currentImageUrl} alt="Current" className="h-full w-full object-cover" />
                                            </div>
                                        )}
                                        <Input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Content</Label>
                                    <div className="h-[250px] md:h-[400px]">
                                        <RichTextEditor
                                            value={description}
                                            onChange={setDescription}
                                            placeholder="Write your content here..."
                                            className="h-[200px] md:h-[350px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <DialogFooter className="px-4 md:px-6 py-4 border-t bg-background shrink-0 flex-col sm:flex-row gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={resetForm} className="sm:mr-2 w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button type="submit" form="resource-form" disabled={uploading} className="w-full sm:w-auto">
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Resource"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
