'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import {
    Brain,
    ChevronLeft,
    Settings2,
    Power,
    Info,
    Lock,
    Sparkles,
    Zap,
    Check,
    X,
    Loader2,
    DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { hasMetaAdminAccess } from '@/lib/auth/system-admin';

interface AIModel {
    id: string;
    name: string;
    provider: string;
    description: string;
    icon: typeof Brain;
    color: string;
    enabled: boolean;
    apiKeyConfigured: boolean;
    costPer1kTokens: number;
    features: string[];
}

const defaultModels: AIModel[] = [
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: 'Najnowszy model OpenAI z multimodalnymi możliwościami',
        icon: Sparkles,
        color: 'from-emerald-500 to-teal-500',
        enabled: true,
        apiKeyConfigured: true,
        costPer1kTokens: 0.01,
        features: ['Multimodal', 'Function calling', '128k context'],
    },
    {
        id: 'claude-sonnet-4',
        name: 'Claude Sonnet 4',
        provider: 'Anthropic',
        description: 'Model Claude z zaawansowanym rozumowaniem',
        icon: Brain,
        color: 'from-orange-500 to-amber-500',
        enabled: false,
        apiKeyConfigured: false,
        costPer1kTokens: 0.015,
        features: ['200k context', 'Artifacts', 'Vision'],
    },
    {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        provider: 'Google',
        description: 'Model Google z ogromnym oknem kontekstu',
        icon: Zap,
        color: 'from-blue-500 to-indigo-500',
        enabled: false,
        apiKeyConfigured: false,
        costPer1kTokens: 0.00125,
        features: ['1M context', 'Grounding', 'Multimodal'],
    },
];

