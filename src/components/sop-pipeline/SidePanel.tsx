'use client';

import { useState, useEffect } from 'react';
import { BookOpen, GitBranch, FileText, Brain, ChevronDown, ChevronRight } from 'lucide-react';

interface SidePanelProps {
    sopId: string;
    ontology?: Array<{ term: string; definition: string; domain?: string }>;
    valueChainLinks?: Array<{ id: string; label: string; type: string }>;
    canvasPreview?: Record<string, unknown> | null;
    notes?: string;
    onNotesChange?: (notes: string) => void;
}

interface SectionProps {
    title: string;
    icon: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
    count?: number;
}

function Section({ title, icon, defaultOpen = false, children, count }: SectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-zinc-800 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800/50 transition-colors"
            >
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                    {icon}
                    {title}
                    {count !== undefined && (
                        <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">{count}</span>
                    )}
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
            </button>
            {isOpen && (
                <div className="px-4 pb-3">
                    {children}
                </div>
            )}
        </div>
    );
}

export function SidePanel({ ontology, valueChainLinks, canvasPreview, notes, onNotesChange }: SidePanelProps) {
    const [localNotes, setLocalNotes] = useState(notes || '');

    useEffect(() => {
        setLocalNotes(notes || '');
    }, [notes]);

    const handleNotesBlur = () => {
        if (localNotes !== notes) {
            onNotesChange?.(localNotes);
        }
    };

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            {/* Ontology / Dictionary */}
            <Section
                title="Słownik / Ontologia"
                icon={<BookOpen className="w-4 h-4 text-blue-400" />}
                count={ontology?.length}
                defaultOpen={!!ontology?.length}
            >
                {ontology && ontology.length > 0 ? (
                    <div className="space-y-2">
                        {ontology.map((entry, i) => (
                            <div key={i} className="text-sm">
                                <span className="font-medium text-zinc-200">{entry.term}</span>
                                {entry.domain && (
                                    <span className="text-xs text-zinc-600 ml-1">({entry.domain})</span>
                                )}
                                <p className="text-zinc-400 text-xs mt-0.5">{entry.definition}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-zinc-500">Brak terminów — zostaną wyekstrahowane z transkrypcji.</p>
                )}
            </Section>

            {/* Value Chain Links */}
            <Section
                title="Łańcuch Wartości"
                icon={<GitBranch className="w-4 h-4 text-purple-400" />}
                count={valueChainLinks?.length}
            >
                {valueChainLinks && valueChainLinks.length > 0 ? (
                    <div className="space-y-1.5">
                        {valueChainLinks.map((link) => (
                            <div key={link.id} className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-purple-500" />
                                <span className="text-zinc-300">{link.label}</span>
                                <span className="text-xs text-zinc-600 ml-auto">{link.type}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-zinc-500">SOP nie jest powiązany z łańcuchem wartości.</p>
                )}
            </Section>

            {/* Canvas AI Preview */}
            <Section
                title="Canvas AI"
                icon={<Brain className="w-4 h-4 text-amber-400" />}
            >
                {canvasPreview ? (
                    <div className="space-y-2 text-xs">
                        {Object.entries(canvasPreview).map(([key, val]) => {
                            if (!val || (Array.isArray(val) && val.length === 0)) return null;
                            return (
                                <div key={key}>
                                    <span className="text-zinc-500 uppercase tracking-wider text-[10px]">{key.replace(/_/g, ' ')}</span>
                                    <div className="text-zinc-400 mt-0.5">
                                        {Array.isArray(val)
                                            ? val.slice(0, 3).map((item, i) => (
                                                <div key={i} className="truncate">
                                                    • {typeof item === 'string' ? item : String((item as Record<string, unknown>).name || (item as Record<string, unknown>).goal || JSON.stringify(item).slice(0, 80))}
                                                </div>
                                            ))
                                            : typeof val === 'string'
                                                ? val
                                                : JSON.stringify(val).slice(0, 200)
                                        }
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-zinc-500">Brak danych Canvas AI — wypełnij w backoffice.</p>
                )}
            </Section>

            {/* Notes */}
            <Section
                title="Notatki"
                icon={<FileText className="w-4 h-4 text-emerald-400" />}
                defaultOpen
            >
                <textarea
                    value={localNotes}
                    onChange={(e) => setLocalNotes(e.target.value)}
                    onBlur={handleNotesBlur}
                    placeholder="Dodaj notatki do tego SOP..."
                    rows={4}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
            </Section>
        </div>
    );
}
