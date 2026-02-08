'use client';

import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Maximize2,
    Minimize2,
    RotateCcw,
    Camera,
    Settings,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type NodeType = 'process' | 'sop' | 'agent' | 'integration' | 'department';

export interface GraphNode {
    id: string;
    name: string;
    type: NodeType;
    description?: string;
    val?: number; // Size weight
    color?: string;
    x?: number;
    y?: number;
    z?: number;
    fx?: number;
    fy?: number;
    fz?: number;
}

export interface GraphLink {
    source: string;
    target: string;
    type?: 'depends' | 'triggers' | 'supports' | 'contains';
    value?: number;
    color?: string;
}

export interface ForceGraph3DProps {
    nodes: GraphNode[];
    links: GraphLink[];
    width?: number;
    height?: number;
    onNodeClick?: (node: GraphNode) => void;
    onNodeHover?: (node: GraphNode | null) => void;
    className?: string;
    backgroundColor?: string;
    showToolbar?: boolean;
}

// ============================================================================
// Node Styling
// ============================================================================

const NODE_COLORS: Record<NodeType, string> = {
    process: '#8b5cf6', // purple
    sop: '#3b82f6', // blue
    agent: '#10b981', // emerald
    integration: '#f59e0b', // amber
    department: '#ef4444', // red
};

const NODE_SIZES: Record<NodeType, number> = {
    process: 8,
    sop: 6,
    agent: 7,
    integration: 5,
    department: 10,
};

const LINK_COLORS: Record<string, string> = {
    depends: '#94a3b8',
    triggers: '#22c55e',
    supports: '#3b82f6',
    contains: '#a855f7',
};

// ============================================================================
// Component
// ============================================================================

