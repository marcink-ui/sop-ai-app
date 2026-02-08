'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Clock, MousePointerClick, ScrollText, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface UXMetrics {
    avgTimeOnPage: number; // seconds
    bounceRate: number; // percentage
    scrollDepth: number; // percentage
    clicksPerSession: number;
    previousAvgTimeOnPage?: number;
    previousBounceRate?: number;
}

interface UXScoreCardProps {
    metrics: UXMetrics;
    className?: string;
}

function calculateUXScore(metrics: UXMetrics): number {
    // Score components (0-100 each):
    // - Time engagement: 30 points (good: 60-180s, too short/long penalized)
    // - Bounce rate: 25 points (lower is better)
    // - Scroll depth: 25 points (higher is better)
    // - Click engagement: 20 points (moderate clicks = good)

    let timeScore = 0;
    if (metrics.avgTimeOnPage >= 60 && metrics.avgTimeOnPage <= 180) {
        timeScore = 30;
    } else if (metrics.avgTimeOnPage >= 30 && metrics.avgTimeOnPage < 60) {
        timeScore = 20;
    } else if (metrics.avgTimeOnPage > 180 && metrics.avgTimeOnPage <= 300) {
        timeScore = 25;
    } else {
        timeScore = 10;
    }

    const bounceScore = Math.max(0, 25 - (metrics.bounceRate / 4));
    const scrollScore = (metrics.scrollDepth / 100) * 25;

    let clickScore = 0;
    if (metrics.clicksPerSession >= 3 && metrics.clicksPerSession <= 10) {
        clickScore = 20;
    } else if (metrics.clicksPerSession >= 1 && metrics.clicksPerSession < 3) {
        clickScore = 12;
    } else if (metrics.clicksPerSession > 10) {
        clickScore = 15;
    } else {
        clickScore = 5;
    }

    return Math.round(timeScore + bounceScore + scrollScore + clickScore);
}

function getScoreColor(score: number): string {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
}

function getScoreLabel(score: number): string {
    if (score >= 80) return 'Doskonały';
    if (score >= 60) return 'Dobry';
    if (score >= 40) return 'Wymaga poprawy';
    return 'Krytyczny';
}

function TrendIndicator({ current, previous }: { current: number; previous?: number }) {
    if (!previous) return <Minus className="h-3 w-3 text-muted-foreground" />;

    const diff = ((current - previous) / previous) * 100;
    if (Math.abs(diff) < 5) return <Minus className="h-3 w-3 text-muted-foreground" />;

    return diff > 0 ? (
        <TrendingUp className="h-3 w-3 text-emerald-500" />
    ) : (
        <TrendingDown className="h-3 w-3 text-red-500" />
    );
}

export function UXScoreCard({ metrics, className = '' }: UXScoreCardProps) {
    const score = calculateUXScore(metrics);
    const scoreColor = getScoreColor(score);
    const scoreLabel = getScoreLabel(score);

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={className}
        >
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Eye className="h-5 w-5 text-primary" />
                                UX Score
                            </CardTitle>
                            <CardDescription>Automatyczna ocena doświadczenia użytkownika</CardDescription>
                        </div>
                        <div className="text-right">
                            <div className={`text-4xl font-bold ${scoreColor}`}>{score}</div>
                            <div className={`text-xs ${scoreColor}`}>{scoreLabel}</div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Progress value={score} className="h-2" />

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        {/* Time on Page */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <div className="flex-1">
                                <div className="text-xs text-muted-foreground">Śr. czas na stronie</div>
                                <div className="text-sm font-medium flex items-center gap-1">
                                    {formatTime(metrics.avgTimeOnPage)}
                                    <TrendIndicator
                                        current={metrics.avgTimeOnPage}
                                        previous={metrics.previousAvgTimeOnPage}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bounce Rate */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <TrendingDown className="h-4 w-4 text-amber-500" />
                            <div className="flex-1">
                                <div className="text-xs text-muted-foreground">Bounce Rate</div>
                                <div className="text-sm font-medium flex items-center gap-1">
                                    {metrics.bounceRate}%
                                    <TrendIndicator
                                        current={-metrics.bounceRate}
                                        previous={metrics.previousBounceRate ? -metrics.previousBounceRate : undefined}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Scroll Depth */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <ScrollText className="h-4 w-4 text-purple-500" />
                            <div className="flex-1">
                                <div className="text-xs text-muted-foreground">Scroll Depth</div>
                                <div className="text-sm font-medium">{metrics.scrollDepth}%</div>
                            </div>
                        </div>

                        {/* Clicks per Session */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <MousePointerClick className="h-4 w-4 text-emerald-500" />
                            <div className="flex-1">
                                <div className="text-xs text-muted-foreground">Kliknięć / sesja</div>
                                <div className="text-sm font-medium">{metrics.clicksPerSession}</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
