'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <motion.div
            className={`bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse ${className}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
    );
}

export function StatCardSkeleton() {
    return (
        <div className="relative overflow-hidden rounded-2xl border p-6 border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/80">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-10 w-24 mb-2" />
            <Skeleton className="h-4 w-20" />
        </div>
    );
}

export function DatabaseCardSkeleton() {
    return (
        <div className="relative overflow-hidden rounded-2xl border p-6 border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/80">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <tr className="border-b border-neutral-100 dark:border-neutral-800/50">
            <td className="px-4 py-4"><Skeleton className="h-5 w-40" /></td>
            <td className="px-4 py-4"><Skeleton className="h-5 w-24" /></td>
            <td className="px-4 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
            <td className="px-4 py-4"><Skeleton className="h-5 w-20" /></td>
        </tr>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Hero skeleton */}
            <div className="relative overflow-hidden rounded-2xl border p-8 border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-10 w-64 mb-2" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                    <Skeleton className="h-12 w-40 rounded-xl" />
                </div>
            </div>

            {/* Stats skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>

            {/* Database cards skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <DatabaseCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
