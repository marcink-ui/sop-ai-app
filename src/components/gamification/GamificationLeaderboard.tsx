'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardUser {
    rank: number;
    userId: string;
    name: string | null;
    email: string;
    image: string | null;
    xp: number;
    level: { level: number; title: string };
}

interface GamificationLeaderboardProps {
    leaderboard: LeaderboardUser[];
    currentUserRank: number;
    totalUsers: number;
    currentUserId: string;
}

export function GamificationLeaderboard({
    leaderboard,
    currentUserRank,
    totalUsers,
    currentUserId
}: GamificationLeaderboardProps) {
    const maxXP = leaderboard[0]?.xp || 1;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-amber-500" />
                        Leaderboard
                    </span>
                    <span className="text-sm font-normal text-muted-foreground">
                        Your rank: #{currentUserRank} / {totalUsers}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {leaderboard.map((user) => {
                    const isCurrentUser = user.userId === currentUserId;

                    return (
                        <div
                            key={user.userId}
                            className={cn(
                                'flex items-center gap-3 p-3 rounded-lg transition-colors',
                                isCurrentUser
                                    ? 'bg-violet-100 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800'
                                    : 'hover:bg-muted/50'
                            )}
                        >
                            {/* Rank */}
                            <div className="w-8 shrink-0 text-center">
                                {user.rank === 1 && <span className="text-xl">🥇</span>}
                                {user.rank === 2 && <span className="text-xl">🥈</span>}
                                {user.rank === 3 && <span className="text-xl">🥉</span>}
                                {user.rank > 3 && (
                                    <span className="text-sm font-bold text-muted-foreground">
                                        #{user.rank}
                                    </span>
                                )}
                            </div>

                            {/* Avatar */}
                            <Avatar className="h-9 w-9 shrink-0">
                                <AvatarImage src={user.image || undefined} />
                                <AvatarFallback className="text-xs">
                                    {(user.name || user.email).slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {/* Name + Level */}
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    'text-sm font-medium truncate',
                                    isCurrentUser && 'text-violet-700 dark:text-violet-300'
                                )}>
                                    {user.name || user.email}
                                    {isCurrentUser && ' (Ty)'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div
                                        className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                                        style={{ width: `${(user.xp / maxXP) * 100}%`, minWidth: '10%', maxWidth: '100%' }}
                                    />
                                </div>
                            </div>

                            {/* XP + Level */}
                            <div className="shrink-0 text-right">
                                <p className="font-bold text-violet-600 dark:text-violet-400">
                                    {user.xp.toLocaleString()} XP
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Lv.{user.level.level} {user.level.title}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
