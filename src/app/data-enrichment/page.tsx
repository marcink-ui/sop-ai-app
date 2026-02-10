'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Database,
    Sparkles,
    Search,
    Building2,
    Users,
    Globe,
    Mail,
    Phone,
    MapPin,
    Linkedin,
    ChevronRight,
    RefreshCw,
    Check,
    Clock,
    AlertCircle,
    Filter,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Company {
    id: string;
    name: string;
    domain?: string;
    employees?: number;
    industry?: string;
    location?: string;
    linkedin?: string;
    enrichmentStatus: 'pending' | 'enriched' | 'failed' | 'partial';
    enrichedAt?: string;
    contacts?: number;
}

const mockCompanies: Company[] = [
    {
        id: '1',
        name: 'Kordia Legal',
        domain: 'kordialegal.pl',
        employees: 15,
        industry: 'Legal Services',
        location: 'Warszawa',
        linkedin: 'kordia-legal',
        enrichmentStatus: 'enriched',
        enrichedAt: '2026-02-07',
        contacts: 3,
    },
    {
        id: '2',
        name: 'Ciarko',
        domain: 'ciarko.pl',
        employees: 150,
        industry: 'Manufacturing',
        location: 'Sanok',
        enrichmentStatus: 'enriched',
        enrichedAt: '2026-02-06',
        contacts: 5,
    },
    {
        id: '3',
        name: 'DrabPol',
        domain: 'drabpol.pl',
        industry: 'Distribution',
        enrichmentStatus: 'pending',
    },
    {
        id: '4',
        name: 'Multisavemoney',
        domain: 'multisavemoney.pl',
        enrichmentStatus: 'partial',
        enrichedAt: '2026-02-01',
        contacts: 1,
    },
];

const statusConfig = {
    pending: { label: 'Oczekuje', color: 'bg-amber-500', icon: Clock },
    enriched: { label: 'Wzbogacony', color: 'bg-green-500', icon: Check },
    failed: { label: 'Błąd', color: 'bg-red-500', icon: AlertCircle },
    partial: { label: 'Częściowy', color: 'bg-blue-500', icon: RefreshCw },
};

export default function DataEnrichmentPage() {
    const { data: session, isPending } = useSession();
    const [companies, setCompanies] = useState<Company[]>(mockCompanies);
    const [search, setSearch] = useState('');
    const [enriching, setEnriching] = useState<string | null>(null);

    if (isPending) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!session) {
        redirect('/');
    }

    const enrichCompany = async (id: string) => {
        setEnriching(id);
        // Simulate enrichment
        await new Promise(resolve => setTimeout(resolve, 2000));
        setCompanies(companies.map(c =>
            c.id === id
                ? { ...c, enrichmentStatus: 'enriched' as const, enrichedAt: new Date().toISOString().split('T')[0] }
                : c
        ));
        setEnriching(null);
        toast.success('Dane wzbogacone');
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.domain?.toLowerCase().includes(search.toLowerCase())
    );

    const enrichedCount = companies.filter(c => c.enrichmentStatus === 'enriched').length;
    const enrichmentProgress = (enrichedCount / companies.length) * 100;

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <Database className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Data Enrichment</h1>
                        <p className="text-sm text-muted-foreground">
                            Wzbogacanie danych firm i kontaktów
                        </p>
                    </div>
                </div>
                <Button className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Wzbogać wszystkie
                </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="grid gap-4 md:grid-cols-4"
            >
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{companies.length}</p>
                                <p className="text-xs text-muted-foreground">Firm</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <Check className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{enrichedCount}</p>
                                <p className="text-xs text-muted-foreground">Wzbogaconych</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {companies.reduce((sum, c) => sum + (c.contacts || 0), 0)}
                                </p>
                                <p className="text-xs text-muted-foreground">Kontaktów</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Postęp wzbogacania</span>
                                <span className="font-medium">{Math.round(enrichmentProgress)}%</span>
                            </div>
                            <Progress value={enrichmentProgress} className="h-2" />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4"
            >
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Szukaj firm..."
                        className="pl-9"
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filtry
                </Button>
            </motion.div>

            {/* Companies List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
            >
                {filteredCompanies.map((company, index) => {
                    const StatusIcon = statusConfig[company.enrichmentStatus].icon;
                    return (
                        <motion.div
                            key={company.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * index }}
                        >
                            <Card className="hover:shadow-md transition-all">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-lg font-bold">
                                                {company.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{company.name}</span>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "text-[10px] gap-1",
                                                            statusConfig[company.enrichmentStatus].color.replace('bg-', 'border-')
                                                        )}
                                                    >
                                                        <StatusIcon className="h-3 w-3" />
                                                        {statusConfig[company.enrichmentStatus].label}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                    {company.domain && (
                                                        <span className="flex items-center gap-1">
                                                            <Globe className="h-3 w-3" />
                                                            {company.domain}
                                                        </span>
                                                    )}
                                                    {company.industry && (
                                                        <span>{company.industry}</span>
                                                    )}
                                                    {company.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {company.location}
                                                        </span>
                                                    )}
                                                    {company.employees && (
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            {company.employees} osób
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {company.contacts && company.contacts > 0 && (
                                                <Badge variant="secondary" className="gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {company.contacts}
                                                </Badge>
                                            )}
                                            {company.linkedin && (
                                                <Button variant="ghost" size="icon" asChild>
                                                    <a href={`https://linkedin.com/company/${company.linkedin}`} target="_blank">
                                                        <Linkedin className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => enrichCompany(company.id)}
                                                disabled={enriching === company.id}
                                            >
                                                {enriching === company.id ? (
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Sparkles className="h-4 w-4" />
                                                )}
                                                Wzbogać
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
