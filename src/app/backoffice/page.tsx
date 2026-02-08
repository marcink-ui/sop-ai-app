'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Settings2,
    Building2,
    Users,
    FileCode2,
    Bot,
    BarChart3,
    Shield,
    ChevronRight,
    Terminal,
    Database,
    Sparkles,
    Cpu,
    Plus,
    Key,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const backofficeModules = [
    {
        id: 'context',
        title: 'Kontekst Firmowy',
        description: 'Informacje o firmie, działach i pracownikach dla AI',
        icon: Building2,
        href: '/backoffice/context',
        stats: 'Dane firmowe',
        color: 'from-rose-500 to-pink-600',
        available: true,
    },
    {
        id: 'prompts',
        title: 'System Prompts',
        description: 'Edytuj prompty AI dla różnych kontekstów i ról',
        icon: FileCode2,
        href: '/backoffice/prompts',
        stats: '4 prompty',
        color: 'from-violet-500 to-purple-600',
        available: true,
    },
    {
        id: 'ai-models',
        title: 'Modele AI',
        description: 'Konfiguracja providerów i routingu modeli',
        icon: Cpu,
        href: '/backoffice/ai-models',
        stats: 'Routing AI',
        color: 'from-indigo-500 to-violet-600',
        available: true,
    },
    {
        id: 'ai-keys',
        title: 'AI Keys & Usage',
        description: 'Przydzielaj klucze AI klientom i monitoruj zużycie',
        icon: Key,
        href: '/backoffice/ai-keys',
        stats: 'Meta Admin',
        color: 'from-violet-500 to-fuchsia-600',
        available: true,
    },
    {
        id: 'transcript-processor',
        title: 'Transcript Processor',
        description: 'AI ekstrakcja SOPs, Ról i Value Chains z transkrypcji',
        icon: FileCode2,
        href: '/backoffice/transcript-processor',
        stats: 'Nowe!',
        color: 'from-fuchsia-500 to-pink-600',
        available: true,
    },
    {
        id: 'companies',
        title: 'Firmy',
        description: 'Zarządzaj organizacjami i multi-tenancy',
        icon: Building2,
        href: '/backoffice/companies',
        stats: '1 firma',
        color: 'from-blue-500 to-cyan-600',
        available: true,
    },
    {
        id: 'users',
        title: 'Użytkownicy',
        description: 'Zarządzaj kontami i rolami użytkowników',
        icon: Users,
        href: '/backoffice/users',
        stats: '12 użytkowników',
        color: 'from-emerald-500 to-teal-600',
        available: true,
    },
];

const systemStats = [
    { label: 'SOPs', value: '17', change: '+3 ten tydzień', color: 'text-violet-500' },
    { label: 'Aktywne sesje', value: '8', change: 'teraz', color: 'text-emerald-500' },
    { label: 'Tokeny AI (dziś)', value: '45K', change: '$0.12', color: 'text-blue-500' },
    { label: 'Wnioski Rady', value: '4', change: '1 oczekujący', color: 'text-amber-500' },
];

export default function BackofficePage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Settings2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Backoffice</h1>
                            <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400">
                                Admin
                            </Badge>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Panel administracyjny VantageOS
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-neutral-600 dark:text-neutral-400">
                        <Database className="h-4 w-4 mr-2" />
                        Baza danych
                    </Button>
                    <Button variant="outline" size="sm" className="text-neutral-600 dark:text-neutral-400">
                        <Terminal className="h-4 w-4 mr-2" />
                        Logi
                    </Button>
                </div>
            </div>

            {/* System Stats - Single row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {systemStats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="bg-white/50 dark:bg-neutral-900/50 border-neutral-200/50 dark:border-neutral-800/50">
                            <CardContent className="p-4">
                                <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</div>
                                <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{stat.change}</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Modules - 2 Column Grid */}
            <div>
                <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3 uppercase tracking-wide">
                    Moduły
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {backofficeModules.map((module, index) => (
                        <motion.div
                            key={module.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                        >
                            <Link href={module.href}>
                                <Card className={cn(
                                    "group cursor-pointer transition-all duration-200",
                                    "hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700",
                                    "bg-white dark:bg-neutral-900/80",
                                    "border-neutral-200 dark:border-neutral-800"
                                )}>
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className={cn(
                                            "h-11 w-11 rounded-xl flex items-center justify-center shadow-sm",
                                            `bg-gradient-to-br ${module.color}`
                                        )}>
                                            <module.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-neutral-900 dark:text-white">
                                                    {module.title}
                                                </p>
                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                    {module.stats}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                                                {module.description}
                                            </p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <Card className="bg-neutral-50/50 dark:bg-neutral-900/30 border-neutral-200/50 dark:border-neutral-800/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        Szybkie akcje
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="text-neutral-600 dark:text-neutral-400">
                            <Shield className="h-4 w-4 mr-2" />
                            Sprawdź uprawnienia
                        </Button>
                        <Button variant="outline" size="sm" className="text-neutral-600 dark:text-neutral-400">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Raport zużycia
                        </Button>
                        <Button variant="outline" size="sm" className="text-neutral-600 dark:text-neutral-400">
                            <Bot className="h-4 w-4 mr-2" />
                            Test promptu AI
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
