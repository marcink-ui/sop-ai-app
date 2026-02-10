'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FileText,
    ArrowLeft,
    Edit,
    Play,
    Trash2,
    Clock,
    User,
    Building2,
    Target,
    CheckCircle2,
    AlertTriangle,
    Wrench,
    GitBranch,
    BookOpen,
    List,
    Loader2,
    BarChart3,
    BookMarked,
    Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { sopDb } from '@/lib/db';
import type { SOP, SOPStep } from '@/lib/types';

// Prisma SOP shape from API
interface PrismaSOP {
    id: string;
    title: string;
    code: string;
    version: string;
    status: string;
    purpose: string | null;
    scope: string | null;
    definitions: Record<string, string> | null;
    steps: { order: number; title: string; description: string; responsible: string }[] | null;
    kpis: { name: string; target: string; current: string }[] | null;
    owner: string | null;
    reviewer: string | null;
    department: { id: string; name: string } | null;
    createdBy: { id: string; name: string; email: string } | null;
    updatedBy: { id: string; name: string } | null;
    createdAt: string;
    updatedAt: string;
    versions: { id: string; version: string; changelog: string; createdAt: string }[];
    agents: { agent: { id: string; name: string; code: string; status: string } }[];
    comments: { id: string; content: string; user: { id: string; name: string }; createdAt: string }[];
    tags: { id: string; name: string }[];
}

type SOPData = { type: 'local'; data: SOP } | { type: 'prisma'; data: PrismaSOP };

