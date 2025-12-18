import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Vocabulary } from '@/types/vocabulary';

// Helper to format date for CSV (ISO 8601)
const formatDate = (date: any): string => {
    if (!date) return new Date().toISOString();
    if (date instanceof Timestamp) return date.toDate().toISOString();
    if (typeof date === 'number') return new Date(date).toISOString();
    if (typeof date === 'string') return date;
    return new Date().toISOString();
};

// Helper to escape CSV fields
const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};

// Helper to format array for Postgres CSV import: "{item1,item2}"
const formatPostgresArray = (arr: any[] | null | undefined): string => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return '{}';
    // Escape internal quotes and commas for array items if needed, 
    // but typically for simple strings in vocab arrays we just need to be careful.
    // Postgres array format: {"val 1", "val 2"} if they contain spaces or special chars.
    // Let's wrap every item in double quotes to be safe and use curly braces.
    const items = arr.map(item => `"${String(item).replace(/"/g, '\\"')}"`).join(',');
    return `"{${items}}"`; // Note: Logic slightly adjusted for Postgres standard
    // Actually, reliable Postgres CSV import format for text[] is `{val1,val2}` 
    // where val1 is double quoted if special.
    // simpler: `{val1,val2}`
};

// Helper to download blob
const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const exportVocabulariesToCSV = async (targetUserId: string) => {
    const snapshot = await getDocs(collection(db, 'vocabularies'));
    const headers = [
        'bangla', 'english', 'part_of_speech', 'pronunciation',
        'examples', 'synonyms', 'antonyms', 'explanation',
        'created_at', 'updated_at', 'user_id',
        'origin', 'audio_url', 'is_from_api', 'is_online',
        'verb_forms', 'related_words'
    ]; // Excluding 'id' to let Supabase auto-generate

    const rows = snapshot.docs.map(doc => {
        const data = doc.data() as Partial<Vocabulary>;
        return [
            escapeCSV(data.bangla || ''),
            escapeCSV(data.english || ''),
            escapeCSV(data.partOfSpeech || 'unknown'),
            escapeCSV(data.pronunciation || ''),
            escapeCSV(JSON.stringify(data.examples || [])), // JSONB
            formatPostgresArray(data.synonyms), // ARRAY
            formatPostgresArray(data.antonyms), // ARRAY
            escapeCSV(data.explanation || ''),
            escapeCSV(formatDate(data.createdAt)),
            escapeCSV(formatDate(data.updatedAt)),
            escapeCSV(targetUserId || data.userId || ''),
            escapeCSV(data.origin || ''),
            escapeCSV(data.audioUrl || ''),
            escapeCSV(data.isFromAPI || false),
            escapeCSV(data.isOnline || false),
            escapeCSV(JSON.stringify(data.verbForms || null)), // JSONB
            escapeCSV(JSON.stringify(data.relatedWords || null)) // JSONB
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    downloadCSV(csvContent, 'vocabularies_supabase.csv');
    return snapshot.size;
};

export const exportResourcesToCSV = async (targetUserId: string) => {
    const snapshot = await getDocs(collection(db, 'grammar_images'));
    const headers = [
        'title', 'description',
        'image_url', 'thumbnail_url',
        'created_at', 'updated_at', 'user_id'
    ];

    const rows = snapshot.docs.map(doc => {
        const data = doc.data();
        return [
            escapeCSV(data.title || ''),
            escapeCSV(data.description || ''),
            escapeCSV(data.imageUrl || data.image_url || ''),
            escapeCSV(data.thumbnailUrl || data.thumbnail_url || ''),
            escapeCSV(formatDate(data.createdAt)),
            escapeCSV(formatDate(data.updatedAt)),
            escapeCSV(targetUserId || data.userId || data.user_id || '')
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    downloadCSV(csvContent, 'resources_supabase.csv');
    return snapshot.size;
};
