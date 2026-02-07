'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { WidgetContainer } from './widget-container';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Task {
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate: Date | null;
    completed: boolean;
}

interface TasksWidgetProps {
    userId?: string;
    limit?: number;
    onRemove?: () => void;
}

const priorityStyles = {
    low: 'text-neutral-500',
    medium: 'text-blue-500',
    high: 'text-amber-500',
    urgent: 'text-red-500',
};

const priorityLabels = {
    low: 'Niski',
    medium: 'Średni',
    high: 'Wysoki',
    urgent: 'Pilny',
};

// Sample tasks - in production fetch from API
const SAMPLE_TASKS: Task[] = [
    { id: '1', title: 'Zaktualizować dokumentację SOP', priority: 'high', dueDate: new Date(Date.now() + 86400000), completed: false },
    { id: '2', title: 'Review nowego agenta AI', priority: 'urgent', dueDate: new Date(Date.now() + 3600000), completed: false },
    { id: '3', title: 'Spotkanie z zespołem', priority: 'medium', dueDate: new Date(Date.now() + 172800000), completed: false },
    { id: '4', title: 'Przegląd raportu MUDA', priority: 'low', dueDate: null, completed: false },
    { id: '5', title: 'Konfiguracja integracji', priority: 'medium', dueDate: new Date(Date.now() + 604800000), completed: false },
];

export function TasksWidget({ userId, limit = 5, onRemove }: TasksWidgetProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // In production, fetch from API
        const fetchTasks = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 300));
                setTasks(SAMPLE_TASKS);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasks();
    }, [userId]);

    const handleToggleComplete = (taskId: string) => {
        setTasks((prev) =>
            prev.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
            )
        );
    };

    const formatDueDate = (date: Date | null) => {
        if (!date) return null;

        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffHours = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);

        if (diffMs < 0) return { text: 'Zaległe', isOverdue: true };
        if (diffHours < 1) return { text: 'Za chwilę', isOverdue: false };
        if (diffHours < 24) return { text: `${diffHours}h`, isOverdue: false };
        if (diffDays < 7) return { text: `${diffDays}d`, isOverdue: false };
        return { text: date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }), isOverdue: false };
    };

    const visibleTasks = tasks.filter((t) => !t.completed).slice(0, limit);
    const completedCount = tasks.filter((t) => t.completed).length;

    return (
        <WidgetContainer
            id="tasks-widget"
            title="Zadania"
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            size="md"
            removable={!!onRemove}
            onRemove={onRemove}
            headerActions={
                <Link href="/tasks">
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Wszystkie
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                </Link>
            }
        >
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                            <div className="flex-1 h-4 bg-neutral-200 dark:bg-neutral-700 rounded" />
                        </div>
                    ))}
                </div>
            ) : visibleTasks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm">Wszystko zrobione! 🎉</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {visibleTasks.map((task) => {
                        const dueInfo = formatDueDate(task.dueDate);
                        return (
                            <div
                                key={task.id}
                                className={cn(
                                    'group flex items-start gap-3 p-2 -mx-2 rounded-lg',
                                    'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                                    'transition-colors cursor-pointer'
                                )}
                                onClick={() => handleToggleComplete(task.id)}
                            >
                                <button
                                    className={cn(
                                        'mt-0.5 flex-shrink-0 transition-colors',
                                        task.completed
                                            ? 'text-green-500'
                                            : 'text-muted-foreground group-hover:text-foreground'
                                    )}
                                >
                                    {task.completed ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                        <Circle className="h-4 w-4" />
                                    )}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        'text-sm truncate',
                                        task.completed && 'line-through text-muted-foreground'
                                    )}>
                                        {task.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={cn('text-xs', priorityStyles[task.priority])}>
                                            {priorityLabels[task.priority]}
                                        </span>
                                        {dueInfo && (
                                            <span className={cn(
                                                'flex items-center gap-1 text-xs',
                                                dueInfo.isOverdue ? 'text-red-500' : 'text-muted-foreground'
                                            )}>
                                                {dueInfo.isOverdue ? (
                                                    <AlertCircle className="h-3 w-3" />
                                                ) : (
                                                    <Clock className="h-3 w-3" />
                                                )}
                                                {dueInfo.text}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Summary */}
                    {completedCount > 0 && (
                        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs text-muted-foreground">
                            Ukończono {completedCount} z {tasks.length} zadań
                        </div>
                    )}
                </div>
            )}
        </WidgetContainer>
    );
}
