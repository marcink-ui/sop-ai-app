'use client';

import { Bot, Cpu, Zap, ArrowRight, Code, Wand2 } from 'lucide-react';

interface AgentSpec {
    name: string;
    type: 'ASSISTANT' | 'AGENT' | 'AUTOMATION';
    purpose: string;
    inputSpec?: string;
    outputSpec?: string;
    tools?: string[];
    automatedSteps?: number[];
    estimatedROI?: string;
}

interface AgentSpecCardProps {
    agents: AgentSpec[];
    integrations?: Array<{ system: string; purpose: string; type: string }>;
    architecture?: {
        humanSteps?: number[];
        aiSteps?: number[];
        hybridSteps?: number[];
        automationLevel?: number;
    };
    onEditAgent?: (index: number) => void;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    ASSISTANT: { icon: <Bot className="w-4 h-4" />, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Asystent' },
    AGENT: { icon: <Cpu className="w-4 h-4" />, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'Agent' },
    AUTOMATION: { icon: <Zap className="w-4 h-4" />, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Automatyzacja' },
};

export function AgentSpecCard({ agents, integrations, architecture, onEditAgent }: AgentSpecCardProps) {
    return (
        <div className="space-y-4">
            {/* Architecture summary */}
            {architecture && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                    <h4 className="text-sm font-medium text-zinc-300 mb-3">Architektura procesu</h4>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="flex-1">
                            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                                    style={{ width: `${architecture.automationLevel || 0}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-sm font-mono text-zinc-400">
                            {architecture.automationLevel || 0}% AI
                        </span>
                    </div>
                    <div className="flex gap-4 text-xs text-zinc-500">
                        {architecture.humanSteps?.length ? (
                            <span>👤 Kroki ludzkie: {architecture.humanSteps.join(', ')}</span>
                        ) : null}
                        {architecture.aiSteps?.length ? (
                            <span>🤖 Kroki AI: {architecture.aiSteps.join(', ')}</span>
                        ) : null}
                        {architecture.hybridSteps?.length ? (
                            <span>🔄 Hybrydowe: {architecture.hybridSteps.join(', ')}</span>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Agent cards */}
            {agents.map((agent, i) => {
                const typeConfig = TYPE_CONFIG[agent.type] || TYPE_CONFIG.AGENT;
                return (
                    <div
                        key={i}
                        className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors cursor-pointer"
                        onClick={() => onEditAgent?.(i)}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${typeConfig.color}`}>
                                    {typeConfig.icon}
                                    {typeConfig.label}
                                </div>
                                <h5 className="font-medium text-zinc-200">{agent.name}</h5>
                            </div>
                            {agent.estimatedROI && (
                                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    ROI: {agent.estimatedROI}
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-zinc-400 mb-3">{agent.purpose}</p>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            {agent.inputSpec && (
                                <div>
                                    <span className="text-zinc-500 flex items-center gap-1"><ArrowRight className="w-3 h-3" /> Input</span>
                                    <span className="text-zinc-300 mt-0.5 block">{agent.inputSpec}</span>
                                </div>
                            )}
                            {agent.outputSpec && (
                                <div>
                                    <span className="text-zinc-500 flex items-center gap-1"><ArrowRight className="w-3 h-3 rotate-180" /> Output</span>
                                    <span className="text-zinc-300 mt-0.5 block">{agent.outputSpec}</span>
                                </div>
                            )}
                        </div>

                        {agent.tools && agent.tools.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {agent.tools.map((tool, j) => (
                                    <span key={j} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-xs">
                                        <Code className="w-3 h-3" /> {tool}
                                    </span>
                                ))}
                            </div>
                        )}

                        {agent.automatedSteps && agent.automatedSteps.length > 0 && (
                            <div className="mt-2 text-xs text-zinc-500">
                                <Wand2 className="w-3 h-3 inline mr-1" />
                                Automatyzuje kroki: {agent.automatedSteps.join(', ')}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Integrations */}
            {integrations && integrations.length > 0 && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                    <h4 className="text-sm font-medium text-zinc-300 mb-2">Integracje</h4>
                    <div className="space-y-1.5">
                        {integrations.map((intg, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                                <span className="text-zinc-300">{intg.system}</span>
                                <span className="text-zinc-500">{intg.purpose}</span>
                                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">{intg.type}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
