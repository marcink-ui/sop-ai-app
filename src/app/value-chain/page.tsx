'use client';

import { useState } from 'react';
import {
    GitBranch,
    Plus,
    ArrowRight,
    Layers,
    Clock,
    DollarSign,
    Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Sample value chain data
const sampleValueChain = {
    name: 'Main Business Process',
    stages: [
        {
            id: 'stage-1',
            name: 'Lead Generation',
            category: 'primary',
            processes: [
                { name: 'Marketing Campaigns', automated: 0.4, timeMinutes: 120 },
                { name: 'Website Inquiries', automated: 0.8, timeMinutes: 30 },
                { name: 'Referral Program', automated: 0.2, timeMinutes: 60 },
            ],
        },
        {
            id: 'stage-2',
            name: 'Sales Process',
            category: 'primary',
            processes: [
                { name: 'Initial Contact', automated: 0.6, timeMinutes: 45 },
                { name: 'Needs Analysis', automated: 0.3, timeMinutes: 90 },
                { name: 'Proposal Creation', automated: 0.7, timeMinutes: 180 },
                { name: 'Negotiation', automated: 0.1, timeMinutes: 120 },
            ],
        },
        {
            id: 'stage-3',
            name: 'Order Fulfillment',
            category: 'primary',
            processes: [
                { name: 'Order Processing', automated: 0.9, timeMinutes: 20 },
                { name: 'Production/Sourcing', automated: 0.5, timeMinutes: 240 },
                { name: 'Quality Check', automated: 0.4, timeMinutes: 60 },
            ],
        },
        {
            id: 'stage-4',
            name: 'Delivery',
            category: 'primary',
            processes: [
                { name: 'Logistics', automated: 0.7, timeMinutes: 30 },
                { name: 'Installation', automated: 0.2, timeMinutes: 180 },
                { name: 'Training', automated: 0.3, timeMinutes: 120 },
            ],
        },
        {
            id: 'stage-5',
            name: 'After-Sales',
            category: 'support',
            processes: [
                { name: 'Customer Support', automated: 0.6, timeMinutes: 45 },
                { name: 'Maintenance', automated: 0.4, timeMinutes: 90 },
                { name: 'Feedback Collection', automated: 0.8, timeMinutes: 15 },
            ],
        },
    ],
};

export default function ValueChainPage() {
    const [selectedStage, setSelectedStage] = useState<string | null>(null);

    const totalProcesses = sampleValueChain.stages.reduce((acc, s) => acc + s.processes.length, 0);
    const avgAutomation = sampleValueChain.stages.reduce((acc, s) =>
        acc + s.processes.reduce((a, p) => a + p.automated, 0) / s.processes.length, 0
    ) / sampleValueChain.stages.length;
    const totalTime = sampleValueChain.stages.reduce((acc, s) =>
        acc + s.processes.reduce((a, p) => a + p.timeMinutes, 0), 0
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-cyan-500/20 p-2">
                        <GitBranch className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Value Chain</h1>
                        <p className="text-sm text-muted-foreground">Process flow visualization</p>
                    </div>
                </div>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Map
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Layers className="h-4 w-4" />
                        <span className="text-sm">Stages</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">{sampleValueChain.stages.length}</p>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <GitBranch className="h-4 w-4" />
                        <span className="text-sm">Processes</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">{totalProcesses}</p>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Bot className="h-4 w-4" />
                        <span className="text-sm">Avg Automation</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-cyan-400">
                        {Math.round(avgAutomation * 100)}%
                    </p>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Total Time</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {Math.round(totalTime / 60)}h
                    </p>
                </div>
            </div>

            {/* Value Chain Visualization */}
            <div className="rounded-xl border border-border bg-card/50 p-6">
                <h2 className="mb-6 text-lg font-semibold text-foreground">{sampleValueChain.name}</h2>

                {/* Stages Flow */}
                <div className="flex items-stretch gap-2 overflow-x-auto pb-4">
                    {sampleValueChain.stages.map((stage, index) => (
                        <div key={stage.id} className="flex items-center">
                            <button
                                onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
                                className={`min-w-48 rounded-lg border p-4 transition-all hover:border-cyan-500/50 ${selectedStage === stage.id
                                    ? 'border-cyan-500 bg-cyan-500/10'
                                    : 'border-border bg-muted/50'
                                    } ${stage.category === 'support' ? 'border-dashed' : ''}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-foreground">{stage.name}</span>
                                    <Badge
                                        variant="outline"
                                        className={stage.category === 'primary'
                                            ? 'border-cyan-500/30 text-cyan-400'
                                            : 'border-neutral-600 text-neutral-400'
                                        }
                                    >
                                        {stage.category}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>{stage.processes.length} processes</span>
                                </div>
                                <div className="mt-2 h-2 rounded-full bg-muted">
                                    <div
                                        className="h-2 rounded-full bg-cyan-500"
                                        style={{
                                            width: `${(stage.processes.reduce((a, p) => a + p.automated, 0) / stage.processes.length) * 100}%`
                                        }}
                                    />
                                </div>
                            </button>
                            {index < sampleValueChain.stages.length - 1 && (
                                <ArrowRight className="mx-2 h-5 w-5 text-neutral-600 flex-shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Stage Details */}
            {selectedStage && (
                <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
                    <div className="border-b border-border bg-card px-4 py-3">
                        <h3 className="font-medium text-foreground">
                            {sampleValueChain.stages.find(s => s.id === selectedStage)?.name} - Processes
                        </h3>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                    Process
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                    Automation Level
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                    Time (avg)
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sampleValueChain.stages
                                .find(s => s.id === selectedStage)
                                ?.processes.map((process) => (
                                    <tr key={process.name} className="border-b border-border last:border-0">
                                        <td className="px-4 py-3 font-medium text-foreground">{process.name}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-24 rounded-full bg-muted">
                                                    <div
                                                        className="h-2 rounded-full bg-cyan-500"
                                                        style={{ width: `${process.automated * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    {Math.round(process.automated * 100)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {process.timeMinutes} min
                                        </td>
                                        <td className="px-4 py-3">
                                            {process.automated >= 0.7 ? (
                                                <Badge className="bg-green-500/20 text-green-400">Optimized</Badge>
                                            ) : process.automated >= 0.4 ? (
                                                <Badge className="bg-yellow-500/20 text-yellow-400">Partial</Badge>
                                            ) : (
                                                <Badge className="bg-red-500/20 text-red-400">Manual</Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
