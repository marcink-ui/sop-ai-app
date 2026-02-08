'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    Wrench,
    Newspaper,
    Code2,
    Users,
    Shield,
    FileText,
    Activity,
    Database,
    ChevronRight,
    Settings,
    Bell,
    Lock,
    MousePointer2,
    RefreshCw,
    TrendingUp,
    Bot,
    Zap,
    MessageSquare,
    Key,
    Palette,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { hasMetaAdminAccess } from '@/lib/auth/system-admin';

const metaAdminModules = [
    {
        id: 'analytics',
        title: 'UX Analytics',
        description: 'Heatmapy, eye-tracking i analiza zachowań użytkowników',
        icon: MousePointer2,
        href: '/meta-admin/analytics',
        color: 'from-pink-500 to-rose-500',
        status: 'active',
        stats: 'Live tracking',
    },
    {
        id: 'newsletter',
        title: 'Newsletter Publisher',
        description: 'Tworzenie i publikacja wewnętrznych newsletterów dla zespołu',
        icon: Newspaper,
        href: '/meta-admin/newsletter',
        color: 'from-teal-500 to-cyan-500',
        status: 'active',
        stats: 'Publikuj newsy',
    },
    {
        id: 'chat-history',
        title: 'Historia Chat AI',
        description: 'Przeglądaj wszystkie rozmowy z AI w organizacji',
        icon: MessageSquare,
        href: '/meta-admin/chat-history',
        color: 'from-blue-500 to-cyan-500',
        status: 'active',
        stats: 'Archiwum',
    },
    {
        id: 'prompts',
        title: 'System Prompts Master',
        description: 'Zarządzanie głównymi promptami AI używanymi przez agentów',
        icon: Code2,
        href: '/meta-admin/prompts',
        color: 'from-purple-500 to-indigo-500',
        status: 'active',
        stats: 'Edytuj prompty',
    },
    {
        id: 'users',
        title: 'Zarządzanie Użytkownikami',
        description: 'Dodawanie, edycja i usuwanie użytkowników systemu',
        icon: Users,
        href: '/meta-admin/users',
        color: 'from-blue-500 to-sky-500',
        status: 'active',
        stats: 'Użytkownicy',
    },
    {
        id: 'permissions',
        title: 'Uprawnienia Działowe',
        description: 'Konfiguracja dostępu do działów dla różnych użytkowników',
        icon: Shield,
        href: '/meta-admin/permissions',
        color: 'from-amber-500 to-orange-500',
        status: 'planned',
        stats: 'Wkrótce',
    },
    {
        id: 'docs',
        title: 'Dokumentacja',
        description: 'Import i synchronizacja dokumentacji systemowej',
        icon: FileText,
        href: '/meta-admin/docs',
        color: 'from-emerald-500 to-green-500',
        status: 'active',
        stats: 'Sync docs',
    },
    {
        id: 'logs',
        title: 'Logi Systemowe',
        description: 'Monitorowanie błędów, API i wywołań AI',
        icon: Activity,
        href: '/meta-admin/logs',
        color: 'from-red-500 to-rose-500',
        status: 'active',
        stats: 'Monitor',
    },
    {
        id: 'backup',
        title: 'Backup & Restore',
        description: 'Kopie zapasowe bazy danych i konfiguracji',
        icon: Database,
        href: '/meta-admin/backup',
        color: 'from-slate-500 to-gray-500',
        status: 'planned',
        stats: 'Wkrótce',
    },
    {
        id: 'features',
        title: 'Feature Flags',
        description: 'Włączanie i wyłączanie funkcji systemu',
        icon: Settings,
        href: '/meta-admin/features',
        color: 'from-violet-500 to-purple-500',
        status: 'active',
        stats: 'Konfiguruj',
    },
    {
        id: 'api-management',
        title: 'API & MCP',
        description: 'Klucze API i serwery MCP',
        icon: Key,
        href: '/meta-admin/api-management',
        color: 'from-purple-500 to-indigo-500',
        status: 'active',
        stats: 'Integracje',
    },
    {
        id: 'styling',
        title: 'App Styling',
        description: 'Dostosuj wygląd aplikacji',
        icon: Palette,
        href: '/meta-admin/styling',
        color: 'from-pink-500 to-rose-500',
        status: 'active',
        stats: 'Personalizuj',
    },
];

