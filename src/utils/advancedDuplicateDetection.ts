import { Vocabulary } from "@/types/vocabulary";

/**
 * Advanced duplicate detection with multiple algorithms
 */

// Phonetic similarity using Soundex algorithm
export const soundex = (str: string): string => {
    const s = str.toUpperCase().replace(/[^A-Z]/g, "");
    if (!s) return "0000";

    const firstLetter = s[0];
    const codes: { [key: string]: string } = {
        BFPV: "1",
        CGJKQSXZ: "2",
        DT: "3",
        L: "4",
        MN: "5",
        R: "6",
    };

    let soundexCode = firstLetter;
    let prevCode = "";

    for (let i = 1; i < s.length; i++) {
        const char = s[i];
        let code = "0";

        for (const [chars, num] of Object.entries(codes)) {
            if (chars.includes(char)) {
                code = num;
                break;
            }
        }

        if (code !== "0" && code !== prevCode) {
            soundexCode += code;
            prevCode = code;
        }

        if (soundexCode.length === 4) break;
    }

    return soundexCode.padEnd(4, "0");
};

// Jaro-Winkler distance for better string similarity
export const jaroWinklerDistance = (s1: string, s2: string): number => {
    const jaro = (str1: string, str2: string): number => {
        if (str1 === str2) return 1.0;
        if (str1.length === 0 || str2.length === 0) return 0.0;

        const matchDistance = Math.floor(Math.max(str1.length, str2.length) / 2) - 1;
        const str1Matches = new Array(str1.length).fill(false);
        const str2Matches = new Array(str2.length).fill(false);

        let matches = 0;
        let transpositions = 0;

        for (let i = 0; i < str1.length; i++) {
            const start = Math.max(0, i - matchDistance);
            const end = Math.min(i + matchDistance + 1, str2.length);

            for (let j = start; j < end; j++) {
                if (str2Matches[j] || str1[i] !== str2[j]) continue;
                str1Matches[i] = true;
                str2Matches[j] = true;
                matches++;
                break;
            }
        }

        if (matches === 0) return 0.0;

        let k = 0;
        for (let i = 0; i < str1.length; i++) {
            if (!str1Matches[i]) continue;
            while (!str2Matches[k]) k++;
            if (str1[i] !== str2[k]) transpositions++;
            k++;
        }

        return (
            (matches / str1.length +
                matches / str2.length +
                (matches - transpositions / 2) / matches) /
            3.0
        );
    };

    const jaroScore = jaro(s1, s2);

    // Find common prefix length (up to 4 characters)
    let prefixLength = 0;
    for (let i = 0; i < Math.min(s1.length, s2.length, 4); i++) {
        if (s1[i] === s2[i]) prefixLength++;
        else break;
    }

    return jaroScore + prefixLength * 0.1 * (1 - jaroScore);
};

// N-gram similarity
export const nGramSimilarity = (s1: string, s2: string, n: number = 2): number => {
    const getNGrams = (str: string, size: number): Set<string> => {
        const ngrams = new Set<string>();
        for (let i = 0; i <= str.length - size; i++) {
            ngrams.add(str.slice(i, i + size));
        }
        return ngrams;
    };

    const ngrams1 = getNGrams(s1.toLowerCase(), n);
    const ngrams2 = getNGrams(s2.toLowerCase(), n);

    const intersection = new Set([...ngrams1].filter((x) => ngrams2.has(x)));
    const union = new Set([...ngrams1, ...ngrams2]);

    return union.size === 0 ? 0 : (intersection.size / union.size) * 100;
};

// Damerau-Levenshtein distance (allows transpositions)
export const damerauLevenshteinDistance = (s1: string, s2: string): number => {
    const len1 = s1.length;
    const len2 = s2.length;
    const maxDist = len1 + len2;

    const H: { [key: string]: number } = {};
    const matrix: number[][] = Array(len1 + 2)
        .fill(null)
        .map(() => Array(len2 + 2).fill(0));

    matrix[0][0] = maxDist;
    for (let i = 0; i <= len1; i++) {
        matrix[i + 1][0] = maxDist;
        matrix[i + 1][1] = i;
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j + 1] = maxDist;
        matrix[1][j + 1] = j;
    }

    for (let i = 1; i <= len1; i++) {
        let DB = 0;
        for (let j = 1; j <= len2; j++) {
            const k = H[s2[j - 1]] || 0;
            const l = DB;
            let cost = 1;
            if (s1[i - 1] === s2[j - 1]) {
                cost = 0;
                DB = j;
            }

            matrix[i + 1][j + 1] = Math.min(
                matrix[i][j] + cost, // substitution
                matrix[i + 1][j] + 1, // insertion
                matrix[i][j + 1] + 1, // deletion
                matrix[k][l] + (i - k - 1) + 1 + (j - l - 1) // transposition
            );
        }
        H[s1[i - 1]] = i;
    }

    return matrix[len1 + 1][len2 + 1];
};

