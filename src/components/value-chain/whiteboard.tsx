'use client';

import { useCallback, useState, useMemo, useRef } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    BackgroundVariant,
    Panel,
    useReactFlow,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import {
    Save,
    Download,
    Undo,
    Redo,
    ZoomIn,
    ZoomOut,
    Maximize2,
    FileText,
    Bot,
    Cog,
    AlertTriangle,
    ArrowRightLeft,
    UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { nodeTypes } from './nodes';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import { ElementPicker } from './element-picker';
import { DelegationModal } from './delegation-modal';
import { ElementDetailsPanel } from './element-details-panel';
import { SimulationPanel } from './simulation-panel';

interface WhiteboardProps {
    initialNodes?: Node[];
    initialEdges?: Edge[];
    onSave?: (nodes: Node[], edges: Edge[]) => void;
    readOnly?: boolean;
}

// Sample initial data
const defaultNodes: Node[] = [
    {
        id: '1',
        type: 'process',
        position: { x: 50, y: 200 },
        data: { label: 'Lead Generation', description: 'Marketing & inbound leads', automation: 0.6 },
    },
    {
        id: '2',
        type: 'sop',
        position: { x: 300, y: 100 },
        data: { label: 'SOP-SALES-001', status: 'approved' },
    },
    {
        id: '3',
        type: 'process',
        position: { x: 300, y: 300 },
        data: { label: 'Lead Qualification', description: 'Score and prioritize', automation: 0.8 },
    },
    {
        id: '4',
        type: 'agent',
        position: { x: 550, y: 200 },
        data: { label: 'Sales Assistant', model: 'GPT-4', active: true },
    },
    {
        id: '5',
        type: 'decision',
        position: { x: 780, y: 200 },
        data: { label: 'Qualified?' },
    },
    {
        id: '6',
        type: 'handoff',
        position: { x: 1000, y: 100 },
        data: { label: 'Sales Team', from: 'AI Agent', to: 'Account Executive' },
    },
    {
        id: '7',
        type: 'process',
        position: { x: 1000, y: 300 },
        data: { label: 'Nurture Campaign', description: 'Automated follow-up', automation: 0.9 },
    },
];

const defaultEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#22c55e' } },
    { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#a855f7' } },
    { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#f59e0b' } },
    { id: 'e5-6', source: '5', sourceHandle: 'yes', target: '6', label: 'Yes', style: { stroke: '#22c55e' } },
    { id: 'e5-7', source: '5', sourceHandle: 'no', target: '7', label: 'No', style: { stroke: '#ef4444' } },
];

export function ValueChainWhiteboard({
    initialNodes = defaultNodes,
    initialEdges = defaultEdges,
    onSave,
    readOnly = false,
}: WhiteboardProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
    const { resolvedTheme } = useTheme();
    const { data: session } = useSession();

    // Delegation modal state
    const [delegationOpen, setDelegationOpen] = useState(false);
    const [selectedNodeForDelegation, setSelectedNodeForDelegation] = useState<{
        id: string;
        label: string;
        type: string;
    } | undefined>(undefined);

    // Element details panel state
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedNodeForDetails, setSelectedNodeForDetails] = useState<{
        id: string;
        type: string;
        label: string;
        dbId?: string;
        dbType?: string;
    } | null>(null);

    // Simulation panel state
    const [simulationOpen, setSimulationOpen] = useState(false);

    // Ref for export functionality  
    const flowRef = useRef<HTMLDivElement>(null);

    // Export to PNG handler
    const handleExport = useCallback(async () => {
        if (!flowRef.current) return;

        try {
            const dataUrl = await toPng(flowRef.current, {
                backgroundColor: resolvedTheme === 'dark' ? '#0a0a0a' : '#ffffff',
                quality: 1,
                pixelRatio: 2,
            });

            // Download the image
            const link = document.createElement('a');
            link.download = `value-chain-${new Date().toISOString().split('T')[0]}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Export failed:', error);
        }
    }, [resolvedTheme]);

    // Get user role from session
    const userRole = (session?.user as { role?: string })?.role || 'CITIZEN_DEV';

    // Permission checks based on Party Mode roles
    const canEdit = ['CITIZEN_DEV', 'EXPERT', 'MANAGER', 'ADMIN'].includes(userRole);
    const canDelegate = true; // All roles can delegate with hierarchy rules

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        [setEdges]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const type = event.dataTransfer.getData('application/reactflow');
            if (!type) return;

            const position = {
                x: event.clientX - 100,
                y: event.clientY - 50,
            };

            const newNode: Node = {
                id: `${Date.now()}`,
                type,
                position,
                data: {
                    label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                    automation: type === 'process' ? 0.5 : undefined,
                },
            };

            setNodes((nds: Node[]) => nds.concat(newNode));
        },
        [setNodes]
    );

    const handleSave = useCallback(() => {
        onSave?.(nodes, edges);
    }, [nodes, edges, onSave]);

    // Handler for adding new empty node
    const handleAddNewNode = useCallback((type: string) => {
        const centerX = 400;
        const centerY = 300;
        const offset = nodes.length * 20;

        const newNode: Node = {
            id: `node-${Date.now()}`,
            type,
            position: { x: centerX + offset, y: centerY + offset },
            data: {
                label: `Nowy ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                automation: type === 'process' ? 0.5 : undefined,
            },
        };
        setNodes((nds: Node[]) => [...nds, newNode]);
    }, [nodes.length, setNodes]);

    // Handler for adding node from database (with link)
    const handleAddFromDatabase = useCallback((element: {
        id: string;
        type: 'sop' | 'agent' | 'role' | 'muda';
        name: string;
        description?: string;
    }) => {
        const centerX = 400;
        const centerY = 300;
        const offset = nodes.length * 20;

        const newNode: Node = {
            id: `node-${Date.now()}`,
            type: element.type === 'muda' ? 'decision' : element.type,
            position: { x: centerX + offset, y: centerY + offset },
            data: {
                label: element.name,
                description: element.description,
                dbId: element.id,      // Link to database
                dbType: element.type,  // Type for API calls
            },
        };
        setNodes((nds) => [...nds, newNode]);
    }, [nodes.length, setNodes]);

    // Handler for opening delegation
    const handleOpenDelegation = useCallback((node?: Node) => {
        if (node) {
            setSelectedNodeForDelegation({
                id: node.id,
                label: node.data?.label || 'Element',
                type: node.type || 'process',
            });
        } else {
            setSelectedNodeForDelegation(undefined);
        }
        setDelegationOpen(true);
    }, []);

    // Handler for viewing node details
    const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNodeForDetails({
            id: node.id,
            type: node.type || 'process',
            label: node.data?.label || 'Element',
            dbId: node.data?.dbId,
            dbType: node.data?.dbType,
        });
        setDetailsOpen(true);
    }, []);

    const nodeTypeOptions = useMemo(() => [
        { type: 'process', label: 'Process', icon: Cog, color: 'blue' },
        { type: 'sop', label: 'SOP', icon: FileText, color: 'emerald' },
        { type: 'agent', label: 'Agent', icon: Bot, color: 'purple' },
        { type: 'decision', label: 'Decision', icon: AlertTriangle, color: 'amber' },
        { type: 'handoff', label: 'Handoff', icon: ArrowRightLeft, color: 'cyan' },
    ], []);

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
        setSelectedNodeType(nodeType);
    };

    return (
        <motion.div
            ref={flowRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-[calc(100vh-200px)] min-h-[600px] rounded-xl border border-border overflow-hidden bg-white dark:bg-card/50"
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={readOnly ? undefined : onNodesChange}
                onEdgesChange={readOnly ? undefined : onEdgesChange}
                onConnect={readOnly ? undefined : onConnect}
                onDrop={readOnly ? undefined : onDrop}
                onDragOver={readOnly ? undefined : onDragOver}
                onNodeClick={handleNodeClick}
                nodeTypes={nodeTypes}
                fitView
                snapToGrid
                snapGrid={[15, 15]}
                className="bg-neutral-50 dark:bg-neutral-950"
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    color={resolvedTheme === 'dark' ? '#333' : '#d4d4d4'}
                />
                <Controls className="!bg-card/90 !border-border !rounded-lg overflow-hidden">
                    <button className="react-flow__controls-button">
                        <ZoomIn className="h-4 w-4" />
                    </button>
                    <button className="react-flow__controls-button">
                        <ZoomOut className="h-4 w-4" />
                    </button>
                    <button className="react-flow__controls-button">
                        <Maximize2 className="h-4 w-4" />
                    </button>
                </Controls>
                <MiniMap
                    className="!bg-white/90 dark:!bg-card/90 !border-border !rounded-lg"
                    maskColor={resolvedTheme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'}
                    nodeColor={(node) => {
                        switch (node.type) {
                            case 'process': return '#3b82f6';
                            case 'sop': return '#22c55e';
                            case 'agent': return '#a855f7';
                            case 'decision': return '#f59e0b';
                            case 'handoff': return '#06b6d4';
                            default: return '#6b7280';
                        }
                    }}
                />

                {/* Toolbar Panel */}
                <Panel position="top-left" className="!m-4">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-card/90 border border-border backdrop-blur-sm">
                        {!readOnly && (
                            <>
                                <Button variant="ghost" size="sm" onClick={handleSave}>
                                    <Save className="h-4 w-4 mr-1" />
                                    Save
                                </Button>
                                <div className="w-px h-6 bg-border" />
                                <Button variant="ghost" size="sm">
                                    <Undo className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <Redo className="h-4 w-4" />
                                </Button>
                                <div className="w-px h-6 bg-border" />
                            </>
                        )}
                        <Button variant="ghost" size="sm" onClick={handleExport}>
                            <Download className="h-4 w-4 mr-1" />
                            Export
                        </Button>
                        {canDelegate && (
                            <>
                                <div className="w-px h-6 bg-border" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenDelegation()}
                                >
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    Deleguj
                                </Button>
                            </>
                        )}
                    </div>
                </Panel>

                {/* Element Picker - replaces old Node Palette */}
                {canEdit && !readOnly && (
                    <ElementPicker
                        onAddNewNode={handleAddNewNode}
                        onAddFromDatabase={handleAddFromDatabase}
                    />
                )}
            </ReactFlow>

            {/* Element Details Panel */}
            <ElementDetailsPanel
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                nodeData={selectedNodeForDetails}
                readOnly={readOnly}
            />

            {/* Delegation Modal */}
            <DelegationModal
                open={delegationOpen}
                onOpenChange={setDelegationOpen}
                nodeData={selectedNodeForDelegation}
                currentUserRole={userRole as 'SPONSOR' | 'PILOT' | 'MANAGER' | 'EXPERT' | 'CITIZEN_DEV'}
            />

            {/* Simulation Panel */}
            <SimulationPanel
                nodes={nodes}
                isOpen={simulationOpen}
                onToggle={() => setSimulationOpen(!simulationOpen)}
            />
        </motion.div>
    );
}
