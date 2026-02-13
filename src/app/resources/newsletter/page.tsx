'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, Globe, Building2, Calendar, ExternalLink, BookmarkPlus, Loader2 } from 'lucide-react';

interface NewsItem {
    id: string;
    title: string;
    source?: string;
    summary?: string;
    content?: string;
    category?: string;
    status?: string;
    publishedAt?: string;
    createdAt?: string;
    link?: string;
}

export default function NewsletterPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [savedItems, setSavedItems] = useState<string[]>([]);

    useEffect(() => {
        async function fetchNews() {
            try {
                const res = await fetch('/api/newsletters');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setNews(Array.isArray(data) ? data : data.newsletters || []);
            } catch (err) {
                console.error('Failed to load newsletters:', err);
                setError('Nie udało się załadować newsletterów');
            } finally {
                setLoading(false);
            }
        }
        fetchNews();
    }, []);

    const toggleSave = (id: string) => {
        setSavedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const getCategory = (item: NewsItem): 'internal' | 'external' => {
        if (item.category === 'external' || item.link) return 'external';
        return 'internal';
    };

    const internalNews = news.filter(n => getCategory(n) === 'internal');
    const externalNews = news.filter(n => getCategory(n) === 'external');

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-center min-h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                    <Newspaper className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

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
                    {news.length === 0 ? (
                        <EmptyState />
                    ) : (
                        news.map(item => (
                            <NewsCard
                                key={item.id}
                                item={item}
                                category={getCategory(item)}
                                saved={savedItems.includes(item.id)}
                                onToggleSave={() => toggleSave(item.id)}
                            />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="internal" className="space-y-4">
                    {internalNews.length === 0 ? (
                        <EmptyState />
                    ) : (
                        internalNews.map(item => (
                            <NewsCard
                                key={item.id}
                                item={item}
                                category="internal"
                                saved={savedItems.includes(item.id)}
                                onToggleSave={() => toggleSave(item.id)}
                            />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="external" className="space-y-4">
                    {externalNews.length === 0 ? (
                        <EmptyState />
                    ) : (
                        externalNews.map(item => (
                            <NewsCard
                                key={item.id}
                                item={item}
                                category="external"
                                saved={savedItems.includes(item.id)}
                                onToggleSave={() => toggleSave(item.id)}
                            />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="saved" className="space-y-4">
                    {news.filter(n => savedItems.includes(n.id)).map(item => (
                        <NewsCard
                            key={item.id}
                            item={item}
                            category={getCategory(item)}
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

function EmptyState() {
    return (
        <div className="text-center py-12 text-muted-foreground">
            <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Brak newsletterów</p>
        </div>
    );
}

function NewsCard({
    item,
    category,
    saved,
    onToggleSave,
}: {
    item: NewsItem;
    category: 'internal' | 'external';
    saved: boolean;
    onToggleSave: () => void;
}) {
    const dateStr = item.publishedAt || item.createdAt || '';
    const displayDate = dateStr ? new Date(dateStr).toLocaleDateString('pl-PL') : '';

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        {category === 'internal' ? (
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
                        {item.source && (
                            <span className="text-xs text-muted-foreground">{item.source}</span>
                        )}
                    </div>
                    {displayDate && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {displayDate}
                        </div>
                    )}
                </div>
                <CardTitle className="text-lg mt-2">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="mb-4">
                    {item.summary || item.content?.substring(0, 200) || 'Brak opisu'}
                </CardDescription>
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
