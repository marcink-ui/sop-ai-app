'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    FileText,
    Bot,
    Trash2,
    Zap,
    Clock,
    ChevronDown,
    ChevronRight,
    Target,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    PieChart as PieChartIcon,
    Loader2,
    RefreshCw,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    TrendLineChart,
    MudaStackedBarChart,
    RadialProgress,
    DonutChart,
    KpiStatCard
} from '@/components/charts/kpi-charts';
import { Skeleton } from '@/components/ui/skeleton';

// Types for API response
interface AnalyticsData {
    counters: {
        activeUsers: number;
        totalSOPs: number;
        totalAgents: number;
        aiCallsToday: number;
        pendingCouncil: number;
        sopsThisWeek: number;
    };
    trends: {
        usersChange: string;
        aiCallsChange: string;
        sopsChange: string;
    };
    engagement: {
        score: number;
        level: 'high' | 'medium' | 'low';
    };
    lastUpdated: string;
}

interface TrendPoint {
    name: string;
    sops: number;
    agents: number;
}

interface MudaPoint {
    department: string;
    transport: number;
    inventory: number;
    motion: number;
    waiting: number;
    overproduction: number;
    overprocessing: number;
    defects: number;
}

// Fallback data (used only if API returns empty)
const fallbackTrendData: TrendPoint[] = [
    { name: 'Sty', sops: 0, agents: 0 },
    { name: 'Lut', sops: 0, agents: 0 },
    { name: 'Mar', sops: 0, agents: 0 },
];

const sparklineData = [
    { name: '1', value: 10 },
    { name: '2', value: 15 },
    { name: '3', value: 12 },
    { name: '4', value: 25 },
    { name: '5', value: 22 },
    { name: '6', value: 30 },
    { name: '7', value: 28 }
];

const timeRanges = [
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: '1R', value: '1y' }
];

function formatTimeAgo(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Właśnie teraz';
    if (minutes < 60) return `${minutes} min temu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h temu`;
    return `${Math.floor(hours / 24)}d temu`;
}

