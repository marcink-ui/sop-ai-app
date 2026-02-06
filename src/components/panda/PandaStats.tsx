'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Send, Inbox, TrendingUp, Zap } from 'lucide-react';

interface PandaStatsProps {
    sent: number;
    received: number;
    streak?: number;
}

export function PandaStats({ sent, received, streak = 0 }: PandaStatsProps) {
    const stats = [
        {
            label: 'Wysłane',
            value: sent,
            icon: Send,
            color: 'text-blue-500',
            bgColor: 'bg-blue-100 dark:bg-blue-950/50',
        },
        {
            label: 'Otrzymane',
            value: received,
            icon: Inbox,
            color: 'text-green-500',
            bgColor: 'bg-green-100 dark:bg-green-950/50',
        },
        {
            label: 'Bilans',
            value: received - sent,
            icon: TrendingUp,
            color: received - sent >= 0 ? 'text-emerald-500' : 'text-red-500',
            bgColor: received - sent >= 0 ? 'bg-emerald-100 dark:bg-emerald-950/50' : 'bg-red-100 dark:bg-red-950/50',
        },
        {
            label: 'Streak',
            value: streak,
            icon: Zap,
            color: 'text-amber-500',
            bgColor: 'bg-amber-100 dark:bg-amber-950/50',
            suffix: ' dni',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className={`absolute top-3 right-3 rounded-lg p-2 ${stat.bgColor}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                            {stat.value > 0 && stat.label === 'Bilans' && '+'}
                            {stat.value}
                            {stat.suffix && <span className="text-sm font-normal">{stat.suffix}</span>}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
