'use client';

import { useState, useCallback, useEffect } from 'react';
import {
    Plus,
    X,
    GripVertical,
    MessageSquare,
    CheckCircle2,
    Calculator,
    Award,
    LayoutGrid,
    Save,
    RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export type WidgetType = 'chat' | 'pandas' | 'tasks' | 'formula-roi' | 'formula-productivity' | 'formula-agents';

export interface WidgetConfig {
    id: string;
    type: WidgetType;
    title: string;
    size?: 'sm' | 'md' | 'lg' | 'full';
    position: number;
}

interface WidgetDefinition {
    type: WidgetType;
    title: string;
    description: string;
    icon: React.ReactNode;
    defaultSize: 'sm' | 'md' | 'lg';
}

const WIDGET_DEFINITIONS: WidgetDefinition[] = [
    {
        type: 'chat',
        title: 'Chat AI',
        description: 'Wbudowany asystent AI',
        icon: <MessageSquare className="h-4 w-4" />,
        defaultSize: 'md',
    },
    {
        type: 'pandas',
        title: 'Pandy',
        description: 'Twoje odznaki i osiągnięcia',
        icon: <Award className="h-4 w-4" />,
        defaultSize: 'sm',
    },
    {
        type: 'tasks',
        title: 'Zadania',
        description: 'Lista priorytetowych zadań',
        icon: <CheckCircle2 className="h-4 w-4" />,
        defaultSize: 'md',
    },
    {
        type: 'formula-roi',
        title: 'ROI Summary',
        description: 'Podsumowanie ROI',
        icon: <Calculator className="h-4 w-4" />,
        defaultSize: 'md',
    },
    {
        type: 'formula-productivity',
        title: 'Produktywność',
        description: 'Metryki produktywności',
        icon: <Calculator className="h-4 w-4" />,
        defaultSize: 'md',
    },
    {
        type: 'formula-agents',
        title: 'AI Agents',
        description: 'Statystyki agentów AI',
        icon: <Calculator className="h-4 w-4" />,
        defaultSize: 'md',
    },
];

const STORAGE_KEY = 'vantageos-dashboard-widgets';

const DEFAULT_WIDGETS: WidgetConfig[] = [
    { id: 'tasks-default', type: 'tasks', title: 'Zadania', size: 'md', position: 0 },
    { id: 'pandas-default', type: 'pandas', title: 'Pandy', size: 'sm', position: 1 },
    { id: 'formula-roi-default', type: 'formula-roi', title: 'ROI Summary', size: 'md', position: 2 },
];

interface DashboardEditorProps {
    onWidgetsChange: (widgets: WidgetConfig[]) => void;
    currentWidgets: WidgetConfig[];
}

export function DashboardEditor({ onWidgetsChange, currentWidgets }: DashboardEditorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const addWidget = (definition: WidgetDefinition) => {
        const newWidget: WidgetConfig = {
            id: `${definition.type}-${Date.now()}`,
            type: definition.type,
            title: definition.title,
            size: definition.defaultSize,
            position: currentWidgets.length,
        };

        const updated = [...currentWidgets, newWidget];
        onWidgetsChange(updated);
        setHasChanges(true);
    };

    const removeWidget = (widgetId: string) => {
        const updated = currentWidgets
            .filter((w) => w.id !== widgetId)
            .map((w, idx) => ({ ...w, position: idx }));
        onWidgetsChange(updated);
        setHasChanges(true);
    };

    const moveWidget = (widgetId: string, direction: 'up' | 'down') => {
        const idx = currentWidgets.findIndex((w) => w.id === widgetId);
        if (idx === -1) return;

        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= currentWidgets.length) return;

        const updated = [...currentWidgets];
        [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
        updated.forEach((w, i) => (w.position = i));

        onWidgetsChange(updated);
        setHasChanges(true);
    };

    const saveLayout = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentWidgets));
        setHasChanges(false);
    };

    const resetLayout = () => {
        onWidgetsChange(DEFAULT_WIDGETS);
        localStorage.removeItem(STORAGE_KEY);
        setHasChanges(false);
    };

    const isWidgetAdded = (type: WidgetType) =>
        currentWidgets.some((w) => w.type === type);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Edytuj Dashboard
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <LayoutGrid className="h-5 w-5" />
                        Edytor Dashboard
                    </SheetTitle>
                    <SheetDescription>
                        Dostosuj widgety wyświetlane na Twoim dashboardzie
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                    {/* Current Widgets */}
                    <div>
                        <h3 className="text-sm font-medium mb-3">Aktywne widgety</h3>
                        {currentWidgets.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                                Brak widgetów. Dodaj pierwszy poniżej.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                <AnimatePresence mode="popLayout">
                                    {currentWidgets
                                        .sort((a, b) => a.position - b.position)
                                        .map((widget) => {
                                            const definition = WIDGET_DEFINITIONS.find(
                                                (d) => d.type === widget.type
                                            );
                                            return (
                                                <motion.div
                                                    key={widget.id}
                                                    layout
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className={cn(
                                                        'flex items-center gap-3 p-3 rounded-lg',
                                                        'bg-neutral-50 dark:bg-neutral-800/50',
                                                        'border border-neutral-200 dark:border-neutral-700'
                                                    )}
                                                >
                                                    <button className="cursor-grab active:cursor-grabbing text-muted-foreground">
                                                        <GripVertical className="h-4 w-4" />
                                                    </button>
                                                    <div className="flex-1 flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                            {definition?.icon}
                                                        </div>
                                                        <span className="text-sm font-medium">
                                                            {widget.title}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600"
                                                        onClick={() => removeWidget(widget.id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </motion.div>
                                            );
                                        })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Available Widgets */}
                    <div>
                        <h3 className="text-sm font-medium mb-3">Dostępne widgety</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {WIDGET_DEFINITIONS.map((definition) => {
                                const added = isWidgetAdded(definition.type);
                                return (
                                    <button
                                        key={definition.type}
                                        onClick={() => !added && addWidget(definition)}
                                        disabled={added}
                                        className={cn(
                                            'flex flex-col items-center gap-2 p-4 rounded-lg',
                                            'border transition-colors text-left',
                                            added
                                                ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 opacity-50 cursor-not-allowed'
                                                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-primary/50 cursor-pointer'
                                        )}
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            {definition.icon}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium">{definition.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {definition.description}
                                            </p>
                                        </div>
                                        {added && (
                                            <span className="text-xs text-muted-foreground">
                                                Już dodano
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={resetLayout}
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={saveLayout}
                            disabled={!hasChanges}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Zapisz
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// Hook to manage widget state with persistence
export function useDashboardWidgets() {
    const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setWidgets(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading dashboard widgets:', error);
        }
        setIsLoaded(true);
    }, []);

    const updateWidgets = useCallback((newWidgets: WidgetConfig[]) => {
        setWidgets(newWidgets);
    }, []);

    const removeWidget = useCallback((widgetId: string) => {
        setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
    }, []);

    return {
        widgets,
        isLoaded,
        updateWidgets,
        removeWidget,
    };
}

export { DEFAULT_WIDGETS, STORAGE_KEY };
