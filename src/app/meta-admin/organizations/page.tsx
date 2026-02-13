'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import {
    Building2,
    Users,
    FileText,
    Bot,
    Search,
    Plus,
    ArrowLeft,
    ChevronRight,
    Loader2,
    X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Company {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    users: number;
    sops: number;
    agents: number;
    status: string;
    createdAt: string;
}

export default function MetaAdminOrganizationsPage() {
    const { data: session, isPending } = useSession();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [newCompanySlug, setNewCompanySlug] = useState('');
    const [creating, setCreating] = useState(false);

    // Auth guard
    if (!isPending && (!session?.user || session.user.role !== 'META_ADMIN')) {
        redirect('/');
    }

    const fetchCompanies = useCallback(async () => {
        try {
            const res = await fetch('/api/companies');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setCompanies(data.companies || []);
        } catch (error) {
            console.error('Failed to fetch companies:', error);
            toast.error('Nie udało się pobrać listy firm');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (session) fetchCompanies();
    }, [session, fetchCompanies]);

    const handleCreateCompany = async () => {
        if (!newCompanyName.trim()) return;
        setCreating(true);
        try {
            const slug = newCompanySlug.trim() || newCompanyName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const res = await fetch('/api/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCompanyName.trim(), slug }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to create');
            }
            toast.success('Firma została dodana');
            setAddDialogOpen(false);
            setNewCompanyName('');
            setNewCompanySlug('');
            fetchCompanies();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Nie udało się dodać firmy';
            toast.error(message);
        } finally {
            setCreating(false);
        }
    };

    const filteredCompanies = companies.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isPending || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/meta-admin">
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                        <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Wszystkie Organizacje
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {companies.length} firm w systemie
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => setAddDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj firmę
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                    placeholder="Szukaj firmy po nazwie lub slug..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Companies Grid */}
            {filteredCompanies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCompanies.map((company, index) => (
                        <motion.div
                            key={company.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <Card className="bg-white dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-500/20 dark:to-cyan-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                                            {company.logo ? (
                                                <img src={company.logo} alt={company.name} className="h-8 w-8 rounded-lg object-cover" />
                                            ) : (
                                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                    {company.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                                                {company.name}
                                            </h3>
                                            <p className="text-xs text-neutral-400 dark:text-neutral-500">
                                                /{company.slug}
                                            </p>
                                        </div>
                                        <Badge className={cn(
                                            'text-xs',
                                            company.status === 'active'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
                                        )}>
                                            {company.status === 'active' ? 'Aktywna' : company.status}
                                        </Badge>
                                    </div>

                                    <div className="mt-4 grid grid-cols-3 gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Users className="h-3.5 w-3.5 text-blue-500" />
                                                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                    {company.users}
                                                </span>
                                            </div>
                                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                Użytkowników
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <FileText className="h-3.5 w-3.5 text-emerald-500" />
                                                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                    {company.sops}
                                                </span>
                                            </div>
                                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                SOPs
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Bot className="h-3.5 w-3.5 text-violet-500" />
                                                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                    {company.agents}
                                                </span>
                                            </div>
                                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                Agentów
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
                                        Dodano: {company.createdAt}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <Card className="bg-neutral-50 dark:bg-neutral-900/30 border-dashed">
                    <CardContent className="py-12 text-center">
                        <Building2 className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                        <h3 className="font-medium text-neutral-900 dark:text-white mb-1">
                            {searchQuery ? 'Brak wyników' : 'Brak firm'}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                            {searchQuery
                                ? `Nie znaleziono firm pasujących do "${searchQuery}"`
                                : 'Dodaj pierwszą firmę, aby rozpocząć'
                            }
                        </p>
                        {!searchQuery && (
                            <Button onClick={() => setAddDialogOpen(true)} variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Dodaj firmę
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Add Company Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dodaj nową firmę</DialogTitle>
                        <DialogDescription>
                            Utwórz organizację w systemie VantageOS
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Nazwa firmy</Label>
                            <Input
                                id="companyName"
                                placeholder="np. Firma XYZ"
                                value={newCompanyName}
                                onChange={(e) => {
                                    setNewCompanyName(e.target.value);
                                    // auto-generate slug
                                    if (!newCompanySlug || newCompanySlug === newCompanyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) {
                                        setNewCompanySlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                                    }
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="companySlug">Slug (URL)</Label>
                            <Input
                                id="companySlug"
                                placeholder="np. firma-xyz"
                                value={newCompanySlug}
                                onChange={(e) => setNewCompanySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                            Anuluj
                        </Button>
                        <Button
                            onClick={handleCreateCompany}
                            disabled={!newCompanyName.trim() || creating}
                            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Tworzenie...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Utwórz
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
