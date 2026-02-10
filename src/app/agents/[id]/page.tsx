'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    Bot,
    FileText,
    Edit,
    Trash2,
    Copy,
    Check,
    Code,
    Zap,
    Settings2,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Brain,
    Cpu,
    MessageSquare,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { mockAgents, type AgentDisplay } from '@/lib/sample-data';

export default function AgentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const agentId = params.id as string;

    const [expandedSection, setExpandedSection] = useState<string | null>('prompt');
    const [copiedPrompt, setCopiedPrompt] = useState(false);
    const [agent, setAgent] = useState<AgentDisplay | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch agent from multiple sources: API → localStorage → mockAgents
    useEffect(() => {
        async function loadAgent() {
            setLoading(true);

            // 1. Try API first
            try {
                const res = await fetch(`/api/agents/${agentId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data?.agent) {
                        setAgent({
                            id: data.agent.id,
                            name: data.agent.name,
                            role: data.agent.description || data.agent.code || 'Agent',
                            model: data.agent.model || 'GPT-4o',
                            sops: data.agent.sopConnections?.map((c: { sopId: string }) => c.sopId) || [],
                            integrations: data.agent.integrations || [],
                            prompt: data.agent.systemPrompt ? { system: data.agent.systemPrompt } : undefined,
                        });
                        setLoading(false);
                        return;
                    }
                }
            } catch { /* API not available, continue */ }

            // 2. Try localStorage (agents created via /agents/new)
            try {
                const stored = JSON.parse(localStorage.getItem('sop-ai-agents') || '[]');
                const localAgent = stored.find((a: { id: string }) => a.id === agentId);
                if (localAgent) {
                    const firstMicroAgent = localAgent.agents?.[0];
                    setAgent({
                        id: localAgent.id,
                        name: firstMicroAgent?.name || localAgent.meta?.sop_name || 'Agent',
                        role: firstMicroAgent?.role || 'Agent',
                        model: localAgent._model || 'GPT-4o',
                        sops: localAgent.sop_id ? [localAgent.sop_id] : [],
                        integrations: firstMicroAgent?.integrations || [],
                        prompt: localAgent._masterPrompt ? { system: localAgent._masterPrompt } : undefined,
                    });
                    setLoading(false);
                    return;
                }
            } catch { /* localStorage error, continue */ }

            // 3. Fallback to mock data
            const mock = mockAgents.find(a => a.id === agentId);
            setAgent(mock || null);
            setLoading(false);
        }

        loadAgent();
    }, [agentId]);

    const copyPrompt = async () => {
        if (!agent) return;
        await navigator.clipboard.writeText(agent.prompt?.system || '');
        setCopiedPrompt(true);
        toast.success('Prompt skopiowany do schowka');
        setTimeout(() => setCopiedPrompt(false), 2000);
    };

    const handleDelete = async () => {
        // Try removing from localStorage
        try {
            const stored = JSON.parse(localStorage.getItem('sop-ai-agents') || '[]');
            const filtered = stored.filter((a: { id: string }) => a.id !== agentId);
            localStorage.setItem('sop-ai-agents', JSON.stringify(filtered));
        } catch { /* ignore */ }
        toast.success('Agent usunięty');
        router.push('/agents');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">Agent nie znaleziony</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <Link href="/agents">
                        <Button variant="ghost" size="icon" className="hover:bg-muted">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 p-3 border border-purple-500/20">
                            <Bot className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{agent.name}</h1>
                            <p className="text-sm text-muted-foreground">{agent.role}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edytuj
                    </Button>
                    <Button
                        variant="outline"
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Usuń
                    </Button>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid gap-4 sm:grid-cols-4"
            >
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Cpu className="h-4 w-4" />
                        <span className="text-sm">Model</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{agent.model || 'GPT-4'}</p>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Powiązane SOPs</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{agent.sops?.length || 0}</p>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Zap className="h-4 w-4" />
                        <span className="text-sm">Integracje</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{agent.integrations?.length || 0}</p>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Brain className="h-4 w-4" />
                        <span className="text-sm">Mikro-agenci</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{agent.microAgents?.length || 0}</p>
                </div>
            </motion.div>

            {/* Master Prompt */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-xl border border-border bg-card/50 overflow-hidden"
            >
                <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedSection(expandedSection === 'prompt' ? null : 'prompt')}
                >
                    <div className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-violet-400" />
                        <h2 className="text-lg font-semibold text-foreground">Master Prompt</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                copyPrompt();
                            }}
                        >
                            {copiedPrompt ? (
                                <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                        {expandedSection === 'prompt' ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>
                </div>

                {expandedSection === 'prompt' && (
                    <div className="border-t border-border p-4">
                        <pre className="p-4 rounded-lg bg-muted/50 text-sm text-foreground overflow-x-auto whitespace-pre-wrap font-mono">
                            {agent.prompt?.system || `Jesteś asystentem AI o nazwie ${agent.name}.

Twoja rola: ${agent.role}

Cel: Wspierasz użytkowników w wykonywaniu procedur operacyjnych zgodnie ze standardami organizacji.

Instrukcje:
1. Odpowiadaj precyzyjnie i zgodnie z procedurami
2. Jeśli nie znasz odpowiedzi, poproś o więcej kontekstu
3. Zawsze bądź pomocny i profesjonalny
4. Używaj języka odpowiedniego do kontekstu rozmowy`}
                        </pre>
                    </div>
                )}
            </motion.div>

            {/* Connected SOPs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="rounded-xl border border-border bg-card/50 overflow-hidden"
            >
                <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedSection(expandedSection === 'sops' ? null : 'sops')}
                >
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-400" />
                        <h2 className="text-lg font-semibold text-foreground">Powiązane SOPs</h2>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                            {agent.sops?.length || 0}
                        </span>
                    </div>
                    {expandedSection === 'sops' ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>

                {expandedSection === 'sops' && (
                    <div className="border-t border-border p-4">
                        {agent.sops && agent.sops.length > 0 ? (
                            <div className="space-y-2">
                                {agent.sops.map((sopId, index) => (
                                    <Link
                                        key={sopId}
                                        href={`/sops/${sopId}`}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                <FileText className="h-4 w-4 text-blue-400" />
                                            </div>
                                            <span className="font-medium text-foreground">SOP-{String(index + 1).padStart(3, '0')}</span>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">Brak powiązanych SOPs</p>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Integrations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="rounded-xl border border-border bg-card/50 overflow-hidden"
            >
                <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedSection(expandedSection === 'integrations' ? null : 'integrations')}
                >
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-amber-400" />
                        <h2 className="text-lg font-semibold text-foreground">Integracje</h2>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                            {agent.integrations?.length || 0}
                        </span>
                    </div>
                    {expandedSection === 'integrations' ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>

                {expandedSection === 'integrations' && (
                    <div className="border-t border-border p-4">
                        {agent.integrations && agent.integrations.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {agent.integrations.map((integration) => (
                                    <span
                                        key={integration}
                                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-medium"
                                    >
                                        {integration}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">Brak skonfigurowanych integracji</p>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Micro-Agents */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="rounded-xl border border-border bg-card/50 overflow-hidden"
            >
                <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedSection(expandedSection === 'microagents' ? null : 'microagents')}
                >
                    <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-emerald-400" />
                        <h2 className="text-lg font-semibold text-foreground">Mikro-agenci</h2>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                            {agent.microAgents?.length || 0}
                        </span>
                    </div>
                    {expandedSection === 'microagents' ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>

                {expandedSection === 'microagents' && (
                    <div className="border-t border-border p-4">
                        {agent.microAgents && agent.microAgents.length > 0 ? (
                            <div className="space-y-2">
                                {agent.microAgents.map((microAgent, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                                <Brain className="h-4 w-4 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{microAgent.name}</p>
                                                <p className="text-xs text-muted-foreground">{microAgent.trigger}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">Brak skonfigurowanych mikro-agentów</p>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Test Chat Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Testuj agenta w czacie
                </Button>
            </motion.div>
        </div>
    );
}
