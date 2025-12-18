import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, updateDoc, deleteDoc, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Trash2, Edit, User, Search, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef,
    SortingState,
    ColumnFiltersState,
} from "@tanstack/react-table";
import { confirmAction, showSuccessToast } from "@/utils/sweetAlert";

interface UserData {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role: 'user' | 'admin';
    createdAt: any;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [formData, setFormData] = useState({ email: "", role: "user" as "user" | "admin" });

    // TanStack Table State
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");

    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !isAdmin) {
            navigate("/");
            return;
        }
        fetchUsers();
    }, [user, isAdmin, navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, "user_roles"));
            const snapshot = await getDocs(q);
            const fetchedUsers = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    email: data.email || "",
                    displayName: data.displayName || data.email?.split('@')[0] || "User",
                    photoURL: data.photoURL || "",
                    role: data.role || "user",
                    createdAt: data.createdAt || new Date().toISOString()
                };
            }) as UserData[];

            // Sort by creation date (newest first)
            fetchedUsers.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateB.getTime() - dateA.getTime();
            });

            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (userToEdit: UserData) => {
        setEditingUser(userToEdit);
        setFormData({ email: userToEdit.email, role: userToEdit.role });
        setIsDialogOpen(true);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser || !formData.email) return;

        try {
            await updateDoc(doc(db, "user_roles", editingUser.id), {
                role: formData.role
            });
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: formData.role } : u));
            toast.success("User role updated successfully");
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("Failed to update user");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        const isConfirmed = await confirmAction(
            'Are you sure?',
            "Are you sure you want to delete this user? This action cannot be undone.",
            'Yes, delete it!'
        );

        if (!isConfirmed) return;

        try {
            await deleteDoc(doc(db, "user_roles", userId));
            setUsers(users.filter(u => u.id !== userId));
            showSuccessToast("User deleted successfully");
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user");
        }
    };

    const columns = useMemo<ColumnDef<UserData>[]>(() => [
        {
            accessorKey: "displayName",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="-ml-4"
                    >
                        User
                        {column.getIsSorted() === "asc" ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                        ) : column.getIsSorted() === "desc" ? (
                            <ChevronDown className="ml-2 h-4 w-4" />
                        ) : (
                            <ChevronsUpDown className="ml-2 h-4 w-4" />
                        )}
                    </Button>
                )
            },
            cell: ({ row }) => {
                const user = row.original
                return (
                    <div className="flex items-center gap-3">
                        {user.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt={user.displayName || "User"}
                                className="h-8 w-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="font-medium text-sm">
                                {user.displayName || "User"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {user.email}
                            </span>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="-ml-4"
                    >
                        Joined
                        {column.getIsSorted() === "asc" ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                        ) : column.getIsSorted() === "desc" ? (
                            <ChevronDown className="ml-2 h-4 w-4" />
                        ) : (
                            <ChevronsUpDown className="ml-2 h-4 w-4" />
                        )}
                    </Button>
                )
            },
            cell: ({ row }) => {
                const date = row.original.createdAt?.toDate
                    ? row.original.createdAt.toDate()
                    : new Date(row.original.createdAt);
                return date.toLocaleDateString();
            },
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => (
                <Badge variant={row.original.role === 'admin' ? 'default' : 'secondary'}>
                    {row.original.role}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const userData = row.original;
                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(userData)}
                            className="h-8 w-8"
                            disabled={userData.id === user?.uid}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(userData.id)}
                            className="h-8 w-8 text-destructive"
                            disabled={userData.id === user?.uid}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ], [user?.uid]);

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, columnId, filterValue) => {
            const search = filterValue.toLowerCase();
            const user = row.original;
            return (
                (user.displayName?.toLowerCase().includes(search) ?? false) ||
                (user.email.toLowerCase().includes(search) ?? false)
            );
        },
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
    });

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-background pb-8">
            <motion.header
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12"
            >
                <div className="max-w-4xl mx-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/profile")}
                        className="mb-4 text-primary-foreground hover:bg-primary-foreground/10"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold mb-1">Manage Users</h1>
                    <p className="text-primary-foreground/80 text-sm">
                        View and manage user roles ({users.length} total users)
                    </p>
                </div>
            </motion.header>

            <div className="max-w-4xl mx-auto px-4 -mt-6">
                <Card className="shadow-hover overflow-hidden mb-6">
                    <div className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users by name or email..."
                                value={globalFilter ?? ""}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </Card>

                <Card className="shadow-hover overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                            className="transition-colors hover:bg-muted/50"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex items-center justify-end space-x-2 p-4 border-t">
                        <div className="flex-1 text-sm text-muted-foreground">
                            Page {table.getState().pagination.pageIndex + 1} of{" "}
                            {table.getPageCount()}
                        </div>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User Role</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateUser} className="space-y-4">
                        <div>
                            <Label>Email</Label>
                            <Input
                                value={formData.email}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                        </div>
                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value: "user" | "admin") => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
