'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, Globe, Building2, Calendar, ExternalLink, BookmarkPlus } from 'lucide-react';

interface NewsItem {
    id: string;
    title: string;
    source: string;
    summary: string;
    category: 'internal' | 'external';
    date: string;
    readTime: string;
    link?: string;
}

const SAMPLE_NEWS: NewsItem[] = [
    {
        id: '1',
        title: 'Nowa wersja VantageOS 2.0 już dostępna',
        source: 'VantageOS Team',
        summary: 'Wprowadziliśmy nowy moduł Graf Wiedzy oraz ulepszoną integrację z Prisma dla szybszych zapytań do bazy danych.',
        category: 'internal',
        date: '2024-02-05',
        readTime: '3 min',
    },
    {
        id: '2',
        title: 'OpenAI GPT-4 Turbo - co nowego?',
        source: 'AI Weekly',
        summary: 'Najnowszy model GPT-4 Turbo oferuje 128k context window i znacznie niższe koszty. Sprawdź jak wykorzystać go w automatyzacji.',
        category: 'external',
        date: '2024-02-03',
        readTime: '5 min',
        link: 'https://openai.com/gpt-4-turbo',
    },
    {
        id: '3',
        title: 'Szkolenie: Lean w praktyce AI',
        source: 'HR Department',
        summary: 'Zapisz się na warsztaty łączące metodologię Lean z narzędziami AI. Termin: 15 lutego 2024.',
        category: 'internal',
        date: '2024-02-01',
        readTime: '2 min',
    },
    {
        id: '4',
        title: 'Anthropic Claude 3 - nowy gracz na rynku',
        source: 'TechCrunch',
        summary: 'Claude 3 Opus przewyższa GPT-4 w benchmarkach. Co to oznacza dla firm wdrażających AI?',
        category: 'external',
        date: '2024-01-28',
        readTime: '4 min',
        link: 'https://anthropic.com',
    },
];

export default function NewsletterPage() {
    const [savedItems, setSavedItems] = useState<string[]>([]);

    const toggleSave = (id: string) => {
        setSavedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const internalNews = SAMPLE_NEWS.filter(n => n.category === 'internal');
    const externalNews = SAMPLE_NEWS.filter(n => n.category === 'external');

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Newspaper className="h-6 w-6 text-teal-500" />
                        Newsletter
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Nowości w świecie transformacji cyfrowej
                    </p>
                </div>
            </div>

            <Tabs defaultValue="all" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="all">Wszystkie</TabsTrigger>
                    <TabsTrigger value="internal" className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        Firmowe
                    </TabsTrigger>
                    <TabsTrigger value="external" className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        Globalne
                    </TabsTrigger>
                    <TabsTrigger value="saved">Zapisane ({savedItems.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    {SAMPLE_NEWS.map(item => (
                        <NewsCard
                            key={item.id}
                            item={item}
                            saved={savedItems.includes(item.id)}
                            onToggleSave={() => toggleSave(item.id)}
                        />
                    ))}
                </TabsContent>

                <TabsContent value="internal" className="space-y-4">
                    {internalNews.map(item => (
                        <NewsCard
                            key={item.id}
                            item={item}
                            saved={savedItems.includes(item.id)}
                            onToggleSave={() => toggleSave(item.id)}
                        />
                    ))}
                </TabsContent>

                <TabsContent value="external" className="space-y-4">
                    {externalNews.map(item => (
                        <NewsCard
                            key={item.id}
                            item={item}
                            saved={savedItems.includes(item.id)}
                            onToggleSave={() => toggleSave(item.id)}
                        />
                    ))}
                </TabsContent>

                <TabsContent value="saved" className="space-y-4">
                    {SAMPLE_NEWS.filter(n => savedItems.includes(n.id)).map(item => (
                        <NewsCard
                            key={item.id}
                            item={item}
                            saved={true}
                            onToggleSave={() => toggleSave(item.id)}
                        />
                    ))}
                    {savedItems.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <BookmarkPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Nie masz zapisanych artykułów</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function NewsCard({ item, saved, onToggleSave }: { item: NewsItem; saved: boolean; onToggleSave: () => void }) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        {item.category === 'internal' ? (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400">
                                <Building2 className="h-3 w-3 mr-1" />
                                Firmowe
                            </Badge>
                        ) : (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400">
                                <Globe className="h-3 w-3 mr-1" />
                                Globalne
                            </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{item.source}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {item.date}
                        <span>•</span>
                        {item.readTime}
                    </div>
                </div>
                <CardTitle className="text-lg mt-2">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="mb-4">{item.summary}</CardDescription>
                <div className="flex items-center gap-2">
                    <Button
                        variant={saved ? "default" : "outline"}
                        size="sm"
                        onClick={onToggleSave}
                    >
                        <BookmarkPlus className="h-4 w-4 mr-1" />
                        {saved ? 'Zapisano' : 'Zapisz'}
                    </Button>
                    {item.link && (
                        <Button variant="ghost" size="sm" asChild>
                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Czytaj więcej
                            </a>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
