'use client';

import {
    Panel,
    Group,
    Separator,
    type PanelImperativeHandle,
    type GroupImperativeHandle,
    usePanelRef,
    useGroupRef,
} from 'react-resizable-panels';
import { cn } from '@/lib/utils';
import { GripVertical, GripHorizontal } from 'lucide-react';
import { forwardRef, type ReactNode, type Ref } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface ResizableLayoutProps {
    /** Direction of panels */
    direction?: 'horizontal' | 'vertical';
    /** Persist layout to localStorage with this key */
    storageKey?: string;
    /** Children panels */
    children: ReactNode;
    /** Additional className */
    className?: string;
    /** Default layout */
    defaultLayout?: { [panelId: string]: number };
}

export interface ResizablePanelProps {
    /** Panel ID for persistence */
    id?: string;
    /** Default size in percentage */
    defaultSize?: number | string;
    /** Minimum size in percentage */
    minSize?: number | string;
    /** Maximum size in percentage */
    maxSize?: number | string;
    /** Collapsible panel */
    collapsible?: boolean;
    /** Collapsed size */
    collapsedSize?: number | string;
    /** Children content */
    children: ReactNode;
    /** Additional className */
    className?: string;
    /** Disable resize */
    disabled?: boolean;
}

export interface ResizeHandleProps {
    /** Direction of the handle */
    direction?: 'horizontal' | 'vertical';
    /** Show grip indicator */
    showGrip?: boolean;
    /** Additional className */
    className?: string;
    /** Disable handle */
    disabled?: boolean;
}

// ============================================================================
// ResizableLayout (Group wrapper)
// ============================================================================

export function ResizableLayout({
    direction = 'horizontal',
    storageKey,
    children,
    className,
    defaultLayout,
}: ResizableLayoutProps) {
    return (
        <Group
            orientation={direction}
            id={storageKey}
            defaultLayout={defaultLayout}
            className={cn('h-full w-full', className)}
        >
            {children}
        </Group>
    );
}

// ============================================================================
// ResizablePanel (Panel wrapper)
// ============================================================================

export function ResizablePanel({
    id,
    defaultSize = '50%',
    minSize = '10%',
    maxSize = '90%',
    collapsible = false,
    collapsedSize = '0%',
    children,
    className,
    disabled = false,
}: ResizablePanelProps) {
    return (
        <Panel
            id={id}
            defaultSize={defaultSize}
            minSize={minSize}
            maxSize={maxSize}
            collapsible={collapsible}
            collapsedSize={collapsible ? collapsedSize : undefined}
            disabled={disabled}
            className={cn(
                'bg-background transition-colors overflow-hidden',
                className
            )}
        >
            {children}
        </Panel>
    );
}

// ============================================================================
// ResizeHandle (Separator wrapper)
// ============================================================================

export function ResizeHandle({
    direction = 'horizontal',
    showGrip = true,
    className,
    disabled = false,
}: ResizeHandleProps) {
    const isVertical = direction === 'vertical';
    const GripIcon = isVertical ? GripHorizontal : GripVertical;

    return (
        <Separator
            disabled={disabled}
            className={cn(
                'group relative flex items-center justify-center',
                'bg-neutral-200 dark:bg-neutral-800',
                'hover:bg-blue-500/20 active:bg-blue-500/30',
                'transition-colors duration-150',
                isVertical ? 'h-1.5 w-full cursor-row-resize' : 'h-full w-1.5 cursor-col-resize',
                className
            )}
        >
            {showGrip && (
                <div
                    className={cn(
                        'absolute rounded-full',
                        'bg-neutral-400 dark:bg-neutral-600',
                        'group-hover:bg-blue-500 group-active:bg-blue-600',
                        'transition-colors duration-150',
                        'flex items-center justify-center',
                        isVertical ? 'h-4 w-12 -translate-y-1/2 top-1/2' : 'w-4 h-12 -translate-x-1/2 left-1/2'
                    )}
                >
                    <GripIcon className="h-3 w-3 text-white opacity-70" />
                </div>
            )}
        </Separator>
    );
}

// ============================================================================
// Preset Components
// ============================================================================

interface SidebarMainLayoutProps {
    sidebar: ReactNode;
    main: ReactNode;
    storageKey?: string;
    sidebarDefaultSize?: number | string;
    sidebarMinSize?: number | string;
    sidebarMaxSize?: number | string;
    sidebarCollapsible?: boolean;
    className?: string;
}

export function SidebarMainLayout({
    sidebar,
    main,
    storageKey,
    sidebarDefaultSize = '20%',
    sidebarMinSize = '15%',
    sidebarMaxSize = '35%',
    sidebarCollapsible = true,
    className,
}: SidebarMainLayoutProps) {
    return (
        <ResizableLayout
            direction="horizontal"
            storageKey={storageKey}
            className={className}
        >
            <ResizablePanel
                id="sidebar"
                defaultSize={sidebarDefaultSize}
                minSize={sidebarMinSize}
                maxSize={sidebarMaxSize}
                collapsible={sidebarCollapsible}
            >
                {sidebar}
            </ResizablePanel>
            <ResizeHandle />
            <ResizablePanel id="main" defaultSize="80%" minSize="50%">
                {main}
            </ResizablePanel>
        </ResizableLayout>
    );
}

interface MainDetailLayoutProps {
    main: ReactNode;
    detail: ReactNode;
    storageKey?: string;
    mainDefaultSize?: number | string;
    detailCollapsible?: boolean;
    className?: string;
}

export function MainDetailLayout({
    main,
    detail,
    storageKey,
    mainDefaultSize = '60%',
    detailCollapsible = true,
    className,
}: MainDetailLayoutProps) {
    return (
        <ResizableLayout
            direction="horizontal"
            storageKey={storageKey}
            className={className}
        >
            <ResizablePanel id="main" defaultSize={mainDefaultSize} minSize="40%">
                {main}
            </ResizablePanel>
            <ResizeHandle />
            <ResizablePanel
                id="detail"
                defaultSize="40%"
                minSize="20%"
                maxSize="50%"
                collapsible={detailCollapsible}
            >
                {detail}
            </ResizablePanel>
        </ResizableLayout>
    );
}

// ============================================================================
// Re-exports
// ============================================================================

export {
    Panel,
    Group,
    Separator,
    usePanelRef,
    useGroupRef,
} from 'react-resizable-panels';

export type { PanelImperativeHandle, GroupImperativeHandle } from 'react-resizable-panels';
