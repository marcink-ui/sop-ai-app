'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Bot,
    User,
    Target,
    Users,
    Lightbulb,
    Presentation,
    Heart,
    BarChart3,
    Shield,
    CheckSquare,
    Save,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    Edit3,
    Check,
    X,
    Loader2,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// GEM Canvas Sections definition
const CANVAS_SECTIONS = [
    { id: 1, key: 'niche_matrix', name: 'Definicja Problemu', icon: Target, color: 'from-red-500 to-rose-600' },
    { id: 2, key: 'icp', name: 'Idealny Profil Klienta (ICP)', icon: Users, color: 'from-blue-500 to-cyan-600' },
    { id: 3, key: 'personas', name: 'Persony Zakupowe', icon: Users, color: 'from-green-500 to-emerald-600' },
    { id: 4, key: 'pitch', name: 'Elevator Pitch', icon: Presentation, color: 'from-purple-500 to-violet-600' },
    { id: 5, key: 'value_prop', name: 'Propozycja Wartości', icon: Heart, color: 'from-pink-500 to-rose-600' },
    { id: 6, key: 'metrics', name: 'Metryki Sukcesu', icon: BarChart3, color: 'from-amber-500 to-orange-600' },
    { id: 7, key: 'objections', name: 'Obiekcje i Riposty', icon: Shield, color: 'from-slate-500 to-zinc-600' },
    { id: 8, key: 'features', name: 'Priorytety Funkcji', icon: CheckSquare, color: 'from-teal-500 to-cyan-600' },
] as const;

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

interface CanvasData {
    [key: string]: {
        content: string;
        completed: boolean;
        lastUpdated?: Date;
    };
}

type CanvasStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'RETURNED';

const GEM_SYSTEM_PROMPT = `Jesteś GEM (GTM Expert Model) – elitarnym architektem strategii biznesowej i konsultantem Go-To-Market.

**Twoja rola:** Prowadzisz managera przez proces tworzenia Canvas krok po kroku.

**Zasady pracy:**
1. Pracuj nad jedną sekcją na raz - nie przechodź dalej bez akceptacji
2. Zasada Złotego Konsultanta: Nigdy nie zostawiaj managera z pustą kartką - proponuj drafty
3. Weryfikuj ryzykowne tezy - proś o dane jeśli założenia są zbyt śmiałe
4. Po zakończeniu sekcji zapisz ją do Canvas

**8 Sekcji Canvas (w kolejności):**
1. Definicja Problemu (Niche Matrix) - Ból → Przyczyna → Symptom → Implikacja
2. Idealny Profil Klienta (ICP) - Firmografika, Sygnały Discovery, Wykluczenia, Triggery
3. Persony Zakupowe - Rola, Cele, Wyzwania, Real Quotes, Moment "Aha!"
4. Elevator Pitch - Kontekst → Ból → Rozwiązanie → Mierzalny Wynik
5. Propozycja Wartości - 3 Korzyści + 1 USP (usuń ból, nie dodawaj przyjemności)
6. Metryki Sukcesu - 3-5 mierzalnych KPI
7. Obiekcje i Riposty - Typowe lęki + One-liner odpowiedzi
8. Priorytety Funkcji - MUST-HAVE vs NICE-TO-HAVE

**Styl:** Ekspercki, strategiczny, zero lania wody. Język polski.

Rozpocznij od zapytania o kontekst projektu, następnie prowadź przez Sekcję 1.`;

