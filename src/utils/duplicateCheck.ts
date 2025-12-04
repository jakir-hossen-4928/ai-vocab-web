import { Vocabulary } from "@/types/vocabulary";
import { normalizeText, calculateSimilarity } from "./duplicateDetection";

export interface DuplicateCheckResult {
    isDuplicate: boolean;
    type: "exact" | "similar" | "none";
    matches: Vocabulary[];
    similarity?: number;
}

/**
 * Check if a word already exists before adding it
 * @param newWord - The English word to check
 * @param existingVocabularies - Array of existing vocabularies
 * @param similarityThreshold - Threshold for similar matches (default: 85%)
 * @returns Result indicating if duplicate exists and what type
 */
export const checkForDuplicateBeforeAdd = (
    newWord: string,
    existingVocabularies: Vocabulary[],
    similarityThreshold: number = 85
): DuplicateCheckResult => {
    const normalizedNew = normalizeText(newWord);

    // Check for exact duplicates
    const exactMatches = existingVocabularies.filter(
        (vocab) => normalizeText(vocab.english) === normalizedNew
    );

    if (exactMatches.length > 0) {
        return {
            isDuplicate: true,
            type: "exact",
            matches: exactMatches,
        };
    }

    // Check for similar duplicates
    const similarMatches: { vocab: Vocabulary; similarity: number }[] = [];

    for (const vocab of existingVocabularies) {
        const normalizedExisting = normalizeText(vocab.english);
        const similarity = calculateSimilarity(normalizedNew, normalizedExisting);

        if (similarity >= similarityThreshold && similarity < 100) {
            similarMatches.push({ vocab, similarity });
        }
    }

    if (similarMatches.length > 0) {
        // Sort by similarity (highest first)
        similarMatches.sort((a, b) => b.similarity - a.similarity);

        return {
            isDuplicate: true,
            type: "similar",
            matches: similarMatches.map((m) => m.vocab),
            similarity: similarMatches[0].similarity,
        };
    }

    return {
        isDuplicate: false,
        type: "none",
        matches: [],
    };
};

/**
 * Get a user-friendly message for duplicate check result
 */
export const getDuplicateMessage = (result: DuplicateCheckResult): string => {
    if (!result.isDuplicate) {
        return "No duplicates found. Safe to add!";
    }

    if (result.type === "exact") {
        return `Exact duplicate found! "${result.matches[0].english}" already exists.`;
    }

    if (result.type === "similar" && result.similarity) {
        return `Similar word found! "${result.matches[0].english}" is ${Math.round(result.similarity)}% similar.`;
    }

    return "Potential duplicate detected.";
};
