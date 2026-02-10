'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot,
    Search,
    MoreHorizontal,
    Trash2,
    Eye,
    ArrowUpDown,
    Code,
    Plus,
    Brain,
    Cog,
    Zap,
    SlidersHorizontal,
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
import { cn } from '@/lib/utils';

// Agent type configuration (matches Prisma AgentType enum)
type AgentCategory = 'ALL' | 'ASSISTANT' | 'AGENT' | 'AUTOMATION';

const TYPE_CONFIG = {
    ASSISTANT: {
        label: 'Asystent',
        description: 'Prompt + baza wiedzy',
        icon: Brain,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        gradient: 'from-blue-500 to-sky-500',
    },
    AGENT: {
        label: 'Agent',
        description: 'Prompt + akcje',
        icon: Bot,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        gradient: 'from-purple-500 to-violet-500',
    },
    AUTOMATION: {
        label: 'Automatyzacja',
        description: '100% deterministyczna',
        icon: Cog,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        gradient: 'from-emerald-500 to-teal-500',
    },
};

const CATEGORY_TABS: { value: AgentCategory; label: string; icon: React.ElementType }[] = [
    { value: 'ALL', label: 'Wszystkie', icon: SlidersHorizontal },
    { value: 'ASSISTANT', label: 'Asystenci', icon: Brain },
    { value: 'AGENT', label: 'Agenci', icon: Bot },
    { value: 'AUTOMATION', label: 'Automatyzacje', icon: Cog },
];

type SortField = 'name' | 'sop' | 'type';

// Infer agent type from its structure (heuristic until we have DB types)
function inferAgentType(agent: AgentSpec): 'ASSISTANT' | 'AGENT' | 'AUTOMATION' {
    const firstAgent = agent.agents[0];
    if (!firstAgent) return 'ASSISTANT';

    // If agent has no integrations and few triggers → assistant
    if (firstAgent.integrations.length === 0) return 'ASSISTANT';
    // If agent has escalation triggers and integrations → agent
    if (firstAgent.escalation_triggers.length > 0) return 'AGENT';
    // If agent has integrations but guardrails with 0 retries → automation
    if (firstAgent.guardrails?.max_retries === 0) return 'AUTOMATION';

    return 'AGENT';
}

