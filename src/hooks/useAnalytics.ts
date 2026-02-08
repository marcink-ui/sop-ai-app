'use client';

import { useState, useEffect, useCallback } from 'react';

interface AnalyticsStats {
    counters: {
        activeUsers: number;
        totalSOPs: number;
        totalAgents: number;
        aiCallsToday: number;
        pendingCouncil: number;
        sopsThisWeek: number;
    };
    trends: {
        usersChange: string;
        aiCallsChange: string;
        sopsChange: string;
    };
    engagement: {
        score: number;
        level: 'high' | 'medium' | 'low';
    };
    lastUpdated: string;
}

interface UseAnalyticsOptions {
    refreshInterval?: number; // in milliseconds
    autoRefresh?: boolean;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
    const { refreshInterval = 60000, autoRefresh = true } = options;

    const [stats, setStats] = useState<AnalyticsStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch('/api/analytics/stats');

            if (!response.ok) {
                throw new Error(`Failed to fetch analytics: ${response.status}`);
            }

            const data = await response.json();
            setStats(data);
            setError(null);
        } catch (err) {
            console.error('[ANALYTICS_HOOK_ERROR]', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refresh = useCallback(() => {
        setIsLoading(true);
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        fetchStats();

        if (autoRefresh && refreshInterval > 0) {
            const interval = setInterval(fetchStats, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchStats, autoRefresh, refreshInterval]);

    return {
        stats,
        isLoading,
        error,
        refresh
    };
}

// Hook for tracking user interactions
interface TrackingEvent {
    type: 'click' | 'scroll' | 'view' | 'interaction';
    page: string;
    element?: string;
    x?: number;
    y?: number;
    metadata?: Record<string, unknown>;
}

export function useAnalyticsTracker() {
    const [isTracking, setIsTracking] = useState(false);
    const [eventBuffer, setEventBuffer] = useState<TrackingEvent[]>([]);

    const track = useCallback((event: TrackingEvent) => {
        if (!isTracking) return;

        setEventBuffer(prev => [...prev, event]);
    }, [isTracking]);

    const trackClick = useCallback((element: string, x?: number, y?: number) => {
        track({
            type: 'click',
            page: typeof window !== 'undefined' ? window.location.pathname : '',
            element,
            x,
            y
        });
    }, [track]);

    const trackPageView = useCallback((page?: string) => {
        track({
            type: 'view',
            page: page || (typeof window !== 'undefined' ? window.location.pathname : '')
        });
    }, [track]);

    const trackInteraction = useCallback((element: string, metadata?: Record<string, unknown>) => {
        track({
            type: 'interaction',
            page: typeof window !== 'undefined' ? window.location.pathname : '',
            element,
            metadata
        });
    }, [track]);

    // Flush events to server
    const flushEvents = useCallback(async () => {
        if (eventBuffer.length === 0) return;

        const eventsToSend = [...eventBuffer];
        setEventBuffer([]);

        try {
            await fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events: eventsToSend })
            });
        } catch (error) {
            console.error('[ANALYTICS_FLUSH_ERROR]', error);
            // Re-add events to buffer on failure
            setEventBuffer(prev => [...eventsToSend, ...prev]);
        }
    }, [eventBuffer]);

    // Auto-flush every 10 seconds
    useEffect(() => {
        if (!isTracking) return;

        const interval = setInterval(flushEvents, 10000);
        return () => clearInterval(interval);
    }, [isTracking, flushEvents]);

    // Flush on page unload
    useEffect(() => {
        const handleUnload = () => {
            if (eventBuffer.length > 0) {
                navigator.sendBeacon('/api/analytics/track', JSON.stringify({ events: eventBuffer }));
            }
        };

        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, [eventBuffer]);

    return {
        isTracking,
        setIsTracking,
        track,
        trackClick,
        trackPageView,
        trackInteraction,
        flushEvents,
        pendingEvents: eventBuffer.length
    };
}
