'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Lock, Trophy } from 'lucide-react';

interface Achievement {
    id: string;
    name: string;
    description: string;
    xpBonus: number;
    unlocked: boolean;
}

interface AchievementsGridProps {
    achievements: Achievement[];
    unlockedCount: number;
}

export function AchievementsGrid({ achievements, unlockedCount }: AchievementsGridProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        Achievements
                    </span>
                    <span className="text-sm font-normal text-muted-foreground">
                        {unlockedCount} / {achievements.length}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {achievements.map((achievement) => (
                        <div
                            key={achievement.id}
                            className={cn(
                                'relative p-4 rounded-lg border transition-all',
                                achievement.unlocked
                                    ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800'
                                    : 'bg-muted/30 border-transparent opacity-60'
                            )}
                        >
                            {/* Lock overlay for locked achievements */}
                            {!achievement.unlocked && (
                                <div className="absolute top-2 right-2">
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                </div>
                            )}

                            {/* Achievement content */}
                            <div className="text-2xl mb-2">{achievement.name.split(' ')[0]}</div>
                            <h4 className={cn(
                                'font-medium text-sm line-clamp-1',
                                achievement.unlocked ? '' : 'text-muted-foreground'
                            )}>
                                {achievement.name.slice(achievement.name.indexOf(' ') + 1)}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {achievement.description}
                            </p>
                            <div className={cn(
                                'text-xs mt-2 font-medium',
                                achievement.unlocked ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                            )}>
                                +{achievement.xpBonus} XP
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
