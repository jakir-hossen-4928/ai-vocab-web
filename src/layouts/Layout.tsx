import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/navigation/Sidebar";
import { BottomNav } from "@/navigation/BottomNav";
import { MobileDrawer } from "@/navigation/MobileDrawer";
import { MobileHeader } from "@/navigation/MobileHeader";
import { useNative } from "@/hooks/useNative";
import { useKeyboard } from "@/hooks/useKeyboard";

export const Layout = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true';
    });
    const { setStatusBarColor } = useNative();
    const isKeyboardOpen = useKeyboard();

    useEffect(() => {
        // Set native status bar color to primary blue (approx matching #3b82f6)
        setStatusBarColor('#3b82f6');

        const handleStorageChange = () => {
            const saved = localStorage.getItem('sidebarCollapsed');
            setSidebarCollapsed(saved === 'true');
        };

        // Listen for changes to localStorage (cross-tab)
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const location = useLocation();

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <MobileHeader onMenuClick={() => setDrawerOpen(true)} />
            <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
            <main
                className={`pb-[calc(4rem+var(--safe-area-bottom))] md:pb-0 min-h-screen pt-[calc(52px+var(--safe-area-top))] md:pt-0 transition-all duration-300 ${sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
                    }`}
            >
                <Outlet />
            </main>
            <BottomNav isKeyboardOpen={isKeyboardOpen} />
        </div>
    );
};
