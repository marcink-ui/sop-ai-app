'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react';
import { CanvasWidget } from './index';

interface MUDAHeatmapWidgetProps {
    widget: CanvasWidget;
    onRemove: () => void;
}

const MUDA_TYPES = [
    { key: 'T', label: 'Transport', color: 'bg-red-500' },
    { key: 'I', label: 'Inventory', color: 'bg-orange-500' },
    { key: 'M', label: 'Motion', color: 'bg-yellow-500' },
    { key: 'W', label: 'Waiting', color: 'bg-lime-500' },
    { key: 'O', label: 'Overproduction', color: 'bg-green-500' },
    { key: 'P', label: 'Overprocessing', color: 'bg-teal-500' },
    { key: 'D', label: 'Defects', color: 'bg-cyan-500' },
];

const departmentData = [
    { dept: 'Sprzedaż', scores: [4, 2, 3, 5, 2, 1, 1] },
    { dept: 'Marketing', scores: [2, 1, 2, 3, 4, 2, 1] },
    { dept: 'IT', scores: [1, 3, 2, 4, 1, 3, 2] },
    { dept: 'HR', scores: [2, 1, 3, 2, 1, 2, 1] },
];

function getHeatColor(value: number): string {
    if (value <= 1) return 'bg-green-100 dark:bg-green-900/30';
    if (value <= 2) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (value <= 3) return 'bg-orange-100 dark:bg-orange-900/30';
    if (value <= 4) return 'bg-red-200 dark:bg-red-900/40';
    return 'bg-red-400 dark:bg-red-900/60';
}

export function MUDAHeatmapWidget({ widget, onRemove }: MUDAHeatmapWidgetProps) {
    return (
        <Card className="h-full flex flex-col overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
                    <X className="h-3 w-3" />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                <div className="min-w-[280px]">
                    {/* Header row */}
                    <div className="flex gap-1 mb-1">
                        <div className="w-16 text-[9px] text-muted-foreground"></div>
                        {MUDA_TYPES.map(type => (
                            <div
                                key={type.key}
                                className="flex-1 text-center text-[9px] font-medium"
                                title={type.label}
                            >
                                {type.key}
                            </div>
                        ))}
                    </div>

                    {/* Data rows */}
                    {departmentData.map((row) => (
                        <div key={row.dept} className="flex gap-1 mb-1">
                            <div className="w-16 text-[9px] text-muted-foreground truncate">
                                {row.dept}
                            </div>
                            {row.scores.map((score, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 h-5 rounded-sm flex items-center justify-center text-[9px] font-medium ${getHeatColor(score)}`}
                                >
                                    {score}
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Legend */}
                    <div className="flex items-center gap-2 mt-2 text-[8px] text-muted-foreground justify-center">
                        <span>Niskie</span>
                        <div className="flex gap-0.5">
                            <div className="w-3 h-2 rounded-sm bg-green-100 dark:bg-green-900/30" />
                            <div className="w-3 h-2 rounded-sm bg-yellow-100 dark:bg-yellow-900/30" />
                            <div className="w-3 h-2 rounded-sm bg-orange-100 dark:bg-orange-900/30" />
                            <div className="w-3 h-2 rounded-sm bg-red-200 dark:bg-red-900/40" />
                            <div className="w-3 h-2 rounded-sm bg-red-400 dark:bg-red-900/60" />
                        </div>
                        <span>Wysokie</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
