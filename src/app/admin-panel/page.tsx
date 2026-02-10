'use client';

import { useSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    Shield,
    Key,
    Newspaper,
    Library,
    Activity,
    FileText,
    Users,
    Building2,
    BarChart3,
    ChevronRight,
    Globe,
    Terminal,
    Sparkles,
    Bell,
    Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const adminModules = [
    {
        id: 'api-keys',
        title: 'API Keys & Usage',
        description: 'Zarządzaj kluczami API do narzędzi i providerów AI',
        icon: Key,
        href: '/backoffice/ai-keys',
        stats: '24 klucze',
        color: 'from-violet-500 to-fuchsia-600',
    },
    {
        id: 'resources',
        title: 'Resources Hub',
        description: 'Zasoby, prompty, agenci, skille i newslettery w jednym miejscu',
        icon: Library,
        href: '/resources',
        stats: '47 zasobów',
        color: 'from-emerald-500 to-teal-600',
    },
    {
        id: 'organizations',
        title: 'Wszystkie Organizacje',
        description: 'Zarządzaj firmami, limitami i subskrypcjami',
        icon: Building2,
        href: '/backoffice/companies',
        stats: '12 firm',
        color: 'from-sky-500 to-blue-600',
    },
    {
        id: 'users',
        title: 'Wszyscy Użytkownicy',
        description: 'Konta, role, uprawnienia na poziomie platformy',
        icon: Users,
        href: '/backoffice/users',
        stats: '156 kont',
        color: 'from-amber-500 to-orange-600',
    },
    {
        id: 'system-health',
        title: 'Stan Systemu',
        description: 'Zdrowie serwisów, kolejki, metryki wydajności',
        icon: Activity,
        href: '/admin-panel/health',
        stats: 'Healthy',
        color: 'from-green-500 to-emerald-600',
    },
    {
        id: 'audit-log',
        title: 'Audit Log',
        description: 'Pełna historia zdarzeń i zmian na platformie',
        icon: FileText,
        href: '/admin-panel/audit',
        stats: '2.4K events',
        color: 'from-rose-500 to-pink-600',
    },
    {
        id: 'notifications',
        title: 'Powiadomienia Globalne',
        description: 'Bannery, alerty i push notifications dla firm',
        icon: Bell,
        href: '/admin-panel/notifications',
        stats: '2 aktywne',
        color: 'from-indigo-500 to-violet-600',
    },
    {
        id: 'ux-analysis',
        title: 'UX Analysis',
        description: 'Heatmapy, predykcje użytkowników i nagrania sesji',
        icon: Activity,
        href: '/admin-panel/ux-analysis',
        stats: 'Beta',
        color: 'from-pink-500 to-rose-600',
    },
];

const platformStats = [
    { label: 'Organizacje', value: '12', change: '+2 ten miesiąc', color: 'text-blue-500' },
    { label: 'Aktywni Użytkownicy', value: '156', change: '+18 ten tydzień', color: 'text-emerald-500' },
    { label: 'Tokeny AI (MTD)', value: '$847', change: '-12% vs prev', color: 'text-violet-500' },
    { label: 'Uptime', value: '99.9%', change: '30d rolling', color: 'text-green-500' },
];

export default function AdminPanelPage() {
    const { data: session, isPending } = useSession();

    if (isPending) {
        return (
            <div className="flex items-center justify-center h-64">
                <Shield className="h-8 w-8 animate-pulse text-red-500" />
            </div>
        );
    }

    if (session?.user?.role !== 'META_ADMIN') {
        redirect('/');
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                        <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Admin Panel</h1>
                            <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                                Meta Admin
                            </Badge>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Zarządzanie platformą VantageOS
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-neutral-600 dark:text-neutral-400">
                        <Terminal className="h-4 w-4 mr-2" />
                        Logi Systemu
                    </Button>
                    <Button variant="outline" size="sm" className="text-neutral-600 dark:text-neutral-400">
                        <Globe className="h-4 w-4 mr-2" />
                        Status API
                    </Button>
                </div>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {platformStats.map((stat, index) => (
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

            {/* Admin Modules Grid */}
            <div>
                <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3 uppercase tracking-wide">
                    Moduły Administracyjne
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {adminModules.map((module, index) => (
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
                        Szybkie Akcje
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="text-neutral-600 dark:text-neutral-400">
                            <Send className="h-4 w-4 mr-2" />
                            Nowy Newsletter
                        </Button>
                        <Button variant="outline" size="sm" className="text-neutral-600 dark:text-neutral-400">
                            <Building2 className="h-4 w-4 mr-2" />
                            Dodaj Organizację
                        </Button>
                        <Button variant="outline" size="sm" className="text-neutral-600 dark:text-neutral-400">
                            <Key className="h-4 w-4 mr-2" />
                            Generuj API Key
                        </Button>
                        <Button variant="outline" size="sm" className="text-neutral-600 dark:text-neutral-400">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Raport Zużycia AI
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
