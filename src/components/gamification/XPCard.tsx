'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, TrendingUp } from 'lucide-react';

interface LevelInfo {
    level: number;
    title: string;
    minXP: number;
    progress: number;
    nextLevel: { level: number; title: string; minXP: number } | null;
}

interface XPCardProps {
    totalXP: number;
    baseXP: number;
    achievementXP: number;
    level: LevelInfo;
}

export function XPCard({ totalXP, baseXP, achievementXP, level }: XPCardProps) {
    return (
        <Card className="relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-pink-500/10" />

            <CardHeader className="relative pb-2">
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        Experience Points
                    </span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        +{achievementXP} bonus
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
                {/* XP Display */}
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        {totalXP.toLocaleString()}
                    </span>
                    <span className="text-lg text-muted-foreground mb-1">XP</span>
                </div>

                {/* Level Info */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold">
                                {level.level}
                            </span>
                            <span className="font-medium">{level.title}</span>
                        </div>
                        {level.nextLevel && (
                            <span className="text-muted-foreground">
                                {level.nextLevel.minXP - totalXP} XP to Level {level.nextLevel.level}
                            </span>
                        )}
                    </div>
                    <Progress value={level.progress} className="h-3" />
                </div>

                {/* XP Breakdown */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t text-sm">
                    <div>
                        <span className="text-muted-foreground">Base XP</span>
                        <p className="font-semibold">{baseXP.toLocaleString()}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Achievement Bonus</span>
                        <p className="font-semibold text-violet-600">+{achievementXP.toLocaleString()}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
