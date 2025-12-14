import { useEffect, useState } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useVocabularies } from '@/hooks/useVocabularies';

const DEFAULT_TITLE = 'AI Vocabulary';

const ROUTE_TITLES: Record<string, string> = {
    '/': 'Welcome',
    '/auth': 'Sign In / Sign Up',
    '/home': 'Home',
    '/profile': 'My Profile',
    '/vocabularies': 'Vocabularies',
    '/vocabularies/add': 'Add Vocabulary',
    '/vocabularies/bulk-add': 'Bulk Add Vocabularies',
    '/resources': 'Resource Gallery',
    '/dictionary': 'Online Dictionary',
    '/ai-activity': 'AI Activity',
    '/flashcards': 'Flashcards',
    '/api-key-setup': 'API Key Setup',
    '/favorites': 'My Favorites',
    '/admin/analytics': 'Analytics',
    '/admin/users': 'User Management',
    '/admin/tools': 'Admin Tools',
    '/admin/duplicates': 'Duplicate Manager',
    '/admin/resources': 'Admin Resources',
};

export const usePageTitle = () => {
    const location = useLocation();
    const { data: vocabularies } = useVocabularies();
    const [dynamicTitle, setDynamicTitle] = useState<string | null>(null);

    useEffect(() => {
        const updateTitle = async () => {
            const path = location.pathname;
            let title = ROUTE_TITLES[path];

            // Handle dynamic routes
            if (!title) {
                // Vocabulary Detail
                const vocabMatch = matchPath('/vocabularies/:id', path);
                if (vocabMatch && vocabMatch.params.id) {
                    const id = vocabMatch.params.id;

                    // Try to find in cache first
                    const cachedVocab = vocabularies?.find(v => v.id === id);
                    if (cachedVocab) {
                        title = `${cachedVocab.english} | Vocabulary`;
                    } else {
                        try {
                            // Fallback to fetch if not in cache (though cache should usually be populated)
                            const docRef = doc(db, 'vocabularies', id);
                            const docSnap = await getDoc(docRef);
                            if (docSnap.exists()) {
                                const data = docSnap.data();
                                title = `${data.english} | Vocabulary`;
                            }
                        } catch (error) {
                            console.error('Error fetching title for vocabulary:', error);
                        }
                    }
                }

                // Vocabulary Edit
                const vocabEditMatch = matchPath('/vocabularies/edit/:id', path);
                if (vocabEditMatch) {
                    title = 'Edit Vocabulary';
                }

                // Resource Detail
                const resourceMatch = matchPath('/resources/:id', path);
                if (resourceMatch) {
                    title = 'Resource Detail';
                    // If you want dynamic title for resources, implement similar logic here
                }

                // Chat
                const chatMatch = matchPath('/chat/:id', path);
                if (chatMatch) {
                    title = 'Chat with Word';
                }
            }

            const finalTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
            document.title = finalTitle;
        };

        updateTitle();
    }, [location, vocabularies]);
};