export default function AgentsPage() {
    const router = useRouter();
    const [agents, setAgents] = useState<AgentSpec[]>([]);
    const [sops, setSops] = useState<SOP[]>([]);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<AgentCategory>('ALL');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        setAgents(agentDb.getAll());
        setSops(sopDb.getAll());
    }, []);

    const getSopName = (sopId: string) => {
        const sop = sops.find(s => s.id === sopId);
        return sop?.meta.process_name || 'Unknown';
    };

    const deleteAgent = (id: string) => {
        if (confirm('Czy na pewno chcesz usunąć tego agenta?')) {
            agentDb.delete(id);
            setAgents(agentDb.getAll());
        }
    };

    // Annotate agents with inferred type
    const annotatedAgents = useMemo(
        () => agents.map(a => ({ ...a, _type: inferAgentType(a) })),
        [agents]
    );

    const filteredAgents = useMemo(() => {
        return annotatedAgents
            .filter(agent => {
                // Category filter
                if (activeCategory !== 'ALL' && agent._type !== activeCategory) return false;

                // Search filter
                if (search) {
                    const q = search.toLowerCase();
                    const matchesName = agent.agents.some(ma =>
                        ma.name.toLowerCase().includes(q)
                    );
                    const matchesSop = getSopName(agent.sop_id).toLowerCase().includes(q);
                    if (!matchesName && !matchesSop) return false;
                }

                return true;
            })
            .sort((a, b) => {
                let valA = '';
                let valB = '';

                switch (sortField) {
                    case 'name':
                        valA = a.agents[0]?.name || '';
                        valB = b.agents[0]?.name || '';
                        break;
                    case 'sop':
                        valA = getSopName(a.sop_id);
                        valB = getSopName(b.sop_id);
                        break;
                    case 'type':
                        valA = a._type;
                        valB = b._type;
                        break;
                }

                return sortOrder === 'asc'
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [annotatedAgents, activeCategory, search, sortField, sortOrder]);

    // Count per category
    const counts = useMemo(() => ({
        ALL: annotatedAgents.length,
        ASSISTANT: annotatedAgents.filter(a => a._type === 'ASSISTANT').length,
        AGENT: annotatedAgents.filter(a => a._type === 'AGENT').length,
        AUTOMATION: annotatedAgents.filter(a => a._type === 'AUTOMATION').length,
    }), [annotatedAgents]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 p-3 border border-purple-500/20">
                        <Bot className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">AI Agents</h1>
                        <p className="text-sm text-muted-foreground">
                            {agents.length} agentów • Asystenci, Agenci i Automatyzacje
                        </p>
                    </div>
                </div>
                <Link href="/agents/new">
                    <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-lg shadow-purple-500/25">
                        <Plus className="mr-2 h-4 w-4" />
                        Nowy Agent
                    </Button>
                </Link>
            </motion.div>

            {/* Category Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap gap-2"
            >
                {CATEGORY_TABS.map(tab => {
                    const isActive = activeCategory === tab.value;
                    const TabIcon = tab.icon;
                    return (
                        <button
                            key={tab.value}
                            onClick={() => setActiveCategory(tab.value)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                                'border',
                                isActive
                                    ? 'bg-gradient-to-r from-purple-500/10 to-violet-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400 shadow-sm'
                                    : 'border-border bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <TabIcon className="h-4 w-4" />
                            {tab.label}
                            <Badge
                                variant="secondary"
                                className={cn(
                                    'ml-1 h-5 px-1.5 text-[10px]',
                                    isActive && 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                                )}
                            >
                                {counts[tab.value]}
                            </Badge>
                        </button>
                    );
                })}
            </motion.div>

            {/* Search + Sort */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj agentów..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card border-border"
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="border-border gap-2">
                            <ArrowUpDown className="h-4 w-4" />
                            Sortuj: {sortField === 'name' ? 'Nazwa' : sortField === 'sop' ? 'SOP' : 'Typ'}
                            {sortOrder === 'asc' ? ' ↑' : ' ↓'}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem onClick={() => toggleSort('name')} className="cursor-pointer">
                            Nazwa {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleSort('sop')} className="cursor-pointer">
                            SOP {sortField === 'sop' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleSort('type')} className="cursor-pointer">
                            Typ {sortField === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-border bg-card/50 overflow-hidden"
            >
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-card">
                            <th
                                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                                onClick={() => toggleSort('name')}
                            >
                                <div className="flex items-center gap-1">
                                    Agent Name
                                    {sortField === 'name' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </th>
                            <th
                                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                                onClick={() => toggleSort('type')}
                            >
                                <div className="flex items-center gap-1">
                                    Typ
                                    {sortField === 'type' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </th>
                            <th
                                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                                onClick={() => toggleSort('sop')}
                            >
                                <div className="flex items-center gap-1">
                                    Source SOP
                                    {sortField === 'sop' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Integracje
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Micro-Agents
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Akcje
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {filteredAgents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                                        <Bot className="mx-auto mb-3 h-12 w-12 opacity-20" />
                                        <p className="font-medium">Brak agentów{activeCategory !== 'ALL' ? ` typu "${TYPE_CONFIG[activeCategory]?.label}"` : ''}</p>
                                        <p className="mt-2 text-sm">
                                            {agents.length === 0
                                                ? 'Stwórz SOPy i przepuść je przez pipeline, albo dodaj agenta ręcznie'
                                                : 'Zmień filtr lub wyszukiwanie'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAgents.map((agent, idx) => {
                                    const typeCfg = TYPE_CONFIG[agent._type];
                                    const TypeIcon = typeCfg.icon;

                                    return (
                                        <motion.tr
                                            key={agent.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="border-b border-border transition-colors hover:bg-muted/30 last:border-0 cursor-pointer group"
                                            onClick={() => router.push(`/agents/${agent.id}`)}
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-1">
                                                    {agent.agents.map((ma) => (
                                                        <span key={ma.name} className="font-medium text-foreground group-hover:text-purple-500 transition-colors">
                                                            {ma.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'text-xs gap-1',
                                                        typeCfg.bg,
                                                        typeCfg.color,
                                                        typeCfg.border
                                                    )}
                                                >
                                                    <TypeIcon className="h-3 w-3" />
                                                    {typeCfg.label}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-muted-foreground text-sm">{getSopName(agent.sop_id)}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {agent.agents[0]?.integrations.slice(0, 3).map((int) => (
                                                        <Badge key={int} variant="outline" className="border-border text-xs">
                                                            {int}
                                                        </Badge>
                                                    ))}
                                                    {(agent.agents[0]?.integrations.length || 0) > 3 && (
                                                        <Badge variant="outline" className="border-border text-xs">
                                                            +{agent.agents[0].integrations.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                                                    {agent.agents.length} agents
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-popover border-border">
                                                        <DropdownMenuItem
                                                            className="text-popover-foreground cursor-pointer"
                                                            onClick={(e) => { e.stopPropagation(); router.push(`/agents/${agent.id}`); }}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Podgląd
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-popover-foreground cursor-pointer"
                                                            onClick={(e) => { e.stopPropagation(); router.push(`/agents/${agent.id}/prompt`); }}
                                                        >
                                                            <Code className="mr-2 h-4 w-4" />
                                                            Prompt
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-400 cursor-pointer"
                                                            onClick={(e) => { e.stopPropagation(); deleteAgent(agent.id); }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Usuń
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
}
