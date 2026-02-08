'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Settings,
    RefreshCw,
    ToggleLeft,
    ToggleRight,
    Sparkles,
    Eye,
    Bell,
    MessageSquare,
    Palette,
    Gauge,
    Lock,
    Users,
    Zap,
    FileText,
    BotIcon,
    BarChart3,
    Search,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FeatureFlag {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    enabled: boolean;
    category: 'core' | 'ai' | 'ux' | 'experimental';
    requiresRestart?: boolean;
}

const defaultFlags: FeatureFlag[] = [
    {
        id: 'floating_chat',
        name: 'Floating Chat Widget',
        description: 'Pływający widget chatu AI w prawym dolnym rogu',
        icon: MessageSquare,
        enabled: true,
        category: 'core',
    },
    {
        id: 'embedded_chat',
        name: 'Embedded Chat Dashboard',
        description: 'Wbudowany chat AI na dashboardzie',
        icon: MessageSquare,
        enabled: true,
        category: 'core',
    },
    {
        id: 'ai_suggestions',
        name: 'AI Suggestions',
        description: 'Sugestie AI w edytorach i formularzach',
        icon: Sparkles,
        enabled: true,
        category: 'ai',
    },
    {
        id: 'council_notifications',
        name: 'Council Notifications',
        description: 'Powiadomienia o nowych prośbach Council',
        icon: Bell,
        enabled: true,
        category: 'core',
    },
    {
        id: 'dark_mode',
        name: 'Dark Mode Toggle',
        description: 'Możliwość przełączania trybu ciemnego',
        icon: Palette,
        enabled: true,
        category: 'ux',
    },
    {
        id: 'analytics_tracking',
        name: 'UX Analytics Tracking',
        description: 'Śledzenie kliknięć i zachowań użytkowników',
        icon: BarChart3,
        enabled: true,
        category: 'ux',
    },
    {
        id: 'eye_tracking',
        name: 'Eye Tracking (WebGazer)',
        description: 'Eksperymentalne śledzenie wzroku',
        icon: Eye,
        enabled: false,
        category: 'experimental',
        requiresRestart: true,
    },
    {
        id: 'ai_agents_council',
        name: 'AI Agents Council',
        description: 'Wieloagentowe dyskusje i walidacja',
        icon: Users,
        enabled: true,
        category: 'ai',
    },
    {
        id: 'formula_columns',
        name: 'Formula Columns',
        description: 'Kolumny z formułami w tabelach edytowalnych',
        icon: FileText,
        enabled: true,
        category: 'experimental',
    },
    {
        id: 'ai_formula_evaluation',
        name: 'AI Formula Evaluation',
        description: '@AI formuły wykonywane przez agentów',
        icon: BotIcon,
        enabled: true,
        category: 'ai',
    },
    {
        id: 'performance_mode',
        name: 'Performance Mode',
        description: 'Wyłącz animacje dla lepszej wydajności',
        icon: Gauge,
        enabled: false,
        category: 'ux',
    },
    {
        id: 'api_rate_limiting',
        name: 'API Rate Limiting',
        description: 'Ograniczenie liczby zapytań API',
        icon: Lock,
        enabled: true,
        category: 'core',
    },
];

const categoryLabels: Record<string, { label: string; color: string }> = {
    core: { label: 'Core', color: 'bg-blue-500' },
    ai: { label: 'AI', color: 'bg-purple-500' },
    ux: { label: 'UX', color: 'bg-emerald-500' },
    experimental: { label: 'Experimental', color: 'bg-amber-500' },
};

