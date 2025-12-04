import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface SuggestionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    suggestion: string
    onSelect: (suggestion: string) => void
}

export function Suggestion({ suggestion, onSelect, className, ...props }: SuggestionProps) {
    return (
        <Button
            variant="outline"
            size="sm"
            className={cn(
                "text-xs h-auto py-1.5 px-3 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors",
                className
            )}
            onClick={() => onSelect(suggestion)}
            {...props}
        >
            {suggestion}
        </Button>
    )
}

export interface SuggestionsProps extends React.HTMLAttributes<HTMLDivElement> {
    suggestions: string[]
    onSelect: (suggestion: string) => void
}

export function Suggestions({ suggestions, onSelect, className, ...props }: SuggestionsProps) {
    if (suggestions.length === 0) return null

    return (
        <div className={cn("flex flex-wrap gap-2 px-4 pb-2", className)} {...props}>
            {suggestions.map((suggestion, index) => (
                <Suggestion
                    key={index}
                    suggestion={suggestion}
                    onSelect={onSelect}
                />
            ))}
        </div>
    )
}
