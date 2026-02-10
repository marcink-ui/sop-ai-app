'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    BarChart3,
    MousePointer2,
    Activity,
    Eye,
    Play,
    Pause,
    Trash2,
    Download,
    RefreshCw,
    Layers,
    Clock,
    Target,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeatmapViewer } from '@/components/analytics/heatmap-viewer';
import { UXScoreCard } from '@/components/analytics/ux-score-card';

// Demo data for visualization
const demoClickData = [
    // Navbar area - high activity
    { x: 120, y: 30 }, { x: 125, y: 32 }, { x: 118, y: 28 },
    { x: 250, y: 30 }, { x: 255, y: 35 }, { x: 248, y: 32 },
    { x: 380, y: 32 }, { x: 385, y: 30 },
    // Sidebar area
    { x: 50, y: 150 }, { x: 55, y: 155 }, { x: 48, y: 148 }, { x: 52, y: 152 },
    { x: 50, y: 200 }, { x: 52, y: 205 }, { x: 48, y: 198 },
    { x: 50, y: 250 }, { x: 55, y: 252 },
    { x: 50, y: 300 }, { x: 48, y: 305 }, { x: 52, y: 298 }, { x: 50, y: 302 },
    // Main content - CTA buttons
    { x: 450, y: 180 }, { x: 455, y: 182 }, { x: 448, y: 178 }, { x: 452, y: 180 },
    { x: 450, y: 185 }, { x: 455, y: 188 }, { x: 448, y: 182 },
    { x: 600, y: 180 }, { x: 605, y: 185 }, { x: 598, y: 178 },
    // Cards area
    { x: 300, y: 350 }, { x: 305, y: 355 }, { x: 298, y: 348 },
    { x: 500, y: 350 }, { x: 505, y: 352 }, { x: 498, y: 348 }, { x: 502, y: 350 },
    { x: 700, y: 350 }, { x: 702, y: 355 },
    // Bottom actions
    { x: 400, y: 500 }, { x: 405, y: 505 }, { x: 398, y: 498 }, { x: 402, y: 502 },
];

const pages = [
    { value: 'all', label: 'Wszystkie strony' },
    { value: '/', label: 'Dashboard' },
    { value: '/analytics', label: 'Analityka' },
    { value: '/kaizen', label: 'Kaizen' },
    { value: '/resources/wiki', label: 'Wiki' },
    { value: '/pandas', label: 'Pandy' },
];

export default function AnalyticsDashboard() {
    const { data: session, isPending } = useSession();
    const [isTracking, setIsTracking] = useState(false);
    const [selectedPage, setSelectedPage] = useState('all');
    const [activeTab, setActiveTab] = useState('heatmap');

    // Access check
    if (isPending) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    const userRole = session?.user?.role;
    if (userRole !== 'SPONSOR') {
        redirect('/dashboard');
    }

    // Demo metrics
    const demoMetrics = {
        avgTimeOnPage: 95,
        bounceRate: 28,
        scrollDepth: 72,
        clicksPerSession: 6.4,
        previousAvgTimeOnPage: 82,
        previousBounceRate: 32,
    };

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <Link href="/meta-admin">
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                        <MousePointer2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">UX Analytics</h1>
                        <p className="text-sm text-muted-foreground">
                            Heatmapy, metryki i analiza zachowań użytkowników
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Badge
                        variant={isTracking ? "default" : "secondary"}
                        className={`gap-1 ${isTracking ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                    >
                        <Activity className={`h-3 w-3 ${isTracking ? 'animate-pulse' : ''}`} />
                        {isTracking ? 'Live' : 'Paused'}
                    </Badge>
                    <Button
                        variant={isTracking ? "destructive" : "default"}
                        size="sm"
                        onClick={() => setIsTracking(!isTracking)}
                        className="gap-2"
                    >
                        {isTracking ? (
                            <>
                                <Pause className="h-4 w-4" />
                                Zatrzymaj
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4" />
                                Rozpocznij
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="grid gap-4 md:grid-cols-4"
            >
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20">
                                <MousePointer2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{demoClickData.length}</div>
                                <div className="text-sm text-muted-foreground">Kliknięć (demo)</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/20">
                                <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">24</div>
                                <div className="text-sm text-muted-foreground">Sesji (7 dni)</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                                <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">12</div>
                                <div className="text-sm text-muted-foreground">Hotspotów</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">1m 35s</div>
                                <div className="text-sm text-muted-foreground">Śr. czas sesji</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="heatmap" className="gap-2">
                                <Layers className="h-4 w-4" />
                                Heatmapa
                            </TabsTrigger>
                            <TabsTrigger value="metrics" className="gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Metryki UX
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2">
                            <Select value={selectedPage} onValueChange={setSelectedPage}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Wybierz stronę" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pages.map(page => (
                                        <SelectItem key={page.value} value={page.value}>
                                            {page.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button variant="outline" size="icon">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                                <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="heatmap" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MousePointer2 className="h-5 w-5 text-primary" />
                                    Click Heatmap
                                </CardTitle>
                                <CardDescription>
                                    Wizualizacja miejsc kliknięć użytkowników (dane demo)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <HeatmapViewer
                                    points={demoClickData}
                                    width={800}
                                    height={600}
                                    radius={50}
                                    maxIntensity={5}
                                />
                            </CardContent>
                        </Card>

                        {/* Insights */}
                        <Card className="border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-blue-500" />
                                    Automatyczne spostrzeżenia
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-emerald-500 mt-0.5">✓</span>
                                        <span>Wysoka aktywność w obszarze nawigacji bocznej - użytkownicy aktywnie eksplorują menu</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-500 mt-0.5">!</span>
                                        <span>Przyciski CTA w głównym obszarze mogłyby być bardziej widoczne - mało kliknięć</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-0.5">→</span>
                                        <span>Karty w środkowej sekcji przyciągają uwagę - rozważ dodanie więcej interaktywnych elementów</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="metrics" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <UXScoreCard metrics={demoMetrics} />

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Rekomendacje UX</CardTitle>
                                    <CardDescription>Na podstawie zebranych danych</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
                                        <div className="font-medium text-sm text-emerald-700 dark:text-emerald-400">
                                            ✓ Dobry czas na stronie
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Użytkownicy spędzają odpowiednią ilość czasu, co sugeruje wysoką wartość treści
                                        </p>
                                    </div>

                                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
                                        <div className="font-medium text-sm text-amber-700 dark:text-amber-400">
                                            ! Rozważ optymalizację nawigacji
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Bounce rate 28% - można poprawić przez lepsze CTA i czytelniejszą strukturę
                                        </p>
                                    </div>

                                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30">
                                        <div className="font-medium text-sm text-blue-700 dark:text-blue-400">
                                            → Scroll depth 72%
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Większość użytkowników przegląda główną treść - rozważ dodanie więcej wartościowej zawartości poniżej
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </div>
    );
}
