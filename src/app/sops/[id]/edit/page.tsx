'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    Save,
    Eye,
    Trash2,
    Plus,
    GripVertical,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Clock,
    User,
    Building2,
    Zap,
    Loader2,
    Video,
    FileText,
    Tag,
    RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreatableCombobox } from '@/components/ui/creatable-combobox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { sopDb } from '@/lib/db';
import type { SOP } from '@/lib/types';

interface SOPStep {
    id: string;
    title: string;
    description: string;
    responsible: string;
    tools: string[];
    warnings: string[];
    estimatedTime: string;
}

// Prisma SOP shape
interface PrismaSOP {
    id: string;
    title: string;
    code: string;
    version: string;
    status: string;
    purpose: string | null;
    scope: string | null;
    definitions: Record<string, string> | null;
    steps: { order: number; title: string; description: string; responsible: string }[] | null;
    kpis: { name: string; target: string; current: string }[] | null;
    owner: string | null;
    reviewer: string | null;
    department: { id: string; name: string } | null;
    createdBy: { id: string; name: string; email: string } | null;
    tags: { id: string; name: string }[];
}

type DataSource = 'prisma' | 'local' | null;

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

const statusOptions = [
    { value: 'DRAFT', label: 'Szkic', color: 'bg-neutral-800 text-neutral-400' },
    { value: 'IN_REVIEW', label: 'W recenzji', color: 'bg-orange-500/20 text-orange-400' },
    { value: 'APPROVED', label: 'Zatwierdzony', color: 'bg-green-500/20 text-green-400' },
    { value: 'DEPRECATED', label: 'Przestarzały', color: 'bg-red-500/20 text-red-400' },
    { value: 'ARCHIVED', label: 'Zarchiwizowany', color: 'bg-neutral-800 text-neutral-500' },
];

// Map local SOP statuses to Prisma statuses
function mapLocalStatus(status: string): string {
    const map: Record<string, string> = {
        draft: 'DRAFT',
        generated: 'IN_REVIEW',
        audited: 'IN_REVIEW',
        architected: 'IN_REVIEW',
        'prompt-generated': 'IN_REVIEW',
        completed: 'APPROVED',
    };
    return map[status] || 'DRAFT';
}

