'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileCode2,
    Save,
    Play,
    RefreshCw,
    History,
    Copy,
    Check,
    ChevronLeft,
    Bot,
    MessageSquare,
    Briefcase,
    Lightbulb,
    BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { toast } from 'sonner';

// System prompts - in production these would come from database
const systemPrompts = [
    {
        id: 'sop-consultant',
        name: 'SOP Consultant',
        description: 'Asystent do tworzenia i analizy procedur',
        icon: BookOpen,
        color: 'text-blue-500',
        prompt: `Jesteś ekspertem ds. procedur operacyjnych (SOP) w firmie.

Twoje zadania:
1. Pomagaj tworzyć nowe SOP na podstawie opisu procesu
2. Analizuj istniejące SOP pod kątem kompletności
3. Proponuj ulepszenia i automatyzacje
4. Wskazuj powiązania z innymi procedurami

Zawsze odpowiadaj w języku polskim.
Używaj struktury: cel → kroki → odpowiedzialność → metryki.`,
    },
    {
        id: 'value-chain-advisor',
        name: 'Value Chain Advisor',
        description: 'Analiza łańcucha wartości i procesów',
        icon: Briefcase,
        color: 'text-emerald-500',
        prompt: `Jesteś analitykiem procesów biznesowych specjalizującym się w mapowaniu łańcucha wartości.

Twoje kompetencje:
1. Identyfikacja marnotrawstwa (MUDA)
2. Analiza przepływu wartości (Value Stream)
3. Propozycje automatyzacji z wykorzystaniem AI
4. Obliczanie ROI dla usprawnień

Bazuj na metodologii Lean i Six Sigma.`,
    },
    {
        id: 'innovation-coach',
        name: 'Innovation Coach',
        description: 'Wspieranie innowacji i pomysłów',
        icon: Lightbulb,
        color: 'text-amber-500',
        prompt: `Jesteś coachem innowacji wspierającym zespół w generowaniu pomysłów.

Twój styl:
1. Zadawaj pytania prowokujące myślenie
2. Stosuj techniki kreatywnego myślenia (SCAMPER, 6 kapeluszy)
3. Pomagaj priorytetyzować pomysły
4. Łącz koncepcje z możliwościami AI

Bądź entuzjastyczny, ale realistyczny.`,
    },
    {
        id: 'chat-general',
        name: 'General Assistant',
        description: 'Ogólny asystent czatu',
        icon: MessageSquare,
        color: 'text-violet-500',
        prompt: `Jesteś pomocnym asystentem AI w systemie VantageOS.

Zasady:
1. Odpowiadaj zwięźle i na temat
2. Jeśli nie znasz odpowiedzi, przyznaj to
3. Proponuj powiązane funkcje systemu
4. Używaj polskiego języka

Kontekst: VantageOS to system transformacji cyfrowej oparty na metodologii Manifest 3.3.`,
    },
];

export default function PromptsPage() {
    const [selectedPrompt, setSelectedPrompt] = useState(systemPrompts[0]);
    const [editedPrompt, setEditedPrompt] = useState(selectedPrompt.prompt);
    const [testInput, setTestInput] = useState('');
    const [testOutput, setTestOutput] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    const handlePromptSelect = (promptId: string) => {
        const prompt = systemPrompts.find(p => p.id === promptId);
        if (prompt) {
            setSelectedPrompt(prompt);
            setEditedPrompt(prompt.prompt);
            setTestOutput('');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        // In production, this would save to database
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Prompt zapisany pomyślnie');
        setIsSaving(false);
    };

    const handleTest = async () => {
        if (!testInput.trim()) {
            toast.error('Wprowadź testowe zapytanie');
            return;
        }

        setIsTesting(true);
        setTestOutput('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: testInput,
                    context: { testMode: true },
                    systemPromptOverride: editedPrompt,
                }),
            });

            if (response.ok) {
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                let result = '';

                while (reader) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    result += decoder.decode(value);
                    setTestOutput(result);
                }
            } else {
                throw new Error('API error');
            }
        } catch (error) {
            setTestOutput('Błąd podczas testowania promptu. Sprawdź konfigurację API.');
        }

        setIsTesting(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(editedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/backoffice">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <FileCode2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">System Prompts</h1>
                        <p className="text-sm text-muted-foreground">
                            Edytuj i testuj prompty systemowe AI
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Prompt List */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Prompty</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {systemPrompts.map((prompt) => (
                            <motion.button
                                key={prompt.id}
                                onClick={() => handlePromptSelect(prompt.id)}
                                className={`w-full p-3 rounded-lg text-left transition-all ${selectedPrompt.id === prompt.id
                                        ? 'bg-primary/10 border border-primary/50'
                                        : 'bg-muted/50 hover:bg-muted'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center gap-3">
                                    <prompt.icon className={`h-5 w-5 ${prompt.color}`} />
                                    <div>
                                        <div className="font-medium text-sm">{prompt.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {prompt.description}
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </CardContent>
                </Card>

                {/* Editor */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <selectedPrompt.icon className={`h-6 w-6 ${selectedPrompt.color}`} />
                                <div>
                                    <CardTitle>{selectedPrompt.name}</CardTitle>
                                    <CardDescription>{selectedPrompt.description}</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handleCopy}>
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button variant="outline" size="sm">
                                    <History className="h-4 w-4 mr-2" />
                                    Historia
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Zapisz
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="edit">
                            <TabsList className="mb-4">
                                <TabsTrigger value="edit">Edycja</TabsTrigger>
                                <TabsTrigger value="test">Test</TabsTrigger>
                            </TabsList>

                            <TabsContent value="edit" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Prompt systemowy</Label>
                                    <Textarea
                                        value={editedPrompt}
                                        onChange={(e) => setEditedPrompt(e.target.value)}
                                        className="min-h-[400px] font-mono text-sm"
                                        placeholder="Wprowadź prompt systemowy..."
                                    />
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>{editedPrompt.length} znaków</span>
                                    <span>~{Math.ceil(editedPrompt.length / 4)} tokenów</span>
                                </div>
                            </TabsContent>

                            <TabsContent value="test" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Testowe zapytanie</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={testInput}
                                            onChange={(e) => setTestInput(e.target.value)}
                                            placeholder="Wpisz zapytanie do przetestowania..."
                                            onKeyDown={(e) => e.key === 'Enter' && handleTest()}
                                        />
                                        <Button onClick={handleTest} disabled={isTesting}>
                                            {isTesting ? (
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Play className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {testOutput && (
                                    <div className="space-y-2">
                                        <Label>Odpowiedź AI</Label>
                                        <div className="p-4 rounded-lg bg-muted/50 min-h-[200px] whitespace-pre-wrap text-sm">
                                            {testOutput}
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