export default function SOPViewPage() {
    const params = useParams();
    const router = useRouter();
    const [sopData, setSopData] = useState<SOPData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const id = params.id as string;
        loadSOP(id);
    }, [params.id]);

    const loadSOP = async (id: string) => {
        setLoading(true);

        // Try API first (Prisma)
        try {
            const response = await fetch(`/api/sops/${id}`);
            if (response.ok) {
                const data = await response.json();
                if (data.sop) {
                    setSopData({ type: 'prisma', data: data.sop });
                    setLoading(false);
                    return;
                }
            }
        } catch {
            // API not available
        }

        // Fallback to localStorage
        const foundSop = sopDb.getById(id);
        if (foundSop) {
            setSopData({ type: 'local', data: foundSop });
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!sopData) return;
        if (!confirm('Czy na pewno chcesz usunąć tę procedurę?')) return;

        if (sopData.type === 'prisma') {
            try {
                await fetch(`/api/sops/${sopData.data.id}`, { method: 'DELETE' });
            } catch {
                console.error('Failed to delete from API');
            }
        } else {
            sopDb.delete(sopData.data.id);
        }
        router.push('/sops');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!sopData) {
        return (
            <div className="text-center py-16">
                <FileText className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Nie znaleziono procedury</h2>
                <p className="text-muted-foreground mb-4">Procedura o tym ID nie istnieje.</p>
                <Link href="/sops">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Wróć do listy
                    </Button>
                </Link>
            </div>
        );
    }

    // Normalize data from both sources
    const isPrisma = sopData.type === 'prisma';
    const sop = sopData.data;

    const title = isPrisma ? (sop as PrismaSOP).title : (sop as SOP).meta.process_name;
    const department = isPrisma ? (sop as PrismaSOP).department?.name || 'N/A' : (sop as SOP).meta.department;
    const role = isPrisma ? (sop as PrismaSOP).owner || '' : (sop as SOP).meta.role;
    const status = isPrisma ? String((sop as PrismaSOP).status).toLowerCase() : (sop as SOP).status;
    const version = isPrisma ? `v${(sop as PrismaSOP).version}` : (sop as SOP).meta.version;
    const purpose = isPrisma ? (sop as PrismaSOP).purpose : (sop as SOP).purpose;
    const id = sop.id;
    const code = isPrisma ? (sop as PrismaSOP).code : undefined;

    const statusColors: Record<string, string> = {
        draft: 'bg-neutral-800 text-neutral-400',
        generated: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        audited: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        architected: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        'prompt-generated': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        completed: 'bg-green-500/20 text-green-400 border-green-500/30',
        approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/sops">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-500/20 p-2">
                            <FileText className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {code && (
                                    <>
                                        <Badge variant="outline" className="text-xs">{code}</Badge>
                                        <span className="text-muted-foreground/50">•</span>
                                    </>
                                )}
                                <Building2 className="h-3 w-3" />
                                {department}
                                {role && (
                                    <>
                                        <span className="text-muted-foreground/50">•</span>
                                        <User className="h-3 w-3" />
                                        {role}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className={statusColors[status] || statusColors.draft}>
                        {status}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/sops/${id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edytuj
                    </Button>
                    <Button size="sm" onClick={() => router.push(`/sops/${id}/pipeline`)} className="bg-blue-600 hover:bg-blue-500">
                        <Play className="mr-2 h-4 w-4" />
                        Pipeline
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Meta info cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {isPrisma ? (
                    <>
                        <div className="rounded-xl border border-border bg-card/50 p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Users className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wider">Właściciel</span>
                            </div>
                            <p className="text-foreground text-sm">{(sop as PrismaSOP).owner || 'Nie przypisano'}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-card/50 p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <User className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wider">Recenzent</span>
                            </div>
                            <p className="text-foreground text-sm">{(sop as PrismaSOP).reviewer || 'Nie przypisano'}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-card/50 p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Clock className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wider">Utworzono</span>
                            </div>
                            <p className="text-foreground text-sm">{new Date((sop as PrismaSOP).createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-card/50 p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <GitBranch className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wider">Wersja</span>
                            </div>
                            <p className="text-foreground text-sm">{version}</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="rounded-xl border border-border bg-card/50 p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Target className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wider">Wyzwalacz</span>
                            </div>
                            <p className="text-foreground text-sm">{(sop as SOP).scope?.trigger || 'Nie określono'}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-card/50 p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wider">Rezultat</span>
                            </div>
                            <p className="text-foreground text-sm">{(sop as SOP).scope?.outcome || 'Nie określono'}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-card/50 p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Clock className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wider">Szacowany czas</span>
                            </div>
                            <p className="text-foreground text-sm">{(sop as SOP).meta.estimated_time || 'Nie określono'}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-card/50 p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <GitBranch className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wider">Wersja</span>
                            </div>
                            <p className="text-foreground text-sm">{version}</p>
                        </div>
                    </>
                )}
            </div>

            {/* Scope (Prisma) */}
            {isPrisma && (sop as PrismaSOP).scope && (
                <div className="rounded-xl border border-border bg-card/50 p-5">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Zakres</h3>
                    <p className="text-foreground">{(sop as PrismaSOP).scope}</p>
                </div>
            )}

            {/* Purpose */}
            {purpose && (
                <div className="rounded-xl border border-border bg-card/50 p-5">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Cel procedury</h3>
                    <p className="text-foreground">{purpose}</p>
                </div>
            )}

            {/* Definitions (Prisma) */}
            {isPrisma && (sop as PrismaSOP).definitions && Object.keys((sop as PrismaSOP).definitions!).length > 0 && (
                <>
                    <Separator className="bg-border" />
                    <div>
                        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <BookMarked className="h-5 w-5" />
                            Definicje
                        </h2>
                        <div className="grid gap-3">
                            {Object.entries((sop as PrismaSOP).definitions!).map(([term, definition]) => (
                                <div key={term} className="rounded-xl border border-border bg-card/50 p-4">
                                    <span className="font-semibold text-foreground">{term}:</span>{' '}
                                    <span className="text-muted-foreground">{definition}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <Separator className="bg-border" />

            {/* Steps */}
            <div>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <List className="h-5 w-5" />
                    Kroki procedury
                </h2>
                <div className="space-y-4">
                    {isPrisma ? (
                        // Prisma steps
                        (sop as PrismaSOP).steps && (sop as PrismaSOP).steps!.length > 0 ? (
                            (sop as PrismaSOP).steps!.map((step, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl border border-border bg-card/50 p-5 transition-colors hover:bg-card/80"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold text-sm">
                                            {step.order || index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                                            <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                                            {step.responsible && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <Badge variant="outline" className="text-xs">
                                                        {step.responsible}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <BookOpen className="mx-auto h-12 w-12 opacity-20 mb-3" />
                                <p>Brak zdefiniowanych kroków</p>
                            </div>
                        )
                    ) : (
                        // Local steps
                        (sop as SOP).steps && (sop as SOP).steps.length > 0 ? (
                            (sop as SOP).steps.map((step: SOPStep, index: number) => (
                                <div
                                    key={step.id || index}
                                    className="rounded-xl border border-border bg-card/50 p-5 transition-colors hover:bg-card/80"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold text-sm">
                                            {step.id || index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground mb-2">{step.name}</h3>
                                            {step.actions && step.actions.length > 0 && (
                                                <div className="mb-3">
                                                    <ul className="space-y-1 text-sm text-muted-foreground">
                                                        {step.actions.map((action: string, i: number) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                                <span className="text-foreground">{action}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {step.tool && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Wrench className="h-4 w-4 text-muted-foreground" />
                                                    <Badge variant="outline" className="text-xs">
                                                        {step.tool}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <BookOpen className="mx-auto h-12 w-12 opacity-20 mb-3" />
                                <p>Brak zdefiniowanych kroków</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* KPIs (Prisma) */}
            {isPrisma && (sop as PrismaSOP).kpis && (sop as PrismaSOP).kpis!.length > 0 && (
                <>
                    <Separator className="bg-border" />
                    <div>
                        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            KPI
                        </h2>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {(sop as PrismaSOP).kpis!.map((kpi, index) => (
                                <div key={index} className="rounded-xl border border-border bg-card/50 p-4">
                                    <p className="text-sm text-muted-foreground mb-1">{kpi.name}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-bold text-foreground">{kpi.current}</span>
                                        <span className="text-sm text-muted-foreground">/ cel: {kpi.target}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Warnings (local) */}
            {!isPrisma && (sop as SOP).knowledge_base?.warnings && (sop as SOP).knowledge_base.warnings.length > 0 && (
                <>
                    <Separator className="bg-border" />
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                        <h3 className="flex items-center gap-2 text-amber-400 font-medium mb-3">
                            <AlertTriangle className="h-5 w-5" />
                            Ostrzeżenia
                        </h3>
                        <ul className="space-y-2">
                            {(sop as SOP).knowledge_base.warnings.map((warning: string, i: number) => (
                                <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    {warning}
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}

            {/* Definition of Done (local) */}
            {!isPrisma && (sop as SOP).definition_of_done && (sop as SOP).definition_of_done.length > 0 && (
                <>
                    <Separator className="bg-border" />
                    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
                        <h3 className="flex items-center gap-2 text-green-400 font-medium mb-3">
                            <CheckCircle2 className="h-5 w-5" />
                            Definition of Done
                        </h3>
                        <ul className="space-y-2">
                            {(sop as SOP).definition_of_done.map((item: string, i: number) => (
                                <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-foreground">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}

            {/* Version History (Prisma) */}
            {isPrisma && (sop as PrismaSOP).versions && (sop as PrismaSOP).versions.length > 0 && (
                <>
                    <Separator className="bg-border" />
                    <div>
                        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <GitBranch className="h-5 w-5" />
                            Historia wersji
                        </h2>
                        <div className="space-y-2">
                            {(sop as PrismaSOP).versions.map((v) => (
                                <div key={v.id} className="rounded-xl border border-border bg-card/50 p-4 flex items-center justify-between">
                                    <div>
                                        <span className="font-medium text-foreground">v{v.version}</span>
                                        <span className="text-muted-foreground text-sm ml-3">{v.changelog}</span>
                                    </div>
                                    <span className="text-muted-foreground text-sm">{new Date(v.createdAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
