'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ChevronLeft,
    Key,
    Plus,
    Building2,
    Sparkles,
    Bot,
    Zap,
    Shield,
    BarChart3,
    Trash2,
    Power,
    PowerOff,
    DollarSign,
    ActivityIcon,
    TrendingUp,
    Send,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────

interface OrgApiKey {
    id: string;
    provider: string;
    label: string;
    maskedKey: string;
    isActive: boolean;
    monthlyBudget: number | null;
}

interface OrgUsage {
    totalTokens: number;
    estimatedCost: number;
    promptTokens: number;
    completionTokens: number;
    requestCount: number;
}

interface OrgSummary {
    id: string;
    name: string;
    slug: string;
    activeKeys: number;
    keys: OrgApiKey[];
    userCount: number;
    totalRequests: number;
    usage30d: OrgUsage;
}

// ── Provider Config ────────────────────────────────

const providerConfig: Record<string, { name: string; icon: typeof Sparkles; color: string; bgColor: string; placeholder: string }> = {
    OPENAI: { name: 'OpenAI', icon: Sparkles, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', placeholder: 'sk-proj-...' },
    ANTHROPIC: { name: 'Anthropic', icon: Bot, color: 'text-orange-500', bgColor: 'bg-orange-500/10', placeholder: 'sk-ant-api03-...' },
    GOOGLE: { name: 'Google AI', icon: Zap, color: 'text-blue-500', bgColor: 'bg-blue-500/10', placeholder: 'AIza...' },
};

// ── Demo Data ──────────────────────────────────────

const demoOrgs: OrgSummary[] = [
    {
        id: 'org-1',
        name: 'SYHI Digital Agency',
        slug: 'syhi',
        activeKeys: 2,
        keys: [
            { id: 'key-1', provider: 'OPENAI', label: 'Production GPT-4', maskedKey: 'sk-proj-abc...xyz9', isActive: true, monthlyBudget: 100 },
            { id: 'key-2', provider: 'ANTHROPIC', label: 'Claude Backup', maskedKey: 'sk-ant-api...uv12', isActive: true, monthlyBudget: 50 },
        ],
        userCount: 5,
        totalRequests: 1247,
        usage30d: { totalTokens: 847320, estimatedCost: 12.45, promptTokens: 523100, completionTokens: 324220, requestCount: 342 },
    },
    {
        id: 'org-2',
        name: 'DemoTech Solutions',
        slug: 'demotech',
        activeKeys: 1,
        keys: [
            { id: 'key-3', provider: 'OPENAI', label: 'GPT-4 Turbo', maskedKey: 'sk-proj-def...abc3', isActive: true, monthlyBudget: 200 },
        ],
        userCount: 6,
        totalRequests: 89,
        usage30d: { totalTokens: 125400, estimatedCost: 1.87, promptTokens: 78200, completionTokens: 47200, requestCount: 89 },
    },
    {
        id: 'org-3',
        name: 'Ciarko S.A.',
        slug: 'ciarko',
        activeKeys: 0,
        keys: [],
        userCount: 3,
        totalRequests: 0,
        usage30d: { totalTokens: 0, estimatedCost: 0, promptTokens: 0, completionTokens: 0, requestCount: 0 },
    },
];

// ── Helper Functions ───────────────────────────────

function formatTokens(tokens: number): string {
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
    if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
    return tokens.toString();
}

function formatCost(cost: number): string {
    return `$${cost.toFixed(2)}`;
}

// ── Components ─────────────────────────────────────

function StatCard({ icon: Icon, label, value, subValue, color }: {
    icon: typeof Key;
    label: string;
    value: string;
    subValue?: string;
    color: string;
}) {
    return (
        <Card className="bg-card/50 border-border">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className={cn('rounded-lg p-2.5', color)}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{value}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        {subValue && <p className="text-xs text-muted-foreground/70">{subValue}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ── Main Page ──────────────────────────────────────

export default function AdminAiKeysPage() {
    const [orgs] = useState<OrgSummary[]>(demoOrgs);
    const [expandedOrg, setExpandedOrg] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState<string | null>(null); // orgId
    const [newKey, setNewKey] = useState({ label: '', provider: 'OPENAI', apiKey: '', monthlyBudget: '' });

    // Global stats
    const totalTokens = orgs.reduce((sum, org) => sum + org.usage30d.totalTokens, 0);
    const totalCost = orgs.reduce((sum, org) => sum + org.usage30d.estimatedCost, 0);
    const totalRequests = orgs.reduce((sum, org) => sum + org.usage30d.requestCount, 0);
    const totalKeys = orgs.reduce((sum, org) => sum + org.activeKeys, 0);

    const handleAddKey = (orgId: string) => {
        if (!newKey.label || !newKey.apiKey) {
            toast.error('Wypełnij nazwę i klucz API');
            return;
        }
        toast.success(`Klucz "${newKey.label}" dodany dla organizacji`);
        setShowAddForm(null);
        setNewKey({ label: '', provider: 'OPENAI', apiKey: '', monthlyBudget: '' });
    };

    const handleToggleKey = (keyId: string, currentState: boolean) => {
        toast.success(currentState ? 'Klucz dezaktywowany' : 'Klucz aktywowany');
    };

    const handleDeleteKey = (keyId: string) => {
        toast.success('Klucz usunięty');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/backoffice">
                    <Button variant="ghost" size="icon" className="hover:bg-muted">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                        <Key className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-foreground">AI Keys & Usage</h1>
                        <p className="text-sm text-muted-foreground">
                            Zasilaj klientów kluczami AI i monitoruj zużycie
                        </p>
                    </div>
                </div>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={Key} label="Aktywne klucze" value={totalKeys.toString()} color="bg-violet-500" />
                <StatCard icon={ActivityIcon} label="Requesty (30d)" value={totalRequests.toLocaleString()} color="bg-blue-500" />
                <StatCard icon={TrendingUp} label="Tokeny (30d)" value={formatTokens(totalTokens)} color="bg-emerald-500" />
                <StatCard icon={DollarSign} label="Koszt (30d)" value={formatCost(totalCost)} color="bg-amber-500" />
            </div>

            {/* Platform Keys Info */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4"
            >
                <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-violet-500 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium text-violet-500">Klucze platformy (SYHI)</p>
                        <p className="text-muted-foreground">
                            META_ADMIN i PARTNER korzystają z kluczy platformy (PLATFORM_OPENAI_API_KEY etc.).
                            Poniżej zarządzasz kluczami przydzielonymi klientom — ich zużycie jest rozliczane osobno.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Organizations List */}
            <div className="space-y-4">
                {orgs.map((org, index) => {
                    const isExpanded = expandedOrg === org.id;
                    const isAddingKey = showAddForm === org.id;

                    return (
                        <motion.div
                            key={org.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="rounded-xl border border-border bg-card/50"
                        >
                            {/* Org Header Row */}
                            <button
                                onClick={() => setExpandedOrg(isExpanded ? null : org.id)}
                                className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-xl"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-500/20 dark:to-cyan-500/20 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-foreground">{org.name}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {org.userCount} użytkowników • {org.activeKeys} {org.activeKeys === 1 ? 'klucz' : 'kluczy'} AI
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    {/* Usage badges */}
                                    <div className="hidden md:flex items-center gap-4 text-sm">
                                        <span className="flex items-center gap-1.5 text-muted-foreground">
                                            <Send className="h-3.5 w-3.5" />
                                            {org.usage30d.requestCount} req
                                        </span>
                                        <span className="flex items-center gap-1.5 text-muted-foreground">
                                            <BarChart3 className="h-3.5 w-3.5" />
                                            {formatTokens(org.usage30d.totalTokens)} tok
                                        </span>
                                        <span className={cn(
                                            "font-semibold",
                                            org.usage30d.estimatedCost > 10 ? "text-amber-500" : "text-emerald-500"
                                        )}>
                                            {formatCost(org.usage30d.estimatedCost)}
                                        </span>
                                    </div>
                                    <Badge
                                        variant={org.activeKeys > 0 ? 'default' : 'secondary'}
                                        className={org.activeKeys > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : ''}
                                    >
                                        {org.activeKeys > 0 ? 'AI Active' : 'Brak kluczy'}
                                    </Badge>
                                </div>
                            </button>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="border-t border-border px-5 pb-5"
                                >
                                    {/* Usage Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
                                        <div className="text-center p-3 rounded-lg bg-muted/30">
                                            <p className="text-lg font-bold text-foreground">{org.usage30d.requestCount}</p>
                                            <p className="text-xs text-muted-foreground">Requesty (30d)</p>
                                        </div>
                                        <div className="text-center p-3 rounded-lg bg-muted/30">
                                            <p className="text-lg font-bold text-foreground">{formatTokens(org.usage30d.promptTokens)}</p>
                                            <p className="text-xs text-muted-foreground">Prompt tokens</p>
                                        </div>
                                        <div className="text-center p-3 rounded-lg bg-muted/30">
                                            <p className="text-lg font-bold text-foreground">{formatTokens(org.usage30d.completionTokens)}</p>
                                            <p className="text-xs text-muted-foreground">Completion tokens</p>
                                        </div>
                                        <div className="text-center p-3 rounded-lg bg-muted/30">
                                            <p className={cn("text-lg font-bold", org.usage30d.estimatedCost > 10 ? "text-amber-500" : "text-emerald-500")}>
                                                {formatCost(org.usage30d.estimatedCost)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Szac. koszt (30d)</p>
                                        </div>
                                    </div>

                                    {/* Keys List */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-semibold text-foreground">Klucze API</h4>
                                            <Button
                                                size="sm"
                                                onClick={() => setShowAddForm(isAddingKey ? null : org.id)}
                                                className="bg-violet-600 hover:bg-violet-700 h-8 text-xs"
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Dodaj klucz
                                            </Button>
                                        </div>

                                        {/* Add Key Form */}
                                        {isAddingKey && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4 mb-3"
                                            >
                                                <div className="grid gap-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Nazwa</Label>
                                                            <Input
                                                                value={newKey.label}
                                                                onChange={(e) => setNewKey({ ...newKey, label: e.target.value })}
                                                                placeholder="Production GPT-4"
                                                                className="h-8 text-sm bg-muted/30"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Provider</Label>
                                                            <div className="flex gap-1">
                                                                {Object.entries(providerConfig).map(([key, config]) => {
                                                                    const ProvIcon = config.icon;
                                                                    return (
                                                                        <button
                                                                            key={key}
                                                                            onClick={() => setNewKey({ ...newKey, provider: key })}
                                                                            className={cn(
                                                                                'flex items-center gap-1 px-2 py-1.5 rounded-md border text-xs transition-all',
                                                                                newKey.provider === key
                                                                                    ? 'border-violet-500/50 bg-violet-500/10'
                                                                                    : 'border-border hover:border-violet-500/30'
                                                                            )}
                                                                        >
                                                                            <ProvIcon className={cn('h-3 w-3', config.color)} />
                                                                            {config.name}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="col-span-2 space-y-1">
                                                            <Label className="text-xs">Klucz API</Label>
                                                            <Input
                                                                type="password"
                                                                value={newKey.apiKey}
                                                                onChange={(e) => setNewKey({ ...newKey, apiKey: e.target.value })}
                                                                placeholder={providerConfig[newKey.provider]?.placeholder || 'sk-...'}
                                                                className="h-8 text-sm font-mono bg-muted/30"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Budżet mies. ($)</Label>
                                                            <Input
                                                                type="number"
                                                                value={newKey.monthlyBudget}
                                                                onChange={(e) => setNewKey({ ...newKey, monthlyBudget: e.target.value })}
                                                                placeholder="100"
                                                                className="h-8 text-sm bg-muted/30"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 justify-end">
                                                        <Button size="sm" variant="ghost" onClick={() => setShowAddForm(null)} className="h-7 text-xs">
                                                            Anuluj
                                                        </Button>
                                                        <Button size="sm" onClick={() => handleAddKey(org.id)} className="h-7 text-xs bg-violet-600 hover:bg-violet-700">
                                                            Zapisz klucz
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {org.keys.length === 0 ? (
                                            <div className="rounded-lg border border-dashed border-border p-6 text-center">
                                                <Key className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                                <p className="text-sm text-muted-foreground">Brak przydzielonych kluczy API</p>
                                                <p className="text-xs text-muted-foreground/70">Klient korzysta z trybu symulowanego</p>
                                            </div>
                                        ) : (
                                            org.keys.map((key) => {
                                                const config = providerConfig[key.provider] || providerConfig.OPENAI;
                                                const ProvIcon = config.icon;
                                                return (
                                                    <div
                                                        key={key.id}
                                                        className={cn(
                                                            "rounded-lg border p-3 flex items-center justify-between",
                                                            key.isActive ? "border-border bg-card/80" : "border-border/50 bg-muted/20 opacity-60"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn('rounded-md p-2', config.bgColor)}>
                                                                <ProvIcon className={cn('h-4 w-4', config.color)} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground">{key.label}</p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <code className="text-xs text-muted-foreground font-mono">{key.maskedKey}</code>
                                                                    {key.monthlyBudget && (
                                                                        <Badge variant="outline" className="text-[10px] h-4">
                                                                            ${key.monthlyBudget}/mies.
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => handleToggleKey(key.id, key.isActive)}
                                                                title={key.isActive ? 'Dezaktywuj' : 'Aktywuj'}
                                                            >
                                                                {key.isActive ? (
                                                                    <Power className="h-3.5 w-3.5 text-emerald-500" />
                                                                ) : (
                                                                    <PowerOff className="h-3.5 w-3.5 text-muted-foreground" />
                                                                )}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                                                onClick={() => handleDeleteKey(key.id)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
