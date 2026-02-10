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
    type: 'sop' | 'agent' | 'department' | 'process' | 'user' | 'ontology' | 'tag' | 'category' | 'panda';
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

// Professional color scheme (indigo-based, matching new globals.css)
const NODE_COLORS: Record<string, string> = {
    sop: '#f59e0b',      // amber
    agent: '#6366f1',     // indigo
    department: '#3b82f6', // blue
    process: '#10b981',   // emerald
    user: '#8b5cf6',      // violet
    ontology: '#ec4899',  // pink
    tag: '#22c55e',       // green
    category: '#f97316',  // orange
    panda: '#fbbf24',     // gold
};

const NODE_SIZES: Record<string, number> = {
    department: 42,
    sop: 30,
    agent: 34,
    process: 32,
    user: 26,
    ontology: 26,
    tag: 22,
    category: 28,
    panda: 22,
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

    // Keyboard navigation handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!cyRef.current) return;

            const panAmount = 50;
            const zoomAmount = 0.15;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    cyRef.current.panBy({ x: 0, y: panAmount });
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    cyRef.current.panBy({ x: 0, y: -panAmount });
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    cyRef.current.panBy({ x: panAmount, y: 0 });
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    cyRef.current.panBy({ x: -panAmount, y: 0 });
                    break;
                case '+':
                case '=':
                    e.preventDefault();
                    cyRef.current.zoom(cyRef.current.zoom() * (1 + zoomAmount));
                    break;
                case '-':
                    e.preventDefault();
                    cyRef.current.zoom(cyRef.current.zoom() * (1 - zoomAmount));
                    break;
                case '0':
                    e.preventDefault();
                    cyRef.current.fit(undefined, 50);
                    cyRef.current.center();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
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
                    size: NODE_SIZES[node.type] || 28,
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
                        'font-size': '9px',
                        'font-weight': 500,
                        'color': '#e2e8f0',
                        'text-valign': 'bottom',
                        'text-margin-y': 6,
                        'text-outline-color': '#0f172a',
                        'text-outline-width': 1.5,
                        'border-width': 2,
                        'border-color': '#334155',
                        'transition-property': 'border-color, border-width, background-opacity',
                        'transition-duration': 150,
                    } as cytoscape.Css.Node,
                },
                {
                    selector: 'node:hover',
                    style: {
                        'border-color': '#4f46e5',
                        'border-width': 3,
                    },
                },
                {
                    selector: 'node:selected',
                    style: {
                        'border-color': '#4f46e5',
                        'border-width': 4,
                        'background-opacity': 1,
                    },
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 1,
                        'line-color': 'rgba(148, 163, 184, 0.25)',
                        'curve-style': 'bezier',
                        'target-arrow-shape': 'triangle',
                        'target-arrow-color': 'rgba(148, 163, 184, 0.25)',
                        'arrow-scale': 0.5,
                    },
                },
                {
                    selector: 'edge:hover',
                    style: {
                        'line-color': 'rgba(148, 163, 184, 0.5)',
                        'target-arrow-color': 'rgba(148, 163, 184, 0.5)',
                    },
                },
            ],
            layout: {
                name: 'cola',
                animate: true,
                animationDuration: 800,
                nodeSpacing: 35,
                edgeLength: 120,
                randomize: false,
                avoidOverlap: true,
                handleDisconnected: true,
                infinite: false,
                fit: true,
                padding: 40,
            } as any,
            minZoom: 0.2,
            maxZoom: 3,
            wheelSensitivity: 0.25,
            // Disable auto-panning on hover - stabilize the view
            autoungrabify: false,
            autounselectify: false,
            boxSelectionEnabled: false,
            panningEnabled: true,
            userPanningEnabled: true,
            zoomingEnabled: true,
            userZoomingEnabled: true,
        });

        // Click event - navigate directly to element URL
        cyRef.current.on('tap', 'node', (event) => {
            const node = event.target;
            const url = node.data('url');
            if (url) {
                // Prevent any auto-centering or animation
                event.stopPropagation();
                router.push(url);
            }
        });

        // Hover events - stable, no auto-centering
        cyRef.current.on('mouseover', 'node', (event) => {
            const node = event.target;
            // Prevent graph from auto-centering/panning on hover
            event.stopPropagation();

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

        cyRef.current.on('mouseout', 'node', (event) => {
            event.stopPropagation();
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
            cyRef.current.zoom(cyRef.current.zoom() * 1.25);
        }
    }, []);

    const zoomOut = useCallback(() => {
        if (cyRef.current) {
            cyRef.current.zoom(cyRef.current.zoom() * 0.75);
        }
    }, []);

    const resetView = useCallback(() => {
        if (cyRef.current) {
            cyRef.current.fit(undefined, 40);
            cyRef.current.center();
        }
    }, []);

    // Expose methods via window for external controls
    useEffect(() => {
        (window as any).__cytoscapeControls = { zoomIn, zoomOut, resetView };
        return () => {
            delete (window as any).__cytoscapeControls;
        };
    }, [zoomIn, zoomOut, resetView]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 focus:outline-none"
            style={{ minHeight: '500px' }}
            tabIndex={0}
            aria-label="Graf wiedzy - użyj strzałek do nawigacji, +/- do zoomu, 0 do resetu"
        />
    );
}

export default CytoscapeGraph;
