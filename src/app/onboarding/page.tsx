'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Building2,
    FileText,
    Users,
    Network,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    Upload,
    Loader2,
    Target,
    Lightbulb,
} from 'lucide-react';

const STEPS = [
    { id: 1, title: 'Dane Firmy', icon: Building2, description: 'Podstawowe informacje' },
    { id: 2, title: 'Kontekst', icon: FileText, description: 'Transkrypcje i briefy' },
    { id: 3, title: 'Value Chain', icon: Network, description: 'Łańcuch wartości' },
    { id: 4, title: 'Role & SOPs', icon: Users, description: 'Struktura i procedury' },
];

interface CompanyData {
    name: string;
    industry: string;
    size: string;
    description: string;
}

interface ContextData {
    transcript: string;
    challenges: string;
    goals: string;
}

interface ValueChainItem {
    id: string;
    name: string;
    type: 'primary' | 'support';
}

interface SuggestedRole {
    id: string;
    name: string;
    department: string;
    selected: boolean;
}

interface SuggestedSOP {
    id: string;
    title: string;
    role: string;
    priority: 'high' | 'medium' | 'low';
    selected: boolean;
}

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    // Step 1: Company Data
    const [companyData, setCompanyData] = useState<CompanyData>({
        name: '',
        industry: '',
        size: '',
        description: '',
    });

    // Step 2: Context
    const [contextData, setContextData] = useState<ContextData>({
        transcript: '',
        challenges: '',
        goals: '',
    });

    // Step 3: Value Chain (auto-generated based on context)
    const [valueChain, setValueChain] = useState<ValueChainItem[]>([]);

    // Step 4: Suggested Roles & SOPs
    const [suggestedRoles, setSuggestedRoles] = useState<SuggestedRole[]>([]);
    const [suggestedSOPs, setSuggestedSOPs] = useState<SuggestedSOP[]>([]);

    const progress = (currentStep / STEPS.length) * 100;

    const handleNext = async () => {
        if (currentStep === 2 && contextData.transcript) {
            // Process context and generate suggestions
            setIsProcessing(true);
            await generateSuggestions();
            setIsProcessing(false);
        }

        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const generateSuggestions = async () => {
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate value chain based on industry
        const industry = companyData.industry.toLowerCase();

        if (industry.includes('prawnic') || industry.includes('legal') || industry.includes('kancelaria')) {
            setValueChain([
                { id: '1', name: 'Pozyskanie Klienta', type: 'primary' },
                { id: '2', name: 'Analiza Sprawy', type: 'primary' },
                { id: '3', name: 'Strategia Prawna', type: 'primary' },
                { id: '4', name: 'Realizacja', type: 'primary' },
                { id: '5', name: 'Rozliczenie', type: 'primary' },
                { id: '6', name: 'HR & Rekrutacja', type: 'support' },
                { id: '7', name: 'IT & Systemy', type: 'support' },
                { id: '8', name: 'Finanse', type: 'support' },
            ]);

            setSuggestedRoles([
                { id: '1', name: 'Partner Zarządzający', department: 'Zarząd', selected: true },
                { id: '2', name: 'Prawnik Senior', department: 'Operacje', selected: true },
                { id: '3', name: 'Prawnik Junior', department: 'Operacje', selected: true },
                { id: '4', name: 'Office Manager', department: 'Administracja', selected: true },
                { id: '5', name: 'Asystent Prawny', department: 'Wsparcie', selected: false },
            ]);

            setSuggestedSOPs([
                { id: '1', title: 'Przyjmowanie nowej sprawy', role: 'Prawnik Senior', priority: 'high', selected: true },
                { id: '2', title: 'Due diligence nowego klienta', role: 'Prawnik Junior', priority: 'high', selected: true },
                { id: '3', title: 'Przygotowanie pisma procesowego', role: 'Prawnik Senior', priority: 'medium', selected: true },
                { id: '4', title: 'Rozliczenie miesięczne klienta', role: 'Office Manager', priority: 'medium', selected: false },
                { id: '5', title: 'Archiwizacja dokumentacji', role: 'Asystent Prawny', priority: 'low', selected: false },
            ]);
        } else {
            // Default manufacturing/generic
            setValueChain([
                { id: '1', name: 'Marketing & Sprzedaż', type: 'primary' },
                { id: '2', name: 'Obsługa Klienta', type: 'primary' },
                { id: '3', name: 'Produkcja', type: 'primary' },
                { id: '4', name: 'Logistyka', type: 'primary' },
                { id: '5', name: 'Serwis', type: 'primary' },
                { id: '6', name: 'HR', type: 'support' },
                { id: '7', name: 'IT', type: 'support' },
                { id: '8', name: 'Finanse', type: 'support' },
            ]);

            setSuggestedRoles([
                { id: '1', name: 'Dyrektor Operacyjny', department: 'Zarząd', selected: true },
                { id: '2', name: 'Kierownik Produkcji', department: 'Produkcja', selected: true },
                { id: '3', name: 'Specjalista ds. Jakości', department: 'Jakość', selected: true },
                { id: '4', name: 'Handlowiec', department: 'Sprzedaż', selected: false },
            ]);

            setSuggestedSOPs([
                { id: '1', title: 'Przyjęcie zamówienia', role: 'Handlowiec', priority: 'high', selected: true },
                { id: '2', title: 'Kontrola jakości produktu', role: 'Specjalista ds. Jakości', priority: 'high', selected: true },
                { id: '3', title: 'Obsługa reklamacji', role: 'Obsługa Klienta', priority: 'medium', selected: true },
            ]);
        }
    };

    const handleFinish = async () => {
        setIsProcessing(true);
        // Save all data to organization
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Redirect to dashboard
        window.location.href = '/';
    };

    const toggleRole = (id: string) => {
        setSuggestedRoles(roles =>
            roles.map(r => r.id === id ? { ...r, selected: !r.selected } : r)
        );
    };

    const toggleSOP = (id: string) => {
        setSuggestedSOPs(sops =>
            sops.map(s => s.id === id ? { ...s, selected: !s.selected } : s)
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
            {/* Header */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-semibold text-neutral-900 dark:text-white">
                                    VantageOS Setup
                                </h1>
                                <p className="text-sm text-neutral-500">
                                    Krok {currentStep} z {STEPS.length}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>
                            Pomiń
                        </Button>
                    </div>

                    {/* Progress */}
                    <Progress value={progress} className="h-1" />

                    {/* Step indicators */}
                    <div className="flex justify-between mt-4">
                        {STEPS.map((step) => {
                            const Icon = step.icon;
                            const isActive = step.id === currentStep;
                            const isCompleted = step.id < currentStep;

                            return (
                                <div
                                    key={step.id}
                                    className={cn(
                                        'flex items-center gap-2 text-sm',
                                        isActive && 'text-blue-600 dark:text-blue-400 font-medium',
                                        isCompleted && 'text-green-600 dark:text-green-400',
                                        !isActive && !isCompleted && 'text-neutral-400'
                                    )}
                                >
                                    <div className={cn(
                                        'h-8 w-8 rounded-lg flex items-center justify-center',
                                        isActive && 'bg-blue-100 dark:bg-blue-500/20',
                                        isCompleted && 'bg-green-100 dark:bg-green-500/20',
                                        !isActive && !isCompleted && 'bg-neutral-100 dark:bg-neutral-800'
                                    )}>
                                        {isCompleted ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <Icon className="h-4 w-4" />
                                        )}
                                    </div>
                                    <span className="hidden sm:inline">{step.title}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Step 1: Company Data */}
                        {currentStep === 1 && (
                            <Card className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <Building2 className="h-6 w-6 text-blue-500" />
                                    <div>
                                        <h2 className="text-lg font-semibold">Dane Firmy</h2>
                                        <p className="text-sm text-neutral-500">Podstawowe informacje o organizacji</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Nazwa firmy</label>
                                        <Input
                                            value={companyData.name}
                                            onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                                            placeholder="np. Kordia Legal sp. z o.o."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Branża</label>
                                        <Input
                                            value={companyData.industry}
                                            onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                                            placeholder="np. Kancelaria prawna, Produkcja, IT"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Wielkość zespołu</label>
                                        <Input
                                            value={companyData.size}
                                            onChange={(e) => setCompanyData({ ...companyData, size: e.target.value })}
                                            placeholder="np. 10-20 osób"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Opis działalności</label>
                                        <Textarea
                                            value={companyData.description}
                                            onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                                            placeholder="Krótki opis czym zajmuje się firma..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Step 2: Context */}
                        {currentStep === 2 && (
                            <Card className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <FileText className="h-6 w-6 text-purple-500" />
                                    <div>
                                        <h2 className="text-lg font-semibold">Kontekst Biznesowy</h2>
                                        <p className="text-sm text-neutral-500">Wklej transkrypcję lub opisz sytuację</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                                            <Upload className="h-4 w-4" />
                                            Transkrypcja / Notatki ze spotkania
                                        </label>
                                        <Textarea
                                            value={contextData.transcript}
                                            onChange={(e) => setContextData({ ...contextData, transcript: e.target.value })}
                                            placeholder="Wklej tutaj transkrypcję ze spotkania discovery, notatki z warsztatów, lub opis sytuacji klienta..."
                                            rows={6}
                                            className="font-mono text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                                            <Target className="h-4 w-4" />
                                            Główne wyzwania
                                        </label>
                                        <Textarea
                                            value={contextData.challenges}
                                            onChange={(e) => setContextData({ ...contextData, challenges: e.target.value })}
                                            placeholder="Co jest największym problemem? Jakie procesy są nieefektywne?"
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                                            <Lightbulb className="h-4 w-4" />
                                            Cele transformacji
                                        </label>
                                        <Textarea
                                            value={contextData.goals}
                                            onChange={(e) => setContextData({ ...contextData, goals: e.target.value })}
                                            placeholder="Co chcemy osiągnąć? Jakie są KPIs sukcesu?"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                {isProcessing && (
                                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                                            <div>
                                                <p className="font-medium text-blue-700 dark:text-blue-400">
                                                    Analizuję kontekst...
                                                </p>
                                                <p className="text-sm text-blue-600 dark:text-blue-500">
                                                    Generuję sugestie Value Chain, Ról i SOPów
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Step 3: Value Chain */}
                        {currentStep === 3 && (
                            <Card className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <Network className="h-6 w-6 text-emerald-500" />
                                    <div>
                                        <h2 className="text-lg font-semibold">Value Chain</h2>
                                        <p className="text-sm text-neutral-500">Sugerowany łańcuch wartości dla {companyData.industry || 'Twojej firmy'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-neutral-500 mb-2">Procesy główne</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {valueChain.filter(v => v.type === 'primary').map((item, index) => (
                                                <div key={item.id} className="flex items-center">
                                                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400">
                                                        {item.name}
                                                    </Badge>
                                                    {index < valueChain.filter(v => v.type === 'primary').length - 1 && (
                                                        <ArrowRight className="h-4 w-4 text-neutral-300 mx-1" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-neutral-500 mb-2">Procesy wspierające</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {valueChain.filter(v => v.type === 'support').map((item) => (
                                                <Badge key={item.id} variant="secondary">
                                                    {item.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20">
                                    <p className="text-sm text-amber-700 dark:text-amber-400">
                                        💡 Możesz edytować Value Chain później w sekcji <strong>Value Chain</strong>
                                    </p>
                                </div>
                            </Card>
                        )}

                        {/* Step 4: Roles & SOPs */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                {/* Roles */}
                                <Card className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Users className="h-6 w-6 text-orange-500" />
                                        <div>
                                            <h2 className="text-lg font-semibold">Sugerowane Role</h2>
                                            <p className="text-sm text-neutral-500">Zaznacz role do utworzenia</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {suggestedRoles.map((role) => (
                                            <div
                                                key={role.id}
                                                onClick={() => toggleRole(role.id)}
                                                className={cn(
                                                    'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all',
                                                    role.selected
                                                        ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30'
                                                        : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        'h-5 w-5 rounded border-2 flex items-center justify-center',
                                                        role.selected
                                                            ? 'bg-blue-500 border-blue-500'
                                                            : 'border-neutral-300 dark:border-neutral-600'
                                                    )}>
                                                        {role.selected && <CheckCircle2 className="h-3 w-3 text-white" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{role.name}</p>
                                                        <p className="text-xs text-neutral-500">{role.department}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                {/* SOPs */}
                                <Card className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <FileText className="h-6 w-6 text-purple-500" />
                                        <div>
                                            <h2 className="text-lg font-semibold">Sugerowane SOPy</h2>
                                            <p className="text-sm text-neutral-500">Procedury do wygenerowania przez AI</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {suggestedSOPs.map((sop) => (
                                            <div
                                                key={sop.id}
                                                onClick={() => toggleSOP(sop.id)}
                                                className={cn(
                                                    'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all',
                                                    sop.selected
                                                        ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30'
                                                        : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        'h-5 w-5 rounded border-2 flex items-center justify-center',
                                                        sop.selected
                                                            ? 'bg-purple-500 border-purple-500'
                                                            : 'border-neutral-300 dark:border-neutral-600'
                                                    )}>
                                                        {sop.selected && <CheckCircle2 className="h-3 w-3 text-white" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{sop.title}</p>
                                                        <p className="text-xs text-neutral-500">Rola: {sop.role}</p>
                                                    </div>
                                                </div>
                                                <Badge variant={sop.priority === 'high' ? 'destructive' : sop.priority === 'medium' ? 'default' : 'secondary'}>
                                                    {sop.priority === 'high' ? 'Wysoki' : sop.priority === 'medium' ? 'Średni' : 'Niski'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Wstecz
                    </Button>

                    {currentStep < STEPS.length ? (
                        <Button onClick={handleNext} disabled={isProcessing}>
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Przetwarzam...
                                </>
                            ) : (
                                <>
                                    Dalej
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button onClick={handleFinish} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Zapisuję...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Zakończ i przejdź do VantageOS
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
