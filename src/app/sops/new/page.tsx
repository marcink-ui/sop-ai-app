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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
];

export default function NewSOPPage() {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [inputMode, setInputMode] = useState<'text' | 'audio'>('text');

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
                        <FileText className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">New SOP</h1>
                        <p className="text-sm text-neutral-400">Create from transcript or audio</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-6 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
                {/* Pre-questions */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">Process Details</h2>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">
                                Process Name <span className="text-red-400">*</span>
                            </label>
                            <Input
                                placeholder="e.g., Customer Onboarding"
                                value={form.processName}
                                onChange={(e) => handleChange('processName', e.target.value)}
                                className="bg-neutral-900 border-neutral-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">
                                Department <span className="text-red-400">*</span>
                            </label>
                            <Select value={form.department} onValueChange={(v) => handleChange('department', v)}>
                                <SelectTrigger className="bg-neutral-900 border-neutral-800">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Primary Role</label>
                            <Input
                                placeholder="e.g., Sales Representative"
                                value={form.role}
                                onChange={(e) => handleChange('role', e.target.value)}
                                className="bg-neutral-900 border-neutral-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Trigger</label>
                            <Input
                                placeholder="What starts this process?"
                                value={form.trigger}
                                onChange={(e) => handleChange('trigger', e.target.value)}
                                className="bg-neutral-900 border-neutral-800"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Expected Outcome</label>
                        <Input
                            placeholder="What is the end result?"
                            value={form.outcome}
                            onChange={(e) => handleChange('outcome', e.target.value)}
                            className="bg-neutral-900 border-neutral-800"
                        />
                    </div>
                </div>

                {/* Input Mode Tabs */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">Process Description</h2>

                    <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'text' | 'audio')}>
                        <TabsList className="bg-neutral-800">
                            <TabsTrigger value="text" className="data-[state=active]:bg-neutral-700">
                                <FileText className="mr-2 h-4 w-4" />
                                Paste Transcript
                            </TabsTrigger>
                            <TabsTrigger value="audio" className="data-[state=active]:bg-neutral-700">
                                <Mic className="mr-2 h-4 w-4" />
                                Upload Audio
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="text" className="mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-300">
                                    Transcript <span className="text-red-400">*</span>
                                </label>
                                <Textarea
                                    placeholder="Paste the transcript of your process explanation here...

Example:
'First, I log into the CRM system. Then I check for new leads assigned to me. For each lead, I review their company profile and prepare a personalized outreach message...'"
                                    value={form.transcript}
                                    onChange={(e) => handleChange('transcript', e.target.value)}
                                    className="min-h-[200px] bg-neutral-900 border-neutral-800 font-mono text-sm"
                                />
                                <p className="text-xs text-neutral-500">
                                    Paste a recording transcript from Fireflies, Otter, or any other source
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="audio" className="mt-4">
                            <div className="rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-900/50 p-8 text-center">
                                <Upload className="mx-auto h-12 w-12 text-neutral-500" />
                                <p className="mt-4 text-neutral-400">
                                    Drag and drop an audio file or click to browse
                                </p>
                                <p className="mt-2 text-xs text-neutral-500">
                                    Supports: MP3, WAV, M4A, OGG (max 25MB)
                                </p>
                                <Button variant="outline" className="mt-4 border-neutral-700">
                                    Choose File
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Generate Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                    <Link href="/sops">
                        <Button variant="outline" className="border-neutral-700">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-700"
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
