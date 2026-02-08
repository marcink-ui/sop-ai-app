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
    Zap,
    TrendingUp,
    Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatabaseCard } from '@/components/ui/database-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { QuickTasksWidget } from '@/components/dashboard/quick-tasks-widget';
import { useChat } from '@/components/ai-chat/chat-provider';
import { DashboardEditProvider, useDashboardEdit } from '@/components/dashboard/dashboard-edit-provider';
import { PandyWidget } from '@/components/dashboard/pandy-widget';
import { WidgetContainer } from '@/components/dashboard/widget-container';
import { AISummaryCard } from '@/components/dashboard/ai-summary-card';

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

// Inner content component that uses the edit context
function DashboardContent({ user, stats, recentSops }: DashboardClientProps) {
    const { openChat } = useChat();
    const { isEditMode, toggleEditMode, widgets, updateWidget, hideWidget } = useDashboardEdit();

    // Get widget config by ID
    const getWidgetConfig = (id: string) => widgets.find(w => w.id === id);
    const isWidgetVisible = (id: string) => getWidgetConfig(id)?.visible ?? true;
    const getWidgetSize = (id: string) => getWidgetConfig(id)?.size ?? 'full';

    const databases = [
        { name: 'SOPs', href: '/sops', icon: FileText, count: stats.sops, description: 'Standard Operating Procedures', color: 'blue' as const },
        { name: 'AI Agents', href: '/agents', icon: Bot, count: stats.agents, description: 'Intelligent automation agents', color: 'purple' as const },
        { name: 'MUDA Reports', href: '/muda', icon: Search, count: stats.mudaReports, description: 'Waste analysis reports', color: 'orange' as const },
        { name: 'Roles Registry', href: '/roles', icon: Users, count: stats.users, description: 'Team structure & assignments', color: 'green' as const },
        { name: 'Value Chain', href: '/value-chain', icon: GitBranch, count: stats.departments, description: 'Process flow mapping', color: 'cyan' as const },
        { name: 'Council', href: '/council', icon: Scale, count: stats.council, description: 'Governance & approvals', color: 'amber' as const },
    ];

    return (
        <div className="space-y-6">
            {/* Edit Mode Toggle */}
            <div className="flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleEditMode}
                    className={`text-xs opacity-60 hover:opacity-100 transition-opacity ${isEditMode ? 'text-blue-600 dark:text-blue-400' : ''}`}
                >
                    <Settings2 className="h-3 w-3 mr-1" />
                    {isEditMode ? 'Zakończ edycję' : 'Edycja'}
                </Button>
            </div>

            {/* AI-First Hero Section */}
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

            {/* Main Grid Layout */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-6">
                {/* Databases - Full Width */}
                {isWidgetVisible('databases') && (
                    <WidgetContainer
                        id="databases"
                        title="Bazy danych"
                        icon={<FileText className="h-4 w-4" />}
                        size="full"
                        draggable={false}
                        removable={isEditMode}
                        onRemove={() => hideWidget('databases')}
                        onSizeChange={(size) => updateWidget('databases', { size })}
                        className="lg:col-span-6"
                    >
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {databases.map((db, index) => (
                                <DatabaseCard key={db.href} {...db} delay={0.1 + index * 0.05} />
                            ))}
                        </div>
                    </WidgetContainer>
                )}

                {/* Quick Tasks + Pandy Row */}
                {isWidgetVisible('quick-tasks') && (
                    <WidgetContainer
                        id="quick-tasks"
                        title="Szybkie zadania"
                        icon={<Zap className="h-4 w-4" />}
                        size="half"
                        draggable={false}
                        removable={isEditMode}
                        onRemove={() => hideWidget('quick-tasks')}
                        onSizeChange={(size) => updateWidget('quick-tasks', { size })}
                        className="lg:col-span-3"
                    >
                        <QuickTasksWidget />
                    </WidgetContainer>
                )}

                {isWidgetVisible('pandy') && (
                    <WidgetContainer
                        id="pandy"
                        title="Twoje Pandy"
                        icon={<span className="text-lg">🐼</span>}
                        size="half"
                        draggable={false}
                        removable={isEditMode}
                        onRemove={() => hideWidget('pandy')}
                        onSizeChange={(size) => updateWidget('pandy', { size })}
                        className="lg:col-span-3"
                    >
                        <PandyWidget />
                    </WidgetContainer>
                )}

                {/* Recent Activity */}
                {isWidgetVisible('recent-activity') && recentSops.length > 0 && (
                    <WidgetContainer
                        id="recent-activity"
                        title="Ostatnia aktywność"
                        icon={<TrendingUp className="h-4 w-4" />}
                        size={getWidgetSize('recent-activity')}
                        draggable={isEditMode}
                        removable={isEditMode}
                        onRemove={() => hideWidget('recent-activity')}
                        onSizeChange={(size) => updateWidget('recent-activity', { size })}
                        headerActions={
                            <Link
                                href="/sops"
                                className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                            >
                                Zobacz wszystkie
                                <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        }
                        className="lg:col-span-6"
                    >
                        <div className="rounded-xl border overflow-hidden border-neutral-100 dark:border-neutral-800/50">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/80">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Tytuł</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Dział</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentSops.slice(0, 5).map((sop, index) => (
                                        <motion.tr
                                            key={sop.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + index * 0.05 }}
                                            className="border-b last:border-0 transition-colors cursor-pointer border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800/50 dark:hover:bg-neutral-800/30"
                                        >
                                            <td className="px-4 py-3">
                                                <Link href={`/sops/${sop.id}`}>
                                                    <span className="font-medium text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                        {sop.title}
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                                                {sop.department?.name || '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={sop.status as 'draft' | 'active'} />
                                            </td>
                                            <td className="px-4 py-3 text-neutral-500 text-sm">
                                                {new Date(sop.createdAt).toLocaleDateString('pl-PL')}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </WidgetContainer>
                )}
            </div>

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

// Main exported component - wraps content with provider
export function DashboardClient({ user, stats, recentSops }: DashboardClientProps) {
    return (
        <DashboardEditProvider>
            <DashboardContent user={user} stats={stats} recentSops={recentSops} />
        </DashboardEditProvider>
    );
}
