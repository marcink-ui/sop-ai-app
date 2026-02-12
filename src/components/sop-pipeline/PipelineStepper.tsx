'use client';

import { cn } from '@/lib/utils';
import {
    Upload,
    Search,
    Cog,
    Wand2,
    Scale,
    Check,
    Loader2,
    Lock,
} from 'lucide-react';

// ============================================================
// Pipeline Steps Configuration
// ============================================================
export const PIPELINE_STEPS = [
    { step: 1, name: 'sop_generator', label: 'SOP Generator', icon: Upload, color: 'from-violet-500 to-purple-600', description: 'Generowanie SOPa z transkrypcji / opisu procesu' },
    { step: 2, name: 'muda_auditor', label: 'Audytor MUDA', icon: Search, color: 'from-orange-500 to-red-600', description: '7 typów marnotrawstwa + propozycje Kaizen' },
    { step: 3, name: 'ai_architect', label: 'Architekt AI', icon: Cog, color: 'from-blue-500 to-cyan-600', description: 'Projekt agentów, integracji i architektury AI' },
    { step: 4, name: 'ai_generator', label: 'Generator AI', icon: Wand2, color: 'from-emerald-500 to-green-600', description: 'Konfiguracja agentów: prompty, narzędzia, testy' },
    { step: 5, name: 'prompt_judge', label: 'Sędzia Promptów', icon: Scale, color: 'from-amber-500 to-yellow-600', description: 'Ocena jakości, bezpieczeństwo, werdykt' },
] as const;

export type StepStatus = 'pending' | 'active' | 'completed' | 'skipped';

interface PipelineStepperProps {
    currentStep: number;
    completedSteps: number[];
    stepStatuses: Record<number, StepStatus>;
    onStepClick: (step: number) => void;
    orientation?: 'vertical' | 'horizontal';
}

export function PipelineStepper({
    currentStep,
    completedSteps,
    stepStatuses,
    onStepClick,
    orientation = 'vertical',
}: PipelineStepperProps) {
    const isVertical = orientation === 'vertical';

    return (
        <div className={cn(
            "flex gap-1",
            isVertical ? "flex-col" : "flex-row items-center justify-between w-full"
        )}>
            {PIPELINE_STEPS.map((step, index) => {
                const status = stepStatuses[step.step] || 'pending';
                const isActive = step.step === currentStep;
                const isCompleted = completedSteps.includes(step.step);
                const isLocked = step.step > currentStep && !isCompleted;
                const Icon = step.icon;

                return (
                    <div key={step.step} className={cn(
                        "flex items-center",
                        isVertical ? "gap-3" : "flex-col gap-1 flex-1"
                    )}>
                        {/* Step indicator */}
                        <button
                            onClick={() => !isLocked && onStepClick(step.step)}
                            disabled={isLocked}
                            className={cn(
                                "relative flex items-center justify-center rounded-xl transition-all duration-200",
                                isVertical ? "h-12 w-12" : "h-10 w-10",
                                isCompleted
                                    ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                                    : isActive
                                        ? `bg-gradient-to-br ${step.color} text-white shadow-lg`
                                        : isLocked
                                            ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer"
                            )}
                        >
                            {isCompleted ? (
                                <Check className="h-5 w-5" />
                            ) : status === 'active' ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : isLocked ? (
                                <Lock className="h-4 w-4" />
                            ) : (
                                <Icon className="h-5 w-5" />
                            )}
                        </button>

                        {/* Label */}
                        {isVertical && (
                            <div className="flex-1 min-w-0">
                                <button
                                    onClick={() => !isLocked && onStepClick(step.step)}
                                    disabled={isLocked}
                                    className={cn(
                                        "text-left w-full rounded-lg px-3 py-2 transition-all",
                                        isActive
                                            ? "bg-primary/5 border border-primary/20"
                                            : isLocked
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:bg-muted/50 cursor-pointer"
                                    )}
                                >
                                    <p className={cn(
                                        "text-sm font-medium truncate",
                                        isActive ? "text-primary" : isCompleted ? "text-green-600 dark:text-green-400" : ""
                                    )}>
                                        {step.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {step.description}
                                    </p>
                                </button>
                            </div>
                        )}

                        {!isVertical && (
                            <span className={cn(
                                "text-[10px] text-center leading-tight max-w-[80px]",
                                isActive ? "font-medium text-primary" : "text-muted-foreground"
                            )}>
                                {step.label}
                            </span>
                        )}

                        {/* Connector line */}
                        {index < PIPELINE_STEPS.length - 1 && isVertical && (
                            <div className="hidden" /> // Spacing handled by gap
                        )}
                        {index < PIPELINE_STEPS.length - 1 && !isVertical && (
                            <div className={cn(
                                "h-0.5 flex-1 mx-1",
                                isCompleted ? "bg-green-500" : "bg-muted"
                            )} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
