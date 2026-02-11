'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Plus,
    Calendar,
    User,
    AlertCircle,
    ChevronRight,
    Clock,
    Tag,
    FileText,
    Bot,
    Loader2,
    GripVertical,
    Filter,
    Search,
    X,
    ExternalLink,
    Sparkles,
    MessageSquare,
    ArrowUpDown,
    Users,
    Link2,
    PenSquare,
    RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/lib/auth-client';
import { toast } from 'sonner';

// Status columns for Kanban
const STATUSES = [
    { key: 'PENDING', label: 'Do zrobienia', color: 'bg-slate-500' },
    { key: 'VOTING', label: 'W głosowaniu', color: 'bg-amber-500' },
    { key: 'APPROVED', label: 'Zatwierdzone', color: 'bg-emerald-500' },
    { key: 'IMPLEMENTED', label: 'Wdrożone', color: 'bg-blue-500' },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
    NEW_SOP: <FileText className="h-3 w-3" />,
    SOP_CHANGE: <FileText className="h-3 w-3" />,
    NEW_AGENT: <Bot className="h-3 w-3" />,
    PROCESS_CHANGE: <ChevronRight className="h-3 w-3" />,
    BUDGET_REQUEST: <AlertCircle className="h-3 w-3" />,
    OTHER: <Tag className="h-3 w-3" />,
};

const TYPE_LABELS: Record<string, string> = {
    NEW_SOP: 'Nowy SOP',
    SOP_CHANGE: 'Zmiana SOP',
    NEW_AGENT: 'Nowy Agent',
    PROCESS_CHANGE: 'Zmiana procesu',
    BUDGET_REQUEST: 'Budżet',
    OTHER: 'Inne',
};

const PRIORITY_COLORS: Record<string, string> = {
    CRITICAL: 'bg-red-500',
    HIGH: 'bg-orange-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-green-500',
};

const PRIORITY_LABELS: Record<string, string> = {
    CRITICAL: 'Krytyczny',
    HIGH: 'Wysoki',
    MEDIUM: 'Średni',
    LOW: 'Niski',
};

const MODULES = ['SOPs', 'Agents', 'Processes', 'Infrastructure', 'Training', 'Value Chain', 'Roles'];

// Related links for task types
function getRelatedLinks(task: Task) {
    const links: { label: string; href: string; icon: React.ReactNode }[] = [];

    // Always link to knowledge graph
    links.push({ label: 'Graf wiedzy', href: '/knowledge-graph', icon: <Link2 className="h-3 w-3" /> });

    if (task.type === 'NEW_SOP' || task.type === 'SOP_CHANGE') {
        links.push({ label: 'Procesy SOP', href: '/sops', icon: <FileText className="h-3 w-3" /> });
    }
    if (task.type === 'NEW_AGENT') {
        links.push({ label: 'Agenci', href: '/agents', icon: <Bot className="h-3 w-3" /> });
    }
    if (task.module === 'Value Chain' || task.type === 'PROCESS_CHANGE') {
        links.push({ label: 'Value Chain', href: '/value-chain', icon: <ChevronRight className="h-3 w-3" /> });
    }

    links.push({ label: 'AI Canvas', href: '/canvas', icon: <Sparkles className="h-3 w-3" /> });
    links.push({ label: 'Zarządzanie', href: '/roles', icon: <Users className="h-3 w-3" /> });

    return links;
}

interface Task {
    id: string;
    title: string;
    description?: string;
    type: string;
    status: string;
    priority: string;
    module?: string;
    labels: string[];
    dueDate?: string;
    assignee?: { id: string; name: string; email: string; image?: string };
    createdBy: { id: string; name: string; email: string };
    createdAt: string;
}

