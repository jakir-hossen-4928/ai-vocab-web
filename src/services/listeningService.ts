
import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    deleteDoc,
    updateDoc,
    query,
    where,
    writeBatch,
    limit,
    startAfter,
    orderBy,
    getCountFromServer
} from "firebase/firestore";
import { ListeningTest, Section, Question } from "@/data/listeningData";
import { z } from "zod";

const COLLECTION_NAME = "ielts-listings";

// Zod Schemas for Validation
const QuestionSchema = z.object({
    id: z.number().optional(), // We might migrate to string IDs later, but keeping number for now compatibility
    number: z.number(),
    text: z.string().optional(),
    beforeInput: z.string().optional(),
    afterInput: z.string().optional(),
    answer: z.string()
});

const SectionSchema = z.object({
    title: z.string(),
    instruction: z.string(),
    questions: z.array(QuestionSchema)
});

const ListeningTestSchema = z.object({
    id: z.string(),
    title: z.string().min(1, "Title is required"),
    audioUrl: z.string().url("Invalid Audio URL"), // Optional: refine this if local paths allowed
    sections: z.array(SectionSchema)
});

export const listeningService = {
    // Validate Data
    validateTest(test: any): { success: boolean; error?: string } {
        try {
            ListeningTestSchema.parse(test);
            return { success: true };
        } catch (error) {
            if (error instanceof z.ZodError) {
                return { success: false, error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
            }
            return { success: false, error: "Unknown validation error" };
        }
    },

    // Create or Update (Set)
    async saveTest(test: ListeningTest): Promise<void> {
        const validation = this.validateTest(test);
        if (!validation.success) {
            throw new Error(`Validation Failed: ${validation.error}`);
        }
        await setDoc(doc(db, COLLECTION_NAME, test.id), test);
    },

    // Bulk Add (with Batching)
    async bulkAddTests(tests: ListeningTest[]): Promise<{ added: number; errors: string[] }> {
        const batchSize = 450; // Firestore limit is 500
        const errors: string[] = [];
        let addedCount = 0;

        // Process in chunks
        for (let i = 0; i < tests.length; i += batchSize) {
            const chunk = tests.slice(i, i + batchSize);
            const batch = writeBatch(db);

            chunk.forEach(test => {
                const validation = this.validateTest(test);
                if (validation.success) {
                    const docRef = doc(db, COLLECTION_NAME, test.id);
                    batch.set(docRef, test);
                    addedCount++;
                } else {
                    errors.push(`Test ${test.title || 'Unknown'}: ${validation.error}`);
                }
            });

            await batch.commit();
        }

        return { added: addedCount, errors };
    },

    // Read All (Optimized for Virtualization - fetching minimal fields first if needed, but for now full fetch)
    // For large datasets, typically we fetch all if < few thousand, or paginate. 
    // Given the request mentions "react virtual", we usually fetch the list to display.
    async getAllTests(): Promise<ListeningTest[]> {
        const q = query(collection(db, COLLECTION_NAME));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as ListeningTest);
    },

    async getTestsPaginated(lastDoc: any = null, pageSize: number = 20): Promise<{ tests: ListeningTest[]; lastDoc: any }> {
        let constraints: any[] = [limit(pageSize)];

        if (lastDoc) {
            constraints.push(startAfter(lastDoc));
        }

        const q = query(collection(db, COLLECTION_NAME), ...constraints);
        const querySnapshot = await getDocs(q);

        return {
            tests: querySnapshot.docs.map(doc => doc.data() as ListeningTest),
            lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
        };
    },

    // Search (Case-sensitive prefix)
    async searchTests(term: string, limitCount: number = 20): Promise<ListeningTest[]> {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('title', '>=', term),
            where('title', '<=', term + '\uf8ff'),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as ListeningTest);
    },

    // Read One
    async getTestById(id: string): Promise<ListeningTest | null> {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as ListeningTest;
        }
        return null;
    },

    // Delete
    async deleteTest(id: string): Promise<void> {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    },

    // Update Audio URL Only
    async updateAudioUrl(id: string, audioUrl: string): Promise<void> {
        await updateDoc(doc(db, COLLECTION_NAME, id), { audioUrl });
    },

    // Get Stats
    async getDataStats(): Promise<{ totalTests: number }> {
        // Count via aggregation or simple full read (if small).
        // Since we expect < 200 tests, a full read metadata is fine.
        // Optimization: utilize count() aggregation if available in this SDK version,
        // but for now, let's just get count from getAllTests length or similar.
        // getCountFromServer is better but let's stick to what we have imported or add it.
        // Actually, let's just use getDocs with key selection if possible? No, Firestore client is simple.
        // We'll trust getAllTests is cached or cheap enough for admin dash.
        const snapshot = await getDocs(query(collection(db, COLLECTION_NAME)));
        return { totalTests: snapshot.size };
    }
};
