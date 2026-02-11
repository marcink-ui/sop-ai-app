'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft, FileText, Search, Filter,
    Shield, Clock, User, Settings, Trash2,
    LogIn, LogOut, Edit, Eye, Plus,
    ChevronRight, AlertTriangle, CheckCircle2,
    RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Generate realistic demo audit events
function generateAuditEvents() {
    const events = [
        { id: 'ae1', timestamp: '2026-02-10T14:32:00Z', user: 'Marcin Kapusta', action: 'LOGIN', target: 'System', details: 'Logowanie z IP 89.64.xx.xx', severity: 'info' },
        { id: 'ae2', timestamp: '2026-02-10T14:15:00Z', user: 'System', action: 'BACKUP', target: 'Database', details: 'Automatyczny backup całej bazy danych', severity: 'info' },
        { id: 'ae3', timestamp: '2026-02-10T13:45:00Z', user: 'Anna Kowalska', action: 'CREATE', target: 'SOP: Onboarding v2.1', details: 'Nowa wersja procedury onboardingowej', severity: 'info' },
        { id: 'ae4', timestamp: '2026-02-10T12:20:00Z', user: 'Marcin Kapusta', action: 'UPDATE', target: 'Organization: TechFlow', details: 'Zmiana ustawień organizacji', severity: 'warning' },
        { id: 'ae5', timestamp: '2026-02-10T11:00:00Z', user: 'Lucas O.', action: 'DELETE', target: 'Agent: Test Bot', details: 'Usunięcie testowego agenta', severity: 'warning' },
        { id: 'ae6', timestamp: '2026-02-10T10:30:00Z', user: 'System', action: 'API_CALL', target: 'OpenAI GPT-4', details: '847 tokenów zużytych', severity: 'info' },
        { id: 'ae7', timestamp: '2026-02-09T22:15:00Z', user: 'System', action: 'ERROR', target: 'Email Service', details: 'Timeout przy wysyłce newslettera', severity: 'error' },
        { id: 'ae8', timestamp: '2026-02-09T18:00:00Z', user: 'Ewa Wiśniewska', action: 'LOGIN', target: 'System', details: 'Logowanie z nowego urządzenia', severity: 'info' },
        { id: 'ae9', timestamp: '2026-02-09T16:45:00Z', user: 'Marcin Kapusta', action: 'UPDATE', target: 'User Role: Lucas O.', details: 'Zmiana roli na META_ADMIN', severity: 'warning' },
        { id: 'ae10', timestamp: '2026-02-09T15:30:00Z', user: 'System', action: 'DEPLOY', target: 'VantageOS v2.3.1', details: 'Aktualizacja produkcyjna', severity: 'info' },
        { id: 'ae11', timestamp: '2026-02-09T14:00:00Z', user: 'Piotr Dąbrowski', action: 'CREATE', target: 'Task: Audit SOP', details: 'Nowe zadanie w sprint 19', severity: 'info' },
        { id: 'ae12', timestamp: '2026-02-09T10:15:00Z', user: 'System', action: 'SECURITY', target: 'Failed Login', details: '3 nieudane próby logowania - konto zablokowane na 15 min', severity: 'error' },
        { id: 'ae13', timestamp: '2026-02-08T20:00:00Z', user: 'Marcin Kapusta', action: 'EXPORT', target: 'Raport ROI Q1', details: 'Eksport raportu PDF', severity: 'info' },
        { id: 'ae14', timestamp: '2026-02-08T17:30:00Z', user: 'System', action: 'CLEANUP', target: 'Session Cache', details: 'Wyczyszczono 234 wygasłe sesje', severity: 'info' },
        { id: 'ae15', timestamp: '2026-02-08T14:00:00Z', user: 'Anna Kowalska', action: 'UPDATE', target: 'SOP: Support Ticket', details: 'Aktualizacja kroków 3-5', severity: 'info' },
    ];
    return events;
}

const actionIcons: Record<string, React.ElementType> = {
    LOGIN: LogIn,
    LOGOUT: LogOut,
    CREATE: Plus,
    UPDATE: Edit,
    DELETE: Trash2,
    VIEW: Eye,
    BACKUP: Shield,
    API_CALL: Settings,
    ERROR: AlertTriangle,
    DEPLOY: CheckCircle2,
    SECURITY: Shield,
    EXPORT: FileText,
    CLEANUP: RefreshCw,
};

const severityStyles: Record<string, string> = {
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

export default function AuditLogPage() {
    const { data: session, isPending } = useSession();
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('ALL');
    const [severityFilter, setSeverityFilter] = useState('ALL');
    const events = generateAuditEvents();

    if (isPending) {
        return <div className="flex items-center justify-center h-64"><FileText className="h-8 w-8 animate-pulse text-rose-500" /></div>;
    }
    if (session?.user?.role !== 'META_ADMIN') {
        redirect('/');
    }

    const filteredEvents = events.filter(e => {
        if (search && !e.user.toLowerCase().includes(search.toLowerCase()) && !e.target.toLowerCase().includes(search.toLowerCase()) && !e.details.toLowerCase().includes(search.toLowerCase())) return false;
        if (actionFilter !== 'ALL' && e.action !== actionFilter) return false;
        if (severityFilter !== 'ALL' && e.severity !== severityFilter) return false;
        return true;
    });

    const actions = [...new Set(events.map(e => e.action))];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin-panel">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                </Link>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Audit Log</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Pełna historia zdarzeń i zmian na platformie</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                        placeholder="Szukaj w logach..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="h-9 px-3 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white"
                >
                    <option value="ALL">Wszystkie akcje</option>
                    {actions.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="h-9 px-3 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white"
                >
                    <option value="ALL">Wszystkie poziomy</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                </select>
                <Badge variant="outline" className="text-xs">
                    {filteredEvents.length} / {events.length} zdarzeń
                </Badge>
            </div>

            {/* Events List */}
            <Card>
                <CardContent className="p-0">
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {filteredEvents.map((event, i) => {
                            const ActionIcon = actionIcons[event.action] || FileText;
                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="px-4 py-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                                            event.severity === 'error' ? 'bg-red-100 dark:bg-red-500/20' :
                                                event.severity === 'warning' ? 'bg-amber-100 dark:bg-amber-500/20' :
                                                    'bg-blue-100 dark:bg-blue-500/20'
                                        )}>
                                            <ActionIcon className={cn('h-4 w-4',
                                                event.severity === 'error' ? 'text-red-600 dark:text-red-400' :
                                                    event.severity === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                                                        'text-blue-600 dark:text-blue-400'
                                            )} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm text-neutral-900 dark:text-white">{event.target}</span>
                                                <Badge className={cn('text-[10px]', severityStyles[event.severity])}>{event.action}</Badge>
                                            </div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{event.details}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-xs font-medium text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {event.user}
                                            </div>
                                            <div className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                                                <Clock className="h-3 w-3" />
                                                {new Date(event.timestamp).toLocaleString('pl-PL', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                    {filteredEvents.length === 0 && (
                        <div className="py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                            <FileText className="h-8 w-8 mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
                            Brak zdarzeń pasujących do filtrów
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
