'use client';

import { useState, useEffect, useCallback } from 'react';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Plus, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    ROIScoreCell,
    IntensityBadge,
    calculateROIScore
} from './ROIScoreCell';
import { toast } from 'sonner';

// =====================================================
// TYPES
// =====================================================

interface ValueChainRow {
    id: string;
    name: string;
    description: string | null;
    segment: string | null;
    startPoint: string | null;
    endPoint: string | null;
    nodesCount: number;
    // ROI Aggregate fields
    totalTimeIntensity: number | null;
    totalCapitalIntensity: number | null;
    averageComplexity: number | null;
    automationScore: number | null;
    updatedAt: string;
}

interface ValueChainTableProps {
    onSelect?: (id: string) => void;
    onCreateNew?: () => void;
}

// =====================================================
// CONSTANTS
// =====================================================

const SEGMENTS = [
    { value: 'all', label: 'Wszystkie segmenty' },
    { value: 'MSP', label: 'MSP' },
    { value: 'Enterprise', label: 'Enterprise' },
    { value: 'SMB', label: 'SMB' },
    { value: 'B2B', label: 'B2B' },
    { value: 'B2C', label: 'B2C' },
    { value: 'Internal', label: 'Wewnętrzny' },
];

// =====================================================
// COLUMN DEFINITIONS
// =====================================================

const createColumns = (
    onEdit: (id: string, field: string, value: any) => Promise<void>
): ColumnDef<ValueChainRow>[] => [
        {
            id: 'name',
            header: 'Nazwa',
            accessorKey: 'name',
            sortable: true,
            filterable: true,
            editable: true,
            width: '220px',
            cell: (value, row) => (
                <div>
                    <p className="font-medium">{value}</p>
                    {row.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {row.description}
                        </p>
                    )}
                </div>
            ),
        },
        {
            id: 'segment',
            header: 'Segment',
            accessorKey: 'segment',
            sortable: true,
            filterable: true,
            editable: true,
            type: 'select',
            options: SEGMENTS.filter(s => s.value !== 'all'),
            cell: (value) => (
                <Badge variant="outline">{value || '—'}</Badge>
            ),
        },
        {
            id: 'flow',
            header: 'Przepływ',
            accessorKey: (row) => `${row.startPoint || '?'} → ${row.endPoint || '?'}`,
            sortable: false,
            filterable: false,
            editable: false,
            cell: (value, row) => (
                <div className="text-sm text-muted-foreground">
                    <span className="truncate max-w-[80px]" title={row.startPoint || ''}>
                        {row.startPoint || '?'}
                    </span>
                    <span className="mx-1">→</span>
                    <span className="truncate max-w-[80px]" title={row.endPoint || ''}>
                        {row.endPoint || '?'}
                    </span>
                </div>
            ),
        },
        {
            id: 'nodesCount',
            header: 'Węzły',
            accessorKey: 'nodesCount',
            sortable: true,
            filterable: false,
            editable: false,
            width: '80px',
            cell: (value) => (
                <span className="font-medium text-center block">{value || 0}</span>
            ),
        },
        {
            id: 'timeIntensity',
            header: 'Czas',
            accessorKey: 'totalTimeIntensity',
            sortable: true,
            filterable: false,
            editable: false,
            width: '80px',
            cell: (value, row) => {
                // Average per node
                const avg = row.nodesCount > 0 ? (value || 0) / row.nodesCount : 5;
                return <IntensityBadge value={Math.round(avg)} inverted />;
            },
        },
        {
            id: 'capitalIntensity',
            header: 'Kapitał',
            accessorKey: 'totalCapitalIntensity',
            sortable: true,
            filterable: false,
            editable: false,
            width: '80px',
            cell: (value, row) => {
                const avg = row.nodesCount > 0 ? (value || 0) / row.nodesCount : 5;
                return <IntensityBadge value={Math.round(avg)} inverted />;
            },
        },
        {
            id: 'complexity',
            header: 'Złożoność',
            accessorKey: 'averageComplexity',
            sortable: true,
            filterable: false,
            editable: false,
            width: '80px',
            cell: (value) => <IntensityBadge value={Math.round(value ?? 5)} inverted />,
        },
        {
            id: 'roiScore',
            header: 'ROI',
            accessorKey: (row) => {
                const avgTime = row.nodesCount > 0 ? (row.totalTimeIntensity || 0) / row.nodesCount : 5;
                const avgCapital = row.nodesCount > 0 ? (row.totalCapitalIntensity || 0) / row.nodesCount : 5;
                return calculateROIScore({
                    timeIntensity: avgTime,
                    capitalIntensity: avgCapital,
                    complexity: row.averageComplexity,
                    automationPotential: (row.automationScore || 50) / 10, // Convert % to 0-10
                });
            },
            sortable: true,
            filterable: false,
            editable: false,
            width: '100px',
            cell: (value, row) => {
                const avgTime = row.nodesCount > 0 ? (row.totalTimeIntensity || 0) / row.nodesCount : 5;
                const avgCapital = row.nodesCount > 0 ? (row.totalCapitalIntensity || 0) / row.nodesCount : 5;
                return (
                    <ROIScoreCell
                        metrics={{
                            timeIntensity: avgTime,
                            capitalIntensity: avgCapital,
                            complexity: row.averageComplexity,
                            automationPotential: (row.automationScore || 50) / 10,
                        }}
                        showDetails
                    />
                );
            },
        },
        {
            id: 'updatedAt',
            header: 'Aktualizacja',
            accessorKey: 'updatedAt',
            sortable: true,
            filterable: false,
            editable: false,
            width: '120px',
            cell: (value) => (
                <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(value), {
                        addSuffix: true,
                        locale: pl,
                    })}
                </span>
            ),
        },
    ];

