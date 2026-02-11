'use client';

import { useState } from 'react';
import { useROIStore } from '@/lib/roi/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calculator,
    Plus,
    Save,
    FileText,
    ArrowRight,
    ArrowLeft,
    Send,
    CheckCircle2,
    Building2,
    Settings2,
    BarChart3,
    Download,
} from 'lucide-react';
import { OperationCard } from './OperationCard';
import { ROIDashboard } from './ROIDashboard';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const STEPS = [
    { id: 0, label: 'Dane klienta', icon: Building2, description: 'Informacje o firmie i raporcie' },
    { id: 1, label: 'Operacje', icon: Settings2, description: 'Dodaj procesy do analizy' },
    { id: 2, label: 'Wyniki & Raport', icon: BarChart3, description: 'Podsumowanie i generowanie raportu' },
];

export function ROICalculator() {
    const {
        report,
        setClientInfo,
        addOperation,
        saveCurrentReport,
    } = useROIStore();

    const [activeStep, setActiveStep] = useState(0);
    const router = useRouter();

    const canProceed = () => {
        if (activeStep === 0) return report.clientName.trim().length > 0;
        if (activeStep === 1) return report.operations.length > 0;
        return true;
    };

    const handleGenerateReport = () => {
        saveCurrentReport();
        toast.success('Raport ROI został zapisany', {
            description: `Raport ${report.reportNumber} dla ${report.clientName}`,
        });
    };

    const handleSendToCouncil = () => {
        saveCurrentReport();
        toast.success('Raport przesłany do Rady Transformacji', {
            description: 'Wniosek zostanie rozpatrzony przez Radę',
        });
        router.push('/council');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                        <Calculator className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kalkulator ROI</h1>
                        <p className="text-sm text-muted-foreground">
                            Oblicz zwrot z inwestycji w transformację procesów
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={saveCurrentReport}>
                        <Save className="h-4 w-4" />
                        Zapisz
                    </Button>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-2">
                {STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = activeStep === i;
                    const isCompleted = activeStep > i;
                    return (
                        <div key={step.id} className="flex items-center flex-1">
                            <button
                                onClick={() => setActiveStep(i)}
                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all ${isActive
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                        : isCompleted
                                            ? 'bg-muted/30 border-border text-foreground'
                                            : 'bg-card border-border text-muted-foreground'
                                    }`}
                            >
                                <div className={`flex items-center justify-center h-8 w-8 rounded-lg shrink-0 ${isActive
                                        ? 'bg-emerald-500/20'
                                        : isCompleted
                                            ? 'bg-green-500/20'
                                            : 'bg-muted/50'
                                    }`}>
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Icon className="h-4 w-4" />
                                    )}
                                </div>
                                <div className="text-left min-w-0">
                                    <p className="text-sm font-medium">{step.label}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{step.description}</p>
                                </div>
                            </button>
                            {i < STEPS.length - 1 && (
                                <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground shrink-0" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                {activeStep === 0 && (
                    <motion.div
                        key="step-0"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="h-4 w-4" />
                                    Dane raportu
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Numer raportu</Label>
                                        <Input value={report.reportNumber} disabled className="bg-muted" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nazwa klienta / firmy</Label>
                                        <Input
                                            value={report.clientName}
                                            onChange={(e) => setClientInfo({ clientName: e.target.value })}
                                            placeholder="Wpisz nazwę firmy..."
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Data raportu</Label>
                                        <Input value={report.reportDate} disabled className="bg-muted" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {activeStep === 1 && (
                    <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Operacje ({report.operations.length})</h2>
                                <Button onClick={() => addOperation()} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Dodaj operację
                                </Button>
                            </div>

                            {report.operations.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="py-12 text-center">
                                        <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="font-medium mb-2">Brak operacji</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Dodaj procesy biznesowe do analizy ROI
                                        </p>
                                        <Button onClick={() => addOperation()}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Dodaj pierwszą operację
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {report.operations.map((op) => (
                                        <OperationCard key={op.id} operation={op} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeStep === 2 && (
                    <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="space-y-6">
                            {/* Dashboard Summary */}
                            <ROIDashboard />

                            {/* Report Actions */}
                            <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5">
                                <CardContent className="py-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-lg">Generuj raport ROI</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Zapisz wyniki i prześlij do akceptacji
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="outline"
                                                className="gap-2"
                                                onClick={handleGenerateReport}
                                            >
                                                <Download className="h-4 w-4" />
                                                Zapisz raport
                                            </Button>
                                            <Button
                                                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                                                onClick={handleSendToCouncil}
                                            >
                                                <Send className="h-4 w-4" />
                                                Prześlij do Rady
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                    variant="outline"
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    disabled={activeStep === 0}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Wstecz
                </Button>

                <div className="flex items-center gap-2">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 w-2 rounded-full transition-colors ${i === activeStep
                                    ? 'bg-emerald-500'
                                    : i < activeStep
                                        ? 'bg-emerald-500/40'
                                        : 'bg-muted-foreground/30'
                                }`}
                        />
                    ))}
                </div>

                {activeStep < STEPS.length - 1 ? (
                    <Button
                        onClick={() => setActiveStep(Math.min(STEPS.length - 1, activeStep + 1))}
                        disabled={!canProceed()}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                        Dalej
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleGenerateReport}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Save className="h-4 w-4" />
                        Zapisz raport
                    </Button>
                )}
            </div>
        </div>
    );
}
