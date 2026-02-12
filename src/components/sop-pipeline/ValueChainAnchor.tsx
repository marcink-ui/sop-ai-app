'use client';

import { useState, useEffect } from 'react';
import { GitBranch, Link2, Search, Plus, Check, X, Loader2 } from 'lucide-react';

interface ValueChainNode {
    id: string;
    label: string;
    type: string;
    area?: { name: string } | null;
}

interface ValueChainAnchorProps {
    sopId: string;
    currentNodeId?: string | null;
    onLink?: (nodeId: string) => void;
    onUnlink?: () => void;
}

export function ValueChainAnchor({ sopId, currentNodeId, onLink, onUnlink }: ValueChainAnchorProps) {
    const [nodes, setNodes] = useState<ValueChainNode[]>([]);
    const [selectedNode, setSelectedNode] = useState<ValueChainNode | null>(null);
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch available nodes
    useEffect(() => {
        const fetchNodes = async () => {
            try {
                const res = await fetch('/api/value-chain?format=nodes');
                if (res.ok) {
                    const data = await res.json();
                    setNodes(data.nodes || []);
                    if (currentNodeId) {
                        const current = (data.nodes || []).find((n: ValueChainNode) => n.id === currentNodeId);
                        if (current) setSelectedNode(current);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch value chain nodes:', err);
            }
        };
        fetchNodes();
    }, [currentNodeId]);

    const filteredNodes = nodes.filter(n =>
        n.label.toLowerCase().includes(search.toLowerCase()) ||
        n.area?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleLink = async (node: ValueChainNode) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/sops/${sopId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ valueChainNodeId: node.id }),
            });
            if (res.ok) {
                setSelectedNode(node);
                setIsOpen(false);
                onLink?.(node.id);
            }
        } catch (err) {
            console.error('Failed to link value chain node:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlink = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/sops/${sopId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ valueChainNodeId: null }),
            });
            if (res.ok) {
                setSelectedNode(null);
                onUnlink?.();
            }
        } catch (err) {
            console.error('Failed to unlink:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-purple-400" />
                    Łańcuch Wartości
                </h4>
                {!selectedNode && (
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" /> Powiąż
                    </button>
                )}
            </div>

            {/* Current link */}
            {selectedNode && (
                <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-purple-400" />
                        <div>
                            <span className="text-sm font-medium text-purple-300">{selectedNode.label}</span>
                            {selectedNode.area && (
                                <span className="text-xs text-zinc-500 ml-2">{selectedNode.area.name}</span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleUnlink}
                        disabled={loading}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    </button>
                </div>
            )}

            {/* Node selector */}
            {isOpen && !selectedNode && (
                <div className="mt-2 space-y-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Szukaj node..."
                            className="w-full pl-8 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                        />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                        {filteredNodes.map(node => (
                            <button
                                key={node.id}
                                onClick={() => handleLink(node)}
                                disabled={loading}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-between group"
                            >
                                <div>
                                    <span className="text-sm text-zinc-300">{node.label}</span>
                                    <span className="text-xs text-zinc-500 ml-2">{node.type}</span>
                                    {node.area && (
                                        <span className="text-xs text-zinc-600 ml-1">• {node.area.name}</span>
                                    )}
                                </div>
                                <Check className="w-3.5 h-3.5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                        {filteredNodes.length === 0 && (
                            <p className="text-xs text-zinc-500 py-4 text-center">Brak nodes do wyświetlenia</p>
                        )}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!selectedNode && !isOpen && (
                <p className="text-xs text-zinc-500">
                    SOP nie jest powiązany z żadnym node łańcucha wartości.
                </p>
            )}
        </div>
    );
}
