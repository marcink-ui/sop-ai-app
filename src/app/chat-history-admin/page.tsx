'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MessageSquare, Users, BarChart3, Clock,
    ChevronLeft, ChevronRight, Bot, User, X, Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatSession {
    id: string;
    title: string | null;
    createdAt: string;
    updatedAt: string;
    user: { id: string; name: string; email: string; role: string };
    _count: { messages: number };
}

interface ChatMessage {
    id: string;
    role: string;
    content: string;
    createdAt: string;
}

interface ChatStats {
    totalSessions: number;
    totalMessages: number;
    uniqueUsers: number;
}

export default function ChatHistoryAdminPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [stats, setStats] = useState<ChatStats | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '20' });
            if (search) params.set('search', search);

            const res = await fetch(`/api/chat/history?${params}`);
            const data = await res.json();

            setSessions(data.sessions || []);
            setTotalPages(data.pagination?.totalPages || 1);
            if (data.stats) setStats(data.stats);
        } catch {
            console.error('Failed to fetch chat sessions');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    const fetchMessages = async (sessionId: string) => {
        setLoadingMessages(true);
        setSelectedSession(sessionId);
        try {
            const res = await fetch(`/api/chat/history?sessionId=${sessionId}`);
            const data = await res.json();
            setMessages(data.session?.messages || []);
        } catch {
            console.error('Failed to fetch messages');
        } finally {
            setLoadingMessages(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const formatDate = (d: string) => new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex flex-col h-full max-h-screen">
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                <h1 className="text-2xl font-bold">Historia Czat AI</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Przeglądaj rozmowy użytkowników z AI Asystentem
                </p>
            </div>

            {/* Stats Row */}
            {stats && (
                <div className="px-6 py-3 grid grid-cols-3 gap-4">
                    <Card className="border-blue-200 dark:border-blue-800">
                        <CardContent className="flex items-center gap-3 py-3 px-4">
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-xl font-bold">{stats.totalSessions}</p>
                                <p className="text-xs text-muted-foreground">Sesji</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-purple-200 dark:border-purple-800">
                        <CardContent className="flex items-center gap-3 py-3 px-4">
                            <BarChart3 className="h-5 w-5 text-purple-500" />
                            <div>
                                <p className="text-xl font-bold">{stats.totalMessages}</p>
                                <p className="text-xs text-muted-foreground">Wiadomości</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-200 dark:border-emerald-800">
                        <CardContent className="flex items-center gap-3 py-3 px-4">
                            <Users className="h-5 w-5 text-emerald-500" />
                            <div>
                                <p className="text-xl font-bold">{stats.uniqueUsers}</p>
                                <p className="text-xs text-muted-foreground">Użytkowników</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left: Session List */}
                <div className="w-[400px] border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
                    {/* Search */}
                    <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Szukaj w rozmowach..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Session List */}
                    <ScrollArea className="flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <MessageSquare className="h-8 w-8 mb-2" />
                                <p>Brak rozmów</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {sessions.map(s => (
                                    <motion.button
                                        key={s.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        onClick={() => fetchMessages(s.id)}
                                        className={`w-full text-left p-3 hover:bg-accent/50 transition-colors ${selectedSession === s.id ? 'bg-accent' : ''}`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-sm truncate max-w-[240px]">
                                                {s.title || 'Rozmowa bez tytułu'}
                                            </span>
                                            <Badge variant="secondary" className="text-[10px] shrink-0">
                                                {s._count.messages}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <User className="h-3 w-3" />
                                            <span className="truncate">{s.user.name || s.user.email}</span>
                                            <span>·</span>
                                            <Clock className="h-3 w-3" />
                                            <span>{formatDate(s.updatedAt)}</span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Pagination */}
                    <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-sm">
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-muted-foreground">
                            {page} / {totalPages}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Right: Message Viewer */}
                <div className="flex-1 flex flex-col">
                    {!selectedSession ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
                            <p className="text-lg font-medium">Wybierz rozmowę</p>
                            <p className="text-sm">Kliknij sesję po lewej, aby zobaczyć wiadomości</p>
                        </div>
                    ) : loadingMessages ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                        </div>
                    ) : (
                        <>
                            {/* Session Header */}
                            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">
                                        {sessions.find(s => s.id === selectedSession)?.title || 'Rozmowa'}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {messages.length} wiadomości
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => { setSelectedSession(null); setMessages([]); }}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Messages */}
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4 max-w-3xl mx-auto">
                                    <AnimatePresence>
                                        {messages.map(msg => (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex gap-3 ${msg.role === 'assistant' ? '' : 'flex-row-reverse'}`}
                                            >
                                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === 'assistant' ? 'bg-purple-100 dark:bg-purple-500/20' : 'bg-blue-100 dark:bg-blue-500/20'}`}>
                                                    {msg.role === 'assistant' ? (
                                                        <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                    ) : (
                                                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    )}
                                                </div>
                                                <div className={`rounded-xl px-4 py-2 max-w-[80%] ${msg.role === 'assistant' ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-blue-50 dark:bg-blue-500/10'}`}>
                                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                    <p className="text-[10px] text-muted-foreground mt-1">{formatDate(msg.createdAt)}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </ScrollArea>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
