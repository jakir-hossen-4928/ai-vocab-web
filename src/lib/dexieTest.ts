/**
 * Dexie Database Test & Initialization
 * Run this to verify Dexie is working correctly
 */

import { dexieService } from './dexieDb';

export async function testDexieDatabase() {
    console.log('🧪 Testing Dexie Database...');

    try {
        // Test 1: Get storage stats
        console.log('\n📊 Storage Stats:');
        const stats = await dexieService.getStorageStats();
        console.log(stats);

        // Test 2: Check sync metadata
        console.log('\n⏰ Sync Metadata:');
        const vocabSync = await dexieService.getSyncMetadata('vocabularies');
        const resourceSync = await dexieService.getSyncMetadata('resources');
        console.log('Vocabularies last synced:', vocabSync ? new Date(vocabSync) : 'Never');
        console.log('Resources last synced:', resourceSync ? new Date(resourceSync) : 'Never');

        // Test 3: Migrate favorites from localStorage
        console.log('\n💾 Migrating favorites from localStorage...');
        await dexieService.syncFavoritesFromLocalStorage();
        const favorites = await dexieService.getAllFavorites();
        console.log(`Migrated ${favorites.length} favorites`);

        // Test 4: Check vocabularies cache
        console.log('\n📚 Vocabularies Cache:');
        const vocabs = await dexieService.getAllVocabularies();
        console.log(`Cached vocabularies: ${vocabs.length}`);

        // Test 5: Check resources cache
        console.log('\n🖼️ Resources Cache:');
        const resources = await dexieService.getAllResources();
        console.log(`Cached resources: ${resources.length}`);

        // Test 6: Check chat sessions
        console.log('\n💬 Chat Sessions:');
        const sessions = await dexieService.getAllChatSessions();
        console.log(`Chat sessions: ${sessions.length}`);


        console.log('\n✅ Dexie Database Test Complete!');
        return true;
    } catch (error) {
        console.error('❌ Dexie Database Test Failed:', error);
        return false;
    }
}

// Auto-run test in development
if (import.meta.env.DEV) {
    testDexieDatabase();
}
