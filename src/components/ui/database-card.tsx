'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { type LucideIcon, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DatabaseCardProps {
    name: string;
    href: string;
    icon: LucideIcon;
    count: number;
    description?: string;
    color: 'blue' | 'purple' | 'orange' | 'green' | 'cyan' | 'amber';
    delay?: number;
}

const colorMap = {
    blue: {
        iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
        iconColor: 'text-blue-600 dark:text-blue-400',
        hoverBorder: 'hover:border-blue-500/50',
        gradient: 'from-blue-500/20 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/10',
    },
    purple: {
        iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
        iconColor: 'text-purple-600 dark:text-purple-400',
        hoverBorder: 'hover:border-purple-500/50',
        gradient: 'from-purple-500/20 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/10',
    },
    orange: {
        iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
        iconColor: 'text-orange-600 dark:text-orange-400',
        hoverBorder: 'hover:border-orange-500/50',
        gradient: 'from-orange-500/20 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-600/10',
    },
    green: {
        iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
        iconColor: 'text-green-600 dark:text-green-400',
        hoverBorder: 'hover:border-green-500/50',
        gradient: 'from-green-500/20 to-green-600/10 dark:from-green-500/20 dark:to-green-600/10',
    },
    cyan: {
        iconBg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
        iconColor: 'text-cyan-600 dark:text-cyan-400',
        hoverBorder: 'hover:border-cyan-500/50',
        gradient: 'from-cyan-500/20 to-cyan-600/10 dark:from-cyan-500/20 dark:to-cyan-600/10',
    },
    amber: {
        iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
        iconColor: 'text-amber-600 dark:text-amber-400',
        hoverBorder: 'hover:border-amber-500/50',
        gradient: 'from-amber-500/20 to-amber-600/10 dark:from-amber-500/20 dark:to-amber-600/10',
    },
};

export function DatabaseCard({ name, href, icon: Icon, count, description, color, delay = 0 }: DatabaseCardProps) {
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
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
        >
            <Link href={href} className="block group">
                <div className={cn(
                    'relative overflow-hidden rounded-2xl border p-6 transition-all duration-300',
                    'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-gradient-to-br',
                    colors.gradient,
                    colors.hoverBorder,
                    'hover:shadow-xl hover:shadow-neutral-900/5 dark:hover:shadow-black/30'
                )}>
                    {/* Shine effect on hover */}
                    <motion.div
                        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                        }}
                    />

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Animated icon container */}
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: -5 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                className={cn(
                                    'flex h-12 w-12 items-center justify-center rounded-xl shadow-lg',
                                    colors.iconBg
                                )}
                            >
                                <Icon className="h-6 w-6 text-white" />
                            </motion.div>

                            <div>
                                <span className="font-semibold text-neutral-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {name}
                                </span>
                                {description && (
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{description}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge
                                variant="secondary"
                                className="bg-neutral-100 dark:bg-neutral-900/70 backdrop-blur-sm border-0 text-sm font-medium"
                            >
                                {count.toLocaleString()} records
                            </Badge>

                            <motion.div
                                initial={{ x: 0, y: 0 }}
                                whileHover={{ x: 2, y: -2 }}
                                className="text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors"
                            >
                                <ArrowUpRight className="h-5 w-5" />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
