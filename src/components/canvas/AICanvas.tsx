'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    CanvasWidget,
    WidgetType,
    WIDGET_REGISTRY,
    DEFAULT_WIDGETS,
} from './widgets';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Save, RotateCcw, LayoutDashboard, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'vantage-canvas-widgets';

export function AICanvas() {
    const [widgets, setWidgets] = useState<CanvasWidget[]>([]);
    const [mounted, setMounted] = useState(false);

    // Load widgets from localStorage
    useEffect(() => {
        setMounted(true);
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setWidgets(JSON.parse(saved));
            } else {
                setWidgets(DEFAULT_WIDGETS);
            }
        } catch {
            setWidgets(DEFAULT_WIDGETS);
        }
    }, []);

    // Save widgets to localStorage
    const saveWidgets = useCallback(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
            toast.success('Canvas zapisany!');
        } catch {
            toast.error('Błąd zapisu canvas');
        }
    }, [widgets]);

    // Add new widget
    const addWidget = (type: WidgetType) => {
        const registry = WIDGET_REGISTRY[type];
        const newWidget: CanvasWidget = {
            id: `widget-${Date.now()}`,
            type,
            title: registry.label,
            config: type === 'ai-insight' ? { department: 'Sprzedaż' } : {},
        };
        setWidgets(prev => [...prev, newWidget]);
    };

    // Remove widget
    const removeWidget = (id: string) => {
        setWidgets(prev => prev.filter(w => w.id !== id));
    };

    // Reset to defaults
    const resetCanvas = () => {
        setWidgets(DEFAULT_WIDGETS);
        localStorage.removeItem(STORAGE_KEY);
        toast.info('Canvas zresetowany');
    };

    // Move widget up/down
    const moveWidget = (id: string, direction: 'up' | 'down') => {
        setWidgets(prev => {
            const index = prev.findIndex(w => w.id === id);
            if (index === -1) return prev;
            if (direction === 'up' && index === 0) return prev;
            if (direction === 'down' && index === prev.length - 1) return prev;

            const newWidgets = [...prev];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            [newWidgets[index], newWidgets[targetIndex]] = [newWidgets[targetIndex], newWidgets[index]];
            return newWidgets;
        });
    };

    if (!mounted) {
        return (
            <div className="flex items-center justify-center h-64">
                <LayoutDashboard className="h-8 w-8 animate-pulse text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                        <LayoutDashboard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">AI Canvas</h2>
                        <p className="text-sm text-muted-foreground">
                            Dashboard widgetów AI dla managerów
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Dodaj widget
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {(Object.keys(WIDGET_REGISTRY) as WidgetType[]).map(type => (
                                <DropdownMenuItem key={type} onClick={() => addWidget(type)}>
                                    <div>
                                        <div className="font-medium">{WIDGET_REGISTRY[type].label}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {WIDGET_REGISTRY[type].description}
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="sm" onClick={resetCanvas}>
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={saveWidgets} className="gap-2">
                        <Save className="h-4 w-4" />
                        Zapisz
                    </Button>
                </div>
            </div>

            {/* Widget Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {widgets.map((widget, index) => {
                    const WidgetComponent = WIDGET_REGISTRY[widget.type]?.component;
                    if (!WidgetComponent) return null;

                    const widgetSize = WIDGET_REGISTRY[widget.type].defaultSize;
                    const colSpan = widgetSize.w >= 4 ? 'lg:col-span-2' : '';

                    return (
                        <div
                            key={widget.id}
                            className={cn(
                                "relative group min-h-[180px]",
                                colSpan
                            )}
                        >
                            {/* Reorder controls */}
                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 bg-background shadow-sm"
                                    onClick={() => moveWidget(widget.id, 'up')}
                                    disabled={index === 0}
                                >
                                    <GripVertical className="h-3 w-3" />
                                </Button>
                            </div>
                            <WidgetComponent
                                widget={widget}
                                onRemove={() => removeWidget(widget.id)}
                            />
                        </div>
                    );
                })}
            </div>

            {widgets.length === 0 && (
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                    <LayoutDashboard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">Brak widgetów</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Kliknij &quot;Dodaj widget&quot; aby zacząć budować swój dashboard
                    </p>
                </div>
            )}
        </div>
    );
}
