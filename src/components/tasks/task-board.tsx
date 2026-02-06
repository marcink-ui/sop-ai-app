'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

const PRIORITY_COLORS: Record<string, string> = {
    CRITICAL: 'bg-red-500',
    HIGH: 'bg-orange-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-green-500',
};

const MODULES = ['SOPs', 'Agents', 'Processes', 'Infrastructure', 'Training'];

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
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [moduleFilter, setModuleFilter] = useState<string>('all');
    const [draggingTask, setDraggingTask] = useState<Task | null>(null);

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

        // Optimistic update
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
            fetchTasks(); // Revert on error
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
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    // Filter tasks by search
    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Szukaj zadań..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-64"
                        />
                    </div>
                    <Select value={moduleFilter} onValueChange={setModuleFilter}>
                        <SelectTrigger className="w-[150px]">
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
                </div>

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
                                <Input
                                    name="title"
                                    placeholder="Tytuł zadania"
                                    required
                                    className="font-medium"
                                />
                            </div>
                            <div>
                                <Textarea
                                    name="description"
                                    placeholder="Opis (opcjonalnie)"
                                    rows={3}
                                />
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
                                <Input
                                    name="dueDate"
                                    type="date"
                                    placeholder="Termin"
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Utwórz zadanie
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-4 gap-4 h-[calc(100vh-200px)]">
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
                                        className={`group p-3 rounded-lg border bg-card cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${draggingTask?.id === task.id ? 'opacity-50 scale-95' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                {/* Type Badge */}
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Badge variant="outline" className="text-[10px] gap-1 px-1.5">
                                                        {TYPE_ICONS[task.type]}
                                                        {task.type.replace('_', ' ')}
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
        </div>
    );
}
