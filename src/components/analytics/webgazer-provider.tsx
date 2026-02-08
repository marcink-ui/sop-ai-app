'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface GazePoint {
    x: number;
    y: number;
    timestamp: number;
}

interface HeatmapData {
    x: number;
    y: number;
    value: number;
}

interface WebGazerContextType {
    isEnabled: boolean;
    isTracking: boolean;
    isCalibrated: boolean;
    gazePoints: GazePoint[];
    heatmapData: HeatmapData[];
    toggleEnabled: () => void;
    startTracking: () => Promise<void>;
    stopTracking: () => void;
    clearData: () => void;
    exportData: () => string;
}

const WebGazerContext = createContext<WebGazerContextType | undefined>(undefined);

const STORAGE_KEY = 'vantage-webgazer-enabled';
const GAZE_DATA_KEY = 'vantage-webgazer-gaze-data';

export function WebGazerProvider({ children }: { children: ReactNode }) {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [isCalibrated, setIsCalibrated] = useState(false);
    const [gazePoints, setGazePoints] = useState<GazePoint[]>([]);
    const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
    const [webgazer, setWebgazer] = useState<typeof import('webgazer') | null>(null);

    // Load preferences from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'true') {
                setIsEnabled(true);
            }

            // Load saved gaze data
            const savedData = localStorage.getItem(GAZE_DATA_KEY);
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    setGazePoints(parsed.gazePoints || []);
                    setHeatmapData(parsed.heatmapData || []);
                } catch (e) {
                    console.warn('Failed to load gaze data:', e);
                }
            }
        }
    }, []);

    // Save preferences to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, isEnabled.toString());
        }
    }, [isEnabled]);

    // Save gaze data periodically
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const saveData = () => {
            localStorage.setItem(GAZE_DATA_KEY, JSON.stringify({
                gazePoints: gazePoints.slice(-1000), // Keep last 1000 points
                heatmapData,
            }));
        };

        const intervalId = setInterval(saveData, 10000); // Save every 10 seconds
        return () => clearInterval(intervalId);
    }, [gazePoints, heatmapData]);

    // Generate heatmap from gaze points
    const updateHeatmap = useCallback((x: number, y: number) => {
        const gridSize = 50; // 50px grid cells
        const gridX = Math.floor(x / gridSize) * gridSize;
        const gridY = Math.floor(y / gridSize) * gridSize;

        setHeatmapData(prev => {
            const existing = prev.find(h => h.x === gridX && h.y === gridY);
            if (existing) {
                return prev.map(h =>
                    h.x === gridX && h.y === gridY
                        ? { ...h, value: h.value + 1 }
                        : h
                );
            }
            return [...prev, { x: gridX, y: gridY, value: 1 }];
        });
    }, []);

    const startTracking = useCallback(async () => {
        if (typeof window === 'undefined' || !isEnabled) return;

        try {
            // Dynamic import to avoid SSR issues
            const webgazerModule = await import('webgazer');
            setWebgazer(webgazerModule);

            await webgazerModule.default
                .setRegression('ridge')
                .setTracker('TFFacemesh')
                .showVideoPreview(true)
                .showPredictionPoints(true)
                .setGazeListener((data: { x: number; y: number } | null) => {
                    if (data) {
                        const point: GazePoint = {
                            x: Math.round(data.x),
                            y: Math.round(data.y),
                            timestamp: Date.now(),
                        };
                        setGazePoints(prev => [...prev.slice(-999), point]);
                        updateHeatmap(data.x, data.y);
                    }
                })
                .begin();

            setIsTracking(true);
            setIsCalibrated(true);
        } catch (error) {
            console.error('Failed to start WebGazer:', error);
        }
    }, [isEnabled, updateHeatmap]);

    const stopTracking = useCallback(() => {
        if (webgazer) {
            try {
                webgazer.default.end();
                setIsTracking(false);
            } catch (error) {
                console.error('Failed to stop WebGazer:', error);
            }
        }
    }, [webgazer]);

    const toggleEnabled = useCallback(() => {
        setIsEnabled(prev => {
            const newValue = !prev;
            if (!newValue && isTracking) {
                stopTracking();
            }
            return newValue;
        });
    }, [isTracking, stopTracking]);

    const clearData = useCallback(() => {
        setGazePoints([]);
        setHeatmapData([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(GAZE_DATA_KEY);
        }
    }, []);

    const exportData = useCallback(() => {
        const data = {
            exportedAt: new Date().toISOString(),
            totalPoints: gazePoints.length,
            heatmapCells: heatmapData.length,
            gazePoints,
            heatmapData,
            screenSize: typeof window !== 'undefined' ? {
                width: window.innerWidth,
                height: window.innerHeight,
            } : null,
        };
        return JSON.stringify(data, null, 2);
    }, [gazePoints, heatmapData]);

    return (
        <WebGazerContext.Provider
            value={{
                isEnabled,
                isTracking,
                isCalibrated,
                gazePoints,
                heatmapData,
                toggleEnabled,
                startTracking,
                stopTracking,
                clearData,
                exportData,
            }}
        >
            {children}
        </WebGazerContext.Provider>
    );
}

export function useWebGazer() {
    const context = useContext(WebGazerContext);
    if (context === undefined) {
        throw new Error('useWebGazer must be used within a WebGazerProvider');
    }
    return context;
}
