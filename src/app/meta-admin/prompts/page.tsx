'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Code2,
    Save,
    RefreshCw,
    Bot,
    Sparkles,
    Settings2,
    Check,
    X,
    Copy,
    Thermometer,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Agent {
    id: string;
    name: string;
    code: string;
    type: string;
    status: string;
    masterPrompt: string | null;
    model: string | null;
    temperature: number | null;
    description: string | null;
    updatedAt: string;
}

const AI_MODELS = [
    { value: 'gpt-4o', label: 'GPT-4o (OpenAI)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (OpenAI)' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (OpenAI)' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus (Anthropic)' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet (Anthropic)' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku (Anthropic)' },
    { value: 'gemini-pro', label: 'Gemini Pro (Google)' },
];

export default function SystemPromptsPage() {
    const { data: session, isPending } = useSession();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingAgent, setEditingAgent] = useState<string | null>(null);
    const [editedValues, setEditedValues] = useState<Record<string, Partial<Agent>>>({});
    const [saving, setSaving] = useState<string | null>(null);

    const fetchAgents = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/prompts');
            const data = await res.json();
            if (res.ok) {
                setAgents(data.agents);
            }
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isPending && session?.user?.role === 'SPONSOR') {
            fetchAgents();
        }
    }, [fetchAgents, isPending, session?.user?.role]);

    // Access checks - after all hooks
    if (isPending) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (session?.user?.role !== 'SPONSOR') {
        redirect('/dashboard');
    }

    const handleEdit = (agentId: string) => {
        const agent = agents.find(a => a.id === agentId);
        if (agent) {
            setEditedValues({
                ...editedValues,
                [agentId]: {
                    masterPrompt: agent.masterPrompt || '',
                    model: agent.model || 'gpt-4o',
                    temperature: agent.temperature ?? 0.7,
                    description: agent.description || ''
                }
            });
            setEditingAgent(agentId);
        }
    };

    const handleSave = async (agentId: string) => {
        setSaving(agentId);
        try {
            const values = editedValues[agentId];
            const res = await fetch('/api/prompts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId,
                    ...values
                })
            });

            if (res.ok) {
                const data = await res.json();
                setAgents(agents.map(a =>
                    a.id === agentId ? { ...a, ...data.agent } : a
                ));
                setEditingAgent(null);
                toast.success('Prompt zapisany');
            } else {
                toast.error('Błąd zapisu');
            }
        } catch (error) {
            console.error('Failed to save:', error);
            toast.error('Błąd zapisu');
        } finally {
            setSaving(null);
        }
    };

    const handleCancel = (agentId: string) => {
        const newEdited = { ...editedValues };
        delete newEdited[agentId];
        setEditedValues(newEdited);
        setEditingAgent(null);
    };

    const copyPrompt = (prompt: string) => {
        navigator.clipboard.writeText(prompt);
        toast.success('Skopiowano do schowka');
    };

    const getAgentTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            ASSISTANT: 'Asystent',
            SPECIALIST: 'Specjalista',
            ORCHESTRATOR: 'Orkiestrator',
            VALIDATOR: 'Walidator'
        };
        return types[type] || type;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            ACTIVE: 'bg-emerald-500',
            INACTIVE: 'bg-gray-500',
            TESTING: 'bg-amber-500',
            DEPRECATED: 'bg-red-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <Link href="/meta-admin">
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Code2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">System Prompts</h1>
                        <p className="text-sm text-muted-foreground">
                            Zarządzaj promptami AI dla wszystkich agentów
                        </p>
                    </div>
                </div>
                <Button variant="outline" onClick={fetchAgents} disabled={isLoading}>
                    <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                    Odśwież
                </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex gap-4"
            >
                <Badge variant="secondary" className="gap-1">
                    <Bot className="h-3 w-3" />
                    {agents.length} agentów
                </Badge>
                <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    {agents.filter(a => a.status === 'ACTIVE').length} aktywnych
                </Badge>
            </motion.div>

            {/* Agents List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : agents.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Brak agentów do wyświetlenia</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Accordion type="single" collapsible className="space-y-3">
                        {agents.map((agent, index) => (
                            <motion.div
                                key={agent.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * index }}
                            >
                                <AccordionItem value={agent.id} className="border rounded-lg bg-card">
                                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className={cn(
                                                "h-8 w-8 rounded-lg flex items-center justify-center",
                                                "bg-gradient-to-br from-purple-500/20 to-indigo-500/20"
                                            )}>
                                                <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="text-left">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{agent.name}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {agent.code}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span className={cn(
                                                        "h-2 w-2 rounded-full",
                                                        getStatusColor(agent.status)
                                                    )} />
                                                    {getAgentTypeLabel(agent.type)}
                                                    {agent.model && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{agent.model}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        {editingAgent === agent.id ? (
                                            <div className="space-y-4">
                                                {/* Model & Temperature */}
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label>Model AI</Label>
                                                        <Select
                                                            value={editedValues[agent.id]?.model || 'gpt-4o'}
                                                            onValueChange={(v) => setEditedValues({
                                                                ...editedValues,
                                                                [agent.id]: { ...editedValues[agent.id], model: v }
                                                            })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {AI_MODELS.map(m => (
                                                                    <SelectItem key={m.value} value={m.value}>
                                                                        {m.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label className="flex items-center gap-2">
                                                                <Thermometer className="h-4 w-4" />
                                                                Temperature
                                                            </Label>
                                                            <span className="text-sm font-mono">
                                                                {editedValues[agent.id]?.temperature?.toFixed(1) || '0.7'}
                                                            </span>
                                                        </div>
                                                        <Slider
                                                            value={[editedValues[agent.id]?.temperature ?? 0.7]}
                                                            onValueChange={([v]) => setEditedValues({
                                                                ...editedValues,
                                                                [agent.id]: { ...editedValues[agent.id], temperature: v }
                                                            })}
                                                            min={0}
                                                            max={2}
                                                            step={0.1}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <div className="space-y-2">
                                                    <Label>Opis agenta</Label>
                                                    <Input
                                                        value={editedValues[agent.id]?.description || ''}
                                                        onChange={(e) => setEditedValues({
                                                            ...editedValues,
                                                            [agent.id]: { ...editedValues[agent.id], description: e.target.value }
                                                        })}
                                                        placeholder="Krótki opis roli agenta..."
                                                    />
                                                </div>

                                                {/* Master Prompt */}
                                                <div className="space-y-2">
                                                    <Label>Master Prompt</Label>
                                                    <Textarea
                                                        value={editedValues[agent.id]?.masterPrompt || ''}
                                                        onChange={(e) => setEditedValues({
                                                            ...editedValues,
                                                            [agent.id]: { ...editedValues[agent.id], masterPrompt: e.target.value }
                                                        })}
                                                        rows={12}
                                                        className="font-mono text-sm"
                                                        placeholder="Główny prompt systemowy agenta..."
                                                    />
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleCancel(agent.id)}
                                                    >
                                                        <X className="h-4 w-4 mr-1" />
                                                        Anuluj
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleSave(agent.id)}
                                                        disabled={saving === agent.id}
                                                    >
                                                        {saving === agent.id ? (
                                                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                                        ) : (
                                                            <Save className="h-4 w-4 mr-1" />
                                                        )}
                                                        Zapisz
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {/* Info */}
                                                {agent.description && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {agent.description}
                                                    </p>
                                                )}

                                                {/* Prompt Preview */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-xs text-muted-foreground">MASTER PROMPT</Label>
                                                        {agent.masterPrompt && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => copyPrompt(agent.masterPrompt!)}
                                                            >
                                                                <Copy className="h-3 w-3 mr-1" />
                                                                Kopiuj
                                                            </Button>
                                                        )}
                                                    </div>
                                                    {agent.masterPrompt ? (
                                                        <pre className="p-3 bg-muted rounded-lg text-xs font-mono whitespace-pre-wrap max-h-40 overflow-auto">
                                                            {agent.masterPrompt}
                                                        </pre>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground italic">
                                                            Brak zdefiniowanego promptu
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Edit Button */}
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={() => handleEdit(agent.id)}
                                                >
                                                    <Settings2 className="h-4 w-4 mr-2" />
                                                    Edytuj konfigurację
                                                </Button>
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            </motion.div>
                        ))}
                    </Accordion>
                )}
            </motion.div>
        </div>
    );
}
