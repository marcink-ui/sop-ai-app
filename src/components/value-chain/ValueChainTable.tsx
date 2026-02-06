'use client';

import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Play,
    ArrowRight,
    Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import Link from 'next/link';

interface ValueChainRow {
    id: string;
    name: string;
    description: string | null;
    segment: string;
    startPoint: string;
    endPoint: string;
    stagesCount: number;
    nodesCount: number;
    automationRate: number;
    updatedAt: string;
}

interface ValueChainTableProps {
    onSelect?: (id: string) => void;
}

const SEGMENTS = [
    { value: 'all', label: 'Wszystkie segmenty' },
    { value: 'MSP', label: 'MSP' },
    { value: 'Enterprise', label: 'Enterprise' },
    { value: 'SMB', label: 'SMB' },
    { value: 'B2B', label: 'B2B' },
    { value: 'B2C', label: 'B2C' },
];

export function ValueChainTable({ onSelect }: ValueChainTableProps) {
    const [chains, setChains] = useState<ValueChainRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [segment, setSegment] = useState('all');

    useEffect(() => {
        const fetchChains = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (segment !== 'all') params.append('segment', segment);
                if (search) params.append('search', search);

                const res = await fetch(`/api/value-chain/maps?${params}`);
                const data = await res.json();
                setChains(data.valueChains || []);
            } catch (error) {
                console.error('Failed to fetch value chains:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const debounce = setTimeout(fetchChains, 300);
        return () => clearTimeout(debounce);
    }, [search, segment]);

    const getAutomationBadge = (rate: number) => {
        if (rate >= 70) return <Badge className="bg-emerald-500/20 text-emerald-600">{rate}%</Badge>;
        if (rate >= 40) return <Badge className="bg-amber-500/20 text-amber-600">{rate}%</Badge>;
        return <Badge className="bg-gray-500/20 text-gray-600">{rate}%</Badge>;
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj łańcucha wartości..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
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
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[250px]">Nazwa</TableHead>
                            <TableHead>Segment</TableHead>
                            <TableHead>Start → End</TableHead>
                            <TableHead className="text-center">Etapy</TableHead>
                            <TableHead className="text-center">Automatyzacja</TableHead>
                            <TableHead>Aktualizacja</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : chains.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    Brak łańcuchów wartości
                                </TableCell>
                            </TableRow>
                        ) : (
                            chains.map((chain) => (
                                <TableRow
                                    key={chain.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => onSelect?.(chain.id)}
                                >
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{chain.name}</p>
                                            {chain.description && (
                                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                    {chain.description}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{chain.segment}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm">
                                            <span className="text-muted-foreground truncate max-w-[80px]" title={chain.startPoint}>
                                                {chain.startPoint}
                                            </span>
                                            <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                            <span className="text-muted-foreground truncate max-w-[80px]" title={chain.endPoint}>
                                                {chain.endPoint}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="font-medium">{chain.stagesCount}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {getAutomationBadge(chain.automationRate)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {formatDistanceToNow(new Date(chain.updatedAt), {
                                            addSuffix: true,
                                            locale: pl,
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Podgląd
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                                    <Play className="h-4 w-4 mr-2" />
                                                    Symulacja
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edytuj
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Usuń
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer */}
            {chains.length > 0 && (
                <div className="text-sm text-muted-foreground">
                    Pokazuję {chains.length} łańcuchów wartości
                </div>
            )}
        </div>
    );
}
