'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    Key,
    Plus,
    Eye,
    EyeOff,
    Trash2,
    Copy,
    Check,
    AlertTriangle,
    Bot,
    Sparkles,
    Cpu,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ApiKey {
    id: string;
    name: string;
    provider: 'openai' | 'anthropic' | 'google' | 'custom';
    key: string;
    lastUsed: string | null;
    createdAt: string;
}

const providerConfig = {
    openai: {
        name: 'OpenAI',
        icon: Sparkles,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        placeholder: 'sk-...'
    },
    anthropic: {
        name: 'Anthropic',
        icon: Bot,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        placeholder: 'sk-ant-...'
    },
    google: {
        name: 'Google AI',
        icon: Zap,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        placeholder: 'AIza...'
    },
    custom: {
        name: 'Custom MCP',
        icon: Cpu,
        color: 'text-violet-500',
        bgColor: 'bg-violet-500/10',
        placeholder: 'https://...'
    }
};

export default function ApiKeysPage() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([
        {
            id: '1',
            name: 'Production OpenAI',
            provider: 'openai',
            key: 'sk-proj-abc123...xyz789',
            lastUsed: '2 godz. temu',
            createdAt: '2026-01-15'
        },
        {
            id: '2',
            name: 'Claude API',
            provider: 'anthropic',
            key: 'sk-ant-api03-def456...uvw012',
            lastUsed: '1 dzień temu',
            createdAt: '2026-01-10'
        }
    ]);

    const [showAddForm, setShowAddForm] = useState(false);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [newKey, setNewKey] = useState({
        name: '',
        provider: 'openai' as 'openai' | 'anthropic' | 'google' | 'custom',
        key: ''
    });

    const maskKey = (key: string) => {
        if (key.length <= 12) return '••••••••••••';
        return `${key.slice(0, 7)}...${key.slice(-4)}`;
    };

    const toggleKeyVisibility = (id: string) => {
        const newVisible = new Set(visibleKeys);
        if (newVisible.has(id)) {
            newVisible.delete(id);
        } else {
            newVisible.add(id);
        }
        setVisibleKeys(newVisible);
    };

    const copyKey = async (id: string, key: string) => {
        await navigator.clipboard.writeText(key);
        setCopiedId(id);
        toast.success('Klucz skopiowany do schowka');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const deleteKey = (id: string) => {
        setApiKeys(apiKeys.filter(k => k.id !== id));
        toast.success('Klucz API usunięty');
    };

    const addKey = () => {
        if (!newKey.name || !newKey.key) {
            toast.error('Wypełnij wszystkie pola');
            return;
        }

        const key: ApiKey = {
            id: Date.now().toString(),
            name: newKey.name,
            provider: newKey.provider,
            key: newKey.key,
            lastUsed: null,
            createdAt: new Date().toISOString().split('T')[0]
        };

        setApiKeys([...apiKeys, key]);
        setNewKey({ name: '', provider: 'openai', key: '' });
        setShowAddForm(false);
        toast.success('Klucz API dodany');
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <Link href="/settings">
                        <Button variant="ghost" size="icon" className="hover:bg-muted">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Klucze API</h1>
                        <p className="text-sm text-muted-foreground">Zarządzaj tokenami dostępu do usług AI</p>
                    </div>
                </div>
                <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-violet-600 hover:bg-violet-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj klucz
                </Button>
            </motion.div>

            {/* Security Warning */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
            >
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium text-amber-500">Bezpieczeństwo kluczy API</p>
                        <p className="text-muted-foreground">
                            Klucze są przechowywane bezpiecznie i nigdy nie są wysyłane do zewnętrznych serwerów.
                            Używaj kluczy z ograniczonymi uprawnieniami i regularnie je rotuj.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Add Key Form */}
            {showAddForm && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-violet-500/30 bg-card/50 p-6"
                >
                    <h3 className="text-lg font-semibold text-foreground mb-4">Dodaj nowy klucz API</h3>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label>Nazwa</Label>
                            <Input
                                value={newKey.name}
                                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                                placeholder="np. Production API Key"
                                className="bg-muted/30"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Dostawca</Label>
                            <div className="flex gap-2">
                                {(Object.keys(providerConfig) as Array<keyof typeof providerConfig>).map((provider) => {
                                    const config = providerConfig[provider];
                                    const Icon = config.icon;
                                    return (
                                        <button
                                            key={provider}
                                            onClick={() => setNewKey({ ...newKey, provider })}
                                            className={cn(
                                                'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
                                                newKey.provider === provider
                                                    ? 'border-violet-500/50 bg-violet-500/10'
                                                    : 'border-border hover:border-violet-500/30'
                                            )}
                                        >
                                            <Icon className={cn('h-4 w-4', config.color)} />
                                            <span className="text-sm font-medium">{config.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Klucz API</Label>
                            <Input
                                type="password"
                                value={newKey.key}
                                onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                                placeholder={providerConfig[newKey.provider].placeholder}
                                className="bg-muted/30 font-mono"
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                                Anuluj
                            </Button>
                            <Button onClick={addKey} className="bg-violet-600 hover:bg-violet-700">
                                Dodaj klucz
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* API Keys List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-3"
            >
                {apiKeys.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
                        <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">Brak kluczy API</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Dodaj klucz API, aby połączyć się z usługami AI
                        </p>
                        <Button onClick={() => setShowAddForm(true)} variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Dodaj pierwszy klucz
                        </Button>
                    </div>
                ) : (
                    apiKeys.map((apiKey, index) => {
                        const config = providerConfig[apiKey.provider];
                        const Icon = config.icon;
                        const isVisible = visibleKeys.has(apiKey.id);

                        return (
                            <motion.div
                                key={apiKey.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="rounded-xl border border-border bg-card/50 p-5"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={cn('rounded-lg p-3', config.bgColor)}>
                                            <Icon className={cn('h-5 w-5', config.color)} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">{apiKey.name}</h3>
                                            <p className="text-sm text-muted-foreground">{config.name}</p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <code className="px-2 py-1 rounded bg-muted/50 text-xs font-mono">
                                                    {isVisible ? apiKey.key : maskKey(apiKey.key)}
                                                </code>
                                                <button
                                                    onClick={() => toggleKeyVisibility(apiKey.id)}
                                                    className="text-muted-foreground hover:text-foreground"
                                                >
                                                    {isVisible ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => copyKey(apiKey.id, apiKey.key)}
                                                    className="text-muted-foreground hover:text-foreground"
                                                >
                                                    {copiedId === apiKey.id ? (
                                                        <Check className="h-4 w-4 text-emerald-500" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>Utworzono: {apiKey.createdAt}</span>
                                                {apiKey.lastUsed && <span>Ostatnio użyto: {apiKey.lastUsed}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                        onClick={() => deleteKey(apiKey.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </motion.div>
        </div>
    );
}
