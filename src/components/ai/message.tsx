import * as React from "react"
import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
    role: "user" | "assistant" | "system"
    content: string
    isLoading?: boolean
}

export function Message({ role, content, isLoading, className, ...props }: MessageProps) {
    const isUser = role === "user"
    const isAssistant = role === "assistant"

    return (
        <div
            className={cn(
                "group relative flex gap-3 w-full",
                isUser ? "justify-end" : "justify-start",
                className
            )}
            {...props}
        >
            <div
                className={cn(
                    "flex flex-col gap-2 rounded-2xl px-4 py-3 text-sm max-w-[85%] shadow-sm",
                    isUser
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-secondary text-secondary-foreground rounded-bl-none"
                )}
            >
                {isLoading ? (
                    <div className="flex items-center gap-1 h-5">
                        <span className="animate-bounce text-xs">●</span>
                        <span className="animate-bounce delay-100 text-xs">●</span>
                        <span className="animate-bounce delay-200 text-xs">●</span>
                    </div>
                ) : (
                    <div className={cn(
                        "prose prose-sm max-w-none break-words",
                        isUser ? "prose-invert" : "dark:prose-invert"
                    )}>
                        {isAssistant ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {content}
                            </ReactMarkdown>
                        ) : (
                            <p className="m-0 whitespace-pre-wrap">{content}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
