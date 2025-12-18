import { Vocabulary } from "@/types/vocabulary";

export interface DuplicateGroup {
    key: string; // The normalized key (e.g., normalized english word)
    duplicates: Vocabulary[];
    type: "exact" | "similar";
    similarity?: number;
}

/**
 * Normalize text for comparison
 * - Convert to lowercase
 * - Trim whitespace
 * - Remove special characters
 */
export const normalizeText = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ");
};

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching
 */
export const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
};

/**
 * Calculate similarity percentage between two strings
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 100;

    const distance = levenshteinDistance(str1, str2);
    return ((maxLength - distance) / maxLength) * 100;
};

/**
 * Find exact duplicates based on English word
 */
export const findExactDuplicates = (vocabularies: Vocabulary[]): DuplicateGroup[] => {
    const groups = new Map<string, Vocabulary[]>();

    vocabularies.forEach((vocab) => {
        const normalizedKey = normalizeText(vocab.english);

        if (!groups.has(normalizedKey)) {
            groups.set(normalizedKey, []);
        }
        groups.get(normalizedKey)!.push(vocab);
    });

    // Filter out groups with only one item
    const duplicateGroups: DuplicateGroup[] = [];
    groups.forEach((duplicates, key) => {
        if (duplicates.length > 1) {
            duplicateGroups.push({
                key,
                duplicates: duplicates.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                ),
                type: "exact",
            });
        }
    });

    return duplicateGroups;
};

/**
 * Find similar duplicates using fuzzy matching
 * @param vocabularies - Array of vocabularies to check
 * @param threshold - Similarity threshold (0-100), default 85%
 */
export const findSimilarDuplicates = (
    vocabularies: Vocabulary[],
    threshold: number = 85
): DuplicateGroup[] => {
    const groups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < vocabularies.length; i++) {
        if (processed.has(vocabularies[i].id)) continue;

        const similar: Vocabulary[] = [vocabularies[i]];
        const normalizedI = normalizeText(vocabularies[i].english);

        for (let j = i + 1; j < vocabularies.length; j++) {
            if (processed.has(vocabularies[j].id)) continue;

            const normalizedJ = normalizeText(vocabularies[j].english);
            const similarity = calculateSimilarity(normalizedI, normalizedJ);

            if (similarity >= threshold && similarity < 100) {
                similar.push(vocabularies[j]);
                processed.add(vocabularies[j].id);
            }
        }

        if (similar.length > 1) {
            processed.add(vocabularies[i].id);
            groups.push({
                key: normalizedI,
                duplicates: similar.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                ),
                type: "similar",
                similarity: threshold,
            });
        }
    }

    return groups;
};

/**
 * Find all duplicates (exact + similar)
 */
export const findAllDuplicates = (
    vocabularies: Vocabulary[],
    similarityThreshold: number = 85
): {
    exact: DuplicateGroup[];
    similar: DuplicateGroup[];
    total: number;
} => {
    const exact = findExactDuplicates(vocabularies);
    const similar = findSimilarDuplicates(vocabularies, similarityThreshold);

    return {
        exact,
        similar,
        total: exact.length + similar.length,
    };
};

/**
 * Find the most complete vocabulary from a list
 * Based on: examples count, synonyms count, antonyms count, explanation length, verbForms, relatedWords
 */
export const findMostComplete = (vocabularies: Vocabulary[]): Vocabulary => {
    if (vocabularies.length === 0) {
        throw new Error("Cannot find most complete from empty array");
    }

    if (vocabularies.length === 1) {
        return vocabularies[0];
    }

    return vocabularies.reduce((best, current) => {
        const bestVerbFormsScore = best.verbForms
            ? Object.values(best.verbForms).filter(Boolean).length * 2
            : 0;
        const currentVerbFormsScore = current.verbForms
            ? Object.values(current.verbForms).filter(Boolean).length * 2
            : 0;

        const bestScore =
            best.examples.length * 3 + // Examples are most valuable
            best.synonyms.length * 2 +
            best.antonyms.length * 2 +
            (best.explanation?.length || 0) / 10 + // Explanation length (scaled down)
            (best.pronunciation?.length || 0) / 5 + // Pronunciation length (scaled down)
            bestVerbFormsScore + // Verb forms completeness
            (best.relatedWords?.length || 0) * 2; // Related words count

        const currentScore =
            current.examples.length * 3 +
            current.synonyms.length * 2 +
            current.antonyms.length * 2 +
            (current.explanation?.length || 0) / 10 +
            (current.pronunciation?.length || 0) / 5 +
            currentVerbFormsScore +
            (current.relatedWords?.length || 0) * 2;

        return currentScore > bestScore ? current : best;
    });
};