export default function MetaAdminPage() {
    const { data: session, status } = useSession();
    const { stats, isLoading: statsLoading, refresh } = useAnalytics({ refreshInterval: 30000 });

    // Access check - only SPONSOR (owner) can access
    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    const userEmail = session?.user?.email;

    // Check if user has system-level access to Meta Admin
    // This is separate from company roles (Sponsor, Pilot, etc.)
    if (!hasMetaAdminAccess(userEmail)) {
        redirect('/dashboard');
    }

    // System admin has access to all modules
    const accessibleModules = metaAdminModules;

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                        <Wrench className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Meta Admin</h1>
                        <p className="text-sm text-muted-foreground">
                            Panel właściciela VantageOS
                        </p>
                    </div>
                </div>
                <Badge variant="destructive" className="gap-1">
                    <Lock className="h-3 w-3" />
                    SYSTEM ADMIN
                </Badge>
            </motion.div>

            {/* Warning Banner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4"
            >
                <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-amber-500" />
                    <div>
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            Panel Administracyjny
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Zmiany tutaj wpływają na cały system. Działaj ostrożnie.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Modules Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {accessibleModules.map((module, index) => (
                    <motion.div
                        key={module.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                    >
                        <Link href={module.href}>
                            <Card className={`group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/50 ${module.status === 'planned' ? 'opacity-60' : ''}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center shadow-md`}>
                                            <module.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </div>
                                    <CardTitle className="text-base mt-3">{module.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <CardDescription className="text-xs line-clamp-2">
                                        {module.description}
                                    </CardDescription>
                                    <div className="mt-3 flex items-center justify-between">
                                        <Badge
                                            variant={module.status === 'active' ? 'secondary' : 'outline'}
                                            className="text-[10px]"
                                        >
                                            {module.stats}
                                        </Badge>
                                        {module.status === 'planned' && (
                                            <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/50">
                                                Planowane
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Quick Stats - Live Data */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Statystyki systemu</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={refresh}
                        disabled={statsLoading}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
                        Odśwież
                    </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-500">
                                        {statsLoading ? '...' : (stats?.counters.activeUsers ?? 0)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Aktywni użytkownicy</div>
                                </div>
                                {stats?.trends.usersChange && (
                                    <Badge variant="secondary" className="ml-auto text-xs gap-1">
                                        <TrendingUp className="h-3 w-3" />
                                        {stats.trends.usersChange}
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                                    <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-emerald-500">
                                        {statsLoading ? '...' : (stats?.counters.aiCallsToday ?? 0)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Wywołań AI (dziś)</div>
                                </div>
                                {stats?.trends.aiCallsChange && (
                                    <Badge variant="secondary" className="ml-auto text-xs gap-1">
                                        <TrendingUp className="h-3 w-3" />
                                        {stats.trends.aiCallsChange}
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/20">
                                    <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-purple-500">
                                        {statsLoading ? '...' : (stats?.counters.totalAgents ?? 0)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Aktywnych agentów</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                                    <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-amber-500">
                                        {statsLoading ? '...' : (stats?.counters.totalSOPs ?? 0)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Aktywnych SOP</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Engagement Score */}
                {stats?.engagement && (
                    <Card className={`border-l-4 ${stats.engagement.level === 'high' ? 'border-l-emerald-500' :
                        stats.engagement.level === 'medium' ? 'border-l-amber-500' :
                            'border-l-red-500'
                        }`}>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium">Engagement Score</div>
                                    <div className="text-xs text-muted-foreground">Poziom zaangażowania użytkowników</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{stats.engagement.score}%</div>
                                    <Badge
                                        variant={stats.engagement.level === 'high' ? 'default' : 'secondary'}
                                        className={`text-xs ${stats.engagement.level === 'high' ? 'bg-emerald-500' : ''}`}
                                    >
                                        {stats.engagement.level === 'high' ? 'Wysoki' :
                                            stats.engagement.level === 'medium' ? 'Średni' : 'Niski'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </motion.div>
        </div>
    );
}
