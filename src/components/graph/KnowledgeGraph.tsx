'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Loader2, ZoomIn, ZoomOut, RotateCcw, FileText, Bot, Building2, GitBranch, Grid3x3, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { CytoscapeGraph } from './CytoscapeGraph';

// Dynamic import to avoid SSR issues with Three.js
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full w-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    ),
});

interface GraphNode {
    id: string;
    label: string;
    type: 'sop' | 'agent' | 'department' | 'process' | 'user' | 'ontology' | 'panda';
    color: string;
    url?: string;
    val?: number;
    x?: number;
    y?: number;
    z?: number;
}

interface GraphLink {
    source: string | GraphNode;
    target: string | GraphNode;
    label?: string;
    color?: string;
}

interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

// Obsidian-like color scheme
const NODE_COLORS: Record<string, string> = {
    sop: '#f59e0b',
    agent: '#6366f1', // indigo (was violet)
    department: '#3b82f6',
    process: '#10b981',
    user: '#8b5cf6',
    ontology: '#ec4899', // pink - słownik firmowy
};

const NODE_SIZES: Record<string, number> = {
    department: 12,
    sop: 6,
    agent: 8,
    process: 7,
    user: 5,
    ontology: 5,
};

export default function KnowledgeGraph3D() {
    const router = useRouter();
    const graphRef = useRef<any>(null);
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
    const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
    const [searchQuery, setSearchQuery] = useState('');

    const getNodeUrl = (id: string, type: string): string | undefined => {
        switch (type) {
            case 'sop': return `/sops/${id}`;
            case 'agent': return `/agents/${id}`;
            case 'process': return `/value-chain`;
            case 'ontology': return `/ontology`;
            default: return undefined;
        }
    };

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/graph');
                const data = await res.json();

                const nodes: GraphNode[] = [];
                const links: GraphLink[] = [];

                if (data.elements && data.elements.length > 0) {
                    data.elements?.forEach((el: any) => {
                        if (el.data.source && el.data.target) {
                            links.push({
                                source: el.data.source,
                                target: el.data.target,
                                label: el.data.label,
                                color: 'rgba(255,255,255,0.2)',
                            });
                        } else {
                            const type = el.data.type as GraphNode['type'];
                            nodes.push({
                                id: el.data.id,
                                label: el.data.label,
                                type,
                                color: NODE_COLORS[type] || '#666',
                                val: NODE_SIZES[type] || 5,
                                url: getNodeUrl(el.data.id, type),
                            });
                        }
                    });
                } else {
                    // Fallback sample data when DB is empty
                    const sampleNodes: GraphNode[] = [
                        { id: 'dept-1', label: 'Sprzedaż', type: 'department', color: NODE_COLORS.department, val: NODE_SIZES.department },
                        { id: 'dept-2', label: 'Marketing', type: 'department', color: NODE_COLORS.department, val: NODE_SIZES.department },
                        { id: 'dept-3', label: 'Operacje', type: 'department', color: NODE_COLORS.department, val: NODE_SIZES.department },
                        { id: 'sop-1', label: 'Onboarding Klienta', type: 'sop', color: NODE_COLORS.sop, val: NODE_SIZES.sop, url: '/sops' },
                        { id: 'sop-2', label: 'Lead Scoring', type: 'sop', color: NODE_COLORS.sop, val: NODE_SIZES.sop, url: '/sops' },
                        { id: 'sop-3', label: 'Follow-up Automatyczny', type: 'sop', color: NODE_COLORS.sop, val: NODE_SIZES.sop, url: '/sops' },
                        { id: 'agent-1', label: 'Sales AI', type: 'agent', color: NODE_COLORS.agent, val: NODE_SIZES.agent, url: '/agents' },
                        { id: 'agent-2', label: 'Marketing AI', type: 'agent', color: NODE_COLORS.agent, val: NODE_SIZES.agent, url: '/agents' },
                        { id: 'process-1', label: 'Generowanie Leadów', type: 'process', color: NODE_COLORS.process, val: NODE_SIZES.process, url: '/value-chain' },
                        { id: 'process-2', label: 'Konwersja', type: 'process', color: NODE_COLORS.process, val: NODE_SIZES.process, url: '/value-chain' },
                        { id: 'onto-1', label: 'Klient MSP', type: 'ontology', color: NODE_COLORS.ontology, val: NODE_SIZES.ontology, url: '/ontology' },
                        { id: 'onto-2', label: 'Audyt AI', type: 'ontology', color: NODE_COLORS.ontology, val: NODE_SIZES.ontology, url: '/ontology' },
                    ];
                    const sampleLinks: GraphLink[] = [
                        { source: 'sop-1', target: 'dept-1', label: 'należy do' },
                        { source: 'sop-2', target: 'dept-1', label: 'należy do' },
                        { source: 'sop-3', target: 'dept-2', label: 'należy do' },
                        { source: 'agent-1', target: 'sop-1', label: 'wykonuje' },
                        { source: 'agent-1', target: 'sop-2', label: 'wykonuje' },
                        { source: 'agent-2', target: 'sop-3', label: 'wykonuje' },
                        { source: 'process-1', target: 'dept-2', label: 'w dziale' },
                        { source: 'process-2', target: 'dept-1', label: 'w dziale' },
                        { source: 'onto-1', target: 'sop-1', label: 'dotyczy' },
                        { source: 'onto-2', target: 'process-1', label: 'dotyczy' },
                    ];
                    nodes.push(...sampleNodes);
                    links.push(...sampleLinks.map(l => ({ ...l, color: 'rgba(255,255,255,0.2)' })));
                }

                setGraphData({ nodes, links });
            } catch (err) {
                console.error('Failed to load graph data', err);
                // Set minimal fallback on error
                setGraphData({
                    nodes: [
                        { id: 'demo-1', label: 'Demo: Dodaj SOPs', type: 'sop', color: NODE_COLORS.sop, val: 8, url: '/sops/new' },
                        { id: 'demo-2', label: 'Demo: Dodaj Agentów', type: 'agent', color: NODE_COLORS.agent, val: 8, url: '/agents' },
                        { id: 'demo-3', label: 'Demo: Value Chain', type: 'process', color: NODE_COLORS.process, val: 8, url: '/value-chain' },
                    ],
                    links: [
                        { source: 'demo-1', target: 'demo-2', color: 'rgba(255,255,255,0.2)' },
                        { source: 'demo-2', target: 'demo-3', color: 'rgba(255,255,255,0.2)' },
                    ],
                });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Handle node click - navigate to document
    const handleNodeClick = useCallback((node: any) => {
        if (node?.url) {
            router.push(node.url);
        }
    }, [router]);

    // Zoom controls
    const handleZoomIn = () => {
        if (graphRef.current) {
            const distance = graphRef.current.cameraPosition().z;
            graphRef.current.cameraPosition({ z: distance * 0.7 }, null, 500);
        }
    };

    const handleZoomOut = () => {
        if (graphRef.current) {
            const distance = graphRef.current.cameraPosition().z;
            graphRef.current.cameraPosition({ z: distance * 1.5 }, null, 500);
        }
    };

    const handleReset = () => {
        if (graphRef.current) {
            graphRef.current.cameraPosition({ x: 0, y: 0, z: 300 }, null, 1000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Ładowanie grafu wiedzy...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[80vh] bg-background rounded-xl overflow-hidden border border-border shadow-2xl">
            {/* Controls */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
                <TooltipProvider>
                    {/* 2D/3D Toggle */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={viewMode === '2d' ? 'default' : 'secondary'}
                                size="icon"
                                onClick={() => setViewMode(prev => prev === '2d' ? '3d' : '2d')}
                            >
                                {viewMode === '2d' ? <Grid3x3 className="h-4 w-4" /> : <Box className="h-4 w-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{viewMode === '2d' ? 'Przełącz na 3D' : 'Przełącz na 2D'}</TooltipContent>
                    </Tooltip>
                    <div className="w-px bg-slate-600" />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="icon" onClick={handleZoomIn} disabled={viewMode === '2d'}>
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Przybliż</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="icon" onClick={handleZoomOut} disabled={viewMode === '2d'}>
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Oddal</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="icon" onClick={handleReset} disabled={viewMode === '2d'}>
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Resetuj widok</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Search Bar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Szukaj węzła..."
                    className="px-4 py-2 rounded-lg bg-card/90 backdrop-blur-sm border border-border text-sm text-foreground placeholder:text-muted-foreground w-64 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
            </div>

            {/* Legend */}
            <div className="absolute top-16 right-4 z-20 bg-card/90 backdrop-blur-sm border border-border p-3 rounded-lg text-xs space-y-2 shadow-lg">
                <div className="font-semibold mb-2 text-foreground">Legenda</div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-3 w-3 text-amber-500" />
                    <span>SOP (procedura)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Bot className="h-3 w-3 text-indigo-500" />
                    <span>Agent AI</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-3 w-3 text-blue-500" />
                    <span>Dział</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <GitBranch className="h-3 w-3 text-emerald-500" />
                    <span>Proces</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-3 w-3 rounded-full bg-pink-500" />
                    <span>Ontologia</span>
                </div>
                <div className="mt-3 pt-2 border-t border-border text-muted-foreground/60 text-[10px] space-y-1">
                    <div>Kliknij element aby otworzyć</div>
                    <div className="flex items-center gap-1">
                        <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">↑↓←→</kbd>
                        <span>Pan</span>
                        <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] ml-1">+/-</kbd>
                        <span>Zoom</span>
                    </div>
                </div>
            </div>

            {/* Hovered node tooltip */}
            {hoveredNode && (
                <div className="absolute bottom-4 left-4 z-20 bg-card/90 backdrop-blur-sm border border-border px-4 py-2 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: hoveredNode.color }}
                        />
                        <span className="font-medium text-foreground">{hoveredNode.label}</span>
                        <span className="text-xs text-muted-foreground capitalize">({hoveredNode.type})</span>
                    </div>
                    {hoveredNode.url && (
                        <div className="text-xs text-muted-foreground mt-1">Kliknij aby otworzyć →</div>
                    )}
                </div>
            )}

            {/* Graph View - 2D or 3D */}
            {viewMode === '2d' ? (
                <CytoscapeGraph
                    nodes={graphData.nodes}
                    links={graphData.links.map(link => ({
                        source: typeof link.source === 'string' ? link.source : link.source.id,
                        target: typeof link.target === 'string' ? link.target : link.target.id,
                        label: link.label,
                    }))}
                    onNodeHover={setHoveredNode}
                />
            ) : (
                <ForceGraph3D
                    ref={graphRef}
                    graphData={graphData}
                    nodeLabel={(node: any) => `${node.label} (${node.type})`}
                    nodeColor={(node: any) => {
                        if (searchQuery && !node.label?.toLowerCase().includes(searchQuery.toLowerCase())) {
                            return 'rgba(100,100,100,0.3)';
                        }
                        return node.color;
                    }}
                    nodeVal={(node: any) => node.val || 5}
                    nodeOpacity={0.9}
                    linkColor={(link: any) => {
                        const sourceNode = typeof link.source === 'object' ? link.source : graphData.nodes.find(n => n.id === link.source);
                        return sourceNode?.color ? sourceNode.color + '55' : 'rgba(255,255,255,0.15)';
                    }}
                    linkWidth={0.8}
                    linkOpacity={0.5}
                    backgroundColor="rgba(0,0,0,0)"
                    onNodeClick={handleNodeClick}
                    onNodeHover={(node: any) => setHoveredNode(node as GraphNode | null)}
                    enableNodeDrag={true}
                    enableNavigationControls={true}
                    showNavInfo={false}
                    warmupTicks={100}
                    cooldownTime={5000}
                    d3AlphaDecay={0.03}
                    d3VelocityDecay={0.4}
                />
            )}

            {/* Stats */}
            <div className="absolute bottom-4 right-4 z-20 text-xs text-muted-foreground">
                {graphData.nodes.length} elementów · {graphData.links.length} połączeń
            </div>
        </div>
    );
}
