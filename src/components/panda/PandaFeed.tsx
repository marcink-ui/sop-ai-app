'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Lightbulb, Star, Crown, Target, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

interface PandaUser {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
}

interface PandaTransaction {
    id: string;
    fromUser: PandaUser;
    toUser: PandaUser;
    category: string;
    message: string;
    amount: number;
    createdAt: string;
}

interface PandaFeedProps {
    transactions: PandaTransaction[];
}

const CATEGORY_CONFIG: Record<string, { icon: typeof Users; color: string; label: string }> = {
    TEAMWORK: { icon: Users, label: 'Współpraca', color: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' },
    INNOVATION: { icon: Lightbulb, label: 'Innowacyjność', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400' },
    QUALITY: { icon: Star, label: 'Jakość', color: 'bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400' },
    LEADERSHIP: { icon: Crown, label: 'Przywództwo', color: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' },
    CUSTOMER_FOCUS: { icon: Target, label: 'Klient', color: 'bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400' },
};

export function PandaFeed({ transactions }: PandaFeedProps) {
    if (transactions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Ostatnie Pandy</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <span className="text-4xl block mb-2">🐼</span>
                        Brak transakcji - wyślij pierwszą pandę!
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Ostatnie Pandy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {transactions.map((tx) => {
                    const cat = CATEGORY_CONFIG[tx.category] || CATEGORY_CONFIG.TEAMWORK;
                    const Icon = cat.icon;

                    return (
                        <div key={tx.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            {/* Avatars */}
                            <div className="flex items-center gap-1 shrink-0">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={tx.fromUser.image || undefined} />
                                    <AvatarFallback className="text-xs">
                                        {(tx.fromUser.name || tx.fromUser.email).slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={tx.toUser.image || undefined} />
                                    <AvatarFallback className="text-xs">
                                        {(tx.toUser.name || tx.toUser.email).slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm">
                                    <span className="font-medium">{tx.fromUser.name || tx.fromUser.email}</span>
                                    {' → '}
                                    <span className="font-medium">{tx.toUser.name || tx.toUser.email}</span>
                                </p>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{tx.message}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${cat.color}`}>
                                        <Icon className="h-3 w-3" />
                                        {cat.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true, locale: pl })}
                                    </span>
                                </div>
                            </div>

                            {/* Panda emoji */}
                            <span className="text-xl shrink-0">🐼</span>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
