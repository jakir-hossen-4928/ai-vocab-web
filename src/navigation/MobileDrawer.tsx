import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, GraduationCap, User, Activity, Globe, LogOut, Users, Shield, Layers, Upload, Heart, Plus, Wand2, LayoutDashboard, Settings, Search, Download } from "lucide-react";
import { NavLink } from "@/navigation/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useNative } from "@/hooks/useNative";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Logo } from "./Logo";

const mainNavItems = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/dictionary", icon: Globe, label: "Online Dictionary" },
    { path: "/flashcards", icon: Layers, label: "Flashcards" },
    { path: "/favorites", icon: Heart, label: "Favorites" },
    { path: "/download", icon: Download, label: "Download App" },
];

const adminNavItems = [
    { path: "/admin/analytics", icon: LayoutDashboard, label: "Analytics" },
    { path: "/vocabularies/add", icon: Plus, label: "Add Vocabulary" },
    { path: "/admin/users", icon: Users, label: "Manage Users" },
    { path: "/admin/tools", icon: Wand2, label: "AI Enhancement" },
    { path: "/admin/resources", icon: GraduationCap, label: "Resources Manager" },
    { path: "/admin/duplicates", icon: Shield, label: "Duplicate Manager" },
    { path: "/vocabularies/bulk-add", icon: Upload, label: "Bulk Upload" },
];

interface MobileDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const MobileDrawer = ({ open, onOpenChange }: MobileDrawerProps) => {
    const { user, isAdmin } = useAuth();
    const { haptic } = useNative();
    const navigate = useNavigate();
    const [cambridgeQuery, setCambridgeQuery] = useState("");

    const handleCambridgeSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (cambridgeQuery.trim()) {
            haptic('medium');
            window.open(`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(cambridgeQuery.trim())}`, '_blank');
            setCambridgeQuery("");
            onOpenChange(false);
        }
    };

    const handleSignOut = async () => {
        haptic('light');
        try {
            await signOut(auth);
            toast.success("Signed out successfully");
            navigate("/auth");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to sign out");
        }
    };

    const NavItem = ({ item }: { item: typeof mainNavItems[0] & { isExternal?: boolean } }) => {
        const content = (
            <>
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                    <item.icon className="h-5 w-5 relative transition-transform group-hover:scale-110 group-active:scale-95 duration-300" />
                </div>
                <span className="text-[15px] font-medium tracking-tight">{item.label}</span>
            </>
        );

        return item.isExternal ? (
            <a
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                    haptic('light');
                    onOpenChange(false);
                }}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all active:scale-[0.98] group"
            >
                {content}
            </a>
        ) : (
            <NavLink
                to={item.path}
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all active:scale-[0.98] group"
                activeClassName="bg-primary/10 text-primary font-bold shadow-sm shadow-primary/5 ring-1 ring-primary/10"
            >
                {content}
            </NavLink>
        );
    };

    const SectionHeader = ({ title }: { title: string }) => (
        <div className="px-4 pt-6 pb-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                {title}
            </p>
        </div>
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="left"
                className="w-[300px] p-0 flex flex-col border-r-0 sm:border-r"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                {/* User Profile Header */}
                <div className="relative overflow-hidden pt-[var(--safe-area-top)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent -z-10" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-8">
                            <Logo onOpenChange={onOpenChange} />
                        </div>
                        <div className="flex items-center gap-4 mb-4 group cursor-pointer" onClick={() => { navigate("/profile"); onOpenChange(false); }}>
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-primary/40 to-primary/10 rounded-full blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Avatar className="h-16 w-16 border-2 border-background shadow-2xl relative transition-transform group-hover:scale-[1.02] bg-background">
                                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} className="object-cover" />
                                    <AvatarFallback className="bg-primary/5 text-primary text-2xl font-black">
                                        {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                                <h2 className="text-xl font-black truncate tracking-tight text-foreground group-hover:text-primary transition-colors">
                                    {user?.displayName || 'Welcome Back!'}
                                </h2>
                                <p className="text-xs text-muted-foreground truncate font-medium">
                                    {user?.email || 'Start your learning journey'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="opacity-50" />

                {/* Navigation Content */}
                <ScrollArea className="flex-1">
                    <div className="px-3 py-2 space-y-1">
                        <div className="px-4 pt-1 pb-4">
                            <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[1.5rem] p-4 shadow-lg border border-white/5 relative overflow-hidden group">
                                <div className="absolute -top-6 -right-6 h-20 w-20 bg-primary/10 rounded-full blur-2xl" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-lg bg-white/95 flex items-center justify-center text-primary font-black text-[10px] shadow-sm">C</div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white/80 leading-none">Cambridge Search</span>
                                        </div>
                                    </div>
                                    <form onSubmit={handleCambridgeSearch}>
                                        <div className="relative group/input">
                                            <input
                                                type="text"
                                                value={cambridgeQuery}
                                                onChange={(e) => setCambridgeQuery(e.target.value)}
                                                placeholder="Search word..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl h-9 pl-3 pr-9 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium backdrop-blur-sm"
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-white/20">
                                                <Search className="h-3.5 w-3.5" />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <SectionHeader title="Dashboard" />
                        <div className="px-2 space-y-1">
                            {mainNavItems.map((item) => (
                                <NavItem key={item.path} item={item} />
                            ))}
                        </div>

                        {isAdmin && (
                            <>
                                <SectionHeader title="Admin Panel" />
                                {adminNavItems.map((item) => (
                                    <NavItem key={item.path} item={item} />
                                ))}
                            </>
                        )}

                        <SectionHeader title="Settings" />
                        <NavItem item={{ path: "/api-key-setup", icon: Shield, label: "AI API Configuration" }} />
                    </div>
                </ScrollArea>

                {/* Footer / Sign Out */}
                <div className="p-4 bg-muted/20 pb-[calc(1rem+var(--safe-area-bottom))]">
                    <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full justify-start gap-3 h-12 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:bg-destructive/20 transition-all font-medium"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Logout of Account</span>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
