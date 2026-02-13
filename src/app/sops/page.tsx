'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    FileText,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Trash2,
    Edit,
    Eye,
    ArrowUpDown,
    Play,
    Loader2,
    Database,
    HardDrive,
    Building2,
    User,
    Calendar,
    GitBranch
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { sopDb } from '@/lib/db';
import type { SOP } from '@/lib/types';
import { DetailSheet, type DetailField } from '@/components/ui/detail-sheet';

// Combined SOP type (can come from API or localStorage)
interface DisplaySOP {
    id: string;
    title: string;
    code?: string;
    department: string;
    role?: string;
    status: string;
    version: string;
    date: string;
    source: 'prisma' | 'local';
}

export default function SOPsPage() {
    const router = useRouter();
    const [sops, setSops] = useState<DisplaySOP[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dataSource, setDataSource] = useState<'prisma' | 'local' | 'mixed'>('local');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<'date' | 'name'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedSop, setSelectedSop] = useState<DisplaySOP | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const openSheet = (sop: DisplaySOP) => {
        setSelectedSop(sop);
        setSheetOpen(true);
    };

    useEffect(() => {
        loadSops();
    }, []);

    const loadSops = async () => {
        setIsLoading(true);
        const displaySops: DisplaySOP[] = [];

        // Try to fetch from Prisma API first
        try {
            const response = await fetch('/api/sops');
            if (response.ok) {
                const data = await response.json();
                if (data.sops && data.sops.length > 0) {
                    data.sops.forEach((sop: Record<string, unknown>) => {
                        displaySops.push({
                            id: sop.id as string,
                            title: sop.title as string,
                            code: sop.code as string,
                            department: (sop.department as Record<string, unknown>)?.name as string || 'N/A',
                            role: sop.owner as string,
                            status: String(sop.status || 'DRAFT').toLowerCase(),
                            version: `v${sop.version || 1}`,
                            date: new Date(sop.updatedAt as string).toLocaleDateString(),
                            source: 'prisma',
                        });
                    });
                    setDataSource('prisma');
                }
            }
        } catch {
            // API not available, falling back to localStorage
        }

        // Also load from localStorage for backward compatibility
        const localSops = sopDb.getAll();
        if (localSops.length > 0) {
            localSops.forEach((sop: SOP) => {
                // Skip if already loaded from Prisma (by checking title/code match)
                const alreadyExists = displaySops.some(
                    (ds) => ds.title === sop.meta.process_name
                );
                if (!alreadyExists) {
                    displaySops.push({
                        id: sop.id,
                        title: sop.meta.process_name,
                        department: sop.meta.department,
                        role: sop.meta.role,
                        status: sop.status,
                        version: sop.meta.version,
                        date: sop.meta.updated_date || sop.meta.created_date,
                        source: 'local',
                    });
                }
            });
            if (displaySops.some(s => s.source === 'prisma') && displaySops.some(s => s.source === 'local')) {
                setDataSource('mixed');
            } else if (displaySops.every(s => s.source === 'local')) {
                setDataSource('local');
            }
        }

        setSops(displaySops);
        setIsLoading(false);
    };

    const deleteSop = async (id: string, source: 'prisma' | 'local') => {
        if (confirm('Czy na pewno chcesz usunąć ten SOP?')) {
            if (source === 'prisma') {
                try {
                    await fetch(`/api/sops/${id}`, { method: 'DELETE' });
                } catch {
                    console.error('Failed to delete from API');
                }
            } else {
                sopDb.delete(id);
            }
            loadSops();
        }
    };

    const filteredSops = sops
        .filter((sop) => {
            const matchesSearch =
                sop.title.toLowerCase().includes(search.toLowerCase()) ||
                sop.department.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'all' || sop.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortField === 'date') {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else {
                return sortOrder === 'asc'
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            }
        });

    const statusOptions = [
        { value: 'all', label: 'Wszystkie statusy' },
        { value: 'draft', label: 'Wersja robocza' },
        { value: 'generated', label: 'Wygenerowany' },
        { value: 'audited', label: 'Audytowany' },
        { value: 'architected', label: 'Zaprojektowany' },
        { value: 'prompt-generated', label: 'Prompt wygenerowany' },
        { value: 'completed', label: 'Ukończony' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                        className="flex h-12 w-12 items-center justify-center theme-accent-icon shadow-lg"
                    >
                        <FileText className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Baza SOP</h1>
                        <p className="text-sm text-muted-foreground">{sops.length} procedur łącznie</p>
                    </div>
                </div>
                <Link href="/sops/process">
                    <Button className="btn-primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Nowy SOP
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj procedur..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card border-border"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 bg-card border-border">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="border-border"
                >
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    {sortOrder === 'asc' ? 'Najstarsze' : 'Najnowsze'}
                </Button>
            </div>

            {/* Table */}
            <div className="theme-card overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-card">
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Tytuł
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Dział
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Rola
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Wersja
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Data
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Akcje
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSops.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                    <FileText className="mx-auto mb-3 h-12 w-12 opacity-20" />
                                    <p>Brak procedur</p>
                                    <Link href="/sops/new" className="mt-2 inline-block hover:underline" style={{ color: 'var(--accent)' }}>
                                        Utwórz pierwszą procedurę
                                    </Link>
                                </td>
                            </tr>
                        ) : (
                            filteredSops.map((sop) => (
                                <tr
                                    key={sop.id}
                                    className="border-b border-border transition-colors hover:bg-muted/50 last:border-0 cursor-pointer"
                                    onClick={() => router.push(`/sops/${sop.id}`)}
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-foreground">{sop.title}</span>
                                            {sop.source === 'local' && (
                                                <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                                                    <HardDrive className="mr-1 h-3 w-3" />
                                                    Local
                                                </Badge>
                                            )}
                                            {sop.source === 'prisma' && (
                                                <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                                                    <Database className="mr-1 h-3 w-3" />
                                                    DB
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-muted-foreground">{sop.department}</td>
                                    <td className="px-4 py-4 text-muted-foreground">{sop.role || '-'}</td>
                                    <td className="px-4 py-4">
                                        <StatusBadge status={sop.status} />
                                    </td>
                                    <td className="px-4 py-4 text-muted-foreground">{sop.version}</td>
                                    <td className="px-4 py-4 text-muted-foreground">
                                        {sop.date}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-popover border-border">
                                                <DropdownMenuItem
                                                    className="text-popover-foreground cursor-pointer"
                                                    onClick={() => router.push(`/sops/${sop.id}`)}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Podgląd
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-popover-foreground cursor-pointer"
                                                    onClick={() => router.push(`/sops/${sop.id}/edit`)}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edytuj
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-popover-foreground cursor-pointer"
                                                    onClick={() => router.push(`/sops/${sop.id}/pipeline`)}
                                                >
                                                    <Play className="mr-2 h-4 w-4" />
                                                    Kontynuuj pipeline
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-400"
                                                    onClick={() => deleteSop(sop.id, sop.source)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Usuń
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Sheet */}
            <DetailSheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                title={selectedSop?.title || ''}
                subtitle={selectedSop?.code || selectedSop?.id}
                icon={<FileText className="h-5 w-5 text-white" />}
                iconColor="bg-blue-500"
                fields={selectedSop ? [
                    {
                        label: 'Dział',
                        value: selectedSop.department,
                        icon: Building2,
                        type: 'text',
                        editable: true,
                    },
                    {
                        label: 'Rola',
                        value: selectedSop.role || 'Nie przypisano',
                        icon: User,
                        type: 'text',
                        editable: true,
                    },
                    {
                        label: 'Status',
                        value: selectedSop.status,
                        icon: GitBranch,
                        type: 'badge',
                    },
                    {
                        label: 'Wersja',
                        value: selectedSop.version,
                        icon: GitBranch,
                        type: 'text',
                    },
                    {
                        label: 'Data modyfikacji',
                        value: selectedSop.date,
                        icon: Calendar,
                        type: 'date',
                    },
                    {
                        label: 'Źródło danych',
                        value: selectedSop.source === 'prisma' ? 'Baza danych' : 'Lokalne',
                        icon: Database,
                        type: 'badge',
                    },
                ] as DetailField[] : []}
                onEdit={() => {
                    setSheetOpen(false);
                    router.push(`/sops/${selectedSop?.id}/edit`);
                }}
                onViewFull={() => {
                    setSheetOpen(false);
                    router.push(`/sops/${selectedSop?.id}`);
                }}
            />
        </motion.div>
    );
}

const statusLabels: Record<string, string> = {
    draft: 'Wersja robocza',
    generated: 'Wygenerowany',
    audited: 'Audytowany',
    architected: 'Zaprojektowany',
    'prompt-generated': 'Prompt wygenerowany',
    completed: 'Ukończony',
    active: 'Aktywny',
    approved: 'Zatwierdzony',
    review: 'Do przeglądu',
    pending: 'Oczekujący',
};

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        draft: 'bg-muted text-muted-foreground',
        generated: 'bg-blue-500/20 text-blue-400',
        audited: 'bg-orange-500/20 text-orange-400',
        architected: 'bg-cyan-500/20 text-cyan-400',
        'prompt-generated': 'bg-purple-500/20 text-purple-400',
        completed: 'bg-green-500/20 text-green-400',
        active: 'bg-green-500/20 text-green-400',
        approved: 'bg-emerald-500/20 text-emerald-400',
        review: 'bg-purple-500/20 text-purple-400',
        pending: 'bg-amber-500/20 text-amber-400',
    };

    return (
        <Badge className={styles[status] || styles.draft}>
            {statusLabels[status] || status}
        </Badge>
    );
}
