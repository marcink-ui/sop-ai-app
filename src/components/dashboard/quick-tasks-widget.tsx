'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    Circle,
    Sparkles,
    Clock,
    ArrowRight,
    ListTodo,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WidgetContainer } from './widget-container';
import { cn } from '@/lib/utils';

interface Task {
    id: string;
    title: string;
    completed: boolean;
    aiSuggested?: boolean;
    priority?: 'high' | 'medium' | 'low';
    dueDate?: string;
}

interface QuickTasksWidgetProps {
    onRemove?: () => void;
    onViewAll?: () => void;
}

// Demo tasks - in production these would come from API
const DEMO_TASKS: Task[] = [
    { id: '1', title: 'Przejrzyj nowy SOP: Obsługa reklamacji', completed: false, aiSuggested: true, priority: 'high' },
    { id: '2', title: 'Zatwierdź agenta AI dla działu HR', completed: false, priority: 'medium' },
    { id: '3', title: 'Uzupełnij mapę strumienia wartości', completed: true, priority: 'low' },
    { id: '4', title: 'Analiza MUDA dla procesu logistycznego', completed: false, aiSuggested: true, priority: 'medium' },
];

const priorityColors = {
    high: 'text-red-500 bg-red-500/10',
    medium: 'text-amber-500 bg-amber-500/10',
    low: 'text-green-500 bg-green-500/10',
};

export function QuickTasksWidget({ onRemove, onViewAll }: QuickTasksWidgetProps) {
    const [tasks, setTasks] = useState<Task[]>(DEMO_TASKS);

    const toggleTask = (id: string) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const progress = (completedCount / tasks.length) * 100;

    return (
        <WidgetContainer
            id="quick-tasks"
            title="Zadania"
            icon={<ListTodo className="h-3.5 w-3.5" />}
            size="half"
            removable={!!onRemove}
            onRemove={onRemove}
            headerActions={
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                        {completedCount}/{tasks.length}
                    </span>
                </div>
            }
            contentClassName="p-0"
        >
            {/* Progress Bar */}
            <div className="px-4 pt-2">
                <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    />
                </div>
            </div>

            {/* Task List */}
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                <AnimatePresence mode="popLayout">
                    {tasks.slice(0, 4).map((task, index) => (
                        <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
                                'hover:bg-neutral-50 dark:hover:bg-neutral-800/30',
                                task.completed && 'opacity-60'
                            )}
                            onClick={() => toggleTask(task.id)}
                        >
                            <button className="mt-0.5 flex-shrink-0">
                                {task.completed ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Circle className="h-4 w-4 text-neutral-400" />
                                )}
                            </button>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        'text-sm',
                                        task.completed
                                            ? 'line-through text-neutral-400'
                                            : 'text-neutral-900 dark:text-white'
                                    )}>
                                        {task.title}
                                    </span>
                                    {task.aiSuggested && (
                                        <span className="flex items-center gap-0.5 text-xs text-purple-500 bg-purple-500/10 px-1.5 py-0.5 rounded-full">
                                            <Sparkles className="h-2.5 w-2.5" />
                                            AI
                                        </span>
                                    )}
                                </div>
                                {task.priority && (
                                    <span className={cn(
                                        'text-xs px-1.5 py-0.5 rounded-full inline-block mt-1',
                                        priorityColors[task.priority]
                                    )}>
                                        {task.priority === 'high' ? 'Pilne' : task.priority === 'medium' ? 'Średni' : 'Niski'}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-100 dark:border-neutral-800/50 px-4 py-3">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center text-xs"
                    onClick={onViewAll}
                >
                    Zobacz wszystkie zadania
                    <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
            </div>
        </WidgetContainer>
    );
}
