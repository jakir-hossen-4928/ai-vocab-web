import { Vocabulary } from "@/types/vocabulary";

// Web Worker for duplicate detection
// This runs in a separate thread to avoid blocking the UI

interface DetectionMessage {
    type: "detect";
    vocabularies: Vocabulary[];
    similarityThreshold: number;
}

interface DetectionResult {
    type: "result";
    exact: any[];
    similar: any[];
    stats: any;
}

self.onmessage = (e: MessageEvent<DetectionMessage>) => {
    const { type, vocabularies, similarityThreshold } = e.data;

    if (type === "detect") {
        // Normalize text for comparison
        const normalizeText = (text: string): string => {
            return text
                .toLowerCase()
                .trim()
                .replace(/[^\w\s]/g, "")
                .replace(/\s+/g, " ");
        };

        // Calculate Levenshtein distance
        const levenshteinDistance = (str1: string, str2: string): number => {
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
                            matrix[i - 1][j - 1] + 1,
                            matrix[i][j - 1] + 1,
                            matrix[i - 1][j] + 1
                        );
                    }
                }
            }

            return matrix[str2.length][str1.length];
        };

        // Calculate similarity percentage
        const calculateSimilarity = (str1: string, str2: string): number => {
            const maxLength = Math.max(str1.length, str2.length);
            if (maxLength === 0) return 100;

            const distance = levenshteinDistance(str1, str2);
            return ((maxLength - distance) / maxLength) * 100;
        };

        // Find exact duplicates
        const findExactDuplicates = () => {
            const groups = new Map<string, Vocabulary[]>();

            vocabularies.forEach((vocab) => {
                const normalizedKey = normalizeText(vocab.english);

                if (!groups.has(normalizedKey)) {
                    groups.set(normalizedKey, []);
                }
                groups.get(normalizedKey)!.push(vocab);
            });

            const duplicateGroups: any[] = [];
            groups.forEach((duplicates, key) => {
                if (duplicates.length > 1) {
                    duplicateGroups.push({
                        key,
                        duplicates: duplicates.sort(
                            (a, b) =>
                                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        ),
                        type: "exact",
                    });
                }
            });

            return duplicateGroups;
        };

        // Find similar duplicates with optimization
        const findSimilarDuplicates = () => {
            const groups: any[] = [];
            const processed = new Set<string>();

            // Sort by length to optimize comparisons
            const sorted = [...vocabularies].sort(
                (a, b) => a.english.length - b.english.length
            );

            for (let i = 0; i < sorted.length; i++) {
                if (processed.has(sorted[i].id)) continue;

                const similar: Vocabulary[] = [sorted[i]];
                const normalizedI = normalizeText(sorted[i].english);

                // Only compare with words of similar length (optimization)
                const lengthThreshold = Math.ceil(sorted[i].english.length * 0.3);

                for (let j = i + 1; j < sorted.length; j++) {
                    if (processed.has(sorted[j].id)) continue;

                    // Skip if length difference is too large
                    const lengthDiff = Math.abs(
                        sorted[i].english.length - sorted[j].english.length
                    );
                    if (lengthDiff > lengthThreshold) continue;

                    const normalizedJ = normalizeText(sorted[j].english);
                    const similarity = calculateSimilarity(normalizedI, normalizedJ);

                    if (similarity >= similarityThreshold && similarity < 100) {
                        similar.push(sorted[j]);
                        processed.add(sorted[j].id);
                    }
                }

                if (similar.length > 1) {
                    processed.add(sorted[i].id);
                    groups.push({
                        key: normalizedI,
                        duplicates: similar.sort(
                            (a, b) =>
                                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        ),
                        type: "similar",
                        similarity: similarityThreshold,
                    });
                }
            }

            return groups;
        };

        // Perform detection
        const exact = findExactDuplicates();
        const similar = findSimilarDuplicates();

        const exactCount = exact.reduce((sum, group) => sum + group.duplicates.length, 0);
        const similarCount = similar.reduce((sum, group) => sum + group.duplicates.length, 0);

        const stats = {
            totalVocabularies: vocabularies.length,
            duplicateGroups: exact.length + similar.length,
            exactDuplicates: exactCount,
            similarDuplicates: similarCount,
            potentialSavings: exactCount + similarCount - (exact.length + similar.length),
        };

        // Send result back to main thread
        const result: DetectionResult = {
            type: "result",
            exact,
            similar,
            stats,
        };

        self.postMessage(result);
    }
};

export { };
