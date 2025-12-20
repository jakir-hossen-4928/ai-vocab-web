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
    role: "user" | "assistant";
    content: string;
    reasoning_details?: string;
    timestamp: number;
}

export interface ChatSession {
    id: string;
    vocabularyId: string;
    vocabularyEnglish: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
}

export const saveChatSession = async (session: ChatSession): Promise<void> => {
    try {
        await chatStorageService.saveChatSession(session);
    } catch (error) {
        console.error('Failed to save chat session:', error);
    }
};

export const getAllChatSessions = async (): Promise<ChatSession[]> => {
    try {
        const sessions = await chatStorageService.getAllChatSessions();
        return sessions.map(s => ({
            ...s,
            vocabularyEnglish: s.vocabularyEnglish // Ensure consistency with interface
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
                vocabularyEnglish: s.vocabularyEnglish // Ensure consistency with interface
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

export const clearAllData = async (): Promise<void> => {
    try {
        await chatStorageService.clearAllData();
    } catch (error) {
        console.error('Failed to clear data:', error);
    }
};