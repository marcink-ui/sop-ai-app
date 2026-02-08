'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    useTokenTracker,
    AVAILABLE_MODELS
} from '@/components/ai-chat/token-tracker-provider';
import {
    formatCost,
    formatTokens,
    getCostAlertLevel,
    ModelName
} from '@/lib/ai/token-tracker';
import { ContextProgressBar } from '@/components/ai-chat/context-progress-bar';
import { cn } from '@/lib/utils';
import {
    Cpu,
    Coins,
    RotateCcw,
    TrendingUp,
    Clock,
    AlertTriangle,
    CheckCircle,
    ArrowLeft,
    Settings2
} from 'lucide-react';
import Link from 'next/link';

export default function AICostsPage() {
    const {
        stats,
        currentModel,
        setCurrentModel,
        reset,
        isLoading
    } = useTokenTracker();

    const alertLevel = getCostAlertLevel(stats.totalCost);

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-48" />
                    <div className="h-64 bg-muted rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/settings">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Coins className="h-6 w-6 text-amber-500" />
                            AI Costs & Token Usage
                        </h1>
                        <p className="text-muted-foreground">
                            Monitor your AI usage and costs
                        </p>
                    </div>
                </div>
                <Button variant="outline" onClick={reset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Stats
                </Button>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Cost */}
                <Card className={cn(
                    alertLevel === 'critical' && 'border-red-500/50',
                    alertLevel === 'warning' && 'border-yellow-500/50'
                )}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Coins className="h-4 w-4" />
                            Total Cost
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            "text-3xl font-bold",
                            alertLevel === 'critical' && 'text-red-500',
                            alertLevel === 'warning' && 'text-yellow-500'
                        )}>
                            {formatCost(stats.totalCost)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {formatCost(stats.totalCost, 'PLN')}
                        </p>
                    </CardContent>
                </Card>

                {/* Total Tokens */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Total Tokens
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {formatTokens(stats.totalInputTokens + stats.totalOutputTokens)}
                        </div>
                        <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                                In: {formatTokens(stats.totalInputTokens)}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                                Out: {formatTokens(stats.totalOutputTokens)}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* API Calls */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            API Calls
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {stats.callCount}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            This session
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Context Window Progress */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5" />
                        Context Window Monitor
                    </CardTitle>
                    <CardDescription>
                        Track your context usage and select AI model
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ContextProgressBar variant="detailed" />
                </CardContent>
            </Card>

            {/* Model Pricing Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Cpu className="h-5 w-5" />
                        Model Pricing (per 1M tokens)
                    </CardTitle>
                    <CardDescription>
                        Click to select a model for tracking
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 pr-4">Model</th>
                                    <th className="text-right py-2 px-4">Input</th>
                                    <th className="text-right py-2 px-4">Output</th>
                                    <th className="text-right py-2 pl-4">Context</th>
                                </tr>
                            </thead>
                            <tbody>
                                {AVAILABLE_MODELS.map(model => (
                                    <tr
                                        key={model.name}
                                        onClick={() => setCurrentModel(model.name as ModelName)}
                                        className={cn(
                                            "border-b cursor-pointer hover:bg-muted/50 transition-colors",
                                            currentModel === model.name && "bg-blue-50 dark:bg-blue-950/30"
                                        )}
                                    >
                                        <td className="py-2 pr-4 flex items-center gap-2">
                                            {currentModel === model.name ? (
                                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <div className="w-4" />
                                            )}
                                            <span className="font-medium">{model.label}</span>
                                        </td>
                                        <td className="text-right py-2 px-4 text-muted-foreground">
                                            ${model.inputPrice.toFixed(2)}
                                        </td>
                                        <td className="text-right py-2 px-4 text-muted-foreground">
                                            ${model.outputPrice.toFixed(2)}
                                        </td>
                                        <td className="text-right py-2 pl-4">
                                            <Badge variant="outline" className="tabular-nums">
                                                {formatTokens(model.contextWindow)}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Alerts Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Cost Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <div>
                            <p className="font-medium">Normal</p>
                            <p className="text-sm text-muted-foreground">
                                Cost below $0.70 per session
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div>
                            <p className="font-medium">Warning</p>
                            <p className="text-sm text-muted-foreground">
                                Cost between $0.70 - $1.00 per session
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div>
                            <p className="font-medium">Critical</p>
                            <p className="text-sm text-muted-foreground">
                                Cost exceeds $1.00 per session
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
