'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { CourseCard } from '@/components/resources/CourseCard';
import { NewsletterCard } from '@/components/resources/NewsletterCard';
import { BookOpen, GraduationCap, Newspaper, Search, Loader2 } from 'lucide-react';

interface Author {
    id: string;
    name: string | null;
    image: string | null;
}

interface Resource {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    category: string;
    status: string;
    featured: boolean;
    author: Author;
    viewCount: number;
    updatedAt: string;
}

interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    duration: number;
    level: string;
    externalUrl: string | null;
}

interface Newsletter {
    id: string;
    title: string;
    content: string;
    publishedAt: string | null;
    isPinned: boolean;
    author: Author;
}

export default function ResourcesPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resRes, newsRes] = await Promise.all([
                    fetch(`/api/resources${search ? `?search=${encodeURIComponent(search)}` : ''}`),
                    fetch('/api/newsletters'),
                ]);

                if (resRes.ok) setResources(await resRes.json());
                if (newsRes.ok) setNewsletters(await newsRes.json());

                // Courses would come from a /api/courses endpoint
                // For now, using mock data
                setCourses([
                    {
                        id: '1',
                        title: 'Wprowadzenie do AI w firmie',
                        description: 'Poznaj podstawy sztucznej inteligencji i jej zastosowanie w biznesie.',
                        thumbnail: null,
                        duration: 45,
                        level: 'BEGINNER',
                        externalUrl: 'https://example.com/ai-intro',
                    },
                    {
                        id: '2',
                        title: 'SOP Best Practices',
                        description: 'Jak tworzyć skuteczne procedury operacyjne.',
                        thumbnail: null,
                        duration: 30,
                        level: 'INTERMEDIATE',
                        externalUrl: null,
                    },
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [search]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const featuredResources = resources.filter(r => r.featured);

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-3">
                        <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Resources Hub</h1>
                        <p className="text-sm text-muted-foreground">
                            Wiedza, szkolenia i komunikaty firmowe
                        </p>
                    </div>
                </div>
                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Featured Section */}
            {featuredResources.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        ⭐ Wyróżnione
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {featuredResources.slice(0, 3).map(resource => (
                            <ResourceCard key={resource.id} resource={resource} />
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="wiki" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="wiki" className="gap-2">
                        <BookOpen className="h-4 w-4" />
                        Wiki
                    </TabsTrigger>
                    <TabsTrigger value="courses" className="gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Kursy
                    </TabsTrigger>
                    <TabsTrigger value="newsletter" className="gap-2">
                        <Newspaper className="h-4 w-4" />
                        Newsletter
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="wiki" className="mt-6">
                    {resources.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>Brak artykułów w Wiki</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {resources.map(resource => (
                                <ResourceCard key={resource.id} resource={resource} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="courses" className="mt-6">
                    {courses.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>Brak dostępnych kursów</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {courses.map(course => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="newsletter" className="mt-6">
                    {newsletters.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>Brak newsletterów</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {newsletters.map(newsletter => (
                                <NewsletterCard key={newsletter.id} newsletter={newsletter} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
