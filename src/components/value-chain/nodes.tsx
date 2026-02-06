'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, Bot, Cog, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Base node styles
const baseNodeStyles = 'p-4 rounded-lg border shadow-md min-w-[180px] transition-all hover:shadow-lg bg-white dark:bg-card/90';

// Process Node - Main business process
export const ProcessNode = memo(({ data, selected }: NodeProps) => (
    <div className={`${baseNodeStyles} ${selected ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-blue-200 dark:border-border'}`}>
        <Handle type="target" position={Position.Left} className="!bg-blue-500 !w-3 !h-3" />
        <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20">
                <Cog className="h-4 w-4 text-blue-400" />
            </div>
            <span className="font-semibold text-foreground text-sm">{data.label}</span>
        </div>
        {data.description && (
            <p className="text-xs text-muted-foreground mb-2">{data.description}</p>
        )}
        {data.automation !== undefined && (
            <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-muted">
                    <div
                        className="h-1.5 rounded-full bg-blue-500"
                        style={{ width: `${data.automation * 100}%` }}
                    />
                </div>
                <span className="text-xs text-muted-foreground">{Math.round(data.automation * 100)}%</span>
            </div>
        )}
        <Handle type="source" position={Position.Right} className="!bg-blue-500 !w-3 !h-3" />
    </div>
));
ProcessNode.displayName = 'ProcessNode';

// SOP Node - Connected to procedure
export const SOPNode = memo(({ data, selected }: NodeProps) => (
    <div className={`${baseNodeStyles} ${selected ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-emerald-200 dark:border-border'}`}>
        <Handle type="target" position={Position.Left} className="!bg-emerald-500 !w-3 !h-3" />
        <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20">
                <FileText className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="font-semibold text-foreground text-sm">{data.label}</span>
        </div>
        {data.status && (
            <Badge
                className={`text-xs ${data.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                    data.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-neutral-500/20 text-neutral-400'
                    }`}
            >
                {data.status}
            </Badge>
        )}
        <Handle type="source" position={Position.Right} className="!bg-emerald-500 !w-3 !h-3" />
    </div>
));
SOPNode.displayName = 'SOPNode';

// Agent Node - AI Assistant
export const AgentNode = memo(({ data, selected }: NodeProps) => (
    <div className={`${baseNodeStyles} ${selected ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10' : 'border-purple-200 dark:border-border'}`}>
        <Handle type="target" position={Position.Left} className="!bg-purple-500 !w-3 !h-3" />
        <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20">
                <Bot className="h-4 w-4 text-purple-400" />
            </div>
            <span className="font-semibold text-foreground text-sm">{data.label}</span>
        </div>
        {data.model && (
            <span className="text-xs text-muted-foreground">{data.model}</span>
        )}
        {data.active !== undefined && (
            <div className="flex items-center gap-1 mt-1">
                <div className={`w-2 h-2 rounded-full ${data.active ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-500'}`} />
                <span className="text-xs text-muted-foreground">{data.active ? 'Active' : 'Inactive'}</span>
            </div>
        )}
        <Handle type="source" position={Position.Right} className="!bg-purple-500 !w-3 !h-3" />
    </div>
));
AgentNode.displayName = 'AgentNode';

// Decision Node - Branch point
export const DecisionNode = memo(({ data, selected }: NodeProps) => (
    <div className={`${baseNodeStyles} ${selected ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'border-amber-200 dark:border-border'} !rotate-0`}>
        <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-3 !h-3" />
        <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <span className="font-semibold text-foreground text-sm">{data.label}</span>
        </div>
        <Handle type="source" position={Position.Bottom} id="yes" className="!bg-emerald-500 !w-3 !h-3 !left-[30%]" />
        <Handle type="source" position={Position.Bottom} id="no" className="!bg-red-500 !w-3 !h-3 !left-[70%]" />
    </div>
));
DecisionNode.displayName = 'DecisionNode';

// Handoff Node - Transfer between systems/people
export const HandoffNode = memo(({ data, selected }: NodeProps) => (
    <div className={`${baseNodeStyles} ${selected ? 'border-cyan-500 bg-cyan-500/10' : 'border-border bg-card/90'} border-dashed`}>
        <Handle type="target" position={Position.Left} className="!bg-cyan-500 !w-3 !h-3" />
        <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-cyan-500/20">
                <CheckCircle className="h-4 w-4 text-cyan-400" />
            </div>
            <span className="font-semibold text-foreground text-sm">{data.label}</span>
        </div>
        {data.from && data.to && (
            <p className="text-xs text-muted-foreground">{data.from} → {data.to}</p>
        )}
        <Handle type="source" position={Position.Right} className="!bg-cyan-500 !w-3 !h-3" />
    </div>
));
HandoffNode.displayName = 'HandoffNode';

// Node types mapping
export const nodeTypes = {
    process: ProcessNode,
    sop: SOPNode,
    agent: AgentNode,
    decision: DecisionNode,
    handoff: HandoffNode,
};