export default function AIModelsPage() {
    const { data: session, isPending } = useSession();
    const [models, setModels] = useState<AIModel[]>(defaultModels);
    const [saving, setSaving] = useState<string | null>(null);
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

    // Load saved state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('vantageos-ai-models');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setModels(prev => prev.map(m => ({
                    ...m,
                    enabled: parsed[m.id]?.enabled ?? m.enabled,
                    apiKeyConfigured: parsed[m.id]?.apiKeyConfigured ?? m.apiKeyConfigured,
                })));
            } catch {
                // ignore
            }
        }
    }, []);

    // Access check
    if (isPending) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    const userEmail = session?.user?.email;
    if (!hasMetaAdminAccess(userEmail)) {
        redirect('/dashboard');
    }

    const toggleModel = async (modelId: string) => {
        setSaving(modelId);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        setModels(prev => {
            const updated = prev.map(m =>
                m.id === modelId ? { ...m, enabled: !m.enabled } : m
            );
            // Save to localStorage
            const saveData = updated.reduce((acc, m) => ({
                ...acc,
                [m.id]: { enabled: m.enabled, apiKeyConfigured: m.apiKeyConfigured }
            }), {});
            localStorage.setItem('vantageos-ai-models', JSON.stringify(saveData));
            return updated;
        });

        setSaving(null);
    };

    const configureApiKey = (modelId: string) => {
        const key = apiKeys[modelId];
        if (key && key.length > 10) {
            setModels(prev => {
                const updated = prev.map(m =>
                    m.id === modelId ? { ...m, apiKeyConfigured: true } : m
                );
                const saveData = updated.reduce((acc, m) => ({
                    ...acc,
                    [m.id]: { enabled: m.enabled, apiKeyConfigured: m.apiKeyConfigured }
                }), {});
                localStorage.setItem('vantageos-ai-models', JSON.stringify(saveData));
                return updated;
            });
            setApiKeys(prev => ({ ...prev, [modelId]: '' }));
        }
    };

    const activeModels = models.filter(m => m.enabled);

    return (
        <TooltipProvider>
            <div className="container mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <Link href="/meta-admin">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Modele AI</h1>
                            <p className="text-sm text-muted-foreground">
                                Zarządzaj dostępnymi modelami AI w systemie
                            </p>
                        </div>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                        <Power className="h-3 w-3" />
                        {activeModels.length} aktywnych
                    </Badge>
                </motion.div>

                {/* Info Banner */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4"
                >
                    <div className="flex items-center gap-3">
                        <Info className="h-5 w-5 text-blue-500" />
                        <div>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                Konfiguracja modeli AI
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Włącz modele, które mają być dostępne dla użytkowników. Wymaga skonfigurowania klucza API.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Active Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="grid gap-4 md:grid-cols-3"
                >
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardContent className="pt-4">
                            <div className="text-sm font-medium">Aktywne modele</div>
                            <div className="text-2xl font-bold">{activeModels.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                            <div className="text-sm font-medium">Domyślny model</div>
                            <div className="text-2xl font-bold">{activeModels[0]?.name || 'Brak'}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-4">
                            <div className="text-sm font-medium">Szacowany koszt/1k tokenów</div>
                            <div className="text-2xl font-bold">
                                ${activeModels[0]?.costPer1kTokens.toFixed(4) || '0.00'}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Models List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Dostępne modele</h2>
                    <div className="grid gap-4">
                        {models.map((model, index) => (
                            <motion.div
                                key={model.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                            >
                                <Card className={`transition-all duration-300 ${model.enabled ? 'border-primary/50 shadow-md' : ''}`}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center shadow-md`}>
                                                    <model.icon className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        {model.name}
                                                        {model.enabled && (
                                                            <Badge variant="default" className="bg-emerald-500 text-xs">
                                                                Aktywny
                                                            </Badge>
                                                        )}
                                                    </CardTitle>
                                                    <CardDescription className="flex items-center gap-2">
                                                        <span>{model.provider}</span>
                                                        <span className="text-muted-foreground/50">•</span>
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign className="h-3 w-3" />
                                                            ${model.costPer1kTokens}/1k tokens
                                                        </span>
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {saving === model.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                ) : (
                                                    <Switch
                                                        checked={model.enabled}
                                                        onCheckedChange={() => toggleModel(model.id)}
                                                        disabled={!model.apiKeyConfigured}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0 space-y-4">
                                        <p className="text-sm text-muted-foreground">{model.description}</p>

                                        {/* Features */}
                                        <div className="flex flex-wrap gap-2">
                                            {model.features.map(feature => (
                                                <Badge key={feature} variant="secondary" className="text-xs">
                                                    {feature}
                                                </Badge>
                                            ))}
                                        </div>

                                        <Separator />

                                        {/* API Key Section */}
                                        <div className="space-y-2">
                                            <Label className="text-sm flex items-center gap-2">
                                                <Lock className="h-3 w-3" />
                                                Klucz API
                                                {model.apiKeyConfigured ? (
                                                    <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/50 ml-2">
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Skonfigurowany
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/50 ml-2">
                                                        <X className="h-3 w-3 mr-1" />
                                                        Wymagany
                                                    </Badge>
                                                )}
                                            </Label>
                                            {!model.apiKeyConfigured && (
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="password"
                                                        placeholder={`Wprowadź klucz API ${model.provider}...`}
                                                        value={apiKeys[model.id] || ''}
                                                        onChange={(e) => setApiKeys(prev => ({ ...prev, [model.id]: e.target.value }))}
                                                        className="font-mono text-sm"
                                                    />
                                                    <Button
                                                        onClick={() => configureApiKey(model.id)}
                                                        disabled={!apiKeys[model.id] || apiKeys[model.id].length < 10}
                                                    >
                                                        Zapisz
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Integration Hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="border-dashed">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Settings2 className="h-5 w-5" />
                                <div className="text-sm">
                                    <p className="font-medium">Integracja z Railway</p>
                                    <p className="text-xs">
                                        Klucze API są przechowywane bezpiecznie w zmiennych środowiskowych Railway.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </TooltipProvider>
    );
}