/**
 * Merge multiple vocabularies into one
 * Keeps the most complete information from all duplicates
 * Uses the most complete vocabulary as the base (instead of newest)
 */
export const mergeVocabularies = (vocabularies: Vocabulary[]): Omit<Vocabulary, "id"> => {
    if (vocabularies.length === 0) {
        throw new Error("Cannot merge empty array");
    }

    if (vocabularies.length === 1) {
        const { id, ...rest } = vocabularies[0];
        return rest;
    }

    // Find the most complete vocabulary to use as base
    const base = findMostComplete(vocabularies);

    // Merge all unique examples
    const allExamples = vocabularies.flatMap(v => v.examples);
    const uniqueExamples = Array.from(
        new Map(allExamples.map(ex => [`${ex.en}|${ex.bn}`, ex])).values()
    );

    // Merge all unique synonyms
    const allSynonyms = vocabularies.flatMap(v => v.synonyms);
    const uniqueSynonyms = Array.from(new Set(allSynonyms.map(normalizeText)))
        .map(normalized => allSynonyms.find(s => normalizeText(s) === normalized)!)
        .filter(Boolean);

    // Merge all unique antonyms
    const allAntonyms = vocabularies.flatMap(v => v.antonyms);
    const uniqueAntonyms = Array.from(new Set(allAntonyms.map(normalizeText)))
        .map(normalized => allAntonyms.find(a => normalizeText(a) === normalized)!)
        .filter(Boolean);

    // Choose the longest/most detailed explanation
    const explanation = vocabularies
        .map(v => v.explanation)
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)[0] || base.explanation;

    // Choose the most detailed pronunciation
    const pronunciation = vocabularies
        .map(v => v.pronunciation)
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)[0] || base.pronunciation;

    // Merge verbForms - prefer the most complete one
    const verbForms = vocabularies
        .map(v => v.verbForms)
        .filter(Boolean)
        .sort((a, b) => {
            const aComplete = Object.values(a!).filter(Boolean).length;
            const bComplete = Object.values(b!).filter(Boolean).length;
            return bComplete - aComplete;
        })[0] || base.verbForms;

    // Merge all unique relatedWords
    const allRelatedWords = vocabularies.flatMap(v => v.relatedWords || []);
    const uniqueRelatedWords = Array.from(
        new Map(allRelatedWords.map(rw => [normalizeText(rw.word), rw])).values()
    );

    const { id, verbForms: _vf, relatedWords: _rw, ...baseWithoutId } = base;

    const result: Omit<Vocabulary, "id"> = {
        ...baseWithoutId,
        examples: uniqueExamples,
        synonyms: uniqueSynonyms,
        antonyms: uniqueAntonyms,
        explanation,
        pronunciation,
        updatedAt: new Date().toISOString(),
    };

    if (verbForms) {
        result.verbForms = verbForms;
    }

    if (uniqueRelatedWords.length > 0) {
        result.relatedWords = uniqueRelatedWords;
    }

    return result;
};

/**
 * Get statistics about duplicates
 */
export const getDuplicateStats = (vocabularies: Vocabulary[]) => {
    const { exact, similar, total } = findAllDuplicates(vocabularies);

    const exactCount = exact.reduce((sum, group) => sum + group.duplicates.length, 0);
    const similarCount = similar.reduce((sum, group) => sum + group.duplicates.length, 0);

    return {
        totalVocabularies: vocabularies.length,
        duplicateGroups: total,
        exactDuplicates: exactCount,
        similarDuplicates: similarCount,
        potentialSavings: exactCount + similarCount - total, // Words that could be removed
        exact,
        similar,
    };
};
