'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, AlertTriangle, Clock, Plus, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GapItem {
    nodeId: string;
    label: string;
    area: string;
    reason: 'missing' | 'deprecated' | 'stale';
}

interface GapData {
    totalNodes: number;
    coveredNodes: number;
    coveragePercent: number;
    gaps: {
        missing: GapItem[];
        deprecated: GapItem[];
        stale: GapItem[];
    };
}

interface SOPCoverageWidgetProps {
    mapId?: string | null;
    onCreateSOP?: (nodeId: string, label: string) => void;
}

const REASON_CONFIG = {
    missing: { label: 'Brak SOP', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    deprecated: { label: 'Wycofane', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    stale: { label: 'Nieaktualne (90+ dni)', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
};

export function SOPCoverageWidget({ mapId, onCreateSOP }: SOPCoverageWidgetProps) {
    const [data, setData] = useState<GapData | null>(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const fetchGaps = useCallback(async () => {
        if (!mapId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/value-chain/gaps?mapId=${mapId}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error('Failed to fetch gaps:', err);
        } finally {
            setLoading(false);
        }
    }, [mapId]);

    useEffect(() => {
        fetchGaps();
    }, [fetchGaps]);

    if (!mapId || loading || !data) return null;

    const totalGaps = data.gaps.missing.length + data.gaps.deprecated.length + data.gaps.stale.length;
    const coverageColor = data.coveragePercent >= 80 ? 'text-emerald-400' :
        data.coveragePercent >= 50 ? 'text-amber-400' : 'text-red-400';
    const progressColor = data.coveragePercent >= 80 ? 'bg-emerald-500' :
        data.coveragePercent >= 50 ? 'bg-amber-500' : 'bg-red-500';

    return (
        <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
            {/* Summary bar (always visible) */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-card/80 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 p-2 border border-emerald-500/20">
                        <Shield className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <span className={`text-xl font-bold ${coverageColor}`}>
                                {data.coveragePercent}%
                            </span>
                            <span className="text-sm text-muted-foreground">pokrycie SOP</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="w-32 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                <div className={`h-full rounded-full ${progressColor} transition-all`} style={{ width: `${data.coveragePercent}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {data.coveredNodes}/{data.totalNodes} nodes
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {totalGaps > 0 && (
                        <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                            {totalGaps} gaps
                        </span>
                    )}
                    {expanded ? <ChevronDown className="h-4 w-4 text-zinc-500" /> : <ChevronRight className="h-4 w-4 text-zinc-500" />}
                </div>
            </button>

            {/* Expanded gap details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border"
                    >
                        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                            {(Object.entries(data.gaps) as [keyof typeof REASON_CONFIG, GapItem[]][]).map(([reason, items]) => {
                                if (items.length === 0) return null;
                                const config = REASON_CONFIG[reason];
                                const Icon = config.icon;
                                const isOpen = expandedCategory === reason;

                                return (
                                    <div key={reason} className={`rounded-lg border ${config.bg} overflow-hidden`}>
                                        <button
                                            onClick={() => setExpandedCategory(isOpen ? null : reason)}
                                            className="w-full flex items-center justify-between px-3 py-2"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Icon className={`h-4 w-4 ${config.color}`} />
                                                <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                                                <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">{items.length}</span>
                                            </div>
                                            {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-zinc-500" /> : <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />}
                                        </button>

                                        {isOpen && (
                                            <div className="px-3 pb-2 space-y-1.5">
                                                {items.map((item) => (
                                                    <div key={item.nodeId} className="flex items-center justify-between py-1.5 px-2 rounded bg-zinc-900/50">
                                                        <div>
                                                            <span className="text-sm text-zinc-300">{item.label}</span>
                                                            {item.area && (
                                                                <span className="text-xs text-zinc-600 ml-2">{item.area}</span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onCreateSOP?.(item.nodeId, item.label);
                                                            }}
                                                            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                                                            title="Utwórz SOP"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            SOP
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {totalGaps === 0 && (
                                <div className="text-center py-6 text-sm text-zinc-500">
                                    <Shield className="h-8 w-8 mx-auto mb-2 text-emerald-500/50" />
                                    Pełne pokrycie — wszystkie nodes mają przypisane SOPy!
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
