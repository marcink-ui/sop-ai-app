'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Settings2,
    Building2,
    Users,
    FileCode2,
    Bot,
    BarChart3,
    Shield,
    ChevronRight,
    Terminal,
    Database,
    Sparkles,
    Cpu,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const backofficeModules = [
    {
        id: 'context',
        title: 'Kontekst Firmowy',
        description: 'Informacje o firmie, działach i pracownikach dla AI',
        icon: Building2,
        href: '/backoffice/context',
        stats: 'Dane firmowe',
        color: 'from-rose-500 to-pink-600',
    },
    {
        id: 'prompts',
        title: 'System Prompts',
        description: 'Edytuj prompty AI dla różnych kontekstów i ról',
        icon: FileCode2,
        href: '/backoffice/prompts',
        stats: '8 promptów',
        color: 'from-violet-500 to-purple-600',
    },
    {
        id: 'companies',
        title: 'Firmy',
        description: 'Zarządzaj organizacjami i multi-tenancy',
        icon: Building2,
        href: '/backoffice/companies',
        stats: '1 firma',
        color: 'from-blue-500 to-cyan-600',
    },
    {
        id: 'users',
        title: 'Użytkownicy',
        description: 'Zarządzaj kontami i rolami użytkowników',
        icon: Users,
        href: '/backoffice/users',
        stats: '12 użytkowników',
        color: 'from-emerald-500 to-teal-600',
    },
    {
        id: 'agents',
        title: 'AI Agenci',
        description: 'Konfiguracja agentów i ich zachowań',
        icon: Bot,
        href: '/backoffice/agents',
        stats: '3 agentów',
        color: 'from-amber-500 to-orange-600',
    },
    {
        id: 'ai-models',
        title: 'Modele AI',
        description: 'Konfiguracja providerów i routingu modeli',
        icon: Cpu,
        href: '/backoffice/ai-models',
        stats: 'Routing AI',
        color: 'from-indigo-500 to-violet-600',
    },
    {
        id: 'transcript-processor',
        title: 'Transcript Processor',
        description: 'AI ekstrakcja SOPs, Ról i Value Chains z transkrypcji',
        icon: FileCode2,
        href: '/backoffice/transcript-processor',
        stats: 'Nowe!',
        color: 'from-fuchsia-500 to-pink-600',
    },
];

const systemStats = [
    { label: 'SOPs', value: '17', change: '+3 ten tydzień' },
    { label: 'Aktywne sesje', value: '8', change: 'teraz' },
    { label: 'Tokeny AI (dziś)', value: '45K', change: '$0.12' },
    { label: 'Wnioski Rady', value: '4', change: '1 oczekujący' },
];

export default function BackofficePage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Settings2 className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold">Backoffice</h1>
                        <Badge variant="outline" className="text-violet-600 border-violet-300">
                            Admin
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">
                        Panel administracyjny systemu VantageOS
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Database className="h-4 w-4 mr-2" />
                        Baza danych
                    </Button>
                    <Button variant="outline" size="sm">
                        <Terminal className="h-4 w-4 mr-2" />
                        Logi
                    </Button>
                </div>
            </div>

            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {systemStats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="bg-card/50 backdrop-blur">
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                                <div className="text-xs text-muted-foreground mt-1">{stat.change}</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {backofficeModules.map((module, index) => (
                    <motion.div
                        key={module.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                    >
                        <Link href={module.href}>
                            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-lg`}>
                                            <module.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </div>
                                    <CardTitle className="text-xl mt-4">{module.title}</CardTitle>
                                    <CardDescription>{module.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant="secondary">{module.stats}</Badge>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        Szybkie akcje
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                            <Shield className="h-4 w-4 mr-2" />
                            Sprawdź uprawnienia
                        </Button>
                        <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Raport zużycia
                        </Button>
                        <Button variant="outline" size="sm">
                            <Bot className="h-4 w-4 mr-2" />
                            Test promptu AI
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
