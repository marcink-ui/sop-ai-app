'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

interface WidgetConfig {
    id: string;
    visible: boolean;
    order: number;
    size: 'third' | 'half' | 'full';
}

interface DashboardEditContextType {
    isEditMode: boolean;
    toggleEditMode: () => void;
    widgets: WidgetConfig[];
    updateWidget: (id: string, config: Partial<WidgetConfig>) => void;
    hideWidget: (id: string) => void;
    showWidget: (id: string) => void;
    reorderWidgets: (startIndex: number, endIndex: number) => void;
    getVisibleWidgets: () => WidgetConfig[];
    resetToDefaults: () => void;
}

const DashboardEditContext = createContext<DashboardEditContextType | undefined>(undefined);

const STORAGE_KEY = 'vantage-dashboard-widgets';

// Predefined widget order (client-centric layout - predefined, no drag & drop)
// Order: 1) Welcome + Stats (row 1), 2) Databases (row 2), 3) AI Chat + Quick Tasks + Pandas (row 3)
const DEFAULT_WIDGETS: WidgetConfig[] = [
    { id: 'stats', visible: true, order: 0, size: 'full' },             // Stats (2/3 of row 1, 4 columns)
    { id: 'databases', visible: true, order: 1, size: 'full' },         // Database navigation - full width
    { id: 'chat-hero', visible: true, order: 2, size: 'third' },        // AI Chat - 1/3 width
    { id: 'quick-tasks', visible: true, order: 3, size: 'third' },      // Quick Tasks - 1/3 width
    { id: 'pandy', visible: true, order: 4, size: 'third' },            // Pandy gamification - 1/3 width
    { id: 'recent-activity', visible: false, order: 5, size: 'full' },  // Recent SOPs - hidden by default
];

// Load widgets from localStorage
function loadWidgets(): WidgetConfig[] {
    if (typeof window === 'undefined') return DEFAULT_WIDGETS;

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved) as WidgetConfig[];
            // Merge with defaults to handle new widgets added in updates
            const mergedWidgets = DEFAULT_WIDGETS.map(defaultWidget => {
                const savedWidget = parsed.find(w => w.id === defaultWidget.id);
                return savedWidget ? { ...defaultWidget, ...savedWidget } : defaultWidget;
            });
            return mergedWidgets;
        }
    } catch (e) {
        console.warn('Failed to load widget preferences:', e);
    }
    return DEFAULT_WIDGETS;
}

// Save widgets to localStorage
function saveWidgets(widgets: WidgetConfig[]) {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    } catch (e) {
        console.warn('Failed to save widget preferences:', e);
    }
}

export function DashboardEditProvider({ children }: { children: ReactNode }) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load from localStorage on mount (client-side only)
    useEffect(() => {
        const loaded = loadWidgets();
        setWidgets(loaded);
        setIsHydrated(true);
    }, []);

    // Save to localStorage on change (after hydration)
    useEffect(() => {
        if (isHydrated) {
            saveWidgets(widgets);
        }
    }, [widgets, isHydrated]);

    const toggleEditMode = useCallback(() => {
        setIsEditMode((prev) => !prev);
    }, []);

    const updateWidget = useCallback((id: string, config: Partial<WidgetConfig>) => {
        setWidgets((prev) =>
            prev.map((widget) =>
                widget.id === id ? { ...widget, ...config } : widget
            )
        );
    }, []);

    const hideWidget = useCallback((id: string) => {
        updateWidget(id, { visible: false });
    }, [updateWidget]);

    const showWidget = useCallback((id: string) => {
        updateWidget(id, { visible: true });
    }, [updateWidget]);

    const reorderWidgets = useCallback((startIndex: number, endIndex: number) => {
        setWidgets((prev) => {
            const result = Array.from(prev);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return result.map((widget, index) => ({ ...widget, order: index }));
        });
    }, []);

    const getVisibleWidgets = useCallback(() => {
        return widgets.filter((w) => w.visible).sort((a, b) => a.order - b.order);
    }, [widgets]);

    const resetToDefaults = useCallback(() => {
        setWidgets(DEFAULT_WIDGETS);
    }, []);

    return (
        <DashboardEditContext.Provider
            value={{
                isEditMode,
                toggleEditMode,
                widgets,
                updateWidget,
                hideWidget,
                showWidget,
                reorderWidgets,
                getVisibleWidgets,
                resetToDefaults,
            }}
        >
            {children}
        </DashboardEditContext.Provider>
    );
}

export function useDashboardEdit() {
    const context = useContext(DashboardEditContext);
    if (context === undefined) {
        throw new Error('useDashboardEdit must be used within a DashboardEditProvider');
    }
    return context;
}
