'use client';

import { useTokenTracker, AVAILABLE_MODELS } from './token-tracker-provider';
import { formatCost, formatTokens, getCostAlertLevel, ModelName } from '@/lib/ai/token-tracker';
import { cn } from '@/lib/utils';
import { Cpu, Coins, Gauge, ChevronDown, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface ContextProgressBarProps {
    variant?: 'minimal' | 'detailed';
    className?: string;
    showCost?: boolean;
}

export function ContextProgressBar({
    variant = 'minimal',
    className,
    showCost = true
}: ContextProgressBarProps) {
    const { stats, contextWindow, currentModel, setCurrentModel, reset, isLoading } = useTokenTracker();
    const [showModelSelect, setShowModelSelect] = useState(false);

    if (isLoading) {
        return (
            <div className={cn("animate-pulse bg-muted/50 rounded-lg h-8", className)} />
        );
    }

    const alertLevel = getCostAlertLevel(stats.totalCost);
    const progressColor = contextWindow.percentUsed > 90
        ? 'bg-red-500'
        : contextWindow.percentUsed > 70
            ? 'bg-yellow-500'
            : 'bg-emerald-500';

    const costColor = alertLevel === 'critical'
        ? 'text-red-500'
        : alertLevel === 'warning'
            ? 'text-yellow-500'
            : 'text-muted-foreground';

    if (variant === 'minimal') {
        return (
            <div className={cn("flex items-center gap-2 px-2 py-1 text-xs", className)}>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Gauge className="w-3.5 h-3.5" />
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className={cn("h-full transition-all duration-300", progressColor)}
                            style={{ width: `${Math.min(contextWindow.percentUsed, 100)}%` }}
                        />
                    </div>
                    <span className="tabular-nums">{contextWindow.percentUsed.toFixed(0)}%</span>
                </div>

                {showCost && (
                    <div className={cn("flex items-center gap-1", costColor)}>
                        <Coins className="w-3.5 h-3.5" />
                        <span className="tabular-nums">{formatCost(stats.totalCost)}</span>
                    </div>
                )}
            </div>
        );
    }

    // Detailed variant
    return (
        <div className={cn(
            "p-3 rounded-lg border bg-card/50 space-y-2",
            className
        )}>
            {/* Header with model selector */}
            <div className="flex items-center justify-between">
                <div className="relative">
                    <button
                        onClick={() => setShowModelSelect(!showModelSelect)}
                        className="flex items-center gap-1.5 text-sm font-medium hover:bg-muted/50 px-2 py-1 rounded-md transition-colors"
                    >
                        <Cpu className="w-4 h-4 text-muted-foreground" />
                        <span>{currentModel}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>

                    {showModelSelect && (
                        <div className="absolute top-full left-0 mt-1 z-50 w-56 bg-popover border rounded-lg shadow-lg p-1">
                            {AVAILABLE_MODELS.map(model => (
                                <button
                                    key={model.name}
                                    onClick={() => {
                                        setCurrentModel(model.name as ModelName);
                                        setShowModelSelect(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm hover:bg-muted/50 transition-colors",
                                        currentModel === model.name && "bg-muted"
                                    )}
                                >
                                    <span>{model.label}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatTokens(model.contextWindow)} ctx
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={reset}
                    className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                    title="Reset stats"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Context window progress */}
            <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Context Window</span>
                    <span className="tabular-nums">
                        {formatTokens(contextWindow.currentTokens)} / {formatTokens(contextWindow.maxTokens)}
                    </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className={cn("h-full transition-all duration-500", progressColor)}
                        style={{ width: `${Math.min(contextWindow.percentUsed, 100)}%` }}
                    />
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="text-center">
                    <div className="text-xs text-muted-foreground">Input</div>
                    <div className="text-sm font-medium tabular-nums">
                        {formatTokens(stats.totalInputTokens)}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-muted-foreground">Output</div>
                    <div className="text-sm font-medium tabular-nums">
                        {formatTokens(stats.totalOutputTokens)}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-muted-foreground">Cost</div>
                    <div className={cn("text-sm font-medium tabular-nums", costColor)}>
                        {formatCost(stats.totalCost)}
                    </div>
                </div>
            </div>

            {/* Call count */}
            <div className="text-xs text-center text-muted-foreground pt-1 border-t">
                {stats.callCount} API calls this session
            </div>
        </div>
    );
}
