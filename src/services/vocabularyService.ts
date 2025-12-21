import { dexieService } from "@/lib/dexieDb";
import { searchDictionaryAPI, convertDictionaryToVocabulary } from "./dictionaryApiService";
import { Vocabulary } from "@/types/vocabulary";

export const vocabularyService = {
    /**
     * Industry-grade search function
     * 1. Searches local database for instant results
     * 2. Checks local API cache for previously fetched external results
     * 3. Falls back to Dictionary API if word not found
     * 4. Updates search history
     */
    async search(query: string): Promise<Vocabulary[]> {
        const lowerQuery = query.toLowerCase().trim();
        if (!lowerQuery) return [];

        // 1. Instant local search (Dexie) - Includes primary, related, and verb forms
        const localResults = await dexieService.searchVocabularies(lowerQuery, 'all');

        // If even one result is found locally, we prioritize it and DON'T search online
        if (localResults.length > 0) {
            await dexieService.addSearchHistory(lowerQuery);
            return localResults;
        }

        // 2. Check API Cache (Previously fetched online results)
        const cachedWord = await dexieService.getCachedWord(lowerQuery);
        if (cachedWord) {
            await dexieService.addSearchHistory(lowerQuery);
            return [cachedWord];
        }

        // 3. Search online as fallback (Only if NO local or cached results found)
        if (navigator.onLine) {
            try {
                const onlineEntry = await searchDictionaryAPI(lowerQuery);
                if (onlineEntry) {
                    const id = `online_${lowerQuery}`;
                    const vocabulary = convertDictionaryToVocabulary(onlineEntry, id);

                    // Cache it for future offline use
                    await dexieService.cacheWord(lowerQuery, vocabulary);
                    await dexieService.addSearchHistory(lowerQuery);

                    return [vocabulary];
                }
            } catch (error) {
                console.error("[Vocabulary Service] Online search failed:", error);
            }
        }

        return [];
    },

    /**
   * Get search history
   */
    async getSearchHistory(limit: number = 10): Promise<string[]> {
        return await dexieService.getSearchHistory(limit);
    },

    /**
     * Clear search history
     */
    async clearSearchHistory(): Promise<void> {
        return await dexieService.clearSearchHistory();
    },

    /**
     * Lazy load vocabularies for infinite scrolling/performance
     */
    async getPagedVocabularies(offset: number, limit: number): Promise<Vocabulary[]> {
        return await dexieService.getPagedVocabularies(offset, limit);
    },

    /**
     * Extract verb forms or related words if missing (placeholder for AI enrichment)
     * This would be used in the Search result UI to show more info
     */
    async getDetailedInfo(vocabulary: Vocabulary): Promise<Vocabulary> {
        // If it's from API, it already has some details.
        // If it's local, we might want to check if it needs enhancement.
        return vocabulary;
    }
};
