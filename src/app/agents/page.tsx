'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Bot,
    Search,
    Filter,
    MoreHorizontal,
    Trash2,
    Edit,
    Eye,
    ArrowUpDown,
    Code,
    Link2,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { agentDb, sopDb } from '@/lib/db';
import type { AgentSpec, SOP } from '@/lib/types';

export default function AgentsPage() {
    const router = useRouter();
    const [agents, setAgents] = useState<AgentSpec[]>([]);
    const [sops, setSops] = useState<SOP[]>([]);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        setAgents(agentDb.getAll());
        setSops(sopDb.getAll());
    }, []);

    const getSopName = (sopId: string) => {
        const sop = sops.find(s => s.id === sopId);
        return sop?.meta.process_name || 'Unknown';
    };

    const deleteAgent = (id: string) => {
        if (confirm('Are you sure you want to delete this agent?')) {
            agentDb.delete(id);
            setAgents(agentDb.getAll());
        }
    };

    const filteredAgents = agents
        .filter((agent) =>
            agent.agents.some(ma =>
                ma.name.toLowerCase().includes(search.toLowerCase())
            ) || getSopName(agent.sop_id).toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            const nameA = a.agents[0]?.name || '';
            const nameB = b.agents[0]?.name || '';
            return sortOrder === 'asc'
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA);
        });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-500/20 p-2">
                        <Bot className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">AI Agents</h1>
                        <p className="text-sm text-muted-foreground">{agents.length} agent specs</p>
                    </div>
                </div>
                <Link href="/agents/new">
                    <Button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400">
                        <Plus className="mr-2 h-4 w-4" />
                        New Agent
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search agents..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card border-border"
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-border"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-card">
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Agent Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Source SOP
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Integrations
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Micro-Agents
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAgents.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                                    <Bot className="mx-auto mb-3 h-12 w-12 opacity-20" />
                                    <p>No AI Agents found</p>
                                    <p className="mt-2 text-sm">Create SOPs and run through the pipeline first</p>
                                </td>
                            </tr>
                        ) : (
                            filteredAgents.map((agent) => (
                                <tr
                                    key={agent.id}
                                    className="border-b border-border transition-colors hover:bg-muted/30 last:border-0"
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col gap-1">
                                            {agent.agents.map((ma) => (
                                                <span key={ma.name} className="font-medium text-foreground">
                                                    {ma.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-muted-foreground">{getSopName(agent.sop_id)}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {agent.agents[0]?.integrations.slice(0, 3).map((int) => (
                                                <Badge key={int} variant="outline" className="border-border text-xs">
                                                    {int}
                                                </Badge>
                                            ))}
                                            {agent.agents[0]?.integrations.length > 3 && (
                                                <Badge variant="outline" className="border-border text-xs">
                                                    +{agent.agents[0].integrations.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Badge className="bg-purple-500/20 text-purple-400">
                                            {agent.agents.length} agents
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-popover border-border">
                                                <DropdownMenuItem
                                                    className="text-popover-foreground cursor-pointer"
                                                    onClick={() => router.push(`/agents/${agent.id}`)}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-popover-foreground cursor-pointer"
                                                    onClick={() => router.push(`/agents/${agent.id}/prompt`)}
                                                >
                                                    <Code className="mr-2 h-4 w-4" />
                                                    View Prompt
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-400 cursor-pointer"
                                                    onClick={() => deleteAgent(agent.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
