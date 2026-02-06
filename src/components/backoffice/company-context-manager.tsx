'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    Users,
    UserCircle,
    Briefcase,
    Target,
    Save,
    Loader2,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Department {
    id: string;
    name: string;
    leader: string;
    description: string;
}

interface KeyPerson {
    id: string;
    name: string;
    role: string;
    expertise: string;
}

interface CompanyContext {
    company: {
        name: string;
        industry: string;
        size: string;
        mission: string;
        values: string;
    };
    departments: Department[];
    keyPeople: KeyPerson[];
    ontology: string;
    transformationGoals: string;
}

const defaultContext: CompanyContext = {
    company: {
        name: '',
        industry: '',
        size: '',
        mission: '',
        values: '',
    },
    departments: [],
    keyPeople: [],
    ontology: '',
    transformationGoals: '',
};

export function CompanyContextManager() {
    const [context, setContext] = useState<CompanyContext>(defaultContext);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        company: true,
        departments: true,
        people: true,
        ontology: true,
        goals: true,
    });

    // Load saved context
    useEffect(() => {
        const loadContext = async () => {
            setLoading(true);
            try {
                const saved = localStorage.getItem('vantage-company-context');
                if (saved) {
                    setContext(JSON.parse(saved));
                }
            } catch (error) {
                console.error('Failed to load context:', error);
            } finally {
                setLoading(false);
            }
        };
        loadContext();
    }, []);

    // Save context
    const saveContext = async () => {
        setSaving(true);
        try {
            localStorage.setItem('vantage-company-context', JSON.stringify(context));
            toast.success('Kontekst zapisany!', {
                description: 'Dane firmowe zostały zapisane.',
            });
        } catch (error) {
            toast.error('Błąd zapisu', {
                description: 'Nie udało się zapisać kontekstu.',
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const addDepartment = () => {
        setContext(prev => ({
            ...prev,
            departments: [
                ...prev.departments,
                { id: crypto.randomUUID(), name: '', leader: '', description: '' }
            ],
        }));
    };

    const removeDepartment = (id: string) => {
        setContext(prev => ({
            ...prev,
            departments: prev.departments.filter(d => d.id !== id),
        }));
    };

    const updateDepartment = (id: string, field: keyof Department, value: string) => {
        setContext(prev => ({
            ...prev,
            departments: prev.departments.map(d =>
                d.id === id ? { ...d, [field]: value } : d
            ),
        }));
    };

    const addKeyPerson = () => {
        setContext(prev => ({
            ...prev,
            keyPeople: [
                ...prev.keyPeople,
                { id: crypto.randomUUID(), name: '', role: '', expertise: '' }
            ],
        }));
    };

    const removeKeyPerson = (id: string) => {
        setContext(prev => ({
            ...prev,
            keyPeople: prev.keyPeople.filter(p => p.id !== id),
        }));
    };

    const updateKeyPerson = (id: string, field: keyof KeyPerson, value: string) => {
        setContext(prev => ({
            ...prev,
            keyPeople: prev.keyPeople.map(p =>
                p.id === id ? { ...p, [field]: value } : p
            ),
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={saveContext} disabled={saving} className="gap-2">
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    Zapisz kontekst
                </Button>
            </div>

            {/* Company Info */}
            <Card>
                <CardHeader className="cursor-pointer" onClick={() => toggleSection('company')}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <CardTitle>Firma</CardTitle>
                                <CardDescription>Podstawowe informacje o firmie</CardDescription>
                            </div>
                        </div>
                        {expandedSections.company ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                </CardHeader>
                {expandedSections.company && (
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nazwa firmy</label>
                                <Input
                                    placeholder="np. Acme Corp"
                                    value={context.company.name}
                                    onChange={(e) => setContext(prev => ({
                                        ...prev,
                                        company: { ...prev.company, name: e.target.value }
                                    }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Branża</label>
                                <Input
                                    placeholder="np. Technologia, Produkcja"
                                    value={context.company.industry}
                                    onChange={(e) => setContext(prev => ({
                                        ...prev,
                                        company: { ...prev.company, industry: e.target.value }
                                    }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Wielkość (liczba pracowników)</label>
                            <Input
                                placeholder="np. 50-100, 500+"
                                value={context.company.size}
                                onChange={(e) => setContext(prev => ({
                                    ...prev,
                                    company: { ...prev.company, size: e.target.value }
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Misja</label>
                            <Textarea
                                placeholder="Opisz misję firmy..."
                                value={context.company.mission}
                                onChange={(e) => setContext(prev => ({
                                    ...prev,
                                    company: { ...prev.company, mission: e.target.value }
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Wartości</label>
                            <Textarea
                                placeholder="Kluczowe wartości firmy..."
                                value={context.company.values}
                                onChange={(e) => setContext(prev => ({
                                    ...prev,
                                    company: { ...prev.company, values: e.target.value }
                                }))}
                            />
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Departments */}
            <Card>
                <CardHeader className="cursor-pointer" onClick={() => toggleSection('departments')}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-500/20">
                                <Briefcase className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <CardTitle>Działy</CardTitle>
                                <CardDescription>Struktura organizacyjna i liderzy działów</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{context.departments.length}</Badge>
                            {expandedSections.departments ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                    </div>
                </CardHeader>
                {expandedSections.departments && (
                    <CardContent className="space-y-4">
                        {context.departments.map((dept, index) => (
                            <motion.div
                                key={dept.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 border rounded-lg space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Dział #{index + 1}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeDepartment(dept.id)}
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        placeholder="Nazwa działu"
                                        value={dept.name}
                                        onChange={(e) => updateDepartment(dept.id, 'name', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Lider działu"
                                        value={dept.leader}
                                        onChange={(e) => updateDepartment(dept.id, 'leader', e.target.value)}
                                    />
                                </div>
                                <Input
                                    placeholder="Opis / zakres odpowiedzialności"
                                    value={dept.description}
                                    onChange={(e) => updateDepartment(dept.id, 'description', e.target.value)}
                                />
                            </motion.div>
                        ))}
                        <Button variant="outline" onClick={addDepartment} className="w-full gap-2">
                            <Plus className="h-4 w-4" />
                            Dodaj dział
                        </Button>
                    </CardContent>
                )}
            </Card>

            {/* Key People */}
            <Card>
                <CardHeader className="cursor-pointer" onClick={() => toggleSection('people')}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/20">
                                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <CardTitle>Kluczowi Pracownicy</CardTitle>
                                <CardDescription>Eksperci i osoby decyzyjne</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{context.keyPeople.length}</Badge>
                            {expandedSections.people ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                    </div>
                </CardHeader>
                {expandedSections.people && (
                    <CardContent className="space-y-4">
                        {context.keyPeople.map((person, index) => (
                            <motion.div
                                key={person.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 border rounded-lg space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Osoba #{index + 1}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeKeyPerson(person.id)}
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        placeholder="Imię i nazwisko"
                                        value={person.name}
                                        onChange={(e) => updateKeyPerson(person.id, 'name', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Stanowisko"
                                        value={person.role}
                                        onChange={(e) => updateKeyPerson(person.id, 'role', e.target.value)}
                                    />
                                </div>
                                <Input
                                    placeholder="Obszar ekspertyzy / kompetencje"
                                    value={person.expertise}
                                    onChange={(e) => updateKeyPerson(person.id, 'expertise', e.target.value)}
                                />
                            </motion.div>
                        ))}
                        <Button variant="outline" onClick={addKeyPerson} className="w-full gap-2">
                            <Plus className="h-4 w-4" />
                            Dodaj osobę
                        </Button>
                    </CardContent>
                )}
            </Card>

            {/* Ontology */}
            <Card>
                <CardHeader className="cursor-pointer" onClick={() => toggleSection('ontology')}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                                <UserCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <CardTitle>Ontologia Firmowa</CardTitle>
                                <CardDescription>Słownik firmowy - specyficzne terminy i definicje</CardDescription>
                            </div>
                        </div>
                        {expandedSections.ontology ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                </CardHeader>
                {expandedSections.ontology && (
                    <CardContent>
                        <Textarea
                            placeholder="Opisz specyficzne terminy używane w firmie, np:\n\n• KPI - Key Performance Indicator\n• Sprint - 2-tygodniowy cykl pracy\n• Stakeholder - zainteresowana strona..."
                            className="min-h-[150px]"
                            value={context.ontology}
                            onChange={(e) => setContext(prev => ({
                                ...prev,
                                ontology: e.target.value
                            }))}
                        />
                    </CardContent>
                )}
            </Card>

            {/* Transformation Goals */}
            <Card>
                <CardHeader className="cursor-pointer" onClick={() => toggleSection('goals')}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-500/20">
                                <Target className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <CardTitle>Cel Transformacji AI</CardTitle>
                                <CardDescription>Wizja, cele i KPI transformacji</CardDescription>
                            </div>
                        </div>
                        {expandedSections.goals ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                </CardHeader>
                {expandedSections.goals && (
                    <CardContent>
                        <Textarea
                            placeholder="Opisz cele transformacji AI, np:\n\n• Automatyzacja procesu obsługi klienta\n• Redukcja czasu raportowania o 50%\n• Wdrożenie AI asystenta dla zespołu sprzedaży..."
                            className="min-h-[150px]"
                            value={context.transformationGoals}
                            onChange={(e) => setContext(prev => ({
                                ...prev,
                                transformationGoals: e.target.value
                            }))}
                        />
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
