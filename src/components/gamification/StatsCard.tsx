'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Heart, Inbox } from 'lucide-react';

interface StatsCardProps {
    sopsCreated: number;
    pandasSent: number;
    pandasReceived: number;
}

export function StatsCard({ sopsCreated, pandasSent, pandasReceived }: StatsCardProps) {
    const stats = [
        {
            label: 'SOPs Created',
            value: sopsCreated,
            icon: FileText,
            color: 'text-blue-500',
            bgColor: 'bg-blue-100 dark:bg-blue-950/50',
            xp: '+50 XP each',
        },
        {
            label: 'Pandas Sent',
            value: pandasSent,
            icon: Heart,
            color: 'text-pink-500',
            bgColor: 'bg-pink-100 dark:bg-pink-950/50',
            xp: '+10 XP each',
        },
        {
            label: 'Pandas Received',
            value: pandasReceived,
            icon: Inbox,
            color: 'text-green-500',
            bgColor: 'bg-green-100 dark:bg-green-950/50',
            xp: '+20 XP each',
        },
    ];

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Activity Stats</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className={`inline-flex p-3 rounded-xl ${stat.bgColor} mb-2`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                            <p className="text-xs text-violet-500 mt-1">{stat.xp}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
