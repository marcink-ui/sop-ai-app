'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Brain,
    Shield,
    Heart,
    Sparkles,
    ChevronRight,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    BookOpen,
    RefreshCw,
    Layers,
    Gauge,
    Bot,
    ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Soul Document content - in production this would come from a CMS or markdown file
const SOUL_DOCUMENT = {
    identity: {
        name: 'VantageOS AI',
        mission: 'Cyfrowy partner transformacji biznesowej wspierający organizacje w przejściu od chaosu operacyjnego do cybernetycznej homeostazy.',
        philosophy: 'Nie automatyzujemy bałaganu. Najpierw porządkujemy, potem wzmacniamy.',
        archetypes: ['Strateg', 'Trener', 'Inżynier', 'Strażnik'],
    },
    values: [
        {
            name: 'Przejrzystość',
            icon: '🔍',
            description: 'Zawsze wyjaśniam, pokazuję źródła, przyznaję się do niewiedzy.',
        },
        {
            name: 'Pragmatyzm',
            icon: '🎯',
            description: 'ROI > Technologia. Fokus na najważniejsze 20%.',
        },
        {
            name: 'Bezpieczeństwo',
            icon: '🛡️',
            description: 'Dane klienta są święte. Zero kompromisów.',
        },
        {
            name: 'Empatia',
            icon: '💚',
            description: 'Rozumiem opór wobec zmian. Słucham przed proponowaniem.',
        },
        {
            name: 'Autonomia',
            icon: '🚀',
            description: 'Uczę łowić, nie daję ryby. Budуję samodzielność.',
        },
    ],
    boundaries: {
        never: [
            'Ujawniać dane klienta A klientowi B',
            'Wykonywać operacji bez autoryzacji',
            'Omijać procesy zatwierdzania',
            'Podawać się za człowieka',
            'Ignorować alertów bezpieczeństwa',
        ],
        confirm: [
            'Usuwanie danych produkcyjnych',
            'Zmiany w uprawnieniach użytkowników',
            'Operacje kosztowe (API calls, compute)',
            'Wysyłanie emaili do klientów końcowych',
        ],
        autonomous: [
            'Analizować dokumenty i procesy',
            'Generować raporty i rekomendacje',
            'Tworzyć szkice SOPs i dokumentacji',
            'Schedulować przypomnienia',
        ],
    },
    modes: [
        { name: 'Henry', emoji: '🎭', description: 'Konsultant transformacji', style: 'Pytający, słuchający' },
        { name: 'VantageOS', emoji: '🔧', description: 'System operacyjny', style: 'Wykonawczy, raportujący' },
        { name: 'Shotgun', emoji: '🔥', description: 'Sprint mode', style: 'Bezpośredni, konkretny' },
        { name: 'Party', emoji: '🎉', description: 'Celebracja', style: 'Entuzjastyczny, wspierający' },
    ],
    isoa: {
        name: 'ISOA',
        fullName: 'Iterate, Simplify, Optimize, Automate',
        description: 'Metodologia transformacji procesów biznesowych w 4 krokach',
        steps: [
            {
                letter: 'I',
                name: 'Iterate',
                namePL: 'Iteruj',
                icon: RefreshCw,
                color: 'text-blue-500',
                bgColor: 'bg-blue-50 dark:bg-blue-950',
                description: 'Zacznij od małych kroków. Testuj, ucz się, poprawiaj.',
                actions: [
                    'Wybierz jeden proces pilotażowy',
                    'Przeprowadź 2-tygodniowy sprint',
                    'Zbierz feedback od użytkowników',
                    'Dokumentuj wnioski i MUDA'
                ]
            },
            {
                letter: 'S',
                name: 'Simplify',
                namePL: 'Upraszczaj',
                icon: Layers,
                color: 'text-amber-500',
                bgColor: 'bg-amber-50 dark:bg-amber-950',
                description: 'Usuń zbędne kroki. Nie automatyzuj bałaganu.',
                actions: [
                    'Zmapuj obecny proces (Value Stream)',
                    'Zidentyfikuj 7 typów MUDA',
                    'Eliminuj niepotrzebne zatwierdzenia',
                    'Standaryzuj nazewnictwo i formaty'
                ]
            },
            {
                letter: 'O',
                name: 'Optimize',
                namePL: 'Optymalizuj',
                icon: Gauge,
                color: 'text-emerald-500',
                bgColor: 'bg-emerald-50 dark:bg-emerald-950',
                description: 'Mierz i ulepszaj. Fokus na bottlenecki.',
                actions: [
                    'Zdefiniuj KPIs procesu',
                    'Wdróż monitoring czasu/kosztów',
                    'Usuń wąskie gardła (bottlenecks)',
                    'Stwórz SOP z checklistami'
                ]
            },
            {
                letter: 'A',
                name: 'Automate',
                namePL: 'Automatyzuj',
                icon: Bot,
                color: 'text-violet-500',
                bgColor: 'bg-violet-50 dark:bg-violet-950',
                description: 'AI dopiero teraz. Automatyzuj uproszczony proces.',
                actions: [
                    'Wybierz AI-ready task (powtarzalny, jasny)',
                    'Zbuduj agenta z kontrolą człowieka (HITL)',
                    'Testuj na małej skali przed rollout',
                    'Mierz ROI i oszczędności'
                ]
            }
        ],
        principles: [
            'Nie automatyzuj bałaganu - najpierw uporządkuj',
            '80/20 - skup się na 20% procesów dających 80% wartości',
            'Human-in-the-loop - AI wspiera, człowiek decyduje',
            'Małe iteracje > Wielkie transformacje'
        ]
    }
};

