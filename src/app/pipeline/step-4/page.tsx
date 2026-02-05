'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PipelineLayout from '@/components/pipeline/PipelineLayout';
import { sopDb, agentDb, promptDb, generateId } from '@/lib/db';
import { SOP, AgentSpec, MasterPrompt, PromptSection } from '@/lib/types';

export default function Step4Page() {
    const router = useRouter();
    const [sop, setSop] = useState<SOP | null>(null);
    const [agentSpec, setAgentSpec] = useState<AgentSpec | null>(null);
    const [prompts, setPrompts] = useState<MasterPrompt[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentAgent, setCurrentAgent] = useState(0);

    useEffect(() => {
        const sopId = localStorage.getItem('current-sop-id');
        const specId = localStorage.getItem('current-agent-spec-id');

        if (sopId) {
            setSop(sopDb.getById(sopId));
        }
        if (specId) {
            setAgentSpec(agentDb.getById(specId));
        }
    }, []);

    const generatePrompts = async () => {
        if (!agentSpec || !sop) return;
        setIsGenerating(true);

        const generatedPrompts: MasterPrompt[] = [];

        for (let i = 0; i < agentSpec.agents.length; i++) {
            setCurrentAgent(i + 1);
            const agent = agentSpec.agents[i];

            // Simulate generation delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const sections: PromptSection[] = [
                {
                    id: 'role',
                    name: 'role',
                    content: `Jesteś ${agent.name} - mikroagentem odpowiedzialnym za: ${agent.responsibility}. Działasz w ramach procesu "${sop.meta.process_name}".`,
                },
                {
                    id: 'objective',
                    name: 'objective',
                    content: `Twoim celem jest przetworzenie danych wejściowych i wygenerowanie poprawnego outputu zgodnie ze schematem. Musisz przestrzegać reguł i eskalować gdy napotkasz problemy.`,
                },
                {
                    id: 'context',
                    name: 'context_knowledge',
                    content: `Znasz kontekst biznesowy z Sylabusa: ${agent.context_required.sylabus_terms.join(', ')}. Masz dostęp do kroków SOP: ${agent.context_required.sop_steps.join(', ')}.`,
                },
                {
                    id: 'workflow',
                    name: 'workflow',
                    content: `1. Waliduj dane wejściowe\n2. Przetwórz zgodnie z logiką biznesową\n3. Wygeneruj output lub eskaluj\n\nIntegracje: ${agent.integrations.join(', ')}`,
                },
                {
                    id: 'output',
                    name: 'output_schema',
                    content: JSON.stringify(agent.output_schema, null, 2),
                },
                {
                    id: 'guardrails',
                    name: 'guardrails',
                    content: `ZAKAZANE AKCJE:\n${agent.guardrails.banned_actions.map(a => `- ${a}`).join('\n')}\n\nMax retries: ${agent.guardrails.max_retries}\nTimeout: ${agent.guardrails.timeout_sec}s`,
                },
            ];

            const prompt: MasterPrompt = {
                id: generateId(),
                agent_spec_id: agentSpec.id,
                meta: {
                    agent_name: agent.name,
                    version: '1.0',
                    created_date: new Date().toISOString().split('T')[0],
                    author: 'Generator AI',
                },
                sections,
                full_prompt: sections.map(s => `<${s.name}>\n${s.content}\n</${s.name}>`).join('\n\n'),
            };

            generatedPrompts.push(prompt);
        }

        setPrompts(generatedPrompts);
        setIsGenerating(false);
    };

    const savePrompts = () => {
        prompts.forEach(p => promptDb.save(p));

        const promptIds = prompts.map(p => p.id);
        localStorage.setItem('current-prompt-ids', JSON.stringify(promptIds));

        if (sop) {
            sop.status = 'prompt-generated';
            sopDb.save(sop);
        }

        router.push('/pipeline/step-5');
    };

    return (
        <PipelineLayout
            currentStep={4}
            title="Generator AI"
            description="Generuj Master Prompty dla każdego mikroagenta. Każdy prompt zawiera role, workflow, schemat output i guardrails."
        >
            {/* Agent Spec Summary */}
            {agentSpec && (
                <div className="mb-6 p-4 bg-white/5 rounded-xl">
                    <h3 className="font-medium mb-2">{sop?.meta.process_name}</h3>
                    <p className="text-sm text-zinc-500">
                        {agentSpec.agents.length} mikroagentów do wygenerowania promptów
                    </p>
                    <div className="flex gap-2 mt-3">
                        {agentSpec.agents.map((agent, i) => (
                            <span
                                key={i}
                                className={`px-3 py-1 rounded-full text-xs ${prompts.find(p => p.meta.agent_name === agent.name)
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : currentAgent === i + 1 && isGenerating
                                            ? 'bg-violet-500/20 text-violet-400 animate-pulse'
                                            : 'bg-white/5 text-zinc-500'
                                    }`}
                            >
                                {agent.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Generate Button */}
            {prompts.length === 0 && (
                <div className="text-center mb-8">
                    <button
                        onClick={generatePrompts}
                        disabled={isGenerating || !agentSpec}
                        className="btn-primary"
                    >
                        {isGenerating ? (
                            <>
                                <span className="animate-pulse">🧠</span> Generuję prompt {currentAgent}/{agentSpec?.agents.length || 0}...
                            </>
                        ) : (
                            <>
                                🧠 Generuj Master Prompty
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Generated Prompts */}
            {prompts.length > 0 && (
                <div className="space-y-6 animate-fadeIn">
                    <h3 className="font-semibold">
                        📝 Wygenerowane Master Prompty ({prompts.length})
                    </h3>

                    {prompts.map((prompt, index) => (
                        <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-lg text-rose-400">
                                    {prompt.meta.agent_name}
                                </h4>
                                <span className="stage-badge stage-4">Prompt v{prompt.meta.version}</span>
                            </div>

                            {/* Sections Preview */}
                            <div className="space-y-3">
                                {prompt.sections.map((section) => (
                                    <div key={section.id} className="p-3 bg-black/30 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-mono text-cyan-400">&lt;{section.name}&gt;</span>
                                        </div>
                                        <p className="text-sm text-zinc-400 whitespace-pre-wrap line-clamp-3">
                                            {section.content}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Expand/Copy Controls */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    className="btn-secondary text-xs"
                                    onClick={() => navigator.clipboard.writeText(prompt.full_prompt)}
                                >
                                    📋 Kopiuj pełny prompt
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Continue */}
                    <div className="flex justify-end pt-4">
                        <button onClick={savePrompts} className="btn-primary">
                            Zapisz prompty i oceń →
                        </button>
                    </div>
                </div>
            )}
        </PipelineLayout>
    );
}
