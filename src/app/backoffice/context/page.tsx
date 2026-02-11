'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ChevronLeft,
    Building2,
    LayoutDashboard,
    MessageSquare,
    Edit3,
    FileText,
    Users,
    Bot,
    FileSearch,
    BookOpen,
    TrendingUp,
    Loader2,
    Send,
    Plus,
    Upload,
    CheckCircle2,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CompanyContextManager } from '@/components/backoffice/company-context-manager';

// ── Types ──────────────────────────────────────────

type TabId = 'dashboard' | 'chat' | 'edit' | 'transcripts';

interface CompanyStats {
    departments: number;
    sops: number;
    agents: number;
    mudaReports: number;
    ontologyEntries: number;
    employees: number;
    completeness: number;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface Transcript {
    id: string;
    title: string;
    source: string;
    status: 'pending' | 'processing' | 'done' | 'error';
    date: string;
    extractedEntities?: number;
}

// ── Tab Config ─────────────────────────────────────

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard; description: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Przegląd danych firmowych' },
    { id: 'chat', label: 'Chat AI', icon: MessageSquare, description: 'Wprowadzaj wiedzę przez rozmowę' },
    { id: 'edit', label: 'Pola edycyjne', icon: Edit3, description: 'Ręczna edycja danych' },
    { id: 'transcripts', label: 'Transkrypty', icon: FileText, description: 'Karm bazę wiedzy transkryptami' },
];

// ── Dashboard Tab ──────────────────────────────────

