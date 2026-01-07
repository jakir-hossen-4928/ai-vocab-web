import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    className?: string;
    fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    className,
    fullPage = true
}) => {
    if (!fullPage) {
        return <Loader2 className={cn("animate-spin text-primary", className)} />;
    }

    return (
        <div className="min-h-[50vh] flex items-center justify-center bg-transparent">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className={cn("h-12 w-12 animate-spin text-primary", className)} />
                <p className="text-muted-foreground animate-pulse">Loading...</p>
            </div>
        </div>
    );
};
