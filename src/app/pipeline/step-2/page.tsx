'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PipelineLayout from '@/components/pipeline/PipelineLayout';
import { sopDb, mudaDb, generateId } from '@/lib/db';
import { SOP, MudaReport, MudaType, WasteItem } from '@/lib/types';

const MUDA_TYPES: { type: MudaType; icon: string; color: string; description: string }[] = [
    { type: 'Transport', icon: '🚚', color: 'muda-transport', description: 'Zbędne przesyłanie danych' },
    { type: 'Inventory', icon: '📦', color: 'muda-inventory', description: 'Zaległości, kolejki' },
    { type: 'Motion', icon: '🖱️', color: 'muda-motion', description: 'Zbędne kliknięcia' },
    { type: 'Waiting', icon: '⏳', color: 'muda-waiting', description: 'Oczekiwanie na odpowiedź' },
    { type: 'Overproduction', icon: '📊', color: 'muda-overproduction', description: 'Robienie więcej niż potrzeba' },
    { type: 'Overprocessing', icon: '🔬', color: 'muda-overprocessing', description: 'Zbyt szczegółowe działania' },
    { type: 'Defects', icon: '❌', color: 'muda-defects', description: 'Błędy wymagające poprawek' },
];

export default function Step2Page() {
    const router = useRouter();
    const [sop, setSop] = useState<SOP | null>(null);
    const [wastes, setWastes] = useState<WasteItem[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);

    useEffect(() => {
        const sopId = localStorage.getItem('current-sop-id');
        if (sopId) {
            const loadedSop = sopDb.getById(sopId);
            setSop(loadedSop);
        }
    }, []);

    const runAnalysis = () => {
        if (!sop) return;
        setIsAnalyzing(true);

        // Simulate AI analysis - in production this would call the AI API
        setTimeout(() => {
            const simulatedWastes: WasteItem[] = sop.steps.slice(0, 3).map((step, index) => ({
                step_id: step.id,
                muda_type: MUDA_TYPES[index % 7].type,
                problem: `Potencjalne marnotrawstwo w kroku "${step.name}"`,
                kaizen_proposal: 'Rozważ automatyzację tego kroku poprzez integrację API',
                time_saving_sec: Math.floor(Math.random() * 120) + 30,
                automation_potential: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
            }));

            setWastes(simulatedWastes);
            setIsAnalyzing(false);
            setAnalysisComplete(true);
        }, 2000);
    };

    const saveMudaReport = () => {
        if (!sop) return;

        const report: MudaReport = {
            id: generateId(),
            sop_id: sop.id,
            meta: {
                sop_name: sop.meta.process_name,
                sop_version: sop.meta.version,
                analyzed_date: new Date().toISOString().split('T')[0],
                analyst: 'Audytor MUDA AI',
            },
            waste_identified: wastes,
            summary: {
                total_muda_count: wastes.length,
                total_potential_saving_min: Math.round(wastes.reduce((acc, w) => acc + w.time_saving_sec, 0) / 60),
                automation_score: `${Math.round((wastes.filter(w => w.automation_potential !== 'none').length / Math.max(wastes.length, 1)) * 100)}%`,
            },
            optimizations_applied: [],
            escalations: [],
        };

        mudaDb.save(report);

        // Update SOP status
        if (sop) {
            sop.status = 'audited';
            sopDb.save(sop);
        }

        router.push('/pipeline/step-3');
    };

    return (
        <PipelineLayout
            currentStep={2}
            title="Audytor MUDA"
            description="Analiza SOP pod kątem 7 typów marnotrawstwa (Lean). Każda MUDA otrzyma propozycję Kaizen."
        >
            {/* MUDA Types Legend */}
            <div className="mb-8">
                <h3 className="text-sm font-medium mb-3 text-zinc-400">7 typów marnotrawstwa:</h3>
                <div className="flex flex-wrap gap-2">
                    {MUDA_TYPES.map((muda) => (
                        <div
                            key={muda.type}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5"
                        >
                            <span>{muda.icon}</span>
                            <span className="text-sm">{muda.type}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Current SOP Preview */}
            {sop ? (
                <div className="mb-8 p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{sop.meta.process_name}</h3>
                        <span className="text-sm text-zinc-500">{sop.meta.department}</span>
                    </div>
                    <div className="text-sm text-zinc-400 mb-3">
                        <span className="text-emerald-400">START:</span> {sop.scope.trigger} →
                        <span className="text-rose-400 ml-2">STOP:</span> {sop.scope.outcome}
                    </div>
                    <div className="space-y-1">
                        {sop.steps.map((step) => (
                            <div key={step.id} className="text-sm text-zinc-500 flex items-baseline gap-2">
                                <span className="text-violet-400">{step.id}.</span>
                                <span>{step.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mb-8 p-8 text-center bg-white/5 rounded-xl">
                    <p className="text-zinc-500">Brak SOP do analizy. Wróć do kroku 1.</p>
                </div>
            )}

            {/* Analysis Button */}
            {!analysisComplete && (
                <div className="text-center mb-8">
                    <button
                        onClick={runAnalysis}
                        disabled={isAnalyzing || !sop}
                        className="btn-primary"
                    >
                        {isAnalyzing ? (
                            <>
                                <span className="animate-pulse">🔍</span> Analizuję SOP...
                            </>
                        ) : (
                            <>
                                🔍 Uruchom Audyt MUDA
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Analysis Results */}
            {analysisComplete && wastes.length > 0 && (
                <div className="space-y-4 animate-fadeIn">
                    <h3 className="font-semibold flex items-center gap-2">
                        <span className="text-amber-400">⚠️</span>
                        Zidentyfikowane marnotrawstwa ({wastes.length})
                    </h3>

                    {wastes.map((waste, index) => {
                        const mudaInfo = MUDA_TYPES.find(m => m.type === waste.muda_type);
                        return (
                            <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`stage-badge ${mudaInfo?.color}`}>
                                            {mudaInfo?.icon} {waste.muda_type}
                                        </span>
                                        <span className="text-zinc-500 text-sm">Krok {waste.step_id}</span>
                                    </div>
                                    <span className="text-emerald-400 text-sm font-medium">
                                        ⏱️ -{waste.time_saving_sec}s
                                    </span>
                                </div>
                                <p className="text-sm mb-2">{waste.problem}</p>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                                    <p className="text-sm text-emerald-400">
                                        <strong>Kaizen:</strong> {waste.kaizen_proposal}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-xl">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-amber-400">{wastes.length}</div>
                            <div className="text-xs text-zinc-500">MUDA znalezione</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-400">
                                {Math.round(wastes.reduce((acc, w) => acc + w.time_saving_sec, 0) / 60)} min
                            </div>
                            <div className="text-xs text-zinc-500">Potencjalna oszczędność</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-cyan-400">
                                {Math.round((wastes.filter(w => w.automation_potential !== 'none').length / wastes.length) * 100)}%
                            </div>
                            <div className="text-xs text-zinc-500">Potencjał automatyzacji</div>
                        </div>
                    </div>

                    {/* Continue Button */}
                    <div className="flex justify-end pt-4">
                        <button onClick={saveMudaReport} className="btn-primary">
                            Zapisz raport i kontynuuj →
                        </button>
                    </div>
                </div>
            )}
        </PipelineLayout>
    );
}
