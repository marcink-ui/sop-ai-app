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
    Mail,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

// Sample data - in production would come from API
const companies = [
    {
        id: '1',
        name: 'SYHI Digital',
        domain: 'syhi.pl',
        industry: 'Consulting',
        users: 5,
        sops: 12,
        status: 'active',
        createdAt: '2024-01-15',
    },
];

export default function CompaniesPage() {
    const [searchQuery, setSearchQuery] = useState('');

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
                            Zarządzaj organizacjami i multi-tenancy
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
                                                {company.domain}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={company.status === 'active' ? 'default' : 'secondary'}
                                            className={company.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : ''}>
                                            {company.status === 'active' ? 'Aktywna' : 'Nieaktywna'}
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
                                        <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                                            {company.users}
                                        </div>
                                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Użytkownicy
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                                            {company.sops}
                                        </div>
                                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                            SOPs
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                            {company.industry}
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
                            Brak firm
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                            Dodaj pierwszą firmę, aby rozpocząć
                        </p>
                        <Button className="bg-gradient-to-r from-blue-500 to-cyan-600">
                            <Plus className="h-4 w-4 mr-2" />
                            Dodaj firmę
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
