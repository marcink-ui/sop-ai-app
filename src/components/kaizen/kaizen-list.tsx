'use client';

import { useEffect, useState } from 'react';
import { Lightbulb, Clock, CheckCircle2, XCircle, Archive, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface KaizenSuggestion {
    id: string;
    title: string;
    description: string;
    category: 'APPLICATION' | 'COMPANY_PROCESS';
    status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'IMPLEMENTED' | 'REJECTED' | 'ARCHIVED';
    priority: number;
    submissionReward: number;
    implementReward: number | null;
    createdAt: string;
    reviewNote: string | null;
    submitter: { id: string; name: string | null; email: string };
    reviewer: { id: string; name: string | null; email: string } | null;
}

const STATUS_CONFIG = {
    PENDING: { label: 'Oczekuje', icon: Clock, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    IN_REVIEW: { label: 'W analizie', icon: Loader2, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    APPROVED: { label: 'Zaakceptowane', icon: CheckCircle2, color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    IMPLEMENTED: { label: 'Wdrożone', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
    REJECTED: { label: 'Odrzucone', icon: XCircle, color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
    ARCHIVED: { label: 'Zarchiwizowane', icon: Archive, color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
};

const CATEGORY_LABELS = {
    APPLICATION: 'Aplikacja',
    COMPANY_PROCESS: 'Proces firmowy',
};

interface KaizenListProps {
    myOnly?: boolean;
    refreshKey?: number;
    status?: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'IMPLEMENTED' | 'REJECTED' | 'ARCHIVED';
}

export function KaizenList({ myOnly = false, refreshKey, status }: KaizenListProps) {
    const [suggestions, setSuggestions] = useState<KaizenSuggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (myOnly) params.set('myOnly', 'true');
                if (status) params.set('status', status);

                const response = await fetch(`/api/kaizen?${params}`);
                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data);
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [myOnly, refreshKey, status]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (suggestions.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Brak zgłoszonych pomysłów</p>
                <p className="text-sm">Zgłoś swój pierwszy pomysł Kaizen!</p>
            </div>
        );
    }

    const totalPandas = suggestions.reduce((sum, s) =>
        sum + s.submissionReward + (s.implementReward || 0), 0
    );

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Twoje pomysły</CardTitle>
                        <CardDescription>
                            {suggestions.length} zgłoszeń • Łącznie {totalPandas} 🐼
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {suggestions.map((suggestion) => {
                    const statusConfig = STATUS_CONFIG[suggestion.status];
                    const StatusIcon = statusConfig.icon;
                    const isExpanded = expandedId === suggestion.id;

                    return (
                        <div
                            key={suggestion.id}
                            className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="outline" className={cn('text-xs', statusConfig.color)}>
                                            <StatusIcon className="h-3 w-3 mr-1" />
                                            {statusConfig.label}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            {CATEGORY_LABELS[suggestion.category]}
                                        </Badge>
                                        {suggestion.implementReward && (
                                            <Badge className="text-xs bg-amber-500 hover:bg-amber-600">
                                                +{suggestion.implementReward} 🐼 bonus
                                            </Badge>
                                        )}
                                    </div>
                                    <h4 className="font-medium mt-2 truncate">{suggestion.title}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(suggestion.createdAt).toLocaleDateString('pl-PL')}
                                        {' • '}+{suggestion.submissionReward} 🐼
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setExpandedId(isExpanded ? null : suggestion.id)}
                                >
                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                            </div>

                            {isExpanded && (
                                <div className="mt-3 pt-3 border-t space-y-2">
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {suggestion.description}
                                    </p>
                                    {suggestion.reviewNote && (
                                        <div className="p-2 rounded bg-muted text-sm">
                                            <strong>Notatka:</strong> {suggestion.reviewNote}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
