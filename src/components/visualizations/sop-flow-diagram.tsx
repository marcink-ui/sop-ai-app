'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import cytoscape, { Core, NodeSingular, EdgeSingular } from 'cytoscape';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    ZoomIn,
    ZoomOut,
    Maximize2,
    Minimize2,
    RotateCcw,
    Camera,
    Play,
    Pause,
    LayoutGrid,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type SOPNodeType = 'start' | 'end' | 'step' | 'decision' | 'parallel' | 'subprocess';

export interface SOPNode {
    id: string;
    label: string;
    type: SOPNodeType;
    description?: string;
    metadata?: Record<string, any>;
}

export interface SOPEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    type?: 'default' | 'yes' | 'no' | 'error';
}

export interface SOPFlowDiagramProps {
    nodes: SOPNode[];
    edges: SOPEdge[];
    onNodeClick?: (node: SOPNode) => void;
    onNodeDoubleClick?: (node: SOPNode) => void;
    selectedNodeId?: string;
    className?: string;
    showToolbar?: boolean;
    showMinimap?: boolean;
    layout?: 'dagre' | 'breadthfirst' | 'cose';
    animated?: boolean;
}

// ============================================================================
// Node Styling
// ============================================================================

const NODE_STYLES: Record<SOPNodeType, {
    shape: string;
    backgroundColor: string;
    borderColor: string;
    width: string;
    height: string;
}> = {
    start: {
        shape: 'ellipse',
        backgroundColor: '#22c55e',
        borderColor: '#16a34a',
        width: '60px',
        height: '60px',
    },
    end: {
        shape: 'ellipse',
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        width: '60px',
        height: '60px',
    },
    step: {
        shape: 'roundrectangle',
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        width: '160px',
        height: '60px',
    },
    decision: {
        shape: 'diamond',
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        width: '100px',
        height: '100px',
    },
    parallel: {
        shape: 'rectangle',
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
        width: '160px',
        height: '20px',
    },
    subprocess: {
        shape: 'roundrectangle',
        backgroundColor: '#06b6d4',
        borderColor: '#0891b2',
        width: '160px',
        height: '60px',
    },
};

const EDGE_COLORS: Record<string, string> = {
    default: '#94a3b8',
    yes: '#22c55e',
    no: '#ef4444',
    error: '#f97316',
};

// ============================================================================
// Component
// ============================================================================

