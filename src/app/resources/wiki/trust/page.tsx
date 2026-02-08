'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    Shield,
    Eye,
    FileCheck,
    AlertTriangle,
    Lock,
    Users,
    CheckCircle,
    Target,
    Zap,
    BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function TrustPolicyPage() {
    const trustPhases = [
        {
            phase: 1,
            name: 'Transparency',
            icon: Eye,
            color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            description: 'Openly developing and publishing threat models, encouraging community contributions.',
            items: [
                'Published threat model documentation',
                'Risk communication to stakeholders',
                'User responsibilities clearly defined',
                'Community feedback channels',
            ],
            status: 'active',
        },
        {
            phase: 2,
            name: 'Product Security Roadmap',
            icon: Target,
            color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            description: 'Publicly defining and tracking defensive engineering goals.',
            items: [
                'Security enhancement planning',
                'Milestone tracking',
                'Regular security reviews',
                'Compliance monitoring',
            ],
            status: 'active',
        },
        {
            phase: 3,
            name: 'Code Review',
            icon: FileCheck,
            color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            description: 'Manual security review of the entire codebase.',
            items: [
                'Static code analysis',
                'Dependency vulnerability scanning',
                'Security-focused code reviews',
                'Regular audit cycles',
            ],
            status: 'planned',
        },
        {
            phase: 4,
            name: 'Security Triage',
            icon: AlertTriangle,
            color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            description: 'Formal process for handling and responding to vulnerability reports.',
            items: [
                'Vulnerability intake process',
                'Severity classification',
                'Response SLAs',
                'Disclosure policy',
            ],
            status: 'planned',
        },
    ];

    const riskCategories = [
        {
            name: 'Prompt Injection',
            description: 'Malicious users crafting messages to manipulate AI into unintended actions.',
            mitigation: 'Input sanitization, role-based access, session isolation',
            severity: 'high',
        },
        {
            name: 'Indirect Injection',
            description: 'Malicious content in fetched URLs, emails, or documents hijacking agent behavior.',
            mitigation: 'Content validation, sandboxing, isolated execution',
            severity: 'high',
        },
        {
            name: 'Tool Abuse',
            description: 'Misconfigured agents causing damage through overly permissive settings.',
            mitigation: 'Least-privilege defaults, action confirmation, rate limiting',
            severity: 'medium',
        },
        {
            name: 'Identity Risks',
            description: 'Agents acting on behalf of users, potentially damaging reputation.',
            mitigation: 'Clear attribution, audit logs, approval workflows',
            severity: 'medium',
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link
                        href="/resources/wiki"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Powrót do Wiki
                    </Link>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Trust Policy</h1>
                            <p className="text-muted-foreground">
                                Polityka bezpieczeństwa i zaufania VantageOS
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">Security</Badge>
                        <Badge variant="outline">Trust Model</Badge>
                        <Badge variant="outline">OpenClaw-inspired</Badge>
                    </div>
                </motion.div>

                {/* Introduction */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Dlaczego Trust Policy?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                            <p>
                                VantageOS wykorzystuje agentów AI, którzy wykonują rzeczywiste akcje:
                                analizują procesy, generują SOP-y, zarządzają danymi i komunikują się
                                z systemami zewnętrznymi. To wymaga solidnych fundamentów bezpieczeństwa.
                            </p>
                            <p>
                                Nasza polityka zaufania opiera się na modelu <strong>OpenClaw</strong> -
                                czterofazowym podejściu do budowania bezpieczeństwa w systemach agentowych.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 4 Phases */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Zap className="h-6 w-6 text-primary" />
                        Cztery Fazy Zaufania
                    </h2>

                    <div className="grid gap-4 md:grid-cols-2">
                        {trustPhases.map((phase, index) => (
                            <motion.div
                                key={phase.phase}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <Card className={`h-full border ${phase.color}`}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${phase.color}`}>
                                                    <phase.icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">
                                                        Faza {phase.phase}: {phase.name}
                                                    </CardTitle>
                                                </div>
                                            </div>
                                            <Badge
                                                variant={phase.status === 'active' ? 'default' : 'secondary'}
                                            >
                                                {phase.status === 'active' ? 'Aktywna' : 'Planowana'}
                                            </Badge>
                                        </div>
                                        <CardDescription>{phase.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {phase.items.map((item, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-primary" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <Separator className="my-8" />

                {/* Risk Categories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-amber-500" />
                        Model Zagrożeń
                    </h2>

                    <div className="grid gap-4">
                        {riskCategories.map((risk, index) => (
                            <Card key={risk.name} className="border-l-4 border-l-amber-500">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{risk.name}</CardTitle>
                                        <Badge
                                            variant={risk.severity === 'high' ? 'destructive' : 'outline'}
                                        >
                                            {risk.severity === 'high' ? 'Wysokie' : 'Średnie'}
                                        </Badge>
                                    </div>
                                    <CardDescription>{risk.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Shield className="h-4 w-4 text-primary" />
                                        <strong>Mitygacja:</strong> {risk.mitigation}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>

                <Separator className="my-8" />

                {/* Security Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        Domyślne Zabezpieczenia
                    </h2>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                    <div>
                                        <strong>Role-Based Access</strong>
                                        <p className="text-sm text-muted-foreground">
                                            Dostęp do funkcji na podstawie roli (USER, ADMIN, SPONSOR)
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                    <div>
                                        <strong>Action Confirmation</strong>
                                        <p className="text-sm text-muted-foreground">
                                            Krytyczne akcje wymagają potwierdzenia użytkownika
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                    <div>
                                        <strong>Audit Logging</strong>
                                        <p className="text-sm text-muted-foreground">
                                            Pełne logowanie akcji AI i użytkowników
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                    <div>
                                        <strong>Session Isolation</strong>
                                        <p className="text-sm text-muted-foreground">
                                            Izolacja sesji między użytkownikami i agentami
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-muted-foreground">
                    <p>
                        Inspired by{' '}
                        <a
                            href="https://openclaw.ai/trust"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            OpenClaw Trust Model
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
