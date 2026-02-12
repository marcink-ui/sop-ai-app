'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import { motion } from 'framer-motion';
import { Node, Edge } from 'reactflow';
import {
    GitBranch,
    Plus,
    Layers,
    Bot,
    FileText,
    ArrowRightLeft,
    LayoutGrid,
    Map,
    Save,
    PanelLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ValueChainWhiteboard } from '@/components/value-chain/whiteboard';
import { ValueChainTable } from '@/components/value-chain/ValueChainTable';
import { ValueChainLibrary } from '@/components/value-chain/ValueChainLibrary';
import { AreaManager, Area } from '@/components/value-chain/AreaManager';
import { OptimizationPanel } from '@/components/value-chain/OptimizationPanel';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// ── Types ────────────────────────────────────────────
interface MapListItem {
    id: string;
    name: string;
    segment?: string;
    stats?: { stages: number; processes: number; agents: number; automation: number; areas: number; sops: number };
    updatedAt: string;
}

interface MapStats {
    stages: number;
    processes: number;
    agents: number;
    automation: number;
    areas: number;
    sops: number;
}

const EMPTY_STATS: MapStats = { stages: 0, processes: 0, agents: 0, automation: 0, areas: 0, sops: 0 };

export default function ValueChainPage() {
    const { data: session, isPending } = useSession();
    const [view, setView] = useState<'whiteboard' | 'list'>('whiteboard');
    const [libraryOpen, setLibraryOpen] = useState(true);

    // Map list (from DB)
    const [maps, setMaps] = useState<MapListItem[]>([]);
    const [mapsLoading, setMapsLoading] = useState(true);
    const [selectedMapId, setSelectedMapId] = useState<string | null>(null);

    // Current map data (from DB)
    const [currentNodes, setCurrentNodes] = useState<Node[]>([]);
    const [currentEdges, setCurrentEdges] = useState<Edge[]>([]);
    const [currentStats, setCurrentStats] = useState<MapStats>(EMPTY_STATS);
    const [areas, setAreas] = useState<Area[]>([]);
    const [mapLoading, setMapLoading] = useState(false);

    // Areas state
    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
    const [areasOpen, setAreasOpen] = useState(true);

    // Optimization panel state
    const [optimizationOpen, setOptimizationOpen] = useState(false);

    // Fullscreen mode
    const [isFullscreen, setIsFullscreen] = useState(false);

    // New Map dialog
    const [newMapDialogOpen, setNewMapDialogOpen] = useState(false);
    const [newMapName, setNewMapName] = useState('');
    const [newMapDescription, setNewMapDescription] = useState('');
    const [newMapSegment, setNewMapSegment] = useState('');
    const [creatingMap, setCreatingMap] = useState(false);

    // Auto-save
    const [saving, setSaving] = useState(false);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestDataRef = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null);

    // ── Load maps list ──────────────────────────────
    const loadMaps = useCallback(async () => {
        try {
            const res = await fetch('/api/value-chain/maps');
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setMaps(data.maps || []);
            // Auto-select first map if none selected
            if (!selectedMapId && data.maps?.length > 0) {
                setSelectedMapId(data.maps[0].id);
            }
        } catch (error) {
            console.error('Failed to load maps:', error);
        } finally {
            setMapsLoading(false);
        }
    }, [selectedMapId]);

    useEffect(() => {
        if (session) loadMaps();
    }, [session, loadMaps]);

    // ── Load selected map ───────────────────────────
    const loadMap = useCallback(async (mapId: string) => {
        setMapLoading(true);
        try {
            const res = await fetch(`/api/value-chain/maps/${mapId}`);
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setCurrentNodes(data.nodes || []);
            setCurrentEdges(data.edges || []);
            setCurrentStats(data.stats || EMPTY_STATS);
            setAreas(data.areas || []);
        } catch (error) {
            console.error('Failed to load map:', error);
            toast.error('Nie udało się załadować mapy');
        } finally {
            setMapLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedMapId) loadMap(selectedMapId);
    }, [selectedMapId, loadMap]);

    // ── Auto-save to DB (debounced 3s) ──────────────
    const saveToDb = useCallback(async () => {
        if (!selectedMapId || !latestDataRef.current) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/value-chain/maps/${selectedMapId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nodes: latestDataRef.current.nodes,
                    edges: latestDataRef.current.edges,
                }),
            });
            if (!res.ok) throw new Error('Save failed');
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setSaving(false);
        }
    }, [selectedMapId]);

    const handleWhiteboardChange = useCallback((nodes: Node[], edges: Edge[]) => {
        setCurrentNodes(nodes);
        setCurrentEdges(edges);
        latestDataRef.current = { nodes, edges };

        // Update live stats
        setCurrentStats({
            stages: nodes.filter(n => n.type === 'process').length,
            processes: nodes.length,
            agents: nodes.filter(n => n.data?.agentId).length,
            sops: nodes.filter(n => n.data?.sopId).length,
            automation: nodes.length > 0
                ? Math.round(nodes.reduce((sum, n) => sum + ((n.data?.automationPotential ?? 5) / 10) * 100, 0) / nodes.length)
                : 0,
            areas: areas.length,
        });

        // Debounced save
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            saveToDb();
        }, 3000);
    }, [saveToDb, areas.length]);

    // Manual save
    const handleManualSave = useCallback(async () => {
        if (!selectedMapId) return;
        latestDataRef.current = { nodes: currentNodes, edges: currentEdges };
        await saveToDb();
        toast.success('Mapa zapisana');
    }, [selectedMapId, currentNodes, currentEdges, saveToDb]);

    // ── Area CRUD handlers (via API) ────────────────
    const handleCreateArea = useCallback((data: Omit<Area, 'id' | 'order' | 'nodeCount'>) => {
        const newArea: Area = {
            ...data,
            id: `area-${Date.now()}`,
            order: areas.length,
            nodeCount: 0,
        };
        setAreas(prev => [...prev, newArea]);
        toast.success(`Obszar "${data.name}" utworzony`);
    }, [areas.length]);

    const handleUpdateArea = useCallback((id: string, updates: Partial<Area>) => {
        setAreas(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    }, []);

    const handleDeleteArea = useCallback((id: string) => {
        setAreas(prev => prev.filter(a => a.id !== id));
        if (selectedAreaId === id) setSelectedAreaId(null);
        toast.success('Obszar usunięty');
    }, [selectedAreaId]);

    // ── Create new map ──────────────────────────────
    const handleCreateMap = async () => {
        if (!newMapName.trim()) {
            toast.error('Podaj nazwę mapy');
            return;
        }
        setCreatingMap(true);
        try {
            const res = await fetch('/api/value-chain/maps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newMapName.trim(),
                    description: newMapDescription.trim() || null,
                    segment: newMapSegment || null,
                }),
            });
            if (!res.ok) throw new Error('Failed to create map');
            const data = await res.json();
            toast.success(`Mapa "${data.name}" została utworzona`);
            setNewMapDialogOpen(false);
            setNewMapName('');
            setNewMapDescription('');
            setNewMapSegment('');
            // Reload maps and select the new one
            await loadMaps();
            setSelectedMapId(data.id);
            setView('whiteboard');
        } catch (error) {
            console.error('Failed to create map:', error);
            toast.error('Nie udało się utworzyć mapy');
        } finally {
            setCreatingMap(false);
        }
    };

    const openNewMapDialog = useCallback(() => {
        setNewMapDialogOpen(true);
    }, []);

    // ── Map selection from library ──────────────────
    const handleSelectMap = useCallback((mapId: string) => {
        setSelectedMapId(mapId);
        setView('whiteboard');
    }, []);

    // ── Loading states ──────────────────────────────
    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
            </div>
        );
    }

    if (!session) {
        redirect('/auth/login');
    }

    // Find selected map name
    const selectedMap = maps.find(m => m.id === selectedMapId);

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4 overflow-auto' : 'space-y-6'}`}>
            {/* Fullscreen floating bar */}
            {isFullscreen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-4 right-4 z-[60] flex items-center gap-2"
                >
                    {saving && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Zapisywanie...
                        </span>
                    )}
                    <Button
                        variant="outline"
                        size="icon"
                        className="bg-card/90 backdrop-blur-sm border-border shadow-lg"
                        onClick={() => setIsFullscreen(false)}
                    >
                        <Minimize2 className="h-4 w-4" />
                    </Button>
                </motion.div>
            )}

            {/* Header */}
            {!isFullscreen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-3 border border-cyan-500/20">
                            <GitBranch className="h-6 w-6 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Łańcuch Wartości</h1>
                            <p className="text-sm text-muted-foreground">
                                {selectedMap ? selectedMap.name : 'Wybierz mapę z biblioteki'}
                                {saving && <span className="ml-2 text-xs text-cyan-400">• zapisywanie...</span>}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* View Toggle */}
                        <div className="flex items-center rounded-lg border border-border bg-card/50 p-1">
                            <button
                                onClick={() => setView('whiteboard')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${view === 'whiteboard'
                                    ? 'bg-cyan-500/20 text-cyan-400'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Map className="h-4 w-4" />
                                Whiteboard
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${view === 'list'
                                    ? 'bg-cyan-500/20 text-cyan-400'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <LayoutGrid className="h-4 w-4" />
                                Lista
                            </button>
                        </div>

                        {/* Save Button */}
                        {view === 'whiteboard' && selectedMapId && currentNodes.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={handleManualSave}
                                disabled={saving}
                                className="gap-2"
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Zapisz
                            </Button>
                        )}

                        <Button
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                            onClick={() => setNewMapDialogOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Nowa Mapa
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsFullscreen(true)}
                            title="Fullscreen"
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Stats (from real data) */}
            {!isFullscreen && selectedMapId && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid gap-4 md:grid-cols-5"
                >
                    <div className="rounded-xl border border-border bg-card/50 p-4 hover:border-cyan-500/30 transition-colors">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Layers className="h-4 w-4" />
                            <span className="text-sm">Etapy</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-foreground">{currentStats.stages}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card/50 p-4 hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">Procesy</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-foreground">{currentStats.processes}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card/50 p-4 hover:border-purple-500/30 transition-colors">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Bot className="h-4 w-4" />
                            <span className="text-sm">Agenci AI</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-purple-400">{currentStats.agents}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card/50 p-4 hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <ArrowRightLeft className="h-4 w-4" />
                            <span className="text-sm">Automatyzacja</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-emerald-400">{currentStats.automation}%</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card/50 p-4 hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Layers className="h-4 w-4" />
                            <span className="text-sm">Obszary</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-indigo-400">{currentStats.areas}</p>
                    </div>
                </motion.div>
            )}

            {/* Content */}
            {view === 'whiteboard' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex gap-4"
                >
                    {/* Library Panel */}
                    {libraryOpen && (
                        <div className="w-64 flex-shrink-0 rounded-lg border border-border bg-card/50 overflow-hidden flex flex-col max-h-[calc(100vh-280px)]">
                            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
                                <span className="text-sm font-medium">Biblioteka</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setLibraryOpen(false)}
                                >
                                    <PanelLeft className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <ValueChainLibrary
                                    selectedId={selectedMapId}
                                    onSelect={handleSelectMap}
                                />
                            </div>
                            {/* Areas Section */}
                            <div className="border-t border-border">
                                <AreaManager
                                    areas={areas}
                                    selectedAreaId={selectedAreaId}
                                    onSelectArea={setSelectedAreaId}
                                    onCreateArea={handleCreateArea}
                                    onUpdateArea={handleUpdateArea}
                                    onDeleteArea={handleDeleteArea}
                                    isOpen={areasOpen}
                                    onToggle={() => setAreasOpen(!areasOpen)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Whiteboard */}
                    <div className="flex-1 min-w-0">
                        {!libraryOpen && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="mb-2"
                                onClick={() => setLibraryOpen(true)}
                            >
                                <PanelLeft className="h-4 w-4 mr-2" />
                                Biblioteka
                            </Button>
                        )}
                        {mapLoading ? (
                            <div className="flex items-center justify-center h-[calc(100vh-300px)] rounded-xl border border-border bg-card/50">
                                <div className="text-center space-y-3">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-500" />
                                    <p className="text-sm text-muted-foreground">Ładowanie mapy...</p>
                                </div>
                            </div>
                        ) : !selectedMapId ? (
                            <div className="flex items-center justify-center h-[calc(100vh-300px)] rounded-xl border border-dashed border-border bg-card/50">
                                <div className="text-center space-y-4">
                                    <Map className="h-12 w-12 mx-auto text-muted-foreground/50" />
                                    <div>
                                        <h3 className="font-medium text-lg">Wybierz lub utwórz mapę</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Wybierz mapę z biblioteki po lewej lub utwórz nową
                                        </p>
                                    </div>
                                    <Button
                                        className="bg-gradient-to-r from-cyan-600 to-blue-600"
                                        onClick={() => setNewMapDialogOpen(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Nowa Mapa
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <ValueChainWhiteboard
                                key={selectedMapId}
                                mapId={selectedMapId}
                                initialNodes={currentNodes}
                                initialEdges={currentEdges}
                                onSave={handleWhiteboardChange}
                                onOpenOptimization={() => setOptimizationOpen(!optimizationOpen)}
                            />
                        )}
                    </div>
                </motion.div>
            )}

            {view === 'list' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl border border-border bg-card/50 p-6"
                >
                    <ValueChainTable onCreateNew={openNewMapDialog} />
                </motion.div>
            )}

            {/* Legend */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-6 text-sm text-muted-foreground"
            >
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500" />
                    <span>Proces</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-500" />
                    <span>SOP</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-purple-500" />
                    <span>Agent</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-amber-500" />
                    <span>Decyzja</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm border-2 border-cyan-500 bg-transparent" />
                    <span>Handoff</span>
                </div>
            </motion.div>

            {/* New Map Dialog */}
            <Dialog open={newMapDialogOpen} onOpenChange={setNewMapDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nowa Mapa Łańcucha Wartości</DialogTitle>
                        <DialogDescription>
                            Utwórz nową mapę procesów. Możesz ją wypełnić elementami z Whiteboard.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="map-name">Nazwa *</Label>
                            <Input
                                id="map-name"
                                placeholder="np. Łańcuch wartości — Sprzedaż B2B"
                                value={newMapName}
                                onChange={(e) => setNewMapName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="map-desc">Opis</Label>
                            <Textarea
                                id="map-desc"
                                placeholder="Krótki opis mapy procesów..."
                                value={newMapDescription}
                                onChange={(e) => setNewMapDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="map-segment">Segment</Label>
                            <Select value={newMapSegment} onValueChange={setNewMapSegment}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Wybierz segment..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="B2B">B2B</SelectItem>
                                    <SelectItem value="B2C">B2C</SelectItem>
                                    <SelectItem value="MSP">MSP</SelectItem>
                                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                                    <SelectItem value="SMB">SMB</SelectItem>
                                    <SelectItem value="Internal">Wewnętrzny</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNewMapDialogOpen(false)}>
                            Anuluj
                        </Button>
                        <Button onClick={handleCreateMap} disabled={creatingMap}>
                            {creatingMap ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4 mr-2" />
                            )}
                            Utwórz
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Optimization Panel */}
            <OptimizationPanel
                nodes={currentNodes}
                areas={areas}
                isOpen={optimizationOpen}
                onToggle={() => setOptimizationOpen(false)}
            />
        </div>
    );
}
