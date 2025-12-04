import { Home, BookOpen, GraduationCap, User, Activity, Globe, Shield, Users, LogOut, BarChart, Layers, Upload, Heart, Plus, Wand2, ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "@/navigation/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/vocabularies", icon: BookOpen, label: "Vocabulary" },
    { path: "/favorites", icon: Heart, label: "Favorites" },
    { path: "/flashcards", icon: Layers, label: "Flashcards" },
    { path: "/dictionary", icon: Globe, label: "Dictionary" },
    { path: "/resources", icon: GraduationCap, label: "Resources" },
    { path: "/ai-activity", icon: Activity, label: "AI Activity" },
    { path: "/profile", icon: User, label: "Profile" },
];

export const Sidebar = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
    }, [isCollapsed]);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <aside
            className={`hidden md:flex flex-col h-screen fixed left-0 top-0 border-r bg-card z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            <div className="p-6 flex items-center justify-between">
                {!isCollapsed && (
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Ai Vocab
                    </h1>
                )}
                <button
                    onClick={toggleSidebar}
                    className={`p-2 rounded-lg hover:bg-accent transition-colors ${isCollapsed ? 'mx-auto' : ''
                        }`}
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    ) : (
                        <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                    )}
                </button>
            </div>
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all ${isCollapsed ? 'justify-center' : ''
                            }`}
                        activeClassName="bg-primary/10 text-primary font-medium"
                        title={isCollapsed ? item.label : undefined}
                    >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}

                {/* Settings Section */}
                {!isCollapsed && (
                    <div className="pt-4 pb-2 px-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Settings
                        </p>
                    </div>
                )}
                <NavLink
                    to="/api-key-setup"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all ${isCollapsed ? 'justify-center' : ''
                        }`}
                    activeClassName="bg-primary/10 text-primary font-medium"
                    title={isCollapsed ? "AI API Setup" : undefined}
                >
                    <Shield className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>AI API Setup</span>}
                </NavLink>

                {isAdmin && (
                    <>
                        {!isCollapsed && (
                            <div className="pt-4 pb-2 px-4">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Admin
                                </p>
                            </div>
                        )}
                        <NavLink
                            to="/vocabularies/add"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all ${isCollapsed ? 'justify-center' : ''
                                }`}
                            activeClassName="bg-primary/10 text-primary font-medium"
                            title={isCollapsed ? "Add Vocabulary" : undefined}
                        >
                            <Plus className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && <span>Add Vocabulary</span>}
                        </NavLink>
                        <NavLink
                            to="/admin/users"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all ${isCollapsed ? 'justify-center' : ''
                                }`}
                            activeClassName="bg-primary/10 text-primary font-medium"
                            title={isCollapsed ? "Manage Users" : undefined}
                        >
                            <Users className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && <span>Manage Users</span>}
                        </NavLink>
                        <NavLink
                            to="/admin/tools"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all ${isCollapsed ? 'justify-center' : ''
                                }`}
                            activeClassName="bg-primary/10 text-primary font-medium"
                            title={isCollapsed ? "AI Enhancement" : undefined}
                        >
                            <Wand2 className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && <span>AI Enhancement</span>}
                        </NavLink>
                        <NavLink
                            to="/resources"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all ${isCollapsed ? 'justify-center' : ''
                                }`}
                            activeClassName="bg-primary/10 text-primary font-medium"
                            title={isCollapsed ? "Resources Manager" : undefined}
                        >
                            <GraduationCap className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && <span>Resources Manager</span>}
                        </NavLink>
                        <NavLink
                            to="/admin/duplicates"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all ${isCollapsed ? 'justify-center' : ''
                                }`}
                            activeClassName="bg-primary/10 text-primary font-medium"
                            title={isCollapsed ? "Duplicate Manager" : undefined}
                        >
                            <Shield className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && <span>Duplicate Manager</span>}
                        </NavLink>
                        <NavLink
                            to="/vocabularies/bulk-add"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all ${isCollapsed ? 'justify-center' : ''
                                }`}
                            activeClassName="bg-primary/10 text-primary font-medium"
                            title={isCollapsed ? "Bulk Upload" : undefined}
                        >
                            <Upload className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && <span>Bulk Upload</span>}
                        </NavLink>
                    </>
                )}
            </nav>


            <div className="p-4 border-t mt-auto">
                <button
                    onClick={async () => {
                        try {
                            await signOut(auth);
                            toast.success("Signed out successfully");
                            navigate("/auth");
                        } catch (error) {
                            toast.error("Failed to sign out");
                        }
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all ${isCollapsed ? 'justify-center' : ''
                        }`}
                    title={isCollapsed ? "Sign Out" : undefined}
                >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>
        </aside >
    );
};
