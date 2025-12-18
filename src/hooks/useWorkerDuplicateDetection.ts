import { useState, useEffect, useCallback } from "react";
import { Vocabulary } from "@/types/vocabulary";
import { DuplicateGroup } from "@/utils/duplicateDetection";

interface DetectionStats {
    totalVocabularies: number;
    duplicateGroups: number;
    exactDuplicates: number;
    similarDuplicates: number;
    potentialSavings: number;
}

interface DetectionResult {
    exact: DuplicateGroup[];
    similar: DuplicateGroup[];
    stats: DetectionStats;
}

/**
 * Hook to use Web Worker for duplicate detection
 * Prevents UI blocking for large datasets
 */
export const useWorkerDuplicateDetection = (
    vocabularies: Vocabulary[],
    similarityThreshold: number = 85
) => {
    const [result, setResult] = useState<DetectionResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const detectDuplicates = useCallback(() => {
        if (!vocabularies || vocabularies.length === 0) {
            setResult({
                exact: [], similar: [], stats: {
                    totalVocabularies: 0,
                    duplicateGroups: 0,
                    exactDuplicates: 0,
                    similarDuplicates: 0,
                    potentialSavings: 0,
                }
            });
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setError(null);

        try {
            // Create worker
            const worker = new Worker(
                new URL("@/workers/duplicateDetection.worker.ts", import.meta.url),
                { type: "module" }
            );

            // Simulate progress (since worker doesn't report progress)
            const progressInterval = setInterval(() => {
                setProgress((prev) => Math.min(prev + 10, 90));
            }, 200);

            worker.onmessage = (e) => {
                clearInterval(progressInterval);
                setProgress(100);

                const { type, exact, similar, stats } = e.data;

                if (type === "result") {
                    setResult({ exact, similar, stats });
                    setIsProcessing(false);
                }

                worker.terminate();
            };

            worker.onerror = (err) => {
                clearInterval(progressInterval);
                console.error("Worker error:", err);
                setError("Failed to detect duplicates. Please try again.");
                setIsProcessing(false);
                worker.terminate();
            };

            // Send data to worker
            worker.postMessage({
                type: "detect",
                vocabularies,
                similarityThreshold,
            });
        } catch (err) {
            console.error("Failed to create worker:", err);
            setError("Failed to initialize duplicate detection.");
            setIsProcessing(false);
        }
    }, [vocabularies, similarityThreshold]);

    // Auto-detect when vocabularies change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            detectDuplicates();
        }, 500); // Debounce

        return () => clearTimeout(timeoutId);
    }, [detectDuplicates]);

    return {
        result,
        isProcessing,
        progress,
        error,
        redetect: detectDuplicates,
    };
};
