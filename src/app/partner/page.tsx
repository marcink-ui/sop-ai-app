'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Building2,
    Search,
    Users,
    FileText,
    ChevronRight,
    ExternalLink,
    BarChart3,
    Clock,
    Sparkles,
    Activity,
    Bot,
    MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Organization {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    partnerRole: 'CONSULTANT' | 'FACILITATOR' | 'AUDITOR';
    assignedAt: string;
    stats: {
        users: number;
        sops: number;
        activeTransformations: number;
    };
}

interface ActivityItem {
    id: string;
    type: string;
    description: string;
    organizationName: string;
    organizationSlug: string;
    timestamp: string;
    metadata?: Record<string, string>;
}

const partnerRoleLabels: Record<string, { label: string; color: string }> = {
    CONSULTANT: { label: 'Konsultant', color: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400' },
    FACILITATOR: { label: 'Facylitator', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
    AUDITOR: { label: 'Audytor', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
};

export default function PartnerDashboard() {
    const router = useRouter();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [switching, setSwitching] = useState<string | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);

    const handleEnterCompany = useCallback(async (org: Organization) => {
        setSwitching(org.id);
        try {
            const res = await fetch('/api/context/switch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organizationId: org.id }),
            });
            if (res.ok) {
                // Use full-page navigation instead of router.push to avoid
                // Next.js RSC prefetch issues that crash the client router
                window.location.href = `/partner/company/${org.slug}`;
            } else {
                console.error('Failed to switch context');
                setSwitching(null);
            }
        } catch (error) {
            console.error('Context switch error:', error);
            setSwitching(null);
        }
    }, []);

    useEffect(() => {
        async function fetchOrganizations() {
            try {
                const res = await fetch('/api/partner/organizations');
                if (res.ok) {
                    const data = await res.json();
                    setOrganizations(data.organizations || []);
                }
            } catch (error) {
                console.error('Failed to fetch organizations:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchOrganizations();
    }, []);

    // Fetch activity feed
    useEffect(() => {
        async function fetchActivities() {
            try {
                const res = await fetch('/api/partner/activity?limit=10');
                if (res.ok) {
                    const data = await res.json();
                    setActivities(data.activities || []);
                }
            } catch (err) {
                console.error('Failed to fetch activities:', err);
            } finally {
                setActivitiesLoading(false);
            }
        }
        fetchActivities();
    }, []);

    const filteredOrganizations = organizations.filter((org) =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        Portal Partnera
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Zarządzaj przypisanymi firmami i transformacjami
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-200 dark:border-violet-800">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                                    {organizations.length}
                                </div>
                                <div className="text-sm text-violet-600/70 dark:text-violet-400/70">
                                    Przypisane firmy
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                    {organizations.reduce((sum, org) => sum + org.stats.activeTransformations, 0)}
                                </div>
                                <div className="text-sm text-blue-600/70 dark:text-blue-400/70">
                                    Aktywne transformacje
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                                    {organizations.reduce((sum, org) => sum + org.stats.sops, 0)}
                                </div>
                                <div className="text-sm text-amber-600/70 dark:text-amber-400/70">
                                    SOPs łącznie
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                    placeholder="Szukaj firmy..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Organizations Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-5">
                                <div className="h-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredOrganizations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredOrganizations.map((org, index) => (
                        <motion.div
                            key={org.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="bg-white dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all hover:border-violet-300 dark:hover:border-violet-700 group">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-500/20 dark:to-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                                                {org.logo ? (
                                                    <img src={org.logo} alt={org.name} className="h-10 w-10 rounded-lg object-cover" />
                                                ) : (
                                                    <span className="text-xl font-bold text-violet-600 dark:text-violet-400">
                                                        {org.name.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-neutral-900 dark:text-white text-lg">
                                                    {org.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className={cn('text-xs', partnerRoleLabels[org.partnerRole]?.color)}>
                                                        {partnerRoleLabels[org.partnerRole]?.label || org.partnerRole}
                                                    </Badge>
                                                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(org.assignedAt).toLocaleDateString('pl-PL')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                        <div className="text-center">
                                            <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                                                {org.stats.users}
                                            </div>
                                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                Użytkowników
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                                                {org.stats.sops}
                                            </div>
                                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                SOPs
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-semibold text-violet-600 dark:text-violet-400">
                                                {org.stats.activeTransformations}
                                            </div>
                                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                Transformacji
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <Button
                                            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white group"
                                            onClick={() => handleEnterCompany(org)}
                                            disabled={switching === org.id}
                                        >
                                            {switching === org.id ? (
                                                <span>Przełączanie...</span>
                                            ) : (
                                                <>
                                                    <span>Wejdź do firmy</span>
                                                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <Card className="bg-neutral-50 dark:bg-neutral-900/30 border-dashed">
                    <CardContent className="py-12 text-center">
                        <Sparkles className="h-12 w-12 mx-auto text-violet-400 mb-4" />
                        <h3 className="font-medium text-neutral-900 dark:text-white mb-1">
                            Brak przypisanych firm
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                            Skontaktuj się z administratorem, aby uzyskać dostęp do firm
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Activity Feed */}
            <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-5 w-5 text-violet-500" />
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        Ostatnia aktywność
                    </h2>
                </div>
                {activitiesLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                        ))}
                    </div>
                ) : activities.length > 0 ? (
                    <Card className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {activities.map((act) => {
                            const iconMap: Record<string, React.ElementType> = {
                                sop_created: FileText,
                                sop_updated: FileText,
                                agent_created: Bot,
                                chat_session: MessageSquare,
                                user_joined: Users,
                            };
                            const ActIcon = iconMap[act.type] || Activity;
                            const timeAgo = formatTimeAgo(act.timestamp);
                            return (
                                <div key={act.id} className="flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-500/20">
                                        <ActIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-neutral-900 dark:text-white truncate">
                                            {act.description}
                                        </p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            {act.organizationName} &middot; {timeAgo}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </Card>
                ) : (
                    <Card className="bg-neutral-50 dark:bg-neutral-900/30 border-dashed">
                        <CardContent className="py-8 text-center">
                            <Activity className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Brak aktywności do wyświetlenia
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

function formatTimeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'przed chwilą';
    if (mins < 60) return `${mins} min temu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} godz. temu`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} dn. temu`;
    return new Date(timestamp).toLocaleDateString('pl-PL');
}
