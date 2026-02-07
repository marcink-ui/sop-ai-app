'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { PandaGiveCard } from '@/components/panda/PandaGiveCard';
import { PandaFeed } from '@/components/panda/PandaFeed';
import { PandaLeaderboard } from '@/components/panda/PandaLeaderboard';
import { PandaStats } from '@/components/panda/PandaStats';
import { Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface User {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
}

interface PandaTransaction {
    id: string;
    fromUser: User;
    toUser: User;
    category: string;
    message: string;
    amount: number;
    createdAt: string;
}

interface LeaderboardEntry {
    rank: number;
    user: User;
    totalPandas: number;
    transactionCount: number;
}

interface LeaderboardData {
    month: string;
    leaderboard: LeaderboardEntry[];
}

export default function PandasPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [transactions, setTransactions] = useState<PandaTransaction[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [transRes, leaderRes] = await Promise.all([
                fetch('/api/pandas?limit=20'),
                fetch('/api/pandas/leaderboard'),
            ]);

            if (transRes.ok) {
                setTransactions(await transRes.json());
            }
            if (leaderRes.ok) {
                setLeaderboard(await leaderRes.json());
            }
        } catch (error) {
            console.error('Error fetching panda data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Fetch users for the give card
        const fetchUsers = async () => {
            try {
                // For now, extract users from transactions + leaderboard
                // In production, we'd have a /api/users endpoint
                const uniqueUsers = new Map<string, User>();
                transactions.forEach((tx) => {
                    uniqueUsers.set(tx.fromUser.id, tx.fromUser);
                    uniqueUsers.set(tx.toUser.id, tx.toUser);
                });
                leaderboard?.leaderboard.forEach((entry) => {
                    uniqueUsers.set(entry.user.id, entry.user);
                });
                setUsers(Array.from(uniqueUsers.values()).filter((u) => u.id !== session?.user?.id));
            } catch (error) {
                console.error('Error processing users:', error);
            }
        };

        fetchData();
        fetchUsers();
    }, [fetchData, session?.user?.id, transactions, leaderboard]);

    // Calculate personal stats
    const myStats = {
        sent: transactions.filter((tx) => tx.fromUser.id === session?.user?.id).length,
        received: transactions.filter((tx) => tx.toUser.id === session?.user?.id).length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">🐼</span>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Panda System</h1>
                        <p className="text-sm text-muted-foreground">
                            Doceniaj kolegów i buduj kulturę wzajemnego uznania
                        </p>
                    </div>
                </div>
                <Link href="/gamification">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Trophy className="h-4 w-4" />
                        Gamification 🎮
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <PandaStats sent={myStats.sent} received={myStats.received} />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Give Card + Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <PandaGiveCard users={users} onSuccess={fetchData} />
                    <PandaFeed transactions={transactions} />
                </div>

                {/* Right: Leaderboard */}
                <div>
                    {leaderboard && (
                        <PandaLeaderboard
                            month={leaderboard.month}
                            leaderboard={leaderboard.leaderboard}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
