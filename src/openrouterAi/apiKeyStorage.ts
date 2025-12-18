// Local Storage for OpenRouter Configuration and Usage Tracking
import { chatStorageService } from '@/services/dexieChatStorage';

const OPENROUTER_API_KEY_STORAGE = 'openrouter_api_key';
const OPENROUTER_MODEL_STORAGE = 'openrouter_selected_model';

// API Key Management
export const saveOpenRouterApiKey = (apiKey: string): void => {
    try {
        localStorage.setItem(OPENROUTER_API_KEY_STORAGE, apiKey);
    } catch (error) {
        console.error('Failed to save API key:', error);
        throw new Error('Failed to save API key securely');
    }
};

export const getOpenRouterApiKey = (): string | null => {
    try {
        return localStorage.getItem(OPENROUTER_API_KEY_STORAGE);
    } catch (error) {
        console.error('Failed to retrieve API key:', error);
        return null;
    }
};

export const removeOpenRouterApiKey = (): void => {
    try {
        localStorage.removeItem(OPENROUTER_API_KEY_STORAGE);
    } catch (error) {
        console.error('Failed to remove API key:', error);
    }
};

export const hasOpenRouterApiKey = (): boolean => {
    return !!getOpenRouterApiKey();
};

// Model Selection
export const saveSelectedModel = (modelId: string): void => {
    try {
        localStorage.setItem(OPENROUTER_MODEL_STORAGE, modelId);
    } catch (error) {
        console.error('Failed to save model selection:', error);
    }
};

export const getSelectedModel = (): string | null => {
    try {
        return localStorage.getItem(OPENROUTER_MODEL_STORAGE);
    } catch (error) {
        console.error('Failed to retrieve model selection:', error);
        return null;
    }
};

// Chat Sessions
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    tokens?: {
        input: number;
        output: number;
        total: number;
    };
    cost?: number;
    reasoning_details?: any;
}

export interface ChatSession {
    id: string;
    vocabularyId: string;
    vocabularyWord: string;
    messages: ChatMessage[];
    totalTokens: number;
    totalCost: number;
    createdAt: number;
    updatedAt: number;
}

export const saveChatSession = async (session: ChatSession): Promise<void> => {
    try {
        await chatStorageService.saveChatSession({
            ...session,
            vocabularyEnglish: session.vocabularyWord
        });
    } catch (error) {
        console.error('Failed to save chat session:', error);
    }
};

export const getAllChatSessions = async (): Promise<ChatSession[]> => {
    try {
        const sessions = await chatStorageService.getAllChatSessions();
        return sessions.map(s => ({
            ...s,
            vocabularyWord: s.vocabularyEnglish
        }));
    } catch (error) {
        console.error('Failed to retrieve chat sessions:', error);
        return [];
    }
};

export const getChatSessionByVocabulary = async (vocabularyId: string): Promise<ChatSession | null> => {
    try {
        const sessions = await chatStorageService.getChatSessionsByVocabulary(vocabularyId);
        // Return the most recent session if multiple exist, or null
        if (sessions.length > 0) {
            const s = sessions[0];
            return {
                ...s,
                vocabularyWord: s.vocabularyEnglish
            };
        }
        return null;
    } catch (error) {
        console.error('Failed to retrieve chat session:', error);
        return null;
    }
};

export const deleteChatSession = async (sessionId: string): Promise<void> => {
    try {
        await chatStorageService.deleteChatSession(sessionId);
    } catch (error) {
        console.error('Failed to delete chat session:', error);
    }
};

// Token Usage Tracking
export interface TokenUsageRecord {
    id: string;
    timestamp: number;
    vocabularyId: string;
    vocabularyWord: string;
    modelId: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
    userId?: string; // Added for compatibility with Dexie
}

export const saveTokenUsage = async (record: TokenUsageRecord): Promise<void> => {
    try {
        // Map to Dexie TokenUsage format
        await chatStorageService.saveTokenUsage({
            id: record.id,
            timestamp: record.timestamp,
            vocabularyId: record.vocabularyId,
            vocabularyEnglish: record.vocabularyWord,
            promptTokens: record.inputTokens,
            completionTokens: record.outputTokens,
            totalTokens: record.totalTokens,
            model: record.modelId,
            userId: record.userId
        });
    } catch (error) {
        console.error('Failed to save token usage:', error);
    }
};

export const getAllTokenUsage = async (): Promise<TokenUsageRecord[]> => {
    try {
        const usage = await chatStorageService.getTokenUsageByDateRange(0, Date.now());
        // Map back to TokenUsageRecord format
        return usage.map(u => ({
            id: u.id,
            timestamp: u.timestamp,
            vocabularyId: u.vocabularyId,
            vocabularyWord: u.vocabularyEnglish,
            modelId: u.model,
            inputTokens: u.promptTokens,
            outputTokens: u.completionTokens,
            totalTokens: u.totalTokens,
            cost: 0, // Cost is calculated dynamically in Dexie service or UI
            userId: u.userId
        }));
    } catch (error) {
        console.error('Failed to retrieve token usage:', error);
        return [];
    }
};

export const getTotalSpending = async (): Promise<{ totalCost: number; totalTokens: number; recordCount: number }> => {
    try {
        const stats = await chatStorageService.getTotalTokenUsage();
        // Calculate estimated cost (approximate)
        const totalCost = (stats.totalTokens / 1000000) * 0.15; // $0.15 per 1M tokens avg

        return {
            totalCost,
            totalTokens: stats.totalTokens,
            recordCount: stats.totalRequests
        };
    } catch (error) {
        console.error('Failed to calculate total spending:', error);
        return { totalCost: 0, totalTokens: 0, recordCount: 0 };
    }
};

export const clearAllData = async (): Promise<void> => {
    try {
        await chatStorageService.clearAllData();
    } catch (error) {
        console.error('Failed to clear data:', error);
    }
};