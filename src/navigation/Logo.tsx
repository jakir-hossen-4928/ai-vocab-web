import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNative } from "@/hooks/useNative";

interface LogoProps {
    onOpenChange?: (open: boolean) => void;
    isCollapsed?: boolean;
}

export const Logo = ({ onOpenChange, isCollapsed = false }: LogoProps) => {
    const navigate = useNavigate();
    const { haptic } = useNative();
    const [isHovered, setIsHovered] = useState(false);
    const [displayText, setDisplayText] = useState("Ai Vocab");
    const targetText = "IELTS";

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isHovered) {
            let currentIndex = 0;
            interval = setInterval(() => {
                if (currentIndex <= targetText.length) {
                    setDisplayText(targetText.slice(0, currentIndex));
                    currentIndex++;
                } else {
                    clearInterval(interval);
                }
            }, 50);
        } else {
            setDisplayText("Ai Vocab");
        }
        return () => clearInterval(interval);
    }, [isHovered]);

    const handleClick = () => {
        haptic('light');
        navigate("/");
        onOpenChange?.(false);
    };

    if (isCollapsed) {
        return (
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleClick}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xl cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-lg group relative"
            >
                {isHovered ? "I" : "A"}
                {/* Tooltip for collapsed state */}
                <div className="absolute left-full ml-3 px-2 py-1 bg-popover text-popover-foreground text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border shadow-sm">
                    {isHovered ? "IELTS" : "Ai Vocab"}
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col"
            onMouseEnter={() => {
                setIsHovered(true);
                haptic('light');
            }}
            onMouseLeave={() => setIsHovered(false)}
        >
            <h1
                onClick={handleClick}
                className="text-2xl font-black bg-gradient-to-r from-primary via-blue-600 to-primary bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-all duration-300 selection:bg-primary/20 min-h-[32px]"
            >
                {displayText}
            </h1>
            <p className={`text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em] mt-0.5 transition-all duration-500 ${isHovered ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0'}`}>
                Learn English Vocabulary
            </p>
        </div>
    );
};
