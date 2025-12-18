// Legacy compatibility layer - now uses Dexie under the hood
import { Vocabulary } from '@/types/vocabulary';
import { dexieService } from './dexieDb';

// Re-export for backward compatibility
export const dbService = {
    async getAllVocabularies() {
        return dexieService.getAllVocabularies();
    },

    async getVocabulary(id: string) {
        return dexieService.getVocabulary(id);
    },

    async addVocabulary(vocab: Vocabulary) {
        return dexieService.addVocabulary(vocab);
    },

    async addVocabularies(vocabs: Vocabulary[]) {
        return dexieService.addVocabularies(vocabs);
    },

    async deleteVocabulary(id: string) {
        return dexieService.deleteVocabulary(id);
    },

    async clear() {
        return dexieService.clearVocabularies();
    }
};
