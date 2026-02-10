'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    Filter,
    MoreHorizontal,
    Trash2,
    Eye,
    Clock,
    TrendingUp
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
import { mudaDb, sopDb } from '@/lib/db';
import type { MudaReport, SOP } from '@/lib/types';

const mudaTypes = [
    { value: 'transport', label: 'Transport', color: 'bg-red-500/20 text-red-400' },
    { value: 'inventory', label: 'Inventory', color: 'bg-orange-500/20 text-orange-400' },
    { value: 'motion', label: 'Motion', color: 'bg-yellow-500/20 text-yellow-400' },
    { value: 'waiting', label: 'Waiting', color: 'bg-green-500/20 text-green-400' },
    { value: 'overproduction', label: 'Overproduction', color: 'bg-cyan-500/20 text-cyan-400' },
    { value: 'overprocessing', label: 'Overprocessing', color: 'bg-purple-500/20 text-purple-400' },
    { value: 'defects', label: 'Defects', color: 'bg-pink-500/20 text-pink-400' },
];

export default function MUDAPage() {
    const router = useRouter();
    const [reports, setReports] = useState<MudaReport[]>([]);
    const [sops, setSops] = useState<SOP[]>([]);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    useEffect(() => {
        setReports(mudaDb.getAll());
        setSops(sopDb.getAll());
    }, []);

    const getSopName = (sopId: string) => {
        const sop = sops.find(s => s.id === sopId);
        return sop?.meta.process_name || 'Unknown';
    };

    const filteredReports = reports.filter((report) => {
        const matchesSearch = getSopName(report.sop_id).toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || report.waste_identified.some(w => w.muda_type.toLowerCase() === typeFilter);
        return matchesSearch && matchesType;
    });

    const totalSavings = reports.reduce((acc, r) => acc + (r.summary?.total_potential_saving_min || 0) / 60, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-500/20 p-2">
                        <Search className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">MUDA Reports</h1>
                        <p className="text-sm text-muted-foreground">{reports.length} waste analyses</p>
                    </div>
                </div>

                {/* Savings Summary */}
                <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2">
                    <Clock className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-semibold">{totalSavings}h</span>
                    <span className="text-muted-foreground">/month potential savings</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by SOP..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card border-border"
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-44 bg-card border-border">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Waste Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {mudaTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Waste Type Legend */}
            <div className="flex flex-wrap gap-2">
                {mudaTypes.map((type) => (
                    <Badge key={type.value} className={type.color}>
                        {type.label}
                    </Badge>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-card">
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                SOP
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Waste Types
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Issues Found
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Time Savings
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Automation Potential
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReports.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                    <Search className="mx-auto mb-3 h-12 w-12 opacity-20" />
                                    <p>No MUDA reports found</p>
                                    <p className="mt-2 text-sm">Analyze SOPs to identify waste</p>
                                </td>
                            </tr>
                        ) : (
                            filteredReports.map((report) => (
                                <tr
                                    key={report.id}
                                    className="border-b border-border transition-colors hover:bg-muted/30 last:border-0 cursor-pointer"
                                    onClick={() => router.push(`/muda/${report.id}`)}
                                >
                                    <td className="px-4 py-4">
                                        <span className="font-medium text-foreground">{getSopName(report.sop_id)}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {[...new Set(report.waste_identified.map(w => w.muda_type))].map((type) => {
                                                const typeInfo = mudaTypes.find(t => t.value === type.toLowerCase());
                                                return (
                                                    <Badge key={type} className={typeInfo?.color || ''}>
                                                        {typeInfo?.label || type}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-muted-foreground">
                                        {report.waste_identified.length} issues
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-green-400" />
                                            <span className="text-green-400">
                                                {Math.round((report.summary?.total_potential_saving_min || 0) / 60)}h/month
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-24 rounded-full bg-muted">
                                                <div
                                                    className="h-2 rounded-full bg-blue-500"
                                                    style={{ width: `${report.summary?.automation_score === 'high' ? 80 : report.summary?.automation_score === 'medium' ? 50 : 20}%` }}
                                                />
                                            </div>
                                            <span className="text-muted-foreground text-sm">
                                                {report.summary?.automation_score || 'low'}
                                            </span>
                                        </div>
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
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-popover-foreground">
                                                    <TrendingUp className="mr-2 h-4 w-4" />
                                                    View Kaizen
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-400">
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
