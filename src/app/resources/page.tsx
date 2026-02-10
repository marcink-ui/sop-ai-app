'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    ExternalLink,
    Zap,
    Brain,
    Target,
    ArrowRight,
    Globe,
    X,
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
    prompt: string;
    rating: number;
    uses: number;
    isGlobal: boolean;
}

interface AppItem {
    id: string;
    name: string;
    description: string;
    url?: string;
    category: string;
    icon: string;
    isGlobal: boolean;
}

interface SkillItem {
    id: string;
    name: string;
    description: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    isGlobal: boolean;
}

interface AgentItem {
    id: string;
    name: string;
    description: string;
    type: 'ASSISTANT' | 'AGENT' | 'AUTOMATION';
    status: 'ACTIVE' | 'INACTIVE' | 'TESTING';
    model?: string;
    isGlobal: boolean;
}

interface NewsletterItem {
    id: string;
    title: string;
    content: string;
    publishedAt: string | null;
    isPinned: boolean;
    author: { name: string | null };
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const SAMPLE_PROMPTS: SystemPrompt[] = [
    {
        id: '1',
        name: 'Asystent Sprzedaży B2B',
        category: 'Sales',
        description: 'Prompt do personalizowanych wiadomości sprzedażowych B2B',
        prompt: 'Jesteś ekspertem w sprzedaży B2B dla firm MŚP...',
        rating: 4.8,
        uses: 234,
        isGlobal: true,
    },
    {
        id: '2',
        name: 'Audytor MUDA / Lean',
        category: 'Lean',
        description: 'Identyfikacja 8 typów marnotrawstwa w procesach',
        prompt: 'Przeanalizuj proces pod kątem 8 typów MUDA...',
        rating: 4.9,
        uses: 156,
        isGlobal: true,
    },
    {
        id: '3',
        name: 'Kreator SOP',
        category: 'Operations',
        description: 'Tworzenie procedur operacyjnych krok po kroku',
        prompt: 'Na podstawie opisu procesu, stwórz SOP...',
        rating: 4.7,
        uses: 189,
        isGlobal: true,
    },
    {
        id: '4',
        name: 'Analityk ROI',
        category: 'Finance',
        description: 'Kalkulacja ROI transformacji cyfrowej',
        prompt: 'Oblicz ROI wdrożenia AI na podstawie danych...',
        rating: 4.6,
        uses: 98,
        isGlobal: false,
    },
];

const SAMPLE_APPS: AppItem[] = [
    { id: '1', name: 'VantageOS Canvas', description: 'Warsztaty strategiczne z AI', url: '/canvas', category: 'Strategy', icon: '🎯', isGlobal: true },
    { id: '2', name: 'Value Chain Mapper', description: 'Mapowanie łańcucha wartości', url: '/value-chain', category: 'Operations', icon: '🔗', isGlobal: true },
    { id: '3', name: 'MUDA Reporter', description: 'Identyfikacja marnotrawstwa', url: '/muda', category: 'Lean', icon: '🔍', isGlobal: true },
    { id: '4', name: 'Knowledge Graph', description: 'Wizualizacja wiedzy firmy', url: '/knowledge-graph', category: 'Knowledge', icon: '🧠', isGlobal: true },
    { id: '5', name: 'Kaizen Board', description: 'System ciągłego doskonalenia', url: '/kaizen', category: 'Lean', icon: '⚡', isGlobal: true },
];

const SAMPLE_SKILLS: SkillItem[] = [
    { id: '1', name: 'Gemba Walk Digital', description: 'Zdalna obserwacja procesów z analizą AI', level: 'intermediate', category: 'Lean', isGlobal: true },
    { id: '2', name: 'SOP Writing', description: 'Tworzenie skutecznych procedur operacyjnych', level: 'beginner', category: 'Operations', isGlobal: true },
    { id: '3', name: 'AI Prompt Engineering', description: 'Projektowanie promptów dla agentów AI', level: 'advanced', category: 'AI', isGlobal: true },
    { id: '4', name: 'Process Mining', description: 'Odkrywanie wzorców w procesach biznesowych', level: 'advanced', category: 'Analytics', isGlobal: false },
];

const SAMPLE_AGENTS: AgentItem[] = [
    { id: '1', name: 'SOP Asystent', description: 'Dobrze ustrukturyzowany prompt + baza wiedzy SOPów', type: 'ASSISTANT', status: 'ACTIVE', model: 'GPT-4o', isGlobal: true },
    { id: '2', name: 'MUDA Agent', description: 'Automatycznie analizuje procesy i tworzy raporty MUDA', type: 'AGENT', status: 'ACTIVE', model: 'Claude 3.5', isGlobal: true },
    { id: '3', name: 'Newsletter Generator', description: 'Zbiera informacje i generuje newsletter firmowy', type: 'AGENT', status: 'TESTING', model: 'GPT-4o', isGlobal: false },
    { id: '4', name: 'KPI Calculator', description: 'Algorytmiczne wyliczenie KPI z danych wejściowych', type: 'AUTOMATION', status: 'ACTIVE', isGlobal: true },
    { id: '5', name: 'SOP Validator', description: 'Sprawdza kompletność SOP wg checklisty', type: 'AUTOMATION', status: 'ACTIVE', isGlobal: true },
];

const SAMPLE_NEWSLETTERS: NewsletterItem[] = [
    { id: '1', title: 'VantageOS 2.0 — nowy Knowledge Graph i Value Chain', content: 'Wprowadziliśmy nowy moduł...', publishedAt: '2025-02-08', isPinned: true, author: { name: 'Admin' } },
    { id: '2', title: 'Jak AI zmieniło procesy w firmie X', content: 'Case study...', publishedAt: '2025-02-05', isPinned: false, author: { name: 'Marcin' } },
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

    const handleAddResource = async () => {
        if (!newResource.name.trim()) { toast.error('Podaj nazwę zasobu'); return; }
        setSaving(true);
        try {
            if (activeTab === 'prompts') {
                // Try API first, fall back to localStorage
                try {
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
                        setNewResource({ name: '', category: '', description: '', prompt: '' });
                        setAddOpen(false);
                        return;
                    }
                } catch { /* API unavailable */ }
                // Fallback: localStorage
                const stored = JSON.parse(localStorage.getItem('vos-custom-prompts') || '[]');
                stored.push({ id: `custom-${Date.now()}`, ...newResource, rating: 0, uses: 0, isGlobal: false });
                localStorage.setItem('vos-custom-prompts', JSON.stringify(stored));
                toast.success(`Prompt "${newResource.name}" zapisany lokalnie`);
            } else {
                const stored = JSON.parse(localStorage.getItem(`vos-custom-${activeTab}`) || '[]');
                stored.push({ id: `custom-${Date.now()}`, name: newResource.name, description: newResource.description, category: newResource.category || 'General', isGlobal: false });
                localStorage.setItem(`vos-custom-${activeTab}`, JSON.stringify(stored));
                toast.success(`Zasób "${newResource.name}" zapisany`);
            }
            setNewResource({ name: '', category: '', description: '', prompt: '' });
            setAddOpen(false);
        } finally {
            setSaving(false);
        }
    };

