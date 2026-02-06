'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pin, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Author {
    id: string;
    name: string | null;
    image: string | null;
}

interface Newsletter {
    id: string;
    title: string;
    content: string;
    publishedAt: string | null;
    isPinned: boolean;
    author: Author;
}

interface NewsletterCardProps {
    newsletter: Newsletter;
    onClick?: () => void;
}

export function NewsletterCard({ newsletter, onClick }: NewsletterCardProps) {
    const excerpt = newsletter.content.slice(0, 150) + (newsletter.content.length > 150 ? '...' : '');

    return (
        <Card
            className={`hover:shadow-md transition-shadow cursor-pointer ${newsletter.isPinned ? 'border-amber-400 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-950/20' : ''
                }`}
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    {newsletter.isPinned && (
                        <div className="shrink-0 mt-1">
                            <Pin className="h-4 w-4 text-amber-500 fill-amber-500" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold line-clamp-1 hover:text-primary transition-colors">
                            {newsletter.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {excerpt}
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Avatar className="h-5 w-5">
                                    <AvatarImage src={newsletter.author.image || undefined} />
                                    <AvatarFallback className="text-[10px]">
                                        {(newsletter.author.name || 'U').slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span>{newsletter.author.name}</span>
                            </div>
                            {newsletter.publishedAt && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(newsletter.publishedAt), { addSuffix: true, locale: pl })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
