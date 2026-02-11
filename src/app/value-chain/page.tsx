'use client';

import { useState, useCallback } from 'react';
import { Loader2, Maximize2, Minimize2, Sparkles, X, Lightbulb, Send, ChevronRight } from 'lucide-react';
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
    GitCompare,
    Save,
    Download,
    Trash2,
    PanelLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ValueChainWhiteboard } from '@/components/value-chain/whiteboard';
import { ComparisonView } from '@/components/value-chain/comparison-view';
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

// Stats from sample data
const stats = {
    stages: 5,
    processes: 17,
    automation: 52,
    agents: 3,
    areas: 4,
};

// Sample areas for demo
const SAMPLE_AREAS: Area[] = [
    { id: 'area-1', name: 'Marketing', color: '#3B82F6', icon: 'Users', order: 0, nodeCount: 3 },
    { id: 'area-2', name: 'Sprzedaż', color: '#22C55E', icon: 'Banknote', order: 1, nodeCount: 5 },
    { id: 'area-3', name: 'Produkcja', color: '#F59E0B', icon: 'Factory', order: 2, nodeCount: 6 },
    { id: 'area-4', name: 'IT & Automatyzacja', color: '#A855F7', icon: 'Code2', order: 3, nodeCount: 3 },
];

interface WorkflowSnapshot {
    id: string;
    name: string;
    nodes: Node[];
    edges: Edge[];
    createdAt: Date;
}