    const copyPrompt = (prompt: SystemPrompt) => {
        navigator.clipboard.writeText(prompt.prompt);
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

    const tabConfig = [
        { value: 'prompts', label: 'Prompty', icon: Code2, count: SAMPLE_PROMPTS.length },
        { value: 'apps', label: 'Aplikacje', icon: AppWindow, count: SAMPLE_APPS.length },
        { value: 'skills', label: 'Skille', icon: Sparkles, count: SAMPLE_SKILLS.length },
        { value: 'agents', label: 'Agenci', icon: Bot, count: SAMPLE_AGENTS.length },
        { value: 'automations', label: 'Automatyzacje', icon: Cog, count: SAMPLE_AGENTS.filter(a => a.type === 'AUTOMATION').length },
        { value: 'newsletter', label: 'Newsletter', icon: Newspaper, count: SAMPLE_NEWSLETTERS.length },
    ];

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filterBySearch(SAMPLE_PROMPTS).map((prompt, idx) => (
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
                                            <div className="flex items-center gap-1">
                                                {prompt.isGlobal && (
                                                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                                                        <Globe className="h-2.5 w-2.5 mr-0.5" />
                                                        Global
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-xs mb-3">{prompt.description}</CardDescription>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                                    {prompt.rating}
                                                </span>
                                                <span>{prompt.uses} użyć</span>
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
                </TabsContent>

                {/* APPS TAB */}
                <TabsContent value="apps" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filterBySearch(SAMPLE_APPS).map((app, idx) => (
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
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="outline" className="text-[10px]">{app.category}</Badge>
                                                    {app.isGlobal && (
                                                        <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                                                            Global
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0 ml-auto" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>

                {/* SKILLS TAB */}
                <TabsContent value="skills" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filterBySearch(SAMPLE_SKILLS).map((skill, idx) => {
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filterBySearch(SAMPLE_AGENTS).filter(a => a.type !== 'AUTOMATION').map((agent, idx) => {
                            const typeCfg = TYPE_CONFIG[agent.type];
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
                            Inspirowane bibliotekami Zapier, Make.com, N8N — ale zbudowane wewnętrznie.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filterBySearch(SAMPLE_AGENTS).filter(a => a.type === 'AUTOMATION').map((agent, idx) => {
                            const typeCfg = TYPE_CONFIG.AUTOMATION;
                            return (
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
                            );
                        })}
                    </div>
                </TabsContent>

                {/* NEWSLETTER TAB */}
                <TabsContent value="newsletter" className="mt-6">
                    <div className="space-y-3">
                        {filterBySearch(SAMPLE_NEWSLETTERS).map((item, idx) => (
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
                                                        <span>{item.author.name}</span>
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
                </TabsContent>
            </Tabs>
        </div>
    );
}
