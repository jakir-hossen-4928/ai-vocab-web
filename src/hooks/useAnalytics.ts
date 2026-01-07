import { useAnalytics } from '@/contexts/AnalyticsContext';
import { FeatureType, LearningType } from '@/types/analytics';
import { useCallback } from 'react';

/**
 * Hook to track feature usage
 */
export function useTrackFeature() {
    const { trackFeature } = useAnalytics();
    return trackFeature;
}

/**
 * Hook to track learning progress
 */
export function useTrackLearning() {
    const { trackLearning } = useAnalytics();
    return trackLearning;
}

/**
 * Convenience hook for tracking vocabulary views
 */
export function useTrackVocabulary() {
    const { trackFeature, trackLearning } = useAnalytics();

    return useCallback((vocabularyId: string, isDetailView: boolean = false) => {
        trackFeature('vocabulary_view', { vocabularyId, isDetailView });
        if (isDetailView) {
            trackLearning('vocabulary_read', vocabularyId);
        }
    }, [trackFeature, trackLearning]);
}

/**
 * Convenience hook for tracking resource views
 */
export function useTrackResource() {
    const { trackFeature, trackLearning } = useAnalytics();

    return useCallback((resourceId: string, isDetailView: boolean = false) => {
        trackFeature('resource_view', { resourceId, isDetailView });
        if (isDetailView) {
            trackLearning('resource_read', resourceId);
        }
    }, [trackFeature, trackLearning]);
}

/**
 * Convenience hook for tracking flashcard sessions
 */
export function useTrackFlashcard() {
    const { trackFeature, trackLearning } = useAnalytics();

    return useCallback((sessionData?: Record<string, any>) => {
        trackFeature('flashcard_session', sessionData);
        trackLearning('flashcard_completed', `session_${Date.now()}`);
    }, [trackFeature, trackLearning]);
}

/**
 * Convenience hook for tracking dictionary searches
 */
export function useTrackDictionary() {
    const { trackFeature } = useAnalytics();

    return useCallback((searchTerm: string) => {
        trackFeature('dictionary_search', { searchTerm });
    }, [trackFeature]);
}

/**
 * Convenience hook for tracking share actions
 */
export function useTrackShare() {
    const { trackFeature } = useAnalytics();

    return useCallback((itemType: string, itemId: string) => {
        trackFeature('share_action', { itemType, itemId });
    }, [trackFeature]);
}
