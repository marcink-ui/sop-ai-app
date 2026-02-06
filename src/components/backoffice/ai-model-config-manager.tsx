'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Cpu,
    Cloud,
    Server,
    Plus,
    Trash2,
    RefreshCw,
    Save,
    Loader2,
    ChevronDown,
    ChevronUp,
    Shield,
    ShieldAlert,
    Check,
    X,
    Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Matching Prisma enums
type AIProvider = 'OPENAI' | 'ANTHROPIC' | 'OLLAMA' | 'AZURE_OPENAI' | 'LOCAL_LLM' | 'GOOGLE';
type AIArea = 'GENERAL' | 'SOP_CREATION' | 'CHAT' | 'ANALYSIS' | 'CONFIDENTIAL';

interface AIModelConfigEntry {
    id: string;
    provider: AIProvider;
    modelName: string;
    apiEndpoint?: string;
    area: AIArea;
    priority: number;
    forceLocal: boolean;
    fallbackEnabled: boolean;
    isActive: boolean;
    healthStatus: string;
}

const PROVIDER_INFO: Record<AIProvider, { label: string; icon: React.ReactNode; color: string }> = {
    OPENAI: { label: 'OpenAI', icon: <Cloud className="h-4 w-4" />, color: 'from-green-500 to-emerald-600' },
    ANTHROPIC: { label: 'Anthropic', icon: <Cloud className="h-4 w-4" />, color: 'from-orange-500 to-amber-600' },
    OLLAMA: { label: 'Ollama', icon: <Server className="h-4 w-4" />, color: 'from-blue-500 to-cyan-600' },
    AZURE_OPENAI: { label: 'Azure OpenAI', icon: <Cloud className="h-4 w-4" />, color: 'from-blue-600 to-indigo-600' },
    LOCAL_LLM: { label: 'Local LLM', icon: <Cpu className="h-4 w-4" />, color: 'from-purple-500 to-violet-600' },
    GOOGLE: { label: 'Google AI', icon: <Cloud className="h-4 w-4" />, color: 'from-red-500 to-rose-600' },
};

const AREA_INFO: Record<AIArea, { label: string; description: string }> = {
    GENERAL: { label: 'Ogólne', description: 'Domyślne dla wszystkich interakcji' },
    SOP_CREATION: { label: 'Tworzenie SOP', description: 'Generowanie i edycja procedur' },
    CHAT: { label: 'Czat AI', description: 'Asystent czatowy' },
    ANALYSIS: { label: 'Analiza', description: 'MUDA, ROI, Analytics' },
    CONFIDENTIAL: { label: 'Poufne', description: 'Tylko lokalne AI, bez chmury' },
};

const DEFAULT_MODELS: Record<AIProvider, string[]> = {
    OPENAI: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1', 'o1-mini'],
    ANTHROPIC: ['claude-3-5-sonnet-20241022', 'claude-3-opus', 'claude-3-haiku'],
    OLLAMA: ['llama3.2', 'mistral', 'codellama', 'qwen2.5'],
    AZURE_OPENAI: ['gpt-4o', 'gpt-4-turbo'],
    LOCAL_LLM: ['custom'],
    GOOGLE: ['gemini-2.0-flash', 'gemini-1.5-pro'],
};

