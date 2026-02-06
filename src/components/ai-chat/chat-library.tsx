'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    Search,
    Trash2,
    Clock,
    Bot,
    FileText,
    Filter,
    ChevronRight,
    Loader2,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { Skeleton } from '@/components/ui/skeleton';

interface ChatSession {
    id: string;
    title: string;
    context: {
        currentPage?: string;
        sopTitle?: string;
        agentName?: string;
        role?: string;
    } | null;
    messageCount: number;
    lastMessage: {
        content: string;
        role: string;
        createdAt: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export function ChatLibrary() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [contextFilter, setContextFilter] = useState<string>('all');
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
    const [sessionMessages, setSessionMessages] = useState<any[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Fetch sessions
    useEffect(() => {
        async function fetchSessions() {
            try {
                const res = await fetch('/api/chat/sessions?limit=50');
                const data = await res.json();
                setSessions(data.sessions || []);
            } catch (error) {
                console.error('Failed to fetch sessions:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchSessions();
    }, []);

    // Fetch session details
    const openSession = async (session: ChatSession) => {
        setSelectedSession(session);
        setLoadingMessages(true);
        try {
            const res = await fetch(`/api/chat/sessions/${session.id}`);
            const data = await res.json();
            setSessionMessages(data.messages || []);
        } catch (error) {
            console.error('Failed to fetch session:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    // Delete session
    const deleteSession = async (sessionId: string) => {
        try {
            await fetch(`/api/chat/sessions/${sessionId}`, { method: 'DELETE' });
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            if (selectedSession?.id === sessionId) {
                setSelectedSession(null);
                setSessionMessages([]);
            }
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    };

    // Filter and search
    const filteredSessions = sessions.filter(session => {
        const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            session.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = contextFilter === 'all' ||
            (contextFilter === 'sop' && session.context?.sopTitle) ||
            (contextFilter === 'agent' && session.context?.agentName) ||
            (contextFilter === 'general' && !session.context?.sopTitle && !session.context?.agentName);

        return matchesSearch && matchesFilter;
    });

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getContextBadge = (context: ChatSession['context']) => {
        if (context?.sopTitle) {
            return <Badge variant="secondary" className="gap-1"><FileText className="h-3 w-3" />{context.sopTitle}</Badge>;
        }
        if (context?.agentName) {
            return <Badge variant="secondary" className="gap-1"><Bot className="h-3 w-3" />{context.agentName}</Badge>;
        }
        return null;
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-24 w-full" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex gap-6">
            {/* Sessions List */}
            <div className="flex-1 space-y-4">
                {/* Filters */}
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Szukaj w rozmowach..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={contextFilter} onValueChange={setContextFilter}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Kontekst" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Wszystkie</SelectItem>
                            <SelectItem value="sop">Z SOP</SelectItem>
                            <SelectItem value="agent">Z Agentem</SelectItem>
                            <SelectItem value="general">Ogólne</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Session List */}
                {filteredSessions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Brak rozmów do wyświetlenia</p>
                        <p className="text-sm mt-1">Rozpocznij rozmowę z AI aby zobaczyć ją tutaj</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredSessions.map((session, index) => (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`group relative p-4 rounded-lg border cursor-pointer transition-all ${selectedSession?.id === session.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                    }`}
                                onClick={() => openSession(session)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                                            <h3 className="font-medium truncate">{session.title}</h3>
                                        </div>
                                        {session.lastMessage && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {session.lastMessage.content}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            {getContextBadge(session.context)}
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDate(session.updatedAt)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {session.messageCount} wiadomości
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Usuń rozmowę?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Ta akcja jest nieodwracalna. Rozmowa zostanie trwale usunięta.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        onClick={() => deleteSession(session.id)}
                                                    >
                                                        Usuń
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Session Detail */}
            {selectedSession && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-[500px] shrink-0 border rounded-xl bg-card overflow-hidden"
                >
                    <div className="p-4 border-b flex items-center justify-between bg-muted/50">
                        <div>
                            <h2 className="font-semibold">{selectedSession.title}</h2>
                            <p className="text-xs text-muted-foreground">
                                {formatDate(selectedSession.createdAt)}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setSelectedSession(null);
                                setSessionMessages([]);
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="h-[600px] overflow-y-auto p-4 space-y-4">
                        {loadingMessages ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            sessionMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div
                                        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user'
                                                ? 'bg-muted'
                                                : 'bg-gradient-to-br from-blue-500 to-purple-600'
                                            }`}
                                    >
                                        {msg.role === 'user' ? (
                                            <span className="text-xs font-medium">Ty</span>
                                        ) : (
                                            <Bot className="h-4 w-4 text-white" />
                                        )}
                                    </div>
                                    <div
                                        className={`flex-1 rounded-xl px-4 py-2 ${msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        <p className="text-[10px] opacity-60 mt-1">
                                            {new Date(msg.createdAt).toLocaleTimeString('pl-PL', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
