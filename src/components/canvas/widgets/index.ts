'use client';

import { ReactNode } from 'react';
import { KPICardWidget } from './kpi-card';
import { ChartBarWidget } from './chart-bar';
import { ChartLineWidget } from './chart-line';
import { AIInsightWidget } from './ai-insight';
import { SOPStatusWidget } from './sop-status';
import { MUDAHeatmapWidget } from './muda-heatmap';

// Widget types enum
export type WidgetType =
    | 'kpi-card'
    | 'chart-bar'
    | 'chart-line'
    | 'ai-insight'
    | 'sop-status'
    | 'muda-heatmap';

// Widget configuration interface
export interface CanvasWidget {
    id: string;
    type: WidgetType;
    title: string;
    config: Record<string, any>;
}

// Widget layout for react-grid-layout
export interface WidgetLayout {
    i: string; // Widget ID
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
}

// Widget registry with default sizes
export const WIDGET_REGISTRY: Record<WidgetType, {
    label: string;
    description: string;
    defaultSize: { w: number; h: number; minW: number; minH: number };
    component: React.ComponentType<{ widget: CanvasWidget; onRemove: () => void }>;
}> = {
    'kpi-card': {
        label: 'KPI Card',
        description: 'Pojedyncza metryka z trendem',
        defaultSize: { w: 2, h: 2, minW: 2, minH: 2 },
        component: KPICardWidget,
    },
    'chart-bar': {
        label: 'Wykres słupkowy',
        description: 'Wykres słupkowy z danymi',
        defaultSize: { w: 4, h: 3, minW: 3, minH: 2 },
        component: ChartBarWidget,
    },
    'chart-line': {
        label: 'Wykres liniowy',
        description: 'Trend w czasie',
        defaultSize: { w: 4, h: 3, minW: 3, minH: 2 },
        component: ChartLineWidget,
    },
    'ai-insight': {
        label: 'AI Insight',
        description: 'Podsumowanie AI dla działu',
        defaultSize: { w: 4, h: 3, minW: 3, minH: 2 },
        component: AIInsightWidget,
    },
    'sop-status': {
        label: 'Status SOP',
        description: 'Postęp wdrożenia procedur',
        defaultSize: { w: 3, h: 2, minW: 2, minH: 2 },
        component: SOPStatusWidget,
    },
    'muda-heatmap': {
        label: 'MUDA Heatmap',
        description: 'Mini mapa strat procesowych',
        defaultSize: { w: 4, h: 3, minW: 3, minH: 2 },
        component: MUDAHeatmapWidget,
    },
};

// Default widgets for new canvas
export const DEFAULT_WIDGETS: CanvasWidget[] = [
    {
        id: 'widget-1',
        type: 'kpi-card',
        title: 'Liczba SOP',
        config: { value: 48, change: 12, label: 'SOP', icon: 'FileText' },
    },
    {
        id: 'widget-2',
        type: 'kpi-card',
        title: 'Aktywni Agenci',
        config: { value: 8, change: 2, label: 'Agentów', icon: 'Bot' },
    },
    {
        id: 'widget-3',
        type: 'ai-insight',
        title: 'AI Insight',
        config: { department: 'Sprzedaż' },
    },
    {
        id: 'widget-4',
        type: 'sop-status',
        title: 'Status SOP',
        config: {},
    },
];

// Default layout for widgets
export const DEFAULT_LAYOUT: WidgetLayout[] = [
    { i: 'widget-1', x: 0, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
    { i: 'widget-2', x: 2, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
    { i: 'widget-3', x: 4, y: 0, w: 4, h: 3, minW: 3, minH: 2 },
    { i: 'widget-4', x: 0, y: 2, w: 4, h: 2, minW: 2, minH: 2 },
];
