'use client';

import { useState } from 'react';
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
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreatableCombobox } from '@/components/ui/creatable-combobox';
import { toast } from 'sonner';
import { mockSOPs } from '@/lib/sample-data';

interface SOPStep {
    id: string;
    title: string;
    description: string;
    responsible: string;
    tools: string[];
    warnings: string[];
    estimatedTime: string;
}

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

export default function SOPEditPage() {
    const params = useParams();
    const router = useRouter();
    const sopId = params.id as string;

    const [isSaving, setIsSaving] = useState(false);
    const [expandedStep, setExpandedStep] = useState<string | null>(null);

    // Load SOP data
    const sop = mockSOPs.find(s => s.id === sopId);

    const [formData, setFormData] = useState({
        name: sop?.meta.process_name || '',
        department: sop?.meta.department || '',
        owner: sop?.meta.owner || '',
        trigger: sop?.scope?.trigger || '',
        objective: sop?.purpose || '',
        role: sop?.meta.role || '',
        steps: (sop?.steps || []).map((step, index) => ({
            id: `step-${index}`,
            title: step.name || `Krok ${index + 1}`,
            description: step.actions?.join('\n') || '',
            responsible: sop?.meta.role || '',
            tools: step.tool ? [step.tool] : [],
            warnings: [] as string[],
            estimatedTime: '5 min'
        })) as SOPStep[]
    });

    const [availableDepartments, setAvailableDepartments] = useState([
        ...departments,
        ...(sop?.meta.department && !departments.find(d => d.value === sop.meta.department)
            ? [{ label: sop.meta.department, value: sop.meta.department }]
            : [])
    ]);

    const [availableRoles, setAvailableRoles] = useState([
        ...commonRoles,
        ...(sop?.meta.role && !commonRoles.find(r => r.value === sop.meta.role)
            ? [{ label: sop.meta.role, value: sop.meta.role }]
            : [])
    ]);

    const handleCreateDepartment = (value: string) => {
        setAvailableDepartments(prev => [...prev, { label: value, value }]);
        setFormData(prev => ({ ...prev, department: value }));
    };

    const handleCreateRole = (value: string) => {
        setAvailableRoles(prev => [...prev, { label: value, value }]);
        setFormData(prev => ({ ...prev, role: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        toast.success('SOP zapisany pomyślnie');
        router.push(`/sops/${sopId}`);
    };

    const addStep = () => {
        const newStep: SOPStep = {
            id: `step-${Date.now()}`,
            title: `Krok ${formData.steps.length + 1}`,
            description: '',
            responsible: '',
            tools: [],
            warnings: [],
            estimatedTime: '5 min'
        };
        setFormData({ ...formData, steps: [...formData.steps, newStep] });
        setExpandedStep(newStep.id);
    };

    const removeStep = (stepId: string) => {
        setFormData({
            ...formData,
            steps: formData.steps.filter(s => s.id !== stepId)
        });
        toast.success('Krok usunięty');
    };

    const updateStep = (stepId: string, field: keyof SOPStep, value: string | string[]) => {
        setFormData({
            ...formData,
            steps: formData.steps.map(s =>
                s.id === stepId ? { ...s, [field]: value } : s
            )
        });
    };

    if (!sop) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">SOP nie znaleziony</p>
            </div>
        );
    }

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
                        <p className="text-sm text-muted-foreground">Modyfikuj procedurę krok po kroku</p>
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
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                    </Button>
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

                    {/* Role for Citizen Dev context */}
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
        </div>
    );
}