// =====================================================
// MAIN COMPONENT
// =====================================================

export function ValueChainTable({ onSelect, onCreateNew }: ValueChainTableProps) {
    const [chains, setChains] = useState<ValueChainRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [segment, setSegment] = useState('all');

    // Fetch data
    const fetchChains = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (segment !== 'all') params.append('segment', segment);
            if (search) params.append('search', search);

            const res = await fetch(`/api/value-chain/maps?${params}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setChains(data.valueChains || []);
        } catch (error) {
            console.error('Failed to fetch value chains:', error);
            toast.error('Nie udało się pobrać łańcuchów wartości');
        } finally {
            setIsLoading(false);
        }
    }, [search, segment]);

    useEffect(() => {
        const debounce = setTimeout(fetchChains, 300);
        return () => clearTimeout(debounce);
    }, [fetchChains]);

    // Handle inline edit
    const handleEdit = useCallback(async (id: string, field: string, value: any) => {
        try {
            const res = await fetch(`/api/value-chain/maps/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value }),
            });

            if (!res.ok) throw new Error('Failed to update');

            // Optimistic update
            setChains(prev =>
                prev.map(chain =>
                    chain.id === id ? { ...chain, [field]: value } : chain
                )
            );

            toast.success('Zapisano zmiany');
        } catch (error) {
            console.error('Failed to update:', error);
            toast.error('Nie udało się zapisać zmian');
            throw error; // Re-throw to let EditableCell handle rollback
        }
    }, []);

    // Handle row click
    const handleRowClick = useCallback((row: ValueChainRow) => {
        onSelect?.(row.id);
    }, [onSelect]);

    // Handle delete
    const handleDelete = useCallback(async (id: string) => {
        if (!confirm('Czy na pewno chcesz usunąć ten łańcuch wartości?')) return;

        try {
            const res = await fetch(`/api/value-chain/maps/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete');

            setChains(prev => prev.filter(chain => chain.id !== id));
            toast.success('Usunięto łańcuch wartości');
        } catch (error) {
            console.error('Failed to delete:', error);
            toast.error('Nie udało się usunąć');
        }
    }, []);

    const columns = createColumns(handleEdit);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Szukaj łańcucha wartości..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Segment Filter */}
                    <Select value={segment} onValueChange={setSegment}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SEGMENTS.map(seg => (
                                <SelectItem key={seg.value} value={seg.value}>
                                    {seg.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Refresh */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchChains}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                {/* Actions */}
                {onCreateNew && (
                    <Button onClick={onCreateNew}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nowy łańcuch
                    </Button>
                )}
            </div>

            {/* DataTable */}
            <DataTable
                data={chains}
                columns={columns}
                isLoading={isLoading}
                onRowEdit={handleEdit}
                onRowDelete={handleDelete}
                onRowClick={handleRowClick}
                sortable
                filterable
                editable
                showColumnToggle
                showExport
                emptyMessage="Brak łańcuchów wartości"
            />
        </div>
    );
}

export default ValueChainTable;
