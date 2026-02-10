'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    MousePointerClick,
    Eye,
    Video,
    BarChart3,
    Layers,
    Play,
    Pause,
    Download,
    Settings2,
    Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const UX_SECTIONS = [
    {
        id: 'heatmaps',
        title: 'Heatmapy',
        description: 'Wizualizacja kliknięć, scrollowania i ruchu myszy użytkowników',
        icon: MousePointerClick,
        color: 'from-rose-500 to-pink-600',
        bg: 'bg-rose-500/10',
        textColor: 'text-rose-500',
        features: [
            'Mapa kliknięć (click heatmap)',
            'Mapa scrollowania (scroll depth)',
            'Mapa ruchu myszy (move heatmap)',
            'Porównanie urządzeń (desktop vs mobile)',
        ],
        status: 'beta',
    },
    {
        id: 'predictions',
        title: 'Predykcje UX',
        description: 'AI-driven przewidywanie zachowań użytkowników na interfejsie',
        icon: Eye,
        color: 'from-violet-500 to-purple-600',
        bg: 'bg-violet-500/10',
        textColor: 'text-violet-500',
        features: [
            'Predicted attention zones',
            'First-click prediction',
            'Cognitive load analysis',
            'Accessibility score',
        ],
        status: 'beta',
    },
    {
        id: 'recordings',
        title: 'Nagrania sesji',
        description: 'Pełne nagrania sesji użytkowników z replay funkcjonalnością',
        icon: Video,
        color: 'from-blue-500 to-cyan-600',
        bg: 'bg-blue-500/10',
        textColor: 'text-blue-500',
        features: [
            'Session replay (pełna sesja)',
            'Filtrowanie po stronie / akcji',
            'Rage-click detection',
            'Error & frustration signals',
        ],
        status: 'planned',
    },
];

const SAMPLE_METRICS = [
    { label: 'Avg. CTR', value: '68%', change: '+4%', positive: true },
    { label: 'Scroll depth', value: '72%', change: '+12%', positive: true },
    { label: 'Rage clicks', value: '23', change: '-8', positive: true },
    { label: 'Avg. session', value: '4m 32s', change: '+18s', positive: true },
];

export default function UXAnalysisPage() {
    const [activeSection, setActiveSection] = useState('heatmaps');

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <Link
                    href="/admin-panel"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Powrót do Admin Panel
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 p-3 border border-pink-500/20">
                            <MousePointerClick className="h-6 w-6 text-pink-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">UX Analysis</h1>
                            <p className="text-sm text-muted-foreground">
                                Heatmapy, predykcje i nagrania sesji użytkowników
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                        Beta
                    </Badge>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                {SAMPLE_METRICS.map((metric, idx) => (
                    <Card key={idx} className="bg-card/50">
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{metric.label}</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl font-bold text-foreground">{metric.value}</span>
                                <span className={cn(
                                    'text-xs font-medium',
                                    metric.positive ? 'text-emerald-500' : 'text-red-500'
                                )}>
                                    {metric.change}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            {/* Section Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-wrap gap-2"
            >
                {UX_SECTIONS.map(section => {
                    const isActive = activeSection === section.id;
                    const Icon = section.icon;
                    return (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border',
                                isActive
                                    ? `bg-gradient-to-r ${section.color} text-white border-transparent shadow-lg`
                                    : 'border-border bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {section.title}
                            <Badge
                                variant="secondary"
                                className={cn(
                                    'text-[10px] ml-1',
                                    isActive && 'bg-white/20 text-white'
                                )}
                            >
                                {section.status === 'beta' ? 'Beta' : 'Wkrótce'}
                            </Badge>
                        </button>
                    );
                })}
            </motion.div>

            {/* Active Section Content */}
            {UX_SECTIONS.filter(s => s.id === activeSection).map(section => {
                const Icon = section.icon;
                return (
                    <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* Main Display Area */}
                        <div className="lg:col-span-2">
                            <Card className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="relative aspect-[16/10] bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 flex items-center justify-center">
                                        <div className="text-center space-y-4">
                                            <div className={cn(
                                                'inline-flex h-20 w-20 items-center justify-center rounded-2xl',
                                                section.bg
                                            )}>
                                                <Icon className={cn('h-10 w-10', section.textColor)} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
                                                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                                                    {section.description}
                                                </p>
                                            </div>
                                            {section.status === 'beta' ? (
                                                <Button className={cn('bg-gradient-to-r', section.color, 'shadow-lg gap-2')}>
                                                    <Play className="h-4 w-4" />
                                                    Uruchom analizę
                                                </Button>
                                            ) : (
                                                <Button variant="outline" disabled className="gap-2">
                                                    <Info className="h-4 w-4" />
                                                    Wkrótce dostępne
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Features Sidebar */}
                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Funkcje</CardTitle>
                                    <CardDescription className="text-xs">
                                        Dostępne narzędzia w module {section.title}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {section.features.map((feature, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-sm"
                                        >
                                            <div className={cn(
                                                'h-2 w-2 rounded-full',
                                                section.status === 'beta' ? 'bg-emerald-500' : 'bg-neutral-400'
                                            )} />
                                            <span className="text-foreground text-xs">{feature}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Settings2 className="h-4 w-4" />
                                        Konfiguracja
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Tracking</label>
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-6 rounded-full bg-emerald-500 relative">
                                                <div className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-white" />
                                            </div>
                                            <span className="text-xs text-foreground">Włączony</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Sampling rate</label>
                                        <span className="text-xs text-foreground font-mono">100%</span>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Retencja danych</label>
                                        <span className="text-xs text-foreground">90 dni</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
