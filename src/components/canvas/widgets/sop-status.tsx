'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { CanvasWidget } from './index';
import { Progress } from '@/components/ui/progress';

interface SOPStatusWidgetProps {
    widget: CanvasWidget;
    onRemove: () => void;
}

const statusData = [
    { status: 'active', label: 'Aktywne', count: 38, icon: CheckCircle2, color: 'text-green-500' },
    { status: 'draft', label: 'W trakcie', count: 7, icon: Clock, color: 'text-amber-500' },
    { status: 'review', label: 'Do przeglądu', count: 3, icon: AlertCircle, color: 'text-blue-500' },
];

export function SOPStatusWidget({ widget, onRemove }: SOPStatusWidgetProps) {
    const total = statusData.reduce((sum, s) => sum + s.count, 0);
    const activePercent = Math.round((statusData[0].count / total) * 100);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
                    <X className="h-3 w-3" />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center gap-3">
                {/* Progress bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Wdrożenie SOP</span>
                        <span className="font-medium">{activePercent}%</span>
                    </div>
                    <Progress value={activePercent} className="h-2" />
                </div>

                {/* Status breakdown */}
                <div className="grid grid-cols-3 gap-2">
                    {statusData.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.status} className="text-center">
                                <div className={`flex items-center justify-center gap-1 ${item.color}`}>
                                    <Icon className="h-3 w-3" />
                                    <span className="font-bold">{item.count}</span>
                                </div>
                                <div className="text-[10px] text-muted-foreground">{item.label}</div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
