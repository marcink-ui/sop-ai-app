'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
    status: 'draft' | 'active' | 'archived' | 'pending' | 'approved' | 'rejected' | 'review' | 'generated' | 'audited' | 'completed';
    size?: 'sm' | 'md';
    showDot?: boolean;
}

const statusConfig = {
    draft: {
        bg: 'bg-muted',
        text: 'text-muted-foreground',
        dot: 'bg-neutral-500',
    },
    active: {
        bg: 'bg-green-100 dark:bg-green-500/10',
        text: 'text-green-600 dark:text-green-400',
        dot: 'bg-green-500',
    },
    archived: {
        bg: 'bg-muted',
        text: 'text-muted-foreground',
        dot: 'bg-neutral-400',
    },
    pending: {
        bg: 'bg-amber-100 dark:bg-amber-500/10',
        text: 'text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500',
    },
    approved: {
        bg: 'bg-green-100 dark:bg-green-500/10',
        text: 'text-green-600 dark:text-green-400',
        dot: 'bg-green-500',
    },
    rejected: {
        bg: 'bg-red-100 dark:bg-red-500/10',
        text: 'text-red-600 dark:text-red-400',
        dot: 'bg-red-500',
    },
    review: {
        bg: 'bg-purple-100 dark:bg-purple-500/10',
        text: 'text-purple-600 dark:text-purple-400',
        dot: 'bg-purple-500',
    },
    generated: {
        bg: 'bg-blue-100 dark:bg-blue-500/10',
        text: 'text-blue-600 dark:text-blue-400',
        dot: 'bg-blue-500',
    },
    audited: {
        bg: 'bg-orange-100 dark:bg-orange-500/10',
        text: 'text-orange-600 dark:text-orange-400',
        dot: 'bg-orange-500',
    },
    completed: {
        bg: 'bg-green-100 dark:bg-green-500/10',
        text: 'text-green-600 dark:text-green-400',
        dot: 'bg-green-500',
    },
};

const statusLabels: Record<string, string> = {
    draft: 'Wersja robocza',
    active: 'Aktywny',
    archived: 'Zarchiwizowany',
    pending: 'Oczekujący',
    approved: 'Zatwierdzony',
    rejected: 'Odrzucony',
    review: 'Do przeglądu',
    generated: 'Wygenerowany',
    audited: 'Audytowany',
    completed: 'Ukończony',
};

export function StatusBadge({ status, size = 'md', showDot = true }: StatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.draft;
    const label = statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
        >
            <Badge variant="outline" className={cn(config.bg, config.text, 'border-0 font-medium', size === 'sm' && 'text-xs px-2 py-0.5')}>
                {showDot && (
                    <motion.span
                        className={cn('mr-1.5 h-1.5 w-1.5 rounded-full inline-block', config.dot)}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
                {label}
            </Badge>
        </motion.div>
    );
}

interface RoleBadgeProps {
    role: 'META_ADMIN' | 'PARTNER' | 'SPONSOR' | 'PILOT' | 'MANAGER' | 'EXPERT' | 'CITIZEN_DEV';
    size?: 'sm' | 'md';
}

const roleConfig = {
    META_ADMIN: {
        bg: 'bg-gradient-to-r from-red-600 to-orange-500',
        text: 'text-white',
        label: 'Meta Admin',
    },
    PARTNER: {
        bg: 'bg-gradient-to-r from-violet-600 to-purple-500',
        text: 'text-white',
        label: 'Partner',
    },
    SPONSOR: {
        bg: 'bg-gradient-to-r from-amber-600 to-yellow-500',
        text: 'text-white',
        label: 'Sponsor',
    },
    PILOT: {
        bg: 'bg-gradient-to-r from-blue-600 to-cyan-500',
        text: 'text-white',
        label: 'Pilot',
    },
    MANAGER: {
        bg: 'bg-gradient-to-r from-purple-600 to-pink-500',
        text: 'text-white',
        label: 'Manager',
    },
    EXPERT: {
        bg: 'bg-gradient-to-r from-green-600 to-emerald-500',
        text: 'text-white',
        label: 'Właściciel Wiedzy',
    },
    CITIZEN_DEV: {
        bg: 'bg-gradient-to-r from-neutral-600 to-neutral-500',
        text: 'text-white',
        label: 'Citizen Dev',
    },
};

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
    const config = roleConfig[role] || roleConfig.CITIZEN_DEV;

    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                'inline-flex items-center font-medium rounded-full shadow-sm',
                config.bg,
                config.text,
                size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
            )}
        >
            {config.label}
        </motion.span>
    );
}