export function AIModelConfigManager() {
    const [configs, setConfigs] = useState<AIModelConfigEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [expandedAreas, setExpandedAreas] = useState<Record<AIArea, boolean>>({
        GENERAL: true,
        SOP_CREATION: false,
        CHAT: false,
        ANALYSIS: false,
        CONFIDENTIAL: true,
    });

    // Load saved configs
    useEffect(() => {
        const loadConfigs = async () => {
            setLoading(true);
            try {
                const saved = localStorage.getItem('vantage-ai-model-configs');
                if (saved) {
                    setConfigs(JSON.parse(saved));
                } else {
                    // Default configuration
                    setConfigs([
                        {
                            id: crypto.randomUUID(),
                            provider: 'OPENAI',
                            modelName: 'gpt-4o-mini',
                            area: 'GENERAL',
                            priority: 0,
                            forceLocal: false,
                            fallbackEnabled: true,
                            isActive: true,
                            healthStatus: 'unknown',
                        },
                    ]);
                }
            } catch (error) {
                console.error('Failed to load AI configs:', error);
            } finally {
                setLoading(false);
            }
        };
        loadConfigs();
    }, []);

    // Save configs
    const saveConfigs = async () => {
        setSaving(true);
        try {
            localStorage.setItem('vantage-ai-model-configs', JSON.stringify(configs));
            toast.success('Konfiguracja zapisana!', {
                description: 'Ustawienia modeli AI zostały zapisane.',
            });
        } catch (error) {
            toast.error('Błąd zapisu', {
                description: 'Nie udało się zapisać konfiguracji.',
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleArea = (area: AIArea) => {
        setExpandedAreas(prev => ({ ...prev, [area]: !prev[area] }));
    };

    const addConfig = (area: AIArea) => {
        const areaConfigs = configs.filter(c => c.area === area);
        const newConfig: AIModelConfigEntry = {
            id: crypto.randomUUID(),
            provider: 'OPENAI',
            modelName: 'gpt-4o-mini',
            area,
            priority: areaConfigs.length,
            forceLocal: area === 'CONFIDENTIAL',
            fallbackEnabled: area !== 'CONFIDENTIAL',
            isActive: true,
            healthStatus: 'unknown',
        };
        setConfigs(prev => [...prev, newConfig]);
    };

    const removeConfig = (id: string) => {
        setConfigs(prev => prev.filter(c => c.id !== id));
    };

    const updateConfig = (id: string, field: keyof AIModelConfigEntry, value: any) => {
        setConfigs(prev => prev.map(c => {
            if (c.id === id) {
                const updated = { ...c, [field]: value };
                // Auto-set forceLocal and fallback for CONFIDENTIAL
                if (field === 'area' && value === 'CONFIDENTIAL') {
                    updated.forceLocal = true;
                    updated.fallbackEnabled = false;
                }
                // Reset model when provider changes
                if (field === 'provider') {
                    updated.modelName = DEFAULT_MODELS[value as AIProvider][0];
                }
                return updated;
            }
            return c;
        }));
    };

    const testConnection = async (id: string) => {
        const config = configs.find(c => c.id === id);
        if (!config) return;

        updateConfig(id, 'healthStatus', 'checking');

        // Simulate health check
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In real implementation, this would call the provider's API
        const isLocal = config.provider === 'OLLAMA' || config.provider === 'LOCAL_LLM';
        const status = isLocal ? 'offline' : 'healthy'; // Simulate: cloud = healthy, local = offline

        updateConfig(id, 'healthStatus', status);
        toast[status === 'healthy' ? 'success' : 'error'](
            status === 'healthy' ? 'Połączenie OK' : 'Połączenie nieaktywne',
            { description: `${PROVIDER_INFO[config.provider].label}: ${config.modelName}` }
        );
    };

    const getHealthBadge = (status: string) => {
        switch (status) {
            case 'healthy':
                return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" /> OK</Badge>;
            case 'offline':
                return <Badge variant="destructive"><X className="h-3 w-3 mr-1" /> Offline</Badge>;
            case 'checking':
                return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Test...</Badge>;
            default:
                return <Badge variant="outline">Nieznany</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                        <Settings2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Konfiguracja Modeli AI</h2>
                        <p className="text-sm text-muted-foreground">
                            Wybierz provider i model dla każdego obszaru
                        </p>
                    </div>
                </div>
                <Button onClick={saveConfigs} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Zapisz
                </Button>
            </div>

            {/* Areas */}
            {(Object.keys(AREA_INFO) as AIArea[]).map(area => {
                const areaConfigs = configs.filter(c => c.area === area);
                const isConfidential = area === 'CONFIDENTIAL';

                return (
                    <Card key={area} className={isConfidential ? 'border-amber-500/50' : ''}>
                        <CardHeader className="cursor-pointer" onClick={() => toggleArea(area)}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {isConfidential ? (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                                            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                                            <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    )}
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {AREA_INFO[area].label}
                                            {isConfidential && (
                                                <Badge variant="outline" className="text-amber-600 border-amber-300">
                                                    <Shield className="h-3 w-3 mr-1" /> Tylko lokalne
                                                </Badge>
                                            )}
                                        </CardTitle>
                                        <CardDescription>{AREA_INFO[area].description}</CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{areaConfigs.length} model(i)</Badge>
                                    {expandedAreas[area] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </div>
                            </div>
                        </CardHeader>

                        {expandedAreas[area] && (
                            <CardContent className="space-y-4">
                                {areaConfigs.map((config, index) => (
                                    <motion.div
                                        key={config.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 border rounded-lg space-y-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">#{index + 1}</Badge>
                                                {getHealthBadge(config.healthStatus)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => testConnection(config.id)}
                                                    disabled={config.healthStatus === 'checking'}
                                                >
                                                    <RefreshCw className={`h-4 w-4 ${config.healthStatus === 'checking' ? 'animate-spin' : ''}`} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeConfig(config.id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Provider */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Provider</label>
                                                <Select
                                                    value={config.provider}
                                                    onValueChange={(v) => updateConfig(config.id, 'provider', v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(Object.keys(PROVIDER_INFO) as AIProvider[]).map(p => (
                                                            <SelectItem key={p} value={p}>
                                                                <div className="flex items-center gap-2">
                                                                    {PROVIDER_INFO[p].icon}
                                                                    {PROVIDER_INFO[p].label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Model */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Model</label>
                                                <Select
                                                    value={config.modelName}
                                                    onValueChange={(v) => updateConfig(config.id, 'modelName', v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {DEFAULT_MODELS[config.provider].map(m => (
                                                            <SelectItem key={m} value={m}>{m}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Endpoint for local providers */}
                                        {(config.provider === 'OLLAMA' || config.provider === 'LOCAL_LLM') && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Endpoint URL</label>
                                                <Input
                                                    placeholder="http://localhost:11434"
                                                    value={config.apiEndpoint || ''}
                                                    onChange={(e) => updateConfig(config.id, 'apiEndpoint', e.target.value)}
                                                />
                                            </div>
                                        )}

                                        {/* Toggles */}
                                        <div className="flex items-center gap-6 pt-2">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={config.isActive}
                                                    onCheckedChange={(v) => updateConfig(config.id, 'isActive', v)}
                                                />
                                                <span className="text-sm">Aktywny</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={config.forceLocal}
                                                    onCheckedChange={(v) => updateConfig(config.id, 'forceLocal', v)}
                                                    disabled={isConfidential}
                                                />
                                                <span className="text-sm text-muted-foreground">
                                                    Wymuś lokalne
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={config.fallbackEnabled}
                                                    onCheckedChange={(v) => updateConfig(config.id, 'fallbackEnabled', v)}
                                                    disabled={isConfidential || config.forceLocal}
                                                />
                                                <span className="text-sm text-muted-foreground">
                                                    Fallback do chmury
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                <Button
                                    variant="outline"
                                    onClick={() => addConfig(area)}
                                    className="w-full gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Dodaj model dla &quot;{AREA_INFO[area].label}&quot;
                                </Button>
                            </CardContent>
                        )}
                    </Card>
                );
            })}
        </div>
    );
}
