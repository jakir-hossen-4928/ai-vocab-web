import Dexie, { Table } from 'dexie';
import { Vocabulary } from '@/types/vocabulary';
import { GrammarImage } from '@/types/grammar';

// Chat-related interfaces
export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

export interface ChatSession {
    id: string;
    vocabularyId: string;
    vocabularyEnglish: string;
    messages: ChatMessage[];
    totalTokens: number;
    totalCost: number;
    createdAt: number;
    updatedAt: number;
}

export interface TokenUsage {
    id: string;
    timestamp: number;
    vocabularyId: string;
    vocabularyEnglish: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    model: string;
    userId?: string;
}

// Favorites
export interface Favorite {
    id: string; // vocabulary ID
    addedAt: number;
}

// Flashcard Progress
export interface FlashcardProgress {
    id: string; // vocabulary ID
    lastReviewed: number;
    reviewCount: number;
    correctCount: number;
    incorrectCount: number;
    easeFactor: number; // For spaced repetition
    nextReviewDate: number;
}

// Sync metadata to track last sync times
export interface SyncMetadata {
    key: string; // e.g., 'vocabularies', 'resources', etc.
    lastSyncedAt: number;
}

// Main Dexie Database
export class VocabularyDatabase extends Dexie {
    // Tables
    vocabularies!: Table<Vocabulary, string>;
    resources!: Table<GrammarImage, string>;
    chatSessions!: Table<ChatSession, string>;
    tokenUsage!: Table<TokenUsage, string>;
    favorites!: Table<Favorite, string>;
    flashcardProgress!: Table<FlashcardProgress, string>;
    syncMetadata!: Table<SyncMetadata, string>;

    constructor() {
        super('VocabularyAppDB');

        this.version(1).stores({
            vocabularies: 'id, english, bangla, partOfSpeech, createdAt, updatedAt, userId',
            resources: 'id, title, createdAt, userId',
            chatSessions: 'id, vocabularyId, updatedAt',
            tokenUsage: 'id, timestamp, vocabularyId, userId, model',
            favorites: 'id, addedAt',
            flashcardProgress: 'id, lastReviewed, nextReviewDate',
            syncMetadata: 'key, lastSyncedAt'
        });
    }
}

// Create and export database instance
export const db = new VocabularyDatabase();

