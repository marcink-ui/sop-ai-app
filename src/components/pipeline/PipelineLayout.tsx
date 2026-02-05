'use client';

import Link from 'next/link';

interface PipelineLayoutProps {
    children: React.ReactNode;
    currentStep: number;
    title: string;
    description: string;
}

const STEPS = [
    { id: 1, name: 'Generator SOP', icon: '📝', href: '/pipeline/step-1' },
    { id: 2, name: 'Audytor MUDA', icon: '🔍', href: '/pipeline/step-2' },
    { id: 3, name: 'Architekt AI', icon: '🏗️', href: '/pipeline/step-3' },
    { id: 4, name: 'Generator AI', icon: '🤖', href: '/pipeline/step-4' },
    { id: 5, name: 'Sędzia Promptów', icon: '⚖️', href: '/pipeline/step-5' },
];

export default function PipelineLayout({
    children,
    currentStep,
    title,
    description
}: PipelineLayoutProps) {
    return (
        <div className="max-w-5xl mx-auto px-6">
            {/* Pipeline Progress */}
            <div className="glass-card p-6 mb-8">
                <div className="pipeline-progress">
                    <div className="pipeline-line"></div>
                    {STEPS.map((step) => (
                        <Link
                            key={step.id}
                            href={step.href}
                            className={`pipeline-step ${step.id === currentStep ? 'active' : ''} ${step.id < currentStep ? 'completed' : ''}`}
                        >
                            <div className="pipeline-step-circle">
                                {step.id < currentStep ? '✓' : step.icon}
                            </div>
                            <span className="pipeline-step-label">{step.name}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Step Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className={`stage-badge stage-${currentStep}`}>
                        Krok {currentStep}/5
                    </span>
                </div>
                <h1 className="text-3xl font-bold mb-2">{title}</h1>
                <p className="text-zinc-400">{description}</p>
            </div>

            {/* Main Content */}
            <div className="glass-card p-8">
                {children}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
                {currentStep > 1 ? (
                    <Link
                        href={STEPS[currentStep - 2].href}
                        className="btn-secondary"
                    >
                        ← Poprzedni krok
                    </Link>
                ) : (
                    <Link href="/" className="btn-secondary">
                        ← Dashboard
                    </Link>
                )}

                {currentStep < 5 && (
                    <Link
                        href={STEPS[currentStep].href}
                        className="btn-primary"
                    >
                        Następny krok →
                    </Link>
                )}
            </div>
        </div>
    );
}
