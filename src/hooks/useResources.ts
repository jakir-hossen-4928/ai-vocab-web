import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    addDoc,
    updateDoc,
    query,
    orderBy,
    limit,
    startAfter,
    DocumentSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GrammarImage } from "@/types/grammar";
import { toast } from "sonner";
import { dexieService } from "@/lib/dexieDb";
import { useEffect } from "react";

const ITEMS_PER_PAGE = 12;
const SYNC_KEY = 'resources';
const CACHE_DURATION_MINUTES = 15; // Resources change less frequently

/**
 * Hook for fetching all resources with Dexie caching
 * Use this for simpler use cases where pagination isn't needed
 */
export const useResourcesSimple = () => {
    const queryClient = useQueryClient();

    // Hydrate from Dexie on mount
    useEffect(() => {
        const loadFromCache = async () => {
            try {
                const cached = await dexieService.getAllResources();
                if (cached && cached.length > 0) {
                    queryClient.setQueryData(["resources-simple"], cached);
                    console.log(`[Dexie] Loaded ${cached.length} resources from cache`);
                }
            } catch (error) {
                console.error("Failed to load resources from Dexie cache:", error);
            }
        };
        loadFromCache();
    }, [queryClient]);

    return useQuery({
        queryKey: ["resources-simple"],
        queryFn: async () => {
            try {
                // Check if we should sync from Firestore
                const shouldSync = await dexieService.shouldSync(SYNC_KEY, CACHE_DURATION_MINUTES);

                if (!shouldSync) {
                    console.log('[Dexie] Using cached resources, skipping Firestore read');
                    const cached = await dexieService.getAllResources();
                    if (cached.length > 0) return cached;
                }

                // Fetch from Firestore
                console.log('[Firestore] Fetching resources...');
                const q = query(collection(db, "grammar_images"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const resources = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as GrammarImage[];

                console.log(`[Firestore] Fetched ${resources.length} resources`);

                // Sync to Dexie
                await dexieService.clearResources();
                await dexieService.addResources(resources);
                await dexieService.updateSyncMetadata(SYNC_KEY);

                console.log('[Dexie] Synced resources to cache');

                return resources;
            } catch (error) {
                console.warn("Firestore fetch failed, falling back to Dexie cache", error);
                const cached = await dexieService.getAllResources();
                if (cached.length === 0) {
                    console.error('No cached resources available');
                    throw error;
                }
                console.log(`[Dexie] Using ${cached.length} cached resources (offline mode)`);
                return cached;
            }
        },
        staleTime: 1000 * 60 * CACHE_DURATION_MINUTES,
        gcTime: 1000 * 60 * 30,
    });
};

/**
 * Original paginated resources hook
 * Note: This doesn't use Dexie caching for pagination complexity
 * Consider using useResourcesSimple for better caching
 */
export const useResources = (searchQuery: string = "") => {
    return useInfiniteQuery({
        queryKey: ["resources", searchQuery],
        queryFn: async ({ pageParam }: { pageParam?: DocumentSnapshot }) => {
            let q = collection(db, "grammar_images");
            let constraints: any[] = [];

            constraints.push(orderBy("createdAt", "desc"));

            if (pageParam) {
                constraints.push(startAfter(pageParam));
            }

            constraints.push(limit(ITEMS_PER_PAGE));

            const finalQuery = query(q, ...constraints);
            const snapshot = await getDocs(finalQuery);

            const resources = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as GrammarImage[];

            return {
                items: resources,
                lastDoc: snapshot.docs[snapshot.docs.length - 1],
                hasMore: snapshot.docs.length === ITEMS_PER_PAGE
            };
        },
        getNextPageParam: (lastPage) => {
            return lastPage.hasMore ? lastPage.lastDoc : undefined;
        },
        initialPageParam: undefined,
        staleTime: 1000 * 60 * 5,
    });
};

export const useResourceMutations = () => {
    const queryClient = useQueryClient();

    const addResource = useMutation({
        mutationFn: async (newResource: any) => {
            const docRef = await addDoc(collection(db, "grammar_images"), newResource);
            const resourceWithId = { id: docRef.id, ...newResource };



            return resourceWithId;
        },
        onSuccess: async (newResource) => {
            // Update caches asynchronously without blocking UI
            Promise.all([
                // Update Dexie cache (non-blocking)
                dexieService.addResource(newResource)
                    .then(() => dexieService.updateSyncMetadata(SYNC_KEY))
                    .then(() => console.log('[Dexie] Added new resource to cache'))
                    .catch(err => console.error('[Dexie] Failed to cache resource:', err)),

                // Update React Query caches immediately
                Promise.resolve().then(() => {
                    // Update simple query cache
                    queryClient.setQueryData(["resources-simple"], (oldData: GrammarImage[] | undefined) => {
                        if (!oldData) return [newResource];
                        return [newResource, ...oldData];
                    });

                    // Update paginated query cache
                    queryClient.setQueryData(["resources", ""], (oldData: any) => {
                        if (!oldData) return oldData;
                        return {
                            ...oldData,
                            pages: [
                                {
                                    ...oldData.pages[0],
                                    items: [newResource, ...oldData.pages[0].items],
                                },
                                ...oldData.pages.slice(1),
                            ],
                        };
                    });
                })
            ]);

            toast.success("Resource added successfully");
        },
        onError: (error: any) => {
            console.error("Error adding resource:", error);
            toast.error("Failed to add resource");
        },
    });

    const updateResource = useMutation({
        mutationFn: async ({ id, ...data }: Partial<GrammarImage> & { id: string }) => {
            await updateDoc(doc(db, "grammar_images", id), data);



            return { id, ...data };
        },
        onSuccess: async (updatedResource) => {
            // Get current cache for merging
            const currentCache = queryClient.getQueryData<GrammarImage[]>(["resources-simple"]);
            const fullResource = currentCache?.find(r => r.id === updatedResource.id);

            if (fullResource) {
                const mergedResource = { ...fullResource, ...updatedResource } as GrammarImage;

                // Update caches asynchronously without blocking UI
                Promise.all([
                    // Update Dexie cache (non-blocking)
                    dexieService.addResource(mergedResource)
                        .then(() => dexieService.updateSyncMetadata(SYNC_KEY))
                        .then(() => console.log('[Dexie] Updated resource in cache'))
                        .catch(err => console.error('[Dexie] Failed to cache resource update:', err)),

                    // Update React Query caches immediately
                    Promise.resolve().then(() => {
                        // Update simple query cache
                        queryClient.setQueryData(["resources-simple"], (oldData: GrammarImage[] | undefined) => {
                            if (!oldData) return oldData;
                            return oldData.map((item) =>
                                item.id === updatedResource.id ? mergedResource : item
                            );
                        });

                        // Update paginated query cache
                        queryClient.setQueriesData({ queryKey: ["resources"] }, (oldData: any) => {
                            if (!oldData) return oldData;
                            return {
                                ...oldData,
                                pages: oldData.pages.map((page: any) => ({
                                    ...page,
                                    items: page.items.map((item: GrammarImage) =>
                                        item.id === updatedResource.id ? { ...item, ...updatedResource } : item
                                    ),
                                })),
                            };
                        });
                    })
                ]);
            }

            toast.success("Resource updated successfully");
        },
        onError: (error: any) => {
            console.error("Error updating resource:", error);
            toast.error("Failed to update resource");
        },
    });

    const deleteResource = useMutation({
        mutationFn: async (id: string) => {
            await deleteDoc(doc(db, "grammar_images", id));



            return id;
        },
        onSuccess: async (deletedId) => {
            // Update caches asynchronously without blocking UI
            Promise.all([
                // Update Dexie cache (non-blocking)
                dexieService.deleteResource(deletedId)
                    .then(() => dexieService.updateSyncMetadata(SYNC_KEY))
                    .then(() => console.log('[Dexie] Deleted resource from cache'))
                    .catch(err => console.error('[Dexie] Failed to delete from cache:', err)),

                // Update React Query caches immediately
                Promise.resolve().then(() => {
                    // Update simple query cache
                    queryClient.setQueryData(["resources-simple"], (oldData: GrammarImage[] | undefined) => {
                        if (!oldData) return oldData;
                        return oldData.filter((item) => item.id !== deletedId);
                    });

                    // Update paginated query cache
                    queryClient.setQueriesData({ queryKey: ["resources"] }, (oldData: any) => {
                        if (!oldData) return oldData;
                        return {
                            ...oldData,
                            pages: oldData.pages.map((page: any) => ({
                                ...page,
                                items: page.items.filter((item: GrammarImage) => item.id !== deletedId),
                            })),
                        };
                    });
                })
            ]);

            toast.success("Resource deleted");
        },
        onError: (error: any) => {
            console.error("Error deleting resource:", error);
            toast.error("Failed to delete resource");
        },
    });

    return { addResource, updateResource, deleteResource };
};