function DashboardTab() {
    const [stats, setStats] = useState<CompanyStats>({
        departments: 0, sops: 0, agents: 0, mudaReports: 0,
        ontologyEntries: 0, employees: 0, completeness: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [deptRes, sopRes, agentRes, mudaRes] = await Promise.allSettled([
                    fetch('/api/departments').then(r => r.json()),
                    fetch('/api/sops?limit=1').then(r => r.json()),
                    fetch('/api/agents?limit=1').then(r => r.json()),
                    fetch('/api/muda?limit=1').then(r => r.json()),
                ]);
                const departments = deptRes.status === 'fulfilled' ? (deptRes.value?.departments?.length || 0) : 0;
                const sops = sopRes.status === 'fulfilled' ? (sopRes.value?.total || 0) : 0;
                const agents = agentRes.status === 'fulfilled' ? (agentRes.value?.total || 0) : 0;
                const mudaReports = mudaRes.status === 'fulfilled' ? (mudaRes.value?.total || 0) : 0;

                const filled = [departments > 0, sops > 0, agents > 0].filter(Boolean).length;
                const completeness = Math.round((filled / 5) * 100);

                setStats({ departments, sops, agents, mudaReports, ontologyEntries: 0, employees: 0, completeness });
            } catch {
                // Keep defaults
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const statCards = [
        { label: 'Działy', value: stats.departments, icon: Building2, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
        { label: 'SOP', value: stats.sops, icon: FileSearch, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
        { label: 'Agenci AI', value: stats.agents, icon: Bot, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
        { label: 'Raporty MUDA', value: stats.mudaReports, icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
        { label: 'Słownik', value: stats.ontologyEntries, icon: BookOpen, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
        { label: 'Pracownicy', value: stats.employees, icon: Users, color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
    ];

    return (
        <div className="space-y-6">
            {/* Completeness */}
            <Card className="bg-card/50 border-border">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Kompletność bazy wiedzy</h3>
                            <p className="text-xs text-muted-foreground">Ile danych firmowych jest uzupełnionych</p>
                        </div>
                        <span className="text-2xl font-bold text-foreground">{stats.completeness}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.completeness}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {statCards.map(({ label, value, icon: Icon, color, bgColor }) => (
                    <Card key={label} className="bg-card/50 border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={cn('rounded-lg p-2', bgColor)}>
                                    <Icon className={cn('h-4 w-4', color)} />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-foreground">{value}</p>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link href="/canvas" className="group">
                    <Card className="bg-card/50 border-border hover:border-blue-500/30 transition-colors">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-lg p-2 bg-blue-500/10">
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground group-hover:text-blue-500 transition-colors">AI Canvas</p>
                                <p className="text-xs text-muted-foreground">Dashboard widgetów AI</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/value-chain" className="group">
                    <Card className="bg-card/50 border-border hover:border-emerald-500/30 transition-colors">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-lg p-2 bg-emerald-500/10">
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground group-hover:text-emerald-500 transition-colors">Łańcuch Wartości</p>
                                <p className="text-xs text-muted-foreground">Wizualizacja procesów</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}

// ── Chat Tab ───────────────────────────────────────

function ChatTab() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1', role: 'assistant',
            content: 'Cześć! Jestem asystentem kontekstu firmowego. Opowiedz mi o swojej firmie, a ja uzupełnię bazę wiedzy. Mogę pomóc z:\n\n• Opisem firmy i jej misji\n• Strukturą działów\n• Kluczowymi procesami\n• Informacjami o pracownikach',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = useCallback(async () => {
        if (!input.trim() || sending) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setSending(true);

        // Simulate AI response (replace with real API)
        setTimeout(() => {
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Dziękuję za informacje! Zapisałem to do kontekstu firmowego. Czy chcesz dodać więcej szczegółów na ten temat?',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMsg]);
            setSending(false);
        }, 1500);
    }, [input, sending]);

    return (
        <div className="flex flex-col h-[600px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 p-4 rounded-xl border border-border bg-muted/20 mb-3">
                {messages.map((msg) => (
                    <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                        <div className={cn(
                            'max-w-[80%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap',
                            msg.role === 'user'
                                ? 'bg-rose-600 text-white'
                                : 'bg-card border border-border text-foreground'
                        )}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {sending && (
                    <div className="flex justify-start">
                        <div className="bg-card border border-border rounded-xl px-4 py-2.5">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Opowiedz o firmie, procesach, strukturze..."
                    className="flex-1 resize-none h-12 min-h-[48px] bg-muted/30"
                    rows={1}
                />
                <Button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="bg-rose-600 hover:bg-rose-700 h-12 px-4"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// ── Edit Tab (uses existing CompanyContextManager) ─

function EditTab() {
    return <CompanyContextManager />;
}

// ── Transcripts Tab ────────────────────────────────

function TranscriptsTab() {
    const [transcripts, setTranscripts] = useState<Transcript[]>([
        { id: '1', title: 'Spotkanie kick-off Transformacja', source: 'Fireflies', status: 'done', date: '2025-01-15', extractedEntities: 12 },
        { id: '2', title: 'Warsztat procesów sprzedażowych', source: 'Manual upload', status: 'done', date: '2025-01-20', extractedEntities: 8 },
        { id: '3', title: 'Rozmowa z CEO - wizja firmy', source: 'Fireflies', status: 'processing', date: '2025-02-01' },
    ]);

    const statusConfig = {
        pending: { label: 'Oczekuje', icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
        processing: { label: 'Przetwarzanie...', icon: Loader2, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
        done: { label: 'Gotowy', icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
        error: { label: 'Błąd', icon: AlertCircle, color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
    };

    return (
        <div className="space-y-4">
            {/* Upload area */}
            <div className="rounded-xl border-2 border-dashed border-border hover:border-rose-500/30 transition-colors p-8 text-center cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Przeciągnij transkrypt lub kliknij</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Obsługiwane formaty: .txt, .md, .pdf, .docx
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                    <Plus className="h-3 w-3 mr-1" /> Wybierz plik
                </Button>
            </div>

            {/* Transcripts list */}
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Transkrypty ({transcripts.length})</h3>
                {transcripts.map((t) => {
                    const st = statusConfig[t.status];
                    const StIcon = st.icon;
                    return (
                        <div key={t.id} className="rounded-lg border border-border p-3 flex items-center justify-between bg-card/50">
                            <div className="flex items-center gap-3">
                                <div className={cn('rounded-md p-1.5', st.bgColor)}>
                                    <StIcon className={cn('h-3.5 w-3.5', st.color, t.status === 'processing' && 'animate-spin')} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{t.title}</p>
                                    <p className="text-xs text-muted-foreground">{t.source} • {t.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {t.extractedEntities && (
                                    <Badge variant="outline" className="text-[10px]">
                                        {t.extractedEntities} encji
                                    </Badge>
                                )}
                                <Badge variant="secondary" className={cn('text-[10px]', st.color)}>
                                    {st.label}
                                </Badge>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────

export default function BackofficeContextPage() {
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');

    const tabContent: Record<TabId, React.ReactNode> = {
        dashboard: <DashboardTab />,
        chat: <ChatTab />,
        edit: <EditTab />,
        transcripts: <TranscriptsTab />,
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
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-foreground">Kontekst Firmowy</h1>
                        <p className="text-sm text-muted-foreground">
                            Baza wiedzy o firmie dla AI
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center',
                                isActive
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                >
                    {tabContent[activeTab]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
