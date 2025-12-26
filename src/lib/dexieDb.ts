import Dexie, { Table } from 'dexie';
import { Vocabulary } from '@/types/vocabulary';
import { GrammarImage } from '@/types/grammar';
import { searchService } from '@/services/searchService';

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
    createdAt: number;
    updatedAt: number;
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
    interval: number;
    streak: number;
}

// Sync metadata to track last sync times
export interface SyncMetadata {
    key: string; // e.g., 'vocabularies', 'resources', etc.
    lastSyncedAt: number;
}

// Search History
export interface SearchHistory {
    id?: number;
    query: string;
    timestamp: number;
}

// API Cache for dictionary results
export interface ApiCache {
    id: string; // word or query
    data: Vocabulary;
    timestamp: number;
}

// Main Dexie Database
export class VocabularyDatabase extends Dexie {
    // Tables
    vocabularies!: Table<Vocabulary, string>;
    resources!: Table<GrammarImage, string>;
    chatSessions!: Table<ChatSession, string>;
    favorites!: Table<Favorite, string>;
    flashcardProgress!: Table<FlashcardProgress, string>;
    syncMetadata!: Table<SyncMetadata, string>;
    searchHistory!: Table<SearchHistory, number>;
    apiCache!: Table<ApiCache, string>;

    constructor() {
        super('VocabularyAppDB');

        this.version(3).stores({
            vocabularies: 'id, english, bangla, partOfSpeech, createdAt, updatedAt, userId',
            resources: 'id, title, createdAt, userId',
            chatSessions: 'id, vocabularyId, updatedAt',
            favorites: 'id, addedAt',
            flashcardProgress: 'id, lastReviewed, nextReviewDate',
            syncMetadata: 'key, lastSyncedAt',
            searchHistory: '++id, query, timestamp',
            apiCache: 'id, timestamp'
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

    async getVocabulariesByIds(ids: string[]): Promise<Vocabulary[]> {
        try {
            const items = await db.vocabularies.bulkGet(ids);
            return items.filter((item): item is Vocabulary => !!item);
        } catch (error) {
            console.error('Failed to bulk get vocabularies from Dexie:', error);
            return [];
        }
    },

    async addVocabulary(vocab: Vocabulary): Promise<void> {
        try {
            await db.vocabularies.put(vocab);
            // Update search index
            searchService.add(vocab);
        } catch (error) {
            console.error('Failed to add vocabulary to Dexie:', error);
        }
    },

    async addVocabularies(vocabs: Vocabulary[]): Promise<void> {
        try {
            await db.vocabularies.bulkPut(vocabs);
            // Update search index
            vocabs.forEach(v => searchService.add(v));
        } catch (error) {
            console.error('Failed to add vocabularies to Dexie:', error);
        }
    },

    async updateVocabulary(id: string, updates: Partial<Vocabulary>): Promise<void> {
        try {
            await db.vocabularies.update(id, updates);
            // Need to fetch full object to update index correctly as MiniSearch needs full doc
            // or at least the indexed fields.
            // Since updates might be partial, we should get the updated doc.
            const updatedDoc = await db.vocabularies.get(id);
            if (updatedDoc) {
                searchService.update(updatedDoc);
            }
        } catch (error) {
            console.error('Failed to update vocabulary in Dexie:', error);
        }
    },

    async deleteVocabulary(id: string): Promise<void> {
        try {
            await db.vocabularies.delete(id);
            searchService.remove(id);
        } catch (error) {
            console.error('Failed to delete vocabulary from Dexie:', error);
        }
    },

    async deleteVocabularies(ids: string[]): Promise<void> {
        try {
            await db.vocabularies.bulkDelete(ids);
            ids.forEach(id => searchService.remove(id));
        } catch (error) {
            console.error('Failed to bulk delete vocabularies from Dexie:', error);
        }
    },

    async clearVocabularies(): Promise<void> {
        try {
            await db.vocabularies.clear();
            searchService.miniSearch.removeAll();
        } catch (error) {
            console.error('Failed to clear vocabularies from Dexie:', error);
        }
    },

    async searchVocabularies(query: string, searchType: 'all' | 'related' | 'verbForms' = 'all'): Promise<Vocabulary[]> {
        try {
            const lowerQuery = query.toLowerCase().trim();
            if (!lowerQuery) return [];

            const results = await db.vocabularies
                .filter(v => {
                    const matchesPrimary = v.english.toLowerCase().includes(lowerQuery) ||
                        v.bangla.toLowerCase().includes(lowerQuery) ||
                        (v.partOfSpeech && v.partOfSpeech.toLowerCase().includes(lowerQuery)) ||
                        (v.synonyms && v.synonyms.some(s => s.toLowerCase().includes(lowerQuery)));

                    const matchesRelated = v.relatedWords && v.relatedWords.some(rw =>
                        rw.word.toLowerCase().includes(lowerQuery) ||
                        rw.meaning.toLowerCase().includes(lowerQuery)
                    );

                    const matchesVerbForms = v.verbForms && (
                        (v.verbForms.base && v.verbForms.base.toLowerCase().includes(lowerQuery)) ||
                        (v.verbForms.v2 && v.verbForms.v2.toLowerCase().includes(lowerQuery)) ||
                        (v.verbForms.v3 && v.verbForms.v3.toLowerCase().includes(lowerQuery)) ||
                        (v.verbForms.ing && v.verbForms.ing.toLowerCase().includes(lowerQuery)) ||
                        (v.verbForms.s_es && v.verbForms.s_es.toLowerCase().includes(lowerQuery))
                    );

                    if (searchType === 'related') return !!matchesRelated;
                    if (searchType === 'verbForms') return !!matchesVerbForms;

                    return !!(matchesPrimary || matchesRelated || matchesVerbForms);
                })
                .toArray();

            // Sort by relevance manually in memory (fast for <100 results, typically <2000 total docs)
            return results.sort((a, b) => {
                const aEng = a.english.toLowerCase();
                const bEng = b.english.toLowerCase();
                const aBan = a.bangla.toLowerCase();
                const bBan = b.bangla.toLowerCase();

                // 1. Exact matches (Highest priority)
                if (aEng === lowerQuery) return -1;
                if (bEng === lowerQuery) return 1;
                if (aBan === lowerQuery) return -1;
                if (bBan === lowerQuery) return 1;

                // 2. Starts with query (High priority)
                const aStarts = aEng.startsWith(lowerQuery) || aBan.startsWith(lowerQuery);
                const bStarts = bEng.startsWith(lowerQuery) || bBan.startsWith(lowerQuery);

                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;

                // 3. Alphabetical fallback
                return aEng.localeCompare(bEng);
            }).slice(0, 50); // Limit after sorting to show best matches

        } catch (error) {
            console.error('Failed to search vocabularies in Dexie:', error);
            return [];
        }
    },

    async getPagedVocabularies(offset: number, limit: number): Promise<Vocabulary[]> {
        try {
            return await db.vocabularies
                .orderBy('createdAt')
                .reverse()
                .offset(offset)
                .limit(limit)
                .toArray();
        } catch (error) {
            console.error('Failed to get paged vocabularies from Dexie:', error);
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

    async clearFavorites(): Promise<void> {
        try {
            await db.favorites.clear();
        } catch (error) {
            console.error('Failed to clear favorites from Dexie:', error);
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
            await db.transaction('rw', [
                db.vocabularies,
                db.resources,
                db.chatSessions,
                db.favorites,
                db.flashcardProgress,
                db.syncMetadata
            ], async () => {
                await db.vocabularies.clear();
                await db.resources.clear();
                await db.chatSessions.clear();
                await db.favorites.clear();
                await db.flashcardProgress.clear();
                await db.syncMetadata.clear();
            });
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
        favorites: number;
        flashcardProgress: number;
    }> {
        try {
            return {
                vocabularies: await db.vocabularies.count(),
                resources: await db.resources.count(),
                chatSessions: await db.chatSessions.count(),
                favorites: await db.favorites.count(),
                flashcardProgress: await db.flashcardProgress.count(),
            };
        } catch (error) {
            console.error('Failed to get storage stats from Dexie:', error);
            return {
                vocabularies: 0,
                resources: 0,
                chatSessions: 0,
                favorites: 0,
                flashcardProgress: 0,
            };
        }
    },

    // ==================== SEARCH HISTORY ====================
    async addSearchHistory(query: string): Promise<void> {
        try {
            const trimmedQuery = query.trim().toLowerCase();
            if (!trimmedQuery) return;

            // Remove existing same query to move it to the top
            await db.searchHistory.where('query').equals(trimmedQuery).delete();

            await db.searchHistory.add({
                query: trimmedQuery,
                timestamp: Date.now()
            });

            // Keep only latest 20 searches
            const count = await db.searchHistory.count();
            if (count > 20) {
                const oldest = await db.searchHistory.orderBy('timestamp').limit(count - 20).toArray();
                const ids = oldest.map(o => o.id!).filter(id => id !== undefined);
                await db.searchHistory.bulkDelete(ids);
            }
        } catch (error) {
            console.error('Failed to add search history to Dexie:', error);
        }
    },

    async getSearchHistory(limit: number = 10): Promise<string[]> {
        try {
            const history = await db.searchHistory
                .orderBy('timestamp')
                .reverse()
                .limit(limit)
                .toArray();
            return history.map(h => h.query);
        } catch (error) {
            console.error('Failed to get search history from Dexie:', error);
            return [];
        }
    },

    async clearSearchHistory(): Promise<void> {
        try {
            await db.searchHistory.clear();
        } catch (error) {
            console.error('Failed to clear search history from Dexie:', error);
        }
    },

    // ==================== API CACHE ====================
    async getCachedWord(word: string): Promise<Vocabulary | undefined> {
        try {
            const entry = await db.apiCache.get(word.toLowerCase().trim());
            if (!entry) return undefined;

            // Optional: Expiration check (e.g., 7 days)
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - entry.timestamp > sevenDays) {
                await db.apiCache.delete(word.toLowerCase().trim());
                return undefined;
            }

            return entry.data;
        } catch (error) {
            console.error('Failed to get cached word from Dexie:', error);
            return undefined;
        }
    },

    async cacheWord(word: string, data: Vocabulary): Promise<void> {
        try {
            await db.apiCache.put({
                id: word.toLowerCase().trim(),
                data,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Failed to cache word in Dexie:', error);
        }
    }
};

