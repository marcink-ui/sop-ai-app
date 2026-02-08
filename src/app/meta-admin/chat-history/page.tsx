'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    MessageSquare,
    Search,
    Trash2,
    ChevronLeft,
    ChevronRight,
    User,
    Calendar,
    Bot,
    RefreshCw,
    Filter,
    Download,
    Eye,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ChatMessage {
    id: string;
    role: string;
    content: string;
    createdAt: string;
}

interface ChatSession {
    id: string;
    title: string;
    context: any;
    user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
    messageCount: number;
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function ChatHistoryPage() {
    const { data: session, status } = useSession();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

    const fetchSessions = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            });
            if (search) params.set('search', search);

            const res = await fetch(`/api/chat-history?${params}`);
            const data = await res.json();

            if (res.ok) {
                setSessions(data.sessions);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setIsLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'SPONSOR') {
            fetchSessions();
        }
    }, [fetchSessions, status, session?.user?.role]);

    // Access check - after all hooks
    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (session?.user?.role !== 'SPONSOR') {
        redirect('/dashboard');
    }

    const handleDelete = async (sessionId: string) => {
        try {
            const res = await fetch(`/api/chat-history?sessionId=${sessionId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchSessions();
            }
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchSessions();
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <Link href="/meta-admin">
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Historia Chat AI</h1>
                        <p className="text-sm text-muted-foreground">
                            Przeglądaj wszystkie rozmowy z AI w organizacji
                        </p>
                    </div>
                </div>
                <Button variant="outline" onClick={fetchSessions} disabled={isLoading}>
                    <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                    Odśwież
                </Button>
            </motion.div>

            {/* Search & Stats */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-4"
            >
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Szukaj w rozmowach..."
                            className="pl-9"
                        />
                    </div>
                    <Button type="submit" variant="secondary">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtruj
                    </Button>
                </form>

                {pagination && (
                    <Badge variant="secondary" className="text-sm">
                        {pagination.total} rozmów
                    </Badge>
                )}
            </motion.div>

            {/* Sessions List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : sessions.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Brak rozmów do wyświetlenia</p>
                        </CardContent>
                    </Card>
                ) : (
                    sessions.map((chatSession, index) => (
                        <motion.div
                            key={chatSession.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * index }}
                        >
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="py-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={chatSession.user.image || undefined} />
                                            <AvatarFallback>
                                                {chatSession.user.name?.charAt(0) || chatSession.user.email.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium truncate">{chatSession.title}</h3>
                                                <Badge variant="outline" className="text-xs">
                                                    {chatSession.messageCount} wiadomości
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {chatSession.user.name || chatSession.user.email}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(chatSession.updatedAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedSession(chatSession)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Podgląd
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl max-h-[80vh]">
                                                    <DialogHeader>
                                                        <DialogTitle>{chatSession.title}</DialogTitle>
                                                        <DialogDescription>
                                                            {chatSession.user.name} • {formatDate(chatSession.createdAt)}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <ScrollArea className="h-[60vh] pr-4">
                                                        <div className="space-y-4">
                                                            {chatSession.messages.map((msg) => (
                                                                <div
                                                                    key={msg.id}
                                                                    className={cn(
                                                                        "p-3 rounded-lg",
                                                                        msg.role === 'user'
                                                                            ? "bg-primary/10 ml-8"
                                                                            : "bg-muted mr-8"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        {msg.role === 'user' ? (
                                                                            <User className="h-4 w-4" />
                                                                        ) : (
                                                                            <Bot className="h-4 w-4 text-primary" />
                                                                        )}
                                                                        <span className="text-xs font-medium">
                                                                            {msg.role === 'user' ? 'Użytkownik' : 'AI'}
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {formatDate(msg.createdAt)}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </ScrollArea>
                                                </DialogContent>
                                            </Dialog>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Usuń rozmowę?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Ta operacja jest nieodwracalna. Rozmowa zostanie trwale usunięta.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(chatSession.id)}
                                                            className="bg-destructive text-destructive-foreground"
                                                        >
                                                            Usuń
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </motion.div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-2"
                >
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Strona {page} z {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
