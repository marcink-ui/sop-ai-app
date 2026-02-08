'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lightbulb,
    TrendingUp,
    Award,
    CheckCircle2,
    Clock,
    Filter,
    Plus,
    Sparkles,
    Target,
    Rocket,
} from 'lucide-react';
import { KaizenForm, KaizenList } from '@/components/kaizen';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface KaizenStats {
    total: number;
    implemented: number;
    pending: number;
    myIdeas: number;
    savings: number;
}

// Quick stat card component
function StatCard({
    label,
    value,
    icon: Icon,
    color,
    suffix = '',
    delay = 0,
}: {
    label: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    suffix?: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.3 }}
        >
            <Card className="border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                <CardContent className="pt-4 pb-3 px-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl',
                            color
                        )}>
                            <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {value}{suffix}
                            </div>
                            <div className="text-xs text-muted-foreground">{label}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function KaizenPage() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [stats, setStats] = useState<KaizenStats>({
        total: 0,
        implemented: 0,
        pending: 0,
        myIdeas: 0,
        savings: 0,
    });

    // Fetch stats on mount
    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/kaizen?stats=true');
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        total: data.total || 0,
                        implemented: data.implemented || 0,
                        pending: data.pending || 0,
                        myIdeas: data.myIdeas || 0,
                        savings: data.savings || 0,
                    });
                }
            } catch {
                // Use default stats
            }
        }
        fetchStats();
    }, [refreshKey]);

    const handleSuccess = () => {
        setRefreshKey((k) => k + 1);
        setShowForm(false);
    };

    return (
        <div className="container py-6 max-w-6xl mx-auto space-y-6">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl border border-yellow-200 dark:border-yellow-900/50 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/20 p-6"
            >
                {/* Animated gradient orb */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-0 right-0 w-64 h-64 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4 bg-gradient-to-br from-yellow-400 to-orange-400 opacity-20"
                />

                <div className="relative z-10 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
                            <Lightbulb className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                Kaizen
                            </h1>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Ciągłe doskonalenie - każdy pomysł ma znaczenie!
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
                    >
                        {showForm ? (
                            <>Schowaj formularz</>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Nowy pomysł
                            </>
                        )}
                    </Button>
                </div>

                {/* Quick Stats Row */}
                <div className="relative z-10 grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                    <StatCard
                        label="Wszystkie pomysły"
                        value={stats.total}
                        icon={Lightbulb}
                        color="bg-gradient-to-br from-blue-500 to-indigo-600"
                        delay={0.1}
                    />
                    <StatCard
                        label="Wdrożone"
                        value={stats.implemented}
                        icon={CheckCircle2}
                        color="bg-gradient-to-br from-emerald-500 to-green-600"
                        delay={0.15}
                    />
                    <StatCard
                        label="Oczekujące"
                        value={stats.pending}
                        icon={Clock}
                        color="bg-gradient-to-br from-amber-500 to-orange-600"
                        delay={0.2}
                    />
                    <StatCard
                        label="Moje pomysły"
                        value={stats.myIdeas}
                        icon={Sparkles}
                        color="bg-gradient-to-br from-purple-500 to-violet-600"
                        delay={0.25}
                    />
                    <StatCard
                        label="Oszczędności"
                        value={stats.savings > 0 ? `${(stats.savings / 1000).toFixed(0)}k` : '0'}
                        suffix=" zł"
                        icon={TrendingUp}
                        color="bg-gradient-to-br from-rose-500 to-pink-600"
                        delay={0.3}
                    />
                </div>
            </motion.div>

            {/* Form Section - Collapsible */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <Card className="border-dashed border-2 border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Rocket className="h-5 w-5 text-amber-600" />
                                    <h2 className="text-lg font-semibold">Podziel się swoim pomysłem</h2>
                                </div>
                                <KaizenForm onSuccess={handleSuccess} />
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ideas List with Tabs */}
            <div className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList className="bg-neutral-100 dark:bg-neutral-800">
                            <TabsTrigger value="all" className="gap-2">
                                <Lightbulb className="h-4 w-4" />
                                <span className="hidden sm:inline">Wszystkie</span>
                            </TabsTrigger>
                            <TabsTrigger value="my" className="gap-2">
                                <Sparkles className="h-4 w-4" />
                                <span className="hidden sm:inline">Moje</span>
                            </TabsTrigger>
                            <TabsTrigger value="implemented" className="gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="hidden sm:inline">Wdrożone</span>
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="hidden sm:inline">Oczekujące</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1">
                                <Filter className="h-3 w-3" />
                                {activeTab === 'all' ? 'Wszystkie' :
                                    activeTab === 'my' ? 'Moje' :
                                        activeTab === 'implemented' ? 'Wdrożone' : 'Oczekujące'}
                            </Badge>
                        </div>
                    </div>

                    <TabsContent value="all" className="mt-0">
                        <KaizenList refreshKey={refreshKey} />
                    </TabsContent>
                    <TabsContent value="my" className="mt-0">
                        <KaizenList myOnly refreshKey={refreshKey} />
                    </TabsContent>
                    <TabsContent value="implemented" className="mt-0">
                        <KaizenList status="IMPLEMENTED" refreshKey={refreshKey} />
                    </TabsContent>
                    <TabsContent value="pending" className="mt-0">
                        <KaizenList status="PENDING" refreshKey={refreshKey} />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Motivation Banner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 p-4"
            >
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                        <Target className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                            Każdy pomysł liczy się!
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Małe zmiany prowadzą do wielkich rezultatów. Twoje sugestie pomagają budować lepszą organizację.
                        </p>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        <Award className="h-8 w-8 text-amber-500" />
                        <div className="text-right">
                            <div className="text-sm font-medium">Top Contributor</div>
                            <div className="text-xs text-muted-foreground">Zdobądź odznakę!</div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
