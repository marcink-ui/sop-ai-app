'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    FileText,
    Bot,
    Trash2,
    Zap,
    Clock,
    Target,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    PieChart as PieChartIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    TrendLineChart,
    MudaStackedBarChart,
    RadialProgress,
    DonutChart,
    KpiStatCard
} from '@/components/charts/kpi-charts';

// Mock data for charts
const trendData = [
    { name: 'Sty', sops: 12, agents: 2 },
    { name: 'Lut', sops: 18, agents: 3 },
    { name: 'Mar', sops: 25, agents: 4 },
    { name: 'Kwi', sops: 31, agents: 5 },
    { name: 'Maj', sops: 42, agents: 7 },
    { name: 'Cze', sops: 48, agents: 8 },
    { name: 'Lip', sops: 55, agents: 10 }
];

const mudaData = [
    { department: 'Sprzedaż', transport: 4, inventory: 2, motion: 3, waiting: 5, overproduction: 2, overprocessing: 1, defects: 1 },
    { department: 'Produkcja', transport: 6, inventory: 8, motion: 4, waiting: 3, overproduction: 5, overprocessing: 2, defects: 3 },
    { department: 'Logistyka', transport: 8, inventory: 4, motion: 6, waiting: 7, overproduction: 1, overprocessing: 3, defects: 2 },
    { department: 'HR', transport: 1, inventory: 1, motion: 2, waiting: 4, overproduction: 1, overprocessing: 2, defects: 1 },
    { department: 'IT', transport: 2, inventory: 2, motion: 3, waiting: 6, overproduction: 2, overprocessing: 4, defects: 2 }
];

const distributionData = [
    { name: 'Aktywne', value: 35 },
    { name: 'W przeglądzie', value: 12 },
    { name: 'Szkice', value: 8 },
    { name: 'Zarchiwizowane', value: 5 }
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

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState('30d');

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
                        <p className="text-sm text-muted-foreground">Monitoruj postępy transformacji AI</p>
                    </div>
                </div>

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
            </motion.div>

            {/* Hero KPI Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
                <KpiStatCard
                    title="Pokrycie SOP"
                    value="78%"
                    change={12}
                    changeLabel="vs poprzedni miesiąc"
                    sparklineData={sparklineData}
                    color="#8B5CF6"
                    icon={<FileText className="h-4 w-4 text-violet-400" />}
                />
                <KpiStatCard
                    title="Stopień Automatyzacji"
                    value="52%"
                    change={8}
                    changeLabel="vs poprzedni miesiąc"
                    sparklineData={sparklineData}
                    color="#06B6D4"
                    icon={<Bot className="h-4 w-4 text-cyan-400" />}
                />
                <KpiStatCard
                    title="Redukcja MUDA"
                    value="34%"
                    change={-5}
                    changeLabel="marnotrawstwa wyeliminowano"
                    sparklineData={sparklineData}
                    color="#10B981"
                    icon={<Trash2 className="h-4 w-4 text-emerald-400" />}
                />
                <KpiStatCard
                    title="ROI Transformacji"
                    value="2.4x"
                    change={18}
                    changeLabel="zwrot z inwestycji"
                    sparklineData={sparklineData}
                    color="#F59E0B"
                    icon={<Target className="h-4 w-4 text-amber-400" />}
                />
            </motion.div>

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
                        <div className="flex items-center gap-1 text-sm text-emerald-500">
                            <ArrowUpRight className="h-4 w-4" />
                            <span>+23% this period</span>
                        </div>
                    </div>
                    <TrendLineChart data={trendData} height={280} />
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
                    <MudaStackedBarChart data={mudaData} height={280} />
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Radial Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="rounded-xl border border-border bg-card/50 p-6 flex flex-col items-center justify-center"
                >
                    <h3 className="text-lg font-semibold text-foreground mb-4">Postęp Automatyzacji</h3>
                    <RadialProgress value={52} label="Zautomatyzowane" color="#8B5CF6" size={180} />
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                        26 z 50 procesów zautomatyzowanych
                    </p>
                </motion.div>

                {/* Distribution Donut */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="rounded-xl border border-border bg-card/50 p-6"
                >
                    <h3 className="text-lg font-semibold text-foreground mb-4">Status SOPs</h3>
                    <DonutChart data={distributionData} height={220} />
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="rounded-xl border border-border bg-card/50 p-6"
                >
                    <h3 className="text-lg font-semibold text-foreground mb-4">Szybkie statystyki</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Średni czas tworzenia SOP</span>
                            </div>
                            <span className="font-semibold text-foreground">12 min</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Aktywni agenci AI</span>
                            </div>
                            <span className="font-semibold text-foreground">10</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Wykonania dzisiaj</span>
                            </div>
                            <span className="font-semibold text-foreground">847</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Ostatnia aktualizacja</span>
                            </div>
                            <span className="font-semibold text-foreground">2 min temu</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
