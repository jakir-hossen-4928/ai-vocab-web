import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from "firebase/firestore";
import { db as firestore } from "@/lib/firebase";
import { dexieService } from "@/lib/dexieDb";
import { Vocabulary } from "@/types/vocabulary";

const SYNC_KEY = 'vocabularies';

export const syncService = {
    /**
     * Optimized sync with Firebase
     * Pulls only changes since last sync to reduce costs and load time
     */
    async syncVocabularies(): Promise<boolean> {
        if (!navigator.onLine) return false;

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
        } catch (error) {
            console.error("[Sync] Vocabulary synchronization failed:", error);

            // If the query fails due to missing index, it might be the ">" filter.
            // Fallback to full sync if it's the first time or index is building
            return false;
        }
    },

    /**
     * Start a background sync manager
     */
    startSyncManager(intervalMinutes: number = 10) {
        // Periodic sync
        const interval = setInterval(() => {
            this.syncVocabularies();
        }, intervalMinutes * 60 * 1000);

        // Also sync when browser comes back online
        window.addEventListener('online', () => {
            console.log("[Sync] Device back online, triggered sync...");
            this.syncVocabularies();
        });

        // Initial sync on startup
        this.syncVocabularies();

        return () => {
            clearInterval(interval);
        };
    }
};
