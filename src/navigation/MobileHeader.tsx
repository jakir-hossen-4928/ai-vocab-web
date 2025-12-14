import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useNative } from "@/hooks/useNative";

interface MobileHeaderProps {
    onMenuClick: () => void;
    title?: string;
}

export const MobileHeader = ({ onMenuClick, title = "Ai Vocab" }: MobileHeaderProps) => {
    const navigate = useNavigate();
    const { haptic } = useNative();

    const handleMenuClick = () => {
        haptic('light');
        onMenuClick();
    };

    return (
        <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg pt-[var(--safe-area-top)]">
            <div className="flex items-center gap-3 px-3 py-2.5">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleMenuClick}
                    className="shrink-0 text-white hover:bg-white/20 h-9 w-9"
                >
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate("/")}>
                    <h1 className="text-base font-bold truncate">{title}</h1>
                    <p className="text-[10px] text-white/80 truncate">Learn English Vocabulary</p>
                </div>
            </div>
        </header>
    );
};
