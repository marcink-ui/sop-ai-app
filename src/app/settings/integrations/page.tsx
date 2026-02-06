'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    Plug,
    Check,
    X,
    ExternalLink,
    RefreshCw,
    Settings2,
    Calendar,
    FileText,
    Video,
    Cloud,
    Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const integrations = [
    {
        id: 'google-workspace',
        name: 'Google Workspace',
        description: 'Gmail, Google Drive, Google Calendar',
        icon: Cloud,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        status: 'connected',
        lastSync: '5 min temu'
    },
    {
        id: 'coda',
        name: 'Coda',
        description: 'Dokumenty i bazy danych Coda',
        icon: Database,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        status: 'connected',
        lastSync: '1 godz. temu'
    },
    {
        id: 'fireflies',
        name: 'Fireflies.ai',
        description: 'Transkrypcje spotkań i notatki',
        icon: Video,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        status: 'connected',
        lastSync: '2 godz. temu'
    },
    {
        id: 'notion',
        name: 'Notion',
        description: 'Wiki, dokumentacja, bazy danych',
        icon: FileText,
        color: 'text-slate-500',
        bgColor: 'bg-slate-500/10',
        status: 'disconnected',
        lastSync: null
    },
    {
        id: 'slack',
        name: 'Slack',
        description: 'Komunikacja zespołowa',
        icon: Cloud,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        status: 'disconnected',
        lastSync: null
    },
    {
        id: 'calendar',
        name: 'Apple Calendar',
        description: 'Kalendarz i wydarzenia',
        icon: Calendar,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        status: 'disconnected',
        lastSync: null
    }
];

export default function IntegrationsPage() {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleConnect = async (id: string) => {
        setLoadingId(id);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoadingId(null);
        toast.success('Integracja połączona pomyślnie');
    };

    const handleDisconnect = async (id: string) => {
        setLoadingId(id);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoadingId(null);
        toast.success('Integracja rozłączona');
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <Link href="/settings">
                        <Button variant="ghost" size="icon" className="hover:bg-muted">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Integracje</h1>
                        <p className="text-sm text-muted-foreground">Połączenia z zewnętrznymi narzędziami i MCP</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid gap-4 sm:grid-cols-3"
            >
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <p className="text-sm text-muted-foreground">Połączone</p>
                    <p className="text-2xl font-bold text-emerald-500">{integrations.filter(i => i.status === 'connected').length}</p>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <p className="text-sm text-muted-foreground">Dostępne</p>
                    <p className="text-2xl font-bold text-foreground">{integrations.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-4">
                    <p className="text-sm text-muted-foreground">Ostatnia synchronizacja</p>
                    <p className="text-2xl font-bold text-foreground">5 min</p>
                </div>
            </motion.div>

            {/* Integrations Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid gap-4 sm:grid-cols-2"
            >
                {integrations.map((integration, index) => {
                    const Icon = integration.icon;
                    const isConnected = integration.status === 'connected';
                    const isLoading = loadingId === integration.id;

                    return (
                        <motion.div
                            key={integration.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                            className={cn(
                                'rounded-xl border p-5 transition-all duration-300',
                                isConnected
                                    ? 'border-emerald-500/30 bg-emerald-500/5'
                                    : 'border-border bg-card/50 hover:border-violet-500/30'
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={cn('rounded-lg p-3', integration.bgColor)}>
                                        <Icon className={cn('h-5 w-5', integration.color)} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{integration.name}</h3>
                                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                                        {isConnected && integration.lastSync && (
                                            <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                                                <Check className="h-3 w-3" />
                                                Ostatnia synchronizacja: {integration.lastSync}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isConnected ? (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleConnect(integration.id)}
                                                disabled={isLoading}
                                            >
                                                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                                onClick={() => handleDisconnect(integration.id)}
                                                disabled={isLoading}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            size="sm"
                                            className="bg-violet-600 hover:bg-violet-700"
                                            onClick={() => handleConnect(integration.id)}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                            ) : (
                                                'Połącz'
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* MCP Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="rounded-xl border border-border bg-muted/20 p-5"
            >
                <div className="flex items-start gap-3">
                    <Plug className="h-5 w-5 text-violet-400 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-foreground mb-1">Model Context Protocol (MCP)</h3>
                        <p className="text-sm text-muted-foreground">
                            VantageOS wykorzystuje MCP do bezpiecznej integracji z zewnętrznymi narzędziami.
                            Każda integracja działa w izolowanym środowisku z kontrolą dostępu.
                        </p>
                        <a
                            href="https://modelcontextprotocol.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 mt-2"
                        >
                            Dowiedz się więcej o MCP
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