export function TaskBoard() {
    const { data: session } = useSession();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [moduleFilter, setModuleFilter] = useState<string>('all');
    const [userFilter, setUserFilter] = useState<string>('mine');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('newest');
    const [draggingTask, setDraggingTask] = useState<Task | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [aiQuestions, setAiQuestions] = useState<string>('');
    const [generatingQuestions, setGeneratingQuestions] = useState(false);
    const [showPromptEditor, setShowPromptEditor] = useState(false);
    const [customPrompt, setCustomPrompt] = useState<string>('');

    const currentUserEmail = session?.user?.email || '';

    // Fetch tasks
    useEffect(() => {
        fetchTasks();
    }, [moduleFilter]);

    const fetchTasks = async () => {
        try {
            let url = '/api/tasks?limit=100';
            if (moduleFilter && moduleFilter !== 'all') {
                url += `&module=${moduleFilter}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            setTasks(data.tasks || []);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    // Drag and drop handlers
    const handleDragStart = (task: Task) => {
        setDraggingTask(task);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (status: string) => {
        if (!draggingTask || draggingTask.status === status) {
            setDraggingTask(null);
            return;
        }

        setTasks(prev => prev.map(t =>
            t.id === draggingTask.id ? { ...t, status } : t
        ));

        try {
            await fetch('/api/tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: draggingTask.id, status }),
            });
        } catch (error) {
            console.error('Failed to update task:', error);
            fetchTasks();
        }

        setDraggingTask(null);
    };

    // Create task
    const createTask = async (formData: FormData) => {
        const newTask = {
            title: formData.get('title'),
            description: formData.get('description'),
            type: formData.get('type'),
            priority: formData.get('priority'),
            module: formData.get('module'),
            dueDate: formData.get('dueDate') || null,
        };

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask),
            });
            const task = await res.json();
            setTasks(prev => [task, ...prev]);
            setIsCreateOpen(false);
            toast.success('Zadanie utworzone');
        } catch (error) {
            console.error('Failed to create task:', error);
            toast.error('Błąd tworzenia zadania');
        }
    };

    // Build default prompt for AI question generation
    const getDefaultPrompt = (task: Task) => {
        return `Generuję listę pytań pomocniczych dla zadania "${task.title}" (typ: ${TYPE_LABELS[task.type] || task.type}). 
Opis: ${task.description || 'Brak opisu'}
Moduł: ${task.module || 'Ogólne'}

Wygeneruj 5-7 konkretnych pytań, które pomogą osobie odpowiedzialnej za to zadanie zebrać potrzebne informacje. 
Pytania powinny być praktyczne i ukierunkowane na realizację. Odpowiedź podaj jako ponumerowaną listę.`;
    };

    // Generate AI questions for task delegation
    const generateAIQuestions = async (task: Task) => {
        setGeneratingQuestions(true);
        const promptToUse = customPrompt || getDefaultPrompt(task);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: promptToUse,
                    }],
                }),
            });
            const data = await res.json();
            setAiQuestions(data.content || data.message || 'AI nie wygenerował pytań. Spróbuj ponownie.');
        } catch {
            setAiQuestions('Nie udało się wygenerować pytań. Chat AI może być niedostępny.');
        } finally {
            setGeneratingQuestions(false);
        }
    };

    // Filter and sort tasks
    const filteredTasks = tasks
        .filter(task => {
            // Text search
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase());

            // User filter
            const matchesUser =
                userFilter === 'all' ? true :
                    userFilter === 'mine' ? (
                        task.assignee?.email === currentUserEmail ||
                        task.createdBy?.email === currentUserEmail
                    ) :
                        task.assignee?.email === userFilter;

            // Priority filter
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

            return matchesSearch && matchesUser && matchesPriority;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sortBy === 'priority') {
                const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
                return (order[a.priority as keyof typeof order] ?? 4) - (order[b.priority as keyof typeof order] ?? 4);
            }
            if (sortBy === 'dueDate') {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            return 0;
        });

    // Get unique assignees for the filter
    const assignees = Array.from(new Set(tasks
        .filter(t => t.assignee?.email)
        .map(t => JSON.stringify({ email: t.assignee!.email, name: t.assignee!.name }))
    )).map(s => JSON.parse(s) as { email: string; name: string });

    const getTasksByStatus = (status: string) =>
        filteredTasks.filter(t => t.status === status);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'short',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters Header */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj zadań..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-[160px]">
                        <User className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Osoba" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="mine">Moje zadania</SelectItem>
                        <SelectItem value="all">Wszystkie</SelectItem>
                        {assignees.map(a => (
                            <SelectItem key={a.email} value={a.email}>{a.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={moduleFilter} onValueChange={setModuleFilter}>
                    <SelectTrigger className="w-[140px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Moduł" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Wszystkie</SelectItem>
                        {MODULES.map(m => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[140px]">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Priorytet" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Wszystkie</SelectItem>
                        <SelectItem value="CRITICAL">Krytyczny</SelectItem>
                        <SelectItem value="HIGH">Wysoki</SelectItem>
                        <SelectItem value="MEDIUM">Średni</SelectItem>
                        <SelectItem value="LOW">Niski</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px]">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Sortuj" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Najnowsze</SelectItem>
                        <SelectItem value="oldest">Najstarsze</SelectItem>
                        <SelectItem value="priority">Priorytet</SelectItem>
                        <SelectItem value="dueDate">Termin</SelectItem>
                    </SelectContent>
                </Select>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nowe zadanie
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Nowe zadanie</DialogTitle>
                        </DialogHeader>
                        <form action={createTask} className="space-y-4">
                            <div>
                                <Input name="title" placeholder="Tytuł zadania" required className="font-medium" />
                            </div>
                            <div>
                                <Textarea name="description" placeholder="Opis (opcjonalnie)" rows={3} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Select name="type" defaultValue="OTHER">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Typ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NEW_SOP">Nowy SOP</SelectItem>
                                        <SelectItem value="SOP_CHANGE">Zmiana SOP</SelectItem>
                                        <SelectItem value="NEW_AGENT">Nowy Agent</SelectItem>
                                        <SelectItem value="PROCESS_CHANGE">Zmiana procesu</SelectItem>
                                        <SelectItem value="OTHER">Inne</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select name="priority" defaultValue="MEDIUM">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Priorytet" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CRITICAL">Krytyczny</SelectItem>
                                        <SelectItem value="HIGH">Wysoki</SelectItem>
                                        <SelectItem value="MEDIUM">Średni</SelectItem>
                                        <SelectItem value="LOW">Niski</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Select name="module">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Moduł" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MODULES.map(m => (
                                            <SelectItem key={m} value={m}>{m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input name="dueDate" type="date" placeholder="Termin" />
                            </div>
                            <Button type="submit" className="w-full">Utwórz zadanie</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-4 gap-4 h-[calc(100vh-260px)]">
                {STATUSES.map(({ key, label, color }) => (
                    <div
                        key={key}
                        className="flex flex-col rounded-xl border bg-muted/30"
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(key)}
                    >
                        {/* Column Header */}
                        <div className="p-3 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${color}`} />
                                <span className="font-medium text-sm">{label}</span>
                                <Badge variant="secondary" className="text-xs">
                                    {getTasksByStatus(key).length}
                                </Badge>
                            </div>
                        </div>

                        {/* Tasks */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            <AnimatePresence mode="popLayout">
                                {getTasksByStatus(key).map((task) => (
                                    <motion.div
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        draggable
                                        onDragStart={() => handleDragStart(task)}
                                        onClick={() => setSelectedTask(task)}
                                        className={`group p-3 rounded-lg border bg-card cursor-pointer active:cursor-grabbing transition-all hover:shadow-md hover:border-primary/30 ${draggingTask?.id === task.id ? 'opacity-50 scale-95' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                {/* Type Badge */}
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Badge variant="outline" className="text-[10px] gap-1 px-1.5">
                                                        {TYPE_ICONS[task.type]}
                                                        {TYPE_LABELS[task.type] || task.type}
                                                    </Badge>
                                                    <div className={`h-1.5 w-1.5 rounded-full ${PRIORITY_COLORS[task.priority]}`} />
                                                </div>

                                                {/* Title */}
                                                <p className="font-medium text-sm line-clamp-2">{task.title}</p>

                                                {/* Meta */}
                                                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground flex-wrap">
                                                    {task.module && (
                                                        <span className="flex items-center gap-0.5">
                                                            <Tag className="h-2.5 w-2.5" />
                                                            {task.module}
                                                        </span>
                                                    )}
                                                    {task.dueDate && (
                                                        <span className="flex items-center gap-0.5">
                                                            <Calendar className="h-2.5 w-2.5" />
                                                            {formatDate(task.dueDate)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Assignee */}
                                                <div className="flex items-center justify-between mt-2">
                                                    {task.assignee ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium">
                                                                {task.assignee.name?.charAt(0) || 'U'}
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {task.assignee.name}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                            <User className="h-3 w-3" />
                                                            Nieprzypisane
                                                        </div>
                                                    )}
                                                    <span className="text-[9px] text-muted-foreground">
                                                        {formatDate(task.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {getTasksByStatus(key).length === 0 && (
                                <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                                    Brak zadań
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Task Detail Dialog */}
            <Dialog open={!!selectedTask} onOpenChange={(open) => { if (!open) { setSelectedTask(null); setAiQuestions(''); } }}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    {selectedTask && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="gap-1">
                                        {TYPE_ICONS[selectedTask.type]}
                                        {TYPE_LABELS[selectedTask.type] || selectedTask.type}
                                    </Badge>
                                    <Badge className={`text-white text-[10px] ${PRIORITY_COLORS[selectedTask.priority]}`}>
                                        {PRIORITY_LABELS[selectedTask.priority] || selectedTask.priority}
                                    </Badge>
                                    {selectedTask.module && (
                                        <Badge variant="secondary">{selectedTask.module}</Badge>
                                    )}
                                </div>
                                <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 mt-2">
                                {/* Description */}
                                {selectedTask.description && (
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Opis</Label>
                                        <p className="text-sm mt-1 whitespace-pre-line">{selectedTask.description}</p>
                                    </div>
                                )}

                                <Separator />

                                {/* Meta info */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                            <User className="h-3 w-3" /> Przypisany do
                                        </Label>
                                        <p className="mt-0.5">{selectedTask.assignee?.name || 'Nieprzypisane'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                            <User className="h-3 w-3" /> Utworzony przez
                                        </Label>
                                        <p className="mt-0.5">{selectedTask.createdBy?.name || '—'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> Termin
                                        </Label>
                                        <p className="mt-0.5">{selectedTask.dueDate ? formatDate(selectedTask.dueDate) : 'Brak terminu'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> Utworzono
                                        </Label>
                                        <p className="mt-0.5">{formatDate(selectedTask.createdAt)}</p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Related Links */}
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-2 block">Powiązane moduły</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {getRelatedLinks(selectedTask).map((link) => (
                                            <Link key={link.href} href={link.href}>
                                                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
                                                    {link.icon}
                                                    {link.label}
                                                    <ExternalLink className="h-2.5 w-2.5" />
                                                </Button>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                {/* AI Question Generator */}
                                <div className="rounded-xl border border-violet-200 dark:border-violet-500/30 bg-violet-50/50 dark:bg-violet-500/5 p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-violet-500" />
                                            <span className="font-medium text-sm">AI — Pytania pomocnicze</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-1 text-xs h-7 px-2"
                                                onClick={() => {
                                                    if (!showPromptEditor && !customPrompt) {
                                                        setCustomPrompt(getDefaultPrompt(selectedTask));
                                                    }
                                                    setShowPromptEditor(!showPromptEditor);
                                                }}
                                            >
                                                <PenSquare className="h-3 w-3" />
                                                {showPromptEditor ? 'Ukryj prompt' : 'Edytuj prompt'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1.5 text-xs"
                                                onClick={() => generateAIQuestions(selectedTask)}
                                                disabled={generatingQuestions}
                                            >
                                                {generatingQuestions ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <MessageSquare className="h-3 w-3" />
                                                )}
                                                {generatingQuestions ? 'Generuję...' : 'Wygeneruj pytania'}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Editable prompt area */}
                                    {showPromptEditor && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs text-muted-foreground">Prompt do generowania pytań</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-1 text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                                                    onClick={() => setCustomPrompt(getDefaultPrompt(selectedTask))}
                                                >
                                                    <RotateCcw className="h-3 w-3" />
                                                    Resetuj
                                                </Button>
                                            </div>
                                            <Textarea
                                                value={customPrompt}
                                                onChange={(e) => setCustomPrompt(e.target.value)}
                                                className="min-h-[120px] text-xs font-mono resize-y"
                                                placeholder="Wpisz swój prompt..."
                                            />
                                        </div>
                                    )}

                                    {!showPromptEditor && (
                                        <p className="text-xs text-muted-foreground">
                                            AI wygeneruje listę pytań na podstawie kontekstu zadania.
                                            Kliknij &bdquo;Edytuj prompt&rdquo; aby dostosować instrukcję.
                                        </p>
                                    )}

                                    {aiQuestions && (
                                        <div className="mt-2 p-3 rounded-lg bg-background border text-sm whitespace-pre-line">
                                            {aiQuestions}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
