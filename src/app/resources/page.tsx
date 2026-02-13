'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    BookOpen,
    Newspaper,
    Search,
    Loader2,
    Code2,
    AppWindow,
    Sparkles,
    Bot,
    Cog,
    Plus,
    Star,
    Copy,
    Check,
    ArrowRight,
    Globe,
    Brain,
    Inbox,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// ============================================================================
// TYPES
// ============================================================================

interface SystemPrompt {
    id: string;
    name: string;
    category: string;
    description: string;
    content?: string;
    prompt?: string;
    rating?: number;
    uses?: number;
    isGlobal?: boolean;
}

interface AgentItem {
    id: string;
    name: string;
    description: string;
    type: 'ASSISTANT' | 'AGENT' | 'AUTOMATION';
    status: 'ACTIVE' | 'INACTIVE' | 'TESTING';
    model?: string;
    isGlobal?: boolean;
}

interface NewsletterItem {
    id: string;
    title: string;
    content: string;
    publishedAt: string | null;
    isPinned: boolean;
    author: { name: string | null };
}

interface ResourceItem {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    category: string;
    status: string;
    featured: boolean;
    viewCount: number;
    author?: { name: string | null };
}

// ============================================================================
// STATIC APPS & SKILLS (these are internal modules, not DB data)
// ============================================================================

const BUILT_IN_APPS = [
    { id: 'canvas', name: 'VantageOS Canvas', description: 'Warsztaty strategiczne z AI', url: '/canvas', category: 'Strategy', icon: '🎯' },
    { id: 'value-chain', name: 'Value Chain Mapper', description: 'Mapowanie łańcucha wartości', url: '/value-chain', category: 'Operations', icon: '🔗' },
    { id: 'muda', name: 'MUDA Reporter', description: 'Identyfikacja marnotrawstwa', url: '/muda', category: 'Lean', icon: '🔍' },
    { id: 'knowledge-graph', name: 'Knowledge Graph', description: 'Wizualizacja wiedzy firmy', url: '/knowledge-graph', category: 'Knowledge', icon: '🧠' },
    { id: 'kaizen', name: 'Kaizen Board', description: 'System ciągłego doskonalenia', url: '/kaizen', category: 'Lean', icon: '⚡' },
];

