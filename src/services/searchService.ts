import MiniSearch from 'minisearch';
import { Vocabulary } from '@/types/vocabulary';

// Common stop words to filter out (can be expanded)
const STOP_WORDS = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);

export const searchService = {
    miniSearch: new MiniSearch<Vocabulary>({
        fields: ['english', 'bangla', 'synonyms', 'relatedWords', 'examples.en'], // fields to index for full-text search
        storeFields: ['id', 'english', 'bangla'], // fields to return with search results
        searchOptions: {
            prefix: true,
            fuzzy: (term) => term.length > 3 ? 0.2 : null, // Only fuzzy search words > 3 chars
            boost: { english: 3, bangla: 2, relatedWords: 1.5 } // English matches rank higher, related words get a boost
        },
        processTerm: (term) => {
            const lowerTerm = term.toLowerCase();
            return STOP_WORDS.has(lowerTerm) ? null : lowerTerm;
        },
        extractField: (document, fieldName) => {
            // Handle nested fields or arrays if needed
            if (fieldName === 'relatedWords' && document.relatedWords) {
                return document.relatedWords.map((rw: any) => `${rw.word} ${rw.meaning || ''}`).join(' ');
            }
            if (fieldName === 'synonyms' && document.synonyms) {
                return document.synonyms.join(' ');
            }
            if (fieldName === 'examples.en' && document.examples) {
                return document.examples.map((ex: any) => ex.en).join(' ');
            }
            return fieldName.split('.').reduce((doc: any, key) => doc && doc[key], document);
        }
    }),

    isIndexed: false,

    buildIndex(vocabularies: Vocabulary[]) {
        console.log('[SearchService] Building search index...');
        this.miniSearch.removeAll();
        this.miniSearch.addAll(vocabularies);
        this.isIndexed = true;
        console.log(`[SearchService] Index built with ${vocabularies.length} items`);
    },

    search(query: string) {
        if (!query) return [];
        return this.miniSearch.search(query);
    },

    autoSuggest(query: string) {
        if (!query) return [];
        return this.miniSearch.autoSuggest(query);
    },

    add(item: Vocabulary) {
        if (!this.isIndexed) return;
        if (this.miniSearch.has(item.id)) {
            this.miniSearch.replace(item);
        } else {
            this.miniSearch.add(item);
        }
    },

    remove(id: string) {
        if (!this.isIndexed) return;
        this.miniSearch.discard(id);
    },

    update(item: Vocabulary) {
        if (!this.isIndexed) return;
        // MiniSearch requires the document to be removed then added, or replaced
        // If it exists, replace it
        if (this.miniSearch.has(item.id)) {
            this.miniSearch.replace(item);
        } else {
            this.miniSearch.add(item);
        }
    }
};
