'use client';

import { useMemo } from 'react';
import { useROIStore } from '@/lib/roi/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Clock,
    Target,
    Zap,
    CalendarCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';

export function ROIDashboard() {
    const { calculateTotalSummary, report, calculateROI } = useROIStore();
    const summary = calculateTotalSummary();

    // Calculate payback months
    const paybackData = useMemo(() => {
        if (report.operations.length === 0) return { paybackMonths: 0, totalInvestment: 0 };
        const totalInvestment = summary.investment;
        const monthlySavings = summary.savings / 12;
        const paybackMonths = monthlySavings > 0 ? totalInvestment / monthlySavings : 99;
        return { paybackMonths: Math.min(paybackMonths, 99), totalInvestment };
    }, [report.operations, summary]);

    // Generate projection data for 36 months
    const projectionData = useMemo(() => {
        if (report.operations.length === 0) return [];
        const monthlySavings = summary.savings / 12;
        const investment = summary.investment;

        return Array.from({ length: 37 }, (_, i) => {
            const month = i;
            const cumulativeSavings = monthlySavings * month;
            const netValue = cumulativeSavings - investment;
            return {
                month,
                label: month === 0 ? 'Start' : `M${month}`,
                savings: Math.round(cumulativeSavings),
                net: Math.round(netValue),
                investment: Math.round(investment),
            };
        });
    }, [report.operations, summary]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val);
    };

    const formatCompact = (val: number) => {
        if (Math.abs(val) >= 1_000_000) {
            return (val / 1_000_000).toFixed(1) + 'M';
        }
        if (Math.abs(val) >= 1_000) {
            return (val / 1_000).toFixed(0) + 'K';
        }
        return val.toFixed(0);
    };

    if (report.operations.length === 0) {
        return null;
    }

    const cards = [
        {
            title: 'Koszt Obecny',
            value: summary.currentCost,
            icon: TrendingDown,
            color: 'text-red-500',
            bgColor: 'bg-red-100 dark:bg-red-950/30',
            subtitle: 'rocznie',
        },
        {
            title: 'Koszt Po Optymalizacji',
            value: summary.futureCost,
            icon: TrendingUp,
            color: 'text-green-500',
            bgColor: 'bg-green-100 dark:bg-green-950/30',
            subtitle: 'rocznie',
        },
        {
            title: 'Oszczędności',
            value: summary.savings,
            icon: DollarSign,
            color: summary.savings > 0 ? 'text-emerald-600' : 'text-red-500',
            bgColor: summary.savings > 0 ? 'bg-emerald-100 dark:bg-emerald-950/30' : 'bg-red-100 dark:bg-red-950/30',
            subtitle: 'rocznie',
        },
        {
            title: 'Inwestycja',
            value: summary.investment,
            icon: Target,
            color: 'text-blue-500',
            bgColor: 'bg-blue-100 dark:bg-blue-950/30',
            subtitle: 'jednorazowo',
        },
        {
            title: 'ROI 1 Rok',
            value: summary.roi1Y,
            icon: Zap,
            color: summary.roi1Y > 0 ? 'text-green-600' : 'text-orange-500',
            bgColor: summary.roi1Y > 0 ? 'bg-green-100 dark:bg-green-950/30' : 'bg-orange-100 dark:bg-orange-950/30',
            subtitle: '%',
            isPercent: true,
        },
        {
            title: 'Zwrot',
            value: paybackData.paybackMonths,
            icon: CalendarCheck,
            color: paybackData.paybackMonths <= 12 ? 'text-green-600' : paybackData.paybackMonths <= 24 ? 'text-yellow-500' : 'text-orange-500',
            bgColor: paybackData.paybackMonths <= 12 ? 'bg-green-100 dark:bg-green-950/30' : paybackData.paybackMonths <= 24 ? 'bg-yellow-100 dark:bg-yellow-950/30' : 'bg-orange-100 dark:bg-orange-950/30',
            subtitle: 'miesięcy',
            isMonths: true,
        },
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Podsumowanie</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {cards.map((card) => (
                    <Card key={card.title} className="relative overflow-hidden">
                        <CardContent className="p-4">
                            <div className={cn("absolute top-3 right-3 rounded-lg p-2", card.bgColor)}>
                                <card.icon className={cn("h-4 w-4", card.color)} />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{card.title}</p>
                            <p className={cn("text-xl font-bold", card.color)}>
                                {card.isPercent
                                    ? `${card.value.toFixed(0)}%`
                                    : card.isMonths
                                        ? `${card.value.toFixed(1)}`
                                        : formatCurrency(card.value)}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">{card.subtitle}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Visual Comparison Bar */}
            <Card>
                <CardContent className="py-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium w-20">Obecnie</span>
                            <div className="flex-1 bg-red-100 dark:bg-red-950/30 rounded-full h-6 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-end pr-2"
                                    style={{ width: '100%' }}
                                >
                                    <span className="text-xs font-bold text-white">{formatCompact(summary.currentCost)} PLN</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium w-20">Po</span>
                            <div className="flex-1 bg-green-100 dark:bg-green-950/30 rounded-full h-6 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-end pr-2"
                                    style={{ width: `${summary.currentCost > 0 ? Math.max(10, (summary.futureCost / summary.currentCost) * 100) : 10}%` }}
                                >
                                    <span className="text-xs font-bold text-white">{formatCompact(summary.futureCost)} PLN</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 36-Month Projection Chart */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Projekcja 36 miesięcy
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 10 }}
                                    tickLine={false}
                                    interval={5}
                                    className="text-muted-foreground"
                                />
                                <YAxis
                                    tickFormatter={(v) => `${formatCompact(v)}`}
                                    tick={{ fontSize: 10 }}
                                    tickLine={false}
                                    className="text-muted-foreground"
                                />
                                <Tooltip
                                    formatter={(value, name) => [
                                        formatCurrency(Number(value ?? 0)),
                                        name === 'savings' ? 'Skumulowane oszczędności' : 'Wartość netto'
                                    ]}
                                    labelFormatter={(label) => `Miesiąc: ${label}`}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid hsl(var(--border))',
                                        backgroundColor: 'hsl(var(--background))',
                                    }}
                                />
                                {/* Investment line */}
                                <ReferenceLine
                                    y={summary.investment}
                                    stroke="#ef4444"
                                    strokeDasharray="5 5"
                                    label={{
                                        value: `Inwestycja: ${formatCompact(summary.investment)} PLN`,
                                        position: 'right',
                                        fontSize: 10,
                                        fill: '#ef4444'
                                    }}
                                />
                                {/* Payback point */}
                                {paybackData.paybackMonths < 36 && (
                                    <ReferenceLine
                                        x={`M${Math.round(paybackData.paybackMonths)}`}
                                        stroke="#8b5cf6"
                                        strokeDasharray="3 3"
                                        label={{
                                            value: `Zwrot: M${paybackData.paybackMonths.toFixed(1)}`,
                                            position: 'top',
                                            fontSize: 10,
                                            fill: '#8b5cf6'
                                        }}
                                    />
                                )}
                                <Area
                                    type="monotone"
                                    dataKey="savings"
                                    stroke="#22c55e"
                                    fillOpacity={1}
                                    fill="url(#colorSavings)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="net"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorNet)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span className="text-muted-foreground">Skumulowane oszczędności</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full" />
                            <span className="text-muted-foreground">Wartość netto (po inwestycji)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-red-500" style={{ borderStyle: 'dashed' }} />
                            <span className="text-muted-foreground">Poziom inwestycji</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

