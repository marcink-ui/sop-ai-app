'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText,
    Upload,
    Mic,
    ArrowLeft,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreatableCombobox } from '@/components/ui/creatable-combobox';
import { sopDb } from '@/lib/db';
import type { SOP } from '@/lib/types';
import Link from 'next/link';

const departments = [
    'Sprzedaż',
    'Marketing',
    'Operacje',
    'Finanse',
    'HR',
    'IT',
    'Obsługa Klienta',
    'Produkcja',
    'Logistyka',
    'Inne',
].map(d => ({ label: d, value: d }));

const commonRoles = [
    'Specjalista',
    'Manager',
    'Dyrektor',
    'Asystent',
    'Analityk',
    'Konsultant',
    'Administrator',
].map(r => ({ label: r, value: r }));

const commonTriggers = [
    'Otrzymanie e-maila od klienta',
    'Nowe zamówienie w systemie',
    'Koniec miesiąca',
    'Zgłoszenie błędu',
    'Nowy pracownik',
    'Spotkanie statusowe',
];

export default function NewSOPPage() {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [inputMode, setInputMode] = useState<'text' | 'audio'>('text');

    const [availableDepartments, setAvailableDepartments] = useState(departments);
    const [availableRoles, setAvailableRoles] = useState(commonRoles);

    const [form, setForm] = useState({
        processName: '',
        department: '',
        role: '',
        trigger: '',
        outcome: '',
        transcript: '',
    });

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreateDepartment = (value: string) => {
        setAvailableDepartments(prev => [...prev, { label: value, value }]);
        setForm(prev => ({ ...prev, department: value }));
    };

    const handleCreateRole = (value: string) => {
        setAvailableRoles(prev => [...prev, { label: value, value }]);
        setForm(prev => ({ ...prev, role: value }));
    };

    const handleGenerate = async () => {
        if (!form.processName || !form.department || !form.transcript) {
            alert('Please fill in Process Name, Department, and Transcript');
            return;
        }

        setIsGenerating(true);

        // Simulate AI generation (replace with actual API call)
        setTimeout(() => {
            const newSop: SOP = {
                id: `sop-${Date.now()}`,
                meta: {
                    process_name: form.processName,
                    department: form.department,
                    role: form.role || 'Not specified',
                    owner: 'SOP-AI Generator',
                    version: '1.0',
                    created_date: new Date().toISOString(),
                    updated_date: new Date().toISOString(),
                    estimated_time: '10 min',
                },
                purpose: `Process triggered by: ${form.trigger || 'N/A'}. Expected outcome: ${form.outcome || 'N/A'}`,
                scope: {
                    trigger: form.trigger || 'Not specified',
                    outcome: form.outcome || 'Not specified',
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
                steps: [
                    {
                        id: 1,
                        name: 'Initial Step',
                        actions: ['Review and process the input according to standard procedures'],
                    },
                ],
                troubleshooting: [],
                definition_of_done: [form.outcome || 'Process completed successfully'],
                metrics: {
                    frequency_per_day: 1,
                    avg_time_min: 10,
                    people_count: 1,
                },
                dictionary_candidates: [],
                exceptions: [],
                status: 'generated',
            };

            sopDb.save(newSop);
            setIsGenerating(false);
            router.push('/sops');
        }, 2000);
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/sops">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/20 p-2">
                        <FileText className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">New SOP</h1>
                        <p className="text-sm text-muted-foreground">Create from transcript or audio</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-6 rounded-xl border border-border bg-card p-6">
                {/* Pre-questions */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Process Details</h2>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Process Name <span className="text-red-500 dark:text-red-400">*</span>
                            </label>
                            <Input
                                placeholder="e.g., Customer Onboarding"
                                value={form.processName}
                                onChange={(e) => handleChange('processName', e.target.value)}
                                className="bg-background border-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Department <span className="text-red-500 dark:text-red-400">*</span>
                            </label>
                            <CreatableCombobox
                                options={availableDepartments}
                                value={form.department}
                                onChange={(v) => handleChange('department', v)}
                                onCreate={handleCreateDepartment}
                                placeholder="Select or type department..."
                                className="bg-background border-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Primary Role <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
                            </label>
                            <CreatableCombobox
                                options={availableRoles}
                                value={form.role}
                                onChange={(v) => handleChange('role', v)}
                                onCreate={handleCreateRole}
                                placeholder="Select or type role..."
                                className="bg-background border-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Trigger <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
                            </label>
                            <Input
                                placeholder="What starts this process?"
                                value={form.trigger}
                                onChange={(e) => handleChange('trigger', e.target.value)}
                                className="bg-background border-input"
                                list="triggers-list"
                            />
                            <datalist id="triggers-list">
                                {commonTriggers.map(t => (
                                    <option key={t} value={t} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Expected Outcome <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
                        </label>
                        <Input
                            placeholder="What is the end result?"
                            value={form.outcome}
                            onChange={(e) => handleChange('outcome', e.target.value)}
                            className="bg-background border-input"
                        />
                    </div>
                </div>

                {/* Input Mode Tabs */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Process Description</h2>

                    <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'text' | 'audio')}>
                        <TabsList className="bg-muted">
                            <TabsTrigger value="text" className="data-[state=active]:bg-background">
                                <FileText className="mr-2 h-4 w-4" />
                                Paste Transcript
                            </TabsTrigger>
                            <TabsTrigger value="audio" className="data-[state=active]:bg-background">
                                <Mic className="mr-2 h-4 w-4" />
                                Upload Audio
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="text" className="mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Transcript <span className="text-red-500 dark:text-red-400">*</span>
                                </label>
                                <Textarea
                                    placeholder="Paste the transcript of your process explanation here...

Example:
'First, I log into the CRM system. Then I check for new leads assigned to me. For each lead, I review their company profile and prepare a personalized outreach message...'"
                                    value={form.transcript}
                                    onChange={(e) => handleChange('transcript', e.target.value)}
                                    className="min-h-[200px] bg-background border-input font-mono text-sm"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Paste a recording transcript from Fireflies, Otter, or any other source
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="audio" className="mt-4">
                            <div className="rounded-lg border-2 border-dashed border-border bg-muted/50 p-8 text-center">
                                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">
                                    Drag and drop an audio file or click to browse
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Supports: MP3, WAV, M4A, OGG (max 25MB)
                                </p>
                                <Button variant="outline" className="mt-4">
                                    Choose File
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Generate Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Link href="/sops">
                        <Button variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isGenerating ? (
                            <>
                                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate SOP
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
