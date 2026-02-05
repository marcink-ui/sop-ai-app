'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PipelineLayout from '@/components/pipeline/PipelineLayout';
import { sopDb, generateId } from '@/lib/db';
import { SOP } from '@/lib/types';

export default function Step1Page() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        process_name: '',
        department: '',
        role: '',
        trigger: '',
        outcome: '',
        description: '',
        transcript: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Create new SOP
        const newSop: SOP = {
            id: generateId(),
            meta: {
                process_name: formData.process_name,
                department: formData.department,
                role: formData.role,
                owner: '',
                version: '1.0',
                created_date: new Date().toISOString().split('T')[0],
                updated_date: new Date().toISOString().split('T')[0],
                estimated_time: '',
            },
            purpose: formData.description,
            scope: {
                trigger: formData.trigger,
                outcome: formData.outcome,
            },
            prerequisites: {
                systems: [],
                data_required: [],
            },
            knowledge_base: {
                documents: [],
                quality_checklist: [],
                golden_standard: '',
                warnings: [],
                naming_convention: '',
            },
            steps: [],
            troubleshooting: [],
            definition_of_done: [],
            metrics: {
                frequency_per_day: 0,
                avg_time_min: 0,
                people_count: 1,
            },
            dictionary_candidates: [],
            exceptions: [],
            status: 'generated',
        };

        // Parse transcript into steps if provided
        if (formData.transcript) {
            const lines = formData.transcript.split('\n').filter(l => l.trim());
            newSop.steps = lines.map((line, index) => ({
                id: index + 1,
                name: line.trim(),
                actions: [line.trim()],
            }));
        }

        sopDb.save(newSop);

        // Store current SOP ID for pipeline
        localStorage.setItem('current-sop-id', newSop.id);

        setTimeout(() => {
            setIsLoading(false);
            router.push('/pipeline/step-2');
        }, 1000);
    };

    return (
        <PipelineLayout
            currentStep={1}
            title="Generator SOP"
            description="Przekształć nagranie lub opis procesu w ustrukturyzowany SOP. Odpowiedz na pytania wstępne, aby agent wygenerował procedurę."
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Pre-Questions Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            1. Nazwa procesu <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="np. Ofertowanie B2B"
                            value={formData.process_name}
                            onChange={(e) => setFormData({ ...formData, process_name: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            2. Dział <span className="text-red-400">*</span>
                        </label>
                        <select
                            className="input-field"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            required
                        >
                            <option value="">Wybierz dział...</option>
                            <option value="Sprzedaż">Sprzedaż</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Operacje">Operacje</option>
                            <option value="Serwis">Serwis</option>
                            <option value="HR">HR</option>
                            <option value="Finanse">Finanse</option>
                            <option value="IT">IT</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            3. Rola wykonująca <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="np. Handlowiec, Specjalista ds. obsługi"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            4. Wyzwalacz (START) <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="np. Otrzymanie zapytania ofertowego"
                            value={formData.trigger}
                            onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">
                            5. Wynik (STOP) <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="np. Oferta wysłana do klienta"
                            value={formData.outcome}
                            onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <hr className="border-white/10" />

                {/* Description or Transcript */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Opis procesu / Transkrypt nagrania
                    </label>
                    <p className="text-xs text-zinc-500 mb-3">
                        Wklej transkrypt z Komodo/Fireflies lub opisz proces krok po kroku.
                        Każda linia zostanie przekształcona w krok SOP.
                    </p>
                    <textarea
                        className="textarea-field"
                        rows={10}
                        placeholder={`1. Otworz CRM i znajdź klienta
2. Sprawdź historię zamówień
3. Przygotuj ofertę w szablonie
4. Wyślij do akceptacji managera
5. Po akceptacji wyślij do klienta`}
                        value={formData.transcript}
                        onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                    />
                </div>

                {/* Video Upload (placeholder) */}
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center">
                    <div className="text-3xl mb-3">🎥</div>
                    <p className="text-zinc-400 mb-2">Przeciągnij nagranie lub</p>
                    <button type="button" className="btn-secondary text-sm">
                        Wybierz plik
                    </button>
                    <p className="text-xs text-zinc-600 mt-2">
                        Obsługiwane formaty: MP4, WebM, MP3 • Max 500MB
                    </p>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-pulse">⏳</span> Generowanie SOP...
                            </>
                        ) : (
                            <>
                                Generuj SOP →
                            </>
                        )}
                    </button>
                </div>
            </form>
        </PipelineLayout>
    );
}
