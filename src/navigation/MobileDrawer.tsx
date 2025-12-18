import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, GraduationCap, User, Activity, Globe, LogOut, Users, Shield, Layers, Upload, Heart, Plus, Wand2, LayoutDashboard } from "lucide-react";
import { NavLink } from "@/navigation/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useNative } from "@/hooks/useNative";

const navItems = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/dictionary", icon: Globe, label: "Online Dictionary" },
    { path: "/vocabularies", icon: BookOpen, label: "Vocabulary" },
    { path: "/favorites", icon: Heart, label: "Favorites" },
    { path: "/flashcards", icon: Layers, label: "Flashcards" },
    { path: "/ai-activity", icon: Activity, label: "AI Activity" },
];

interface MobileDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const MobileDrawer = ({ open, onOpenChange }: MobileDrawerProps) => {
    const { isAdmin } = useAuth();
    const { haptic } = useNative();
    const navigate = useNavigate();

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

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="left"
                className="w-[280px] p-0 flex flex-col"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                {/* Header */}
                <div className="p-6 pt-[calc(1.5rem+var(--safe-area-top))] border-b bg-gradient-to-br from-primary/10 to-blue-50 dark:from-primary/5 dark:to-blue-950/20">
                    <h1
                        onClick={() => {
                            navigate("/");
                            onOpenChange(false);
                        }}
                        className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        Ai Vocab
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">Learn English Vocabulary</p>
                </div>

                {/* Cambridge Dictionary Widget */}
                <div className="p-4 border-b bg-muted/30">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Quick Search
                    </h3>
                    <div
                        dangerouslySetInnerHTML={{
                            __html: `
                                <form action='https://dictionary.cambridge.org/us/search/english/direct/' method='get' target='_blank' style="margin: 0;">
                                    <input type='hidden' name='utm_source' value='widget_searchbox_source'/>
                                    <input type='hidden' name='utm_medium' value='widget_searchbox'/>
                                    <input type='hidden' name='utm_campaign' value='widget_tracking'/>
                                    <table style='font-family:Arial,Helvetica,sans-serif;font-size:10px;background:#1D2A57;border-collapse:collapse;border-spacing:0;width:100%;background-image:linear-gradient(to right,#0f193d,#2c2f62,#1a2753);border-radius:8px;overflow:hidden;'>
                                        <caption style='display:none;'>Cambridge Dictionary Search</caption>
                                        <tbody>
                                            <tr>
                                                <td colspan='2' style='padding:0;background:none;border:none;'>
                                                    <a href='https://dictionary.cambridge.org/us/'
                                                        style='display:block;background:transparent url(https://dictionary.cambridge.org/us/external/images/freesearch/sbl.png?version=6.0.65) no-repeat 5px 6px;height:32px;'
                                                        target='_blank'></a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style='width:calc(100% - 30px);background:none;border:none;padding:0;font-size:10px;border-collapse:collapse;border-spacing:0;'>
                                                    <input style='margin:4px;padding:6px 12px;display:block;width:calc(100% - 8px);font-family:Arial,Helvetica,sans-serif;font-size:12px;border:1px solid #ddd;border-radius:20px;box-shadow:inset 1px 1px 2px 0 rgba(0,0,0,0.1);color:#444;'
                                                        name='q' placeholder='Search Cambridge...' type='search' title='search' dir='auto' role='textbox' autocomplete='off'
                                                        aria-controls='search' aria-multiline='false' aria-expanded='false' aria-label='Search' aria-required='true' aria-invalid='false' />
                                                </td>
                                                <td style='width:30px;background:none;border:none;padding:0 8px 0 0;font-size:10px;border-collapse:collapse;border-spacing:0;'>
                                                    <button style='width:20px;height:20px;vertical-align:top;display:inline-block;border:none;border-radius:50%;text-align:center;text-transform:none;padding:0;background:#FEC400;cursor:pointer;overflow:hidden;'
                                                        title='Search' type='submit'>
                                                        <img src='https://dictionary.cambridge.org/us/external/images/freesearch/search.png?version=6.0.65'
                                                            style='vertical-align:-1px;border:none;height:auto;margin:0;padding:0;text-align:center;'/>
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </form>
                            `,
                        }}
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        Powered by Cambridge Dictionary
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => onOpenChange(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                            activeClassName="bg-primary/10 text-primary font-medium"
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}

                    {/* Settings Section */}
                    <div className="pt-4 pb-2 px-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Settings
                        </p>
                    </div>
                    <NavLink
                        to="/api-key-setup"
                        onClick={() => onOpenChange(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                        activeClassName="bg-primary/10 text-primary font-medium"
                    >
                        <Shield className="h-5 w-5" />
                        <span>AI API Setup</span>
                    </NavLink>

                    {isAdmin && (
                        <>
                            <div className="pt-4 pb-2 px-4">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Admin
                                </p>
                            </div>
                            <NavLink
                                to="/admin/analytics"
                                onClick={() => onOpenChange(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                                activeClassName="bg-primary/10 text-primary font-medium"
                            >
                                <LayoutDashboard className="h-5 w-5" />
                                <span>Analytics</span>
                            </NavLink>
                            <NavLink
                                to="/vocabularies/add"
                                onClick={() => onOpenChange(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                                activeClassName="bg-primary/10 text-primary font-medium"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Add Vocabulary</span>
                            </NavLink>
                            <NavLink
                                to="/admin/users"
                                onClick={() => onOpenChange(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                                activeClassName="bg-primary/10 text-primary font-medium"
                            >
                                <Users className="h-5 w-5" />
                                <span>Manage Users</span>
                            </NavLink>
                            <NavLink
                                to="/admin/tools"
                                onClick={() => onOpenChange(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                                activeClassName="bg-primary/10 text-primary font-medium"
                            >
                                <Wand2 className="h-5 w-5" />
                                <span>AI Enhancement</span>
                            </NavLink>
                            <NavLink
                                to="/admin/resources"
                                onClick={() => onOpenChange(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                                activeClassName="bg-primary/10 text-primary font-medium"
                            >
                                <GraduationCap className="h-5 w-5" />
                                <span>Resources Manager</span>
                            </NavLink>
                            <NavLink
                                to="/admin/duplicates"
                                onClick={() => onOpenChange(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                                activeClassName="bg-primary/10 text-primary font-medium"
                            >
                                <Shield className="h-5 w-5" />
                                <span>Duplicate Manager</span>
                            </NavLink>
                            <NavLink
                                to="/vocabularies/bulk-add"
                                onClick={() => onOpenChange(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                                activeClassName="bg-primary/10 text-primary font-medium"
                            >
                                <Upload className="h-5 w-5" />
                                <span>Bulk Upload</span>
                            </NavLink>

                        </>
                    )}
                </nav>

                {/* Sign Out */}
                <div className="p-3 pb-[calc(0.75rem+var(--safe-area-bottom))] border-t mt-auto">
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
