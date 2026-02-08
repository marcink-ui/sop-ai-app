'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, FileText, Video, ExternalLink, Plus } from 'lucide-react';

interface WikiArticle {
    id: string;
    title: string;
    category: string;
    excerpt: string;
    author: string;
    updatedAt: string;
    tags: string[];
}

const SAMPLE_ARTICLES: WikiArticle[] = [
    // ==================== FUNDAMENTY ====================
    {
        id: 'soul',
        title: 'VantageOS Soul Document',
        category: 'Fundamenty',
        excerpt: 'Tożsamość AI, wartości fundamentalne, granice bezpieczeństwa i tryby operacyjne (Henry, VantageOS, Shotgun, Party).',
        author: 'VantageOS Team',
        updatedAt: '2024-02-08',
        tags: ['Soul', 'Tożsamość', 'Wartości', 'Bezpieczeństwo'],
    },
    {
        id: 'isoa',
        title: 'ISOA - Metodologia Transformacji',
        category: 'Fundamenty',
        excerpt: 'Iterate, Simplify, Optimize, Automate - 4-krokowy framework do transformacji procesów biznesowych z AI.',
        author: 'VantageOS Team',
        updatedAt: '2024-02-08',
        tags: ['ISOA', 'Transformacja', 'AI', 'Automatyzacja'],
    },
    {
        id: 'gtm',
        title: 'GTM - Go-to-Market Framework',
        category: 'Fundamenty',
        excerpt: 'Strategia wejścia na rynek dla transformacji AI: Discovery → Pilot → Scale. Fazy, milestones, KPIs.',
        author: 'VantageOS Team',
        updatedAt: '2024-02-08',
        tags: ['GTM', 'Strategia', 'Skalowanie', 'Business'],
    },
    {
        id: 'modes',
        title: 'Tryby Operacyjne AI',
        category: 'Fundamenty',
        excerpt: 'Henry (Konsultant), VantageOS (System), Shotgun (Sprint), Party (Celebracja) - kiedy używać którego trybu.',
        author: 'VantageOS Team',
        updatedAt: '2024-02-06',
        tags: ['Tryby', 'AI', 'Workflow'],
    },
    // ==================== MODUŁY GŁÓWNE ====================
    {
        id: 'sops-guide',
        title: 'Moduł SOPs - Zarządzanie Procedurami',
        category: 'Moduły',
        excerpt: 'Tworzenie, edycja i wersjonowanie Standard Operating Procedures. Integracja z AI do automatycznej analizy i optymalizacji.',
        author: 'VantageOS Team',
        updatedAt: '2024-02-08',
        tags: ['SOP', 'Procesy', 'Dokumentacja', 'AI'],
    },
    {
        id: 'pipeline-guide',
        title: 'SOP Pipeline - 5 Kroków do Automatyzacji',
        category: 'Moduły',
        excerpt: 'Proces transformacji SOP: 1) Transkrypcja → 2) Analiza AI → 3) Optymalizacja → 4) Agent Design → 5) Deployment.',
        author: 'VantageOS Team',
        updatedAt: '2024-02-08',
        tags: ['Pipeline', 'Automatyzacja', 'Transformacja'],
    },
    {
        id: 'value-chain-guide',
        title: 'Value Chain - Mapa Wartości',
        category: 'Moduły',
        excerpt: 'Wizualizacja łańcucha wartości. Mapowanie procesów core, support i management. Identyfikacja bottlenecks.',
        author: 'VantageOS Team',
        updatedAt: '2024-02-08',
        tags: ['Value Chain', 'Mapowanie', 'Procesy'],
    },
    {
        id: 'council-guide',
        title: 'Council of Transformation',
        category: 'Moduły',
        excerpt: 'Zarządzanie wnioskami o zmianę. Proces akceptacji, workflow zmian i tracking decyzji strategicznych.',
        author: 'VantageOS Team',
        updatedAt: '2024-02-08',
        tags: ['Council', 'Governance', 'Zmiany'],
    },
    {
        id: 'knowledge-graph-guide',
        title: 'Knowledge Graph - Graf Wiedzy',
        category: 'Moduły',
        excerpt: 'Wizualizacja powiązań między SOP-ami, rolami, pracownikami i systemami. 3D interaktywny graf.',
        author: 'VantageOS Team',
        updatedAt: '2024-02-08',
        tags: ['Graf', 'Wiedza', 'Wizualizacja'],
    },
    // ==================== LEAN & KAIZEN ====================
    {
        id: 'muda-guide',
        title: 'MUDA Analysis - Identyfikacja Strat',
        category: 'Lean',
        excerpt: 'Metodologia MUDA (Muri, Mura, Muda) do identyfikacji i eliminacji 7 typów strat w procesach.',
        author: 'Lean Team',
        updatedAt: '2024-02-08',
        tags: ['MUDA', 'Lean', 'Optymalizacja', 'Straty'],
    },
    {
        id: 'kaizen-guide',
        title: 'Kaizen - Ciągłe Doskonalenie',
        category: 'Lean',
        excerpt: 'System zgłaszania usprawnień. Kategorie: Jakość, Efektywność, Bezpieczeństwo, Koszty, Doświadczenie.',
        author: 'Lean Team',
        updatedAt: '2024-02-08',
        tags: ['Kaizen', 'Usprawnienia', 'Pandy'],
    },
    // ==================== AI & CHAT ====================
    {
        id: 'ai-chat-guide',
        title: 'AI Chat - Asystent Inteligentny',
        category: 'AI',
        excerpt: 'Draggable chat panel z AI. Kontekstowe odpowiedzi, integracja z wszystkimi modułami, history conversations.',
        author: 'AI Team',
        updatedAt: '2024-02-08',
        tags: ['AI', 'Chat', 'Asystent'],
    },
    {
        id: 'ai-costs-guide',
        title: 'AI Costs & Token Tracking',
        category: 'AI',
        excerpt: 'Monitoring kosztów AI: GPT-4, Claude, Gemini. Context window tracking, budżet alerts, model pricing.',
        author: 'AI Team',
        updatedAt: '2024-02-08',
        tags: ['AI', 'Koszty', 'Tokeny', 'Budget'],
    },
    {
        id: 'ai-agents-guide',
        title: 'AI Agents - Micro-Agenci',
        category: 'AI',
        excerpt: 'Projektowanie i deployment AI agentów. Skill sets, trigger events, role-based permissions.',
        author: 'AI Team',
        updatedAt: '2024-02-08',
        tags: ['Agenci', 'AI', 'Automatyzacja'],
    },
    // ==================== ANALYTICS & ROI ====================
    {
        id: 'roi-calculator-guide',
        title: 'ROI Calculator - Kalkulator Zwrotu',
        category: 'Analytics',
        excerpt: 'Obliczanie ROI automatyzacji. Scenariusze inwestycyjne, koszt vs oszczędność, payback period.',
        author: 'VantageOS Team',
        updatedAt: '2024-02-08',
        tags: ['ROI', 'Kalkulator', 'Finanse'],
    },
    {
        id: 'analytics-guide',
        title: 'Analytics Dashboard',
        category: 'Analytics',
        excerpt: 'Przegląd metryk: SOP completion, AI usage, transformation progress, team performance.',
        author: 'VantageOS Team',
        updatedAt: '2024-02-08',
        tags: ['Analytics', 'Dashboard', 'Metryki'],
    },
    // ==================== ADMIN & SETTINGS ====================
    {
        id: 'settings-guide',
        title: 'Ustawienia Systemu',
        category: 'Admin',
        excerpt: 'Konfiguracja profilu, API keys, integracje, styl UI, eye tracking, koszty AI.',
        author: 'VantageOS Team',
        updatedAt: '2024-02-08',
        tags: ['Ustawienia', 'Konfiguracja', 'Admin'],
    },
    {
        id: 'backoffice-guide',
        title: 'Backoffice - Administracja',
        category: 'Admin',
        excerpt: 'Zarządzanie użytkownikami, firmami, promptami AI, modelami, transkrypcjami.',
        author: 'VantageOS Team',
        updatedAt: '2024-02-08',
        tags: ['Backoffice', 'Admin', 'Zarządzanie'],
    },
    {
        id: 'meta-admin-guide',
        title: 'Meta Admin - Super Administracja',
        category: 'Admin',
        excerpt: 'Feature flags, analytics, API management, chat history, newsletter, prompts, styling.',
        author: 'VantageOS Team',
        updatedAt: '2024-02-08',
        tags: ['Meta', 'Admin', 'Features'],
    },
    // ==================== ONBOARDING & RESOURCES ====================
    {
        id: 'onboarding-guide',
        title: 'Onboarding - Wprowadzenie',
        category: 'Onboarding',
        excerpt: 'Krok po kroku wprowadzenie do VantageOS dla nowych użytkowników i organizacji.',
        author: 'VantageOS Team',
        updatedAt: '2024-02-08',
        tags: ['Onboarding', 'Start', 'Tutorial'],
    },
    {
        id: 'gamification-guide',
        title: 'Gamifikacja - System Nagród',
        category: 'Onboarding',
        excerpt: 'System punktów Panda, achievements, leaderboard, nagrody za aktywność.',
        author: 'VantageOS Team',
        updatedAt: '2024-02-08',
        tags: ['Gamifikacja', 'Pandy', 'Nagrody'],
    },
];

const CATEGORIES = ['Wszystkie', 'Fundamenty', 'Moduły', 'Lean', 'AI', 'Analytics', 'Admin', 'Onboarding'];

export default function WikiPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Wszystkie');

    const filteredArticles = SAMPLE_ARTICLES.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Wszystkie' || article.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-indigo-500" />
                        Firmowe Wiki
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Centralna baza wiedzy organizacji
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nowy Artykuł
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj w wiki..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    {CATEGORIES.map(category => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Articles Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {filteredArticles.map(article => (
                    <Link key={article.id} href={`/resources/wiki/${article.id}`}>
                        <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50 h-full">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <Badge variant="outline">{article.category}</Badge>
                                    <span className="text-xs text-muted-foreground">{article.updatedAt}</span>
                                </div>
                                <CardTitle className="text-lg">{article.title}</CardTitle>
                                <CardDescription>{article.excerpt}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-1">
                                        {article.tags.slice(0, 3).map(tag => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <span className="text-xs text-muted-foreground">by {article.author}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {filteredArticles.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nie znaleziono artykułów</p>
                </div>
            )}
        </div>
    );
}