export function ForceGraph3D({
    nodes,
    links,
    width,
    height,
    onNodeClick,
    onNodeHover,
    className,
    backgroundColor = '#0a0a0a',
    showToolbar = true,
}: ForceGraph3DProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<any>(null);
    const [isClient, setIsClient] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

    // Ensure client-side only rendering
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Format graph data with styling
    const graphData = useMemo(() => ({
        nodes: nodes.map(node => ({
            ...node,
            val: node.val ?? NODE_SIZES[node.type] ?? 5,
            color: node.color ?? NODE_COLORS[node.type] ?? '#ffffff',
        })),
        links: links.map(link => ({
            ...link,
            color: link.color ?? (link.type ? LINK_COLORS[link.type] : '#ffffff33'),
        })),
    }), [nodes, links]);

    // Initialize 3D Force Graph
    useEffect(() => {
        if (!isClient || !containerRef.current) return;

        let graph: any = null;

        // Dynamic import for SSR compatibility
        import('3d-force-graph').then((ForceGraph3DModule) => {
            if (!containerRef.current) return;

            const container = containerRef.current;
            const actualWidth = width ?? container.clientWidth;
            const actualHeight = height ?? container.clientHeight;

            // Create graph instance using the default export
            const ForceGraph = ForceGraph3DModule.default;
            graph = new ForceGraph(container)
                .width(actualWidth)
                .height(actualHeight)
                .backgroundColor(backgroundColor)
                .graphData(graphData)
                .nodeLabel((node: any) => `
                    <div style="background: rgba(0,0,0,0.8); padding: 8px 12px; border-radius: 6px; font-size: 12px;">
                        <strong>${node.name}</strong>
                        <br/>
                        <span style="color: ${node.color}; text-transform: uppercase; font-size: 10px;">
                            ${node.type}
                        </span>
                        ${node.description ? `<br/><span style="color: #888;">${node.description}</span>` : ''}
                    </div>
                `)
                .nodeColor((node: any) => node.color)
                .nodeVal((node: any) => node.val)
                .linkColor((link: any) => link.color ?? '#ffffff33')
                .linkWidth((link: any) => link.value ?? 1)
                .linkOpacity(0.6)
                .linkDirectionalParticles(2)
                .linkDirectionalParticleSpeed(0.005)
                .linkDirectionalParticleWidth(2)
                .onNodeClick((node: any) => {
                    if (onNodeClick) {
                        onNodeClick(node as GraphNode);
                    }
                    // Focus on node
                    const distance = 100;
                    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
                    graph.cameraPosition(
                        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                        node,
                        2000
                    );
                })
                .onNodeHover((node: any) => {
                    setHoveredNode(node as GraphNode | null);
                    if (onNodeHover) {
                        onNodeHover(node as GraphNode | null);
                    }
                    container.style.cursor = node ? 'pointer' : 'default';
                });

            graphRef.current = graph;
        });

        // Cleanup
        return () => {
            if (graph && graph._destructor) {
                graph._destructor();
            }
        };
    }, [isClient, width, height, backgroundColor, graphData, onNodeClick, onNodeHover]);

    // Handle resize
    useEffect(() => {
        if (!graphRef.current || !containerRef.current) return;

        const handleResize = () => {
            if (!containerRef.current || !graphRef.current) return;
            const actualWidth = width ?? containerRef.current.clientWidth;
            const actualHeight = height ?? containerRef.current.clientHeight;
            graphRef.current.width(actualWidth).height(actualHeight);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [width, height]);

    // Toolbar actions
    const handleZoomIn = useCallback(() => {
        if (!graphRef.current) return;
        const camera = graphRef.current.cameraPosition();
        graphRef.current.cameraPosition(
            { x: camera.x * 0.8, y: camera.y * 0.8, z: camera.z * 0.8 },
            null,
            300
        );
    }, []);

    const handleZoomOut = useCallback(() => {
        if (!graphRef.current) return;
        const camera = graphRef.current.cameraPosition();
        graphRef.current.cameraPosition(
            { x: camera.x * 1.2, y: camera.y * 1.2, z: camera.z * 1.2 },
            null,
            300
        );
    }, []);

    const handleReset = useCallback(() => {
        if (!graphRef.current) return;
        graphRef.current.cameraPosition({ x: 0, y: 0, z: 300 }, null, 1000);
    }, []);

    const handleScreenshot = useCallback(() => {
        if (!graphRef.current) return;
        const dataUrl = graphRef.current.renderer().domElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'value-chain-3d.png';
        link.href = dataUrl;
        link.click();
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;

        if (!isFullscreen) {
            containerRef.current.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
        setIsFullscreen(!isFullscreen);
    }, [isFullscreen]);

    // Don't render on server
    if (!isClient) {
        return (
            <div
                className={cn(
                    'relative flex items-center justify-center bg-neutral-900 rounded-xl',
                    className
                )}
                style={{ width: width ?? '100%', height: height ?? 500 }}
            >
                <div className="text-neutral-400">Loading 3D visualization...</div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={cn('relative overflow-hidden rounded-xl', className)}
            style={{ width: width ?? '100%', height: height ?? 500 }}
        >
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
                        onClick={handleReset}
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        title="Reset view"
                    >
                        <RotateCcw className="h-4 w-4" />
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
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleFullscreen}
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        title="Fullscreen"
                    >
                        {isFullscreen ? (
                            <Minimize2 className="h-4 w-4" />
                        ) : (
                            <Maximize2 className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            )}

            {/* Hovered node info */}
            {hoveredNode && (
                <div className="absolute bottom-4 left-4 z-10 p-3 bg-black/70 backdrop-blur rounded-lg border border-white/10 text-white max-w-xs">
                    <div className="flex items-center gap-2 mb-1">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: hoveredNode.color }}
                        />
                        <span className="font-semibold">{hoveredNode.name}</span>
                    </div>
                    <div className="text-xs text-white/60 uppercase">{hoveredNode.type}</div>
                    {hoveredNode.description && (
                        <p className="text-xs text-white/80 mt-1">{hoveredNode.description}</p>
                    )}
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 right-4 z-10 p-2 bg-black/50 backdrop-blur rounded-lg border border-white/10">
                <div className="text-[10px] text-white/60 uppercase mb-1">Node Types</div>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(NODE_COLORS).map(([type, color]) => (
                        <div key={type} className="flex items-center gap-1">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-[10px] text-white/80 capitalize">{type}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Sample Data Helper
// ============================================================================

export function createSampleValueChainData(): { nodes: GraphNode[]; links: GraphLink[] } {
    const nodes: GraphNode[] = [
        // Departments
        { id: 'sales', name: 'Sales', type: 'department', description: 'Customer acquisition' },
        { id: 'operations', name: 'Operations', type: 'department', description: 'Service delivery' },
        { id: 'support', name: 'Support', type: 'department', description: 'Customer support' },

        // Processes
        { id: 'lead-gen', name: 'Lead Generation', type: 'process', description: 'Finding prospects' },
        { id: 'qualification', name: 'Lead Qualification', type: 'process', description: 'Scoring leads' },
        { id: 'closing', name: 'Deal Closing', type: 'process', description: 'Signing contracts' },
        { id: 'onboarding', name: 'Onboarding', type: 'process', description: 'New customer setup' },
        { id: 'fulfillment', name: 'Fulfillment', type: 'process', description: 'Service delivery' },
        { id: 'ticketing', name: 'Ticketing', type: 'process', description: 'Issue management' },

        // SOPs
        { id: 'sop-cold-call', name: 'Cold Calling SOP', type: 'sop' },
        { id: 'sop-demo', name: 'Demo SOP', type: 'sop' },
        { id: 'sop-contract', name: 'Contract SOP', type: 'sop' },
        { id: 'sop-ticket', name: 'Ticket Resolution SOP', type: 'sop' },

        // Agents
        { id: 'agent-henry', name: 'Henry', type: 'agent', description: 'Discovery Agent' },
        { id: 'agent-vantage', name: 'VantageOS', type: 'agent', description: 'Core Assistant' },

        // Integrations
        { id: 'int-crm', name: 'CRM', type: 'integration' },
        { id: 'int-email', name: 'Email', type: 'integration' },
        { id: 'int-calendar', name: 'Calendar', type: 'integration' },
    ];

    const links: GraphLink[] = [
        // Department to process
        { source: 'sales', target: 'lead-gen', type: 'contains' },
        { source: 'sales', target: 'qualification', type: 'contains' },
        { source: 'sales', target: 'closing', type: 'contains' },
        { source: 'operations', target: 'onboarding', type: 'contains' },
        { source: 'operations', target: 'fulfillment', type: 'contains' },
        { source: 'support', target: 'ticketing', type: 'contains' },

        // Process flow
        { source: 'lead-gen', target: 'qualification', type: 'triggers' },
        { source: 'qualification', target: 'closing', type: 'triggers' },
        { source: 'closing', target: 'onboarding', type: 'triggers' },
        { source: 'onboarding', target: 'fulfillment', type: 'triggers' },
        { source: 'fulfillment', target: 'ticketing', type: 'supports' },

        // SOP dependencies
        { source: 'sop-cold-call', target: 'lead-gen', type: 'supports' },
        { source: 'sop-demo', target: 'qualification', type: 'supports' },
        { source: 'sop-contract', target: 'closing', type: 'supports' },
        { source: 'sop-ticket', target: 'ticketing', type: 'supports' },

        // Agent support
        { source: 'agent-henry', target: 'lead-gen', type: 'supports' },
        { source: 'agent-henry', target: 'qualification', type: 'supports' },
        { source: 'agent-vantage', target: 'onboarding', type: 'supports' },

        // Integrations
        { source: 'int-crm', target: 'lead-gen', type: 'supports' },
        { source: 'int-crm', target: 'qualification', type: 'supports' },
        { source: 'int-email', target: 'lead-gen', type: 'supports' },
        { source: 'int-calendar', target: 'closing', type: 'supports' },
    ];

    return { nodes, links };
}