export default function ValueChainPage() {
    const { data: session, isPending } = useSession();
    const [view, setView] = useState<'whiteboard' | 'list' | 'compare'>('whiteboard');
    const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
    const [libraryOpen, setLibraryOpen] = useState(true);
    const [snapshots, setSnapshots] = useState<WorkflowSnapshot[]>([]);
    const [currentNodes, setCurrentNodes] = useState<Node[]>([]);
    const [currentEdges, setCurrentEdges] = useState<Edge[]>([]);

    // Comparison state
    const [workflowA, setWorkflowA] = useState<WorkflowSnapshot | null>(null);
    const [workflowB, setWorkflowB] = useState<WorkflowSnapshot | null>(null);
    const [selectingSlot, setSelectingSlot] = useState<'A' | 'B' | null>(null);

    // Save dialog
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [snapshotName, setSnapshotName] = useState('');

    // New Map dialog
    const [newMapDialogOpen, setNewMapDialogOpen] = useState(false);
    const [newMapName, setNewMapName] = useState('');
    const [newMapDescription, setNewMapDescription] = useState('');
    const [newMapSegment, setNewMapSegment] = useState('');
    const [creatingMap, setCreatingMap] = useState(false);

    // Areas state
    const [areas, setAreas] = useState<Area[]>(SAMPLE_AREAS);
    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
    const [areasOpen, setAreasOpen] = useState(true);

    // Optimization panel state
    const [optimizationOpen, setOptimizationOpen] = useState(false);

    // Fullscreen mode
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Agent assistant panel
    const [agentPanelOpen, setAgentPanelOpen] = useState(false);
    const [agentMessages, setAgentMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
    const [agentInput, setAgentInput] = useState('');
    const [agentSuggestions] = useState([
        { icon: '📋', text: 'Brakujący SOP w etapie "Lead Qualification"', action: 'request-sop', stage: 'Lead Qualification' },
        { icon: '🤖', text: 'Dodaj agenta AI do procesu "Nurture Campaign"', action: 'request-agent', stage: 'Nurture Campaign' },
        { icon: '⚠️', text: 'MUDA wykryta: przekazanie Sales→Support bez SOP', action: 'fix-muda', stage: 'Handoff' },
        { icon: '🔗', text: 'Automatyzuj połączenie między Lead Gen a Qualification', action: 'automate', stage: 'Connection' },
    ]);
    const [processingAgent, setProcessingAgent] = useState(false);

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

    const handleSave = useCallback((nodes: Node[], edges: Edge[]) => {
        setCurrentNodes(nodes);
        setCurrentEdges(edges);
    }, []);

    const handleSaveSnapshot = () => {
        if (!snapshotName.trim()) {
            toast.error('Podaj nazwę snapshota');
            return;
        }

        const newSnapshot: WorkflowSnapshot = {
            id: `snapshot-${Date.now()}`,
            name: snapshotName.trim(),
            nodes: currentNodes,
            edges: currentEdges,
            createdAt: new Date(),
        };

        setSnapshots(prev => [...prev, newSnapshot]);
        setSaveDialogOpen(false);
        setSnapshotName('');
        toast.success(`Snapshot "${newSnapshot.name}" zapisany`);
    };

    const handleDeleteSnapshot = (id: string) => {
        setSnapshots(prev => prev.filter(s => s.id !== id));
        if (workflowA?.id === id) setWorkflowA(null);
        if (workflowB?.id === id) setWorkflowB(null);
        toast.success('Snapshot usunięty');
    };

    const handleSelectWorkflow = (slot: 'A' | 'B') => {
        setSelectingSlot(slot);
    };

    const handleWorkflowSelected = (snapshot: WorkflowSnapshot) => {
        if (selectingSlot === 'A') {
            setWorkflowA(snapshot);
        } else if (selectingSlot === 'B') {
            setWorkflowB(snapshot);
        }
        setSelectingSlot(null);
    };

    // Area CRUD handlers
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
            setView('list'); // Switch to list to see the new map
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

    // Agent chat handler
    const handleAgentSend = useCallback(async () => {
        if (!agentInput.trim()) return;
        const userMsg = agentInput.trim();
        setAgentMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setAgentInput('');
        setProcessingAgent(true);

        // Simulate AI response
        setTimeout(() => {
            const responses = [
                `Analizuję Twój łańcuch wartości... Widzę ${stats.processes} procesów w ${stats.stages} etapach. Sugeruję dodanie SOP do procesów, które jeszcze go nie mają.`,
                `Na podstawie analizy, etap "Lead Qualification" ma wysoki potencjał automatyzacji (80%). Mogę zaproponować agenta AI, który przejmie scoring leadów.`,
                `Wykryłem lukę w procesie: brak formalnego handoffu między Marketing a Sprzedażą. Rekomenduję dodanie noda Handoff z przypisanym SOP.`,
            ];
            setAgentMessages(prev => [...prev, { role: 'assistant', content: responses[Math.floor(Math.random() * responses.length)] }]);
            setProcessingAgent(false);
        }, 1500);
    }, [agentInput]);

    const handleSuggestionClick = useCallback((suggestion: typeof agentSuggestions[0]) => {
        setAgentMessages(prev => [...prev,
        { role: 'user', content: `Wykonaj: ${suggestion.text}` },
        ]);
        setProcessingAgent(true);
        setTimeout(() => {
            let response = '';
            switch (suggestion.action) {
                case 'request-sop':
                    response = `✅ Utworzono CouncilRequest o nowy SOP dla etapu "${suggestion.stage}". Rada zostanie powiadomiona i może zatwierdzić lub odrzucić propozycję.`;
                    break;
                case 'request-agent':
                    response = `✅ Zaproponowano nowego Agenta AI dla "${suggestion.stage}". Agent będzie monitorował lead score i automatycznie przydzielał follow-upy.`;
                    break;
                case 'fix-muda':
                    response = `✅ Zidentyfikowano MUDA (marnotrawstwo). Dodano do raportu MUDA jako "Brak SOP w punkcie przekazania". Priorytet: WYSOKI.`;
                    break;
                case 'automate':
                    response = `✅ Przeanalizowano ${suggestion.stage}. Rekomendacja: webhook z CRM → automatyczna kwalifikacja → routing. Szacowany wzrost efektywności: +35%.`;
                    break;
            }
            setAgentMessages(prev => [...prev, { role: 'assistant', content: response }]);
            setProcessingAgent(false);
        }, 2000);
    }, []);

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4 overflow-auto' : 'space-y-6'}`}>
            {/* Fullscreen floating bar */}
            {isFullscreen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-4 right-4 z-[60] flex items-center gap-2"
                >
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-card/90 backdrop-blur-sm border-border shadow-lg gap-2"
                        onClick={() => setAgentPanelOpen(!agentPanelOpen)}
                    >
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        Asystent AI
                    </Button>
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
                            <p className="text-sm text-muted-foreground">Interaktywna mapa procesów</p>
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
                                onClick={() => setView('compare')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${view === 'compare'
                                    ? 'bg-cyan-500/20 text-cyan-400'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <GitCompare className="h-4 w-4" />
                                Porównaj
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

                        {/* Save Snapshot Button */}
                        {view === 'whiteboard' && currentNodes.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => setSaveDialogOpen(true)}
                                className="gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Zapisz Snapshot
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
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => setAgentPanelOpen(!agentPanelOpen)}
                        >
                            <Sparkles className="h-4 w-4 text-purple-400" />
                            Asystent
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Stats */}
            {!isFullscreen && (
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
                        <p className="mt-2 text-2xl font-bold text-foreground">{stats.stages}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card/50 p-4 hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">Procesy</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-foreground">{stats.processes}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card/50 p-4 hover:border-purple-500/30 transition-colors">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Bot className="h-4 w-4" />
                            <span className="text-sm">Agenci AI</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-purple-400">{stats.agents}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card/50 p-4 hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <ArrowRightLeft className="h-4 w-4" />
                            <span className="text-sm">Automatyzacja</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-emerald-400">{stats.automation}%</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card/50 p-4 hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Layers className="h-4 w-4" />
                            <span className="text-sm">Obszary</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-indigo-400">{areas.length}</p>
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
                                    selectedId={selectedChainId}
                                    onSelect={setSelectedChainId}
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
                        <ValueChainWhiteboard
                            onSave={handleSave}
                            onOpenOptimization={() => setOptimizationOpen(!optimizationOpen)}
                        />
                    </div>
                </motion.div>
            )}

            {view === 'compare' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                >
                    {/* Snapshots List */}
                    {snapshots.length > 0 && (
                        <div className="rounded-xl border border-border bg-card/50 p-4">
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Zapisane Snapshoty ({snapshots.length})
                            </h3>
                            <div className="grid gap-2 md:grid-cols-3">
                                {snapshots.map(snapshot => (
                                    <div
                                        key={snapshot.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${selectingSlot
                                            ? 'cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5'
                                            : 'border-border'
                                            } ${workflowA?.id === snapshot.id || workflowB?.id === snapshot.id
                                                ? 'border-emerald-500/50 bg-emerald-500/5'
                                                : ''
                                            }`}
                                        onClick={() => selectingSlot && handleWorkflowSelected(snapshot)}
                                    >
                                        <div>
                                            <p className="font-medium text-sm">{snapshot.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {snapshot.nodes.length} nodes • {new Date(snapshot.createdAt).toLocaleDateString('pl-PL')}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteSnapshot(snapshot.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Comparison View */}
                    <ComparisonView
                        workflowA={workflowA}
                        workflowB={workflowB}
                        onSelectWorkflow={handleSelectWorkflow}
                        onClose={() => setView('whiteboard')}
                    />

                    {snapshots.length === 0 && (
                        <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
                            <GitCompare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="font-medium text-lg mb-2">Brak zapisanych snapshotów</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Wróć do Whiteboard, wprowadź zmiany i kliknij "Zapisz Snapshot" aby móc porównać wersje.
                            </p>
                            <Button onClick={() => setView('whiteboard')}>
                                <Map className="h-4 w-4 mr-2" />
                                Przejdź do Whiteboard
                            </Button>
                        </div>
                    )}
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

            {/* Save Snapshot Dialog */}
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Zapisz Snapshot</DialogTitle>
                        <DialogDescription>
                            Nadaj nazwę tej wersji workflow aby móc później ją porównać z innymi.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nazwa</Label>
                            <Input
                                id="name"
                                placeholder="np. Wersja z AI, Optymalizacja kosztów..."
                                value={snapshotName}
                                onChange={(e) => setSnapshotName(e.target.value)}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Zapisujesz {currentNodes.length} elementów i {currentEdges.length} połączeń.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                            Anuluj
                        </Button>
                        <Button onClick={handleSaveSnapshot}>
                            <Save className="h-4 w-4 mr-2" />
                            Zapisz
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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

            {/* Selecting Workflow Info */}
            {selectingSlot && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
                    Wybierz snapshot dla Workflow {selectingSlot}
                </div>
            )}

            {/* Optimization Panel */}
            <OptimizationPanel
                nodes={currentNodes}
                areas={areas}
                isOpen={optimizationOpen}
                onToggle={() => setOptimizationOpen(false)}
            />

            {/* Agent Assistant Panel */}
            {agentPanelOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 300 }}
                    className={`${isFullscreen
                        ? 'fixed top-4 right-4 bottom-4 w-96 z-[55]'
                        : 'fixed top-20 right-4 bottom-4 w-96 z-40'
                        } rounded-xl border border-border bg-card/95 backdrop-blur-lg shadow-2xl flex flex-col overflow-hidden`}
                >
                    {/* Agent Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-purple-500/20">
                                <Sparkles className="h-4 w-4 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold">Asystent Value Chain</h3>
                                <p className="text-[10px] text-muted-foreground">Analiza • Sugestie • Automatyzacja</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setAgentPanelOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Suggestions */}
                    {agentMessages.length === 0 && (
                        <div className="p-4 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                                <Lightbulb className="h-3 w-3 inline mr-1" /> Sugestie
                            </p>
                            {agentSuggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestionClick(s)}
                                    className="w-full text-left p-3 rounded-lg border border-border hover:border-purple-500/30 hover:bg-purple-500/5 transition-all text-sm flex items-start gap-2 group"
                                >
                                    <span className="text-base">{s.icon}</span>
                                    <span className="flex-1">{s.text}</span>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {agentMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted border border-border'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {processingAgent && (
                            <div className="flex justify-start">
                                <div className="bg-muted border border-border px-3 py-2 rounded-xl text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <span className="text-xs text-muted-foreground">Analizuję...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-border">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Zapytaj o łańcuch wartości..."
                                value={agentInput}
                                onChange={(e) => setAgentInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAgentSend()}
                                className="text-sm"
                            />
                            <Button size="icon" onClick={handleAgentSend} disabled={processingAgent || !agentInput.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

