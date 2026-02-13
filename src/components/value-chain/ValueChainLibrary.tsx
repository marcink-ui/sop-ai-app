'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, Loader2, GitBranch } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ValueChain {
    id: string;
    name: string;
    segment: string;
    stagesCount: number;
    automationRate: number;
}

interface ValueChainLibraryProps {
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export function ValueChainLibrary({ selectedId, onSelect }: ValueChainLibraryProps) {
    const [chains, setChains] = useState<ValueChain[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedSegments, setExpandedSegments] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchChains = async () => {
            try {
                const res = await fetch('/api/value-chain/maps');
                const data = await res.json();
                setChains(data.maps || []);

                // Auto-expand all segments initially
                const segments = new Set((data.maps || []).map((c: ValueChain) => c.segment || 'Nieprzypisany'));
                const expanded: Record<string, boolean> = {};
                segments.forEach(s => expanded[s as string] = true);
                setExpandedSegments(expanded);
            } catch (error) {
                console.error('Failed to fetch chains:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchChains();
    }, []);

    // Filter and group chains
    const filteredChains = chains.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.segment || '').toLowerCase().includes(search.toLowerCase())
    );

    const groupedChains = filteredChains.reduce((acc, chain) => {
        const seg = chain.segment || 'Nieprzypisany';
        if (!acc[seg]) acc[seg] = [];
        acc[seg].push(chain);
        return acc;
    }, {} as Record<string, ValueChain[]>);

    const toggleSegment = (segment: string) => {
        setExpandedSegments(prev => ({ ...prev, [segment]: !prev[segment] }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Search */}
            <div className="p-3 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 h-8 text-sm"
                    />
                </div>
            </div>

            {/* Chains List */}
            <div className="flex-1 overflow-y-auto">
                {Object.entries(groupedChains).length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        Brak łańcuchów wartości
                    </div>
                ) : (
                    Object.entries(groupedChains).map(([segment, segmentChains]) => (
                        <div key={segment}>
                            {/* Segment Header */}
                            <button
                                onClick={() => toggleSegment(segment)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/50 transition-colors"
                            >
                                {expandedSegments[segment] ? (
                                    <ChevronDown className="h-3 w-3" />
                                ) : (
                                    <ChevronRight className="h-3 w-3" />
                                )}
                                {segment}
                                <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                                    {segmentChains.length}
                                </Badge>
                            </button>

                            {/* Segment Chains */}
                            {expandedSegments[segment] && (
                                <div className="pb-1">
                                    {segmentChains.map(chain => (
                                        <button
                                            key={chain.id}
                                            onClick={() => onSelect(chain.id)}
                                            className={cn(
                                                "w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted/50 transition-colors text-left",
                                                selectedId === chain.id && "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-l-2 border-cyan-500"
                                            )}
                                        >
                                            <GitBranch className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                                            <span className="truncate flex-1">{chain.name}</span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {chain.stagesCount} etapów
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
