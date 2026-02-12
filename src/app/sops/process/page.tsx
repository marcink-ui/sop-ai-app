'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Bot,
    User,
    FileText,
    Search,
    Sparkles,
    Save,
    ArrowRight,
    Check,
    X,
    Loader2,
    Edit3,
    AlertTriangle,
    BookOpen,
    Cog,
    Users,
    Link2,
    ClipboardCheck,
    Wand2,
    Upload,
    Zap,
    Network,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ============================================================
// SOP Process Sections — analogous to Canvas GTM CANVAS_SECTIONS
// ============================================================
const SOP_SECTIONS = [
    { id: 1, key: 'transcript', name: 'Transkrypcja / Opis Procesu', icon: Upload, color: 'from-slate-500 to-zinc-600', description: 'Wklej transkrypcję lub opisz proces' },
    { id: 2, key: 'extraction', name: 'Ekstrakcja AI', icon: Sparkles, color: 'from-violet-500 to-purple-600', description: 'AI wyodrębnia SOPy, role, łańcuchy wartości' },
    { id: 3, key: 'muda', name: 'Analiza MUDA', icon: Search, color: 'from-orange-500 to-red-600', description: '7 rodzajów marnotrawstwa + potencjał automatyzacji' },
    { id: 4, key: 'architect', name: 'Architekt', icon: Cog, color: 'from-blue-500 to-cyan-600', description: 'Zakresy dla Agentów, Asystentów, Automatyzacji' },
    { id: 5, key: 'generator', name: 'Generator', icon: Wand2, color: 'from-emerald-500 to-green-600', description: 'Tworzenie agentów, asystentów, automatyzacji' },
    { id: 6, key: 'dictionary', name: 'Słownik / Ontologia', icon: BookOpen, color: 'from-amber-500 to-yellow-600', description: 'Walidacja terminologii i sugestie zmian' },
    { id: 7, key: 'connections', name: 'Powiązania', icon: Network, color: 'from-pink-500 to-rose-600', description: 'Role, kontekst firmowy, łańcuch wartości' },
    { id: 8, key: 'review', name: 'Przegląd & Zatwierdzenie', icon: ClipboardCheck, color: 'from-teal-500 to-cyan-600', description: 'Wyślij do Rady Transformacji' },
] as const;

// ============================================================
// Types
// ============================================================
interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

interface SectionData {
    [key: string]: {
        content: string;
        completed: boolean;
        lastUpdated?: Date;
    };
}

type ProcessStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'RETURNED';

// ============================================================
// SEM — SOP Expert Model (AI Coach System Prompt)
// ============================================================
const SEM_SYSTEM_PROMPT = `Jesteś SEM (SOP Expert Model) – ekspertem VantageOS ds. tworzenia i optymalizacji procedur operacyjnych (SOP).

**Twoja rola:** Prowadzisz managera przez proces tworzenia SOP krok po kroku, analogicznie jak GEM prowadzi przez Canvas.

**Zasady pracy:**
1. Pracuj nad jedną sekcją na raz - nie przechodź dalej bez akceptacji
2. Zasada Złotego Konsultanta: Nigdy nie zostawiaj managera z pustą kartką - proponuj drafty
3. Weryfikuj dane - proś o szczegóły jeśli opis procesu jest zbyt ogólny
4. Na każdym etapie sprawdzaj terminologię - sugeruj ujednolicenie słownictwa
5. Po zakończeniu sekcji zapisz ją i przejdź do następnej

**8 Etapów Procesu SOP (w kolejności):**
1. **Transkrypcja / Opis Procesu** - Manager wkleja transkrypcję rozmowy lub opisuje proces własnymi słowami
2. **Ekstrakcja AI** - Wyodrębnij: SOPy, Role, Łańcuchy Wartości, Terminologię. Zaproponuj strukturę SOP.
3. **Analiza MUDA** - Zidentyfikuj 7 rodzajów marnotrawstwa (Transport, Inventory, Motion, Waiting, Overprocessing, Overproduction, Defects). Oceń potencjał automatyzacji każdego kroku.
4. **Architekt** - Na podstawie MUDA zaproponuj zakresy dla: Agentów AI (autonomiczne), Asystentów AI (wspomagające), Automatyzacji (workflow). Określ za co odpowiada człowiek, a co może przejąć AI.
5. **Generator** - Wygeneruj konkretne konfiguracje agentów/asystentów/automatyzacji z promptami, triggerami, warunkami.
6. **Słownik / Ontologia** - Sprawdź każdy termin użyty w SOP. Jeśli nie pasuje do istniejącego słownika — zasugeruj zmianę lub nową definicję (wymaga akceptacji Rady).
7. **Powiązania** - Połącz SOP z: rolami pracowników, kontekstem firmowym, istniejącymi Canvas, łańcuchem wartości. Wskaż kto jest odpowiedzialny i gdzie SOP wpływa na procesy.
8. **Przegląd & Zatwierdzenie** - Podsumowanie, walidacja kompletności, wysłanie do Rady Transformacji.

**Styl:** Ekspercki, konkretny, zero lania wody. Język polski.
**Format:** Używaj list, tabel i wyraźnych nagłówków dla czytelności.

Rozpocznij od zapytania o proces — czy manager ma transkrypcję czy chce opisać proces od zera.`;