const BUILT_IN_SKILLS = [
    { id: 'gemba', name: 'Gemba Walk Digital', description: 'Zdalna obserwacja procesów z analizą AI', level: 'intermediate' as const, category: 'Lean' },
    { id: 'sop-writing', name: 'SOP Writing', description: 'Tworzenie skutecznych procedur operacyjnych', level: 'beginner' as const, category: 'Operations' },
    { id: 'prompt-eng', name: 'AI Prompt Engineering', description: 'Projektowanie promptów dla agentów AI', level: 'advanced' as const, category: 'AI' },
    { id: 'process-mining', name: 'Process Mining', description: 'Odkrywanie wzorców w procesach biznesowych', level: 'advanced' as const, category: 'Analytics' },
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const TYPE_CONFIG = {
    ASSISTANT: { label: 'Asystent', icon: Brain, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    AGENT: { label: 'Agent', icon: Bot, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    AUTOMATION: { label: 'Automatyzacja', icon: Cog, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
};

const LEVEL_CONFIG = {
    beginner: { label: 'Początkujący', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
    intermediate: { label: 'Średniozaawansowany', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    advanced: { label: 'Zaawansowany', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ResourcesPage() {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('prompts');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [newResource, setNewResource] = useState({ name: '', category: '', description: '', prompt: '' });
    const [saving, setSaving] = useState(false);

    // --- Data from APIs ---
    const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
    const [agents, setAgents] = useState<AgentItem[]>([]);
    const [newsletters, setNewsletters] = useState<NewsletterItem[]>([]);
    const [resources, setResources] = useState<ResourceItem[]>([]);
    const [loading, setLoading] = useState(true);

    // --- Fetch all data on mount ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [promptsRes, agentsRes, newslettersRes, resourcesRes] = await Promise.allSettled([
                fetch('/api/prompts').then(r => r.ok ? r.json() : []),
                fetch('/api/agents').then(r => r.ok ? r.json() : []),
                fetch('/api/newsletters').then(r => r.ok ? r.json() : []),
                fetch('/api/resources').then(r => r.ok ? r.json() : []),
            ]);

            if (promptsRes.status === 'fulfilled') setPrompts(Array.isArray(promptsRes.value) ? promptsRes.value : []);
            if (agentsRes.status === 'fulfilled') setAgents(Array.isArray(agentsRes.value) ? agentsRes.value : []);
            if (newslettersRes.status === 'fulfilled') setNewsletters(Array.isArray(newslettersRes.value) ? newslettersRes.value : []);
            if (resourcesRes.status === 'fulfilled') setResources(Array.isArray(resourcesRes.value) ? resourcesRes.value : []);
        } catch (err) {
            console.error('Failed to fetch resources:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAddResource = async () => {
        if (!newResource.name.trim()) { toast.error('Podaj nazwę zasobu'); return; }
        setSaving(true);
        try {
            if (activeTab === 'prompts') {
                const res = await fetch('/api/prompts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: newResource.name,
                        category: newResource.category || 'General',
                        description: newResource.description,
                        content: newResource.prompt,
                    }),
                });
                if (res.ok) {
                    toast.success(`Prompt "${newResource.name}" zapisany`);
                    fetchData(); // refresh
                } else {
                    toast.error('Błąd zapisu promptu');
                }
            } else if (activeTab === 'newsletter') {
                const res = await fetch('/api/newsletters', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: newResource.name,
                        content: newResource.description || newResource.prompt || 'Nowy newsletter',
                        publish: true,
                    }),
                });
                if (res.ok) {
                    toast.success(`Newsletter "${newResource.name}" opublikowany`);
                    fetchData();
                } else {
                    toast.error('Błąd zapisu newslettera');
                }
            } else {
                // Resources (articles, etc.)
                const res = await fetch('/api/resources', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: newResource.name,
                        content: newResource.prompt || newResource.description || 'Nowy zasób',
                        category: (newResource.category || 'ARTICLE').toUpperCase(),
                        status: 'PUBLISHED',
                    }),
                });
                if (res.ok) {
                    toast.success(`Zasób "${newResource.name}" zapisany`);
                    fetchData();
                } else {
                    toast.error('Błąd zapisu zasobu');
                }
            }
            setNewResource({ name: '', category: '', description: '', prompt: '' });
            setAddOpen(false);
        } catch {
            toast.error('Błąd połączenia z API');
        } finally {
            setSaving(false);
        }
    };

    const copyPrompt = (prompt: SystemPrompt) => {
        navigator.clipboard.writeText(prompt.content || prompt.prompt || '');
        setCopiedId(prompt.id);
        toast.success(`Skopiowano: ${prompt.name}`);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filterBySearch = <T extends { name?: string; title?: string; description?: string }>(items: T[]) => {
        if (!search) return items;
        const q = search.toLowerCase();
        return items.filter(item =>
            (item.name?.toLowerCase().includes(q)) ||
            (item.title?.toLowerCase().includes(q)) ||
            (item.description?.toLowerCase().includes(q))
        );
    };

    const agentsOnly = agents.filter(a => a.type !== 'AUTOMATION');
    const automationsOnly = agents.filter(a => a.type === 'AUTOMATION');

    const tabConfig = [
        { value: 'prompts', label: 'Prompty', icon: Code2, count: prompts.length },
        { value: 'apps', label: 'Aplikacje', icon: AppWindow, count: BUILT_IN_APPS.length },
        { value: 'skills', label: 'Skille', icon: Sparkles, count: BUILT_IN_SKILLS.length },
        { value: 'agents', label: 'Agenci', icon: Bot, count: agentsOnly.length },
        { value: 'automations', label: 'Automatyzacje', icon: Cog, count: automationsOnly.length },
        { value: 'newsletter', label: 'Newsletter', icon: Newspaper, count: newsletters.length },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 p-3 border border-violet-500/20">
                        <BookOpen className="h-6 w-6 text-violet-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Resources Hub</h1>
                        <p className="text-sm text-muted-foreground">
                            Prompty, aplikacje, skille, agenci i automatyzacje
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Szukaj zasobów..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Dialog open={addOpen} onOpenChange={setAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Dodaj
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Dodaj nowy zasób</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                                <div>
                                    <Label htmlFor="res-name">Nazwa</Label>
                                    <Input id="res-name" placeholder="np. Prompt do analizy SOP" value={newResource.name} onChange={e => setNewResource(p => ({ ...p, name: e.target.value }))} />
                                </div>
                                <div>
                                    <Label htmlFor="res-cat">Kategoria</Label>
                                    <Input id="res-cat" placeholder="np. Lean, AI, HR" value={newResource.category} onChange={e => setNewResource(p => ({ ...p, category: e.target.value }))} />
                                </div>
                                <div>
                                    <Label htmlFor="res-desc">Opis</Label>
                                    <Input id="res-desc" placeholder="Krótki opis zasobu" value={newResource.description} onChange={e => setNewResource(p => ({ ...p, description: e.target.value }))} />
                                </div>
                                {activeTab === 'prompts' && (
                                    <div>
                                        <Label htmlFor="res-prompt">Treść promptu</Label>
                                        <textarea id="res-prompt" rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Wpisz treść promptu systemu..." value={newResource.prompt} onChange={e => setNewResource(p => ({ ...p, prompt: e.target.value }))} />
                                    </div>
                                )}
                                <Button onClick={handleAddResource} disabled={saving} className="w-full bg-gradient-to-r from-violet-600 to-purple-600">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                    Zapisz zasób
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex flex-wrap w-full h-auto p-1 gap-1">
                    {tabConfig.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 py-2.5 text-xs sm:text-sm">
                            <tab.icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                                {tab.count}
                            </Badge>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* PROMPTS TAB */}
                <TabsContent value="prompts" className="mt-6">
                    {filterBySearch(prompts).length === 0 ? (
                        <EmptyState message="Brak promptów. Dodaj pierwszy prompt klikając przycisk 'Dodaj'." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filterBySearch(prompts).map((prompt, idx) => (
                                <motion.div
                                    key={prompt.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className="group hover:shadow-lg hover:border-violet-500/30 transition-all duration-300 h-full">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                                                        <Code2 className="h-4 w-4 text-violet-500" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-sm">{prompt.name}</CardTitle>
                                                        <Badge variant="outline" className="text-[10px] mt-1">{prompt.category}</Badge>
                                                    </div>
                                                </div>
                                                {prompt.isGlobal && (
                                                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                                                        <Globe className="h-2.5 w-2.5 mr-0.5" />
                                                        Global
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-xs mb-3">{prompt.description}</CardDescription>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    {prompt.rating && (
                                                        <span className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                                            {prompt.rating}
                                                        </span>
                                                    )}
                                                    {prompt.uses != null && <span>{prompt.uses} użyć</span>}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs"
                                                    onClick={() => copyPrompt(prompt)}
                                                >
                                                    {copiedId === prompt.id ? (
                                                        <><Check className="h-3 w-3 mr-1" /> Skopiowano</>
                                                    ) : (
                                                        <><Copy className="h-3 w-3 mr-1" /> Kopiuj</>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* APPS TAB (built-in modules) */}
                <TabsContent value="apps" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filterBySearch(BUILT_IN_APPS).map((app, idx) => (
                            <motion.div
                                key={app.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="group hover:shadow-lg hover:border-blue-500/30 transition-all duration-300 cursor-pointer h-full"
                                    onClick={() => app.url && window.location.assign(app.url)}
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-sky-500/10 text-2xl shrink-0">
                                                {app.icon}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-semibold text-foreground group-hover:text-blue-500 transition-colors">
                                                    {app.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-0.5">{app.description}</p>
                                                <Badge variant="outline" className="text-[10px] mt-2">{app.category}</Badge>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0 ml-auto" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>

                {/* SKILLS TAB (built-in knowledge areas) */}
                <TabsContent value="skills" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filterBySearch(BUILT_IN_SKILLS).map((skill, idx) => {
                            const levelCfg = LEVEL_CONFIG[skill.level];
                            return (
                                <motion.div
                                    key={skill.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className="group hover:shadow-lg hover:border-emerald-500/30 transition-all duration-300 h-full">
                                        <CardContent className="p-5">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 shrink-0">
                                                    <Sparkles className="h-5 w-5 text-emerald-500" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-sm font-semibold text-foreground">{skill.name}</h3>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{skill.description}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline" className={`text-[10px] ${levelCfg.color}`}>
                                                            {levelCfg.label}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-[10px]">{skill.category}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* AGENTS TAB */}
                <TabsContent value="agents" className="mt-6">
                    {filterBySearch(agentsOnly).length === 0 ? (
                        <EmptyState message="Brak agentów AI. Utwórz agenta w sekcji Agenci." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filterBySearch(agentsOnly).map((agent, idx) => {
                                const typeCfg = TYPE_CONFIG[agent.type] || TYPE_CONFIG.AGENT;
                                const TypeIcon = typeCfg.icon;
                                return (
                                    <motion.div
                                        key={agent.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Card className={`group hover:shadow-lg hover:${typeCfg.border} transition-all duration-300 h-full`}>
                                            <CardContent className="p-5">
                                                <div className="flex items-start gap-3">
                                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${typeCfg.bg} shrink-0`}>
                                                        <TypeIcon className={`h-5 w-5 ${typeCfg.color}`} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
                                                            <Badge variant="outline" className={`text-[10px] ${typeCfg.bg} ${typeCfg.color} ${typeCfg.border}`}>
                                                                {typeCfg.label}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-0.5">{agent.description}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-[10px] ${agent.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                                                    agent.status === 'TESTING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                                                        'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                                                    }`}
                                                            >
                                                                {agent.status === 'ACTIVE' ? '● Aktywny' : agent.status === 'TESTING' ? '◐ Testowy' : '○ Nieaktywny'}
                                                            </Badge>
                                                            {agent.model && (
                                                                <span className="text-[10px] text-muted-foreground">{agent.model}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* AUTOMATIONS TAB */}
                <TabsContent value="automations" className="mt-6">
                    <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-1">
                            <Cog className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm font-medium text-foreground">Automatyzacje</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Deterministyczna logika algorytmiczna — skrypty, wyliczenia, funkcje. Każda automatyzacja daje 100% pewny wynik (brak AI).
                        </p>
                    </div>
                    {filterBySearch(automationsOnly).length === 0 ? (
                        <EmptyState message="Brak automatyzacji. Utwórz automatyzację w sekcji Agenci z typem AUTOMATION." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filterBySearch(automationsOnly).map((agent, idx) => (
                                <motion.div
                                    key={agent.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className="group hover:shadow-lg hover:border-emerald-500/30 transition-all duration-300 h-full">
                                        <CardContent className="p-5">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 shrink-0">
                                                    <Cog className="h-5 w-5 text-emerald-500" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
                                                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                                            ⚙️ Automation
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{agent.description}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20">
                                                            ● Aktywna
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground">100% deterministyczna</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* NEWSLETTER TAB */}
                <TabsContent value="newsletter" className="mt-6">
                    {filterBySearch(newsletters).length === 0 ? (
                        <EmptyState message="Brak newsletterów. Dodaj pierwszy newsletter." />
                    ) : (
                        <div className="space-y-3">
                            {filterBySearch(newsletters).map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className={`hover:shadow-lg transition-all duration-300 ${item.isPinned ? 'border-amber-500/30 bg-amber-500/5' : ''}`}>
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 shrink-0">
                                                        <Newspaper className="h-5 w-5 text-orange-500" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                                                            {item.isPinned && (
                                                                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                                                                    📌 Przypięty
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                                                        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                                                            <span>{item.author?.name || 'Autor'}</span>
                                                            {item.publishedAt && <span>{new Date(item.publishedAt).toLocaleDateString('pl-PL')}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
