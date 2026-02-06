'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    FileText,
    Bot,
    Search,
    Users,
    GitBranch,
    Scale,
    Clock,
    Plus,
    Sparkles,
    ArrowUpRight,
    Zap,
    Building2,
    TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { DatabaseCard } from '@/components/ui/database-card';
import { StatusBadge, RoleBadge } from '@/components/ui/status-badge';

interface DashboardClientProps {
    user: {
        name: string;
        email: string;
        role: 'SPONSOR' | 'PILOT' | 'MANAGER' | 'EXPERT' | 'CITIZEN_DEV';
    };
    stats: {
        sops: number;
        agents: number;
        mudaReports: number;
        council: number;
        departments: number;
        users: number;
        totalSavings: number;
    };
    recentSops: Array<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        department: { name: string } | null;
        createdBy: { name: string | null } | null;
    }>;
}

export function DashboardClient({ user, stats, recentSops }: DashboardClientProps) {
    const databases = [
        { name: 'SOPs', href: '/sops', icon: FileText, count: stats.sops, description: 'Standard Operating Procedures', color: 'blue' as const },
        { name: 'AI Agents', href: '/agents', icon: Bot, count: stats.agents, description: 'Intelligent automation agents', color: 'purple' as const },
        { name: 'MUDA Reports', href: '/muda', icon: Search, count: stats.mudaReports, description: 'Waste analysis reports', color: 'orange' as const },
        { name: 'Roles Registry', href: '/roles', icon: Users, count: stats.users, description: 'Team structure & assignments', color: 'green' as const },
        { name: 'Value Chain', href: '/value-chain', icon: GitBranch, count: stats.departments, description: 'Process flow mapping', color: 'cyan' as const },
        { name: 'Council', href: '/council', icon: Scale, count: stats.council, description: 'Governance & approvals', color: 'amber' as const },
    ];

    return (
        <div className="space-y-8">
            {/* Premium Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative overflow-hidden rounded-3xl border p-8 border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-blue-50 dark:border-neutral-800 dark:bg-gradient-to-br dark:from-neutral-900 dark:via-neutral-900 dark:to-blue-950/30"
            >
                {/* Animated gradient orbs */}
                <motion.div
                    animate={{
                        x: [0, 20, 0],
                        y: [0, -10, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"
                />
                <motion.div
                    animate={{
                        x: [0, -15, 0],
                        y: [0, 15, 0],
                        scale: [1, 1.15, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"
                />

                <div className="relative flex items-center justify-between">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-3 mb-4"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl shadow-blue-500/25">
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">VantageOS</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <RoleBadge role={user.role} size="sm" />
                                </div>
                            </div>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl font-bold text-neutral-900 dark:text-white mb-2"
                        >
                            Witaj, {user.name}!
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-neutral-600 dark:text-neutral-400 max-w-lg"
                        >
                            Transformuj Standard Operating Procedures w inteligentne AI Agents.
                            Automatyzuj workflow i eliminuj marnotrawstwo.
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Link href="/sops/new">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-105 text-lg px-8"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Nowy SOP
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Procedury SOP"
                    value={stats.sops}
                    icon={FileText}
                    trend={{ value: '+12%', direction: 'up' }}
                    color="blue"
                    delay={0}
                />
                <StatCard
                    title="AI Agents"
                    value={stats.agents}
                    icon={Bot}
                    trend={{ value: '+5', direction: 'up' }}
                    color="purple"
                    delay={0.1}
                />
                <StatCard
                    title="Raporty MUDA"
                    value={stats.mudaReports}
                    icon={Search}
                    trend={{ value: '+3', direction: 'up' }}
                    color="orange"
                    delay={0.2}
                />
                <StatCard
                    title="Oszczędności"
                    value={`${Math.round(stats.totalSavings / 60)}h`}
                    icon={Clock}
                    trend={{ value: '+18%', direction: 'up' }}
                    description="miesięcznie"
                    color="green"
                    delay={0.3}
                />
            </div>

            {/* Database Navigation */}
            <div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3 mb-4"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                        <Zap className="h-4 w-4 text-amber-500 dark:text-yellow-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Bazy danych</h2>
                </motion.div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {databases.map((db, index) => (
                        <DatabaseCard key={db.href} {...db} delay={0.5 + index * 0.1} />
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            {recentSops.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                <TrendingUp className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Ostatnia aktywność</h2>
                        </div>
                        <Link
                            href="/sops"
                            className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                        >
                            Zobacz wszystkie
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="rounded-2xl border overflow-hidden backdrop-blur-sm border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/50">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/80">
                                    <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Tytuł</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Dział</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSops.map((sop, index) => (
                                    <motion.tr
                                        key={sop.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.9 + index * 0.05 }}
                                        className="border-b last:border-0 transition-colors cursor-pointer border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800/50 dark:hover:bg-neutral-800/30"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                {sop.title}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                            {sop.department?.name || '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={sop.status as 'draft' | 'active'} />
                                        </td>
                                        <td className="px-6 py-4 text-neutral-500 text-sm">
                                            {new Date(sop.createdAt).toLocaleDateString('pl-PL')}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Empty State */}
            {recentSops.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center py-16"
                >
                    <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-6"
                    >
                        <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">Brak procedur SOP</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
                        Utwórz pierwszą procedurę operacyjną, aby rozpocząć transformację workflow w inteligentne AI Agents.
                    </p>
                    <Link href="/sops/new">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25">
                            <Plus className="mr-2 h-5 w-5" />
                            Utwórz pierwszy SOP
                        </Button>
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
