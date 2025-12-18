import * as React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Message } from "./message"
import ReactMarkdown from "react-markdown"

export interface ConversationMessage {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp?: number
    reasoning_details?: any
}

export interface ConversationProps extends React.HTMLAttributes<HTMLDivElement> {
    messages: ConversationMessage[]
    isLoading?: boolean
    welcomeMessage?: string
}

export function Conversation({
    messages,
    isLoading = false,
    welcomeMessage,
    className,
    ...props
}: ConversationProps) {
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const bottomRef = React.useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when new messages arrive
    React.useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isLoading])

    return (
        <ScrollArea className={cn("flex-1 h-full", className)} {...props}>
            <div ref={scrollRef} className="flex flex-col gap-2 p-4">
                {/* Welcome Message */}
                {welcomeMessage && messages.length === 0 && !isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center max-w-md space-y-2">
                            <div className="text-muted-foreground text-sm prose prose-sm max-w-none">
                                <ReactMarkdown>{welcomeMessage}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages */}
                {messages.map((message) => (
                    <Message
                        key={message.id}
                        role={message.role}
                        content={message.content}
                    />
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <Message
                        role="assistant"
                        content=""
                        isLoading={true}
                    />
                )}

                <div ref={bottomRef} />
            </div>
        </ScrollArea>
    )
}
