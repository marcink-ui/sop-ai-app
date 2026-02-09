'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, Bot, Cog, AlertTriangle, CheckCircle, ArrowRightLeft, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ── Shared Styles ──────────────────────────────────

const handleBase = '!w-3.5 !h-3.5 !border-2 !border-white dark:!border-neutral-900 !shadow-sm';

function NodeShell({
    children,
    selected,
    color,
    glow,
}: {
    children: React.ReactNode;
    selected: boolean;
    color: string; // tailwind color name e.g. "blue"
    glow?: boolean;
}) {
    const borderColor = selected ? `border-${color}-500` : 'border-border/60';
    const bg = selected
        ? `bg-${color}-50/80 dark:bg-${color}-500/10`
        : 'bg-white/95 dark:bg-card/95';
    const shadow = selected
        ? `shadow-lg shadow-${color}-500/20 ring-2 ring-${color}-500/30`
        : 'shadow-md hover:shadow-lg';
    const glowStyle = glow
        ? `after:absolute after:inset-0 after:rounded-xl after:bg-${color}-500/5 after:animate-pulse after:pointer-events-none`
        : '';

    return (
        <div
            className={`
                relative p-4 rounded-xl border-[1.5px] min-w-[200px] max-w-[260px]
                backdrop-blur-sm transition-all duration-200
                ${borderColor} ${bg} ${shadow} ${glowStyle}
            `}
        >
            {children}
        </div>
    );
}

function NodeHeader({
    icon: Icon,
    label,
    color,
    badge,
}: {
    icon: typeof Cog;
    label: string;
    color: string;
    badge?: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-2.5 mb-1.5">
            <div className={`p-1.5 rounded-lg bg-${color}-500/15 ring-1 ring-${color}-500/20`}>
                <Icon className={`h-4 w-4 text-${color}-500`} />
            </div>
            <span className="font-semibold text-foreground text-[13px] leading-tight flex-1 truncate">
                {label}
            </span>
            {badge}
        </div>
    );
}

// ── Process Node ───────────────────────────────────

export const ProcessNode = memo(({ data, selected }: NodeProps) => (
    <NodeShell selected={selected} color="blue">
        <Handle type="target" position={Position.Left} className={`${handleBase} !bg-blue-500`} />
        <NodeHeader icon={Cog} label={data.label} color="blue" />
        {data.description && (
            <p className="text-xs text-muted-foreground mb-2.5 line-clamp-2">{data.description}</p>
        )}
        {data.automation !== undefined && (
            <div className="flex items-center gap-2.5">
                <div className="h-2 flex-1 rounded-full bg-blue-100 dark:bg-blue-500/10 overflow-hidden">
                    <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                        style={{ width: `${data.automation * 100}%` }}
                    />
                </div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 tabular-nums">
                    {Math.round(data.automation * 100)}%
                </span>
            </div>
        )}
        <Handle type="source" position={Position.Right} className={`${handleBase} !bg-blue-500`} />
    </NodeShell>
));
ProcessNode.displayName = 'ProcessNode';

// ── SOP Node ───────────────────────────────────────

export const SOPNode = memo(({ data, selected }: NodeProps) => (
    <NodeShell selected={selected} color="emerald">
        <Handle type="target" position={Position.Left} className={`${handleBase} !bg-emerald-500`} />
        <NodeHeader
            icon={FileText}
            label={data.label}
            color="emerald"
            badge={
                data.status && (
                    <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 h-5 font-medium ${data.status === 'approved'
                                ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                                : data.status === 'draft'
                                    ? 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                                    : 'border-border text-muted-foreground'
                            }`}
                    >
                        {data.status === 'approved' ? '✓ ' : ''}{data.status}
                    </Badge>
                )
            }
        />
        {data.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{data.description}</p>
        )}
        <Handle type="source" position={Position.Right} className={`${handleBase} !bg-emerald-500`} />
    </NodeShell>
));
SOPNode.displayName = 'SOPNode';

// ── Agent Node ─────────────────────────────────────

export const AgentNode = memo(({ data, selected }: NodeProps) => (
    <NodeShell selected={selected} color="purple" glow={data.active}>
        <Handle type="target" position={Position.Left} className={`${handleBase} !bg-purple-500`} />
        <NodeHeader icon={Bot} label={data.label} color="purple" />
        <div className="flex items-center gap-3 mt-1">
            {data.model && (
                <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                    {data.model}
                </span>
            )}
            {data.active !== undefined && (
                <div className="flex items-center gap-1.5 ml-auto">
                    <div className={`w-2 h-2 rounded-full ${data.active ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
                    <span className={`text-[10px] font-medium ${data.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                        {data.active ? 'Active' : 'Off'}
                    </span>
                </div>
            )}
        </div>
        <Handle type="source" position={Position.Right} className={`${handleBase} !bg-purple-500`} />
    </NodeShell>
));
AgentNode.displayName = 'AgentNode';

// ── Decision Node ──────────────────────────────────

export const DecisionNode = memo(({ data, selected }: NodeProps) => (
    <NodeShell selected={selected} color="amber">
        <Handle type="target" position={Position.Top} className={`${handleBase} !bg-amber-500`} />
        <Handle type="target" position={Position.Left} className={`${handleBase} !bg-amber-500`} />
        <NodeHeader icon={AlertTriangle} label={data.label} color="amber" />
        {data.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{data.description}</p>
        )}
        <div className="flex justify-between mt-2 text-[10px] font-medium px-2">
            <span className="text-emerald-600 dark:text-emerald-400">✓ Tak</span>
            <span className="text-red-500">✗ Nie</span>
        </div>
        <Handle type="source" position={Position.Bottom} id="yes" className={`${handleBase} !bg-emerald-500 !left-[30%]`} />
        <Handle type="source" position={Position.Bottom} id="no" className={`${handleBase} !bg-red-500 !left-[70%]`} />
    </NodeShell>
));
DecisionNode.displayName = 'DecisionNode';

// ── Handoff Node ───────────────────────────────────

export const HandoffNode = memo(({ data, selected }: NodeProps) => (
    <NodeShell selected={selected} color="cyan">
        <Handle type="target" position={Position.Left} className={`${handleBase} !bg-cyan-500`} />
        <NodeHeader icon={ArrowRightLeft} label={data.label} color="cyan" />
        {data.from && data.to && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <span className="bg-cyan-500/10 px-1.5 py-0.5 rounded font-medium text-cyan-700 dark:text-cyan-300">{data.from}</span>
                <Zap className="h-3 w-3 text-cyan-500" />
                <span className="bg-cyan-500/10 px-1.5 py-0.5 rounded font-medium text-cyan-700 dark:text-cyan-300">{data.to}</span>
            </div>
        )}
        <Handle type="source" position={Position.Right} className={`${handleBase} !bg-cyan-500`} />
    </NodeShell>
));
HandoffNode.displayName = 'HandoffNode';

// ── Node Types Registry ────────────────────────────

export const nodeTypes = {
    process: ProcessNode,
    sop: SOPNode,
    agent: AgentNode,
    decision: DecisionNode,
    handoff: HandoffNode,
};
