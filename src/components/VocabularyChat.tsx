import { useEffect, useState } from "react"
import { Vocabulary } from "@/types/vocabulary"
import { OpenRouterApiKeyManager } from "@/openrouterAi/OpenRouterApiKeyManager"
import {
    hasOpenRouterApiKey,
    getChatSessionByVocabulary,
    saveChatSession,
    getSelectedModel,
    ChatSession,
    ChatMessage as StoredChatMessage
} from "@/openrouterAi/apiKeyStorage"
import { getModelById, DEFAULT_MODEL } from "@/openrouterAi/openRouterConfig"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bot, X } from "lucide-react"
import { Conversation, ConversationMessage } from "@/components/ai/conversation"
import { PromptInput } from "@/components/ai/prompt-input"
import { Suggestions } from "@/components/ai/suggestion"
import { chatWithVocabulary } from "@/services/openRouterService"

interface VocabularyChatProps {
    vocabulary: Vocabulary
    onClose?: () => void
    initialPrompt?: string
    isPageMode?: boolean
    model?: string | null
}

export function VocabularyChat({ vocabulary, onClose, initialPrompt, isPageMode = false, model }: VocabularyChatProps) {
    const [needsApiKey, setNeedsApiKey] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [messages, setMessages] = useState<ConversationMessage[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Suggestion prompts for quick access
    const suggestions = messages.length === 0 ? [
        "Give me 3 example sentences",
        "What are some synonyms?",
        "Explain the meaning in simple terms",
        "How to use in IELTS writing?"
    ] : []

    // Check mobile device
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Initialize service selection
    useEffect(() => {
        const openRouterAvailable = hasOpenRouterApiKey()

        setNeedsApiKey(!openRouterAvailable)
    }, [vocabulary])

    // Load existing session
    useEffect(() => {
        const loadSession = async () => {
            const existingSession = await getChatSessionByVocabulary(vocabulary.id)
            if (existingSession) {

                // Convert stored messages to conversation messages
                const conversationMessages: ConversationMessage[] = existingSession.messages.map((msg, idx) => ({
                    id: `msg-${msg.timestamp}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp,
                    reasoning_details: msg.reasoning_details
                }))
                setMessages(conversationMessages)
            }
        }
        loadSession()
    }, [vocabulary.id])

    // Send initial prompt if provided - DISABLED
    // useEffect(() => {
    //     if (initialPrompt && messages.length === 0 && !isLoading) {
    //         handleSendMessage(initialPrompt)
    //     }
    // }, [initialPrompt])

    const handleSendMessage = async (userMessage: string) => {
        if (!userMessage.trim() || isLoading) return

        // Add user message
        const userMsg: ConversationMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            content: userMessage,
            timestamp: Date.now()
        }
        setMessages(prev => [...prev, userMsg])
        setIsLoading(true)

        try {
            // Use provider-based chat service which internally picks provider and key
            const result = await chatWithVocabulary(
                vocabulary,
                [userMsg],  // builtMessage array or messages var
                undefined,      // apiKey optional; we use stored keys
                getSelectedModel() || undefined
            )


            // Add assistant message
            const assistantMsg: ConversationMessage = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: result.content,
                timestamp: Date.now()
            }
            setMessages(prev => [...prev, assistantMsg])


            // Save session
            const existingSession = await getChatSessionByVocabulary(vocabulary.id)
            const previousMessages = existingSession?.messages || []

            const storedUserMsg: StoredChatMessage = {
                role: "user",
                content: userMessage,
                timestamp: Date.now()
            }

            const storedAssistantMsg: StoredChatMessage = {
                role: "assistant",
                content: result.content,
                timestamp: Date.now(),
                reasoning_details: result.reasoning_details // Store reasoning details
            }

            const updatedMessages = [...previousMessages, storedUserMsg, storedAssistantMsg]

            const session: ChatSession = {
                id: `chat-${vocabulary.id}`,
                vocabularyId: vocabulary.id,
                vocabularyEnglish: vocabulary.english,
                messages: updatedMessages,
                createdAt: existingSession?.createdAt || Date.now(),
                updatedAt: Date.now()
            }
            await saveChatSession(session)

        } catch (error: any) {
            console.error('Chat error:', error)

            // Add error message
            const errorMsg: ConversationMessage = {
                id: `error-${Date.now()}`,
                role: "assistant",
                content: `❌ **Error**: ${error.message || "Failed to get response from AI"}`,
                timestamp: Date.now()
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setIsLoading(false)
        }
    }

    const serviceInfo = hasOpenRouterApiKey() ? "🤖 OpenRouter" : "⚠️ No AI service"

    const welcomeMessage = `Hello! Ask me anything about **"${vocabulary.english}"**. I can help with meanings, examples, synonyms, and usage.\n\n*Powered by ${serviceInfo}*`

    return (
        <div className={cn(
            "flex flex-col bg-background",
            isPageMode ? "h-screen w-full" : "h-full w-full"
        )}>
            {/* Header */}
            <div className="px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {isPageMode && onClose && (
                            <Button variant="ghost" size="icon" onClick={onClose} className="-ml-2 h-8 w-8 rounded-full">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                        <div className="flex flex-col min-w-0">
                            <h2 className="truncate font-semibold text-sm">
                                {vocabulary.english}
                            </h2>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className={cn(
                                    "flex items-center gap-1",
                                    "text-purple-600"
                                )}>
                                    <Bot className="w-3 h-3" />
                                    OpenRouter
                                </span>
                                {getSelectedModel() && (
                                    <>
                                        <span>·</span>
                                        <span className="text-[10px]">{getSelectedModel()}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {!isPageMode && onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Content */}
            {needsApiKey ? (
                <div className="flex-1 p-6 flex flex-col justify-center overflow-y-auto">
                    <div className="text-center mb-6">
                        <h3 className="font-semibold mb-2 text-lg">
                            {"AI Service Required"}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            {"Please configure OpenRouter to start chatting."}
                        </p>
                    </div>

                    <div className="max-w-md mx-auto w-full">
                        <OpenRouterApiKeyManager />
                    </div>

                    <Button
                        variant="ghost"
                        className="mt-4 mx-auto"
                        onClick={() => {
                            setNeedsApiKey(false)
                            const openRouterAvailable = hasOpenRouterApiKey()
                            setNeedsApiKey(!openRouterAvailable)
                        }}
                    >
                        {"I have configured it, go back"}
                    </Button>
                </div>
            ) : (
                <>
                    <Conversation
                        messages={messages}
                        isLoading={isLoading}
                        welcomeMessage={welcomeMessage}
                    />
                    {suggestions.length > 0 && (
                        <Suggestions
                            suggestions={suggestions}
                            onSelect={handleSendMessage}
                        />
                    )}
                    <PromptInput
                        onSubmit={handleSendMessage}
                        isLoading={isLoading}
                        placeholder="Ask about this word..."
                        disabled={needsApiKey}
                    />
                </>
            )}
        </div>
    )
}
