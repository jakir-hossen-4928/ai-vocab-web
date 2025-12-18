// New Dexie-based chat storage service
import { dexieService, ChatSession, TokenUsage } from '@/lib/dexieDb';

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

    // Token Usage Methods
    async saveTokenUsage(usage: TokenUsage): Promise<void> {
        return dexieService.saveTokenUsage(usage);
    }

    async getTokenUsageByDateRange(startDate: number, endDate: number): Promise<TokenUsage[]> {
        return dexieService.getTokenUsageByDateRange(startDate, endDate);
    }

    async getTokenUsageByUser(userId: string): Promise<TokenUsage[]> {
        return dexieService.getTokenUsageByUser(userId);
    }

    async getTotalTokenUsage(userId?: string): Promise<{
        totalPromptTokens: number;
        totalCompletionTokens: number;
        totalTokens: number;
        totalRequests: number;
    }> {
        return dexieService.getTotalTokenUsage(userId);
    }

    async getMonthlyTokenUsage(userId?: string): Promise<{
        month: string;
        totalTokens: number;
        totalRequests: number;
    }[]> {
        const allUsage = userId
            ? await dexieService.getTokenUsageByUser(userId)
            : await dexieService.getTokenUsageByDateRange(0, Date.now());

        const monthlyData = new Map<string, { totalTokens: number; totalRequests: number }>();

        allUsage.forEach(usage => {
            const date = new Date(usage.timestamp);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            const existing = monthlyData.get(monthKey) || { totalTokens: 0, totalRequests: 0 };
            monthlyData.set(monthKey, {
                totalTokens: existing.totalTokens + usage.totalTokens,
                totalRequests: existing.totalRequests + 1,
            });
        });

        return Array.from(monthlyData.entries())
            .map(([month, data]) => ({ month, ...data }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }

    async clearOldTokenUsage(daysToKeep: number = 90): Promise<void> {
        return dexieService.clearOldTokenUsage(daysToKeep);
    }

    // Utility Methods
    async exportChatHistory(): Promise<string> {
        const sessions = await dexieService.getAllChatSessions();
        return JSON.stringify(sessions, null, 2);
    }

    async exportTokenUsage(): Promise<string> {
        const usage = await dexieService.getTokenUsageByDateRange(0, Date.now());
        return JSON.stringify(usage, null, 2);
    }

    async clearAllData(): Promise<void> {
        // Clear chat sessions and token usage
        const sessions = await dexieService.getAllChatSessions();
        const deletePromises = sessions.map(s => dexieService.deleteChatSession(s.id));
        await Promise.all(deletePromises);

        await dexieService.clearOldTokenUsage(0); // Clear all token usage
    }
}

export const chatStorageService = new DexieChatStorageService();

// Re-export types for compatibility
export type { ChatMessage, ChatSession, TokenUsage } from '@/lib/dexieDb';
