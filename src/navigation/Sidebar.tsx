import { Home, BookOpen, GraduationCap, User, Activity, Globe, Shield, Users, LogOut, BarChart, Layers, Upload, Heart, Plus, Wand2, ChevronLeft, ChevronRight, LayoutDashboard, Database, Settings, Download, Search, Gift, Printer, Headphones } from "lucide-react";
import { NavLink } from "@/navigation/NavLink";
import { useNative } from "@/hooks/useNative";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

const mainNavItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/vocabularies", icon: BookOpen, label: "Vocabulary" },
    { path: "/favorites", icon: Heart, label: "Favorites" },
    { path: "/flashcards", icon: Layers, label: "Flashcards" },
    { path: "/dictionary", icon: Globe, label: "Dictionary" },
    { path: "/resources", icon: GraduationCap, label: "Resources" },
    { path: "/ielts-listing", icon: Headphones, label: "Listing" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/download", icon: Download, label: "Download App" },
];

const adminNavItems = [
    { path: "/admin/analytics", icon: LayoutDashboard, label: "Analytics" },
    { path: "/vocabularies/add", icon: Plus, label: "Add Vocabulary" },
    { path: "/admin/users", icon: Users, label: "Manage Users" },
    { path: "/admin/ai-enhancement-studio", icon: Wand2, label: "AI Enhancement Studio" },
    { path: "/admin/resources", icon: GraduationCap, label: "Resources Manager" },
    { path: "/admin/resources/add", icon: Plus, label: "Add Resource" },
    { path: "/admin/duplicates", icon: Shield, label: "Duplicate Manager" },
    { path: "/vocabularies/bulk-add", icon: Upload, label: "Bulk Upload" },
    { path: "/admin/ielts-listening-builder", icon: Headphones, label: "IELTS Listening Builder" },
];

export const Sidebar = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const { haptic } = useNative();
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
    }, [isCollapsed]);

    const toggleSidebar = () => {
        haptic('light');
        setIsCollapsed(!isCollapsed);
    };

    const handleSignOut = async () => {
        haptic('light');
        try {
            await signOut(auth);
            toast.success("Signed out successfully");
            navigate("/auth");
        } catch (error) {
            toast.error("Failed to sign out");
        }
    };

    const SectionHeader = ({ title }: { title: string }) => (
        !isCollapsed && (
            <div className="px-4 pt-6 pb-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    {title}
                </p>
            </div>
        )
    );

    return (
        <aside
            className={`hidden md:flex flex-col h-screen fixed left-0 top-0 border-r bg-card/80 backdrop-blur-xl z-50 transition-all duration-500 ease-in-out ${isCollapsed ? 'w-24' : 'w-72'
                }`}
        >
            {/* Logo & Toggle */}
            <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} min-h-[100px]`}>
                <Logo isCollapsed={isCollapsed} />
                {!isCollapsed && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {isCollapsed && (
                <div className="flex flex-col items-center mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20 mb-4"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Separator className="w-12 opacity-50" />
                </div>
            )}

            {/* User Profile Hook */}
            {!isCollapsed && (
                <div className="px-4 mb-4">
                    <div className="p-4 rounded-[2rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 flex items-center gap-3 group cursor-pointer hover:border-primary/30 transition-all shadow-sm hover:shadow-md" onClick={() => navigate("/profile")}>
                        <div className="relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-tr from-primary/30 to-primary/5 rounded-full blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Avatar className="h-11 w-11 border-2 border-background shadow-lg relative group-hover:scale-105 transition-transform bg-background">
                                <AvatarImage src={user?.photoURL || ''} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary font-black">
                                    {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black truncate tracking-tight group-hover:text-primary transition-colors">{user?.displayName || 'Welcome'}</p>
                            <p className="text-[10px] text-muted-foreground truncate font-semibold opacity-70">{user?.email}</p>
                        </div>
                    </div>
                </div>
            )}
            {isCollapsed && (
                <div className="px-4 mb-6 flex flex-col items-center gap-4">
                    <div className="relative group cursor-pointer" onClick={() => navigate("/profile")}>
                        <div className="absolute -inset-1 bg-gradient-to-tr from-primary/30 to-primary/5 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Avatar
                            className="h-12 w-12 border-2 border-background relative group-hover:scale-105 transition-all shadow-xl bg-background"
                        >
                            <AvatarImage src={user?.photoURL || ''} className="object-cover" />
                            <AvatarFallback className="bg-primary/5 text-primary font-black text-lg">
                                {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <Separator className="w-12 opacity-50" />
                </div>
            )}

            <ScrollArea className="flex-1 mask-fade-bottom">
                <nav className="px-4 pb-10 space-y-1.5">
                    <SectionHeader title="Core" />
                    {mainNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all active:scale-[0.97] group ${isCollapsed ? 'justify-center h-14 w-14 mx-auto p-0' : ''
                                }`}
                            activeClassName="bg-primary/10 text-primary font-bold shadow-[0_4px_12px_rgba(59,130,246,0.12)] border border-primary/10"
                            title={isCollapsed ? item.label : undefined}
                        >
                            <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform ${isCollapsed ? '' : 'group-hover:scale-110'}`} />
                            {!isCollapsed && <span className="text-[13px] font-semibold">{item.label}</span>}
                        </NavLink>
                    ))}

                    {isAdmin && (
                        <>
                            <SectionHeader title="Control Center" />
                            {adminNavItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-amber-500/5 hover:text-amber-600 transition-all active:scale-[0.97] group ${isCollapsed ? 'justify-center h-14 w-14 mx-auto p-0' : ''
                                        }`}
                                    activeClassName="bg-amber-500/10 text-amber-600 font-bold shadow-[0_4px_12px_rgba(245,158,11,0.12)] border border-amber-500/10"
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform ${isCollapsed ? '' : 'group-hover:scale-110'}`} />
                                    {!isCollapsed && <span className="text-[13px] font-semibold">{item.label}</span>}
                                </NavLink>
                            ))}
                        </>
                    )}


                </nav>
            </ScrollArea>

            <div className={`p-6 mt-auto border-t bg-muted/30 backdrop-blur-md ${isCollapsed ? 'flex justify-center' : ''}`}>
                <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className={`w-full justify-start gap-3 h-12 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:bg-destructive/20 transition-all font-bold ${isCollapsed ? 'w-12 h-12 p-0 justify-center' : ''
                        }`}
                    title={isCollapsed ? "Logout" : undefined}
                >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="text-sm">Sign Out</span>}
                </Button>
            </div>
        </aside>
    );
};
