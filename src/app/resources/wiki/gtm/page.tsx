'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    ArrowRight,
    Target,
    Rocket,
    TrendingUp,
    CheckCircle2,
    Clock,
    Users,
    DollarSign,
    BarChart3,
    Lightbulb,
    Zap,
} from 'lucide-react';

// GTM Framework Phases
const GTM_PHASES = [
    {
        id: 'discovery',
        name: 'Discovery',
        subtitle: 'Odkrywanie Potencjału',
        icon: Lightbulb,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        duration: '2-4 tygodnie',
        description: 'Diagnoza obecnego stanu, identyfikacja quick wins, budowanie business case.',
        activities: [
            'Audyt procesów i dokumentacji',
            'Mapowanie value chain',
            'Identyfikacja 7 typów MUDA',
            'Wywiady z kluczowymi stakeholderami',
            'Analiza danych operacyjnych',
        ],
        deliverables: [
            'Raport Discovery',
            'Mapa procesów (As-Is)',
            'Lista Quick Wins (Top 10)',
            'Business Case z ROI',
            'Roadmapa transformacji',
        ],
        kpis: [
            'Liczba zidentyfikowanych procesów',
            'Potencjał oszczędności (PLN)',
            'Czas do pierwszego ROI',
        ],
    },
    {
        id: 'pilot',
        name: 'Pilot',
        subtitle: 'Pierwszy Sukces',
        icon: Rocket,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        duration: '4-8 tygodni',
        description: 'Wdrożenie pierwszego procesu z AI, proof of concept, budowanie know-how.',
        activities: [
            'Wybór procesu pilotażowego',
            'Dokumentacja SOP z AI',
            'Projektowanie AI agenta',
            'Iteracyjne testy i optymalizacja',
            'Szkolenie zespołu pilotażowego',
        ],
        deliverables: [
            'Działający AI agent (MVP)',
            'Zoptymalizowane SOP',
            'Metryki przed/po',
            'Lessons Learned',
            'Go/No-Go dla skalowania',
        ],
        kpis: [
            'Redukcja czasu procesu (%)',
            'Jakość outputu (accuracy)',
            'Adopcja przez zespół (%)',
        ],
    },
    {
        id: 'scale',
        name: 'Scale',
        subtitle: 'Skalowanie Sukcesu',
        icon: TrendingUp,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        duration: '3-6 miesięcy',
        description: 'Rozszerzenie na kolejne procesy, budowanie Center of Excellence, pełna integracja.',
        activities: [
            'Roll-out na kolejne procesy',
            'Budowanie biblioteki agentów',
            'Integracja z systemami IT',
            'Automatyzacja workflow',
            'Change management org-wide',
        ],
        deliverables: [
            'Zautomatyzowane procesy (10+)',
            'Center of Excellence',
            'Knowledge base (wiki)',
            'Governance framework',
            'Ciągły monitoring ROI',
        ],
        kpis: [
            'Liczba zautomatyzowanych procesów',
            'Total ROI (PLN)',
            'Czas zaoszczędzony (FTE)',
        ],
    },
];

// Success Metrics
const SUCCESS_METRICS = [
    { icon: Clock, label: 'Czas', value: 'Redukcja 40-60%', description: 'Lead time procesów' },
    { icon: DollarSign, label: 'Koszty', value: 'Oszczędność 25-40%', description: 'Koszty operacyjne' },
    { icon: Users, label: 'FTE', value: 'Uwolnienie 20-30%', description: 'Czasu na wartość' },
    { icon: BarChart3, label: 'Jakość', value: 'Poprawa 50-80%', description: 'Consistency i accuracy' },
];

