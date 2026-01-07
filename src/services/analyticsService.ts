import { db } from '@/lib/firebase';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    increment,
    arrayUnion,
    serverTimestamp,
    collection,
    query,
    getDocs,
    orderBy,
    limit
} from 'firebase/firestore';
import {
    UserAnalytics,
    UserSession,
    FeatureType,
    LearningType
} from '@/types/analytics';

const ANALYTICS_COLLECTION = 'user_analytics';

/**
 * Initialize analytics document for a new user
 */
export async function initializeUserAnalytics(
    userId: string,
    email: string,
    displayName: string
): Promise<void> {
    try {
        const analyticsRef = doc(db, ANALYTICS_COLLECTION, userId);
        const analyticsDoc = await getDoc(analyticsRef);

        if (!analyticsDoc.exists()) {
            const initialData: Partial<UserAnalytics> = {
                userId,
                email,
                displayName,
                sessions: [],
                totalTimeSpent: 0,
                lastActive: new Date().toISOString(),
                featureUsage: {
                    vocabulariesViewed: 0,
                    flashcardsCompleted: 0,
                    resourcesViewed: 0,
                    dictionarySearches: 0,
                    sharesPerformed: 0
                },
                pageVisits: {},
                learningProgress: {
                    uniqueVocabulariesRead: [],
                    uniqueResourcesRead: [],
                    flashcardSessions: 0
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await setDoc(analyticsRef, initialData);
            console.log('[Analytics] Initialized analytics for user:', userId);
        }
    } catch (error) {
        console.error('[Analytics] Error initializing user analytics:', error);
    }
}

/**
 * Start a new user session
 */
export async function startSession(userId: string): Promise<string> {
    try {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const analyticsRef = doc(db, ANALYTICS_COLLECTION, userId);

        const session: UserSession = {
            sessionId,
            userId,
            startTime: new Date().toISOString()
        };

        await updateDoc(analyticsRef, {
            currentSessionId: sessionId,
            sessions: arrayUnion(session),
            lastActive: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        console.log('[Analytics] Started session:', sessionId);
        return sessionId;
    } catch (error) {
        console.error('[Analytics] Error starting session:', error);
        throw error;
    }
}

/**
 * End a user session and calculate duration
 */
export async function endSession(userId: string, sessionId: string): Promise<void> {
    try {
        const analyticsRef = doc(db, ANALYTICS_COLLECTION, userId);
        const analyticsDoc = await getDoc(analyticsRef);

        if (!analyticsDoc.exists()) return;

        const data = analyticsDoc.data() as UserAnalytics;
        const sessions = data.sessions || [];
        const sessionIndex = sessions.findIndex(s => s.sessionId === sessionId);

        if (sessionIndex !== -1) {
            const session = sessions[sessionIndex];
            const endTime = new Date().toISOString();
            const duration = new Date(endTime).getTime() - new Date(session.startTime).getTime();

            sessions[sessionIndex] = {
                ...session,
                endTime,
                duration
            };

            await updateDoc(analyticsRef, {
                sessions,
                currentSessionId: null,
                totalTimeSpent: increment(duration),
                updatedAt: new Date().toISOString()
            });

            console.log('[Analytics] Ended session:', sessionId, 'Duration:', duration);
        }
    } catch (error) {
        console.error('[Analytics] Error ending session:', error);
    }
}

/**
 * Track page view
 */
export async function trackPageView(userId: string, pagePath: string): Promise<void> {
    try {
        const analyticsRef = doc(db, ANALYTICS_COLLECTION, userId);

        await updateDoc(analyticsRef, {
            [`pageVisits.${pagePath.replace(/\//g, '_')}`]: increment(1),
            lastActive: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        console.log('[Analytics] Tracked page view:', pagePath);
    } catch (error) {
        console.error('[Analytics] Error tracking page view:', error);
    }
}

/**
 * Track feature usage
 */
export async function trackFeatureUsage(
    userId: string,
    featureType: FeatureType,
    metadata?: Record<string, any>
): Promise<void> {
    try {
        const analyticsRef = doc(db, ANALYTICS_COLLECTION, userId);

        const featureMap: Record<FeatureType, string> = {
            'vocabulary_view': 'featureUsage.vocabulariesViewed',
            'flashcard_session': 'featureUsage.flashcardsCompleted',
            'resource_view': 'featureUsage.resourcesViewed',
            'dictionary_search': 'featureUsage.dictionarySearches',
            'share_action': 'featureUsage.sharesPerformed'
        };

        const fieldPath = featureMap[featureType];

        await updateDoc(analyticsRef, {
            [fieldPath]: increment(1),
            lastActive: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        console.log('[Analytics] Tracked feature usage:', featureType, metadata);
    } catch (error) {
        console.error('[Analytics] Error tracking feature usage:', error);
    }
}

/**
 * Track learning progress
 */
export async function trackLearningProgress(
    userId: string,
    learningType: LearningType,
    itemId: string
): Promise<void> {
    try {
        const analyticsRef = doc(db, ANALYTICS_COLLECTION, userId);

        const updates: any = {
            lastActive: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (learningType === 'vocabulary_read') {
            updates['learningProgress.uniqueVocabulariesRead'] = arrayUnion(itemId);
        } else if (learningType === 'resource_read') {
            updates['learningProgress.uniqueResourcesRead'] = arrayUnion(itemId);
        } else if (learningType === 'flashcard_completed') {
            updates['learningProgress.flashcardSessions'] = increment(1);
        }

        await updateDoc(analyticsRef, updates);

        console.log('[Analytics] Tracked learning progress:', learningType, itemId);
    } catch (error) {
        console.error('[Analytics] Error tracking learning progress:', error);
    }
}

/**
 * Update last active timestamp
 */
export async function updateLastActive(userId: string): Promise<void> {
    try {
        const analyticsRef = doc(db, ANALYTICS_COLLECTION, userId);

        await updateDoc(analyticsRef, {
            lastActive: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('[Analytics] Error updating last active:', error);
    }
}

/**
 * Get user analytics data
 */
export async function getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    try {
        const analyticsRef = doc(db, ANALYTICS_COLLECTION, userId);
        const analyticsDoc = await getDoc(analyticsRef);

        if (analyticsDoc.exists()) {
            return analyticsDoc.data() as UserAnalytics;
        }
        return null;
    } catch (error) {
        console.error('[Analytics] Error getting user analytics:', error);
        return null;
    }
}

/**
 * Get all users analytics (for admin dashboard)
 */
export async function getAllUsersAnalytics(): Promise<UserAnalytics[]> {
    try {
        const analyticsCollection = collection(db, ANALYTICS_COLLECTION);
        const q = query(analyticsCollection, orderBy('lastActive', 'desc'));
        const querySnapshot = await getDocs(q);

        const analyticsData: UserAnalytics[] = [];
        querySnapshot.forEach((doc) => {
            analyticsData.push(doc.data() as UserAnalytics);
        });

        return analyticsData;
    } catch (error) {
        console.error('[Analytics] Error getting all users analytics:', error);
        return [];
    }
}
