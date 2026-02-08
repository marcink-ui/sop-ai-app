'use client';

/**
 * Token Tracker - AI Cost & Context Window Monitoring
 * Tracks token usage per session/user and calculates costs
 */

// Model pricing (per 1M tokens) - Updated Feb 2026
export const MODEL_PRICING = {
    'gpt-4o': { input: 2.50, output: 10.00, contextWindow: 128000 },
    'gpt-4o-mini': { input: 0.15, output: 0.60, contextWindow: 128000 },
    'gpt-4-turbo': { input: 10.00, output: 30.00, contextWindow: 128000 },
    'gpt-3.5-turbo': { input: 0.50, output: 1.50, contextWindow: 16385 },
    'claude-3-5-sonnet': { input: 3.00, output: 15.00, contextWindow: 200000 },
    'claude-3-opus': { input: 15.00, output: 75.00, contextWindow: 200000 },
    'claude-3-haiku': { input: 0.25, output: 1.25, contextWindow: 200000 },
    'gemini-2.0-flash': { input: 0.075, output: 0.30, contextWindow: 1000000 },
    'gemini-1.5-pro': { input: 1.25, output: 5.00, contextWindow: 2000000 },
    'gemini-1.5-flash': { input: 0.075, output: 0.30, contextWindow: 1000000 },
} as const;

export type ModelName = keyof typeof MODEL_PRICING;

export interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    modelName: ModelName;
    timestamp: Date;
}

export interface SessionStats {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    callCount: number;
    usages: TokenUsage[];
}

export interface ContextWindowState {
    currentTokens: number;
    maxTokens: number;
    percentUsed: number;
    model: ModelName;
}

const STORAGE_KEY = 'vantage_token_stats';

// Calculate cost for a single usage
export function calculateCost(usage: TokenUsage): number {
    const pricing = MODEL_PRICING[usage.modelName];
    if (!pricing) return 0;

    const inputCost = (usage.inputTokens / 1_000_000) * pricing.input;
    const outputCost = (usage.outputTokens / 1_000_000) * pricing.output;

    return inputCost + outputCost;
}

// Estimate tokens from text (rough approximation: ~4 chars per token for English)
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

// Get context window usage
export function getContextWindow(model: ModelName, currentTokens: number): ContextWindowState {
    const pricing = MODEL_PRICING[model];
    const maxTokens = pricing?.contextWindow ?? 128000;

    return {
        currentTokens,
        maxTokens,
        percentUsed: (currentTokens / maxTokens) * 100,
        model,
    };
}

// Load stats from localStorage
export function loadSessionStats(): SessionStats {
    if (typeof window === 'undefined') {
        return { totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0, callCount: 0, usages: [] };
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Restore Date objects
            parsed.usages = parsed.usages.map((u: TokenUsage) => ({
                ...u,
                timestamp: new Date(u.timestamp),
            }));
            return parsed;
        }
    } catch (e) {
        console.error('Failed to load token stats:', e);
    }

    return { totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0, callCount: 0, usages: [] };
}

// Save stats to localStorage
export function saveSessionStats(stats: SessionStats): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
        console.error('Failed to save token stats:', e);
    }
}

// Add a new usage to stats
export function trackUsage(
    stats: SessionStats,
    inputTokens: number,
    outputTokens: number,
    model: ModelName = 'gpt-4o'
): SessionStats {
    const usage: TokenUsage = {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        modelName: model,
        timestamp: new Date(),
    };

    const cost = calculateCost(usage);

    const newStats: SessionStats = {
        totalInputTokens: stats.totalInputTokens + inputTokens,
        totalOutputTokens: stats.totalOutputTokens + outputTokens,
        totalCost: stats.totalCost + cost,
        callCount: stats.callCount + 1,
        usages: [...stats.usages, usage],
    };

    saveSessionStats(newStats);
    return newStats;
}

// Clear all stats
export function clearSessionStats(): SessionStats {
    const empty: SessionStats = {
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCost: 0,
        callCount: 0,
        usages: []
    };
    saveSessionStats(empty);
    return empty;
}

// Format cost for display
export function formatCost(cost: number, currency: 'USD' | 'PLN' = 'USD'): string {
    const rate = currency === 'PLN' ? 4.0 : 1; // Approximate PLN/USD
    const value = cost * rate;

    if (value < 0.01) {
        return currency === 'PLN' ? '<0.01 zł' : '<$0.01';
    }

    return currency === 'PLN'
        ? `${value.toFixed(2)} zł`
        : `$${value.toFixed(2)}`;
}

// Format token count for display
export function formatTokens(tokens: number): string {
    if (tokens >= 1_000_000) {
        return `${(tokens / 1_000_000).toFixed(1)}M`;
    }
    if (tokens >= 1_000) {
        return `${(tokens / 1_000).toFixed(1)}k`;
    }
    return tokens.toString();
}

// Get cost alert level
export function getCostAlertLevel(cost: number, threshold: number = 1.0): 'normal' | 'warning' | 'critical' {
    if (cost >= threshold) return 'critical';
    if (cost >= threshold * 0.7) return 'warning';
    return 'normal';
}
