'use client';

import { useROIStore } from '@/lib/roi/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Clock,
    Target,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ROIDashboard() {
    const { calculateTotalSummary, report } = useROIStore();
    const summary = calculateTotalSummary();

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
            title: 'ROI 3 Lata',
            value: summary.roi3Y,
            icon: Zap,
            color: summary.roi3Y > 0 ? 'text-green-600' : 'text-orange-500',
            bgColor: summary.roi3Y > 0 ? 'bg-green-100 dark:bg-green-950/30' : 'bg-orange-100 dark:bg-orange-950/30',
            subtitle: '%',
            isPercent: true,
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
        </div>
    );
}