export default function GTMCanvasPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: `🎯 **Witaj w Twórz Canvas!**

Jestem GEM – Twoim konsultantem Go-To-Market. Przeprowadzę Cię przez 8 sekcji strategii.

**Zanim zaczniemy, powiedz mi:**
- Jaki produkt/usługę rozwijasz?
- Jaka jest Twoja rola w firmie?
- Dla jakiej branży/rynku jest ten Canvas?

Zaczynamy! 🚀`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [canvasData, setCanvasData] = useState<CanvasData>({});
    const [canvasStatus, setCanvasStatus] = useState<CanvasStatus>('DRAFT');
    const [currentSection, setCurrentSection] = useState(1);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [activeTab, setActiveTab] = useState<'chat' | 'canvas'>('chat');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Calculate progress
    const completedSections = Object.values(canvasData).filter(s => s.completed).length;
    const progress = (completedSections / 8) * 100;

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
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: GEM_SYSTEM_PROMPT },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: input.trim() }
                    ],
                    model: 'gpt-4o'
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

    const updateCanvasSection = (key: string, content: string) => {
        setCanvasData(prev => ({
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
        setEditContent(canvasData[key]?.content || '');
    };

    const submitForApproval = () => {
        if (completedSections < 4) {
            toast.error('Uzupełnij przynajmniej 4 sekcje przed wysłaniem');
            return;
        }
        setCanvasStatus('PENDING_APPROVAL');
        toast.success('Canvas wysłany do Rady Transformacji!');
    };

    const saveCanvas = () => {
        localStorage.setItem('gtm-canvas-data', JSON.stringify(canvasData));
        localStorage.setItem('gtm-canvas-status', canvasStatus);
        toast.success('Canvas zapisany lokalnie');
    };

    return (
        <div className="container max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                        <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Twórz Canvas</h1>
                        <p className="text-muted-foreground">Twórz strategię z pomocą AI</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant={canvasStatus === 'APPROVED' ? 'default' : 'secondary'} className="px-3 py-1">
                        {canvasStatus === 'DRAFT' && '📝 Wersja robocza'}
                        {canvasStatus === 'PENDING_APPROVAL' && '⏳ Oczekuje na zatwierdzenie'}
                        {canvasStatus === 'APPROVED' && '✅ Zatwierdzony'}
                        {canvasStatus === 'RETURNED' && '↩️ Do poprawy'}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={saveCanvas}>
                        <Save className="h-4 w-4 mr-2" />
                        Zapisz
                    </Button>
                    {canvasStatus === 'DRAFT' && (
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
                        <span className="text-sm font-medium">Postęp Canvas</span>
                        <span className="text-sm text-muted-foreground">{completedSections}/8 sekcji</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </CardContent>
            </Card>

            {/* Main Content - Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'canvas')}>
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                    <TabsTrigger value="chat" className="gap-2">
                        <Bot className="h-4 w-4" />
                        AI Coach
                    </TabsTrigger>
                    <TabsTrigger value="canvas" className="gap-2">
                        <Target className="h-4 w-4" />
                        Canvas ({completedSections}/8)
                    </TabsTrigger>
                </TabsList>

                {/* Chat Tab */}
                <TabsContent value="chat">
                    <Card className="h-[600px] flex flex-col">
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">GEM – GTM Expert Model</CardTitle>
                                    <CardDescription>Twój konsultant strategii rynkowej</CardDescription>
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
                                                    : "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
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
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                                                <Loader2 className="h-4 w-4 text-white animate-spin" />
                                            </div>
                                            <div className="bg-muted rounded-2xl px-4 py-3">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>GEM myśli</span>
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
                                        placeholder="Opisz swój produkt lub odpowiedz na pytanie..."
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
                </TabsContent>

                {/* Canvas Tab */}
                <TabsContent value="canvas">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CANVAS_SECTIONS.map((section) => {
                            const sectionData = canvasData[section.key];
                            const isEditing = editingSection === section.key;
                            const Icon = section.icon;

                            return (
                                <Card key={section.id} className={cn(
                                    "transition-all",
                                    sectionData?.completed && "ring-2 ring-green-500/50"
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
                                                </div>
                                            </div>
                                            {sectionData?.completed ? (
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
                                                    className="min-h-[100px]"
                                                    placeholder="Wpisz treść sekcji..."
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => updateCanvasSection(section.key, editContent)}
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
                                                {sectionData?.content ? (
                                                    <div className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                                                        {sectionData.content.slice(0, 200)}
                                                        {sectionData.content.length > 200 && '...'}
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