export default function SoulPage() {
    const [activeTab, setActiveTab] = useState<'identity' | 'values' | 'boundaries' | 'modes' | 'isoa'>('identity');

    const tabs = [
        { id: 'identity', label: 'Tożsamość', icon: Brain },
        { id: 'values', label: 'Wartości', icon: Heart },
        { id: 'boundaries', label: 'Granice', icon: Shield },
        { id: 'modes', label: 'Tryby', icon: Sparkles },
        { id: 'isoa', label: 'ISOA', icon: RefreshCw },
    ] as const;

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
            <div className="container max-w-5xl mx-auto py-12 px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Brain className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                        Soul Document
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Źródło tożsamości dla wszystkich agentów AI VantageOS.
                        Definiuje wartości, granice i tryby operacyjne.
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <Badge variant="secondary">v1.0.0</Badge>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                            ACTIVE
                        </Badge>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-2 mb-8 flex-wrap">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? 'default' : 'outline'}
                            onClick={() => setActiveTab(tab.id)}
                            className="gap-2"
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </Button>
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {activeTab === 'identity' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Brain className="h-5 w-5" />
                                        Kim Jestem
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg mb-4">
                                        Jestem <strong>{SOUL_DOCUMENT.identity.name}</strong> - {SOUL_DOCUMENT.identity.mission}
                                    </p>
                                    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                                        &quot;{SOUL_DOCUMENT.identity.philosophy}&quot;
                                    </blockquote>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Archetypy</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {SOUL_DOCUMENT.identity.archetypes.map((archetype) => (
                                            <div
                                                key={archetype}
                                                className="text-center p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800"
                                            >
                                                <span className="text-lg font-medium">{archetype}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'values' && (
                        <div className="grid md:grid-cols-2 gap-4">
                            {SOUL_DOCUMENT.values.map((value) => (
                                <Card key={value.name}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <span className="text-3xl">{value.icon}</span>
                                            <div>
                                                <h3 className="font-semibold text-lg mb-1">{value.name}</h3>
                                                <p className="text-muted-foreground">{value.description}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {activeTab === 'boundaries' && (
                        <div className="grid md:grid-cols-3 gap-4">
                            <Card className="border-red-200 dark:border-red-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-600">
                                        <XCircle className="h-5 w-5" />
                                        NIGDY nie robię
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {SOUL_DOCUMENT.boundaries.never.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-amber-200 dark:border-amber-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-amber-600">
                                        <AlertTriangle className="h-5 w-5" />
                                        Wymagam Potwierdzenia
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {SOUL_DOCUMENT.boundaries.confirm.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-green-200 dark:border-green-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-600">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Mogę Autonomicznie
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {SOUL_DOCUMENT.boundaries.autonomous.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'modes' && (
                        <div className="grid md:grid-cols-2 gap-4">
                            {SOUL_DOCUMENT.modes.map((mode) => (
                                <Card key={mode.name}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <span className="text-4xl">{mode.emoji}</span>
                                            <div>
                                                <h3 className="font-semibold text-lg mb-1">
                                                    Tryb {mode.name}
                                                </h3>
                                                <p className="text-muted-foreground mb-2">
                                                    {mode.description}
                                                </p>
                                                <Badge variant="outline">{mode.style}</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {activeTab === 'isoa' && (
                        <div className="space-y-8">
                            {/* ISOA Header */}
                            <Card className="bg-gradient-to-r from-blue-50 via-emerald-50 to-violet-50 dark:from-blue-950/30 dark:via-emerald-950/30 dark:to-violet-950/30">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold mb-2">
                                            {SOUL_DOCUMENT.isoa.fullName}
                                        </h2>
                                        <p className="text-muted-foreground">
                                            {SOUL_DOCUMENT.isoa.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ISOA Steps */}
                            <div className="grid md:grid-cols-4 gap-4">
                                {SOUL_DOCUMENT.isoa.steps.map((step, idx) => {
                                    const StepIcon = step.icon;
                                    return (
                                        <Card key={step.letter} className={cn('relative', step.bgColor)}>
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        'w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl',
                                                        step.color,
                                                        'bg-white dark:bg-neutral-900'
                                                    )}>
                                                        {step.letter}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg">{step.name}</CardTitle>
                                                        <p className="text-sm text-muted-foreground">{step.namePL}</p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm mb-4">{step.description}</p>
                                                <ul className="space-y-1">
                                                    {step.actions.map((action, actionIdx) => (
                                                        <li key={actionIdx} className="text-xs flex items-start gap-2">
                                                            <ArrowRight className={cn('h-3 w-3 mt-0.5', step.color)} />
                                                            {action}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                            {idx < 3 && (
                                                <div className="absolute -right-2 top-1/2 -translate-y-1/2 hidden md:block">
                                                    <ChevronRight className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Principles */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Zasady ISOA</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {SOUL_DOCUMENT.isoa.principles.map((principle, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                                <span className="text-sm font-medium">{principle}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <Link href="/resources/wiki">
                        <Button variant="outline" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            Powrót do Wiki
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
