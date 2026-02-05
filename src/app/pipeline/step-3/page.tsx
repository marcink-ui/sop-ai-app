'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PipelineLayout from '@/components/pipeline/PipelineLayout';
import { sopDb, agentDb, generateId } from '@/lib/db';
import { SOP, AgentSpec, MicroAgent, SUPPORTED_INTEGRATIONS } from '@/lib/types';

export default function Step3Page() {
    const router = useRouter();
    const [sop, setSop] = useState<SOP | null>(null);
    const [agents, setAgents] = useState<MicroAgent[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [mermaidCode, setMermaidCode] = useState('');

    useEffect(() => {
        const sopId = localStorage.getItem('current-sop-id');
        if (sopId) {
            const loadedSop = sopDb.getById(sopId);
            setSop(loadedSop);
        }
    }, []);

    const generateArchitecture = () => {
        if (!sop) return;
        setIsGenerating(true);

        // Simulate AI architecture generation
        setTimeout(() => {
            const generatedAgents: MicroAgent[] = [
                {
                    name: 'InputValidator',
                    responsibility: 'Waliduje dane wejściowe i przekazuje do przetwarzania',
                    input_schema: {
                        type: 'object',
                        properties: {
                            data: { type: 'string', description: 'Dane wejściowe do walidacji' }
                        },
                        required: ['data']
                    },
                    output_schema: {
                        type: 'object',
                        properties: {
                            valid: { type: 'boolean' },
                            errors: { type: 'array' }
                        },
                        required: ['valid']
                    },
                    integrations: ['Coda'],
                    escalation_triggers: ['Niepewność walidacji', 'Brak wymaganych danych'],
                    context_required: {
                        sylabus_terms: ['Klient', 'Oferta'],
                        sop_steps: [1, 2]
                    },
                    guardrails: {
                        banned_actions: ['Usuwanie danych', 'Modyfikacja bez logowania'],
                        max_retries: 3,
                        timeout_sec: 30
                    }
                },
                {
                    name: 'DataProcessor',
                    responsibility: 'Przetwarza dane zgodnie z logiką biznesową SOP',
                    input_schema: {
                        type: 'object',
                        properties: {
                            validated_data: { type: 'object' }
                        },
                        required: ['validated_data']
                    },
                    output_schema: {
                        type: 'object',
                        properties: {
                            result: { type: 'object' },
                            status: { type: 'string', enum: ['success', 'error', 'escalate'] }
                        },
                        required: ['status']
                    },
                    integrations: ['Google Workspace', 'Coda'],
                    escalation_triggers: ['Wyjątek biznesowy', 'Konflikt danych'],
                    context_required: {
                        sylabus_terms: ['Proces', 'Wynik'],
                        sop_steps: [3, 4]
                    },
                    guardrails: {
                        banned_actions: ['Pomijanie kroków', 'Automatyczne zatwierdzanie VIP'],
                        max_retries: 2,
                        timeout_sec: 60
                    }
                },
                {
                    name: 'OutputGenerator',
                    responsibility: 'Generuje końcowy output (dokument, email, itp.)',
                    input_schema: {
                        type: 'object',
                        properties: {
                            processed_data: { type: 'object' }
                        },
                        required: ['processed_data']
                    },
                    output_schema: {
                        type: 'object',
                        properties: {
                            document_url: { type: 'string' },
                            sent: { type: 'boolean' }
                        },
                        required: ['document_url']
                    },
                    integrations: ['Google Workspace', 'SendGrid'],
                    escalation_triggers: ['Błąd generowania', 'Wymaga akceptacji managera'],
                    context_required: {
                        sylabus_terms: ['Dokument', 'Template'],
                        sop_steps: [5]
                    },
                    guardrails: {
                        banned_actions: ['Wysyłka bez weryfikacji'],
                        max_retries: 3,
                        timeout_sec: 45
                    }
                }
            ];

            setAgents(generatedAgents);

            // Generate Mermaid diagram
            const mermaid = `graph LR
    A[Input] --> B[InputValidator]
    B -->|valid| C[DataProcessor]
    B -->|invalid| D[Escalate]
    C -->|success| E[OutputGenerator]
    C -->|error| D
    E --> F[Done]`;

            setMermaidCode(mermaid);
            setIsGenerating(false);
        }, 2000);
    };

    const saveArchitecture = () => {
        if (!sop || agents.length === 0) return;

        const spec: AgentSpec = {
            id: generateId(),
            sop_id: sop.id,
            meta: {
                sop_name: sop.meta.process_name,
                sop_version: '2.0',
                architect: 'Architekt AI',
                created_date: new Date().toISOString().split('T')[0],
            },
            agents,
            flow_mermaid: mermaidCode,
            requirements_for_generator: {
                templates: [],
                access_needed: agents.flatMap(a => a.integrations),
                knowledge_base: [],
            },
        };

        agentDb.save(spec);
        localStorage.setItem('current-agent-spec-id', spec.id);

        if (sop) {
            sop.status = 'architected';
            sopDb.save(sop);
        }

        router.push('/pipeline/step-4');
    };

    return (
        <PipelineLayout
            currentStep={3}
            title="Architekt AI"
            description="Podziel SOP na zakresy dla mikroagentów. Każdy agent = jedna odpowiedzialność = mniej tokenów."
        >
            {/* Supported Integrations */}
            <div className="mb-6">
                <h3 className="text-sm font-medium mb-3 text-zinc-400">Obsługiwane integracje:</h3>
                <div className="flex flex-wrap gap-2">
                    {SUPPORTED_INTEGRATIONS.map((integration) => (
                        <span
                            key={integration}
                            className="px-3 py-1 rounded-full text-sm bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
                        >
                            {integration}
                        </span>
                    ))}
                </div>
            </div>

            {/* SOP Context */}
            {sop && (
                <div className="mb-6 p-4 bg-white/5 rounded-xl">
                    <h4 className="font-medium mb-2">{sop.meta.process_name}</h4>
                    <p className="text-sm text-zinc-500">
                        {sop.steps.length} kroków do podziału na mikroagentów
                    </p>
                </div>
            )}

            {/* Generate Button */}
            {agents.length === 0 && (
                <div className="text-center mb-8">
                    <button
                        onClick={generateArchitecture}
                        disabled={isGenerating || !sop}
                        className="btn-primary"
                    >
                        {isGenerating ? (
                            <>
                                <span className="animate-pulse">🏗️</span> Projektuję architekturę...
                            </>
                        ) : (
                            <>
                                🏗️ Zaprojektuj mikroagentów
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Generated Agents */}
            {agents.length > 0 && (
                <div className="space-y-6 animate-fadeIn">
                    <h3 className="font-semibold">
                        🤖 Zaprojektowani mikroagenci ({agents.length})
                    </h3>

                    {agents.map((agent, index) => (
                        <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="font-semibold text-lg text-violet-400">{agent.name}</h4>
                                    <p className="text-sm text-zinc-400">{agent.responsibility}</p>
                                </div>
                                <span className="stage-badge stage-3">Agent {index + 1}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <h5 className="text-xs text-zinc-500 uppercase mb-2">Integracje</h5>
                                    <div className="flex flex-wrap gap-1">
                                        {agent.integrations.map((int, i) => (
                                            <span key={i} className="px-2 py-0.5 text-xs bg-cyan-500/20 rounded text-cyan-400">
                                                {int}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h5 className="text-xs text-zinc-500 uppercase mb-2">Eskalacje</h5>
                                    <div className="space-y-1">
                                        {agent.escalation_triggers.map((trigger, i) => (
                                            <p key={i} className="text-xs text-amber-400">⚠️ {trigger}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* I/O Schema Preview */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-2 bg-black/30 rounded text-xs font-mono">
                                    <span className="text-emerald-400">INPUT:</span> {Object.keys(agent.input_schema.properties).join(', ')}
                                </div>
                                <div className="p-2 bg-black/30 rounded text-xs font-mono">
                                    <span className="text-rose-400">OUTPUT:</span> {Object.keys(agent.output_schema.properties).join(', ')}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Mermaid Diagram */}
                    <div className="p-4 bg-black/30 rounded-xl">
                        <h4 className="text-sm font-medium mb-3 text-zinc-400">Flow Diagram (Mermaid):</h4>
                        <pre className="code-block text-xs">{mermaidCode}</pre>
                    </div>

                    {/* Continue */}
                    <div className="flex justify-end pt-4">
                        <button onClick={saveArchitecture} className="btn-primary">
                            Zapisz architekturę i kontynuuj →
                        </button>
                    </div>
                </div>
            )}
        </PipelineLayout>
    );
}