export default function AnalyticsPage() {
    const router = useRouter();
    const [timeRange, setTimeRange] = useState('30d');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [trendData, setTrendData] = useState<TrendPoint[]>(fallbackTrendData);
    const [trendGrowth, setTrendGrowth] = useState(0);
    const [mudaData, setMudaData] = useState<MudaPoint[]>([]);
    const [chartsLoading, setChartsLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        kpis: true,
        charts: true,
        details: false,
    });
    const toggleSection = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

    const fetchAnalytics = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const res = await fetch('/api/analytics/stats');
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const fetchChartData = useCallback(async () => {
        setChartsLoading(true);
        try {
            const [trendRes, mudaRes] = await Promise.all([
                fetch(`/api/analytics/trends?range=${timeRange}`),
                fetch('/api/analytics/muda'),
            ]);
            if (trendRes.ok) {
                const trendJson = await trendRes.json();
                if (trendJson.data?.length > 0) setTrendData(trendJson.data);
                setTrendGrowth(trendJson.growth || 0);
            }
            if (mudaRes.ok) {
                const mudaJson = await mudaRes.json();
                if (mudaJson.data?.length > 0) setMudaData(mudaJson.data);
            }
        } catch (err) {
            console.error('Failed to fetch chart data:', err);
        } finally {
            setChartsLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    useEffect(() => {
        fetchChartData();
    }, [fetchChartData]);

    // Derived values from real data
    const counters = data?.counters;
    const engagement = data?.engagement;

    // Build SOP distribution from real counts
    const distributionData = counters ? [
        { name: 'Aktywne', value: Math.max(counters.totalSOPs - counters.sopsThisWeek, 0) },
        { name: 'Nowe (7d)', value: counters.sopsThisWeek },
    ] : [
        { name: 'Aktywne', value: 35 },
        { name: 'Nowe (7d)', value: 8 },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 p-3 border border-violet-500/20">
                        <BarChart3 className="h-6 w-6 text-violet-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
                        <p className="text-sm text-muted-foreground">
                            Monitoruj postępy transformacji AI
                            {data && <span className="ml-2 text-emerald-500">● Live</span>}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Refresh */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchAnalytics(true)}
                        disabled={refreshing}
                        className="gap-1.5"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Odświeżam...' : 'Odśwież'}
                    </Button>

                    {/* Time Range Selector */}
                    <div className="flex items-center gap-1 rounded-lg border border-border bg-card/50 p-1">
                        {timeRanges.map((range) => (
                            <button
                                key={range.value}
                                onClick={() => setTimeRange(range.value)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${timeRange === range.value
                                    ? 'bg-violet-500/20 text-violet-400'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Collapsible: KPI Overview */}
            <button onClick={() => toggleSection('kpis')} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                {expandedSections.kpis ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Główne wskaźniki
            </button>
            <AnimatePresence>
                {expandedSections.kpis && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 overflow-hidden"
                    >
                        {loading ? (
                            <>
                                <Skeleton className="h-36 rounded-xl" />
                                <Skeleton className="h-36 rounded-xl" />
                                <Skeleton className="h-36 rounded-xl" />
                                <Skeleton className="h-36 rounded-xl" />
                            </>
                        ) : (
                            <>
                                <KpiStatCard
                                    title="SOPs ogółem"
                                    value={counters?.totalSOPs?.toString() || '0'}
                                    change={counters?.sopsThisWeek || 0}
                                    changeLabel={`${counters?.sopsThisWeek || 0} nowych w tym tyg.`}
                                    sparklineData={sparklineData}
                                    color="#8B5CF6"
                                    icon={<FileText className="h-4 w-4 text-violet-400" />}
                                    onClick={() => router.push('/sops')}
                                />
                                <KpiStatCard
                                    title="Aktywni Agenci AI"
                                    value={counters?.totalAgents?.toString() || '0'}
                                    change={counters?.totalAgents || 0}
                                    changeLabel="aktywnych agentów"
                                    sparklineData={sparklineData}
                                    color="#06B6D4"
                                    icon={<Bot className="h-4 w-4 text-cyan-400" />}
                                    onClick={() => router.push('/agents')}
                                />
                                <KpiStatCard
                                    title="Wywołania AI (dziś)"
                                    value={counters?.aiCallsToday?.toString() || '0'}
                                    change={counters?.aiCallsToday || 0}
                                    changeLabel="wiadomości AI dzisiaj"
                                    sparklineData={sparklineData}
                                    color="#10B981"
                                    icon={<Zap className="h-4 w-4 text-emerald-400" />}
                                    onClick={() => router.push('/chat-history-admin')}
                                />
                                <KpiStatCard
                                    title="Engagement Score"
                                    value={`${engagement?.score || 0}%`}
                                    change={engagement?.score || 0}
                                    changeLabel={`Poziom: ${engagement?.level === 'high' ? 'Wysoki' : engagement?.level === 'medium' ? 'Średni' : 'Niski'}`}
                                    sparklineData={sparklineData}
                                    color="#F59E0B"
                                    icon={<Target className="h-4 w-4 text-amber-400" />}
                                    onClick={() => router.push('/value-chain')}
                                />
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collapsible: Charts Grid */}
            <button onClick={() => toggleSection('charts')} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                {expandedSections.charts ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Wykresy i trendy
            </button>
            <AnimatePresence>
                {expandedSections.charts && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                        {/* Charts Grid */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Trend Chart */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="rounded-xl border border-border bg-card/50 p-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">Wzrost w czasie</h3>
                                        <p className="text-sm text-muted-foreground">SOPs i Agenci AI</p>
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm ${trendGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {trendGrowth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                        <span>{trendGrowth >= 0 ? '+' : ''}{trendGrowth}% w tym okresie</span>
                                    </div>
                                </div>
                                {chartsLoading ? (
                                    <Skeleton className="h-[280px] w-full rounded-lg" />
                                ) : (
                                    <TrendLineChart data={trendData} height={280} />
                                )}
                            </motion.div>

                            {/* MUDA by Department */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="rounded-xl border border-border bg-card/50 p-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">MUDA wg Działów</h3>
                                        <p className="text-sm text-muted-foreground">7 typów marnotrawstwa</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="text-xs">
                                        Eksportuj raport
                                    </Button>
                                </div>
                                {chartsLoading ? (
                                    <Skeleton className="h-[280px] w-full rounded-lg" />
                                ) : mudaData.length > 0 ? (
                                    <MudaStackedBarChart
                                        data={mudaData}
                                        height={280}
                                        onBarClick={(department) => router.push(`/muda?dept=${encodeURIComponent(department)}`)}
                                    />
                                ) : (
                                    <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                                        Brak działów w organizacji — dodaj działy aby zobaczyć analizę MUDA
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collapsible: Details */}
            <button onClick={() => toggleSection('details')} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                {expandedSections.details ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Szczegóły i statystyki
            </button>
            <AnimatePresence>
                {expandedSections.details && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                        {/* Bottom Row */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Radial Progress — from real data */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="rounded-xl border border-border bg-card/50 p-6 flex flex-col items-center justify-center"
                            >
                                <h3 className="text-lg font-semibold text-foreground mb-4">Engagement Score</h3>
                                <RadialProgress
                                    value={engagement?.score || 0}
                                    label={engagement?.level === 'high' ? 'Wysoki' : engagement?.level === 'medium' ? 'Średni' : 'Niski'}
                                    color={engagement?.level === 'high' ? '#10B981' : engagement?.level === 'medium' ? '#F59E0B' : '#EF4444'}
                                    size={180}
                                />
                                <p className="text-sm text-muted-foreground mt-4 text-center">
                                    Zaangażowanie zespołu w transformację AI
                                </p>
                            </motion.div>

                            {/* Distribution Donut — from real data */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="rounded-xl border border-border bg-card/50 p-6"
                            >
                                <h3 className="text-lg font-semibold text-foreground mb-4">Status SOPs</h3>
                                <DonutChart
                                    data={distributionData}
                                    height={220}
                                    onSliceClick={() => router.push('/sops')}
                                />
                            </motion.div>

                            {/* Quick Stats — from real data */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                className="rounded-xl border border-border bg-card/50 p-6"
                            >
                                <h3 className="text-lg font-semibold text-foreground mb-4">Szybkie statystyki</h3>
                                <div className="space-y-4">
                                    <div
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => router.push('/roles')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">Aktywni użytkownicy</span>
                                        </div>
                                        <span className="font-semibold text-foreground">
                                            {loading ? <Skeleton className="h-4 w-8" /> : counters?.activeUsers || 0}
                                        </span>
                                    </div>
                                    <div
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => router.push('/agents')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">Aktywni agenci AI</span>
                                        </div>
                                        <span className="font-semibold text-foreground">
                                            {loading ? <Skeleton className="h-4 w-8" /> : counters?.totalAgents || 0}
                                        </span>
                                    </div>
                                    <div
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => router.push('/chat-history-admin')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">Wiadomości AI (dziś)</span>
                                        </div>
                                        <span className="font-semibold text-foreground">
                                            {loading ? <Skeleton className="h-4 w-8" /> : counters?.aiCallsToday || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">Ostatnia aktualizacja</span>
                                        </div>
                                        <span className="font-semibold text-foreground">
                                            {loading ? <Skeleton className="h-4 w-8" /> : data?.lastUpdated ? formatTimeAgo(data.lastUpdated) : '—'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