export default function SOPEditPage() {
    const params = useParams();
    const router = useRouter();
    const sopId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [dataSource, setDataSource] = useState<DataSource>(null);
    const [expandedStep, setExpandedStep] = useState<string | null>(null);
    const [tagsInput, setTagsInput] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        department: '',
        owner: '',
        reviewer: '',
        trigger: '',
        objective: '',
        scope: '',
        role: '',
        status: 'DRAFT',
        // Coda-aligned fields
        description: '',
        videoLink: '',
        transcript: '',
        tags: [] as string[],
        steps: [] as SOPStep[],
    });

    const [availableDepartments, setAvailableDepartments] = useState(departments);
    const [availableRoles, setAvailableRoles] = useState(commonRoles);

    // Load SOP data from API or localStorage
    useEffect(() => {
        loadSOP();
    }, [sopId]);

    const loadSOP = async () => {
        setIsLoading(true);

        // Try API first (Prisma)
        try {
            const response = await fetch(`/api/sops/${sopId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.sop) {
                    const sop = data.sop as PrismaSOP;
                    setFormData({
                        name: sop.title || '',
                        code: sop.code || '',
                        department: sop.department?.name || '',
                        owner: sop.owner || '',
                        reviewer: sop.reviewer || '',
                        trigger: '',
                        objective: sop.purpose || '',
                        scope: sop.scope || '',
                        role: sop.owner || '',
                        status: sop.status || 'DRAFT',
                        description: sop.purpose || '',
                        videoLink: '',
                        transcript: '',
                        tags: sop.tags?.map(t => t.name) || [],
                        steps: (sop.steps || []).map((step, index) => ({
                            id: `step-${index}`,
                            title: step.title || `Krok ${index + 1}`,
                            description: step.description || '',
                            responsible: step.responsible || '',
                            tools: [],
                            warnings: [],
                            estimatedTime: '5 min',
                        })),
                    });
                    setTagsInput((sop.tags || []).map(t => t.name).join(', '));
                    setDataSource('prisma');
                    setIsLoading(false);
                    return;
                }
            }
        } catch {
            // API not available
        }

        // Fallback to localStorage
        const localSop = sopDb.getById(sopId);
        if (localSop) {
            setFormData({
                name: localSop.meta.process_name || '',
                code: '',
                department: localSop.meta.department || '',
                owner: localSop.meta.owner || '',
                reviewer: '',
                trigger: localSop.scope?.trigger || '',
                objective: localSop.purpose || '',
                scope: localSop.scope ? `START: ${localSop.scope.trigger}\nSTOP: ${localSop.scope.outcome}` : '',
                role: localSop.meta.role || '',
                status: mapLocalStatus(localSop.status),
                description: localSop.purpose || '',
                videoLink: '',
                transcript: '',
                tags: [],
                steps: (localSop.steps || []).map((step, index) => ({
                    id: `step-${index}`,
                    title: step.name || `Krok ${index + 1}`,
                    description: step.actions?.join('\n') || '',
                    responsible: localSop.meta.role || '',
                    tools: step.tool ? [step.tool] : [],
                    warnings: [],
                    estimatedTime: '5 min',
                })),
            });
            setDataSource('local');

            // Ensure department is in the options
            if (localSop.meta.department && !departments.find(d => d.value === localSop.meta.department)) {
                setAvailableDepartments(prev => [...prev, { label: localSop.meta.department, value: localSop.meta.department }]);
            }
            if (localSop.meta.role && !commonRoles.find(r => r.value === localSop.meta.role)) {
                setAvailableRoles(prev => [...prev, { label: localSop.meta.role, value: localSop.meta.role }]);
            }
        }

        setIsLoading(false);
    };

    const handleCreateDepartment = (value: string) => {
        setAvailableDepartments(prev => [...prev, { label: value, value }]);
        setFormData(prev => ({ ...prev, department: value }));
    };

    const handleCreateRole = (value: string) => {
        setAvailableRoles(prev => [...prev, { label: value, value }]);
        setFormData(prev => ({ ...prev, role: value }));
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('Nazwa procedury jest wymagana');
            return;
        }

        setIsSaving(true);

        try {
            if (dataSource === 'prisma') {
                // Save to API via PUT
                const apiPayload = {
                    title: formData.name,
                    purpose: formData.objective || formData.description,
                    scope: formData.scope,
                    owner: formData.owner,
                    reviewer: formData.reviewer,
                    status: formData.status,
                    steps: formData.steps.map((step, index) => ({
                        order: index + 1,
                        title: step.title,
                        description: step.description,
                        responsible: step.responsible,
                    })),
                };

                const response = await fetch(`/api/sops/${sopId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(apiPayload),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to save');
                }

                toast.success('SOP zapisany pomyślnie');
            } else {
                // Save to localStorage
                const localSop = sopDb.getById(sopId);
                if (localSop) {
                    const updated: SOP = {
                        ...localSop,
                        meta: {
                            ...localSop.meta,
                            process_name: formData.name,
                            department: formData.department,
                            owner: formData.owner,
                            role: formData.role,
                            updated_date: new Date().toISOString(),
                        },
                        purpose: formData.objective,
                        scope: {
                            trigger: formData.trigger,
                            outcome: formData.scope,
                        },
                        steps: formData.steps.map((step, index) => ({
                            id: index + 1,
                            name: step.title,
                            actions: step.description.split('\n').filter(Boolean),
                            tool: step.tools[0] || undefined,
                        })),
                    };
                    sopDb.save(updated);
                    toast.success('SOP zapisany lokalnie');
                }
            }

            router.push(`/sops/${sopId}`);
        } catch (error) {
            console.error('Save error:', error);
            toast.error(`Błąd zapisu: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const addStep = () => {
        const newStep: SOPStep = {
            id: `step-${Date.now()}`,
            title: `Krok ${formData.steps.length + 1}`,
            description: '',
            responsible: '',
            tools: [],
            warnings: [],
            estimatedTime: '5 min',
        };
        setFormData({ ...formData, steps: [...formData.steps, newStep] });
        setExpandedStep(newStep.id);
    };

    const removeStep = (stepId: string) => {
        setFormData({
            ...formData,
            steps: formData.steps.filter(s => s.id !== stepId),
        });
        toast.success('Krok usunięty');
    };

    const updateStep = (stepId: string, field: keyof SOPStep, value: string | string[]) => {
        setFormData({
            ...formData,
            steps: formData.steps.map(s =>
                s.id === stepId ? { ...s, [field]: value } : s
            ),
        });
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-500 mx-auto" />
                    <p className="text-muted-foreground">Ładowanie SOP...</p>
                </div>
            </div>
        );
    }

    // Not found
    if (!dataSource) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <FileText className="mx-auto h-16 w-16 text-muted-foreground/20" />
                    <h2 className="text-xl font-semibold text-foreground">SOP nie znaleziony</h2>
                    <p className="text-muted-foreground">Procedura o tym ID nie istnieje.</p>
                    <Link href="/sops">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Wróć do listy
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const currentStatusOption = statusOptions.find(s => s.value === formData.status) || statusOptions[0];

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <Link href={`/sops/${sopId}`}>
                        <Button variant="ghost" size="icon" className="hover:bg-muted">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Edycja SOP</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Modyfikuj procedurę krok po kroku</span>
                            <span className="text-muted-foreground/50">•</span>
                            <Badge variant="outline" className="text-xs">
                                {dataSource === 'prisma' ? 'API' : 'Lokalnie'}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/sops/${sopId}`}>
                        <Button variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Podgląd
                        </Button>
                    </Link>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-violet-600 hover:bg-violet-700"
                    >
                        {isSaving ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                    </Button>
                </div>
            </motion.div>

            {/* Status + Code Row */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="grid gap-4 sm:grid-cols-3"
            >
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                        <SelectTrigger className="mt-1.5 bg-muted/30">
                            <SelectValue>
                                <Badge className={currentStatusOption.color}>{currentStatusOption.label}</Badge>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    <Badge className={opt.color}>{opt.label}</Badge>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {formData.code && (
                    <div className="rounded-xl border border-border bg-card/50 p-4">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Kod SOP</Label>
                        <p className="mt-1.5 text-foreground font-mono text-sm">{formData.code}</p>
                    </div>
                )}
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        <Tag className="inline h-3 w-3 mr-1" />
                        Tagi
                    </Label>
                    <Input
                        value={tagsInput}
                        onChange={(e) => {
                            setTagsInput(e.target.value);
                            setFormData({
                                ...formData,
                                tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean),
                            });
                        }}
                        placeholder="Sprzedaż, Przetargi, ..."
                        className="mt-1.5 bg-muted/30"
                    />
                </div>
            </motion.div>

            {/* Basic Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-xl border border-border bg-card/50 p-6"
            >
                <h2 className="text-lg font-semibold text-foreground mb-4">Informacje podstawowe</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="name">Nazwa procedury</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-muted/30"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="department">
                            <Building2 className="inline h-4 w-4 mr-1" />
                            Dział
                        </Label>
                        <CreatableCombobox
                            options={availableDepartments}
                            value={formData.department}
                            onChange={(v) => setFormData({ ...formData, department: v })}
                            onCreate={handleCreateDepartment}
                            placeholder="Wybierz lub wpisz dział..."
                            className="bg-muted/30"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="owner">
                            <User className="inline h-4 w-4 mr-1" />
                            Właściciel
                        </Label>
                        <Input
                            id="owner"
                            value={formData.owner}
                            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                            className="bg-muted/30"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">
                            <User className="inline h-4 w-4 mr-1" />
                            Rola (Primary Role)
                        </Label>
                        <CreatableCombobox
                            options={availableRoles}
                            value={formData.role}
                            onChange={(v) => setFormData({ ...formData, role: v })}
                            onCreate={handleCreateRole}
                            placeholder="Wybierz lub wpisz rolę..."
                            className="bg-muted/30"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reviewer">
                            <User className="inline h-4 w-4 mr-1" />
                            Recenzent
                        </Label>
                        <Input
                            id="reviewer"
                            value={formData.reviewer}
                            onChange={(e) => setFormData({ ...formData, reviewer: e.target.value })}
                            placeholder="Osoba recenzująca..."
                            className="bg-muted/30"
                        />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="trigger">
                            <Zap className="inline h-4 w-4 mr-1" />
                            Trigger (kiedy uruchomić)
                        </Label>
                        <Input
                            id="trigger"
                            value={formData.trigger}
                            onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                            placeholder="np. Nowe zapytanie od klienta..."
                            className="bg-muted/30"
                            list="triggers-list-edit"
                        />
                        <datalist id="triggers-list-edit">
                            {commonTriggers.map(t => (
                                <option key={t} value={t} />
                            ))}
                        </datalist>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="objective">Cel procedury</Label>
                        <textarea
                            id="objective"
                            value={formData.objective}
                            onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                            className="w-full h-20 px-3 py-2 rounded-lg bg-muted/30 border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="scope">Zakres (Scope)</Label>
                        <textarea
                            id="scope"
                            value={formData.scope}
                            onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                            placeholder="START: ... STOP: ..."
                            className="w-full h-20 px-3 py-2 rounded-lg bg-muted/30 border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Coda-aligned: Video & Transcript */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="rounded-xl border border-border bg-card/50 p-6"
            >
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Video className="h-5 w-5 text-violet-400" />
                    Źródło wiedzy (Coda Pipeline)
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="videoLink">
                            <Video className="inline h-4 w-4 mr-1" />
                            Link do nagrania
                        </Label>
                        <Input
                            id="videoLink"
                            value={formData.videoLink}
                            onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                            placeholder="https://kommodo.ai/recordings/... lub link YouTube"
                            className="bg-muted/30"
                        />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="transcript">
                            <FileText className="inline h-4 w-4 mr-1" />
                            Transkrypt
                        </Label>
                        <textarea
                            id="transcript"
                            value={formData.transcript}
                            onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                            placeholder="Wklej transkrypt nagrania procesu..."
                            className="w-full h-32 px-3 py-2 rounded-lg bg-muted/30 border border-input text-sm resize-y focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Steps */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-3"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Kroki procedury</h2>
                    <Button onClick={addStep} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Dodaj krok
                    </Button>
                </div>

                {formData.steps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="rounded-xl border border-border bg-card/50 overflow-hidden"
                    >
                        <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                        >
                            <div className="flex items-center gap-3">
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 font-semibold text-sm">
                                    {index + 1}
                                </div>
                                <Input
                                    value={step.title}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        updateStep(step.id, 'title', e.target.value);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-transparent border-none font-medium text-foreground w-auto max-w-md"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeStep(step.id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                {expandedStep === step.id ? (
                                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                        </div>

                        {expandedStep === step.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-border p-4 space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label>Opis</Label>
                                    <textarea
                                        value={step.description}
                                        onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                                        className="w-full h-20 px-3 py-2 rounded-lg bg-muted/30 border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                        placeholder="Szczegółowy opis kroku..."
                                    />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Odpowiedzialny</Label>
                                        <Input
                                            value={step.responsible}
                                            onChange={(e) => updateStep(step.id, 'responsible', e.target.value)}
                                            placeholder="Rola lub osoba..."
                                            className="bg-muted/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>
                                            <Clock className="inline h-4 w-4 mr-1" />
                                            Szacowany czas
                                        </Label>
                                        <Input
                                            value={step.estimatedTime}
                                            onChange={(e) => updateStep(step.id, 'estimatedTime', e.target.value)}
                                            placeholder="np. 10 min"
                                            className="bg-muted/30"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Narzędzia (oddziel przecinkami)</Label>
                                    <Input
                                        value={step.tools.join(', ')}
                                        onChange={(e) => updateStep(step.id, 'tools', e.target.value.split(',').map(t => t.trim()))}
                                        placeholder="CRM, Email, Excel..."
                                        className="bg-muted/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        Ostrzeżenia
                                    </Label>
                                    <Input
                                        value={step.warnings.join(', ')}
                                        onChange={(e) => updateStep(step.id, 'warnings', e.target.value.split(',').map(w => w.trim()))}
                                        placeholder="Uwagi, ryzyka..."
                                        className="bg-muted/30"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}

                {formData.steps.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
                        <p className="text-muted-foreground mb-4">Brak kroków. Dodaj pierwszy krok procedury.</p>
                        <Button onClick={addStep} variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Dodaj krok
                        </Button>
                    </div>
                )}
            </motion.div>

            {/* Bottom save button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex justify-end gap-2 pt-4 border-t border-border"
            >
                <Link href={`/sops/${sopId}`}>
                    <Button variant="outline">Anuluj</Button>
                </Link>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-violet-600 hover:bg-violet-700"
                >
                    {isSaving ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </Button>
            </motion.div>
        </div>
    );
}
