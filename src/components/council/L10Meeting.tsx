'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Clock,
    CheckCircle2,
    Plus,
    Trash2,
    GripVertical,
    SmilePlus,
    BarChart3,
    Mountain,
    Newspaper,
    ListTodo,
    Lightbulb,
    Flag,
    ChevronDown,
    ChevronUp,
    Timer,
    Users,
    AlertTriangle,
    Circle,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────

interface ScorecardItem {
    id: string;
    metric: string;
    owner: string;
    goal: string;
    actual: string;
    onTrack: boolean;
}

interface RockItem {
    id: string;
    title: string;
    owner: string;
    status: 'on-track' | 'off-track' | 'done';
}

interface HeadlineItem {
    id: string;
    text: string;
    type: 'good' | 'bad' | 'info';
}

interface TodoItem {
    id: string;
    text: string;
    owner: string;
    dueDate: string;
    done: boolean;
}

interface IssueItem {
    id: string;
    text: string;
    priority: 'high' | 'medium' | 'low';
    resolved: boolean;
}

// ── Section definitions ─────────────────────────────────────────────────

const L10_SECTIONS = [
    { id: 'segue', label: 'Segue', icon: SmilePlus, duration: '5 min', color: 'text-amber-500', bgColor: 'bg-amber-500/10 border-amber-500/20' },
    { id: 'scorecard', label: 'Scorecard', icon: BarChart3, duration: '5 min', color: 'text-blue-500', bgColor: 'bg-blue-500/10 border-blue-500/20' },
    { id: 'rocks', label: 'Rock Review', icon: Mountain, duration: '5 min', color: 'text-purple-500', bgColor: 'bg-purple-500/10 border-purple-500/20' },
    { id: 'headlines', label: 'Headlines', icon: Newspaper, duration: '5 min', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10 border-cyan-500/20' },
    { id: 'todo', label: 'To-Do', icon: ListTodo, duration: '5 min', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
    { id: 'ids', label: 'IDS', icon: Lightbulb, duration: '60 min', color: 'text-orange-500', bgColor: 'bg-orange-500/10 border-orange-500/20' },
    { id: 'conclude', label: 'Conclude', icon: Flag, duration: '5 min', color: 'text-pink-500', bgColor: 'bg-pink-500/10 border-pink-500/20' },
];

let nextId = 1;
const uid = () => `l10-${Date.now()}-${nextId++}`;

// ── Component ───────────────────────────────────────────────────────────

export function L10Meeting() {
    const [expandedSection, setExpandedSection] = useState<string>('segue');
    const [meetingDate] = useState(new Date().toLocaleDateString('pl-PL'));

    // Segue
    const [segueNotes, setSegueNotes] = useState('');

    // Scorecard
    const [scorecards, setScorecards] = useState<ScorecardItem[]>([
        { id: uid(), metric: 'Pipeline nowych leadów', owner: 'Marketing', goal: '50', actual: '47', onTrack: true },
        { id: uid(), metric: 'Konwersja demo→klient', owner: 'Sprzedaż', goal: '25%', actual: '18%', onTrack: false },
        { id: uid(), metric: 'NPS klientów', owner: 'Support', goal: '65', actual: '72', onTrack: true },
    ]);

    // Rocks
    const [rocks, setRocks] = useState<RockItem[]>([
        { id: uid(), title: 'Wdrożyć system CRM', owner: 'Tomek K.', status: 'on-track' },
        { id: uid(), title: 'Onboarding nowego zespołu', owner: 'Anna M.', status: 'off-track' },
        { id: uid(), title: 'Launch kampanii Q1', owner: 'Paweł Z.', status: 'done' },
    ]);

    // Headlines
    const [headlines, setHeadlines] = useState<HeadlineItem[]>([
        { id: uid(), text: 'Wygrany przetarg na projekt Enterprise', type: 'good' },
        { id: uid(), text: 'Opóźnienie w dostawie serwera', type: 'bad' },
    ]);

    // To-Do
    const [todos, setTodos] = useState<TodoItem[]>([
        { id: uid(), text: 'Przygotować prezentację Q1', owner: 'Kasia L.', dueDate: '2026-02-18', done: false },
        { id: uid(), text: 'Wysłać raport do zarządu', owner: 'Marek W.', dueDate: '2026-02-14', done: true },
    ]);

    // IDS
    const [issues, setIssues] = useState<IssueItem[]>([
        { id: uid(), text: 'Brak spójności w procesie onboardingu klienta', priority: 'high', resolved: false },
        { id: uid(), text: 'Niski response time supportu w piątki', priority: 'medium', resolved: false },
    ]);

    // Conclude
    const [rating, setRating] = useState(8);
    const [concludeNotes, setConcludeNotes] = useState('');

    const toggleSection = (id: string) => {
        setExpandedSection(expandedSection === id ? '' : id);
    };

    // ── Helpers ──
    const addScorecard = () => setScorecards([...scorecards, { id: uid(), metric: '', owner: '', goal: '', actual: '', onTrack: true }]);
    const removeScorecard = (id: string) => setScorecards(scorecards.filter(s => s.id !== id));

    const addRock = () => setRocks([...rocks, { id: uid(), title: '', owner: '', status: 'on-track' }]);
    const removeRock = (id: string) => setRocks(rocks.filter(r => r.id !== id));

    const addHeadline = (type: 'good' | 'bad' | 'info') => setHeadlines([...headlines, { id: uid(), text: '', type }]);
    const removeHeadline = (id: string) => setHeadlines(headlines.filter(h => h.id !== id));

    const addTodo = () => setTodos([...todos, { id: uid(), text: '', owner: '', dueDate: '', done: false }]);
    const removeTodo = (id: string) => setTodos(todos.filter(t => t.id !== id));

    const addIssue = () => setIssues([...issues, { id: uid(), text: '', priority: 'medium', resolved: false }]);
    const removeIssue = (id: string) => setIssues(issues.filter(i => i.id !== id));

    const rockStatusStyles = {
        'on-track': 'bg-green-500/20 text-green-600 dark:text-green-400',
        'off-track': 'bg-red-500/20 text-red-600 dark:text-red-400',
        'done': 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    };

    const headlineTypeStyles = {
        good: { label: 'Dobre', color: 'text-green-500', bg: 'bg-green-500/10' },
        bad: { label: 'Problem', color: 'text-red-500', bg: 'bg-red-500/10' },
        info: { label: 'Info', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    };

    return (
        <div className="space-y-4">
            {/* Meeting Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                        <Timer className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Level 10 Meeting</h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" /> {meetingDate} · 90 min · EOS Traction
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" /> Leadership Team
                    </Badge>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-1">
                {L10_SECTIONS.map((section) => {
                    const isActive = expandedSection === section.id;
                    const sectionIndex = L10_SECTIONS.findIndex(s => s.id === section.id);
                    const activeIndex = L10_SECTIONS.findIndex(s => s.id === expandedSection);
                    const isPast = expandedSection ? sectionIndex < activeIndex : false;
                    return (
                        <button
                            key={section.id}
                            onClick={() => toggleSection(section.id)}
                            className={`flex-1 h-2 rounded-full transition-all ${isActive ? 'bg-violet-500' : isPast ? 'bg-violet-500/40' : 'bg-muted-foreground/20'
                                }`}
                            title={section.label}
                        />
                    );
                })}
            </div>

            {/* Sections */}
            {L10_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isExpanded = expandedSection === section.id;
                return (
                    <Card key={section.id} className={`border ${isExpanded ? section.bgColor : 'border-border'} transition-colors`}>
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full flex items-center justify-between p-4 text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center justify-center h-8 w-8 rounded-lg ${isExpanded ? section.bgColor : 'bg-muted/50'}`}>
                                    <Icon className={`h-4 w-4 ${section.color}`} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">{section.label}</h3>
                                    <p className="text-[10px] text-muted-foreground">{section.duration}</p>
                                </div>
                            </div>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </button>

                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <CardContent className="pt-0 pb-4 px-4">
                                        {/* ── SEGUE ── */}
                                        {section.id === 'segue' && (
                                            <div className="space-y-3">
                                                <p className="text-sm text-muted-foreground">
                                                    Pozytywne wieści — osobiste lub biznesowe. Budowanie relacji.
                                                </p>
                                                <textarea
                                                    value={segueNotes}
                                                    onChange={(e) => setSegueNotes(e.target.value)}
                                                    placeholder="Notatki z segue... Co dobrego się wydarzyło?"
                                                    className="w-full min-h-[80px] p-3 rounded-lg border border-border bg-background text-sm resize-y focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 outline-none"
                                                />
                                            </div>
                                        )}

                                        {/* ── SCORECARD ── */}
                                        {section.id === 'scorecard' && (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-[1fr_100px_80px_80px_60px_40px] gap-2 text-xs font-medium text-muted-foreground uppercase px-1">
                                                    <span>Metryka</span>
                                                    <span>Właściciel</span>
                                                    <span>Cel</span>
                                                    <span>Aktualny</span>
                                                    <span>Status</span>
                                                    <span></span>
                                                </div>
                                                {scorecards.map((sc) => (
                                                    <div key={sc.id} className="grid grid-cols-[1fr_100px_80px_80px_60px_40px] gap-2 items-center">
                                                        <Input
                                                            value={sc.metric}
                                                            onChange={(e) => setScorecards(scorecards.map(s => s.id === sc.id ? { ...s, metric: e.target.value } : s))}
                                                            className="h-8 text-sm"
                                                            placeholder="Metryka..."
                                                        />
                                                        <Input
                                                            value={sc.owner}
                                                            onChange={(e) => setScorecards(scorecards.map(s => s.id === sc.id ? { ...s, owner: e.target.value } : s))}
                                                            className="h-8 text-sm"
                                                            placeholder="Kto?"
                                                        />
                                                        <Input
                                                            value={sc.goal}
                                                            onChange={(e) => setScorecards(scorecards.map(s => s.id === sc.id ? { ...s, goal: e.target.value } : s))}
                                                            className="h-8 text-sm"
                                                            placeholder="Cel"
                                                        />
                                                        <Input
                                                            value={sc.actual}
                                                            onChange={(e) => setScorecards(scorecards.map(s => s.id === sc.id ? { ...s, actual: e.target.value } : s))}
                                                            className="h-8 text-sm"
                                                            placeholder="Aktu."
                                                        />
                                                        <button
                                                            onClick={() => setScorecards(scorecards.map(s => s.id === sc.id ? { ...s, onTrack: !s.onTrack } : s))}
                                                            className={`h-8 rounded-md text-xs font-medium ${sc.onTrack ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}
                                                        >
                                                            {sc.onTrack ? '✓' : '✗'}
                                                        </button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeScorecard(sc.id)}>
                                                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button variant="outline" size="sm" className="gap-1" onClick={addScorecard}>
                                                    <Plus className="h-3.5 w-3.5" /> Dodaj metrykę
                                                </Button>
                                            </div>
                                        )}

                                        {/* ── ROCKS ── */}
                                        {section.id === 'rocks' && (
                                            <div className="space-y-3">
                                                {rocks.map((rock) => (
                                                    <div key={rock.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                                                        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
                                                        <Input
                                                            value={rock.title}
                                                            onChange={(e) => setRocks(rocks.map(r => r.id === rock.id ? { ...r, title: e.target.value } : r))}
                                                            className="h-8 text-sm flex-1"
                                                            placeholder="Nazwa rock..."
                                                        />
                                                        <Input
                                                            value={rock.owner}
                                                            onChange={(e) => setRocks(rocks.map(r => r.id === rock.id ? { ...r, owner: e.target.value } : r))}
                                                            className="h-8 text-sm w-28"
                                                            placeholder="Właściciel"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const next = rock.status === 'on-track' ? 'off-track' : rock.status === 'off-track' ? 'done' : 'on-track';
                                                                setRocks(rocks.map(r => r.id === rock.id ? { ...r, status: next } : r));
                                                            }}
                                                            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${rockStatusStyles[rock.status]}`}
                                                        >
                                                            {rock.status === 'on-track' ? 'Na torze' : rock.status === 'off-track' ? 'Opóźniony' : 'Gotowy'}
                                                        </button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeRock(rock.id)}>
                                                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button variant="outline" size="sm" className="gap-1" onClick={addRock}>
                                                    <Plus className="h-3.5 w-3.5" /> Dodaj rock
                                                </Button>
                                            </div>
                                        )}

                                        {/* ── HEADLINES ── */}
                                        {section.id === 'headlines' && (
                                            <div className="space-y-3">
                                                {headlines.map((hl) => (
                                                    <div key={hl.id} className={`flex items-center gap-3 p-3 rounded-lg ${headlineTypeStyles[hl.type].bg}`}>
                                                        <Badge className={`text-xs shrink-0 ${headlineTypeStyles[hl.type].color}`}>
                                                            {headlineTypeStyles[hl.type].label}
                                                        </Badge>
                                                        <Input
                                                            value={hl.text}
                                                            onChange={(e) => setHeadlines(headlines.map(h => h.id === hl.id ? { ...h, text: e.target.value } : h))}
                                                            className="h-8 text-sm flex-1 bg-background"
                                                            placeholder="Headline..."
                                                        />
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeHeadline(hl.id)}>
                                                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" className="gap-1 text-green-600" onClick={() => addHeadline('good')}>
                                                        <Plus className="h-3.5 w-3.5" /> Dobre
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="gap-1 text-red-600" onClick={() => addHeadline('bad')}>
                                                        <Plus className="h-3.5 w-3.5" /> Problem
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="gap-1 text-blue-600" onClick={() => addHeadline('info')}>
                                                        <Plus className="h-3.5 w-3.5" /> Info
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── TO-DO ── */}
                                        {section.id === 'todo' && (
                                            <div className="space-y-3">
                                                {todos.map((todo) => (
                                                    <div key={todo.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                                                        <button
                                                            onClick={() => setTodos(todos.map(t => t.id === todo.id ? { ...t, done: !t.done } : t))}
                                                            className="shrink-0"
                                                        >
                                                            {todo.done
                                                                ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                                : <Circle className="h-5 w-5 text-muted-foreground" />
                                                            }
                                                        </button>
                                                        <Input
                                                            value={todo.text}
                                                            onChange={(e) => setTodos(todos.map(t => t.id === todo.id ? { ...t, text: e.target.value } : t))}
                                                            className={`h-8 text-sm flex-1 ${todo.done ? 'line-through text-muted-foreground' : ''}`}
                                                            placeholder="Zadanie..."
                                                        />
                                                        <Input
                                                            value={todo.owner}
                                                            onChange={(e) => setTodos(todos.map(t => t.id === todo.id ? { ...t, owner: e.target.value } : t))}
                                                            className="h-8 text-sm w-28"
                                                            placeholder="Kto?"
                                                        />
                                                        <Input
                                                            type="date"
                                                            value={todo.dueDate}
                                                            onChange={(e) => setTodos(todos.map(t => t.id === todo.id ? { ...t, dueDate: e.target.value } : t))}
                                                            className="h-8 text-sm w-36"
                                                        />
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeTodo(todo.id)}>
                                                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button variant="outline" size="sm" className="gap-1" onClick={addTodo}>
                                                    <Plus className="h-3.5 w-3.5" /> Dodaj zadanie
                                                </Button>
                                            </div>
                                        )}

                                        {/* ── IDS ── */}
                                        {section.id === 'ids' && (
                                            <div className="space-y-3">
                                                <p className="text-sm text-muted-foreground">
                                                    <strong>Identify</strong> → <strong>Discuss</strong> → <strong>Solve</strong>. Skup się na 1 problemie naraz.
                                                </p>
                                                {issues.map((issue) => (
                                                    <div key={issue.id} className={`flex items-center gap-3 p-3 rounded-lg border ${issue.resolved ? 'border-green-500/30 bg-green-500/5' : 'border-border bg-background'}`}>
                                                        <button
                                                            onClick={() => setIssues(issues.map(i => i.id === issue.id ? { ...i, resolved: !i.resolved } : i))}
                                                            className="shrink-0"
                                                        >
                                                            {issue.resolved
                                                                ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                                : <AlertTriangle className={`h-5 w-5 ${issue.priority === 'high' ? 'text-red-500' : issue.priority === 'medium' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                                                            }
                                                        </button>
                                                        <Input
                                                            value={issue.text}
                                                            onChange={(e) => setIssues(issues.map(i => i.id === issue.id ? { ...i, text: e.target.value } : i))}
                                                            className={`h-8 text-sm flex-1 ${issue.resolved ? 'line-through text-muted-foreground' : ''}`}
                                                            placeholder="Problem do rozwiązania..."
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const next = issue.priority === 'high' ? 'medium' : issue.priority === 'medium' ? 'low' : 'high';
                                                                setIssues(issues.map(i => i.id === issue.id ? { ...i, priority: next } : i));
                                                            }}
                                                            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${issue.priority === 'high' ? 'bg-red-500/20 text-red-600' :
                                                                    issue.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-600' :
                                                                        'bg-gray-500/20 text-gray-600'
                                                                }`}
                                                        >
                                                            {issue.priority === 'high' ? 'Wysoki' : issue.priority === 'medium' ? 'Średni' : 'Niski'}
                                                        </button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeIssue(issue.id)}>
                                                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button variant="outline" size="sm" className="gap-1" onClick={addIssue}>
                                                    <Plus className="h-3.5 w-3.5" /> Dodaj problem
                                                </Button>
                                            </div>
                                        )}

                                        {/* ── CONCLUDE ── */}
                                        {section.id === 'conclude' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm font-medium mb-2">Ocena spotkania (1-10)</p>
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                                                            <button
                                                                key={n}
                                                                onClick={() => setRating(n)}
                                                                className={`h-9 w-9 rounded-lg text-sm font-bold transition-all ${n <= rating
                                                                        ? n <= 3 ? 'bg-red-500/20 text-red-600'
                                                                            : n <= 6 ? 'bg-yellow-500/20 text-yellow-600'
                                                                                : 'bg-green-500/20 text-green-600'
                                                                        : 'bg-muted/30 text-muted-foreground'
                                                                    }`}
                                                            >
                                                                {n}
                                                            </button>
                                                        ))}
                                                        <span className="ml-3 text-2xl font-bold">{rating}/10</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium mb-2">Podsumowanie i cascading messages</p>
                                                    <textarea
                                                        value={concludeNotes}
                                                        onChange={(e) => setConcludeNotes(e.target.value)}
                                                        placeholder="Kluczowe decyzje, wiadomości do przekazania zespołowi..."
                                                        className="w-full min-h-[80px] p-3 rounded-lg border border-border bg-background text-sm resize-y focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                );
            })}
        </div>
    );
}
