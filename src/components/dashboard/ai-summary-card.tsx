'use client';

/**
 * AI Summary Card - Hero Greeting Component
 * 
 * A prominent dashboard widget that provides:
 * - Dynamic time-of-day greeting
 * - User info with role badge
 * - Quick stats overview
 * - AI-powered quick actions
 */

import { motion } from 'framer-motion';
import {
    Sparkles,
    Sun,
    Moon,
    Cloud,
    ArrowRight,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';


interface AISummaryCardProps {
    user: {
        name: string;
        email: string;
        role: 'META_ADMIN' | 'PARTNER' | 'SPONSOR' | 'PILOT' | 'MANAGER' | 'EXPERT' | 'CITIZEN_DEV';
    };
    stats: {
        sops: number;
        agents: number;
        mudaReports: number;
        totalSavings: number;
    };
    onOpenChat?: () => void;
    className?: string;
}

function getTimeGreeting(): { greeting: string; icon: typeof Sun; period: 'morning' | 'afternoon' | 'evening' } {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return { greeting: 'Dzień dobry', icon: Sun, period: 'morning' };
    } else if (hour >= 12 && hour < 18) {
        return { greeting: 'Witaj', icon: Cloud, period: 'afternoon' };
    } else {
        return { greeting: 'Dobry wieczór', icon: Moon, period: 'evening' };
    }
}



export function AISummaryCard({ user, stats, onOpenChat, className }: AISummaryCardProps) {
    const { greeting, icon: TimeIcon, period } = getTimeGreeting();

    const gradientClass = {
        morning: 'from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/20',
        afternoon: 'from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-950/30 dark:via-cyan-950/20 dark:to-sky-950/20',
        evening: 'from-indigo-50 via-purple-50 to-violet-50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-violet-950/20',
    }[period];

    const accentColor = {
        morning: 'from-amber-500 to-orange-600',
        afternoon: 'from-blue-500 to-cyan-600',
        evening: 'from-indigo-500 to-purple-600',
    }[period];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={cn(
                'relative overflow-hidden rounded-[var(--radius)] border theme-border p-6',
                `bg-gradient-to-br ${gradientClass}`,
                className
            )}
        >
            {/* Animated gradient orb */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className={cn(
                    'absolute top-0 right-0 w-64 h-64 blur-3xl rounded-full',
                    '-translate-y-1/2 translate-x-1/4',
                    `bg-gradient-to-br ${accentColor} opacity-20`
                )}
            />

            <div className="relative z-10">
                {/* Header — greeting + role badge + AI CTA */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className={cn(
                                'flex h-14 w-14 items-center justify-center rounded-2xl',
                                `bg-gradient-to-br ${accentColor}`,
                                'shadow-lg shadow-current/25'
                            )}
                        >
                            <Sparkles className="h-7 w-7 text-white" />
                        </motion.div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <TimeIcon className="h-4 w-4 theme-text-secondary" />
                                <span className="text-sm theme-text-secondary">
                                    {greeting}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold theme-text">
                                {user.name}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <RoleBadge role={user.role} size="sm" />
                        {onOpenChat && (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Button
                                    onClick={onOpenChat}
                                    size="sm"
                                    className={cn(
                                        'gap-2',
                                        `bg-gradient-to-r ${accentColor}`,
                                        'hover:opacity-90 shadow-lg'
                                    )}
                                >
                                    <Zap className="h-4 w-4" />
                                    Zapytaj AI
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}



export default AISummaryCard;