export function SOPFlowDiagram({
    nodes,
    edges,
    onNodeClick,
    onNodeDoubleClick,
    selectedNodeId,
    className,
    showToolbar = true,
    showMinimap = false,
    layout = 'dagre',
    animated = true,
}: SOPFlowDiagramProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cyRef = useRef<Core | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Convert our data to Cytoscape format
    const elements = useMemo(() => {
        const cyNodes = nodes.map(node => ({
            data: {
                id: node.id,
                label: node.label,
                type: node.type,
                description: node.description,
                ...node.metadata,
            },
        }));

        const cyEdges = edges.map(edge => ({
            data: {
                id: edge.id,
                source: edge.source,
                target: edge.target,
                label: edge.label || '',
                type: edge.type || 'default',
            },
        }));

        return [...cyNodes, ...cyEdges];
    }, [nodes, edges]);

    // Build style array - no explicit type annotation to avoid cytoscape type issues
    const style = useMemo(() => [
        {
            selector: 'node',
            style: {
                'label': 'data(label)',
                'text-valign': 'center',
                'text-halign': 'center',
                'color': '#ffffff',
                'font-size': '12px',
                'font-weight': 500,
                'text-wrap': 'wrap',
                'text-max-width': '140px',
                'border-width': 2,
                'transition-property': 'background-color, border-color, width, height',
                'transition-duration': 200,
            } as any,
        },
        ...Object.entries(NODE_STYLES).map(([type, styles]) => ({
            selector: `node[type = "${type}"]`,
            style: {
                'shape': styles.shape,
                'background-color': styles.backgroundColor,
                'border-color': styles.borderColor,
                'width': styles.width,
                'height': styles.height,
            } as any,
        })),
        {
            selector: 'node:selected',
            style: {
                'border-width': 4,
                'border-color': '#8b5cf6',
                'background-blacken': -0.1,
            } as any,
        },
        {
            selector: 'node:active',
            style: {
                'overlay-opacity': 0.2,
                'overlay-color': '#8b5cf6',
            } as any,
        },
        {
            selector: 'edge',
            style: {
                'width': 2,
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
                'target-arrow-color': '#94a3b8',
                'line-color': '#94a3b8',
                'label': 'data(label)',
                'font-size': '10px',
                'color': '#64748b',
                'text-background-color': '#0a0a0a',
                'text-background-opacity': 0.8,
                'text-background-padding': '2px',
            } as any,
        },
        ...Object.entries(EDGE_COLORS).map(([type, color]) => ({
            selector: `edge[type = "${type}"]`,
            style: {
                'line-color': color,
                'target-arrow-color': color,
            } as any,
        })),
    ], []);

    // Initialize Cytoscape
    useEffect(() => {
        if (!isClient || !containerRef.current) return;

        const cy = cytoscape({
            container: containerRef.current,
            elements,
            style,
            layout: {
                name: layout === 'dagre' ? 'breadthfirst' : layout,
                directed: true,
                padding: 50,
                spacingFactor: 1.5,
                animate: animated,
            } as any,
            minZoom: 0.2,
            maxZoom: 3,
            wheelSensitivity: 0.3,
        });

        // Event handlers
        cy.on('tap', 'node', (evt) => {
            const node = evt.target as NodeSingular;
            const nodeData = node.data();
            if (onNodeClick) {
                onNodeClick({
                    id: nodeData.id,
                    label: nodeData.label,
                    type: nodeData.type,
                    description: nodeData.description,
                });
            }
        });

        cy.on('dbltap', 'node', (evt) => {
            const node = evt.target as NodeSingular;
            const nodeData = node.data();
            if (onNodeDoubleClick) {
                onNodeDoubleClick({
                    id: nodeData.id,
                    label: nodeData.label,
                    type: nodeData.type,
                    description: nodeData.description,
                });
            }
        });

        cyRef.current = cy;

        // Select initial node if specified
        if (selectedNodeId) {
            cy.$(`node[id = "${selectedNodeId}"]`).select();
        }

        return () => {
            cy.destroy();
        };
    }, [isClient, elements, style, layout, animated, onNodeClick, onNodeDoubleClick, selectedNodeId]);

    // Toolbar actions
    const handleZoomIn = useCallback(() => {
        if (!cyRef.current) return;
        cyRef.current.zoom(cyRef.current.zoom() * 1.2);
    }, []);

    const handleZoomOut = useCallback(() => {
        if (!cyRef.current) return;
        cyRef.current.zoom(cyRef.current.zoom() / 1.2);
    }, []);

    const handleFit = useCallback(() => {
        if (!cyRef.current) return;
        cyRef.current.fit(undefined, 50);
    }, []);

    const handleCenter = useCallback(() => {
        if (!cyRef.current) return;
        cyRef.current.center();
    }, []);

    const handleScreenshot = useCallback(() => {
        if (!cyRef.current) return;
        const png = cyRef.current.png({ full: true, scale: 2 });
        const link = document.createElement('a');
        link.download = 'sop-flow-diagram.png';
        link.href = png;
        link.click();
    }, []);

    const handleRelayout = useCallback(() => {
        if (!cyRef.current) return;
        cyRef.current.layout({
            name: layout === 'dagre' ? 'breadthfirst' : layout,
            directed: true,
            padding: 50,
            spacingFactor: 1.5,
            animate: true,
        } as any).run();
    }, [layout]);

    // Loading state
    if (!isClient) {
        return (
            <div
                className={cn(
                    'relative flex items-center justify-center bg-neutral-900 rounded-xl',
                    className
                )}
                style={{ minHeight: 400 }}
            >
                <div className="text-neutral-400">Loading flow diagram...</div>
            </div>
        );
    }

    return (
        <div className={cn('relative overflow-hidden rounded-xl bg-neutral-950', className)}>
            {/* Toolbar */}
            {showToolbar && (
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 p-1 bg-black/50 backdrop-blur rounded-lg border border-white/10">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomIn}
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        title="Zoom in"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomOut}
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        title="Zoom out"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleFit}
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        title="Fit to view"
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRelayout}
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        title="Re-layout"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleScreenshot}
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        title="Screenshot"
                    >
                        <Camera className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-10 p-2 bg-black/50 backdrop-blur rounded-lg border border-white/10">
                <div className="text-[10px] text-white/60 uppercase mb-1">Node Types</div>
                <div className="grid grid-cols-3 gap-2">
                    {Object.entries(NODE_STYLES).map(([type, style]) => (
                        <div key={type} className="flex items-center gap-1">
                            <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: style.backgroundColor }}
                            />
                            <span className="text-[10px] text-white/80 capitalize">{type}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cytoscape container */}
            <div
                ref={containerRef}
                className="w-full h-full min-h-[400px]"
                style={{ minHeight: 400 }}
            />
        </div>
    );
}

// ============================================================================
// Sample Data Helper
// ============================================================================

export function createSampleSOPFlowData(): { nodes: SOPNode[]; edges: SOPEdge[] } {
    const nodes: SOPNode[] = [
        { id: 'start', label: 'Start', type: 'start' },
        { id: 'receive', label: 'Receive Customer Request', type: 'step', description: 'Initial request intake' },
        { id: 'validate', label: 'Valid Request?', type: 'decision' },
        { id: 'assign', label: 'Assign to Agent', type: 'step' },
        { id: 'process', label: 'Process Request', type: 'subprocess', description: 'Main processing workflow' },
        { id: 'review', label: 'Quality Review', type: 'decision' },
        { id: 'notify', label: 'Notify Customer', type: 'step' },
        { id: 'rework', label: 'Rework Required', type: 'step' },
        { id: 'reject', label: 'Send Rejection', type: 'step' },
        { id: 'end', label: 'End', type: 'end' },
    ];

    const edges: SOPEdge[] = [
        { id: 'e1', source: 'start', target: 'receive' },
        { id: 'e2', source: 'receive', target: 'validate' },
        { id: 'e3', source: 'validate', target: 'assign', label: 'Yes', type: 'yes' },
        { id: 'e4', source: 'validate', target: 'reject', label: 'No', type: 'no' },
        { id: 'e5', source: 'assign', target: 'process' },
        { id: 'e6', source: 'process', target: 'review' },
        { id: 'e7', source: 'review', target: 'notify', label: 'Approved', type: 'yes' },
        { id: 'e8', source: 'review', target: 'rework', label: 'Rejected', type: 'no' },
        { id: 'e9', source: 'rework', target: 'process' },
        { id: 'e10', source: 'notify', target: 'end' },
        { id: 'e11', source: 'reject', target: 'end' },
    ];

    return { nodes, edges };
}
