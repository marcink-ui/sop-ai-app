'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
    SessionStats,
    ContextWindowState,
    ModelName,
    loadSessionStats,
    trackUsage,
    clearSessionStats,
    getContextWindow,
    MODEL_PRICING,
} from '@/lib/ai/token-tracker';

interface TokenTrackerContextValue {
    stats: SessionStats;
    contextWindow: ContextWindowState;
    currentModel: ModelName;
    setCurrentModel: (model: ModelName) => void;
    track: (inputTokens: number, outputTokens: number) => void;
    updateContextTokens: (tokens: number) => void;
    reset: () => void;
    isLoading: boolean;
}

const TokenTrackerContext = createContext<TokenTrackerContextValue | null>(null);

export function TokenTrackerProvider({ children }: { children: ReactNode }) {
    const [stats, setStats] = useState<SessionStats>({
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCost: 0,
        callCount: 0,
        usages: [],
    });
    const [currentModel, setCurrentModel] = useState<ModelName>('gpt-4o');
    const [contextTokens, setContextTokens] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Load stats on mount
    useEffect(() => {
        const loaded = loadSessionStats();
        setStats(loaded);
        setIsLoading(false);
    }, []);

    const track = useCallback((inputTokens: number, outputTokens: number) => {
        setStats(prev => {
            const updated = trackUsage(prev, inputTokens, outputTokens, currentModel);
            return updated;
        });
        // Update context window
        setContextTokens(prev => prev + inputTokens + outputTokens);
    }, [currentModel]);

    const updateContextTokens = useCallback((tokens: number) => {
        setContextTokens(tokens);
    }, []);

    const reset = useCallback(() => {
        const empty = clearSessionStats();
        setStats(empty);
        setContextTokens(0);
    }, []);

    const contextWindow = getContextWindow(currentModel, contextTokens);

    return (
        <TokenTrackerContext.Provider
            value={{
                stats,
                contextWindow,
                currentModel,
                setCurrentModel,
                track,
                updateContextTokens,
                reset,
                isLoading,
            }}
        >
            {children}
        </TokenTrackerContext.Provider>
    );
}

export function useTokenTracker(): TokenTrackerContextValue {
    const context = useContext(TokenTrackerContext);
    if (!context) {
        throw new Error('useTokenTracker must be used within a TokenTrackerProvider');
    }
    return context;
}

// Export models for UI select
export const AVAILABLE_MODELS = Object.entries(MODEL_PRICING).map(([name, pricing]) => ({
    name: name as ModelName,
    label: name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
    contextWindow: pricing.contextWindow,
    inputPrice: pricing.input,
    outputPrice: pricing.output,
}));
