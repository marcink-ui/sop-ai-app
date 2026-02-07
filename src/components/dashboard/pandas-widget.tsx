'use client';

import { useState, useEffect } from 'react';
import { Award, Medal, TrendingUp } from 'lucide-react';
import { WidgetContainer } from './widget-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Panda {
    id: string;
    name: string;
    emoji: string;
    awardedAt: Date;
    reason: string;
}

interface PandasWidgetProps {
    userId?: string;
    onRemove?: () => void;
}

// Sample Pandas - in production fetch from API
const SAMPLE_PANDAS: Panda[] = [
    { id: '1', name: 'Pierwszy SOP', emoji: '🐼', awardedAt: new Date('2024-01-15'), reason: 'Utworzono pierwszy SOP' },
    { id: '2', name: 'Speed Demon', emoji: '⚡', awardedAt: new Date('2024-02-01'), reason: 'Ukończono 5 zadań w 1 dzień' },
    { id: '3', name: 'Team Player', emoji: '🤝', awardedAt: new Date('2024-02-10'), reason: 'Dodano 10 komentarzy' },
];

export function PandasWidget({ userId, onRemove }: PandasWidgetProps) {
    const [pandas, setPandas] = useState<Panda[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // In production, fetch from API
        const fetchPandas = async () => {
            try {
                // Simulated API call
                await new Promise((resolve) => setTimeout(resolve, 500));
                setPandas(SAMPLE_PANDAS);
            } catch (error) {
                console.error('Error fetching pandas:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPandas();
    }, [userId]);

    const thisMonthPandas = pandas.filter((p) => {
        const now = new Date();
        return (
            p.awardedAt.getMonth() === now.getMonth() &&
            p.awardedAt.getFullYear() === now.getFullYear()
        );
    });

    return (
        <WidgetContainer
            id="pandas-widget"
            title="Twoje Pandy"
            icon={<span className="text-sm">🐼</span>}
            size="sm"
            removable={!!onRemove}
            onRemove={onRemove}
        >
            {isLoading ? (
                <div className="flex items-center justify-center h-32">
                    <div className="animate-pulse flex space-x-2">
                        <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                        <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                        <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Stats */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Medal className="h-4 w-4 text-amber-500" />
                            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {pandas.length}
                            </span>
                            <span className="text-sm text-muted-foreground">łącznie</span>
                        </div>
                        {thisMonthPandas.length > 0 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +{thisMonthPandas.length} w tym miesiącu
                            </Badge>
                        )}
                    </div>

                    {/* Recent Pandas */}
                    <div className="flex flex-wrap gap-2">
                        {pandas.slice(0, 6).map((panda) => (
                            <div
                                key={panda.id}
                                className={cn(
                                    'group relative flex h-10 w-10 items-center justify-center',
                                    'rounded-full bg-gradient-to-br from-amber-100 to-orange-100',
                                    'dark:from-amber-900/30 dark:to-orange-900/30',
                                    'border-2 border-amber-300 dark:border-amber-700',
                                    'cursor-pointer transition-transform hover:scale-110'
                                )}
                                title={`${panda.name}: ${panda.reason}`}
                            >
                                <span className="text-lg">{panda.emoji}</span>
                                {/* Tooltip on hover */}
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    {panda.name}
                                </div>
                            </div>
                        ))}
                        {pandas.length > 6 && (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm font-medium text-muted-foreground">
                                +{pandas.length - 6}
                            </div>
                        )}
                    </div>

                    {/* Award Button */}
                    <Button variant="outline" size="sm" className="w-full">
                        <Award className="h-4 w-4 mr-2" />
                        Nadaj Pandę
                    </Button>
                </div>
            )}
        </WidgetContainer>
    );
}
