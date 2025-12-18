import { Vocabulary } from "@/types/vocabulary";
import { normalizeText } from "./duplicateDetection";

/**
 * Interface for duplicate check result
 */
export interface DuplicateCheckResult {
    isDuplicate: boolean;
    duplicates: Vocabulary[];
    message: string;
}

/**
 * Check if a vocabulary entry already exists in the database
 * Detection logic:
 * 1. First, compare the part of speech
 * 2. Then, match the English word (normalized)
 * 3. If both match, it's a duplicate
 * 4. If only the word matches but part of speech differs, it's unique
 *
 * @param newVocab - The new vocabulary entry to check
 * @param existingVocabularies - Array of existing vocabularies from the database
 * @returns DuplicateCheckResult with isDuplicate flag and matching entries
 */
export const checkVocabularyDuplicate = (
    newVocab: { english: string; partOfSpeech?: string },
    existingVocabularies: Vocabulary[]
): DuplicateCheckResult => {
    const normalizedNewWord = normalizeText(newVocab.english);
    const newPartOfSpeech = newVocab.partOfSpeech?.trim().toLowerCase() || "";

    // Find all vocabularies with the same English word (normalized)
    const matchingWords = existingVocabularies.filter(vocab =>
        normalizeText(vocab.english) === normalizedNewWord
    );

    if (matchingWords.length === 0) {
        return {
            isDuplicate: false,
            duplicates: [],
            message: "No duplicates found. This is a new vocabulary entry."
        };
    }

    // Check if any of the matching words also have the same part of speech
    const exactDuplicates = matchingWords.filter(vocab =>
        vocab.partOfSpeech?.trim().toLowerCase() === newPartOfSpeech
    );

    if (exactDuplicates.length > 0) {
        return {
            isDuplicate: true,
            duplicates: exactDuplicates,
            message: `Duplicate found! The word "${newVocab.english}" with part of speech "${newVocab.partOfSpeech}" already exists.`
        };
    }

    // Word exists but with different part of speech - this is allowed
    const differentPosParts = matchingWords.map(v => v.partOfSpeech).filter(Boolean).join(", ");
    return {
        isDuplicate: false,
        duplicates: matchingWords,
        message: `The word "${newVocab.english}" exists with different part(s) of speech (${differentPosParts}). Adding as a new entry with "${newVocab.partOfSpeech}".`
    };
};

/**
 * Batch check for duplicates in bulk vocabulary additions
 * Returns an array of results for each vocabulary entry
 *
 * @param newVocabularies - Array of new vocabulary entries to check
 * @param existingVocabularies - Array of existing vocabularies from the database
 * @returns Array of DuplicateCheckResult for each new vocabulary
 */
export const checkBulkVocabularyDuplicates = (
    newVocabularies: { english: string; partOfSpeech?: string }[],
    existingVocabularies: Vocabulary[]
): Array<DuplicateCheckResult & { index: number; vocabulary: { english: string; partOfSpeech?: string } }> => {
    return newVocabularies.map((vocab, index) => ({
        ...checkVocabularyDuplicate(vocab, existingVocabularies),
        index,
        vocabulary: vocab
    }));
};

/**
 * Get statistics about duplicate detection results
 *
 * @param results - Array of duplicate check results
 * @returns Statistics object with counts
 */
export const getDuplicateStats = (
    results: Array<DuplicateCheckResult & { index: number; vocabulary: { english: string; partOfSpeech?: string } }>
) => {
    const duplicates = results.filter(r => r.isDuplicate);
    const unique = results.filter(r => !r.isDuplicate);
    const sameWordDifferentPos = results.filter(r => !r.isDuplicate && r.duplicates.length > 0);

    return {
        total: results.length,
        duplicates: duplicates.length,
        unique: unique.length,
        sameWordDifferentPos: sameWordDifferentPos.length,
        duplicateList: duplicates,
        uniqueList: unique,
        sameWordDifferentPosList: sameWordDifferentPos
    };
};

/**
 * Filter out duplicate entries from a bulk upload
 * Returns only the unique entries that should be added
 *
 * @param results - Array of duplicate check results
 * @returns Array of indices of non-duplicate entries
 */
export const filterNonDuplicates = <T extends { english: string; partOfSpeech?: string }>(
    vocabularies: T[],
    results: Array<DuplicateCheckResult & { index: number }>
): T[] => {
    const nonDuplicateIndices = new Set(
        results.filter(r => !r.isDuplicate).map(r => r.index)
    );

    return vocabularies.filter((_, index) => nonDuplicateIndices.has(index));
};
