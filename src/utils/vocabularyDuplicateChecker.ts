import { Vocabulary } from "@/types/vocabulary";
import { normalizeText } from "./duplicateDetection";
export { normalizeText };

/**
 * Interface for duplicate check result
 */
export interface DuplicateCheckResult {
    isDuplicate: boolean;
    duplicates: Vocabulary[];
    message: string;
}

export const checkVocabularyDuplicate = (
    newVocab: { english?: string; bangla?: string; partOfSpeech?: string },
    existingVocabularies: Vocabulary[]
): DuplicateCheckResult => {
    const normalizedNewEnglish = newVocab.english ? normalizeText(newVocab.english) : "";
    const normalizedNewBangla = newVocab.bangla ? normalizeText(newVocab.bangla) : "";
    const newPartOfSpeech = newVocab.partOfSpeech?.trim().toLowerCase() || "";

    // Find all vocabularies with the same English word or Bangla word (normalized)
    const matchingWords = existingVocabularies.filter(vocab => {
        const matchesEnglish = normalizedNewEnglish && normalizeText(vocab.english) === normalizedNewEnglish;
        const matchesBangla = normalizedNewBangla && normalizeText(vocab.bangla) === normalizedNewBangla;
        return matchesEnglish || matchesBangla;
    });

    if (matchingWords.length === 0) {
        return {
            isDuplicate: false,
            duplicates: [],
            message: "No duplicates found. This is a new vocabulary entry."
        };
    }

    // Check if any of the matching words also have the same part of speech
    const exactDuplicates = matchingWords.filter(vocab => {
        const isSamePartOfSpeech = vocab.partOfSpeech?.trim().toLowerCase() === newPartOfSpeech;
        const matchesEnglish = normalizedNewEnglish && normalizeText(vocab.english) === normalizedNewEnglish;
        const matchesBangla = normalizedNewBangla && normalizeText(vocab.bangla) === normalizedNewBangla;

        // Exact duplicate if same word (English or Bangla) AND same part of speech
        return isSamePartOfSpeech && (matchesEnglish || matchesBangla);
    });

    if (exactDuplicates.length > 0) {
        const dup = exactDuplicates[0];
        const dupType = normalizedNewEnglish && normalizeText(dup.english) === normalizedNewEnglish ? "English word" : "Bangla meaning";
        return {
            isDuplicate: true,
            duplicates: exactDuplicates,
            message: `Duplicate found! The ${dupType} "${dupType === "English word" ? dup.english : dup.bangla}" with part of speech "${dup.partOfSpeech}" already exists.`
        };
    }

    // Word exists but with different part of speech or it's a cross-match (e.g. English matches but Bangla doesn't)
    const differentPosParts = matchingWords.map(v => v.partOfSpeech).filter(Boolean).join(", ");
    const matchingType = matchingWords.some(v => normalizeText(v.english) === normalizedNewEnglish) ? "English word" : "Bangla meaning";

    return {
        isDuplicate: false,
        duplicates: matchingWords,
        message: `The ${matchingType} already exists with different part(s) of speech (${differentPosParts}).`
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
