'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { CanvasWidget } from './index';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartBarWidgetProps {
    widget: CanvasWidget;
    onRemove: () => void;
}

const defaultData = [
    { name: 'Sty', value: 12 },
    { name: 'Lut', value: 18 },
    { name: 'Mar', value: 25 },
    { name: 'Kwi', value: 31 },
    { name: 'Maj', value: 42 },
    { name: 'Cze', value: 48 },
];

export function ChartBarWidget({ widget, onRemove }: ChartBarWidgetProps) {
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
                    <BarChart data={data}>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} width={30} />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