export default function GTMPage() {
    const [activePhase, setActivePhase] = useState<string>('discovery');

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card/50">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/resources/wiki">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Wiki
                            </Button>
                        </Link>
                        <Badge variant="outline">Fundamenty</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                            <Target className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">GTM - Go-to-Market Framework</h1>
                            <p className="text-muted-foreground">
                                Strategia wejścia na rynek dla transformacji AI
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Intro Section */}
                <Card className="mb-8">
                    <CardContent className="pt-6">
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Framework GTM (Go-to-Market) dla VantageOS definiuje strategiczne podejście
                                do wdrażania transformacji AI w organizacji. Składa się z trzech głównych faz:
                                <strong className="text-foreground"> Discovery → Pilot → Scale</strong>,
                                każda z jasno określonymi celami, deliverables i KPIs.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Phase Navigation */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                    {GTM_PHASES.map((phase, index) => {
                        const Icon = phase.icon;
                        return (
                            <motion.button
                                key={phase.id}
                                onClick={() => setActivePhase(phase.id)}
                                className={`flex items-center gap-3 px-5 py-3 rounded-xl border transition-all min-w-fit ${activePhase === phase.id
                                        ? `${phase.bgColor} ${phase.borderColor} border-2`
                                        : 'border-border hover:border-primary/30 bg-card'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className={`p-2 rounded-lg ${phase.bgColor}`}>
                                    <Icon className={`h-5 w-5 ${phase.color}`} />
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground font-medium">
                                            Faza {index + 1}
                                        </span>
                                    </div>
                                    <span className="font-semibold">{phase.name}</span>
                                </div>
                                {index < GTM_PHASES.length - 1 && (
                                    <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Active Phase Details */}
                {GTM_PHASES.map((phase) => {
                    if (phase.id !== activePhase) return null;
                    const Icon = phase.icon;

                    return (
                        <motion.div
                            key={phase.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
                        >
                            {/* Main Info */}
                            <Card className={`lg:col-span-2 ${phase.borderColor} border-2`}>
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${phase.bgColor}`}>
                                            <Icon className={`h-8 w-8 ${phase.color}`} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">{phase.name}</CardTitle>
                                            <CardDescription className="text-base">
                                                {phase.subtitle}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline" className="ml-auto">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {phase.duration}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-6">{phase.description}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Activities */}
                                        <div>
                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                <Zap className="h-4 w-4 text-primary" />
                                                Kluczowe Aktywności
                                            </h4>
                                            <ul className="space-y-2">
                                                {phase.activities.map((activity, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm">
                                                        <CheckCircle2 className={`h-4 w-4 mt-0.5 ${phase.color}`} />
                                                        <span>{activity}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Deliverables */}
                                        <div>
                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                <Target className="h-4 w-4 text-primary" />
                                                Deliverables
                                            </h4>
                                            <ul className="space-y-2">
                                                {phase.deliverables.map((deliverable, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm">
                                                        <ArrowRight className={`h-4 w-4 mt-0.5 ${phase.color}`} />
                                                        <span>{deliverable}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* KPIs Sidebar */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-primary" />
                                        KPIs Fazy
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-4">
                                        {phase.kpis.map((kpi, i) => (
                                            <li key={i} className="pb-3 border-b border-border last:border-0 last:pb-0">
                                                <div className={`text-sm font-medium ${phase.color}`}>
                                                    KPI {i + 1}
                                                </div>
                                                <div className="text-base">{kpi}</div>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}

                {/* Success Metrics */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            Typowe Wyniki Transformacji
                        </CardTitle>
                        <CardDescription>
                            Benchmarki oparte na wdrożeniach VantageOS
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {SUCCESS_METRICS.map((metric, i) => {
                                const Icon = metric.icon;
                                return (
                                    <div
                                        key={i}
                                        className="text-center p-4 rounded-xl bg-muted/30 border border-border"
                                    >
                                        <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                                        <div className="text-2xl font-bold text-emerald-500">
                                            {metric.value}
                                        </div>
                                        <div className="text-sm font-medium">{metric.label}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {metric.description}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* CTA */}
                <div className="text-center py-8">
                    <h3 className="text-xl font-semibold mb-2">Gotowy na transformację?</h3>
                    <p className="text-muted-foreground mb-4">
                        Zacznij od Discovery - pierwszego kroku do AI-powered organization.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/value-chain">
                            <Button>
                                <Target className="h-4 w-4 mr-2" />
                                Mapuj Value Chain
                            </Button>
                        </Link>
                        <Link href="/sops">
                            <Button variant="outline">
                                Przeglądaj SOPs
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
