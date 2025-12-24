import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    addDoc,
    updateDoc,
    query,
    orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Vocabulary } from "@/types/vocabulary";
import { toast } from "sonner";
import { dexieService } from "@/lib/dexieDb";
import { useState, useEffect } from "react";

const SYNC_KEY = 'vocabularies';
const CACHE_DURATION_MINUTES = 10; // Increased to 10 minutes for better efficiency

export const useVocabularies = () => {
    const queryClient = useQueryClient();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const queryResult = useQuery({
        queryKey: ["vocabularies"],
        queryFn: async () => {
            try {
                // 1. Try to get data from Dexie first (Fast!)
                const cached = await dexieService.getAllVocabularies();
                const shouldSync = await dexieService.shouldSync(SYNC_KEY, CACHE_DURATION_MINUTES);

                // Helper function to fetch from Firestore and update everything
                const fetchAndSync = async () => {
                    console.log('[Firestore] Fetching vocabularies...');
                    const q = query(collection(db, "vocabularies"), orderBy("createdAt", "desc"));
                    const snapshot = await getDocs(q);
                    const vocabularies = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Vocabulary[];

                    console.log(`[Firestore] Fetched ${vocabularies.length} vocabularies`);

                    // Sync to Dexie
                    await dexieService.clearVocabularies();
                    await dexieService.addVocabularies(vocabularies);
                    await dexieService.updateSyncMetadata(SYNC_KEY);

                    console.log('[Dexie] Synced vocabularies to cache');

                    // Update Query Cache to trigger re-render with fresh data
                    queryClient.setQueryData(["vocabularies"], vocabularies);

                    return vocabularies;
                };

                // 2. If we have cached data, return it IMMEDIATELY
                if (cached && cached.length > 0) {
                    if (shouldSync) {
                        console.log('[Dexie] Data found but stale. Returning cached data and scheduling background sync...');
                        // Defer background sync to avoid blocking main thread during initial render
                        setTimeout(() => {
                            fetchAndSync().catch(err => console.error("Background sync failed:", err));
                        }, 1000); // Reduced wait time to 1 second for faster updates
                    } else {
                        console.log('[Dexie] Using fresh cached data');
                    }
                    return cached;
                }

                // 3. No local data? Must wait for Firestore
                console.log('[Dexie] No local data. Fetching from Firestore...');
                return await fetchAndSync();

            } catch (error) {
                console.warn("Error in queryFn:", error);
                // Fallback to whatever we have in Dexie if Firestore fails
                const cached = await dexieService.getAllVocabularies();
                if (cached.length > 0) {
                    console.log(`[Dexie] Returning ${cached.length} cached items after error`);
                    return cached;
                }
                throw error;
            }
        },
        staleTime: 1000 * 60 * CACHE_DURATION_MINUTES, // Consider data fresh for this long
        gcTime: 1000 * 60 * 60 * 24, // Keep in garbage collection for 24 hours (offline support)
        refetchInterval: 1000 * 60 * CACHE_DURATION_MINUTES, // Auto-refetch every 5 minutes
        refetchOnWindowFocus: true, // Refetch when window gains focus
        refetchOnReconnect: true, // Refetch when network reconnects
    });

    const refresh = async () => {
        setIsRefreshing(true);
        console.log('[Vocabularies] Force refreshing from Firestore...');
        try {
            // Force fetch from Firestore
            const q = query(collection(db, "vocabularies"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            const vocabularies = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Vocabulary[];

            console.log(`[Firestore] Force refreshed ${vocabularies.length} vocabularies`);

            // Update Dexie
            await dexieService.clearVocabularies();
            await dexieService.addVocabularies(vocabularies);
            await dexieService.updateSyncMetadata(SYNC_KEY);

            // Update React Query Cache
            queryClient.setQueryData(["vocabularies"], vocabularies);

            return vocabularies;
        } catch (error) {
            console.error("Error refreshing vocabularies:", error);
            throw error;
        } finally {
            setIsRefreshing(false);
        }
    };

    return {
        ...queryResult,
        refresh,
        isRefetching: queryResult.isRefetching || isRefreshing,
    };
};

export const useVocabularyMutations = () => {
    const queryClient = useQueryClient();

    const addVocabulary = useMutation({
        mutationFn: async (newVocab: Omit<Vocabulary, "id">) => {
            const now = new Date().toISOString();
            const dataWithTimestamps = {
                ...newVocab,
                createdAt: now,
                updatedAt: now
            };
            const docRef = await addDoc(collection(db, "vocabularies"), dataWithTimestamps);
            return { id: docRef.id, ...dataWithTimestamps } as Vocabulary;
        },
        onSuccess: async (newVocab) => {
            // Update Dexie cache
            await dexieService.addVocabulary(newVocab);
            await dexieService.updateSyncMetadata(SYNC_KEY);

            // Optimistic Update: Manually add to cache
            queryClient.setQueryData(["vocabularies"], (oldData: Vocabulary[] | undefined) => {
                if (!oldData) return [newVocab];
                return [newVocab, ...oldData];
            });

            console.log('[Dexie] Added new vocabulary to cache');
            toast.success("Vocabulary added successfully");
        },
        onError: (error: any) => {
            console.error("Error adding vocabulary:", error);
            toast.error("Failed to add vocabulary");
        },
    });

    const updateVocabulary = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Vocabulary> }) => {
            const updateData = {
                ...data,
                updatedAt: new Date().toISOString()
            };
            await updateDoc(doc(db, "vocabularies", id), updateData);
            return { id, ...updateData };
        },
        onSuccess: async (updatedVocab) => {
            // Update Dexie cache
            const currentCache = queryClient.getQueryData<Vocabulary[]>(["vocabularies"]);
            const fullVocab = currentCache?.find(v => v.id === updatedVocab.id);

            if (fullVocab) {
                const mergedVocab = { ...fullVocab, ...updatedVocab } as Vocabulary;
                await dexieService.addVocabulary(mergedVocab);
                await dexieService.updateSyncMetadata(SYNC_KEY);

                // Optimistic Update: Update item in cache
                queryClient.setQueryData(["vocabularies"], (oldData: Vocabulary[] | undefined) => {
                    if (!oldData) return oldData;
                    return oldData.map((item) =>
                        item.id === updatedVocab.id ? mergedVocab : item
                    );
                });

                console.log('[Dexie] Updated vocabulary in cache');
            }
        },
        onError: (error: any) => {
            console.error("Error updating vocabulary:", error);
            toast.error("Failed to update vocabulary");
        },
    });

    const deleteVocabulary = useMutation({
        mutationFn: async (id: string) => {
            await deleteDoc(doc(db, "vocabularies", id));
            return id;
        },
        onSuccess: async (deletedId) => {
            // Update Dexie cache
            await dexieService.deleteVocabulary(deletedId);
            await dexieService.updateSyncMetadata(SYNC_KEY);

            // Optimistic Update: Remove from cache
            queryClient.setQueryData(["vocabularies"], (oldData: Vocabulary[] | undefined) => {
                if (!oldData) return oldData;
                return oldData.filter((item) => item.id !== deletedId);
            });

            console.log('[Dexie] Deleted vocabulary from cache');
        },
        onError: (error: any) => {
            console.error("Error deleting vocabulary:", error);
            toast.error("Failed to delete vocabulary");
        },
    });

    return { deleteVocabulary, addVocabulary, updateVocabulary };
};
