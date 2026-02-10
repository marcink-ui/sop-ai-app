'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Search,
    Clock,
    AlertTriangle,
    TrendingUp,
    Zap,
    Target,
    User,
    BarChart3,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mudaDb, sopDb } from '@/lib/db';
import type { MudaReport, WasteItem } from '@/lib/types';

const mudaTypeColors: Record<string, string> = {
    transport: 'bg-red-500/20 text-red-400',
    inventory: 'bg-orange-500/20 text-orange-400',
    motion: 'bg-yellow-500/20 text-yellow-400',
    waiting: 'bg-green-500/20 text-green-400',
    overproduction: 'bg-cyan-500/20 text-cyan-400',
    overprocessing: 'bg-purple-500/20 text-purple-400',
    defects: 'bg-pink-500/20 text-pink-400',
};

const automationColors: Record<string, string> = {
    none: 'bg-neutral-500/20 text-neutral-400',
    low: 'bg-yellow-500/20 text-yellow-400',
    medium: 'bg-blue-500/20 text-blue-400',
    high: 'bg-green-500/20 text-green-400',
    full: 'bg-emerald-500/20 text-emerald-400',
};

export default function MUDADetailPage() {
    const params = useParams();
    const router = useRouter();
    const [report, setReport] = useState<MudaReport | null>(null);
    const [sopName, setSopName] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const id = params.id as string;
        const allReports = mudaDb.getAll();
        const found = allReports.find((r: MudaReport) => r.id === id);

        if (found) {
            setReport(found);
            const sop = sopDb.getAll().find((s: { id: string }) => s.id === found.sop_id);
            setSopName(sop?.meta?.process_name || 'Unknown SOP');
        }
        setLoading(false);
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!report) {
        return (
            <div className="text-center py-16">
                <Search className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Raport MUDA nie znaleziony</h2>
                <p className="text-muted-foreground mb-4">Raport o tym ID nie istnieje.</p>
                <Link href="/muda">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Wróć do listy
                    </Button>
                </Link>
            </div>
        );
    }

    const totalSavingHours = Math.round((report.summary?.total_potential_saving_min || 0) / 60);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/muda">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-orange-500/20 p-2">
                            <Search className="h-6 w-6 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Raport MUDA</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>SOP: {sopName}</span>
                                {report.meta && (
                                    <>
                                        <span className="text-muted-foreground/50">•</span>
                                        <span>{report.meta.analyzed_date}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Problemy</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{report.summary?.total_muda_count || report.waste_identified.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Oszczędność czasu</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400">{totalSavingHours}h/mies.</p>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Zap className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Automatyzacja</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{report.summary?.automation_score || 'N/A'}</p>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <User className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Analityk</span>
                    </div>
                    <p className="text-foreground text-sm font-medium">{report.meta?.analyst || 'AI'}</p>
                </div>
            </div>

            {/* Waste types distribution */}
            <div className="rounded-xl border border-border bg-card/50 p-5">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Typy marnotrawstwa</h3>
                <div className="flex flex-wrap gap-2">
                    {[...new Set(report.waste_identified.map(w => w.muda_type))].map((type) => {
                        const count = report.waste_identified.filter(w => w.muda_type === type).length;
                        const colorClass = mudaTypeColors[type.toLowerCase()] || 'bg-neutral-500/20 text-neutral-400';
                        return (
                            <Badge key={type} className={colorClass}>
                                {type} ({count})
                            </Badge>
                        );
                    })}
                </div>
            </div>

            <Separator className="bg-border" />

            {/* Waste items */}
            <div>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Zidentyfikowane marnotrawstwo ({report.waste_identified.length})
                </h2>
                <div className="space-y-4">
                    {report.waste_identified.map((waste: WasteItem, index: number) => {
                        const colorClass = mudaTypeColors[waste.muda_type.toLowerCase()] || '';
                        const autoColor = automationColors[waste.automation_potential] || automationColors.none;
                        return (
                            <div
                                key={index}
                                className="rounded-xl border border-border bg-card/50 p-5 transition-colors hover:bg-card/80"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-semibold text-sm">
                                        {waste.step_id}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className={colorClass}>{waste.muda_type}</Badge>
                                            <Badge className={autoColor}>
                                                <Zap className="h-3 w-3 mr-1" />
                                                {waste.automation_potential}
                                            </Badge>
                                            <span className="text-sm text-green-400 ml-auto">
                                                -{Math.round(waste.time_saving_sec / 60)} min
                                            </span>
                                        </div>
                                        <p className="text-foreground mb-2">{waste.problem}</p>
                                        <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                            <TrendingUp className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs text-emerald-400 uppercase tracking-wider font-medium">Propozycja Kaizen</span>
                                                <p className="text-foreground text-sm mt-1">{waste.kaizen_proposal}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Optimizations applied */}
            {report.optimizations_applied && report.optimizations_applied.length > 0 && (
                <>
                    <Separator className="bg-border" />
                    <div>
                        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5" />
                            Zastosowane optymalizacje ({report.optimizations_applied.length})
                        </h2>
                        <div className="space-y-3">
                            {report.optimizations_applied.map((opt, index) => (
                                <div key={index} className="rounded-xl border border-border bg-card/50 p-4 flex items-start gap-3">
                                    <Badge variant="outline" className="text-xs shrink-0 mt-0.5">
                                        Krok {opt.original_step}
                                    </Badge>
                                    <div>
                                        <Badge className="bg-cyan-500/20 text-cyan-400 mb-1">{opt.change_type}</Badge>
                                        <p className="text-foreground text-sm">{opt.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Escalations */}
            {report.escalations && report.escalations.length > 0 && (
                <>
                    <Separator className="bg-border" />
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                        <h3 className="flex items-center gap-2 text-amber-400 font-medium mb-3">
                            <AlertTriangle className="h-5 w-5" />
                            Eskalacje ({report.escalations.length})
                        </h3>
                        <div className="space-y-3">
                            {report.escalations.map((esc, index) => (
                                <div key={index} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                    <p className="text-foreground font-medium text-sm">{esc.issue}</p>
                                    <p className="text-muted-foreground text-sm mt-1">{esc.reason}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <User className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Sugerowany właściciel: {esc.suggested_owner}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