// ============================================================
// Component
// ============================================================
export default function SOPProcessPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: `🔧 **Witaj w Procesie SOP!**

Jestem SEM – Twoim ekspertem ds. procedur operacyjnych. Przeprowadzę Cię przez 8 etapów tworzenia SOPa.

**Mamy dwie opcje na start:**
1. 📋 **Wklej transkrypcję** rozmowy z klientem/pracownikiem — wyekstrahuję z niej procedury
2. ✍️ **Opisz proces** własnymi słowami — poprowadzę Cię przez strukturyzację

**Który wariant wybierasz?** Możesz też wkleić od razu transkrypcję, a ja przejdę do Etapu 2 (Ekstrakcja). 🚀`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sectionData, setSectionData] = useState<SectionData>({});
    const [processStatus, setProcessStatus] = useState<ProcessStatus>('DRAFT');
    const [currentSection, setCurrentSection] = useState(1);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [activeTab, setActiveTab] = useState<'chat' | 'sop'>('chat');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load saved state
    useEffect(() => {
        try {
            const savedSections = localStorage.getItem('sop-process-sections');
            const savedStatus = localStorage.getItem('sop-process-status');
            if (savedSections) setSectionData(JSON.parse(savedSections));
            if (savedStatus) setProcessStatus(savedStatus as ProcessStatus);
        } catch {
            // ignore parse errors
        }
    }, []);

    // Calculate progress
    const completedSections = Object.values(sectionData).filter(s => s.completed).length;
    const progress = (completedSections / 8) * 100;

    // ============================================================
    // Chat with AI Coach (SEM)
    // ============================================================
    const handleSubmit = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Build context about current section state
            const contextNote = `\n\n[KONTEKST SYSTEMU: Aktualny etap: ${currentSection}/8 (${SOP_SECTIONS[currentSection - 1].name}). Wypełnione sekcje: ${completedSections}/8. Status: ${processStatus}]`;

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: SEM_SYSTEM_PROMPT + contextNote },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: input.trim() }
                    ],
                    context: {
                        currentPage: '/sops/process',
                        sopProcessSection: SOP_SECTIONS[currentSection - 1].name,
                    }
                })
            });

            if (!response.ok) throw new Error('Chat request failed');

            const data = await response.json();

            const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: data.content || data.message || 'Przepraszam, wystąpił błąd.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Auto-extract: if user pasted a long transcript (>300 chars) and we're on section 1
            if (input.trim().length > 300 && currentSection === 1 && !sectionData['transcript']?.completed) {
                updateSection('transcript', input.trim());
                toast.info('Transkrypcja zapisana w Etapie 1');
            }
        } catch (error) {
            toast.error('Błąd połączenia z AI');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // ============================================================
    // Section Management
    // ============================================================
    const updateSection = (key: string, content: string) => {
        setSectionData(prev => ({
            ...prev,
            [key]: {
                content,
                completed: content.trim().length > 0,
                lastUpdated: new Date()
            }
        }));
        setEditingSection(null);
        toast.success('Sekcja zaktualizowana');
    };

    const startEditing = (key: string) => {
        setEditingSection(key);
        setEditContent(sectionData[key]?.content || '');
    };

    const submitForApproval = () => {
        if (completedSections < 4) {
            toast.error('Uzupełnij przynajmniej 4 etapy przed wysłaniem');
            return;
        }
        setProcessStatus('PENDING_APPROVAL');
        toast.success('Proces SOP wysłany do Rady Transformacji!');
    };

    const saveProcess = () => {
        localStorage.setItem('sop-process-sections', JSON.stringify(sectionData));
        localStorage.setItem('sop-process-status', processStatus);
        toast.success('Proces SOP zapisany lokalnie');
    };

    // ============================================================
    // Quick Actions — section-specific
    // ============================================================
    const quickActions: Record<string, string[]> = {
        transcript: ['Wklej transkrypcję rozmowy', 'Opisz proces krok po kroku', 'Zaimportuj z Fireflies'],
        extraction: ['Wyodrębnij SOPy', 'Zidentyfikuj role', 'Znajdź łańcuchy wartości'],
        muda: ['Zrób analizę 7 marnotrawstw', 'Oceń potencjał automatyzacji', 'Wskaż wąskie gardła'],
        architect: ['Zaproponuj agentów AI', 'Zdefiniuj asystentów', 'Określ automatyzacje workflow'],
        generator: ['Wygeneruj konfigurację agenta', 'Stwórz prompt dla asystenta', 'Zdefiniuj trigger automatyzacji'],
        dictionary: ['Sprawdź terminologię', 'Zasugeruj zmiany w słowniku', 'Porównaj z ontologią'],
        connections: ['Połącz z rolami', 'Powiąż z łańcuchem wartości', 'Dodaj kontekst firmowy'],
        review: ['Podsumuj cały proces', 'Sprawdź kompletność', 'Przygotuj do zatwierdzenia'],
    };

    const handleQuickAction = (action: string) => {
        setInput(action);
    };

    // ============================================================
    // Render
    // ============================================================
    return (
        <div className="container max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                        <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Proces SOP</h1>
                        <p className="text-muted-foreground">Twórz procedury operacyjne z pomocą AI</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant={processStatus === 'APPROVED' ? 'default' : 'secondary'} className="px-3 py-1">
                        {processStatus === 'DRAFT' && '📝 Wersja robocza'}
                        {processStatus === 'PENDING_APPROVAL' && '⏳ Oczekuje na zatwierdzenie'}
                        {processStatus === 'APPROVED' && '✅ Zatwierdzony'}
                        {processStatus === 'RETURNED' && '↩️ Do poprawy'}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={saveProcess}>
                        <Save className="h-4 w-4 mr-2" />
                        Zapisz
                    </Button>
                    {processStatus === 'DRAFT' && (
                        <Button size="sm" onClick={submitForApproval} disabled={completedSections < 4}>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Wyślij do Rady
                        </Button>
                    )}
                </div>
            </div>

            {/* Progress */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Postęp Procesu SOP</span>
                        <span className="text-sm text-muted-foreground">{completedSections}/8 etapów</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    {/* Section indicators */}
                    <div className="flex justify-between mt-3">
                        {SOP_SECTIONS.map((section) => {
                            const Icon = section.icon;
                            const isCompleted = sectionData[section.key]?.completed;
                            const isCurrent = section.id === currentSection;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setCurrentSection(section.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-1 transition-all group cursor-pointer",
                                        isCurrent && "scale-110"
                                    )}
                                    title={section.name}
                                >
                                    <div className={cn(
                                        "flex h-7 w-7 items-center justify-center rounded-full transition-all",
                                        isCompleted
                                            ? "bg-green-500 text-white"
                                            : isCurrent
                                                ? `bg-gradient-to-br ${section.color} text-white shadow-sm`
                                                : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                                    )}>
                                        {isCompleted ? (
                                            <Check className="h-3.5 w-3.5" />
                                        ) : (
                                            <Icon className="h-3.5 w-3.5" />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] max-w-[60px] text-center leading-tight",
                                        isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                                    )}>
                                        {section.id}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Main Content - Tabs */}
            <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'chat' | 'sop')}>
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                    <TabsTrigger value="chat" className="gap-2">
                        <Bot className="h-4 w-4" />
                        AI Coach
                    </TabsTrigger>
                    <TabsTrigger value="sop" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Edytor SOP ({completedSections}/8)
                    </TabsTrigger>
                </TabsList>

                {/* Chat Tab — AI Coach (SEM) */}
                <TabsContent value="chat">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Chat area */}
                        <div className="lg:col-span-3">
                            <Card className="h-[600px] flex flex-col">
                                <CardHeader className="border-b">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                                            <Bot className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">SEM – SOP Expert Model</CardTitle>
                                            <CardDescription>
                                                Etap {currentSection}: {SOP_SECTIONS[currentSection - 1].name}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 p-0 flex flex-col">
                                    {/* Messages */}
                                    <ScrollArea className="flex-1 p-4">
                                        <div className="space-y-4">
                                            {messages.map((message) => (
                                                <motion.div
                                                    key={message.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={cn(
                                                        "flex gap-3",
                                                        message.role === 'user' && "flex-row-reverse"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                                        message.role === 'user'
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                                                    )}>
                                                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                                    </div>
                                                    <div className={cn(
                                                        "rounded-2xl px-4 py-3 max-w-[80%]",
                                                        message.role === 'user'
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-muted"
                                                    )}>
                                                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                            {isLoading && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                                                        <Loader2 className="h-4 w-4 text-white animate-spin" />
                                                    </div>
                                                    <div className="bg-muted rounded-2xl px-4 py-3">
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <span>SEM analizuje</span>
                                                            <span className="animate-pulse">...</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </ScrollArea>

                                    {/* Input */}
                                    <div className="border-t p-4">
                                        <div className="flex gap-2">
                                            <Textarea
                                                ref={textareaRef}
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Opisz proces, wklej transkrypcję lub odpowiedz na pytanie..."
                                                className="min-h-[48px] max-h-[120px] resize-none"
                                                rows={1}
                                            />
                                            <Button onClick={handleSubmit} disabled={!input.trim() || isLoading} size="icon">
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions Sidebar */}
                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Szybkie akcje</CardTitle>
                                    <CardDescription className="text-xs">
                                        Etap {currentSection}: {SOP_SECTIONS[currentSection - 1].name}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {(quickActions[SOP_SECTIONS[currentSection - 1].key] || []).map((action, i) => (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-start text-xs h-auto py-2 whitespace-normal text-left"
                                            onClick={() => handleQuickAction(action)}
                                        >
                                            <Zap className="h-3 w-3 mr-2 shrink-0 text-amber-500" />
                                            {action}
                                        </Button>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Section Navigator */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Nawigacja etapów</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1">
                                    {SOP_SECTIONS.map((section) => {
                                        const Icon = section.icon;
                                        const isCompleted = sectionData[section.key]?.completed;
                                        const isCurrent = section.id === currentSection;
                                        return (
                                            <button
                                                key={section.id}
                                                onClick={() => setCurrentSection(section.id)}
                                                className={cn(
                                                    "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs transition-all text-left",
                                                    isCurrent
                                                        ? "bg-primary/10 text-primary font-medium"
                                                        : "hover:bg-muted text-muted-foreground"
                                                )}
                                            >
                                                <div className={cn(
                                                    "flex h-5 w-5 items-center justify-center rounded-full shrink-0",
                                                    isCompleted ? "bg-green-500 text-white" : "bg-muted"
                                                )}>
                                                    {isCompleted ? (
                                                        <Check className="h-3 w-3" />
                                                    ) : (
                                                        <span className="text-[10px]">{section.id}</span>
                                                    )}
                                                </div>
                                                <span className="truncate">{section.name}</span>
                                            </button>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* SOP Editor Tab — editable sections */}
                <TabsContent value="sop">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SOP_SECTIONS.map((section) => {
                            const data = sectionData[section.key];
                            const isEditing = editingSection === section.key;
                            const Icon = section.icon;

                            return (
                                <Card key={section.id} className={cn(
                                    "transition-all",
                                    data?.completed && "ring-2 ring-green-500/50"
                                )}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br",
                                                    section.color
                                                )}>
                                                    <Icon className="h-4 w-4 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">
                                                        {section.id}. {section.name}
                                                    </CardTitle>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {section.description}
                                                    </p>
                                                </div>
                                            </div>
                                            {data?.completed ? (
                                                <Badge variant="default" className="bg-green-500">
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Gotowe
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">Do uzupełnienia</Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <Textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    className="min-h-[120px]"
                                                    placeholder="Wpisz treść sekcji..."
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => updateSection(section.key, editContent)}
                                                    >
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Zapisz
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setEditingSection(null)}
                                                    >
                                                        <X className="h-4 w-4 mr-1" />
                                                        Anuluj
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                {data?.content ? (
                                                    <div className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                                                        {data.content.slice(0, 300)}
                                                        {data.content.length > 300 && '...'}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-muted-foreground mb-3 italic">
                                                        Brak treści – użyj AI Coach lub edytuj ręcznie
                                                    </div>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => startEditing(section.key)}
                                                >
                                                    <Edit3 className="h-4 w-4 mr-1" />
                                                    Edytuj
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
