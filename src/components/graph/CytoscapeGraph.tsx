'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import cytoscape, { Core, NodeSingular } from 'cytoscape';
import cola from 'cytoscape-cola';
import { useRouter } from 'next/navigation';

// Register cola layout
if (typeof window !== 'undefined') {
    cytoscape.use(cola);
}

interface GraphNode {
    id: string;
    label: string;
    type: 'sop' | 'agent' | 'department' | 'process' | 'user' | 'ontology' | 'panda';
    color: string;
    url?: string;
}

interface GraphLink {
    source: string;
    target: string;
    label?: string;
}

interface CytoscapeGraphProps {
    nodes: GraphNode[];
    links: GraphLink[];
    onNodeHover?: (node: GraphNode | null) => void;
}

// Obsidian-like color scheme
const NODE_COLORS: Record<string, string> = {
    sop: '#f59e0b',
    agent: '#8b5cf6',
    department: '#3b82f6',
    process: '#10b981',
    user: '#6366f1',
    ontology: '#ec4899',
    panda: '#fbbf24', // Gold for panda transactions
};

const NODE_SIZES: Record<string, number> = {
    department: 50,
    sop: 35,
    agent: 40,
    process: 38,
    user: 30,
    ontology: 30,
    panda: 25,
};

export function CytoscapeGraph({ nodes, links, onNodeHover }: CytoscapeGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cyRef = useRef<Core | null>(null);
    const router = useRouter();

    // Build URL for navigation
    const getNodeUrl = useCallback((id: string, type: string): string | undefined => {
        switch (type) {
            case 'sop': return `/sops/${id}`;
            case 'agent': return `/agents/${id}`;
            case 'process': return `/value-chain`;
            case 'ontology': return `/ontology`;
            default: return undefined;
        }
    }, []);

    // Initialize Cytoscape
    useEffect(() => {
        if (!containerRef.current) return;

        // Convert data to Cytoscape format
        const elements = [
            ...nodes.map(node => ({
                data: {
                    id: node.id,
                    label: node.label,
                    type: node.type,
                    color: NODE_COLORS[node.type] || '#666',
                    size: NODE_SIZES[node.type] || 30,
                    url: getNodeUrl(node.id, node.type),
                },
            })),
            ...links.map((link, index) => ({
                data: {
                    id: `edge-${index}`,
                    source: link.source,
                    target: link.target,
                    label: link.label || '',
                },
            })),
        ];

        // Create Cytoscape instance
        cyRef.current = cytoscape({
            container: containerRef.current,
            elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': 'data(color)',
                        'label': 'data(label)',
                        'width': 'data(size)',
                        'height': 'data(size)',
                        'font-size': '10px',
                        'color': '#e2e8f0',
                        'text-valign': 'bottom',
                        'text-margin-y': 8,
                        'text-outline-color': '#0f172a',
                        'text-outline-width': 2,
                        'border-width': 2,
                        'border-color': '#334155',
                        'transition-property': 'border-color, border-width',
                        'transition-duration': 200,
                    },
                },
                {
                    selector: 'node:hover',
                    style: {
                        'border-color': '#fff',
                        'border-width': 3,
                    },
                },
                {
                    selector: 'node:selected',
                    style: {
                        'border-color': '#3b82f6',
                        'border-width': 4,
                    },
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 1,
                        'line-color': 'rgba(148, 163, 184, 0.3)',
                        'curve-style': 'bezier',
                        'target-arrow-shape': 'triangle',
                        'target-arrow-color': 'rgba(148, 163, 184, 0.3)',
                        'arrow-scale': 0.6,
                    },
                },
                {
                    selector: 'edge:hover',
                    style: {
                        'line-color': 'rgba(148, 163, 184, 0.6)',
                        'target-arrow-color': 'rgba(148, 163, 184, 0.6)',
                    },
                },
            ],
            layout: {
                name: 'cola',
                animate: true,
                animationDuration: 1000,
                nodeSpacing: 40,
                edgeLength: 150,
                randomize: false,
                avoidOverlap: true,
                handleDisconnected: true,
                infinite: false,
                fit: true,
                padding: 50,
            } as any,
            minZoom: 0.2,
            maxZoom: 3,
            wheelSensitivity: 0.3,
        });

        // Event handlers
        cyRef.current.on('tap', 'node', (event) => {
            const node = event.target;
            const url = node.data('url');
            if (url) {
                router.push(url);
            }
        });

        cyRef.current.on('mouseover', 'node', (event) => {
            const node = event.target;
            if (onNodeHover) {
                onNodeHover({
                    id: node.data('id'),
                    label: node.data('label'),
                    type: node.data('type'),
                    color: node.data('color'),
                    url: node.data('url'),
                });
            }
        });

        cyRef.current.on('mouseout', 'node', () => {
            if (onNodeHover) {
                onNodeHover(null);
            }
        });

        // Cleanup
        return () => {
            if (cyRef.current) {
                cyRef.current.destroy();
            }
        };
    }, [nodes, links, router, onNodeHover, getNodeUrl]);

    // Expose zoom controls
    const zoomIn = useCallback(() => {
        if (cyRef.current) {
            cyRef.current.zoom(cyRef.current.zoom() * 1.3);
        }
    }, []);

    const zoomOut = useCallback(() => {
        if (cyRef.current) {
            cyRef.current.zoom(cyRef.current.zoom() * 0.7);
        }
    }, []);

    const resetView = useCallback(() => {
        if (cyRef.current) {
            cyRef.current.fit(undefined, 50);
            cyRef.current.center();
        }
    }, []);

    // Expose methods via ref (optional)
    useEffect(() => {
        (window as any).__cytoscapeControls = { zoomIn, zoomOut, resetView };
        return () => {
            delete (window as any).__cytoscapeControls;
        };
    }, [zoomIn, zoomOut, resetView]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
            style={{ minHeight: '500px' }}
        />
    );
}

export default CytoscapeGraph;
