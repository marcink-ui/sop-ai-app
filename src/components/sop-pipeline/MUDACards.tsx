'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    Truck,
    Package,
    Move,
    Clock,
    Factory,
    Settings,
    Bug,
    Brain,
    ChevronDown,
    ChevronUp,
    Lightbulb,
} from 'lucide-react';
import { useState } from 'react';

// ============================================================
// Types
// ============================================================
export interface MUDAFinding {
    type: 'TRANSPORT' | 'INVENTORY' | 'MOTION' | 'WAITING' | 'OVERPRODUCTION' | 'OVERPROCESSING' | 'DEFECTS' | 'TALENT';
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    stepNr?: number;
    description: string;
    kaizen: string;
    estimatedSaving?: string;
}

interface MUDACardsProps {
    findings: MUDAFinding[];
    overallScore?: number;
    summary?: string;
}

// ============================================================
// MUDA type config
// ============================================================
const MUDA_CONFIG: Record<string, { icon: typeof Truck; color: string; bgColor: string; label: string }> = {
    TRANSPORT: { icon: Truck, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-500/20', label: 'Transport' },
    INVENTORY: { icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-500/20', label: 'Zapasy' },
    MOTION: { icon: Move, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-500/20', label: 'Ruch' },
    WAITING: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-500/20', label: 'Oczekiwanie' },
    OVERPRODUCTION: { icon: Factory, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-500/20', label: 'Nadprodukcja' },
    OVERPROCESSING: { icon: Settings, color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-500/20', label: 'Przetwarzanie' },
    DEFECTS: { icon: Bug, color: 'text-rose-600', bgColor: 'bg-rose-100 dark:bg-rose-500/20', label: 'Defekty' },
    TALENT: { icon: Brain, color: 'text-teal-600', bgColor: 'bg-teal-100 dark:bg-teal-500/20', label: 'Talent' },
};

const SEVERITY_CONFIG: Record<string, { color: string; label: string }> = {
    HIGH: { color: 'bg-red-500 text-white', label: 'Wysoki' },
    MEDIUM: { color: 'bg-amber-500 text-white', label: 'Średni' },
    LOW: { color: 'bg-green-500 text-white', label: 'Niski' },
};

// ============================================================
// Component
// ============================================================
export function MUDACards({ findings, overallScore, summary }: MUDACardsProps) {
    const [expandedCard, setExpandedCard] = useState<number | null>(null);

    const grouped = findings.reduce((acc, f) => {
        const sev = f.severity || 'MEDIUM';
        if (!acc[sev]) acc[sev] = [];
        acc[sev].push(f);
        return acc;
    }, {} as Record<string, MUDAFinding[]>);

    return (
        <div className="space-y-4">
            {/* Header with score */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Analiza MUDA</h3>
                <div className="flex items-center gap-2">
                    {overallScore !== undefined && (
                        <Badge variant="outline" className={cn(
                            "font-mono",
                            overallScore >= 7 ? "border-green-500 text-green-600" :
                                overallScore >= 4 ? "border-amber-500 text-amber-600" :
                                    "border-red-500 text-red-600"
                        )}>
                            Ocena: {overallScore}/10
                        </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                        {findings.length} znalezisk
                    </Badge>
                </div>
            </div>

            {/* Summary */}
            {summary && (
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                    {summary}
                </p>
            )}

            {/* Finding cards */}
            <div className="space-y-2">
                {findings.map((finding, index) => {
                    const config = MUDA_CONFIG[finding.type] || MUDA_CONFIG.DEFECTS;
                    const sevConfig = SEVERITY_CONFIG[finding.severity] || SEVERITY_CONFIG.MEDIUM;
                    const Icon = config.icon;
                    const isExpanded = expandedCard === index;

                    return (
                        <Card
                            key={index}
                            className={cn(
                                "transition-all cursor-pointer hover:shadow-md",
                                finding.severity === 'HIGH' && "border-red-200 dark:border-red-500/30"
                            )}
                            onClick={() => setExpandedCard(isExpanded ? null : index)}
                        >
                            <CardContent className="p-3">
                                <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    <div className={cn(
                                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                                        config.bgColor
                                    )}>
                                        <Icon className={cn("h-4 w-4", config.color)} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium">{config.label}</span>
                                            <Badge className={cn("text-[10px] px-1.5 py-0", sevConfig.color)}>
                                                {sevConfig.label}
                                            </Badge>
                                            {finding.stepNr && (
                                                <Badge variant="outline" className="text-[10px]">
                                                    Krok {finding.stepNr}
                                                </Badge>
                                            )}
                                            {finding.estimatedSaving && (
                                                <Badge variant="secondary" className="text-[10px]">
                                                    💰 {finding.estimatedSaving}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {finding.description}
                                        </p>

                                        {/* Kaizen suggestion (expanded) */}
                                        {isExpanded && (
                                            <div className="mt-3 p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Lightbulb className="h-3 w-3 text-emerald-600" />
                                                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                        Propozycja Kaizen
                                                    </span>
                                                </div>
                                                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                                                    {finding.kaizen}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expand/collapse */}
                                    <div className="shrink-0 pt-1">
                                        {isExpanded ? (
                                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
