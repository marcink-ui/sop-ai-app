'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PipelineLayout from '@/components/pipeline/PipelineLayout';
import { sopDb, promptDb } from '@/lib/db';
import { SOP, MasterPrompt } from '@/lib/types';

interface JudgementResult {
    prompt_id: string;
    agent_name: string;
    scores: {
        completeness: number;
        clarity: number;
        consistency: number;
        guardrails: number;
        overall: number;
    };
    issues: string[];
    suggestions: string[];
    verdict: 'PASS' | 'NEEDS_REVISION' | 'FAIL';
}

export default function Step5Page() {
    const router = useRouter();
    const [sop, setSop] = useState<SOP | null>(null);
    const [prompts, setPrompts] = useState<MasterPrompt[]>([]);
    const [judgements, setJudgements] = useState<JudgementResult[]>([]);
    const [isJudging, setIsJudging] = useState(false);
    const [currentJudge, setCurrentJudge] = useState(0);

    useEffect(() => {
        const sopId = localStorage.getItem('current-sop-id');
        const promptIdsRaw = localStorage.getItem('current-prompt-ids');

        if (sopId) {
            setSop(sopDb.getById(sopId));
        }

        if (promptIdsRaw) {
            const promptIds = JSON.parse(promptIdsRaw) as string[];
            const loadedPrompts = promptIds
                .map(id => promptDb.getById(id))
                .filter(Boolean) as MasterPrompt[];
            setPrompts(loadedPrompts);
        }
    }, []);

    const runJudgement = async () => {
        setIsJudging(true);
        const results: JudgementResult[] = [];

        for (let i = 0; i < prompts.length; i++) {
            setCurrentJudge(i + 1);
            const prompt = prompts[i];

            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulate AI judgement
            const scores = {
                completeness: Math.floor(Math.random() * 20) + 80,
                clarity: Math.floor(Math.random() * 25) + 75,
                consistency: Math.floor(Math.random() * 15) + 85,
                guardrails: Math.floor(Math.random() * 20) + 80,
                overall: 0,
            };
            scores.overall = Math.round(
                (scores.completeness + scores.clarity + scores.consistency + scores.guardrails) / 4
            );

            const issues: string[] = [];
            const suggestions: string[] = [];

            if (scores.completeness < 85) {
                issues.push('Brak niektórych wymaganych sekcji');
                suggestions.push('Dodaj brakujące sekcje: pre_questions lub examples');
            }
            if (scores.clarity < 80) {
                issues.push('Niejasne instrukcje w workflow');
                suggestions.push('Rozwiń kroki workflow z konkretnymi przykładami');
            }
            if (scores.guardrails < 85) {
                issues.push('Niewystarczające guardrails');
                suggestions.push('Dodaj więcej zakazanych akcji i warunków eskalacji');
            }

            const verdict: 'PASS' | 'NEEDS_REVISION' | 'FAIL' =
                scores.overall >= 85 ? 'PASS' :
                    scores.overall >= 70 ? 'NEEDS_REVISION' : 'FAIL';

            results.push({
                prompt_id: prompt.id,
                agent_name: prompt.meta.agent_name,
                scores,
                issues: issues.length ? issues : ['Brak istotnych problemów'],
                suggestions: suggestions.length ? suggestions : ['Prompt spełnia wymagania jakościowe'],
                verdict,
            });
        }

        setJudgements(results);
        setIsJudging(false);
    };

    const finishPipeline = () => {
        if (sop) {
            sop.status = 'completed';
            sopDb.save(sop);
        }
        router.push('/');
    };

    const getVerdictStyle = (verdict: string) => {
        switch (verdict) {
            case 'PASS': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'NEEDS_REVISION': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'FAIL': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-zinc-500/20 text-zinc-400';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-emerald-400';
        if (score >= 80) return 'text-cyan-400';
        if (score >= 70) return 'text-amber-400';
        return 'text-red-400';
    };

    return (
        <PipelineLayout
            currentStep={5}
            title="Prompt Judge"
            description="Ocena jakości wygenerowanych promptów. Sprawdzamy kompletność, jasność, spójność i guardrails."
        >
            {/* Prompts to Judge */}
            {prompts.length > 0 && (
                <div className="mb-6 p-4 bg-white/5 rounded-xl">
                    <h3 className="font-medium mb-2">{sop?.meta.process_name}</h3>
                    <p className="text-sm text-zinc-500 mb-3">
                        {prompts.length} promptów do oceny
                    </p>
                    <div className="flex gap-2">
                        {prompts.map((prompt, i) => {
                            const judgement = judgements.find(j => j.prompt_id === prompt.id);
                            return (
                                <span
                                    key={i}
                                    className={`px-3 py-1 rounded-full text-xs ${judgement
                                            ? getVerdictStyle(judgement.verdict)
                                            : currentJudge === i + 1 && isJudging
                                                ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                                                : 'bg-white/5 text-zinc-500'
                                        }`}
                                >
                                    {prompt.meta.agent_name}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Judge Button */}
            {judgements.length === 0 && (
                <div className="text-center mb-8">
                    <button
                        onClick={runJudgement}
                        disabled={isJudging || prompts.length === 0}
                        className="btn-primary"
                    >
                        {isJudging ? (
                            <>
                                <span className="animate-pulse">⚖️</span> Oceniam prompt {currentJudge}/{prompts.length}...
                            </>
                        ) : (
                            <>
                                ⚖️ Uruchom ocenę jakości
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Judgement Results */}
            {judgements.length > 0 && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-xl">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-400">
                                {judgements.filter(j => j.verdict === 'PASS').length}
                            </div>
                            <div className="text-xs text-zinc-500">PASS ✓</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-amber-400">
                                {judgements.filter(j => j.verdict === 'NEEDS_REVISION').length}
                            </div>
                            <div className="text-xs text-zinc-500">Do poprawy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-400">
                                {judgements.filter(j => j.verdict === 'FAIL').length}
                            </div>
                            <div className="text-xs text-zinc-500">FAIL ✗</div>
                        </div>
                    </div>

                    <h3 className="font-semibold">
                        ⚖️ Wyniki oceny ({judgements.length})
                    </h3>

                    {judgements.map((judgement, index) => (
                        <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-lg">{judgement.agent_name}</h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getVerdictStyle(judgement.verdict)}`}>
                                    {judgement.verdict === 'PASS' ? '✓ PASS' :
                                        judgement.verdict === 'NEEDS_REVISION' ? '⚠ REVISION' : '✗ FAIL'}
                                </span>
                            </div>

                            {/* Scores */}
                            <div className="grid grid-cols-5 gap-3 mb-4">
                                {Object.entries(judgement.scores).map(([key, value]) => (
                                    <div key={key} className="text-center p-2 bg-black/30 rounded-lg">
                                        <div className={`text-xl font-bold ${getScoreColor(value)}`}>{value}</div>
                                        <div className="text-xs text-zinc-500 capitalize">{key}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Issues */}
                            <div className="mb-3">
                                <h5 className="text-xs uppercase text-zinc-500 mb-2">Problemy:</h5>
                                <ul className="space-y-1">
                                    {judgement.issues.map((issue, i) => (
                                        <li key={i} className="text-sm text-amber-400 flex items-center gap-2">
                                            <span>⚠️</span> {issue}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Suggestions */}
                            <div>
                                <h5 className="text-xs uppercase text-zinc-500 mb-2">Sugestie:</h5>
                                <ul className="space-y-1">
                                    {judgement.suggestions.map((suggestion, i) => (
                                        <li key={i} className="text-sm text-cyan-400 flex items-center gap-2">
                                            <span>💡</span> {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}

                    {/* Pipeline Complete */}
                    <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl border border-emerald-500/20 text-center">
                        <div className="text-4xl mb-3">🎉</div>
                        <h3 className="text-xl font-bold mb-2">Pipeline ukończony!</h3>
                        <p className="text-zinc-400 mb-4">
                            Proces SOP → AI został pomyślnie zakończony.
                            Twoje mikroagenty są gotowe do wdrożenia.
                        </p>
                        <button onClick={finishPipeline} className="btn-primary">
                            Wróć do Dashboard →
                        </button>
                    </div>
                </div>
            )}
        </PipelineLayout>
    );
}
