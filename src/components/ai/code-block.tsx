import * as React from "react"
import { cn } from "@/lib/utils"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
    code: string
    language?: string
}

export function CodeBlock({ code, language = "text", className, ...props }: CodeBlockProps) {
    const [copied, setCopied] = React.useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={cn("relative group", className)} {...props}>
            <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
                <span className="text-xs text-muted-foreground font-mono">{language}</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleCopy}
                >
                    {copied ? (
                        <Check className="h-3 w-3 text-green-500" />
                    ) : (
                        <Copy className="h-3 w-3" />
                    )}
                </Button>
            </div>
            <pre className="p-4 overflow-x-auto bg-muted/50">
                <code className="text-sm font-mono">{code}</code>
            </pre>
        </div>
    )
}
