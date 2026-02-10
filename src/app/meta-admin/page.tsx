'use client';

import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import {
    Wrench,
    Building2,
    Users,
    BarChart3,
    Shield,
    ChevronRight,
    Bot,
    Key,
    Globe,
    Activity,
    Server,
    Database,
    AlertTriangle,
    CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const platformStats = [
    { label: 'Organizacje', value: '12', icon: Building2, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: 'Aktywni użytkownicy', value: '156', icon: Users, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
    { label: 'Tokeny AI (dziś)', value: '2.4M', icon: Bot, color: 'text-violet-500', bgColor: 'bg-violet-500/10' },
    { label: 'Uptime', value: '99.9%', icon: Activity, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
];

const adminModules = [
    {
        id: 'organizations',
        title: 'Wszystkie Organizacje',
        description: 'Zarządzaj firmami klientów i partnerów',
        icon: Building2,
        href: '/meta-admin/organizations',
        stats: '12 firm',
        color: 'from-blue-500 to-cyan-600',
    },
    {
        id: 'users',
        title: 'Wszyscy Użytkownicy',
        description: 'Globalne zarządzanie kontami',
        icon: Users,
        href: '/meta-admin/users',
        stats: '156 kont',
        color: 'from-emerald-500 to-teal-600',
    },
    {
        id: 'ai-usage',
        title: 'Zużycie AI',
        description: 'Globalne statystyki i limity',
        icon: BarChart3,
        href: '/meta-admin/ai-usage',
        stats: '$847 MTD',
        color: 'from-violet-500 to-purple-600',
    },
    {
        id: 'ai-keys',
        title: 'Klucze API',
        description: 'Zarządzaj kluczami AI wszystkich klientów',
        icon: Key,
        href: '/backoffice/ai-keys',
        stats: '24 klucze',
        color: 'from-amber-500 to-orange-600',
    },
    {
        id: 'system',
        title: 'Stan Systemu',
        description: 'Monitoring infrastruktury',
        icon: Server,
        href: '/meta-admin/system',
        stats: 'Healthy',
        color: 'from-rose-500 to-pink-600',
    },
    {
        id: 'audit',
        title: 'Audit Log',
        description: 'Historia wszystkich operacji',
        icon: Shield,
        href: '/meta-admin/audit',
        stats: '2.4K zdarzeń',
        color: 'from-indigo-500 to-violet-600',
    },
];

const systemHealth = [
    { name: 'API', status: 'healthy', latency: '45ms' },
    { name: 'Database', status: 'healthy', latency: '12ms' },
    { name: 'AI Providers', status: 'healthy', latency: '230ms' },
    { name: 'Storage', status: 'warning', latency: '89ms' },
];

export default function MetaAdminPage() {
    const { data: session, isPending } = useSession();

    // Require META_ADMIN role
    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
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
                        <Wrench className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Meta Admin</h1>
                            <Badge variant="destructive" className="bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">
                                Platform Owner
                            </Badge>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Panel właściciela platformy VantageOS
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Globe className="h-4 w-4 mr-2" />
                        Status Page
                    </Button>
                    <Button variant="outline" size="sm">
                        <Database className="h-4 w-4 mr-2" />
                        DB Admin
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
                                <div className="flex items-center gap-3">
                                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", stat.bgColor)}>
                                        <stat.icon className={cn("h-5 w-5", stat.color)} />
                                    </div>
                                    <div>
                                        <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
                                        <div className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* System Health */}
            <Card className="bg-white/50 dark:bg-neutral-900/50 border-neutral-200/50 dark:border-neutral-800/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-500" />
                        Stan Systemu
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {systemHealth.map((service) => (
                            <div
                                key={service.name}
                                className="flex items-center gap-2 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50"
                            >
                                {service.status === 'healthy' ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                )}
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-neutral-900 dark:text-white">{service.name}</div>
                                    <div className="text-xs text-neutral-500">{service.latency}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Admin Modules */}
            <div>
                <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3 uppercase tracking-wide">
                    Moduły Administracyjne
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
        </div>
    );
}
