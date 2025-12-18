import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
    text?: string
}

export function Loader({ text = "Thinking...", className, ...props }: LoaderProps) {
    return (
        <div className={cn("flex items-center gap-2 text-muted-foreground", className)} {...props}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">{text}</span>
        </div>
    )
}

export interface ThinkingDotsProps extends React.HTMLAttributes<HTMLDivElement> { }

export function ThinkingDots({ className, ...props }: ThinkingDotsProps) {
    return (
        <div className={cn("flex items-center gap-1", className)} {...props}>
            <span className="animate-bounce inline-block w-1.5 h-1.5 bg-current rounded-full" style={{ animationDelay: '0ms' }} />
            <span className="animate-bounce inline-block w-1.5 h-1.5 bg-current rounded-full" style={{ animationDelay: '150ms' }} />
            <span className="animate-bounce inline-block w-1.5 h-1.5 bg-current rounded-full" style={{ animationDelay: '300ms' }} />
        </div>
    )
}
