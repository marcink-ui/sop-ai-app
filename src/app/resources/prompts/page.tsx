'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Code2, Copy, Check, Plus, Loader2 } from 'lucide-react';

interface AgentPrompt {
    id: string;
    name: string;
    code?: string;
    type?: string;
    status?: string;
    masterPrompt?: string;
    model?: string;
    temperature?: number;
    description?: string;
    updatedAt?: string;
}

export default function PromptsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('Wszystkie');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [prompts, setPrompts] = useState<AgentPrompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch prompts from API
    useEffect(() => {
        async function fetchPrompts() {
            try {
                const res = await fetch('/api/prompts');
                if (res.status === 403) {
                    setError('Brak uprawnień — ta strona wymaga roli SPONSOR');
                    return;
                }
                if (!res.ok) throw new Error('Failed to load');
                const data = await res.json();
                setPrompts(data.agents || []);
            } catch (err) {
                console.error('Failed to load prompts:', err);
                setError('Nie udało się załadować promptów');
            } finally {
                setLoading(false);
            }
        }
        fetchPrompts();
    }, []);

    // Extract unique types for filter tabs
    const types = ['Wszystkie', ...Array.from(new Set(prompts.map(p => p.type || 'Inne').filter(Boolean)))];

    const filteredPrompts = prompts.filter(prompt => {
        const matchesSearch = (prompt.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (prompt.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'Wszystkie' || (prompt.type || 'Inne') === selectedType;
        return matchesSearch && matchesType;
    });

    const copyToClipboard = async (prompt: AgentPrompt) => {
        if (!prompt.masterPrompt) return;
        await navigator.clipboard.writeText(prompt.masterPrompt);
        setCopiedId(prompt.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-center min-h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                    <Code2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Code2 className="h-6 w-6 text-slate-500" />
                        System Prompts
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Prompty agentów AI w Twojej organizacji
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj promptów..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {types.map(type => (
                        <Button
                            key={type}
                            variant={selectedType === type ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedType(type)}
                        >
                            {type}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Prompts Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPrompts.map(prompt => (
                    <Card key={prompt.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <Badge variant="outline">{prompt.type || 'Inne'}</Badge>
                                <div className="flex items-center gap-2">
                                    {prompt.status && (
                                        <Badge
                                            variant={prompt.status === 'ACTIVE' ? 'default' : 'secondary'}
                                            className="text-xs"
                                        >
                                            {prompt.status}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <CardTitle className="text-lg">{prompt.name}</CardTitle>
                            <CardDescription>{prompt.description || 'Brak opisu'}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <div className="flex flex-wrap gap-1 mb-4">
                                {prompt.model && (
                                    <Badge variant="secondary" className="text-xs font-mono">
                                        {prompt.model}
                                    </Badge>
                                )}
                                {prompt.temperature !== undefined && (
                                    <Badge variant="secondary" className="text-xs">
                                        temp: {prompt.temperature}
                                    </Badge>
                                )}
                                {prompt.code && (
                                    <Badge variant="outline" className="text-xs font-mono">
                                        {prompt.code}
                                    </Badge>
                                )}
                            </div>
                            <div className="mt-auto flex items-center justify-between pt-4 border-t">
                                <span className="text-xs text-muted-foreground">
                                    {prompt.updatedAt
                                        ? `Zaktualizowano: ${new Date(prompt.updatedAt).toLocaleDateString('pl-PL')}`
                                        : ''}
                                </span>
                                <div className="flex gap-2">
                                    {prompt.masterPrompt && (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    Podgląd
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>{prompt.name}</DialogTitle>
                                                    <DialogDescription>{prompt.description || 'Brak opisu'}</DialogDescription>
                                                </DialogHeader>
                                                <Textarea
                                                    value={prompt.masterPrompt}
                                                    readOnly
                                                    className="min-h-[300px] font-mono text-sm"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" onClick={() => copyToClipboard(prompt)}>
                                                        {copiedId === prompt.id ? (
                                                            <Check className="h-4 w-4 mr-2" />
                                                        ) : (
                                                            <Copy className="h-4 w-4 mr-2" />
                                                        )}
                                                        {copiedId === prompt.id ? 'Skopiowano!' : 'Kopiuj'}
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                    <Button
                                        size="sm"
                                        onClick={() => copyToClipboard(prompt)}
                                        disabled={!prompt.masterPrompt}
                                    >
                                        {copiedId === prompt.id ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredPrompts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Code2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{prompts.length === 0 ? 'Brak agentów z promptami' : 'Nie znaleziono promptów'}</p>
                </div>
            )}
        </div>
    );
}
