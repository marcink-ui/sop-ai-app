'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Key,
    RefreshCw,
    Plus,
    Trash2,
    Copy,
    Eye,
    EyeOff,
    Check,
    AlertCircle,
    Settings,
    Globe,
    Zap,
    Shield,
    ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface APIKey {
    id: string;
    name: string;
    provider: 'openai' | 'anthropic' | 'google' | 'custom';
    key: string;
    status: 'active' | 'invalid' | 'expired';
    lastUsed?: string;
    createdAt: string;
}

interface MCPServer {
    id: string;
    name: string;
    url: string;
    status: 'connected' | 'disconnected' | 'error';
    tools: number;
}

const providerConfig = {
    openai: { label: 'OpenAI', color: 'bg-emerald-500', icon: '🟢' },
    anthropic: { label: 'Anthropic', color: 'bg-amber-500', icon: '🟡' },
    google: { label: 'Google AI', color: 'bg-blue-500', icon: '🔵' },
    custom: { label: 'Custom', color: 'bg-gray-500', icon: '⚪' },
};

export default function APIManagementPage() {
    const { data: session, status } = useSession();
    const [keys, setKeys] = useState<APIKey[]>([
        {
            id: '1',
            name: 'Production OpenAI',
            provider: 'openai',
            key: 'sk-proj-...xxxxx',
            status: 'active',
            lastUsed: '2h ago',
            createdAt: '2026-01-15',
        },
        {
            id: '2',
            name: 'Claude API',
            provider: 'anthropic',
            key: 'sk-ant-...xxxxx',
            status: 'active',
            lastUsed: '1d ago',
            createdAt: '2026-01-10',
        },
    ]);
    const [mcpServers, setMcpServers] = useState<MCPServer[]>([
        { id: '1', name: 'Apple MCP', url: 'localhost:3001', status: 'connected', tools: 12 },
        { id: '2', name: 'Coda MCP', url: 'localhost:3002', status: 'connected', tools: 25 },
        { id: '3', name: 'Google Workspace', url: 'localhost:3003', status: 'disconnected', tools: 45 },
    ]);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const [newKeyDialog, setNewKeyDialog] = useState(false);
    const [newKey, setNewKey] = useState({ name: '', provider: 'openai' as const, key: '' });

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

    const toggleKeyVisibility = (id: string) => {
        const newSet = new Set(visibleKeys);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setVisibleKeys(newSet);
    };

    const copyKey = (key: string) => {
        navigator.clipboard.writeText(key);
        toast.success('Klucz skopiowany');
    };

    const handleAddKey = () => {
        if (!newKey.name || !newKey.key) {
            toast.error('Wypełnij wszystkie pola');
            return;
        }
        const key: APIKey = {
            id: Date.now().toString(),
            name: newKey.name,
            provider: newKey.provider,
            key: newKey.key.slice(0, 10) + '...' + newKey.key.slice(-5),
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0],
        };
        setKeys([...keys, key]);
        setNewKey({ name: '', provider: 'openai', key: '' });
        setNewKeyDialog(false);
        toast.success('Klucz API dodany');
    };

    const deleteKey = (id: string) => {
        setKeys(keys.filter(k => k.id !== id));
        toast.success('Klucz usunięty');
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
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Key className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">API & MCP Management</h1>
                        <p className="text-sm text-muted-foreground">
                            Zarządzaj kluczami API i serwerami MCP
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* API Keys Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Klucze API
                            </CardTitle>
                            <CardDescription>
                                Zarządzaj kluczami API do serwisów AI
                            </CardDescription>
                        </div>
                        <Dialog open={newKeyDialog} onOpenChange={setNewKeyDialog}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Dodaj klucz
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Dodaj nowy klucz API</DialogTitle>
                                    <DialogDescription>
                                        Wprowadź dane klucza API
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Nazwa</Label>
                                        <Input
                                            value={newKey.name}
                                            onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                                            placeholder="np. Production OpenAI"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Provider</Label>
                                        <Select
                                            value={newKey.provider}
                                            onValueChange={(v) => setNewKey({ ...newKey, provider: v as any })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(providerConfig).map(([key, { label, icon }]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {icon} {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Klucz API</Label>
                                        <Input
                                            value={newKey.key}
                                            onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                                            placeholder="sk-..."
                                            type="password"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setNewKeyDialog(false)}>
                                        Anuluj
                                    </Button>
                                    <Button onClick={handleAddKey}>Dodaj</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {keys.map((key) => (
                                <div
                                    key={key.id}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">
                                            {providerConfig[key.provider].icon}
                                        </span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{key.name}</span>
                                                <Badge
                                                    variant={key.status === 'active' ? 'default' : 'destructive'}
                                                    className="text-[10px]"
                                                >
                                                    {key.status}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground font-mono">
                                                {visibleKeys.has(key.id) ? key.key : '••••••••••••••••'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {key.lastUsed && (
                                            <span className="text-xs text-muted-foreground">
                                                {key.lastUsed}
                                            </span>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleKeyVisibility(key.id)}
                                        >
                                            {visibleKeys.has(key.id) ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => copyKey(key.key)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() => deleteKey(key.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* MCP Servers Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Serwery MCP
                        </CardTitle>
                        <CardDescription>
                            Status połączeń z serwerami Model Context Protocol
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-3">
                            {mcpServers.map((server) => (
                                <Card
                                    key={server.id}
                                    className={cn(
                                        "transition-all",
                                        server.status === 'connected' && "border-green-500/30",
                                        server.status === 'disconnected' && "border-amber-500/30 opacity-70",
                                        server.status === 'error' && "border-red-500/30"
                                    )}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">{server.name}</span>
                                            <Badge
                                                variant={
                                                    server.status === 'connected'
                                                        ? 'default'
                                                        : server.status === 'disconnected'
                                                            ? 'secondary'
                                                            : 'destructive'
                                                }
                                                className="text-[10px]"
                                            >
                                                {server.status === 'connected' && <Check className="h-3 w-3 mr-1" />}
                                                {server.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                                                {server.status}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground font-mono mb-2">
                                            {server.url}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <Zap className="h-3 w-3" />
                                            {server.tools} tools
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
