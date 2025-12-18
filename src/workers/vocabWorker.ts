import { Vocabulary } from "../types/vocabulary";
import { safeTimestamp } from "../utils/dateUtils";

type FilterPayload = {
    vocabularies: Vocabulary[];
    searchQuery: string;
    selectedPos: string;
    sortOrder: string;
    showFavorites: boolean;
    favorites: string[];
};

self.onmessage = (e: MessageEvent<FilterPayload>) => {
    const { vocabularies, searchQuery, selectedPos, sortOrder, showFavorites, favorites } = e.data;

    const filtered = vocabularies.filter((v) => {
        // Search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                v.bangla.toLowerCase().includes(query) ||
                v.english.toLowerCase().includes(query) ||
                v.partOfSpeech.toLowerCase().includes(query);
            if (!matchesSearch) return false;
        }

        // Part of Speech
        if (selectedPos !== "all" && v.partOfSpeech.toLowerCase() !== selectedPos.toLowerCase()) {
            return false;
        }

        // Favorites
        if (showFavorites && !favorites.includes(v.id)) {
            return false;
        }

        return true;
    }).sort((a, b) => {
        switch (sortOrder) {
            case "oldest":
                return safeTimestamp(a.createdAt) - safeTimestamp(b.createdAt);
            case "a-z":
                return a.english.localeCompare(b.english);
            case "z-a":
                return b.english.localeCompare(a.english);
            case "newest":
            default:
                return safeTimestamp(b.createdAt) - safeTimestamp(a.createdAt);
        }
    });

    self.postMessage(filtered);
};
