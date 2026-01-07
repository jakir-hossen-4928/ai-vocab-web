export interface UserSession {
    sessionId: string;
    userId: string;
    startTime: string; // ISO timestamp
    endTime?: string; // ISO timestamp
    duration?: number; // milliseconds
}

export interface FeatureUsage {
    vocabulariesViewed: number;
    flashcardsCompleted: number;
    resourcesViewed: number;
    dictionarySearches: number;
    sharesPerformed: number;
}

export interface LearningProgress {
    uniqueVocabulariesRead: string[]; // vocabulary IDs
    uniqueResourcesRead: string[]; // resource IDs
    flashcardSessions: number;
}

export interface PageVisits {
    [pagePath: string]: number;
}

export interface UserAnalytics {
    userId: string;
    email: string;
    displayName: string;

    // Session tracking
    currentSessionId?: string;
    sessions: UserSession[];

    // Aggregate metrics
    totalTimeSpent: number; // milliseconds
    lastActive: string; // ISO timestamp

    // Feature usage counts
    featureUsage: FeatureUsage;

    // Page visit tracking
    pageVisits: PageVisits;

    // Learning progress
    learningProgress: LearningProgress;

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

export type FeatureType =
    | 'vocabulary_view'
    | 'flashcard_session'
    | 'resource_view'
    | 'dictionary_search'
    | 'share_action';

export type LearningType =
    | 'vocabulary_read'
    | 'resource_read'
    | 'flashcard_completed';

export interface AnalyticsEvent {
    userId: string;
    eventType: FeatureType | LearningType | 'page_view' | 'session_start' | 'session_end';
    timestamp: string;
    metadata?: Record<string, any>;
}
