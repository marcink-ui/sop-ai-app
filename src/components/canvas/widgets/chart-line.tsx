'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { CanvasWidget } from './index';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartLineWidgetProps {
    widget: CanvasWidget;
    onRemove: () => void;
}

const defaultData = [
    { name: 'Pon', value: 24 },
    { name: 'Wt', value: 28 },
    { name: 'Śr', value: 26 },
    { name: 'Czw', value: 32 },
    { name: 'Pt', value: 30 },
    { name: 'Sob', value: 28 },
    { name: 'Nd', value: 35 },
];

export function ChartLineWidget({ widget, onRemove }: ChartLineWidgetProps) {
    const data = widget.config.data || defaultData;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
                    <X className="h-3 w-3" />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} width={30} />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
