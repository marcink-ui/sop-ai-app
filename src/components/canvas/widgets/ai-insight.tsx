'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Loader2, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { CanvasWidget } from './index';
import { Badge } from '@/components/ui/badge';

interface AIInsightWidgetProps {
    widget: CanvasWidget;
    onRemove: () => void;
}

// Mock AI insights per department
const MOCK_INSIGHTS: Record<string, { summary: string; recommendations: string[]; score: number }> = {
    'Sprzedaż': {
        summary: 'Dział Sprzedaży pokazuje 15% wzrost efektywności po wdrożeniu 3 nowych SOP. Główne obszary do poprawy to czas odpowiedzi na zapytania.',
        recommendations: [
            'Wdrożyć SOP automatycznej odpowiedzi na lead w 24h',
            'Zintegrować CRM z AI asystentem do kwalifikacji leadów',
            'Przeszkolić zespół z nowego procesu follow-up',
        ],
        score: 78,
    },
    'Marketing': {
        summary: 'Marketing osiąga dobre wyniki w generowaniu leadów. Zidentyfikowano potencjał w automatyzacji content pipeline.',
        recommendations: [
            'Stworzyć SOP dla AI-assisted content creation',
            'Wdrożyć automatyczną analizę sentymentu social media',
        ],
        score: 82,
    },
    'default': {
        summary: 'Analiza AI dla tego działu jest w trakcie. Wstępne dane wskazują na potencjał optymalizacji w obszarze raportowania.',
        recommendations: [
            'Przeprowadzić audyt istniejących procesów',
            'Zidentyfikować powtarzalne zadania do automatyzacji',
        ],
        score: 65,
    },
};

export function AIInsightWidget({ widget, onRemove }: AIInsightWidgetProps) {
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const department = widget.config.department || 'default';
    const insight = MOCK_INSIGHTS[department] || MOCK_INSIGHTS['default'];

    useEffect(() => {
        // Simulate API loading
        const timer = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
                        <X className="h-3 w-3" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-sm">Generuję insight...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                        {department}
                    </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
                    <X className="h-3 w-3" />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto space-y-3">
                {/* Score */}
                <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{insight.score}</div>
                    <div className="text-xs text-muted-foreground">/ 100<br />AI Score</div>
                </div>

                {/* Summary */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.summary}
                </p>

                {/* Recommendations */}
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between px-2 h-7"
                        onClick={() => setExpanded(!expanded)}
                    >
                        <span className="flex items-center gap-1 text-xs">
                            <Lightbulb className="h-3 w-3" />
                            Rekomendacje ({insight.recommendations.length})
                        </span>
                        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                    {expanded && (
                        <ul className="mt-2 space-y-1">
                            {insight.recommendations.map((rec, i) => (
                                <li key={i} className="text-xs text-muted-foreground pl-3 border-l-2 border-primary/30">
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
