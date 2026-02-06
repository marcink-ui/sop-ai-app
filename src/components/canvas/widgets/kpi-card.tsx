'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, TrendingUp, TrendingDown, FileText, Bot, Users, Zap } from 'lucide-react';
import { CanvasWidget } from './index';

const ICONS: Record<string, React.ReactNode> = {
    FileText: <FileText className="h-5 w-5" />,
    Bot: <Bot className="h-5 w-5" />,
    Users: <Users className="h-5 w-5" />,
    Zap: <Zap className="h-5 w-5" />,
};

interface KPICardWidgetProps {
    widget: CanvasWidget;
    onRemove: () => void;
}

export function KPICardWidget({ widget, onRemove }: KPICardWidgetProps) {
    const { value = 0, change = 0, label = 'Wartość', icon = 'Zap' } = widget.config;
    const isPositive = change >= 0;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {ICONS[icon] || ICONS.Zap}
                    </div>
                    <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
                    <X className="h-3 w-3" />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
                <div className="text-3xl font-bold">{value}</div>
                <div className="flex items-center gap-1 mt-1">
                    {isPositive ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{change}%
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">{label}</span>
                </div>
            </CardContent>
        </Card>
    );
}
