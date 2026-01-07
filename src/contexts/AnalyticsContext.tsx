import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import {
    initializeUserAnalytics,
    startSession,
    endSession,
    trackPageView,
    trackFeatureUsage,
    trackLearningProgress,
    updateLastActive
} from '@/services/analyticsService';
import { FeatureType, LearningType } from '@/types/analytics';

interface AnalyticsContextType {
    trackFeature: (featureType: FeatureType, metadata?: Record<string, any>) => void;
    trackLearning: (learningType: LearningType, itemId: string) => void;
    isTracking: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Batch tracking to reduce Firestore writes
const BATCH_INTERVAL = 10000; // 10 seconds
const ACTIVITY_PING_INTERVAL = 60000; // 1 minute

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const location = useLocation();
    const [isTracking, setIsTracking] = useState(false);
    const sessionIdRef = useRef<string | null>(null);
    const activityTimerRef = useRef<NodeJS.Timeout | null>(null);
    const batchQueueRef = useRef<Array<() => Promise<void>>>([]);
    const batchTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize analytics and start session on login
    useEffect(() => {
        if (user) {
            const init = async () => {
                try {
                    await initializeUserAnalytics(user.uid, user.email || '', user.displayName || 'User');
                    const sessionId = await startSession(user.uid);
                    sessionIdRef.current = sessionId;
                    setIsTracking(true);
                    console.log('[Analytics] Session started:', sessionId);

                    // Start activity ping
                    startActivityPing();
                } catch (error) {
                    console.error('[Analytics] Failed to initialize:', error);
                }
            };
            init();

            // Cleanup on unmount or logout
            return () => {
                if (sessionIdRef.current && user) {
                    endSession(user.uid, sessionIdRef.current);
                    console.log('[Analytics] Session ended');
                }
                stopActivityPing();
                processBatch(); // Process any remaining batched operations
            };
        } else {
            setIsTracking(false);
        }
    }, [user]);

    // Track page views
    useEffect(() => {
        if (user && isTracking) {
            addToBatch(() => trackPageView(user.uid, location.pathname));
        }
    }, [location.pathname, user, isTracking]);

    // Batch processing to reduce Firestore writes
    const addToBatch = useCallback((operation: () => Promise<void>) => {
        batchQueueRef.current.push(operation);

        // Clear existing timer
        if (batchTimerRef.current) {
            clearTimeout(batchTimerRef.current);
        }

        // Set new timer to process batch
        batchTimerRef.current = setTimeout(() => {
            processBatch();
        }, BATCH_INTERVAL);
    }, []);

    const processBatch = useCallback(async () => {
        if (batchQueueRef.current.length === 0) return;

        const operations = [...batchQueueRef.current];
        batchQueueRef.current = [];

        try {
            // Execute all batched operations
            await Promise.all(operations.map(op => op()));
            console.log('[Analytics] Processed batch:', operations.length, 'operations');
        } catch (error) {
            console.error('[Analytics] Batch processing error:', error);
        }
    }, []);

    // Activity ping to update last active
    const startActivityPing = useCallback(() => {
        if (activityTimerRef.current) {
            clearInterval(activityTimerRef.current);
        }

        activityTimerRef.current = setInterval(() => {
            if (user) {
                updateLastActive(user.uid);
            }
        }, ACTIVITY_PING_INTERVAL);
    }, [user]);

    const stopActivityPing = useCallback(() => {
        if (activityTimerRef.current) {
            clearInterval(activityTimerRef.current);
            activityTimerRef.current = null;
        }
    }, []);

    // Track feature usage
    const trackFeature = useCallback((featureType: FeatureType, metadata?: Record<string, any>) => {
        if (user && isTracking) {
            addToBatch(() => trackFeatureUsage(user.uid, featureType, metadata));
        }
    }, [user, isTracking, addToBatch]);

    // Track learning progress
    const trackLearning = useCallback((learningType: LearningType, itemId: string) => {
        if (user && isTracking) {
            addToBatch(() => trackLearningProgress(user.uid, learningType, itemId));
        }
    }, [user, isTracking, addToBatch]);

    const value: AnalyticsContextType = {
        trackFeature,
        trackLearning,
        isTracking
    };

    return (
        <AnalyticsContext.Provider value={value}>
            {children}
        </AnalyticsContext.Provider>
    );
}

export function useAnalytics() {
    const context = useContext(AnalyticsContext);
    if (context === undefined) {
        throw new Error('useAnalytics must be used within an AnalyticsProvider');
    }
    return context;
}
