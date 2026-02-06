'use client';

import { useState } from 'react';
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
    {
        id: '1',
        title: 'Jak tworzyć efektywne SOPy',
        category: 'Procesy',
        excerpt: 'Kompletny przewodnik po tworzeniu Standard Operating Procedures, które są czytelne i łatwe do wykonania.',
        author: 'Admin',
        updatedAt: '2024-01-15',
        tags: ['SOP', 'Procesy', 'Best Practices'],
    },
    {
        id: '2',
        title: 'Wprowadzenie do VantageOS',
        category: 'Onboarding',
        excerpt: 'Podstawy systemu VantageOS - jak zacząć i najważniejsze funkcje dla nowych użytkowników.',
        author: 'Admin',
        updatedAt: '2024-01-20',
        tags: ['Onboarding', 'Podstawy', 'Start'],
    },
    {
        id: '3',
        title: 'Konfiguracja Agentów AI',
        category: 'AI',
        excerpt: 'Jak skonfigurować i uruchomić agentów AI do automatyzacji procesów biznesowych.',
        author: 'AI Team',
        updatedAt: '2024-02-01',
        tags: ['AI', 'Automatyzacja', 'Konfiguracja'],
    },
    {
        id: '4',
        title: 'MUDA Analysis - Identyfikacja Strat',
        category: 'Lean',
        excerpt: 'Metodologia MUDA (Muri, Mura, Muda) do identyfikacji i eliminacji strat w procesach.',
        author: 'Lean Team',
        updatedAt: '2024-02-05',
        tags: ['MUDA', 'Lean', 'Optymalizacja'],
    },
];

const CATEGORIES = ['Wszystkie', 'Procesy', 'Onboarding', 'AI', 'Lean'];

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
                    <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
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
