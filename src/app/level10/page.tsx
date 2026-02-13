'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, CheckCircle2, Circle, Clock, AlertTriangle,
    Plus, Trash2, Bot, ChevronDown, ChevronRight,
    MessageSquare, Users, BarChart3, Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Issue {
    id: string;
    title: string;
    owner: string;
    status: 'open' | 'resolved' | 'escalated';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
}

interface Todo {
    id: string;
    title: string;
    owner: string;
    dueDate: string;
    completed: boolean;
}

interface Rock {
    id: string;
    title: string;
    owner: string;
    progress: number;
    onTrack: boolean;
}

interface MeetingSection {
    name: string;
    duration: string;
    icon: React.ReactNode;
    expanded: boolean;
}

export default function Level10Page() {
    const [issues, setIssues] = useState<Issue[]>([
        { id: '1', title: 'Brak dokumentacji procesu zamówień', owner: 'Anna K.', status: 'open', priority: 'high', createdAt: '2025-02-10' },
        { id: '2', title: 'Opóźnienia w dostawach materiałów', owner: 'Jan M.', status: 'open', priority: 'medium', createdAt: '2025-02-08' },
        { id: '3', title: 'Nieaktualne SOPy w dziale HR', owner: 'Maria N.', status: 'escalated', priority: 'high', createdAt: '2025-02-05' },
    ]);

    const [todos, setTodos] = useState<Todo[]>([
        { id: '1', title: 'Zaktualizować SOP-001 Onboarding', owner: 'Anna K.', dueDate: '2025-02-15', completed: false },
        { id: '2', title: 'Przygotować raport MUDA Q1', owner: 'Jan M.', dueDate: '2025-02-20', completed: false },
        { id: '3', title: 'Wdrożyć automatyzację faktur', owner: 'Tomek R.', dueDate: '2025-02-12', completed: true },
    ]);

    const [rocks, setRocks] = useState<Rock[]>([
        { id: '1', title: 'Cyfryzacja procesu zamówień', owner: 'Anna K.', progress: 65, onTrack: true },
        { id: '2', title: 'Budowa bazy wiedzy SOP', owner: 'Jan M.', progress: 40, onTrack: false },
        { id: '3', title: 'Wdrożenie AI w obsłudze klienta', owner: 'Maria N.', progress: 85, onTrack: true },
    ]);

    const [newTodo, setNewTodo] = useState('');
    const [newIssue, setNewIssue] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    const handleAIAutoFill = useCallback(async () => {
        setAiLoading(true);
        try {
            const res = await fetch('/api/level10/auto-fill', { method: 'POST' });
            if (!res.ok) throw new Error('AI request failed');
            const data = await res.json();

            if (data.scorecard) {
                // Scorecard is rendered inline, we just expand the section
                setExpandedSections(prev => ({ ...prev, scorecard: true }));
            }
            if (data.rocks?.length) {
                setRocks(data.rocks.map((r: { title: string; owner: string; progress: number; onTrack: boolean }, i: number) => ({
                    id: `ai-r-${i}`,
                    title: r.title,
                    owner: r.owner || 'AI',
                    progress: r.progress || 0,
                    onTrack: r.onTrack ?? true,
                })));
                setExpandedSections(prev => ({ ...prev, rocks: true }));
            }
            if (data.issues?.length) {
                setIssues(data.issues.map((issue: { title: string; owner: string; priority: string }, i: number) => ({
                    id: `ai-i-${i}`,
                    title: issue.title,
                    owner: issue.owner || 'AI',
                    status: 'open' as const,
                    priority: (issue.priority || 'medium') as Issue['priority'],
                    createdAt: new Date().toISOString().slice(0, 10),
                })));
                setExpandedSections(prev => ({ ...prev, issues: true }));
            }
            if (data.todos?.length) {
                setTodos(data.todos.map((t: { title: string; owner: string; dueDate: string }, i: number) => ({
                    id: `ai-t-${i}`,
                    title: t.title,
                    owner: t.owner || 'AI',
                    dueDate: t.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
                    completed: false,
                })));
                setExpandedSections(prev => ({ ...prev, todos: true }));
            }
            toast.success('Agenda wygenerowana przez AI');
        } catch (err) {
            console.error('[Level10 AI]', err);
            toast.error('Nie udało się wygenerować agendy AI');
        } finally {
            setAiLoading(false);
        }
    }, []);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        segue: false,
        scorecard: true,
        rocks: true,
        headlines: false,
        todos: true,
        issues: true,
        conclude: false,
    });

    const toggleSection = (key: string) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const addTodo = () => {
        if (!newTodo.trim()) return;
        setTodos(prev => [...prev, {
            id: `t-${Date.now()}`,
            title: newTodo,
            owner: 'Ja',
            dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
            completed: false,
        }]);
        setNewTodo('');
    };

    const toggleTodo = (id: string) => {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const priorityColors = {
        high: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
        medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
        low: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    };

    const statusColors = {
        open: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
        resolved: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
        escalated: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    };

    const sections = [
        { key: 'segue', name: 'Segue (Dobre wieści)', duration: '5 min', icon: <MessageSquare className="h-4 w-4" /> },
        { key: 'scorecard', name: 'Scorecard (Wyniki)', duration: '5 min', icon: <BarChart3 className="h-4 w-4" /> },
        { key: 'rocks', name: 'Rocks (Cele kwartalne)', duration: '5 min', icon: <Target className="h-4 w-4" /> },
        { key: 'headlines', name: 'Headlines (Ważne informacje)', duration: '5 min', icon: <MessageSquare className="h-4 w-4" /> },
        { key: 'todos', name: 'To-Do (Zadania)', duration: '5 min', icon: <CheckCircle2 className="h-4 w-4" /> },
        { key: 'issues', name: 'IDS (Issues)', duration: '60 min', icon: <AlertTriangle className="h-4 w-4" /> },
        { key: 'conclude', name: 'Podsumowanie', duration: '5 min', icon: <Calendar className="h-4 w-4" /> },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Target className="h-6 w-6 text-amber-500" />
                        Spotkanie Statusowe (Level 10)
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Strukturyzowane 90-minutowe spotkanie zespołu
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        90 min
                    </Badge>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={handleAIAutoFill}
                        disabled={aiLoading}
                    >
                        <Bot className={`h-4 w-4 ${aiLoading ? 'animate-spin' : ''}`} />
                        {aiLoading ? 'Generuję...' : 'AI auto-fill'}
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 p-6">
                <div className="max-w-4xl mx-auto space-y-3">
                    {sections.map(section => (
                        <Card key={section.key} className="overflow-hidden">
                            <button
                                onClick={() => toggleSection(section.key)}
                                className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                        {section.icon}
                                    </div>
                                    <span className="font-semibold">{section.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">{section.duration}</Badge>
                                    {expandedSections[section.key] ? (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </div>
                            </button>

                            <AnimatePresence>
                                {expandedSections[section.key] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <Separator />
                                        <div className="p-4">
                                            {/* Rocks Section */}
                                            {section.key === 'rocks' && (
                                                <div className="space-y-3">
                                                    {rocks.map(r => (
                                                        <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                                                            <div className={`h-3 w-3 rounded-full ${r.onTrack ? 'bg-green-500' : 'bg-red-500'}`} />
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-medium text-sm">{r.title}</span>
                                                                    <span className="text-xs text-muted-foreground">{r.owner}</span>
                                                                </div>
                                                                <div className="mt-1 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700">
                                                                    <div
                                                                        className={`h-full rounded-full ${r.onTrack ? 'bg-green-500' : 'bg-red-500'}`}
                                                                        style={{ width: `${r.progress}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs text-muted-foreground">{r.progress}%</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Todos Section */}
                                            {section.key === 'todos' && (
                                                <div className="space-y-3">
                                                    {todos.map(t => (
                                                        <div key={t.id} className="flex items-center gap-3 p-2">
                                                            <button onClick={() => toggleTodo(t.id)}>
                                                                {t.completed ? (
                                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                                ) : (
                                                                    <Circle className="h-5 w-5 text-muted-foreground" />
                                                                )}
                                                            </button>
                                                            <span className={`flex-1 text-sm ${t.completed ? 'line-through text-muted-foreground' : ''}`}>
                                                                {t.title}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">{t.owner}</span>
                                                            <Badge variant="outline" className="text-[10px]">{t.dueDate}</Badge>
                                                        </div>
                                                    ))}
                                                    <div className="flex gap-2 mt-2">
                                                        <Input
                                                            placeholder="Dodaj zadanie..."
                                                            value={newTodo}
                                                            onChange={e => setNewTodo(e.target.value)}
                                                            onKeyDown={e => e.key === 'Enter' && addTodo()}
                                                            className="text-sm"
                                                        />
                                                        <Button size="sm" onClick={addTodo}>
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Issues Section */}
                                            {section.key === 'issues' && (
                                                <div className="space-y-3">
                                                    <p className="text-xs text-muted-foreground mb-2">
                                                        <strong>IDS:</strong> Identify → Discuss → Solve
                                                    </p>
                                                    {issues.map(i => (
                                                        <div key={i.id} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                                                            <AlertTriangle className={`h-4 w-4 mt-0.5 ${i.priority === 'high' ? 'text-red-500' : i.priority === 'medium' ? 'text-amber-500' : 'text-green-500'}`} />
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-medium text-sm">{i.title}</span>
                                                                    <div className="flex gap-1">
                                                                        <Badge className={`text-[10px] ${priorityColors[i.priority]}`}>{i.priority}</Badge>
                                                                        <Badge className={`text-[10px] ${statusColors[i.status]}`}>{i.status}</Badge>
                                                                    </div>
                                                                </div>
                                                                <span className="text-xs text-muted-foreground">Właściciel: {i.owner} · {i.createdAt}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Scorecard Section */}
                                            {section.key === 'scorecard' && (
                                                <div className="text-sm text-muted-foreground space-y-2">
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-500/10 text-center">
                                                            <p className="text-2xl font-bold text-green-600">92%</p>
                                                            <p className="text-xs text-muted-foreground">SOP pokrycie</p>
                                                        </div>
                                                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-center">
                                                            <p className="text-2xl font-bold text-amber-600">78%</p>
                                                            <p className="text-xs text-muted-foreground">Automatyzacja</p>
                                                        </div>
                                                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-center">
                                                            <p className="text-2xl font-bold text-blue-600">4.2</p>
                                                            <p className="text-xs text-muted-foreground">Średnia ocena</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs italic mt-2">
                                                        💡 AI auto-fill: W przyszłości metryki będą zaciągane automatycznie z danych systemowych
                                                    </p>
                                                </div>
                                            )}

                                            {/* Generic sections */}
                                            {(section.key === 'segue' || section.key === 'headlines' || section.key === 'conclude') && (
                                                <div className="space-y-2">
                                                    <Textarea
                                                        placeholder={
                                                            section.key === 'segue' ? 'Jakie dobre wieści mamy na ten tydzień?' :
                                                                section.key === 'headlines' ? 'Ważne informacje do przekazania zespołowi...' :
                                                                    'Podsumowanie spotkania, feedback, kolejne kroki...'
                                                        }
                                                        className="min-h-[100px] text-sm"
                                                    />
                                                    <p className="text-xs text-muted-foreground italic">
                                                        💡 AI może pomóc w podsumowaniu tej sekcji
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
