'use client';

import { createContext, useContext, useCallback, useEffect, useRef, useState, ReactNode } from 'react';

interface ClickData {
    x: number;
    y: number;
    element: string;
    page: string;
    timestamp: number;
}

interface ScrollData {
    depth: number;
    page: string;
    timestamp: number;
}

interface AnalyticsData {
    clicks: ClickData[];
    scrolls: ScrollData[];
    pageViews: { page: string; duration: number; timestamp: number }[];
}

interface AnalyticsContextType {
    data: AnalyticsData;
    isTracking: boolean;
    startTracking: () => void;
    stopTracking: () => void;
    clearData: () => void;
    getHeatmapData: (page?: string) => ClickData[];
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function useAnalytics() {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalytics must be used within AnalyticsProvider');
    }
    return context;
}

interface AnalyticsProviderProps {
    children: ReactNode;
    autoStart?: boolean;
}

export function AnalyticsProvider({ children, autoStart = false }: AnalyticsProviderProps) {
    const [isTracking, setIsTracking] = useState(autoStart);
    const [data, setData] = useState<AnalyticsData>({
        clicks: [],
        scrolls: [],
        pageViews: [],
    });

    const pageStartTime = useRef<number>(Date.now());
    const currentPage = useRef<string>('');

    // Track clicks
    const handleClick = useCallback((e: MouseEvent) => {
        if (!isTracking) return;

        const target = e.target as HTMLElement;
        const clickData: ClickData = {
            x: e.clientX,
            y: e.clientY,
            element: target.tagName.toLowerCase() + (target.id ? `#${target.id}` : '') + (target.className ? `.${target.className.split(' ')[0]}` : ''),
            page: window.location.pathname,
            timestamp: Date.now(),
        };

        setData(prev => ({
            ...prev,
            clicks: [...prev.clicks, clickData],
        }));
    }, [isTracking]);

    // Track scroll depth
    const handleScroll = useCallback(() => {
        if (!isTracking) return;

        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollDepth = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

        const scrollData: ScrollData = {
            depth: scrollDepth,
            page: window.location.pathname,
            timestamp: Date.now(),
        };

        setData(prev => ({
            ...prev,
            scrolls: [...prev.scrolls.slice(-50), scrollData], // Keep last 50
        }));
    }, [isTracking]);

    // Track page changes
    useEffect(() => {
        if (!isTracking) return;

        const path = window.location.pathname;
        if (currentPage.current && currentPage.current !== path) {
            // Record previous page duration
            setData(prev => ({
                ...prev,
                pageViews: [...prev.pageViews, {
                    page: currentPage.current,
                    duration: Date.now() - pageStartTime.current,
                    timestamp: pageStartTime.current,
                }],
            }));
        }
        currentPage.current = path;
        pageStartTime.current = Date.now();
    }, [isTracking]);

    // Set up event listeners
    useEffect(() => {
        if (!isTracking) return;

        window.addEventListener('click', handleClick);
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('click', handleClick);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isTracking, handleClick, handleScroll]);

    const startTracking = useCallback(() => setIsTracking(true), []);
    const stopTracking = useCallback(() => setIsTracking(false), []);
    const clearData = useCallback(() => setData({ clicks: [], scrolls: [], pageViews: [] }), []);

    const getHeatmapData = useCallback((page?: string) => {
        if (page) {
            return data.clicks.filter(c => c.page === page);
        }
        return data.clicks;
    }, [data.clicks]);

    return (
        <AnalyticsContext.Provider value={{
            data,
            isTracking,
            startTracking,
            stopTracking,
            clearData,
            getHeatmapData,
        }}>
            {children}
        </AnalyticsContext.Provider>
    );
}
