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
};

export default function SoulPage() {
    const [activeTab, setActiveTab] = useState<'identity' | 'values' | 'boundaries' | 'modes'>('identity');

    const tabs = [
        { id: 'identity', label: 'Tożsamość', icon: Brain },
        { id: 'values', label: 'Wartości', icon: Heart },
        { id: 'boundaries', label: 'Granice', icon: Shield },
        { id: 'modes', label: 'Tryby', icon: Sparkles },
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
