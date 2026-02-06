'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Star, FileText, BookOpen, Shield, Lightbulb, FileCode } from 'lucide-react';
import Link from 'next/link';

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

interface ResourceCardProps {
    resource: Resource;
}

const CATEGORY_CONFIG: Record<string, { icon: typeof FileText; color: string; label: string }> = {
    WIKI: { icon: BookOpen, label: 'Wiki', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' },
    ONBOARDING: { icon: Star, label: 'Onboarding', color: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400' },
    POLICY: { icon: Shield, label: 'Regulamin', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' },
    GUIDE: { icon: Lightbulb, label: 'Poradnik', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400' },
    TEMPLATE: { icon: FileCode, label: 'Szablon', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400' },
};

export function ResourceCard({ resource }: ResourceCardProps) {
    const cat = CATEGORY_CONFIG[resource.category] || CATEGORY_CONFIG.WIKI;
    const Icon = cat.icon;

    return (
        <Link href={`/resources/${resource.slug}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group relative overflow-hidden">
                {resource.featured && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-400 text-white text-xs px-3 py-1 rounded-bl-lg">
                        ⭐ Featured
                    </div>
                )}
                <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                        <div className={`rounded-lg p-2 ${cat.color}`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                                {resource.title}
                            </h3>
                            <Badge variant="outline" className={`mt-1 text-xs ${cat.color}`}>
                                {cat.label}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {resource.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                            {resource.excerpt}
                        </p>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={resource.author.image || undefined} />
                                <AvatarFallback className="text-xs">
                                    {(resource.author.name || 'U').slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                                {resource.author.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            {resource.viewCount}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
