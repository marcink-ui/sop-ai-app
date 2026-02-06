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
    List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { sopDb } from '@/lib/db';
import type { SOP, SOPStep } from '@/lib/types';

export default function SOPViewPage() {
    const params = useParams();
    const router = useRouter();
    const [sop, setSop] = useState<SOP | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const id = params.id as string;
        const foundSop = sopDb.getById(id);
        if (foundSop) {
            setSop(foundSop);
        }
        setLoading(false);
    }, [params.id]);

    const handleDelete = () => {
        if (sop && confirm('Czy na pewno chcesz usunąć tę procedurę?')) {
            sopDb.delete(sop.id);
            router.push('/sops');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (!sop) {
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

    const statusColors: Record<string, string> = {
        draft: 'bg-neutral-800 text-neutral-400',
        generated: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        audited: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        architected: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        'prompt-generated': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        completed: 'bg-green-500/20 text-green-400 border-green-500/30',
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
                            <h1 className="text-2xl font-bold text-foreground">{sop.meta.process_name}</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 className="h-3 w-3" />
                                {sop.meta.department}
                                <span className="text-muted-foreground/50">•</span>
                                <User className="h-3 w-3" />
                                {sop.meta.role}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className={statusColors[sop.status] || statusColors.draft}>
                        {sop.status}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/sops/${sop.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edytuj
                    </Button>
                    <Button size="sm" onClick={() => router.push(`/sops/${sop.id}/pipeline`)} className="bg-blue-600 hover:bg-blue-500">
                        <Play className="mr-2 h-4 w-4" />
                        Kontynuuj Pipeline
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Target className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Wyzwalacz</span>
                    </div>
                    <p className="text-foreground text-sm">{sop.scope?.trigger || 'Nie określono'}</p>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Rezultat</span>
                    </div>
                    <p className="text-foreground text-sm">{sop.scope?.outcome || 'Nie określono'}</p>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Szacowany czas</span>
                    </div>
                    <p className="text-foreground text-sm">{sop.meta.estimated_time || 'Nie określono'}</p>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <GitBranch className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Wersja</span>
                    </div>
                    <p className="text-foreground text-sm">{sop.meta.version}</p>
                </div>
            </div>

            {/* Purpose */}
            {sop.purpose && (
                <div className="rounded-xl border border-border bg-card/50 p-5">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Cel procedury</h3>
                    <p className="text-foreground">{sop.purpose}</p>
                </div>
            )}

            <Separator className="bg-border" />

            {/* Steps */}
            <div>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <List className="h-5 w-5" />
                    Kroki procedury ({sop.steps?.length || 0})
                </h2>
                <div className="space-y-4">
                    {sop.steps && sop.steps.length > 0 ? (
                        sop.steps.map((step: SOPStep, index: number) => (
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

                                        {/* Actions */}
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

                                        {/* Tool */}
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
                    )}
                </div>
            </div>

            {/* Warnings from knowledge base */}
            {sop.knowledge_base?.warnings && sop.knowledge_base.warnings.length > 0 && (
                <>
                    <Separator className="bg-border" />
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                        <h3 className="flex items-center gap-2 text-amber-400 font-medium mb-3">
                            <AlertTriangle className="h-5 w-5" />
                            Ostrzeżenia
                        </h3>
                        <ul className="space-y-2">
                            {sop.knowledge_base.warnings.map((warning: string, i: number) => (
                                <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    {warning}
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}

            {/* Definition of Done */}
            {sop.definition_of_done && sop.definition_of_done.length > 0 && (
                <>
                    <Separator className="bg-border" />
                    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
                        <h3 className="flex items-center gap-2 text-green-400 font-medium mb-3">
                            <CheckCircle2 className="h-5 w-5" />
                            Definition of Done
                        </h3>
                        <ul className="space-y-2">
                            {sop.definition_of_done.map((item: string, i: number) => (
                                <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-foreground">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}
