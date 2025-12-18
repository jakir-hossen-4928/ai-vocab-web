import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import { Vocabulary } from '@/types/vocabulary';

export interface MigrationStats {
    vocabularies: { total: number; success: number; failed: number };
    resources: { total: number; success: number; failed: number };
    errors: string[];
}

const formatDate = (date: any): string => {
    if (!date) return new Date().toISOString();
    if (date instanceof Timestamp) return date.toDate().toISOString();
    if (typeof date === 'number') return new Date(date).toISOString();
    if (typeof date === 'string') return date;
    return new Date().toISOString();
};

export const migrateDataToSupabase = async (
    onProgress: (msg: string) => void,
    manualUserId?: string
): Promise<MigrationStats> => {
    const stats: MigrationStats = {
        vocabularies: { total: 0, success: 0, failed: 0 },
        resources: { total: 0, success: 0, failed: 0 },
        errors: [],
    };

    try {
        // --- 0. Get Current Supabase User ---
        const { data: { user } } = await supabase.auth.getUser();

        // If no user is logged in, and we don't have a service role key, this might fail RLS or FKs.
        // However, we previously added logic to use SERVICE_ROLE_KEY in supabase.ts
        // If we are using the Service Role Key, specific user might not be needed for permission, 
        // BUT the schema requires a valid UUID for user_id. 
        // If we have a user, use it. If not, and we have service key, we still need a valid UUID.
        // For now, let's enforce having a user OR fallback to a specific UUID if you have one, 
        // but robustly we should ask for a user.

        // Let's assume the user running the migration IS the admin/owner.
        const targetUserId = user?.id;

        if (!targetUserId) {
            // Check if we are in "Service Role" mode where auth.getUser() might be empty but we are admin.
            // Even then, we need a valid UUID for the 'user_id' column in the table.
            // We'll throw if we can't find one, prompting the user to login.
            throw new Error("No authenticated Supabase user found. Please log in to Supabase in the app to assign these records to a user.");
        }

        // --- 1. Migrate Vocabularies ---
        onProgress('Fetching vocabularies from Firebase...');
        const vocabSnapshot = await getDocs(collection(db, 'vocabularies'));
        const vocabDocs = vocabSnapshot.docs;
        stats.vocabularies.total = vocabDocs.length;
        onProgress(`Found ${vocabDocs.length} vocabularies.`);

        const vocabBatches = [];
        const BATCH_SIZE = 50;

        for (let i = 0; i < vocabDocs.length; i += BATCH_SIZE) {
            const batch = vocabDocs.slice(i, i + BATCH_SIZE);
            const mappedBatch = batch.map(doc => {
                const data = doc.data() as Partial<Vocabulary>;
                return {
                    // id: doc.id, // REMOVED: Let Supabase generate valid UUIDs
                    bangla: data.bangla || '',
                    english: data.english || '',
                    part_of_speech: data.partOfSpeech || 'unknown',
                    pronunciation: data.pronunciation || '',
                    examples: data.examples || [],
                    synonyms: data.synonyms || [], // Array
                    antonyms: data.antonyms || [], // Array
                    explanation: data.explanation || '',
                    created_at: formatDate(data.createdAt),
                    updated_at: formatDate(data.updatedAt),
                    user_id: targetUserId, // Use the actual Supabase User ID
                    origin: data.origin || null,
                    audio_url: data.audioUrl || null,
                    is_from_api: data.isFromAPI || false,
                    is_online: data.isOnline || false,
                    verb_forms: data.verbForms || null,
                    related_words: data.relatedWords || null,
                };
            });
            vocabBatches.push(mappedBatch);
        }

        onProgress(`Uploading ${vocabBatches.length} batches of vocabularies...`);

        for (const [index, batch] of vocabBatches.entries()) {
            const { error } = await supabase.from('vocabularies').insert(batch); // Changed upsert to insert since IDs are new
            if (error) {
                stats.errors.push(`Vocab batch ${index} failed: ${error.message}`);
                stats.vocabularies.failed += batch.length;
            } else {
                stats.vocabularies.success += batch.length;
            }
            onProgress(`Processed vocab batch ${index + 1}/${vocabBatches.length}`);
        }


        // --- 2. Migrate Resources ---
        onProgress('Fetching resources (grammar_images) from Firebase...');
        const resourceSnapshot = await getDocs(collection(db, 'grammar_images'));
        const resourceDocs = resourceSnapshot.docs;
        stats.resources.total = resourceDocs.length;
        onProgress(`Found ${resourceDocs.length} resources.`);

        const resourceBatches = [];
        for (let i = 0; i < resourceDocs.length; i += BATCH_SIZE) {
            const batch = resourceDocs.slice(i, i + BATCH_SIZE);
            const mappedBatch = batch.map(doc => {
                const data = doc.data();
                return {
                    // id: doc.id, // REMOVED: Let Supabase generate valid UUIDs
                    title: data.title || '',
                    description: data.description || '',
                    image_url: data.imageUrl || data.image_url || null,
                    thumbnail_url: data.thumbnailUrl || data.thumbnail_url || null,
                    created_at: formatDate(data.createdAt),
                    updated_at: formatDate(data.updatedAt),
                    user_id: targetUserId, // Use the actual Supabase User ID
                };
            });
            resourceBatches.push(mappedBatch);
        }

        onProgress(`Uploading ${resourceBatches.length} batches of resources...`);

        for (const [index, batch] of resourceBatches.entries()) {
            const { error } = await supabase.from('resources').insert(batch); // Changed upsert to insert
            if (error) {
                stats.errors.push(`Resource batch ${index} failed: ${error.message}`);
                stats.resources.failed += batch.length;
            } else {
                stats.resources.success += batch.length;
            }
            onProgress(`Processed resource batch ${index + 1}/${resourceBatches.length}`);
        }

        onProgress('Migration completed.');

    } catch (error: any) {
        onProgress(`FATAL ERROR: ${error.message}`);
        stats.errors.push(error.message);
    }

    return stats;
};
