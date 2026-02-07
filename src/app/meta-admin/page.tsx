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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const metaAdminModules = [
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
];

export default function MetaAdminPage() {
    const { data: session, status } = useSession();

    // Access check - only SPONSOR (owner) can access
    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    const userRole = session?.user?.role;
    if (userRole !== 'SPONSOR') {
        redirect('/dashboard');
    }

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
                    SPONSOR ONLY
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
                {metaAdminModules.map((module, index) => (
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

            {/* Quick Stats */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid gap-4 md:grid-cols-3"
            >
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-500">24</div>
                        <div className="text-sm text-muted-foreground">Aktywni użytkownicy</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-emerald-500">156</div>
                        <div className="text-sm text-muted-foreground">Wywołań AI (dziś)</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-purple-500">8</div>
                        <div className="text-sm text-muted-foreground">Aktywnych agentów</div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
