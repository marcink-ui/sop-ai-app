'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    Bot,
    Brain,
    Cog,
    Save,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type AgentType = 'ASSISTANT' | 'AGENT' | 'AUTOMATION';

const TYPE_OPTIONS: { value: AgentType; label: string; description: string; icon: React.ElementType; color: string; bg: string; border: string }[] = [
    {
        value: 'ASSISTANT',
        label: 'Asystent',
        description: 'Well-structured system prompt + baza wiedzy. Odpowiada na pytania, nie podejmuje akcji.',
        icon: Brain,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
    },
    {
        value: 'AGENT',
        label: 'Agent',
        description: 'Prompt + baza wiedzy + akcje. Podejmuje autonomiczne działania w imieniu użytkownika.',
        icon: Bot,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
    },
    {
        value: 'AUTOMATION',
        label: 'Automatyzacja',
        description: 'Deterministyczna logika algorytmiczna. 100% pewny wynik, brak AI. Skrypty, wyliczenia.',
        icon: Cog,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
    },
];

const MODEL_OPTIONS = [
    'GPT-4o',
    'GPT-4o-mini',
    'Claude 3.5 Sonnet',
    'Claude 3 Opus',
    'Gemini 2.0 Flash',
    'Ollama (Local)',
];

export default function NewAgentPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [type, setType] = useState<AgentType>('ASSISTANT');
    const [model, setModel] = useState('GPT-4o');
    const [description, setDescription] = useState('');
    const [masterPrompt, setMasterPrompt] = useState('');

    const generateCode = (agentName: string) => {
        if (!agentName) return;
        const prefix = type === 'AUTOMATION' ? 'AUT' : type === 'AGENT' ? 'AGT' : 'AST';
        const slug = agentName.replace(/\s+/g, '-').toUpperCase().slice(0, 10);
        setCode(`${prefix}-${slug}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Nazwa agenta jest wymagana');
            return;
        }

        setSaving(true);
        try {
            // For now, save to localStorage via the agent pipeline format
            // In future, this will POST to /api/agents
            const agentId = 'agent-' + Date.now().toString(36) + Math.random().toString(36).substr(2);

            // Store in a format compatible with the agents list
            const agents = JSON.parse(localStorage.getItem('sop-ai-agents') || '[]');
            agents.push({
                id: agentId,
                sop_id: '',
                meta: {
                    sop_name: '',
                    sop_version: '1.0',
                    architect: 'Manual',
                    created_date: new Date().toISOString(),
                },
                agents: [{
                    name: name,
                    role: description || 'Agent',
                    trigger: 'manual',
                    integrations: [],
                    escalation_triggers: type === 'AGENT' ? ['error', 'timeout'] : [],
                    context_required: { sylabus_terms: [], sop_steps: [] },
                    guardrails: {
                        banned_actions: [],
                        max_retries: type === 'AUTOMATION' ? 0 : 3,
                        timeout_sec: 30,
                    },
                }],
                flow_mermaid: '',
                requirements_for_generator: {
                    templates: [],
                    access_needed: [],
                    knowledge_base: [],
                },
                // Extra fields for display
                _type: type,
                _model: model,
                _code: code,
                _masterPrompt: masterPrompt,
            });
            localStorage.setItem('sop-ai-agents', JSON.stringify(agents));

            toast.success(`Agent "${name}" został utworzony`);
            router.push('/agents');
        } catch {
            toast.error('Błąd podczas tworzenia agenta');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Back + Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <Link href="/agents" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Powrót do listy agentów
                </Link>
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 p-3 border border-purple-500/20">
                        <Sparkles className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Nowy Agent</h1>
                        <p className="text-sm text-muted-foreground">Stwórz asystenta, agenta lub automatyzację</p>
                    </div>
                </div>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Type Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-3"
                >
                    <label className="text-sm font-medium text-foreground">Typ</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {TYPE_OPTIONS.map(opt => {
                            const isActive = type === opt.value;
                            const Icon = opt.icon;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setType(opt.value)}
                                    className={cn(
                                        'flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all duration-200',
                                        isActive
                                            ? `${opt.bg} ${opt.border} shadow-sm`
                                            : 'border-border bg-card hover:bg-muted/50'
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className={cn('h-5 w-5', isActive ? opt.color : 'text-muted-foreground')} />
                                        <span className={cn('font-medium text-sm', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                                            {opt.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{opt.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Name + Code */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Nazwa agenta *</label>
                        <Input
                            placeholder="np. SalesBot, HR Onboarder..."
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (!code) generateCode(e.target.value);
                            }}
                            className="bg-card border-border"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Kod</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="AST-SALES-001"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="bg-card border-border font-mono text-sm"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="shrink-0"
                                onClick={() => generateCode(name)}
                            >
                                Generuj
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Model */}
                {type !== 'AUTOMATION' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                    >
                        <label className="text-sm font-medium text-foreground">Model AI</label>
                        <div className="flex flex-wrap gap-2">
                            {MODEL_OPTIONS.map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setModel(m)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                                        model === m
                                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400'
                                            : 'border-border bg-card hover:bg-muted/50 text-muted-foreground'
                                    )}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Description */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="space-y-2"
                >
                    <label className="text-sm font-medium text-foreground">Opis</label>
                    <textarea
                        placeholder="Krótki opis roli i zadań agenta..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
                    />
                </motion.div>

                {/* Master Prompt */}
                {type !== 'AUTOMATION' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-foreground">System Prompt</label>
                            <Badge variant="outline" className="text-[10px]">Markdown</Badge>
                        </div>
                        <textarea
                            placeholder={`# Rola\nJesteś ${name || 'asystentem AI'} odpowiedzialnym za...\n\n## Zadania\n1. ...\n2. ...\n\n## Ograniczenia\n- ...`}
                            value={masterPrompt}
                            onChange={(e) => setMasterPrompt(e.target.value)}
                            rows={12}
                            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-y"
                        />
                    </motion.div>
                )}

                {/* Submit */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="flex items-center justify-end gap-3 pt-4 border-t border-border"
                >
                    <Link href="/agents">
                        <Button type="button" variant="outline">
                            Anuluj
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={saving || !name.trim()}
                        className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-lg shadow-purple-500/25 gap-2"
                    >
                        {saving ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Zapisuję...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Utwórz Agenta
                            </>
                        )}
                    </Button>
                </motion.div>
            </form>
        </div>
    );
}
