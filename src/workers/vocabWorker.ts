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
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchesPrimary =
                v.bangla.toLowerCase().includes(query) ||
                v.english.toLowerCase().includes(query) ||
                (v.partOfSpeech && v.partOfSpeech.toLowerCase().includes(query)) ||
                (v.synonyms && v.synonyms.some(s => s.toLowerCase().includes(query)));

            const matchesRelated = v.relatedWords && v.relatedWords.some(rw =>
                rw.word.toLowerCase().includes(query) ||
                rw.meaning.toLowerCase().includes(query)
            );

            const matchesVerbForms = v.verbForms && (
                (v.verbForms.base && v.verbForms.base.toLowerCase().includes(query)) ||
                (v.verbForms.v2 && v.verbForms.v2.toLowerCase().includes(query)) ||
                (v.verbForms.v3 && v.verbForms.v3.toLowerCase().includes(query)) ||
                (v.verbForms.ing && v.verbForms.ing.toLowerCase().includes(query)) ||
                (v.verbForms.s_es && v.verbForms.s_es.toLowerCase().includes(query))
            );

            if (!matchesPrimary && !matchesRelated && !matchesVerbForms) return false;
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
