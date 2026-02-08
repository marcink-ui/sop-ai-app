'use client';

import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { WidgetContainer } from './widget-container';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FormulaResult {
    label: string;
    value: number | string;
    unit?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

interface CustomFormulaWidgetProps {
    formulaId?: string;
    title?: string;
    onRemove?: () => void;
}

// Predefined formulas - in production these would come from user configuration
const SAMPLE_FORMULAS: Record<string, () => FormulaResult[]> = {
    'roi-summary': () => [
        { label: 'Średnie ROI', value: 78, unit: '%', trend: 'up', trendValue: '+12%' },
        { label: 'Oszczędności/msc', value: '45,200', unit: 'PLN', trend: 'up', trendValue: '+8%' },
        { label: 'Czas zwrotu', value: 3.2, unit: 'msc', trend: 'down', trendValue: '-0.5' },
    ],
    'productivity': () => [
        { label: 'Produktywność', value: 94, unit: '%', trend: 'up', trendValue: '+3%' },
        { label: 'Zadania/dzień', value: 12.5, unit: '', trend: 'neutral' },
        { label: 'Czas reakcji', value: '< 2h', unit: '', trend: 'down', trendValue: '-15min' },
    ],
    'ai-agents': () => [
        { label: 'Aktywni Agenci', value: 8, unit: '', trend: 'up', trendValue: '+2' },
        { label: 'Wykonane zadania', value: 156, unit: '/tydz', trend: 'up', trendValue: '+23' },
        { label: 'Skuteczność', value: 96.5, unit: '%', trend: 'neutral' },
    ],
};

export function CustomFormulaWidget({
    formulaId = 'roi-summary',
    title = 'Custom Formula',
    onRemove,
}: CustomFormulaWidgetProps) {
    const [results, setResults] = useState<FormulaResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const calculateFormula = async () => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 400));
            const formulaFn = SAMPLE_FORMULAS[formulaId] || SAMPLE_FORMULAS['roi-summary'];
            setResults(formulaFn());
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Formula calculation error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        calculateFormula();
    }, [formulaId]);

    const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-3 w-3 text-green-500" />;
            case 'down':
                return <TrendingDown className="h-3 w-3 text-red-500" />;
            default:
                return <Minus className="h-3 w-3 text-neutral-400" />;
        }
    };

    const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
        switch (trend) {
            case 'up':
                return 'text-green-500';
            case 'down':
                return 'text-red-500';
            default:
                return 'text-neutral-400';
        }
    };

    return (
        <WidgetContainer
            id={`formula-widget-${formulaId}`}
            title={title}
            icon={<Calculator className="h-3.5 w-3.5" />}
            size="half"
            removable={!!onRemove}
            onRemove={onRemove}
            headerActions={
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={calculateFormula}
                    disabled={isLoading}
                >
                    <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
                </Button>
            }
        >
            {isLoading ? (
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse space-y-2">
                            <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
                            <div className="h-6 w-12 bg-neutral-200 dark:bg-neutral-700 rounded" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        {results.map((result, idx) => (
                            <div key={idx} className="text-center">
                                <p className="text-xs text-muted-foreground mb-1 truncate">
                                    {result.label}
                                </p>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-xl font-bold text-neutral-900 dark:text-white">
                                        {result.value}
                                    </span>
                                    {result.unit && (
                                        <span className="text-xs text-muted-foreground">
                                            {result.unit}
                                        </span>
                                    )}
                                </div>
                                {result.trend && (
                                    <div className={cn(
                                        'flex items-center justify-center gap-1 mt-1 text-xs',
                                        getTrendColor(result.trend)
                                    )}>
                                        {getTrendIcon(result.trend)}
                                        {result.trendValue}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center text-xs text-muted-foreground">
                        Ostatnia aktualizacja: {lastUpdated.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            )}
        </WidgetContainer>
    );
}
