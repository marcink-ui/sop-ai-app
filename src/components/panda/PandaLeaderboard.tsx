'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardUser {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
}

interface LeaderboardEntry {
    rank: number;
    user: LeaderboardUser;
    totalPandas: number;
    transactionCount: number;
}

interface PandaLeaderboardProps {
    month: string;
    leaderboard: LeaderboardEntry[];
}

export function PandaLeaderboard({ month, leaderboard }: PandaLeaderboardProps) {
    const monthName = new Date(month).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });

    if (leaderboard.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Ranking - {monthName}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6 text-muted-foreground">
                        Brak danych za ten miesiąc
                    </div>
                </CardContent>
            </Card>
        );
    }

    const maxPandas = leaderboard[0]?.totalPandas || 1;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Ranking - {monthName}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {leaderboard.map((entry) => (
                    <div key={entry.user.id} className="flex items-center gap-3">
                        {/* Rank */}
                        <div className="w-8 shrink-0 text-center">
                            {entry.rank === 1 && <span className="text-2xl">🥇</span>}
                            {entry.rank === 2 && <span className="text-2xl">🥈</span>}
                            {entry.rank === 3 && <span className="text-2xl">🥉</span>}
                            {entry.rank > 3 && (
                                <span className="text-sm font-bold text-muted-foreground">#{entry.rank}</span>
                            )}
                        </div>

                        {/* Avatar */}
                        <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={entry.user.image || undefined} />
                            <AvatarFallback className="text-xs">
                                {(entry.user.name || entry.user.email).slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        {/* Name & Bar */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{entry.user.name || entry.user.email}</p>
                            <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                                    style={{ width: `${(entry.totalPandas / maxPandas) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Count */}
                        <div className="shrink-0 text-right">
                            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                {entry.totalPandas}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">🐼</span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