export default function FeatureFlagsPage() {
    const { data: session, status } = useSession();
    const [flags, setFlags] = useState<FeatureFlag[]>(defaultFlags);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [changed, setChanged] = useState<Set<string>>(new Set());

    // Load from localStorage on mount - must be before any conditional returns
    useEffect(() => {
        const saved = localStorage.getItem('vantage_feature_flags');
        if (saved) {
            try {
                const savedFlags = JSON.parse(saved);
                setFlags(defaultFlags.map(f => ({
                    ...f,
                    enabled: savedFlags[f.id] ?? f.enabled
                })));
            } catch (e) {
                console.error('Failed to parse feature flags:', e);
            }
        }
    }, []);

    // Access checks - after all hooks
    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (session?.user?.role !== 'SPONSOR') {
        redirect('/dashboard');
    }

    const handleToggle = (flagId: string) => {
        setFlags(flags.map(f =>
            f.id === flagId ? { ...f, enabled: !f.enabled } : f
        ));
        setChanged(new Set([...changed, flagId]));
    };

    const handleSave = () => {
        const flagsObject = flags.reduce((acc, f) => ({ ...acc, [f.id]: f.enabled }), {});
        localStorage.setItem('vantage_feature_flags', JSON.stringify(flagsObject));
        setChanged(new Set());
        toast.success('Ustawienia zapisane');

        // Check if any flag requires restart
        const requiresRestart = flags.some(f =>
            f.requiresRestart && changed.has(f.id)
        );
        if (requiresRestart) {
            toast.info('Odśwież stronę, aby zastosować zmiany');
        }
    };

    const handleReset = () => {
        setFlags(defaultFlags);
        localStorage.removeItem('vantage_feature_flags');
        setChanged(new Set());
        toast.success('Przywrócono domyślne ustawienia');
    };

    const filteredFlags = flags.filter(f => {
        if (filterCategory && f.category !== filterCategory) return false;
        if (search && !f.name.toLowerCase().includes(search.toLowerCase()) &&
            !f.description.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const enabledCount = flags.filter(f => f.enabled).length;

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
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Feature Flags</h1>
                        <p className="text-sm text-muted-foreground">
                            Włączaj i wyłączaj funkcje systemu
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleReset}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                    <Button onClick={handleSave} disabled={changed.size === 0}>
                        Zapisz ({changed.size})
                    </Button>
                </div>
            </motion.div>

            {/* Stats & Search */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap items-center gap-4"
            >
                <div className="flex gap-2">
                    <Badge variant="secondary" className="gap-1">
                        <ToggleRight className="h-3 w-3" />
                        {enabledCount} włączonych
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                        <ToggleLeft className="h-3 w-3" />
                        {flags.length - enabledCount} wyłączonych
                    </Badge>
                </div>

                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Szukaj funkcji..."
                        className="pl-9"
                    />
                </div>

                <div className="flex gap-1">
                    <Button
                        variant={filterCategory === null ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setFilterCategory(null)}
                    >
                        Wszystkie
                    </Button>
                    {Object.entries(categoryLabels).map(([cat, { label }]) => (
                        <Button
                            key={cat}
                            variant={filterCategory === cat ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setFilterCategory(cat)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>
            </motion.div>

            {/* Flags Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
            >
                {filteredFlags.map((flag, index) => (
                    <motion.div
                        key={flag.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.03 * index }}
                    >
                        <Card className={cn(
                            "transition-all hover:shadow-md",
                            changed.has(flag.id) && "ring-2 ring-primary/50",
                            !flag.enabled && "opacity-70"
                        )}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                                        flag.enabled
                                            ? "bg-primary/10 text-primary"
                                            : "bg-muted text-muted-foreground"
                                    )}>
                                        <flag.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm truncate">
                                                {flag.name}
                                            </span>
                                            <span className={cn(
                                                "h-2 w-2 rounded-full shrink-0",
                                                categoryLabels[flag.category].color
                                            )} />
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {flag.description}
                                        </p>
                                        {flag.requiresRestart && (
                                            <Badge variant="outline" className="text-[10px] mt-2">
                                                <Zap className="h-2 w-2 mr-1" />
                                                Wymaga restartu
                                            </Badge>
                                        )}
                                    </div>
                                    <Switch
                                        checked={flag.enabled}
                                        onCheckedChange={() => handleToggle(flag.id)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {filteredFlags.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Brak funkcji spełniających kryteria</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
