// New Dexie-based chat storage service
import { dexieService, ChatSession } from '@/lib/dexieDb';

class DexieChatStorageService {
    // Chat Session Methods
    async saveChatSession(session: ChatSession): Promise<void> {
        return dexieService.saveChatSession(session);
    }

    async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
        return dexieService.getChatSession(sessionId);
    }

    async getChatSessionsByVocabulary(vocabularyId: string): Promise<ChatSession[]> {
        return dexieService.getChatSessionsByVocabulary(vocabularyId);
    }

    async getAllChatSessions(): Promise<ChatSession[]> {
        return dexieService.getAllChatSessions();
    }

    async deleteChatSession(sessionId: string): Promise<void> {
        return dexieService.deleteChatSession(sessionId);
    }

    async clearOldChatSessions(daysToKeep: number = 30): Promise<void> {
        return dexieService.clearOldChatSessions(daysToKeep);
    }


    // Utility Methods
    async exportChatHistory(): Promise<string> {
        const sessions = await dexieService.getAllChatSessions();
        return JSON.stringify(sessions, null, 2);
    }


    async clearAllData(): Promise<void> {
        // Clear chat sessions and token usage
        const sessions = await dexieService.getAllChatSessions();
        const deletePromises = sessions.map(s => dexieService.deleteChatSession(s.id));
        await Promise.all(deletePromises);

    }
}

export const chatStorageService = new DexieChatStorageService();

// Re-export types for compatibility
export type { ChatMessage, ChatSession } from '@/lib/dexieDb';
