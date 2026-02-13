'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    FileCode2,
    Save,
    Play,
    RefreshCw,
    Copy,
    Check,
    ChevronLeft,
    Bot,
    MessageSquare,
    Briefcase,
    Lightbulb,
    Activity,
    Plus,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Link from 'next/link';

// Category icon mapping
const categoryIcons: Record<string, typeof Bot> = {
    'sop-process': FileCode2,
    'chat': MessageSquare,
    'value-chain': Activity,
    'level10': Briefcase,
    'canvas': Lightbulb,
    'communication': Bot,
};

interface SystemPrompt {
    id: string;
    slug: string;
    name: string;
    category: string;
    content: string;
    description: string | null;
    version: number;
    isActive: boolean;
    updatedAt: string;
    updatedBy: string | null;
}

export default function PromptsPage() {
    const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
    const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState('');
    const [editedName, setEditedName] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testOutput, setTestOutput] = useState('');
    const [copied, setCopied] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newSlug, setNewSlug] = useState('');
    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] = useState('chat');
    const [newContent, setNewContent] = useState('');
    const [newDescription, setNewDescription] = useState('');

    const fetchPrompts = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/prompts');
            if (res.ok) {
                const data = await res.json();
                setPrompts(data.prompts || []);
                if (!selectedPromptId && data.prompts?.length > 0) {
                    handleSelect(data.prompts[0]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch prompts:', err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchPrompts();
    }, [fetchPrompts]);

    function handleSelect(prompt: SystemPrompt) {
        setSelectedPromptId(prompt.id);
        setEditedContent(prompt.content);
        setEditedName(prompt.name);
        setEditedDescription(prompt.description || '');
        setTestOutput('');
    }

    async function handleSave() {
        if (!selectedPromptId) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/prompts', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedPromptId,
                    name: editedName,
                    content: editedContent,
                    description: editedDescription,
                }),
            });
            if (res.ok) {
                toast.success('Prompt zapisany');
                fetchPrompts();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Błąd zapisu');
            }
        } catch {
            toast.error('Błąd połączenia');
        } finally {
            setSaving(false);
        }
    }

    async function handleToggleActive(prompt: SystemPrompt) {
        try {
            const res = await fetch('/api/admin/prompts', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: prompt.id, isActive: !prompt.isActive }),
            });
            if (res.ok) {
                toast.success(prompt.isActive ? 'Prompt dezaktywowany' : 'Prompt aktywowany');
                fetchPrompts();
            }
        } catch {
            toast.error('Błąd');
        }
    }

    async function handleDelete(promptId: string) {
        if (!confirm('Usunąć ten prompt? Tej akcji nie można cofnąć.')) return;
        try {
            const res = await fetch(`/api/admin/prompts?id=${promptId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Prompt usunięty');
                if (selectedPromptId === promptId) setSelectedPromptId(null);
                fetchPrompts();
            }
        } catch {
            toast.error('Błąd usuwania');
        }
    }

    async function handleCreate() {
        if (!newSlug || !newName || !newCategory || !newContent) {
            toast.error('Wypełnij wszystkie wymagane pola');
            return;
        }
        try {
            const res = await fetch('/api/admin/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug: newSlug,
                    name: newName,
                    category: newCategory,
                    content: newContent,
                    description: newDescription,
                }),
            });
            if (res.ok) {
                toast.success('Prompt dodany');
                setShowCreateForm(false);
                setNewSlug(''); setNewName(''); setNewContent(''); setNewDescription('');
                fetchPrompts();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Błąd');
            }
        } catch {
            toast.error('Błąd');
        }
    }

    async function handleTest() {
        if (!editedContent.trim()) return;
        setTesting(true);
        setTestOutput('');
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: editedContent },
                        { role: 'user', content: 'Pokaż krótki przykład działania tego promptu.' },
                    ],
                }),
            });
            if (res.ok) {
                const reader = res.body?.getReader();
                const decoder = new TextDecoder();
                let result = '';
                if (reader) {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        result += decoder.decode(value, { stream: true });
                        setTestOutput(result);
                    }
                }
            } else {
                setTestOutput('Błąd testu: ' + res.statusText);
            }
        } catch {
            setTestOutput('Błąd połączenia z AI.');
        } finally {
            setTesting(false);
        }
    }

    function handleCopy() {
        navigator.clipboard.writeText(editedContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const selectedPrompt = prompts.find(p => p.id === selectedPromptId);
    const categories = [...new Set(prompts.map(p => p.category))];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin-panel">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <FileCode2 className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">System Prompts</h1>
                    <p className="text-sm text-neutral-500">Edytuj prompty systemowe AI z bazy danych</p>
                </div>
                <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nowy prompt
                </Button>
                <Button variant="outline" onClick={fetchPrompts} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {/* Create form */}
            {showCreateForm && (
                <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
                    <CardHeader>
                        <CardTitle className="text-lg">Nowy System Prompt</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                            <Input placeholder="slug (np. sop-consultant)" value={newSlug} onChange={e => setNewSlug(e.target.value)} />
                            <Input placeholder="Nazwa wyświetlana" value={newName} onChange={e => setNewName(e.target.value)} />
                            <select
                                className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                            >
                                <option value="sop-process">SOP Process</option>
                                <option value="chat">Chat</option>
                                <option value="value-chain">Value Chain</option>
                                <option value="level10">Level 10</option>
                                <option value="canvas">Canvas</option>
                                <option value="communication">Communication</option>
                            </select>
                        </div>
                        <Input placeholder="Opis (opcjonalny)" value={newDescription} onChange={e => setNewDescription(e.target.value)} />
                        <Textarea placeholder="Treść promptu..." value={newContent} onChange={e => setNewContent(e.target.value)} rows={6} />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowCreateForm(false)}>Anuluj</Button>
                            <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">Utwórz</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
            ) : (
                <div className="grid grid-cols-12 gap-6">
                    {/* Left sidebar — prompt list */}
                    <div className="col-span-4 space-y-4">
                        {categories.map(cat => {
                            const catPrompts = prompts.filter(p => p.category === cat);
                            const Icon = categoryIcons[cat] || Bot;
                            return (
                                <div key={cat} className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                                        <Icon className="h-3.5 w-3.5" />
                                        {cat}
                                    </div>
                                    {catPrompts.map(prompt => (
                                        <motion.div
                                            key={prompt.id}
                                            whileHover={{ scale: 1.01 }}
                                            onClick={() => handleSelect(prompt)}
                                            className={`cursor-pointer rounded-lg border p-3 transition-all ${selectedPromptId === prompt.id
                                                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-sm'
                                                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-sm text-neutral-900 dark:text-white">
                                                    {prompt.name}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <Badge variant="outline" className="text-[10px]">
                                                        v{prompt.version}
                                                    </Badge>
                                                    <button onClick={(e) => { e.stopPropagation(); handleToggleActive(prompt); }}>
                                                        {prompt.isActive
                                                            ? <ToggleRight className="h-4 w-4 text-emerald-500" />
                                                            : <ToggleLeft className="h-4 w-4 text-neutral-400" />
                                                        }
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(prompt.id); }}>
                                                        <Trash2 className="h-3.5 w-3.5 text-neutral-400 hover:text-red-500 transition-colors" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-neutral-500 mt-1 truncate">
                                                {prompt.description || prompt.slug}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            );
                        })}
                        {prompts.length === 0 && (
                            <div className="text-center py-12 text-neutral-400">
                                <Bot className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Brak promptów. Utwórz nowy lub uruchom seed.</p>
                            </div>
                        )}
                    </div>

                    {/* Right panel — editor */}
                    <div className="col-span-8 space-y-4">
                        {selectedPrompt ? (
                            <>
                                {/* Title + meta */}
                                <Card>
                                    <CardContent className="p-4 space-y-3">
                                        <Input
                                            value={editedName}
                                            onChange={e => setEditedName(e.target.value)}
                                            className="text-lg font-semibold"
                                            placeholder="Nazwa promptu"
                                        />
                                        <Input
                                            value={editedDescription}
                                            onChange={e => setEditedDescription(e.target.value)}
                                            className="text-sm"
                                            placeholder="Opis (widoczny tylko w adminie)"
                                        />
                                        <div className="flex items-center gap-3 text-xs text-neutral-400">
                                            <span>slug: <code className="text-neutral-600 dark:text-neutral-300">{selectedPrompt.slug}</code></span>
                                            <span>•</span>
                                            <span>Wersja {selectedPrompt.version}</span>
                                            <span>•</span>
                                            <span>{new Date(selectedPrompt.updatedAt).toLocaleString('pl-PL')}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Editor */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">Treść promptu</CardTitle>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1">
                                                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                                    {copied ? 'Skopiowano' : 'Kopiuj'}
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={handleTest} disabled={testing} className="gap-1">
                                                    <Play className="h-3.5 w-3.5" />
                                                    {testing ? 'Testuje...' : 'Testuj'}
                                                </Button>
                                                <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                                                    <Save className="h-3.5 w-3.5" />
                                                    {saving ? 'Zapisuję...' : 'Zapisz'}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            value={editedContent}
                                            onChange={e => setEditedContent(e.target.value)}
                                            rows={16}
                                            className="font-mono text-sm leading-relaxed"
                                            placeholder="Wpisz treść promptu..."
                                        />
                                    </CardContent>
                                </Card>

                                {/* Test output */}
                                {testOutput && (
                                    <Card className="border-emerald-200 dark:border-emerald-800">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Wynik testu</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                                                {testOutput}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center py-20 text-neutral-400">
                                <div className="text-center">
                                    <FileCode2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p>Wybierz prompt z listy po lewej stronie</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
