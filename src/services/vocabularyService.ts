import { dexieService } from "@/lib/dexieDb";
import { searchDictionaryAPI, convertDictionaryToVocabulary } from "./dictionaryApiService";
import { Vocabulary } from "@/types/vocabulary";
import { searchService } from "./searchService";

export const vocabularyService = {
    /**
     * Industry-grade search function using MiniSearch (In-Memory Index)
     * 1. Check/Build Index -> Search Index
     * 2. Retrieve results from Dexie by ID
     * 3. Fallback to API/Cache if needed
     */
    async search(query: string): Promise<Vocabulary[]> {
        const lowerQuery = query.toLowerCase().trim();
        if (!lowerQuery) return [];

        try {
            // 0. Ensure Index is built
            if (!searchService.isIndexed) {
                console.log("[VocabularyService] Index not found. Building now...");
                const allVocabs = await dexieService.getAllVocabularies();
                searchService.buildIndex(allVocabs);
            }

            // 1. Instant Local Search (MiniSearch)
            const searchResults = searchService.search(lowerQuery);

            if (searchResults && searchResults.length > 0) {
                // Get full objects for the Top 50 results
                const topIds = searchResults.slice(0, 50).map(r => r.id);
                const vocabularies = await dexieService.getVocabulariesByIds(topIds);

                // Preserve order from search results (relevance)
                const orderedVocabularies = topIds
                    .map(id => vocabularies.find(v => v.id === id))
                    .filter((v): v is Vocabulary => !!v);

                if (orderedVocabularies.length > 0) {
                    await dexieService.addSearchHistory(lowerQuery);
                    return orderedVocabularies;
                }
            }

            // Fallback: If MiniSearch found nothing (e.g. searching for a substring like "ppl" in "apple"),
            // try the naive Dexie search which does .includes()
            console.log("[VocabularyService] MiniSearch returned 0 results. Falling back to Dexie substring search.");
            const fallbackResults = await dexieService.searchVocabularies(lowerQuery);
            if (fallbackResults.length > 0) {
                await dexieService.addSearchHistory(lowerQuery);
                return fallbackResults;
            }

        } catch (error) {
            console.error("[VocabularyService] Search error:", error);
            // Fallback to basic DB search if index fails
            return await dexieService.searchVocabularies(lowerQuery);
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
