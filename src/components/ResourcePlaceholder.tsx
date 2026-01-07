import React from "react";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourcePlaceholderProps {
    title: string;
    className?: string;
}

export const ResourcePlaceholder: React.FC<ResourcePlaceholderProps> = ({
    title,
    className
}) => {
    // Generate a deterministic color based on the title string
    const generateColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Use HSL for better control over vibrancy and lightness
        const h = Math.abs(hash) % 360;
        const s = 65 + (Math.abs(hash) % 20); // 65-85% saturation
        const l = 45 + (Math.abs(hash) % 15); // 45-60% lightness

        return {
            h, s, l,
            background: `hsl(${h}, ${s}%, ${l}%)`,
            // Simple accessible color calculation (yIQ)
            // For HSL, we can just check if lightness is above/below a threshold
            textColor: l > 70 ? "#1a1a1a" : "#ffffff"
        };
    };

    const colors = generateColor(title || "Resource");

    return (
        <div
            className={cn(
                "w-full h-full flex flex-col items-center justify-center p-6 text-center group-hover:scale-105 transition-transform duration-500",
                className
            )}
            style={{
                backgroundColor: colors.background,
                color: colors.textColor
            }}
        >
            <GraduationCap className="h-16 w-16 mb-4 opacity-40 animate-pulse" />
            <h3 className="text-lg sm:text-xl font-bold leading-tight balance-text line-clamp-3">
                {title}
            </h3>
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};
