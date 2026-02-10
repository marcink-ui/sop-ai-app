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
    Plus,
    ArrowUpRight,
    ArrowRight,
    Zap,
    TrendingUp,
    Settings2,
    Sparkles,
    BarChart3,
    Clock,
    Activity,
    Target,
    Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useChat } from '@/components/ai-chat/chat-provider';
import { AISummaryCard } from '@/components/dashboard/ai-summary-card';
import { StatCard } from '@/components/ui/stat-card';
import { cn } from '@/lib/utils';

interface DashboardClientProps {
    user: {
        name: string;
        email: string;
        role: 'META_ADMIN' | 'PARTNER' | 'SPONSOR' | 'PILOT' | 'MANAGER' | 'EXPERT' | 'CITIZEN_DEV';
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

// Quick action card data
const QUICK_ACTIONS = [
    {
        label: 'Nowy SOP',
        description: 'Utwórz procedurę',
        href: '/sops/new',
        icon: Plus,
        gradient: 'from-blue-500 to-blue-600',
        shadow: 'shadow-blue-500/20',
    },
    {
        label: 'Analiza MUDA',
        description: 'Wykryj straty',
        href: '/muda',
        icon: Search,
        gradient: 'from-orange-500 to-red-500',
        shadow: 'shadow-orange-500/20',
    },
    {
        label: 'AI Canvas',
        description: 'Wizualny panel',
        href: '/canvas',
        icon: BarChart3,
        gradient: 'from-violet-500 to-purple-600',
        shadow: 'shadow-violet-500/20',
    },
    {
        label: 'Kaizen',
        description: 'Ciągłe doskonalenie',
        href: '/kaizen',
        icon: Lightbulb,
        gradient: 'from-amber-500 to-yellow-500',
        shadow: 'shadow-amber-500/20',
    },
];

// Database modules
const MODULES = [
    { name: 'SOPs', href: '/sops', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', hoverBg: 'hover:bg-blue-500/5' },
    { name: 'AI Agents', href: '/agents', icon: Bot, color: 'text-purple-500', bg: 'bg-purple-500/10', hoverBg: 'hover:bg-purple-500/5' },
    { name: 'MUDA', href: '/muda', icon: Search, color: 'text-orange-500', bg: 'bg-orange-500/10', hoverBg: 'hover:bg-orange-500/5' },
    { name: 'Zespół', href: '/roles', icon: Users, color: 'text-green-500', bg: 'bg-green-500/10', hoverBg: 'hover:bg-green-500/5' },
    { name: 'Łańcuch', href: '/value-chain', icon: GitBranch, color: 'text-cyan-500', bg: 'bg-cyan-500/10', hoverBg: 'hover:bg-cyan-500/5' },
    { name: 'Rada', href: '/council', icon: Scale, color: 'text-amber-500', bg: 'bg-amber-500/10', hoverBg: 'hover:bg-amber-500/5' },
];

export function DashboardClient({ user, stats, recentSops }: DashboardClientProps) {
    const { openChat, toggleChat } = useChat();

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto">
            {/* Hero AI Summary */}
            <AISummaryCard
                user={user}
                stats={{
                    sops: stats.sops,
                    agents: stats.agents,
                    mudaReports: stats.mudaReports,
                    totalSavings: stats.totalSavings,
                }}
                onOpenChat={openChat}
            />

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Procedury SOP"
                    value={stats.sops}
                    icon={FileText}
                    color="blue"
                    delay={0.1}
                    trend={{ value: 'aktywne', direction: 'up' }}
                />
                <StatCard
                    title="Agenci AI"
                    value={stats.agents}
                    icon={Bot}
                    color="purple"
                    delay={0.15}
                    trend={{ value: 'gotowe', direction: 'up' }}
                />
                <StatCard
                    title="Raporty MUDA"
                    value={stats.mudaReports}
                    icon={Search}
                    color="orange"
                    delay={0.2}
                />
                <StatCard
                    title="Oszczędności"
                    value={`${Math.round(stats.totalSavings / 60)}h`}
                    icon={TrendingUp}
                    color="green"
                    delay={0.25}
                    description="Zaoszczędzony czas"
                />
            </div>

            {/* Quick Actions + AI Insight Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wide">
                            Szybkie akcje
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {QUICK_ACTIONS.map((action, i) => (
                            <motion.div
                                key={action.href}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                            >
                                <Link href={action.href}>
                                    <div className="group relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                                        <div className={cn(
                                            'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-md mb-3',
                                            action.gradient,
                                            action.shadow
                                        )}>
                                            <action.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <p className="font-semibold text-sm text-neutral-900 dark:text-white">{action.label}</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{action.description}</p>
                                        <ArrowRight className="absolute top-4 right-4 h-4 w-4 text-neutral-300 dark:text-neutral-700 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* AI Insight Panel */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-violet-950/30 dark:via-purple-950/20 dark:to-indigo-950/20 p-5 flex flex-col"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">AI Insights</h3>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 flex-1 leading-relaxed">
                        Masz <span className="font-semibold text-violet-600 dark:text-violet-400">{stats.sops} procedur</span> i{' '}
                        <span className="font-semibold text-purple-600 dark:text-purple-400">{stats.agents} agentów AI</span>.
                        Zapytaj AI o rekomendacje optymalizacji procesów lub analizę strat MUDA.
                    </p>
                    <Button
                        onClick={toggleChat}
                        className="w-full gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 shadow-lg"
                    >
                        <Sparkles className="h-4 w-4" />
                        Zapytaj AI
                    </Button>
                </motion.div>
            </div>

            {/* Modules Grid + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Module Shortcuts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 p-5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-neutral-500" />
                            <h3 className="font-semibold text-sm text-neutral-900 dark:text-white uppercase tracking-wide">Moduły</h3>
                        </div>
                        <span className="text-xs text-neutral-400">{MODULES.length} aktywnych</span>
                    </div>
                    <div className="space-y-1">
                        {MODULES.map((mod, i) => (
                            <motion.div
                                key={mod.href}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.55 + i * 0.03 }}
                            >
                                <Link
                                    href={mod.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                                        'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                                        'group'
                                    )}
                                >
                                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', mod.bg)}>
                                        <mod.icon className={cn('h-4 w-4', mod.color)} />
                                    </div>
                                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                                        {mod.name}
                                    </span>
                                    <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-neutral-300 dark:text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="lg:col-span-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 overflow-hidden"
                >
                    <div className="flex items-center justify-between p-5 pb-0">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-neutral-500" />
                            <h3 className="font-semibold text-sm text-neutral-900 dark:text-white uppercase tracking-wide">
                                Ostatnia aktywność
                            </h3>
                        </div>
                        <Link
                            href="/sops"
                            className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            Zobacz wszystkie
                            <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {recentSops.length > 0 ? (
                        <div className="p-5">
                            <div className="rounded-lg border border-neutral-100 dark:border-neutral-800/50 overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Tytuł</th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Dział</th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Data</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentSops.slice(0, 5).map((sop, index) => (
                                            <motion.tr
                                                key={sop.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.6 + index * 0.05 }}
                                                className="border-b last:border-0 transition-colors cursor-pointer border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20"
                                            >
                                                <td className="px-4 py-3">
                                                    <Link href={`/sops/${sop.id}`}>
                                                        <span className="font-medium text-sm text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                            {sop.title}
                                                        </span>
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 hidden sm:table-cell">
                                                    {sop.department?.name || '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge status={sop.status as 'draft' | 'active' | 'approved' | 'generated'} size="sm" />
                                                </td>
                                                <td className="px-4 py-3 text-xs text-neutral-400 hidden md:table-cell">
                                                    {new Date(sop.createdAt).toLocaleDateString('pl-PL')}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-4"
                            >
                                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </motion.div>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Brak procedur SOP</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm mx-auto">
                                Utwórz pierwszą procedurę, aby rozpocząć transformację.
                            </p>
                            <Link href="/sops/new">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 gap-2">
                                    <Plus className="h-4 w-4" />
                                    Utwórz pierwszy SOP
                                </Button>
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
