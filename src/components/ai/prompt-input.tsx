import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"

export interface PromptInputProps {
    onSubmit: (message: string) => void
    isLoading?: boolean
    placeholder?: string
    disabled?: boolean
    className?: string
}

export function PromptInput({
    onSubmit,
    isLoading = false,
    placeholder = "Type a message...",
    disabled = false,
    className
}: PromptInputProps) {
    const [input, setInput] = React.useState("")
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (input.trim() && !isLoading && !disabled) {
            onSubmit(input.trim())
            setInput("")
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto"
            }
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    // Auto-resize textarea
    React.useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = "auto"
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
        }
    }, [input])

    return (
        <div className={cn("p-4 bg-background", className)}>
            <form onSubmit={handleSubmit} className="relative flex items-end gap-2 p-2 rounded-3xl border bg-muted/30 focus-within:ring-1 focus-within:ring-ring focus-within:bg-background transition-all shadow-sm" autoComplete="off">
                <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || isLoading}
                    autoComplete="off"
                    className="min-h-[24px] max-h-[200px] w-full resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 placeholder:text-muted-foreground"
                    rows={1}
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading || disabled}
                    className={cn(
                        "shrink-0 h-10 w-10 rounded-full mb-1 mr-1 transition-all",
                        input.trim() ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none w-0 p-0 overflow-hidden"
                    )}
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Send className="h-5 w-5" />
                    )}
                </Button>
            </form>
        </div>
    )
}
