import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Vocabulary } from "@/types/vocabulary";
import { DuplicateGroup, mergeVocabularies, findMostComplete } from "@/utils/duplicateDetection";
import { doc, deleteDoc, addDoc, collection, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { dbService } from "@/lib/db";

const isContentEqual = (v1: Vocabulary, v2: Omit<Vocabulary, "id">): boolean => {
    if (v1.english !== v2.english) return false;
    if (v1.bangla !== v2.bangla) return false;
    if ((v1.explanation || "") !== (v2.explanation || "")) return false;
    if ((v1.pronunciation || "") !== (v2.pronunciation || "")) return false;

    // Check arrays length first for speed
    if (v1.examples.length !== v2.examples.length) return false;
    if (v1.synonyms.length !== v2.synonyms.length) return false;
    if (v1.antonyms.length !== v2.antonyms.length) return false;

    // Deep check
    // Examples
    const ex1 = [...v1.examples].sort((a, b) => a.en.localeCompare(b.en));
    const ex2 = [...v2.examples].sort((a, b) => a.en.localeCompare(b.en));
    if (JSON.stringify(ex1) !== JSON.stringify(ex2)) return false;

    // Synonyms
    const syn1 = [...v1.synonyms].sort();
    const syn2 = [...v2.synonyms].sort();
    if (JSON.stringify(syn1) !== JSON.stringify(syn2)) return false;

    // Antonyms
    const ant1 = [...v1.antonyms].sort();
    const ant2 = [...v2.antonyms].sort();
    if (JSON.stringify(ant1) !== JSON.stringify(ant2)) return false;

    // VerbForms
    if (JSON.stringify(v1.verbForms) !== JSON.stringify(v2.verbForms)) return false;

    // RelatedWords
    const rw1 = (v1.relatedWords || []).sort((a, b) => a.word.localeCompare(b.word));
    const rw2 = (v2.relatedWords || []).sort((a, b) => a.word.localeCompare(b.word));
    if (JSON.stringify(rw1) !== JSON.stringify(rw2)) return false;

    return true;
};

export const useDuplicateManagement = () => {
    const queryClient = useQueryClient();

    /**
     * Merge duplicates into a single vocabulary entry
     * Keeps the most complete item's ID and deletes the rest
     */
    const mergeDuplicates = useMutation({
        mutationFn: async ({ group, keepId }: { group: DuplicateGroup; keepId?: string }) => {
            const batch = writeBatch(db);

            // Determine which vocabulary to keep
            const toKeep = keepId
                ? group.duplicates.find(v => v.id === keepId)!
                : findMostComplete(group.duplicates); // Keep the most complete by default

            const toDelete = group.duplicates.filter(v => v.id !== toKeep.id);

            // Merge all vocabularies
            const mergedData = mergeVocabularies(group.duplicates);

            // Check if update is needed
            const needsUpdate = !isContentEqual(toKeep, mergedData);

            // Update the kept vocabulary with merged data if needed
            if (needsUpdate) {
                const keepRef = doc(db, "vocabularies", toKeep.id);
                batch.update(keepRef, mergedData);
            }

            // Delete the duplicates
            toDelete.forEach(vocab => {
                const deleteRef = doc(db, "vocabularies", vocab.id);
                batch.delete(deleteRef);
            });

            await batch.commit();

            return {
                kept: { id: toKeep.id, ...mergedData } as Vocabulary,
                deleted: toDelete.map(v => v.id),
            };
        },
        onSuccess: async ({ kept, deleted }) => {
            // Update IDB
            await dbService.addVocabulary(kept);
            for (const id of deleted) {
                await dbService.deleteVocabulary(id);
            }

            // Update cache
            queryClient.setQueryData(["vocabularies"], (oldData: Vocabulary[] | undefined) => {
                if (!oldData) return oldData;

                // Remove deleted items and update the kept item
                return oldData
                    .filter(v => !deleted.includes(v.id))
                    .map(v => v.id === kept.id ? kept : v);
            });

            toast.success(`Merged ${deleted.length + 1} duplicate${deleted.length > 0 ? 's' : ''} successfully`);
        },
        onError: (error: any) => {
            console.error("Error merging duplicates:", error);
            toast.error("Failed to merge duplicates");
        },
    });

    /**
     * Delete specific vocabularies from a duplicate group
     */
    const deleteDuplicates = useMutation({
        mutationFn: async (ids: string[]) => {
            const batch = writeBatch(db);

            ids.forEach(id => {
                const deleteRef = doc(db, "vocabularies", id);
                batch.delete(deleteRef);
            });

            await batch.commit();
            return ids;
        },
        onSuccess: async (deletedIds) => {
            // Update IDB
            for (const id of deletedIds) {
                await dbService.deleteVocabulary(id);
            }

            // Update cache
            queryClient.setQueryData(["vocabularies"], (oldData: Vocabulary[] | undefined) => {
                if (!oldData) return oldData;
                return oldData.filter(v => !deletedIds.includes(v.id));
            });

            toast.success(`Deleted ${deletedIds.length} duplicate${deletedIds.length > 1 ? 's' : ''}`);
        },
        onError: (error: any) => {
            console.error("Error deleting duplicates:", error);
            toast.error("Failed to delete duplicates");
        },
    });

    /**
     * Keep one vocabulary and delete all others in the group
     */
    const keepOne = useMutation({
        mutationFn: async ({ group, keepId }: { group: DuplicateGroup; keepId: string }) => {
            const toDelete = group.duplicates.filter(v => v.id !== keepId);
            const batch = writeBatch(db);

            toDelete.forEach(vocab => {
                const deleteRef = doc(db, "vocabularies", vocab.id);
                batch.delete(deleteRef);
            });

            await batch.commit();
            return { keepId, deletedIds: toDelete.map(v => v.id) };
        },
        onSuccess: async ({ keepId, deletedIds }) => {
            // Update IDB
            for (const id of deletedIds) {
                await dbService.deleteVocabulary(id);
            }

            // Update cache
            queryClient.setQueryData(["vocabularies"], (oldData: Vocabulary[] | undefined) => {
                if (!oldData) return oldData;
                return oldData.filter(v => !deletedIds.includes(v.id));
            });

            toast.success(`Kept 1 vocabulary, deleted ${deletedIds.length} duplicate${deletedIds.length > 1 ? 's' : ''}`);
        },
        onError: (error: any) => {
            console.error("Error keeping vocabulary:", error);
            toast.error("Failed to process duplicates");
        },
    });

    /**
     * Auto-merge all exact duplicates
     * This will merge all exact duplicate groups automatically
     * Keeps the most complete vocabulary from each group
     */
    const autoMergeExactDuplicates = useMutation({
        mutationFn: async (groups: DuplicateGroup[]) => {
            const results: { kept: Vocabulary; deleted: string[] }[] = [];

            // Chunk operations to avoid batch limit (500)
            let batch = writeBatch(db);
            let operationCount = 0;
            const MAX_BATCH_SIZE = 450; // Safety margin

            for (const group of groups) {
                if (group.type !== "exact") continue;

                const toKeep = findMostComplete(group.duplicates); // Keep the most complete
                const toDelete = group.duplicates.filter(v => v.id !== toKeep.id);

                if (toDelete.length === 0) continue;

                const mergedData = mergeVocabularies(group.duplicates);

                // Check if update is needed
                const needsUpdate = !isContentEqual(toKeep, mergedData);

                // Check if adding these operations would exceed batch limit
                const opsNeeded = (needsUpdate ? 1 : 0) + toDelete.length;

                if (operationCount + opsNeeded > MAX_BATCH_SIZE) {
                    await batch.commit();
                    batch = writeBatch(db);
                    operationCount = 0;
                }

                // Update the kept vocabulary if needed
                if (needsUpdate) {
                    const keepRef = doc(db, "vocabularies", toKeep.id);
                    batch.update(keepRef, mergedData);
                    operationCount++;
                }

                // Delete duplicates
                toDelete.forEach(vocab => {
                    const deleteRef = doc(db, "vocabularies", vocab.id);
                    batch.delete(deleteRef);
                    operationCount++;
                });

                results.push({
                    kept: { id: toKeep.id, ...mergedData } as Vocabulary,
                    deleted: toDelete.map(v => v.id),
                });
            }

            if (operationCount > 0) {
                await batch.commit();
            }

            return results;
        },
        onSuccess: async (results) => {
            // Update IDB
            for (const result of results) {
                await dbService.addVocabulary(result.kept);
                for (const id of result.deleted) {
                    await dbService.deleteVocabulary(id);
                }
            }

            // Update cache
            queryClient.setQueryData(["vocabularies"], (oldData: Vocabulary[] | undefined) => {
                if (!oldData) return oldData;

                const allDeleted = results.flatMap(r => r.deleted);
                const allKept = results.map(r => r.kept);

                return oldData
                    .filter(v => !allDeleted.includes(v.id))
                    .map(v => {
                        const updated = allKept.find(k => k.id === v.id);
                        return updated || v;
                    });
            });

            const totalMerged = results.reduce((sum, r) => sum + r.deleted.length + 1, 0);
            toast.success(`Auto-merged ${results.length} groups. Kept most complete entries and removed duplicates.`);
        },
        onError: (error: any) => {
            console.error("Error auto-merging duplicates:", error);
            toast.error("Failed to auto-merge duplicates");
        },
    });

    return {
        mergeDuplicates,
        deleteDuplicates,
        keepOne,
        autoMergeExactDuplicates,
    };
};
