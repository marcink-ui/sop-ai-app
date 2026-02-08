'use client';

import { useState, useMemo } from 'react';
import { ForceGraph3D, createSampleValueChainData, GraphNode } from '@/components/visualizations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Box,
    Layers,
    Network,
    Info,
    Filter,
    RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

export default function ValueChain3DViewPage() {
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    // Get sample data (in real app, fetch from API)
    const rawData = useMemo(() => createSampleValueChainData(), []);

    // Apply filters
    const graphData = useMemo(() => {
        if (activeFilters.length === 0) return rawData;

        const filteredNodes = rawData.nodes.filter(
            node => activeFilters.includes(node.type)
        );
        const nodeIds = new Set(filteredNodes.map(n => n.id));
        const filteredLinks = rawData.links.filter(
            link => nodeIds.has(link.source as string) && nodeIds.has(link.target as string)
        );

        return { nodes: filteredNodes, links: filteredLinks };
    }, [rawData, activeFilters]);

    const toggleFilter = (type: string) => {
        setActiveFilters(prev =>
            prev.includes(type)
                ? prev.filter(f => f !== type)
                : [...prev, type]
        );
    };

    const nodeTypes = ['department', 'process', 'sop', 'agent', 'integration'];

    return (
        <div className="flex flex-col h-screen bg-neutral-950">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <Link href="/value-chain">
                        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Network className="h-5 w-5 text-purple-400" />
                            Value Chain 3D View
                        </h1>
                        <p className="text-sm text-white/60">
                            Interactive visualization of business processes
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white/80"
                        onClick={() => setActiveFilters([])}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset Filters
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-80 border-r border-white/10 p-4 flex flex-col gap-4 overflow-y-auto">
                    {/* Filters */}
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader className="py-3">
                            <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                                <Filter className="h-4 w-4 text-purple-400" />
                                Filter by Type
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                            <div className="flex flex-wrap gap-2">
                                {nodeTypes.map(type => (
                                    <Badge
                                        key={type}
                                        variant={activeFilters.includes(type) ? 'default' : 'outline'}
                                        className={`cursor-pointer capitalize transition-all ${activeFilters.includes(type)
                                                ? 'bg-purple-600 hover:bg-purple-700'
                                                : 'border-white/20 text-white/60 hover:text-white hover:border-white/40'
                                            }`}
                                        onClick={() => toggleFilter(type)}
                                    >
                                        {type}
                                    </Badge>
                                ))}
                            </div>
                            {activeFilters.length > 0 && (
                                <p className="text-xs text-white/40 mt-2">
                                    Showing {graphData.nodes.length} nodes, {graphData.links.length} links
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Selected Node Info */}
                    {selectedNode ? (
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="py-3">
                                <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                                    <Box className="h-4 w-4 text-blue-400" />
                                    Selected Node
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="py-2 space-y-3">
                                <div>
                                    <p className="text-white font-medium">{selectedNode.name}</p>
                                    <Badge variant="outline" className="capitalize text-xs border-white/20 text-white/60">
                                        {selectedNode.type}
                                    </Badge>
                                </div>
                                {selectedNode.description && (
                                    <p className="text-sm text-white/60">{selectedNode.description}</p>
                                )}
                                <div className="text-xs text-white/40">
                                    ID: {selectedNode.id}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="py-6 text-center">
                                <Info className="h-8 w-8 text-white/20 mx-auto mb-2" />
                                <p className="text-sm text-white/40">
                                    Click on a node to view details
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Stats */}
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader className="py-3">
                            <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                                <Layers className="h-4 w-4 text-emerald-400" />
                                Graph Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-2xl font-bold text-white">{rawData.nodes.length}</p>
                                    <p className="text-white/40">Total Nodes</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{rawData.links.length}</p>
                                    <p className="text-white/40">Total Links</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Help */}
                    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                        <CardContent className="py-4">
                            <h4 className="font-medium text-white mb-2">🎮 Controls</h4>
                            <ul className="text-xs text-white/60 space-y-1">
                                <li>• <strong>Rotate:</strong> Left-click + drag</li>
                                <li>• <strong>Zoom:</strong> Scroll or toolbar</li>
                                <li>• <strong>Pan:</strong> Right-click + drag</li>
                                <li>• <strong>Select:</strong> Click on node</li>
                            </ul>
                        </CardContent>
                    </Card>
                </aside>

                {/* Graph Area */}
                <main className="flex-1 relative">
                    <ForceGraph3D
                        nodes={graphData.nodes}
                        links={graphData.links}
                        onNodeClick={setSelectedNode}
                        className="w-full h-full"
                    />
                </main>
            </div>
        </div>
    );
}
