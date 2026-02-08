'use client';

import { motion } from 'framer-motion';
import { Award, Sparkles, TrendingUp, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WidgetContainer } from './widget-container';

interface PandyWidgetProps {
    onRemove?: () => void;
    userPandy?: number;
    weeklyChange?: number;
    rank?: number;
    className?: string;
}

export function PandyWidget({
    onRemove,
    userPandy = 247,
    weeklyChange = 35,
    rank = 3,
    className,
}: PandyWidgetProps) {
    const milestones = [
        { points: 100, label: 'Początkujący', unlocked: userPandy >= 100 },
        { points: 250, label: 'Aktywny', unlocked: userPandy >= 250 },
        { points: 500, label: 'Ekspert', unlocked: userPandy >= 500 },
        { points: 1000, label: 'Mistrz', unlocked: userPandy >= 1000 },
    ];

    const nextMilestone = milestones.find((m) => !m.unlocked) || milestones[milestones.length - 1];
    const progressToNext = Math.min(100, (userPandy / nextMilestone.points) * 100);

    return (
        <WidgetContainer
            id="pandy-widget"
            title="Twoje Pandy"
            icon={<span className="text-lg">🐼</span>}
            size="third"
            removable={!!onRemove}
            onRemove={onRemove}
            contentClassName="p-0"
            className={className}
        >
            {/* Points Display */}
            <div className="px-4 pt-3 pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <motion.span
                            key={userPandy}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-3xl font-bold text-neutral-900 dark:text-white"
                        >
                            {userPandy}
                        </motion.span>
                        <span className="text-sm text-neutral-500">punktów</span>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                            weeklyChange > 0
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        )}
                    >
                        <TrendingUp className="h-3 w-3" />
                        +{weeklyChange} tydzień
                    </motion.div>
                </div>
            </div>

            {/* Progress to Next Milestone */}
            <div className="px-4 pb-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-neutral-500">Do: {nextMilestone.label}</span>
                    <span className="text-neutral-400">{userPandy}/{nextMilestone.points}</span>
                </div>
                <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToNext}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    />
                </div>
            </div>

            {/* Rank Badge */}
            <div className="border-t border-neutral-100 dark:border-neutral-800/50 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                            <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-neutral-900 dark:text-white">
                                Ranking #{rank}
                            </p>
                            <p className="text-xs text-neutral-500">w Twojej organizacji</p>
                        </div>
                    </div>
                    <div className="flex -space-x-1">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    'h-6 w-6 rounded-full border-2 border-white dark:border-neutral-900',
                                    i <= rank ? 'bg-amber-400' : 'bg-neutral-200 dark:bg-neutral-700'
                                )}
                            >
                                {i <= rank && (
                                    <Star className="h-3 w-3 text-white m-auto mt-0.5" fill="white" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Milestones Preview */}
            <div className="border-t border-neutral-100 dark:border-neutral-800/50 px-4 py-2">
                <div className="flex items-center justify-between">
                    {milestones.map((milestone, index) => (
                        <motion.div
                            key={milestone.points}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                'flex flex-col items-center',
                                milestone.unlocked ? 'opacity-100' : 'opacity-40'
                            )}
                        >
                            <div
                                className={cn(
                                    'h-6 w-6 rounded-full flex items-center justify-center text-xs',
                                    milestone.unlocked
                                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'
                                )}
                            >
                                {milestone.unlocked ? '✓' : milestone.points}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </WidgetContainer>
    );
}
