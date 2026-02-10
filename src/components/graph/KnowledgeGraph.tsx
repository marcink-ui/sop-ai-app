'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Loader2, ZoomIn, ZoomOut, RotateCcw, FileText, Bot, Building2, GitBranch, Grid3x3, Box, AlertCircle, Plus, X, Tag, FolderTree, User, BookOpen, Eye, EyeOff, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MoveVertical } from 'lucide-react';
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
    type: 'sop' | 'agent' | 'department' | 'process' | 'user' | 'ontology' | 'tag' | 'category' | 'panda';
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
    agent: '#6366f1',
    department: '#3b82f6',
    process: '#10b981',
    user: '#8b5cf6',
    ontology: '#ec4899',
    tag: '#22c55e',
    category: '#f97316',
};

const NODE_SIZES: Record<string, number> = {
    department: 12,
    sop: 6,
    agent: 8,
    process: 7,
    user: 5,
    ontology: 5,
    tag: 4,
    category: 6,
};

export default function KnowledgeGraph3D() {
    const router = useRouter();
    const graphRef = useRef<any>(null);
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
    const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(Object.keys(NODE_COLORS)));
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

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
                }

                setGraphData({ nodes, links });
            } catch (err) {
                console.error('Failed to load graph data', err);
                setError('Nie udało się załadować grafu. Sprawdź połączenie z bazą danych.');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Handle node click - show detail panel or navigate
    const handleNodeClick = useCallback((node: any) => {
        setSelectedNode(node as GraphNode);
    }, []);

    const handleNavigate = useCallback((url: string) => {
        router.push(url);
    }, [router]);

    // Toggle a node type filter
    const toggleFilter = useCallback((type: string) => {
        setActiveFilters(prev => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            return next;
        });
    }, []);

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

    // Directional camera pan controls for 3D graph
    const panCamera = useCallback((dx: number, dy: number) => {
        if (!graphRef.current) return;
        const cam = graphRef.current.cameraPosition();
        graphRef.current.cameraPosition(
            { x: (cam.x || 0) + dx, y: (cam.y || 0) + dy, z: cam.z },
            null,
            300
        );
    }, []);

    const handlePanUp = useCallback(() => panCamera(0, 40), [panCamera]);
    const handlePanDown = useCallback(() => panCamera(0, -40), [panCamera]);
    const handlePanLeft = useCallback(() => panCamera(-40, 0), [panCamera]);
    const handlePanRight = useCallback(() => panCamera(40, 0), [panCamera]);

    // Filter pipeline: type filters → search query
    const filteredData = useMemo(() => {
        // Step 1: filter by active type toggles
        let nodes = graphData.nodes.filter(n => activeFilters.has(n.type));
        // Step 2: filter by search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            nodes = nodes.filter(n => n.label.toLowerCase().includes(q));
        }
        const nodeIds = new Set(nodes.map(n => n.id));
        return {
            nodes,
            links: graphData.links.filter(l => {
                const src = typeof l.source === 'string' ? l.source : l.source.id;
                const tgt = typeof l.target === 'string' ? l.target : l.target.id;
                return nodeIds.has(src) && nodeIds.has(tgt);
            }),
        };
    }, [graphData, searchQuery, activeFilters]);

    // Get connected nodes for detail panel
    const connectedNodes = useMemo(() => {
        if (!selectedNode) return [];
        const id = selectedNode.id;
        const connectedIds = new Set<string>();
        graphData.links.forEach(l => {
            const src = typeof l.source === 'string' ? l.source : l.source.id;
            const tgt = typeof l.target === 'string' ? l.target : l.target.id;
            if (src === id) connectedIds.add(tgt);
            if (tgt === id) connectedIds.add(src);
        });
        return graphData.nodes.filter(n => connectedIds.has(n.id));
    }, [selectedNode, graphData]);

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

    if (error) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <div className="text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                    <p className="text-muted-foreground">{error}</p>
                    <button onClick={() => window.location.reload()} className="text-sm text-primary hover:underline">
                        Spróbuj ponownie
                    </button>
                </div>
            </div>
        );
    }

    if (graphData.nodes.length === 0) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <div className="text-center space-y-6 max-w-md">
                    <div className="h-16 w-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                        <GitBranch className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Graf wiedzy jest pusty</h3>
                        <p className="text-sm text-muted-foreground">Dodaj procedury, agentów i działy, aby zobaczyć ich powiązania na grafie.</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => router.push('/sops/new')} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">
                            <Plus className="h-4 w-4" /> Dodaj SOP
                        </button>
                        <button onClick={() => router.push('/agents')} className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors">
                            <Bot className="h-4 w-4" /> Dodaj Agenta
                        </button>
                    </div>
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

            {/* Type Filter Toggles */}
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 flex gap-1 flex-wrap justify-center">
                {Object.entries(NODE_COLORS).map(([type, color]) => (
                    <button
                        key={type}
                        onClick={() => toggleFilter(type)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border transition-all ${activeFilters.has(type)
                            ? 'border-transparent text-white'
                            : 'border-border bg-card/60 text-muted-foreground opacity-50'
                            }`}
                        style={activeFilters.has(type) ? { backgroundColor: color } : {}}
                    >
                        {activeFilters.has(type) ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
                        {type}
                    </button>
                ))}
            </div>

            {/* Legend */}
            <div className="absolute top-16 right-4 z-20 bg-card/90 backdrop-blur-sm border border-border p-3 rounded-lg text-xs space-y-2 shadow-lg">
                <div className="font-semibold mb-2 text-foreground">Legenda</div>
                {[
                    { icon: <FileText className="h-3 w-3 text-amber-500" />, label: 'SOP (procedura)' },
                    { icon: <Bot className="h-3 w-3 text-indigo-500" />, label: 'Agent AI' },
                    { icon: <Building2 className="h-3 w-3 text-blue-500" />, label: 'Dział' },
                    { icon: <GitBranch className="h-3 w-3 text-emerald-500" />, label: 'Proces' },
                    { icon: <User className="h-3 w-3 text-violet-500" />, label: 'Użytkownik' },
                    { icon: <BookOpen className="h-3 w-3 text-pink-500" />, label: 'Ontologia' },
                    { icon: <Tag className="h-3 w-3 text-green-500" />, label: 'Tag' },
                    { icon: <FolderTree className="h-3 w-3 text-orange-500" />, label: 'Kategoria' },
                ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-muted-foreground">
                        {icon}
                        <span>{label}</span>
                    </div>
                ))}
                <div className="mt-3 pt-2 border-t border-border text-muted-foreground/60 text-[10px] space-y-1">
                    <div>Kliknij element aby zobaczyć szczegóły</div>
                    <div className="flex items-center gap-1">
                        <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">↑↓←→</kbd>
                        <span>Pan</span>
                        <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] ml-1">+/-</kbd>
                        <span>Zoom</span>
                    </div>
                </div>
            </div>

            {/* D-Pad directional controls (3D mode only) */}
            {viewMode === '3d' && (
                <div className="absolute bottom-6 right-6 z-20">
                    <div className="grid grid-cols-3 gap-0.5 w-[108px]">
                        <div />
                        <Button variant="secondary" size="icon" className="h-8 w-8" onClick={handlePanUp}>
                            <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <div />
                        <Button variant="secondary" size="icon" className="h-8 w-8" onClick={handlePanLeft}>
                            <ArrowLeft className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="secondary" size="icon" className="h-8 w-8" onClick={handleReset}>
                            <MoveVertical className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="secondary" size="icon" className="h-8 w-8" onClick={handlePanRight}>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                        <div />
                        <Button variant="secondary" size="icon" className="h-8 w-8" onClick={handlePanDown}>
                            <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                        <div />
                    </div>
                </div>
            )}

            {/* Hovered node tooltip */}
            {hoveredNode && !selectedNode && (
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
                        <div className="text-xs text-muted-foreground mt-1">Kliknij aby zobaczyć szczegóły →</div>
                    )}
                </div>
            )}

            {/* Node Detail Panel */}
            {selectedNode && (
                <div className="absolute bottom-4 left-4 z-30 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl w-80 max-h-[50vh] overflow-y-auto">
                    <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedNode.color }} />
                                <div>
                                    <div className="font-semibold text-foreground text-sm">{selectedNode.label}</div>
                                    <div className="text-xs text-muted-foreground capitalize">{selectedNode.type}</div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedNode(null)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {selectedNode.url && (
                            <button
                                onClick={() => handleNavigate(selectedNode.url!)}
                                className="w-full mb-3 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                Otwórz szczegóły →
                            </button>
                        )}

                        {connectedNodes.length > 0 && (
                            <div>
                                <div className="text-xs font-medium text-muted-foreground mb-2">
                                    Powiązane ({connectedNodes.length})
                                </div>
                                <div className="space-y-1">
                                    {connectedNodes.slice(0, 15).map(cn => (
                                        <button
                                            key={cn.id}
                                            onClick={() => setSelectedNode(cn)}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-left hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cn.color }} />
                                            <span className="truncate text-foreground">{cn.label}</span>
                                            <span className="text-muted-foreground capitalize ml-auto flex-shrink-0">{cn.type}</span>
                                        </button>
                                    ))}
                                    {connectedNodes.length > 15 && (
                                        <div className="text-xs text-muted-foreground text-center py-1">+{connectedNodes.length - 15} więcej</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {connectedNodes.length === 0 && (
                            <div className="text-xs text-muted-foreground text-center py-2">
                                Brak powiązań
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Graph View - 2D or 3D */}
            {viewMode === '2d' ? (
                <CytoscapeGraph
                    nodes={filteredData.nodes}
                    links={filteredData.links.map(link => ({
                        source: typeof link.source === 'string' ? link.source : link.source.id,
                        target: typeof link.target === 'string' ? link.target : link.target.id,
                        label: link.label,
                    }))}
                    onNodeHover={setHoveredNode}
                />
            ) : (
                <ForceGraph3D
                    ref={graphRef}
                    graphData={filteredData}
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
                {filteredData.nodes.length} elementów · {filteredData.links.length} połączeń
                {searchQuery && graphData.nodes.length !== filteredData.nodes.length && (
                    <span className="ml-1">(z {graphData.nodes.length})</span>
                )}
            </div>
        </div>
    );
}
