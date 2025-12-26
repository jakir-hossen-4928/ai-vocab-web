import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    onSnapshot
} from "firebase/firestore";
import { db as firestore } from "@/lib/firebase";
import { dexieService } from "@/lib/dexieDb";
import { Vocabulary } from "@/types/vocabulary";

const SYNC_KEY = 'vocabularies';

export const syncService = {
    isSyncing: false,

    /**
     * Optimized sync with Firebase
     * Pulls only changes since last sync to reduce costs and load time
     */
    async syncVocabularies(): Promise<boolean> {
        if (!navigator.onLine || this.isSyncing) return false;

        this.isSyncing = true;
        try {
            const lastSyncedAt = await dexieService.getSyncMetadata(SYNC_KEY);

            let q;
            if (lastSyncedAt) {
                // Only fetch items updated since last sync (incremental)
                const lastDate = new Date(lastSyncedAt);
                q = query(
                    collection(firestore, "vocabularies"),
                    where("updatedAt", ">", lastDate.toISOString()),
                    orderBy("updatedAt", "desc")
                );
            } else {
                // Initial sync: fetch everything
                q = query(
                    collection(firestore, "vocabularies"),
                    orderBy("updatedAt", "desc"),
                    limit(500) // Safety limit for initial load
                );
            }

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                console.log("[Sync] No new vocabulary changes found");
                await dexieService.updateSyncMetadata(SYNC_KEY);
                return true;
            }

            const remoteItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as any)
            })) as Vocabulary[];

            console.log(`[Sync] Found ${remoteItems.length} new/updated items`);

            // Bulk update Dexie (overwrites local items with remote ones if IDs match)
            await dexieService.addVocabularies(remoteItems);
            await dexieService.updateSyncMetadata(SYNC_KEY);

            console.log("[Sync] Successfully merged remote changes into Dexie");
            return true;
        } catch (error: any) {
            console.error("[Sync] Vocabulary synchronization failed:", error);

            // Edge Case: If index is missing or query fails, try to fallback to a simple most-recent query
            // This is safer than failing completely, as it ensures we gets *some* updates
            if (error.code === 'failed-precondition' || error.message?.includes('index')) {
                console.warn("[Sync] Falling back to simple query due to index issues...");
                try {
                    const fallbackQuery = query(
                        collection(firestore, "vocabularies"),
                        orderBy("updatedAt", "desc"),
                        limit(50)
                    );
                    const snapshot = await getDocs(fallbackQuery);
                    if (!snapshot.empty) {
                        const items = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })) as Vocabulary[];
                        await dexieService.addVocabularies(items);
                        return true;
                    }
                } catch (fallbackError) {
                    console.error("[Sync] Fallback failed:", fallbackError);
                }
            }
            return false;
        } finally {
            this.isSyncing = false;
        }
    },

    syncInterval: null as any,
    onlineListener: null as any,
    unsubscribeSnapshot: null as (() => void) | null,

    /**
     * Start a real-time background sync manager using onSnapshot
     */
    startRealtimeSync() {
        if (this.unsubscribeSnapshot) return;

        console.log("[Sync] Starting real-time sync listener...");

        try {
            // Listen to recent changes (e.g., last 30 days) to keep initial snapshot small-ish
            // OR simply listen to the latest "updatedAt" if we want to be very efficient.
            // For simplicity and robustness, we'll listen to the collection ordered by updatedAt.
            // To avoid pulling the hole DB on every load, we might want to just listen,
            // but onSnapshot initial load DOES pull data.
            // Let's use a query limit to keep it sane for a mobile app.

            const q = query(
                collection(firestore, "vocabularies"),
                orderBy("updatedAt", "desc"),
                limit(100) // Listen to the 100 most recent items for real-time updates
            );

            this.unsubscribeSnapshot = onSnapshot(q, async (snapshot) => {
                const changes = snapshot.docChanges();
                if (changes.length === 0) return;

                console.log(`[Sync] Received real-time update: ${changes.length} changes`);

                const validChanges = changes
                    .filter(change => change.type === 'added' || change.type === 'modified')
                    .map(change => ({
                        id: change.doc.id,
                        ...(change.doc.data() as any)
                    })) as Vocabulary[];

                const deletedIds = changes
                    .filter(change => change.type === 'removed')
                    .map(change => change.doc.id);

                if (validChanges.length > 0) {
                    await dexieService.addVocabularies(validChanges);
                    console.log(`[Sync] Updated ${validChanges.length} items in local DB`);
                }

                if (deletedIds.length > 0) {
                    await dexieService.deleteVocabularies(deletedIds); // Ensure bulk delete exists or loop
                    console.log(`[Sync] Removed ${deletedIds.length} items from local DB`);
                }

                await dexieService.updateSyncMetadata(SYNC_KEY);
            }, (error) => {
                console.error("[Sync] Real-time listener error:", error);
            });

        } catch (error) {
            console.error("[Sync] Failed to start real-time sync:", error);
        }

        // Also sync when browser comes back online to catch up
        this.onlineListener = () => {
            console.log("[Sync] Device back online, triggered full sync...");
            this.syncVocabularies();
        };
        window.addEventListener('online', this.onlineListener);
    },

    /**
     * Stop the background sync manager and cleanup
     */
    stopSyncManager() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        if (this.unsubscribeSnapshot) {
            this.unsubscribeSnapshot();
            this.unsubscribeSnapshot = null;
            console.log("[Sync] Stopped real-time listener");
        }
        if (this.onlineListener) {
            window.removeEventListener('online', this.onlineListener);
            this.onlineListener = null;
        }
    }
};
