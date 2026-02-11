'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    trend?: {
        value: string;
        direction: 'up' | 'down' | 'neutral';
    };
    description?: string;
    color: 'blue' | 'purple' | 'orange' | 'green' | 'cyan' | 'amber';
    delay?: number;
}

const colorMap = {
    blue: {
        gradient: 'from-blue-500 to-blue-600',
        shadow: 'shadow-blue-500/25',
        bg: 'from-blue-500/10 to-transparent',
        text: 'text-blue-600 dark:text-blue-400',
        trendBg: 'bg-blue-100 dark:bg-blue-500/10',
    },
    purple: {
        gradient: 'from-purple-500 to-purple-600',
        shadow: 'shadow-purple-500/25',
        bg: 'from-purple-500/10 to-transparent',
        text: 'text-purple-600 dark:text-purple-400',
        trendBg: 'bg-purple-100 dark:bg-purple-500/10',
    },
    orange: {
        gradient: 'from-orange-500 to-orange-600',
        shadow: 'shadow-orange-500/25',
        bg: 'from-orange-500/10 to-transparent',
        text: 'text-orange-600 dark:text-orange-400',
        trendBg: 'bg-orange-100 dark:bg-orange-500/10',
    },
    green: {
        gradient: 'from-green-500 to-green-600',
        shadow: 'shadow-green-500/25',
        bg: 'from-green-500/10 to-transparent',
        text: 'text-green-600 dark:text-green-400',
        trendBg: 'bg-green-100 dark:bg-green-500/10',
    },
    cyan: {
        gradient: 'from-cyan-500 to-cyan-600',
        shadow: 'shadow-cyan-500/25',
        bg: 'from-cyan-500/10 to-transparent',
        text: 'text-cyan-600 dark:text-cyan-400',
        trendBg: 'bg-cyan-100 dark:bg-cyan-500/10',
    },
    amber: {
        gradient: 'from-amber-500 to-amber-600',
        shadow: 'shadow-amber-500/25',
        bg: 'from-amber-500/10 to-transparent',
        text: 'text-amber-600 dark:text-amber-400',
        trendBg: 'bg-amber-100 dark:bg-amber-500/10',
    },
};

export function StatCard({ title, value, icon: Icon, trend, description, color, delay = 0 }: StatCardProps) {
    const colors = colorMap[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.25, 0.1, 0.25, 1],
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden theme-card p-6 hover:shadow-xl"
        >
            {/* Animated gradient background on hover */}
            <motion.div
                className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500', colors.bg)}
            />

            {/* Shimmer effect on hover */}
            <motion.div
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                }}
            />

            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    {/* Icon with gradient background */}
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                        className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg',
                            colors.gradient,
                            colors.shadow
                        )}
                    >
                        <Icon className="h-6 w-6 text-white" />
                    </motion.div>

                    {/* Trend indicator */}
                    {trend && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: delay + 0.2 }}
                            className={cn(
                                'flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full',
                                trend.direction === 'up' && 'text-green-600 bg-green-500/10',
                                trend.direction === 'down' && 'text-red-600 bg-red-500/10',
                                trend.direction === 'neutral' && 'theme-text-muted bg-[var(--bg-secondary)]'
                            )}
                        >
                            {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
                            {trend.direction === 'down' && <TrendingDown className="h-3 w-3" />}
                            {trend.value}
                        </motion.div>
                    )}
                </div>

                {/* Value with counting animation */}
                <AnimatePresence mode="wait">
                    <motion.p
                        key={String(value)}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold theme-text mb-1 tracking-tight"
                    >
                        {value}
                    </motion.p>
                </AnimatePresence>

                <p className="text-sm font-medium theme-text-secondary">{title}</p>

                {description && (
                    <p className="text-xs theme-text-muted mt-2">{description}</p>
                )}
            </div>
        </motion.div>
    );
}