// Combined similarity score using multiple algorithms
export const advancedSimilarity = (s1: string, s2: string): number => {
    const normalized1 = s1.toLowerCase().trim();
    const normalized2 = s2.toLowerCase().trim();

    // Exact match
    if (normalized1 === normalized2) return 100;

    // Jaro-Winkler (good for typos and short strings)
    const jaroScore = jaroWinklerDistance(normalized1, normalized2) * 100;

    // N-gram (good for character-level similarity)
    const ngramScore = nGramSimilarity(normalized1, normalized2, 2);

    // Damerau-Levenshtein (good for transpositions)
    const maxLen = Math.max(normalized1.length, normalized2.length);
    const dlDistance = damerauLevenshteinDistance(normalized1, normalized2);
    const dlScore = ((maxLen - dlDistance) / maxLen) * 100;

    // Phonetic similarity (good for homophones)
    const phoneticMatch = soundex(normalized1) === soundex(normalized2) ? 20 : 0;

    // Weighted average (tuned for vocabulary matching)
    const score =
        jaroScore * 0.35 +
        ngramScore * 0.35 +
        dlScore * 0.25 +
        phoneticMatch * 0.05;

    return Math.min(100, Math.max(0, score));
};

// Detect common misspellings and variations
export const detectVariations = (word: string): string[] => {
    const variations: Set<string> = new Set([word.toLowerCase()]);

    // British vs American spellings
    const spellingRules: [RegExp, string][] = [
        [/our$/, "or"], // colour -> color
        [/or$/, "our"], // color -> colour
        [/ise$/, "ize"], // organise -> organize
        [/ize$/, "ise"], // organize -> organise
        [/re$/, "er"], // centre -> center
        [/er$/, "re"], // center -> centre
        [/ogue$/, "og"], // dialogue -> dialog
        [/og$/, "ogue"], // dialog -> dialogue
        [/ll/, "l"], // travelling -> traveling
        [/l$/, "ll"], // travel -> travell (for -ing forms)
    ];

    spellingRules.forEach(([pattern, replacement]) => {
        if (pattern.test(word)) {
            variations.add(word.replace(pattern, replacement));
        }
    });

    return Array.from(variations);
};

// Smart duplicate grouping with confidence scores
export interface SmartDuplicateGroup {
    key: string;
    duplicates: Vocabulary[];
    type: "exact" | "high-confidence" | "medium-confidence" | "low-confidence";
    confidence: number;
    reason: string[];
}

export const smartDuplicateDetection = (
    vocabularies: Vocabulary[],
    minConfidence: number = 75
): SmartDuplicateGroup[] => {
    const groups = new Map<string, SmartDuplicateGroup>();

    for (let i = 0; i < vocabularies.length; i++) {
        for (let j = i + 1; j < vocabularies.length; j++) {
            const v1 = vocabularies[i];
            const v2 = vocabularies[j];

            const similarity = advancedSimilarity(v1.english, v2.english);

            if (similarity >= minConfidence) {
                const reasons: string[] = [];
                let type: SmartDuplicateGroup["type"] = "low-confidence";

                if (similarity === 100) {
                    type = "exact";
                    reasons.push("Exact match");
                } else if (similarity >= 95) {
                    type = "high-confidence";
                    reasons.push("Very high similarity");
                } else if (similarity >= 85) {
                    type = "medium-confidence";
                    reasons.push("High similarity");
                } else {
                    type = "low-confidence";
                    reasons.push("Moderate similarity");
                }

                // Check for phonetic similarity
                if (soundex(v1.english) === soundex(v2.english)) {
                    reasons.push("Sounds similar");
                }

                // Check for common variations
                const variations1 = detectVariations(v1.english);
                const variations2 = detectVariations(v2.english);
                const hasVariation = variations1.some((v) => variations2.includes(v));
                if (hasVariation) {
                    reasons.push("Common spelling variation");
                }

                const key = `${v1.id}-${v2.id}`;
                if (!groups.has(key)) {
                    groups.set(key, {
                        key: v1.english.toLowerCase(),
                        duplicates: [v1, v2],
                        type,
                        confidence: Math.round(similarity),
                        reason: reasons,
                    });
                }
            }
        }
    }

    return Array.from(groups.values());
};
