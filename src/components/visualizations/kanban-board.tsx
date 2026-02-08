'use client';

import { useState, useCallback, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    MoreHorizontal,
    Clock,
    User,
    Calendar,
    Flag,
    GripVertical,
    LayoutList,
    Columns3,
    CalendarDays,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
export type ViewMode = 'list' | 'kanban' | 'calendar';

export interface KanbanTask {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee?: {
        id: string;
        name: string;
        avatar?: string;
    };
    dueDate?: Date;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface KanbanColumn {
    id: TaskStatus;
    title: string;
    color: string;
    limit?: number;
}

export interface KanbanBoardProps {
    tasks: KanbanTask[];
    onTaskMove?: (taskId: string, newStatus: TaskStatus, newIndex: number) => void;
    onTaskClick?: (task: KanbanTask) => void;
    onAddTask?: (status: TaskStatus) => void;
    className?: string;
    viewMode?: ViewMode;
    onViewModeChange?: (mode: ViewMode) => void;
}

// ============================================================================
// Constants
// ============================================================================

const COLUMNS: KanbanColumn[] = [
    { id: 'backlog', title: 'Backlog', color: '#6b7280' },
    { id: 'todo', title: 'To Do', color: '#3b82f6' },
    { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
    { id: 'review', title: 'Review', color: '#8b5cf6' },
    { id: 'done', title: 'Done', color: '#22c55e' },
];

const PRIORITY_COLORS: Record<TaskPriority, string> = {
    low: '#6b7280',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444',
};

const PRIORITY_ICONS: Record<TaskPriority, string> = {
    low: '◇',
    medium: '◆',
    high: '▲',
    urgent: '!',
};

// ============================================================================
// Sortable Task Card
// ============================================================================

interface SortableTaskCardProps {
    task: KanbanTask;
    onClick?: () => void;
}

function SortableTaskCard({ task, onClick }: SortableTaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative p-3 bg-neutral-800 border border-neutral-700 rounded-lg cursor-pointer hover:border-purple-500/50 transition-all',
                isDragging && 'opacity-50 shadow-lg'
            )}
            onClick={onClick}
        >
            {/* Drag handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1"
            >
                <GripVertical className="h-4 w-4 text-neutral-500" />
            </div>

            <div className="ml-4">
                {/* Priority & Title */}
                <div className="flex items-start gap-2 mb-2">
                    <span
                        className="text-sm font-medium shrink-0"
                        style={{ color: PRIORITY_COLORS[task.priority] }}
                        title={`Priority: ${task.priority}`}
                    >
                        {PRIORITY_ICONS[task.priority]}
                    </span>
                    <h4 className="text-sm font-medium text-white line-clamp-2">
                        {task.title}
                    </h4>
                </div>

                {/* Description */}
                {task.description && (
                    <p className="text-xs text-neutral-400 line-clamp-2 mb-2">
                        {task.description}
                    </p>
                )}

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {task.tags.slice(0, 3).map((tag, i) => (
                            <Badge
                                key={i}
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 border-neutral-600 text-neutral-400"
                            >
                                {tag}
                            </Badge>
                        ))}
                        {task.tags.length > 3 && (
                            <span className="text-[10px] text-neutral-500">
                                +{task.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-neutral-500">
                    <div className="flex items-center gap-2">
                        {task.assignee && (
                            <div className="flex items-center gap-1">
                                <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-[10px] text-white">
                                    {task.assignee.name[0]}
                                </div>
                            </div>
                        )}
                        {task.dueDate && (
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                    {task.dueDate.toLocaleDateString('pl-PL', {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Task Card (for overlay)
// ============================================================================

function TaskCard({ task }: { task: KanbanTask }) {
    return (
        <div className="p-3 bg-neutral-800 border border-purple-500 rounded-lg shadow-xl">
            <div className="flex items-start gap-2">
                <span
                    className="text-sm font-medium shrink-0"
                    style={{ color: PRIORITY_COLORS[task.priority] }}
                >
                    {PRIORITY_ICONS[task.priority]}
                </span>
                <h4 className="text-sm font-medium text-white">{task.title}</h4>
            </div>
        </div>
    );
}

// ============================================================================
// Column
// ============================================================================

interface ColumnProps {
    column: KanbanColumn;
    tasks: KanbanTask[];
    onTaskClick?: (task: KanbanTask) => void;
    onAddTask?: () => void;
}

function Column({ column, tasks, onTaskClick, onAddTask }: ColumnProps) {
    const taskCount = tasks.length;
    const isOverLimit = column.limit !== undefined && taskCount > column.limit;

    return (
        <div className="flex-shrink-0 w-72 flex flex-col bg-neutral-900/50 rounded-xl border border-neutral-800">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: column.color }}
                    />
                    <h3 className="text-sm font-semibold text-white">{column.title}</h3>
                    <span
                        className={cn(
                            'text-xs px-1.5 py-0.5 rounded-full',
                            isOverLimit
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-neutral-700 text-neutral-400'
                        )}
                    >
                        {taskCount}
                        {column.limit && `/${column.limit}`}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-neutral-400 hover:text-white"
                        onClick={onAddTask}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-neutral-400 hover:text-white"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Tasks */}
            <SortableContext
                items={tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]">
                    {tasks.map((task) => (
                        <SortableTaskCard
                            key={task.id}
                            task={task}
                            onClick={() => onTaskClick?.(task)}
                        />
                    ))}
                    {tasks.length === 0 && (
                        <div className="flex items-center justify-center h-20 text-xs text-neutral-500">
                            Drop tasks here
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

// ============================================================================
// Main Kanban Board Component
// ============================================================================

export function KanbanBoard({
    tasks,
    onTaskMove,
    onTaskClick,
    onAddTask,
    className,
    viewMode = 'kanban',
    onViewModeChange,
}: KanbanBoardProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [localTasks, setLocalTasks] = useState(tasks);

    // Update local tasks when props change
    useMemo(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const activeTask = useMemo(
        () => localTasks.find((t) => t.id === activeId),
        [localTasks, activeId]
    );

    const tasksByColumn = useMemo(() => {
        const grouped: Record<TaskStatus, KanbanTask[]> = {
            backlog: [],
            todo: [],
            'in-progress': [],
            review: [],
            done: [],
        };
        localTasks.forEach((task) => {
            grouped[task.status].push(task);
        });
        return grouped;
    }, [localTasks]);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    }, []);

    const handleDragOver = useCallback((event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTask = localTasks.find((t) => t.id === activeId);
        const overTask = localTasks.find((t) => t.id === overId);

        if (!activeTask) return;

        // Check if we're over a column or a task
        const overColumn = COLUMNS.find((c) => c.id === overId);
        if (overColumn && activeTask.status !== overColumn.id) {
            // Moving to an empty column or column header
            setLocalTasks((tasks) =>
                tasks.map((t) =>
                    t.id === activeId ? { ...t, status: overColumn.id } : t
                )
            );
        } else if (overTask && activeTask.status !== overTask.status) {
            // Moving to a different column via another task
            setLocalTasks((tasks) =>
                tasks.map((t) =>
                    t.id === activeId ? { ...t, status: overTask.status } : t
                )
            );
        }
    }, [localTasks]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        const activeTask = localTasks.find((t) => t.id === activeId);
        const overTask = localTasks.find((t) => t.id === overId);

        if (!activeTask) return;

        if (overTask && activeTask.status === overTask.status) {
            // Reordering within the same column
            const columnTasks = tasksByColumn[activeTask.status];
            const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
            const newIndex = columnTasks.findIndex((t) => t.id === overId);

            const newOrder = arrayMove(columnTasks, oldIndex, newIndex);
            const newTasks = localTasks.filter((t) => t.status !== activeTask.status);
            setLocalTasks([...newTasks, ...newOrder]);

            if (onTaskMove) {
                onTaskMove(activeId, activeTask.status, newIndex);
            }
        } else {
            // Moving to different column
            if (onTaskMove) {
                onTaskMove(activeId, activeTask.status, 0);
            }
        }
    }, [localTasks, tasksByColumn, onTaskMove]);

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-white">Tasks</h2>
                    <span className="text-sm text-neutral-400">
                        {localTasks.length} tasks
                    </span>
                </div>

                {/* View Toggle */}
                {onViewModeChange && (
                    <div className="flex items-center gap-1 p-1 bg-neutral-800 rounded-lg">
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => onViewModeChange('list')}
                            className="h-7 px-2"
                        >
                            <LayoutList className="h-4 w-4 mr-1" />
                            List
                        </Button>
                        <Button
                            variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => onViewModeChange('kanban')}
                            className="h-7 px-2"
                        >
                            <Columns3 className="h-4 w-4 mr-1" />
                            Kanban
                        </Button>
                        <Button
                            variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => onViewModeChange('calendar')}
                            className="h-7 px-2"
                        >
                            <CalendarDays className="h-4 w-4 mr-1" />
                            Calendar
                        </Button>
                    </div>
                )}
            </div>

            {/* Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto p-4">
                    <div className="flex gap-4 h-full">
                        {COLUMNS.map((column) => (
                            <Column
                                key={column.id}
                                column={column}
                                tasks={tasksByColumn[column.id]}
                                onTaskClick={onTaskClick}
                                onAddTask={() => onAddTask?.(column.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeTask ? <TaskCard task={activeTask} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

// ============================================================================
// Sample Data Helper
// ============================================================================

export function createSampleKanbanData(): KanbanTask[] {
    return [
        {
            id: 'task-1',
            title: 'Create onboarding flow',
            description: 'Design and implement new user onboarding experience',
            status: 'in-progress',
            priority: 'high',
            assignee: { id: 'u1', name: 'Anna Kowalska' },
            tags: ['UX', 'Frontend'],
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'task-2',
            title: 'Fix login page issues',
            description: 'Users reporting timeout errors on login',
            status: 'todo',
            priority: 'urgent',
            assignee: { id: 'u2', name: 'Jan Nowak' },
            tags: ['Bug', 'Backend'],
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'task-3',
            title: 'Update API documentation',
            status: 'backlog',
            priority: 'low',
            tags: ['Docs'],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'task-4',
            title: 'Integrate payment gateway',
            description: 'Set up Stripe integration for premium features',
            status: 'review',
            priority: 'high',
            assignee: { id: 'u3', name: 'Maria Wiśniewska' },
            tags: ['Backend', 'Payment'],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'task-5',
            title: 'Design mobile navigation',
            status: 'todo',
            priority: 'medium',
            assignee: { id: 'u1', name: 'Anna Kowalska' },
            tags: ['UX', 'Mobile'],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'task-6',
            title: 'Set up CI/CD pipeline',
            status: 'done',
            priority: 'medium',
            assignee: { id: 'u2', name: 'Jan Nowak' },
            tags: ['DevOps'],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
}
