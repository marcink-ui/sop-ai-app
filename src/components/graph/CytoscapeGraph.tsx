'use client';

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import cytoscape, { Core } from 'cytoscape';
import cola from 'cytoscape-cola';
import { useRouter } from 'next/navigation';

// Register cola layout once
if (typeof window !== 'undefined') {
    try { cytoscape.use(cola); } catch { /* already registered */ }
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
    onNodeClick?: (node: GraphNode) => void;
}

// Color scheme
const NODE_COLORS: Record<string, string> = {
    sop: '#f59e0b',
    agent: '#6366f1',
    department: '#3b82f6',
    process: '#10b981',
    user: '#8b5cf6',
    ontology: '#ec4899',
    tag: '#22c55e',
    category: '#f97316',
    panda: '#fbbf24',
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

// Build URL for navigation — expanded to cover all modules
function getNodeUrl(id: string, type: string): string | undefined {
    switch (type) {
        case 'sop': return `/sops/${id}`;
        case 'agent': return `/agents/${id}`;
        case 'process': return `/value-chain`;
        case 'ontology': return `/ontology`;
        case 'user': return `/settings/profile`;
        case 'tag': return `/knowledge-graph`;
        case 'category': return `/knowledge-graph`;
        case 'department': return `/roles`;
        default: return undefined;
    }
}

export function CytoscapeGraph({ nodes, links, onNodeHover, onNodeClick }: CytoscapeGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cyRef = useRef<Core | null>(null);
    const routerRef = useRef(useRouter());
    const onNodeHoverRef = useRef(onNodeHover);
    const onNodeClickRef = useRef(onNodeClick);

    // Keep refs in sync without triggering re-renders
    useEffect(() => { onNodeHoverRef.current = onNodeHover; }, [onNodeHover]);
    useEffect(() => { onNodeClickRef.current = onNodeClick; }, [onNodeClick]);

    // Memoize elements to avoid unnecessary re-initialization
    const elements = useMemo(() => [
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
                id: `edge-${link.source}-${link.target}-${index}`,
                source: link.source,
                target: link.target,
                label: link.label || '',
            },
        })),
    ], [nodes, links]);

    // Keyboard navigation
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

    // Initialize Cytoscape — only when elements actually change
    useEffect(() => {
        if (!containerRef.current) return;

        // Destroy any existing instance
        if (cyRef.current) {
            cyRef.current.destroy();
            cyRef.current = null;
        }

        const cy = cytoscape({
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
                        'cursor-color': '#fff',
                        // Disable CSS transitions on node props to reduce lag
                    } as cytoscape.Css.Node,
                },
                {
                    selector: 'node:active',
                    style: {
                        'border-color': '#4f46e5',
                        'border-width': 4,
                        'overlay-opacity': 0,
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
            ],
            layout: {
                name: 'cola',
                animate: false,  // <-- Disable animation to prevent interaction lag
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
            autoungrabify: false,
            autounselectify: false,
            boxSelectionEnabled: false,
            panningEnabled: true,
            userPanningEnabled: true,
            zoomingEnabled: true,
            userZoomingEnabled: true,
        });

        cyRef.current = cy;

        // Click : open detail panel in parent component, or navigate
        cy.on('tap', 'node', (event) => {
            const node = event.target;
            const graphNode: GraphNode = {
                id: node.data('id'),
                label: node.data('label'),
                type: node.data('type'),
                color: node.data('color'),
                url: node.data('url'),
            };

            // If parent provided onNodeClick, use it (parent handles detail panel)
            if (onNodeClickRef.current) {
                onNodeClickRef.current(graphNode);
            } else if (graphNode.url) {
                // Fallback: navigate directly
                routerRef.current.push(graphNode.url);
            }
        });

        // Hover events — use refs to avoid re-initialization
        cy.on('mouseover', 'node', (event) => {
            const node = event.target;
            containerRef.current!.style.cursor = 'pointer';
            if (onNodeHoverRef.current) {
                onNodeHoverRef.current({
                    id: node.data('id'),
                    label: node.data('label'),
                    type: node.data('type'),
                    color: node.data('color'),
                    url: node.data('url'),
                });
            }
        });

        cy.on('mouseout', 'node', () => {
            containerRef.current!.style.cursor = 'default';
            if (onNodeHoverRef.current) {
                onNodeHoverRef.current(null);
            }
        });

        // Fit and center after layout completes
        cy.one('layoutstop', () => {
            cy.fit(undefined, 40);
            cy.center();
        });

        return () => {
            cy.destroy();
            cyRef.current = null;
        };
    }, [elements]);

    // Expose zoom controls
    const zoomIn = useCallback(() => {
        cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
    }, []);

    const zoomOut = useCallback(() => {
        cyRef.current?.zoom(cyRef.current.zoom() * 0.75);
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
        return () => { delete (window as any).__cytoscapeControls; };
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