// Database Service with Dexie
export const dexieService = {
    // ==================== VOCABULARIES ====================
    async getAllVocabularies(): Promise<Vocabulary[]> {
        try {
            return await db.vocabularies
                .orderBy('createdAt')
                .reverse()
                .toArray();
        } catch (error) {
            console.error('Failed to get vocabularies from Dexie:', error);
            return [];
        }
    },

    async getVocabulary(id: string): Promise<Vocabulary | undefined> {
        try {
            return await db.vocabularies.get(id);
        } catch (error) {
            console.error('Failed to get vocabulary from Dexie:', error);
            return undefined;
        }
    },

    async addVocabulary(vocab: Vocabulary): Promise<void> {
        try {
            await db.vocabularies.put(vocab);
        } catch (error) {
            console.error('Failed to add vocabulary to Dexie:', error);
        }
    },

    async addVocabularies(vocabs: Vocabulary[]): Promise<void> {
        try {
            await db.vocabularies.bulkPut(vocabs);
        } catch (error) {
            console.error('Failed to add vocabularies to Dexie:', error);
        }
    },

    async updateVocabulary(id: string, updates: Partial<Vocabulary>): Promise<void> {
        try {
            await db.vocabularies.update(id, updates);
        } catch (error) {
            console.error('Failed to update vocabulary in Dexie:', error);
        }
    },

    async deleteVocabulary(id: string): Promise<void> {
        try {
            await db.vocabularies.delete(id);
        } catch (error) {
            console.error('Failed to delete vocabulary from Dexie:', error);
        }
    },

    async clearVocabularies(): Promise<void> {
        try {
            await db.vocabularies.clear();
        } catch (error) {
            console.error('Failed to clear vocabularies from Dexie:', error);
        }
    },

    async searchVocabularies(query: string): Promise<Vocabulary[]> {
        try {
            const lowerQuery = query.toLowerCase();
            return await db.vocabularies
                .filter(v =>
                    v.english.toLowerCase().includes(lowerQuery) ||
                    v.bangla.toLowerCase().includes(lowerQuery) ||
                    v.partOfSpeech.toLowerCase().includes(lowerQuery)
                )
                .toArray();
        } catch (error) {
            console.error('Failed to search vocabularies in Dexie:', error);
            return [];
        }
    },

    // ==================== RESOURCES ====================
    async getAllResources(): Promise<GrammarImage[]> {
        try {
            return await db.resources
                .orderBy('createdAt')
                .reverse()
                .toArray();
        } catch (error) {
            console.error('Failed to get resources from Dexie:', error);
            return [];
        }
    },

    async getResource(id: string): Promise<GrammarImage | undefined> {
        try {
            return await db.resources.get(id);
        } catch (error) {
            console.error('Failed to get resource from Dexie:', error);
            return undefined;
        }
    },

    async addResource(resource: GrammarImage): Promise<void> {
        try {
            await db.resources.put(resource);
        } catch (error) {
            console.error('Failed to add resource to Dexie:', error);
        }
    },

    async addResources(resources: GrammarImage[]): Promise<void> {
        try {
            await db.resources.bulkPut(resources);
        } catch (error) {
            console.error('Failed to add resources to Dexie:', error);
        }
    },

    async deleteResource(id: string): Promise<void> {
        try {
            await db.resources.delete(id);
        } catch (error) {
            console.error('Failed to delete resource from Dexie:', error);
        }
    },

    async clearResources(): Promise<void> {
        try {
            await db.resources.clear();
        } catch (error) {
            console.error('Failed to clear resources from Dexie:', error);
        }
    },

    // ==================== CHAT SESSIONS ====================
    async saveChatSession(session: ChatSession): Promise<void> {
        try {
            await db.chatSessions.put(session);
        } catch (error) {
            console.error('Failed to save chat session to Dexie:', error);
        }
    },

    async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
        try {
            return await db.chatSessions.get(sessionId);
        } catch (error) {
            console.error('Failed to get chat session from Dexie:', error);
            return undefined;
        }
    },

    async getChatSessionsByVocabulary(vocabularyId: string): Promise<ChatSession[]> {
        try {
            return await db.chatSessions
                .where('vocabularyId')
                .equals(vocabularyId)
                .toArray();
        } catch (error) {
            console.error('Failed to get chat sessions by vocabulary from Dexie:', error);
            return [];
        }
    },

    async getAllChatSessions(): Promise<ChatSession[]> {
        try {
            return await db.chatSessions
                .orderBy('updatedAt')
                .reverse()
                .toArray();
        } catch (error) {
            console.error('Failed to get all chat sessions from Dexie:', error);
            return [];
        }
    },

    async deleteChatSession(sessionId: string): Promise<void> {
        try {
            await db.chatSessions.delete(sessionId);
        } catch (error) {
            console.error('Failed to delete chat session from Dexie:', error);
        }
    },

    async clearOldChatSessions(daysToKeep: number = 30): Promise<void> {
        try {
            const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
            await db.chatSessions
                .where('updatedAt')
                .below(cutoffDate)
                .delete();
        } catch (error) {
            console.error('Failed to clear old chat sessions from Dexie:', error);
        }
    },

    // ==================== TOKEN USAGE ====================
    async saveTokenUsage(usage: TokenUsage): Promise<void> {
        try {
            await db.tokenUsage.put(usage);
        } catch (error) {
            console.error('Failed to save token usage to Dexie:', error);
        }
    },

    async getTokenUsageByDateRange(startDate: number, endDate: number): Promise<TokenUsage[]> {
        try {
            return await db.tokenUsage
                .where('timestamp')
                .between(startDate, endDate, true, true)
                .toArray();
        } catch (error) {
            console.error('Failed to get token usage by date range from Dexie:', error);
            return [];
        }
    },

    async getTokenUsageByUser(userId: string): Promise<TokenUsage[]> {
        try {
            return await db.tokenUsage
                .where('userId')
                .equals(userId)
                .toArray();
        } catch (error) {
            console.error('Failed to get token usage by user from Dexie:', error);
            return [];
        }
    },

    async getTotalTokenUsage(userId?: string): Promise<{
        totalPromptTokens: number;
        totalCompletionTokens: number;
        totalTokens: number;
        totalRequests: number;
    }> {
        try {
            const allUsage = userId
                ? await db.tokenUsage.where('userId').equals(userId).toArray()
                : await db.tokenUsage.toArray();

            return allUsage.reduce((acc, usage) => ({
                totalPromptTokens: acc.totalPromptTokens + usage.promptTokens,
                totalCompletionTokens: acc.totalCompletionTokens + usage.completionTokens,
                totalTokens: acc.totalTokens + usage.totalTokens,
                totalRequests: acc.totalRequests + 1,
            }), {
                totalPromptTokens: 0,
                totalCompletionTokens: 0,
                totalTokens: 0,
                totalRequests: 0,
            });
        } catch (error) {
            console.error('Failed to get total token usage from Dexie:', error);
            return {
                totalPromptTokens: 0,
                totalCompletionTokens: 0,
                totalTokens: 0,
                totalRequests: 0,
            };
        }
    },

    async clearOldTokenUsage(daysToKeep: number = 90): Promise<void> {
        try {
            const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
            await db.tokenUsage
                .where('timestamp')
                .below(cutoffDate)
                .delete();
        } catch (error) {
            console.error('Failed to clear old token usage from Dexie:', error);
        }
    },

    // ==================== FAVORITES ====================
    async addFavorite(vocabularyId: string): Promise<void> {
        try {
            await db.favorites.put({
                id: vocabularyId,
                addedAt: Date.now()
            });
        } catch (error) {
            console.error('Failed to add favorite to Dexie:', error);
        }
    },

    async removeFavorite(vocabularyId: string): Promise<void> {
        try {
            await db.favorites.delete(vocabularyId);
        } catch (error) {
            console.error('Failed to remove favorite from Dexie:', error);
        }
    },

    async getAllFavorites(): Promise<string[]> {
        try {
            const favorites = await db.favorites.orderBy('addedAt').toArray();
            return favorites.map(f => f.id);
        } catch (error) {
            console.error('Failed to get favorites from Dexie:', error);
            return [];
        }
    },

    async isFavorite(vocabularyId: string): Promise<boolean> {
        try {
            const favorite = await db.favorites.get(vocabularyId);
            return !!favorite;
        } catch (error) {
            console.error('Failed to check favorite in Dexie:', error);
            return false;
        }
    },

    async syncFavoritesFromLocalStorage(): Promise<void> {
        try {
            const saved = localStorage.getItem("favorites");
            if (saved) {
                const favoriteIds: string[] = JSON.parse(saved);
                const favorites: Favorite[] = favoriteIds.map(id => ({
                    id,
                    addedAt: Date.now()
                }));
                await db.favorites.bulkPut(favorites);
            }
        } catch (error) {
            console.error('Failed to sync favorites from localStorage:', error);
        }
    },

    // ==================== FLASHCARD PROGRESS ====================
    async saveFlashcardProgress(progress: FlashcardProgress): Promise<void> {
        try {
            await db.flashcardProgress.put(progress);
        } catch (error) {
            console.error('Failed to save flashcard progress to Dexie:', error);
        }
    },

    async getFlashcardProgress(vocabularyId: string): Promise<FlashcardProgress | undefined> {
        try {
            return await db.flashcardProgress.get(vocabularyId);
        } catch (error) {
            console.error('Failed to get flashcard progress from Dexie:', error);
            return undefined;
        }
    },

    async getAllFlashcardProgress(): Promise<FlashcardProgress[]> {
        try {
            return await db.flashcardProgress.toArray();
        } catch (error) {
            console.error('Failed to get all flashcard progress from Dexie:', error);
            return [];
        }
    },

    async getDueFlashcards(): Promise<FlashcardProgress[]> {
        try {
            const now = Date.now();
            return await db.flashcardProgress
                .where('nextReviewDate')
                .belowOrEqual(now)
                .toArray();
        } catch (error) {
            console.error('Failed to get due flashcards from Dexie:', error);
            return [];
        }
    },

    // ==================== SYNC METADATA ====================
    async updateSyncMetadata(key: string): Promise<void> {
        try {
            await db.syncMetadata.put({
                key,
                lastSyncedAt: Date.now()
            });
        } catch (error) {
            console.error('Failed to update sync metadata in Dexie:', error);
        }
    },

    async getSyncMetadata(key: string): Promise<number | null> {
        try {
            const metadata = await db.syncMetadata.get(key);
            return metadata ? metadata.lastSyncedAt : null;
        } catch (error) {
            console.error('Failed to get sync metadata from Dexie:', error);
            return null;
        }
    },

    async shouldSync(key: string, maxAgeMinutes: number = 5): Promise<boolean> {
        try {
            const lastSync = await this.getSyncMetadata(key);
            if (!lastSync) return true;

            const ageMinutes = (Date.now() - lastSync) / (1000 * 60);
            return ageMinutes >= maxAgeMinutes;
        } catch (error) {
            console.error('Failed to check if should sync:', error);
            return true;
        }
    },

    // ==================== UTILITY ====================
    async clearAllData(): Promise<void> {
        try {
            await db.transaction('rw',
                db.vocabularies,
                db.resources,
                db.chatSessions,
                db.tokenUsage,
                db.favorites,
                db.flashcardProgress,
                db.syncMetadata,
                async () => {
                    await db.vocabularies.clear();
                    await db.resources.clear();
                    await db.chatSessions.clear();
                    await db.tokenUsage.clear();
                    await db.favorites.clear();
                    await db.flashcardProgress.clear();
                    await db.syncMetadata.clear();
                }
            );
        } catch (error) {
            console.error('Failed to clear all data from Dexie:', error);
        }
    },

    async exportData(): Promise<string> {
        try {
            const data = {
                vocabularies: await db.vocabularies.toArray(),
                resources: await db.resources.toArray(),
                chatSessions: await db.chatSessions.toArray(),
                tokenUsage: await db.tokenUsage.toArray(),
                favorites: await db.favorites.toArray(),
                flashcardProgress: await db.flashcardProgress.toArray(),
            };
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Failed to export data from Dexie:', error);
            return '{}';
        }
    },

    async getStorageStats(): Promise<{
        vocabularies: number;
        resources: number;
        chatSessions: number;
        tokenUsage: number;
        favorites: number;
        flashcardProgress: number;
    }> {
        try {
            return {
                vocabularies: await db.vocabularies.count(),
                resources: await db.resources.count(),
                chatSessions: await db.chatSessions.count(),
                tokenUsage: await db.tokenUsage.count(),
                favorites: await db.favorites.count(),
                flashcardProgress: await db.flashcardProgress.count(),
            };
        } catch (error) {
            console.error('Failed to get storage stats from Dexie:', error);
            return {
                vocabularies: 0,
                resources: 0,
                chatSessions: 0,
                tokenUsage: 0,
                favorites: 0,
                flashcardProgress: 0,
            };
        }
    }
};

// Export types
export type { ChatMessage, ChatSession, TokenUsage, Favorite, FlashcardProgress, SyncMetadata };
