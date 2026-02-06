'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Play,
    Pause,
    RotateCcw,
    FileText,
    Bot,
    Search,
    Sparkles,
    Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { mockSOPs } from '@/lib/sample-data';

const pipelineSteps = [
    {
        id: 1,
        name: 'Transkrypcja',
        description: 'Konwersja nagrania na tekst',
        icon: FileText,
        status: 'completed'
    },
    {
        id: 2,
        name: 'Analiza MUDA',
        description: 'Identyfikacja marnotrawstwa',
        icon: Search,
        status: 'completed'
    },
    {
        id: 3,
        name: 'Generowanie SOP',
        description: 'Tworzenie procedury krok po kroku',
        icon: Sparkles,
        status: 'current'
    },
    {
        id: 4,
        name: 'Architektura Agenta',
        description: 'Projektowanie AI asystenta',
        icon: Bot,
        status: 'pending'
    },
    {
        id: 5,
        name: 'Finalizacja',
        description: 'Przegląd i publikacja',
        icon: Settings2,
        status: 'pending'
    }
];

export default function SOPPipelinePage() {
    const params = useParams();
    const router = useRouter();
    const sopId = params.id as string;

    const [currentStep, setCurrentStep] = useState(3);
    const [isProcessing, setIsProcessing] = useState(false);

    const sop = mockSOPs.find(s => s.id === sopId);

    const handleContinue = async () => {
        if (currentStep >= 5) {
            toast.success('Pipeline zakończony!');
            router.push(`/sops/${sopId}`);
            return;
        }

        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
        setCurrentStep(prev => prev + 1);
        toast.success(`Krok ${currentStep} ukończony`);
    };

    const handleReset = () => {
        setCurrentStep(1);
        toast.info('Pipeline zresetowany');
    };

    if (!sop) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">SOP nie znaleziony</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
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
                        <h1 className="text-2xl font-bold text-foreground">Pipeline Transformacji</h1>
                        <p className="text-sm text-muted-foreground">{sop.meta.process_name}</p>
                    </div>
                </div>
                <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                </Button>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative"
            >
                <div className="absolute top-5 left-0 right-0 h-1 bg-muted rounded-full">
                    <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                <div className="relative flex justify-between">
                    {pipelineSteps.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = step.id < currentStep;
                        const isCurrent = step.id === currentStep;
                        const isPending = step.id > currentStep;

                        return (
                            <div key={step.id} className="flex flex-col items-center">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10',
                                        isCompleted && 'bg-emerald-500 border-emerald-500',
                                        isCurrent && 'bg-violet-500 border-violet-500 ring-4 ring-violet-500/20',
                                        isPending && 'bg-card border-border'
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-5 w-5 text-white" />
                                    ) : (
                                        <Icon className={cn(
                                            'h-5 w-5',
                                            isCurrent ? 'text-white' : 'text-muted-foreground'
                                        )} />
                                    )}
                                </motion.div>
                                <div className="mt-3 text-center">
                                    <p className={cn(
                                        'text-sm font-medium',
                                        isCurrent ? 'text-violet-400' : 'text-foreground'
                                    )}>
                                        {step.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground hidden sm:block">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Current Step Details */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    {(() => {
                        const CurrentIcon = pipelineSteps[currentStep - 1]?.icon || FileText;
                        return <CurrentIcon className="h-6 w-6 text-violet-400" />;
                    })()}
                    <h2 className="text-xl font-semibold text-foreground">
                        Krok {currentStep}: {pipelineSteps[currentStep - 1]?.name}
                    </h2>
                </div>

                <p className="text-muted-foreground mb-6">
                    {currentStep === 1 && 'Przetwarzanie nagrania i konwersja na tekst. Analiza kontekstu i identyfikacja kluczowych elementów.'}
                    {currentStep === 2 && 'Analiza procesu pod kątem 7 typów marnotrawstwa MUDA. Identyfikacja obszarów do optymalizacji.'}
                    {currentStep === 3 && 'Generowanie strukturalnej procedury operacyjnej na podstawie analizy. Podział na kroki, narzędzia i odpowiedzialności.'}
                    {currentStep === 4 && 'Projektowanie architektury AI asystenta. Definiowanie promptów, integracji i mikro-agentów.'}
                    {currentStep === 5 && 'Finalna weryfikacja, testy i publikacja. Gotowy SOP i Agent AI.'}
                </p>

                {/* Processing Indicator */}
                {isProcessing && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-violet-400">Przetwarzanie...</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 2, ease: 'linear' }}
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1 || isProcessing}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Poprzedni
                    </Button>

                    <Button
                        onClick={handleContinue}
                        disabled={isProcessing}
                        className="bg-violet-600 hover:bg-violet-700"
                    >
                        {isProcessing ? (
                            <>
                                <Pause className="h-4 w-4 mr-2" />
                                Przetwarzanie...
                            </>
                        ) : currentStep === 5 ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Zakończ
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4 mr-2" />
                                Kontynuuj
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="grid gap-4 sm:grid-cols-3"
            >
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <p className="text-sm text-muted-foreground">Postęp</p>
                    <p className="text-2xl font-bold text-foreground">{Math.round(((currentStep - 1) / 4) * 100)}%</p>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <p className="text-sm text-muted-foreground">Aktualny krok</p>
                    <p className="text-2xl font-bold text-violet-400">{currentStep} / 5</p>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <p className="text-sm text-muted-foreground">Szacowany czas</p>
                    <p className="text-2xl font-bold text-foreground">{(5 - currentStep + 1) * 2} min</p>
                </div>
            </motion.div>
        </div>
    );
}
