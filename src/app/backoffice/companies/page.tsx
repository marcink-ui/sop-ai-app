'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    Plus,
    Search,
    Users,
    FileText,
    ChevronLeft,
    MoreHorizontal,
    Settings,
    Trash2,
    Edit,
    Globe,
    Loader2,
    Bot,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

export default function CompaniesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/companies')
            .then(res => res.ok ? res.json() : { companies: [] })
            .then(data => setCompanies(data.companies || []))
            .catch(() => setCompanies([]))
            .finally(() => setIsLoading(false));
    }, []);

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/backoffice">
                    <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Firmy</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {isLoading ? 'Ładowanie...' : `${companies.length} organizacji`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                        placeholder="Szukaj firmy..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj firmę
                </Button>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                    <span className="ml-3 text-neutral-500">Ładowanie firm...</span>
                </div>
            ) : (
                <>
                    {/* Companies Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredCompanies.map((company, index) => (
                            <motion.div
                                key={company.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="bg-white dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-shadow">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-500/20 dark:to-cyan-500/20 flex items-center justify-center">
                                                    <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                                                        {company.name}
                                                    </h3>
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                                                        <Globe className="h-3 w-3" />
                                                        {company.slug}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="default"
                                                    className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                    Aktywna
                                                </Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edytuj
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Settings className="h-4 w-4 mr-2" />
                                                            Ustawienia
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600">
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Usuń
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                            <div className="text-center">
                                                <div className="flex items-center justify-center gap-1 text-lg font-semibold text-neutral-900 dark:text-white">
                                                    <Users className="h-3.5 w-3.5 text-neutral-400" />
                                                    {company.users}
                                                </div>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    Użytkownicy
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="flex items-center justify-center gap-1 text-lg font-semibold text-neutral-900 dark:text-white">
                                                    <FileText className="h-3.5 w-3.5 text-neutral-400" />
                                                    {company.sops}
                                                </div>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    SOPs
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="flex items-center justify-center gap-1 text-lg font-semibold text-neutral-900 dark:text-white">
                                                    <Bot className="h-3.5 w-3.5 text-neutral-400" />
                                                    {company.agents}
                                                </div>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    Agenci AI
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {filteredCompanies.length === 0 && (
                        <Card className="bg-neutral-50 dark:bg-neutral-900/30 border-dashed">
                            <CardContent className="py-12 text-center">
                                <Building2 className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                                <h3 className="font-medium text-neutral-900 dark:text-white mb-1">
                                    {searchQuery ? 'Nie znaleziono firm' : 'Brak firm'}
                                </h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                                    {searchQuery ? 'Zmień kryteria wyszukiwania' : 'Dodaj pierwszą firmę, aby rozpocząć'}
                                </p>
                                {!searchQuery && (
                                    <Button className="bg-gradient-to-r from-blue-500 to-cyan-600">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Dodaj firmę
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
