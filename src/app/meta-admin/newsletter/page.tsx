'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    Newspaper,
    ArrowLeft,
    Plus,
    Send,
    Calendar,
    Eye,
    Edit,
    Trash2,
    Globe,
    Building2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface NewsItem {
    id: string;
    title: string;
    summary: string;
    category: 'internal' | 'external';
    source: string;
    date: string;
    link?: string;
    published: boolean;
}

// Sample existing newsletters
const SAMPLE_NEWSLETTERS: NewsItem[] = [
    {
        id: '1',
        title: 'Nowa wersja VantageOS 2.0 już dostępna',
        summary: 'Wprowadziliśmy nowy moduł Graf Wiedzy oraz ulepszoną integrację z Prisma.',
        category: 'internal',
        source: 'VantageOS Team',
        date: '2024-02-05',
        published: true,
    },
    {
        id: '2',
        title: 'OpenAI GPT-4 Turbo - co nowego?',
        summary: 'Najnowszy model GPT-4 Turbo oferuje 128k context window.',
        category: 'external',
        source: 'AI Weekly',
        date: '2024-02-03',
        link: 'https://openai.com/gpt-4-turbo',
        published: true,
    },
];

export default function NewsletterPublisherPage() {
    const { data: session, status } = useSession();
    const [newsletters, setNewsletters] = useState<NewsItem[]>(SAMPLE_NEWSLETTERS);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        category: 'internal' as 'internal' | 'external',
        source: '',
        link: '',
    });

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

    const handleSubmit = () => {
        if (!formData.title || !formData.summary) {
            toast.error('Uzupełnij tytuł i treść');
            return;
        }

        const newItem: NewsItem = {
            id: Date.now().toString(),
            title: formData.title,
            summary: formData.summary,
            category: formData.category,
            source: formData.source || 'VantageOS Admin',
            date: new Date().toISOString().split('T')[0],
            link: formData.link || undefined,
            published: false,
        };

        setNewsletters([newItem, ...newsletters]);
        setFormData({ title: '', summary: '', category: 'internal', source: '', link: '' });
        setIsDialogOpen(false);
        toast.success('Newsletter utworzony');
    };

    const publishItem = (id: string) => {
        setNewsletters(newsletters.map(n =>
            n.id === id ? { ...n, published: true } : n
        ));
        toast.success('Newsletter opublikowany');
    };

    const deleteItem = (id: string) => {
        setNewsletters(newsletters.filter(n => n.id !== id));
        toast.success('Newsletter usunięty');
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
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
                        <Newspaper className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Newsletter Publisher</h1>
                        <p className="text-sm text-muted-foreground">
                            Twórz i publikuj newsy
                        </p>
                    </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-gradient-to-r from-teal-600 to-cyan-600">
                            <Plus className="h-4 w-4" />
                            Nowy Newsletter
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Nowy Newsletter</DialogTitle>
                            <DialogDescription>
                                Utwórz nowy wpis do newslettera
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Tytuł</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Tytuł newslettera..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="summary">Treść</Label>
                                <Textarea
                                    id="summary"
                                    value={formData.summary}
                                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                    placeholder="Treść wiadomości..."
                                    rows={4}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Kategoria</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(v: 'internal' | 'external') => setFormData({ ...formData, category: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="internal">Firmowe</SelectItem>
                                            <SelectItem value="external">Globalne</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="source">Źródło</Label>
                                    <Input
                                        id="source"
                                        value={formData.source}
                                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                        placeholder="np. HR Team"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="link">Link (opcjonalnie)</Label>
                                <Input
                                    id="link"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Anuluj
                            </Button>
                            <Button onClick={handleSubmit}>
                                Utwórz
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{newsletters.length}</div>
                        <div className="text-sm text-muted-foreground">Wszystkich newsletterów</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-emerald-500">
                            {newsletters.filter(n => n.published).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Opublikowanych</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-amber-500">
                            {newsletters.filter(n => !n.published).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Wersje robocze</div>
                    </CardContent>
                </Card>
            </div>

            {/* Newsletters List */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista Newsletterów</CardTitle>
                    <CardDescription>Zarządzaj wpisami newslettera</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="divide-y divide-border">
                        {newsletters.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="py-4 flex items-start gap-4"
                            >
                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${item.category === 'internal' ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-green-100 dark:bg-green-500/20'}`}>
                                    {item.category === 'internal' ? (
                                        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    ) : (
                                        <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium truncate">{item.title}</h3>
                                        {!item.published && (
                                            <Badge variant="outline" className="text-amber-500 border-amber-500/50 text-[10px]">
                                                Wersja robocza
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                        {item.summary}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {item.date}
                                        </span>
                                        <span>·</span>
                                        <span>{item.source}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!item.published && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1"
                                            onClick={() => publishItem(item.id)}
                                        >
                                            <Send className="h-3 w-3" />
                                            Publikuj
                                        </Button>
                                    )}
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                        onClick={() => deleteItem(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
