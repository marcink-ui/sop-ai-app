'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Settings as SettingsIcon,
    User,
    Globe,
    Key,
    Plug,
    Palette,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsTabs = [
    {
        id: 'profile',
        label: 'Profil',
        description: 'Dane osobowe i kontekst AI',
        icon: User,
        href: '/settings/profile'
    },
    {
        id: 'style',
        label: 'Styl interfejsu',
        description: 'Linear / Notion / Hero',
        icon: Palette,
        href: '/settings/style'
    },
    {
        id: 'language',
        label: 'Język / Language',
        description: 'Polski / English',
        icon: Globe,
        href: '/settings/language'
    },
    {
        id: 'integrations',
        label: 'Integracje',
        description: 'Połączenia z zewnętrznymi narzędziami',
        icon: Plug,
        href: '/settings/integrations'
    },
    {
        id: 'api-keys',
        label: 'Klucze API',
        description: 'Tokeny dostępu do usług AI',
        icon: Key,
        href: '/settings/api-keys'
    }
];

export default function SettingsPage() {
    const pathname = usePathname();

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3"
            >
                <div className="rounded-xl bg-gradient-to-br from-slate-500/20 to-zinc-500/20 p-3 border border-slate-500/20">
                    <SettingsIcon className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Ustawienia</h1>
                    <p className="text-sm text-muted-foreground">Zarządzaj swoim kontem i preferencjami</p>
                </div>
            </motion.div>

            {/* Settings Cards Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid gap-4 md:grid-cols-2"
            >
                {settingsTabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = pathname === tab.href;

                    return (
                        <motion.div
                            key={tab.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                        >
                            <Link href={tab.href}>
                                <div
                                    className={cn(
                                        'group relative rounded-xl border p-5 transition-all duration-300',
                                        'hover:border-violet-500/30 hover:bg-card/80',
                                        isActive
                                            ? 'border-violet-500/50 bg-violet-500/5'
                                            : 'border-border bg-card/50'
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                'rounded-lg p-3 transition-colors',
                                                isActive
                                                    ? 'bg-violet-500/20'
                                                    : 'bg-muted/50 group-hover:bg-violet-500/10'
                                            )}>
                                                <Icon className={cn(
                                                    'h-5 w-5 transition-colors',
                                                    isActive
                                                        ? 'text-violet-400'
                                                        : 'text-muted-foreground group-hover:text-violet-400'
                                                )} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground">{tab.label}</h3>
                                                <p className="text-sm text-muted-foreground">{tab.description}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-violet-400 transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Quick Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="rounded-xl border border-border bg-card/50 p-5"
            >
                <h3 className="text-sm font-medium text-foreground mb-3">Informacje o koncie</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Organizacja</span>
                        <span className="text-sm font-medium text-foreground">VantageOS Demo</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Rola</span>
                        <span className="text-sm font-medium text-foreground">Administrator</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Plan</span>
                        <span className="text-sm font-medium text-foreground">Enterprise</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Ostatnie logowanie</span>
                        <span className="text-sm font-medium text-foreground">Dzisiaj, 20:48</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
