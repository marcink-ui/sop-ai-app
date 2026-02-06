'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Clock,
    Puzzle,
    DollarSign,
    AlertTriangle,
    TrendingUp,
    FileText,
    Bot,
    GitBranch,
    ExternalLink,
    Edit2,
    ArrowLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { MetricsEditor } from './metrics-editor';
import type { NodeMetrics } from '@/hooks/use-workflow-metrics';

interface NodeData {
    id: string;
    type: string;
    label: string;
    dbId?: string;
    dbType?: string;
}

interface ElementDetails {
    id: string;
    name: string;
    type: string;
    description?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;

    // Process Metrics
    timeMinutes?: number;
    complexity?: number;
    costMonthly?: number;
    problemScore?: number;

    // Calculated
    efficiencyScore?: number;
    roiScore?: number;

    // Related items
    relatedSOPs?: { id: string; title: string; code?: string }[];
    assignedAgent?: { id: string; name: string };
    owner?: { id: string; name: string; email: string };
}

interface ElementDetailsPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    nodeData: NodeData | null;
    onEditMetrics?: (nodeId: string) => void;
    readOnly?: boolean;
}

const typeConfig = {
    sop: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    agent: { icon: Bot, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    process: { icon: GitBranch, color: 'text-green-500', bg: 'bg-green-500/10' },
    decision: { icon: GitBranch, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    handoff: { icon: GitBranch, color: 'text-red-500', bg: 'bg-red-500/10' },
};

function MetricCard({
    icon: Icon,
    label,
    value,
    unit,
    color
}: {
    icon: React.ElementType;
    label: string;
    value: number | undefined;
    unit: string;
    color: string;
}) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className={`p-2 rounded-md ${color}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-semibold">
                    {value !== undefined ? `${value} ${unit}` : '—'}
                </p>
            </div>
        </div>
    );
}

export function ElementDetailsPanel({
    open,
    onOpenChange,
    nodeData,
    onEditMetrics,
    readOnly = false,
}: ElementDetailsPanelProps) {
    const [details, setDetails] = useState<ElementDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [initialMetrics, setInitialMetrics] = useState<Partial<NodeMetrics>>({});

    useEffect(() => {
        if (open && nodeData?.dbId && nodeData?.dbType) {
            fetchDetails();
        } else if (!open) {
            setDetails(null);
        }
    }, [open, nodeData?.dbId, nodeData?.dbType]);

    const fetchDetails = async () => {
        if (!nodeData?.dbId || !nodeData?.dbType) return;

        setLoading(true);
        try {
            const response = await fetch(
                `/api/value-chain/elements/${nodeData.dbType}/${nodeData.dbId}`
            );
            if (response.ok) {
                const data = await response.json();
                setDetails(data);
                // Extract metrics for editor
                setInitialMetrics({
                    timeMinutes: data.timeMinutes,
                    complexity: data.complexity,
                    problemScore: data.problemScore,
                    directCostMonthly: data.costMonthly,
                    ...data.metrics // If metrics are nested
                });
            }
        } catch (error) {
            console.error('Failed to fetch element details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMetrics = async (metrics: NodeMetrics) => {
        if (!nodeData?.id) return;

        try {
            const response = await fetch(`/api/value-chain/nodes/${nodeData.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metrics })
            });

            if (response.ok) {
                setEditMode(false);
                // Refresh details
                fetchDetails();
            }
        } catch (error) {
            console.error('Failed to save metrics:', error);
        }
    };

    const config = nodeData?.type ? typeConfig[nodeData.type as keyof typeof typeConfig] : null;
    const Icon = config?.icon || FileText;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        {config && (
                            <div className={`p-2 rounded-lg ${config.bg}`}>
                                <Icon className={`h-5 w-5 ${config.color}`} />
                            </div>
                        )}
                        <div className="flex-1">
                            <SheetTitle className="text-left">
                                {loading ? <Skeleton className="h-6 w-48" /> : (details?.name || nodeData?.label)}
                            </SheetTitle>
                            <SheetDescription className="text-left">
                                {nodeData?.dbType && (
                                    <Badge variant="outline" className="mt-1">
                                        {nodeData.dbType.toUpperCase()}
                                    </Badge>
                                )}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ) : !nodeData?.dbId ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 rounded-full bg-muted mb-4">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">
                            Ten element nie jest połączony z bazą danych.
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Zapisz mapę, aby powiązać go z istniejącym lub nowym rekordem.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Description */}
                        {details?.description && (
                            <div>
                                <h4 className="font-medium mb-2 text-sm text-muted-foreground">Opis</h4>
                                <p className="text-sm">{details.description}</p>
                            </div>
                        )}

                        <Separator />

                        {/* Process Metrics */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-sm text-muted-foreground">
                                    Metryki procesu
                                </h4>
                                {!readOnly && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditMode(!editMode)}
                                    >
                                        {editMode ? (
                                            <><ArrowLeft className="h-3 w-3 mr-1" /> Wróć</>
                                        ) : (
                                            <><Edit2 className="h-3 w-3 mr-1" /> Edytuj</>
                                        )}
                                    </Button>
                                )}
                            </div>

                            {editMode ? (
                                <MetricsEditor
                                    nodeId={nodeData.id}
                                    initialMetrics={initialMetrics}
                                    onSave={handleSaveMetrics}
                                    onCancel={() => setEditMode(false)}
                                    isLoading={loading}
                                />
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <MetricCard
                                        icon={Clock}
                                        label="Czasochłonność"
                                        value={details?.timeMinutes}
                                        unit="min"
                                        color="bg-blue-500/10 text-blue-500"
                                    />
                                    <MetricCard
                                        icon={Puzzle}
                                        label="Złożoność"
                                        value={details?.complexity}
                                        unit="/10"
                                        color="bg-purple-500/10 text-purple-500"
                                    />
                                    <MetricCard
                                        icon={DollarSign}
                                        label="Koszt miesięczny"
                                        value={details?.costMonthly}
                                        unit="PLN"
                                        color="bg-green-500/10 text-green-500"
                                    />
                                    <MetricCard
                                        icon={AlertTriangle}
                                        label="Problemowość"
                                        value={details?.problemScore}
                                        unit="/10"
                                        color="bg-amber-500/10 text-amber-500"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Calculated Scores */}
                        {(details?.efficiencyScore !== undefined || details?.roiScore !== undefined) && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="font-medium mb-3 text-sm text-muted-foreground">
                                        Wskaźniki obliczone
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {details?.efficiencyScore !== undefined && (
                                            <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                                    <span className="text-xs text-muted-foreground">Efektywność</span>
                                                </div>
                                                <p className="text-2xl font-bold text-emerald-600">
                                                    {(details.efficiencyScore * 100).toFixed(0)}%
                                                </p>
                                            </div>
                                        )}
                                        {details?.roiScore !== undefined && (
                                            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <TrendingUp className="h-4 w-4 text-blue-500" />
                                                    <span className="text-xs text-muted-foreground">ROI Potential</span>
                                                </div>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {(details.roiScore * 100).toFixed(0)}%
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Related SOPs */}
                        {details?.relatedSOPs && details.relatedSOPs.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="font-medium mb-3 text-sm text-muted-foreground">
                                        Powiązane SOP
                                    </h4>
                                    <div className="space-y-2">
                                        {details.relatedSOPs.map((sop) => (
                                            <a
                                                key={sop.id}
                                                href={`/sops/${sop.id}`}
                                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors group"
                                            >
                                                <FileText className="h-4 w-4 text-blue-500" />
                                                <span className="flex-1 text-sm">{sop.title}</span>
                                                {sop.code && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {sop.code}
                                                    </Badge>
                                                )}
                                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Owner */}
                        {details?.owner && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="font-medium mb-2 text-sm text-muted-foreground">
                                        Właściciel
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-sm font-medium text-primary">
                                                {details.owner.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{details.owner.name}</p>
                                            <p className="text-xs text-muted-foreground">{details.owner.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Timestamps */}
                        {(details?.createdAt || details?.updatedAt) && (
                            <>
                                <Separator />
                                <div className="text-xs text-muted-foreground space-y-1">
                                    {details.createdAt && (
                                        <p>Utworzono: {new Date(details.createdAt).toLocaleDateString('pl-PL')}</p>
                                    )}
                                    {details.updatedAt && (
                                        <p>Ostatnia edycja: {new Date(details.updatedAt).toLocaleDateString('pl-PL')}</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
