'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
    Play
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

export default function SOPsPage() {
    const [sops, setSops] = useState<SOP[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<'date' | 'name'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        loadSops();
    }, []);

    const loadSops = () => {
        const allSops = sopDb.getAll();
        setSops(allSops);
    };

    const deleteSop = (id: string) => {
        if (confirm('Are you sure you want to delete this SOP?')) {
            sopDb.delete(id);
            loadSops();
        }
    };

    const filteredSops = sops
        .filter((sop) => {
            const matchesSearch =
                sop.meta.process_name.toLowerCase().includes(search.toLowerCase()) ||
                sop.meta.department.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'all' || sop.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortField === 'date') {
                const dateA = new Date(a.meta.created_date).getTime();
                const dateB = new Date(b.meta.created_date).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else {
                return sortOrder === 'asc'
                    ? a.meta.process_name.localeCompare(b.meta.process_name)
                    : b.meta.process_name.localeCompare(a.meta.process_name);
            }
        });

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'draft', label: 'Draft' },
        { value: 'generated', label: 'Generated' },
        { value: 'audited', label: 'Audited' },
        { value: 'architected', label: 'Architected' },
        { value: 'prompt-generated', label: 'Prompt Generated' },
        { value: 'completed', label: 'Completed' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/20 p-2">
                        <FileText className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">SOPs</h1>
                        <p className="text-sm text-muted-foreground">{sops.length} total records</p>
                    </div>
                </div>
                <Link href="/sops/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        New SOP
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search SOPs..."
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
                    {sortOrder === 'asc' ? 'Oldest' : 'Newest'}
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-card">
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Title
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Department
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Role
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Version
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Date
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSops.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                    <FileText className="mx-auto mb-3 h-12 w-12 opacity-20" />
                                    <p>No SOPs found</p>
                                    <Link href="/sops/new" className="mt-2 inline-block text-blue-400 hover:underline">
                                        Create your first SOP
                                    </Link>
                                </td>
                            </tr>
                        ) : (
                            filteredSops.map((sop) => (
                                <tr
                                    key={sop.id}
                                    className="border-b border-border transition-colors hover:bg-muted/30 last:border-0"
                                >
                                    <td className="px-4 py-4">
                                        <span className="font-medium text-foreground">{sop.meta.process_name}</span>
                                    </td>
                                    <td className="px-4 py-4 text-muted-foreground">{sop.meta.department}</td>
                                    <td className="px-4 py-4 text-muted-foreground">{sop.meta.role}</td>
                                    <td className="px-4 py-4">
                                        <StatusBadge status={sop.status} />
                                    </td>
                                    <td className="px-4 py-4 text-muted-foreground">{sop.meta.version}</td>
                                    <td className="px-4 py-4 text-muted-foreground">
                                        {new Date(sop.meta.created_date).toLocaleDateString('pl-PL')}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-popover border-border">
                                                <DropdownMenuItem className="text-popover-foreground">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-popover-foreground">
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-popover-foreground">
                                                    <Play className="mr-2 h-4 w-4" />
                                                    Continue Pipeline
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-400"
                                                    onClick={() => deleteSop(sop.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
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
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        draft: 'bg-neutral-800 text-neutral-400',
        generated: 'bg-blue-500/20 text-blue-400',
        audited: 'bg-orange-500/20 text-orange-400',
        architected: 'bg-cyan-500/20 text-cyan-400',
        'prompt-generated': 'bg-purple-500/20 text-purple-400',
        completed: 'bg-green-500/20 text-green-400',
    };

    return (
        <Badge className={styles[status] || styles.draft}>
            {status}
        </Badge>
    );
}
