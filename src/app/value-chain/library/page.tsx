'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
    Plus,
    Search,
    MoreHorizontal,
    Eye,
    Copy,
    Trash2,
    Edit,
    ArrowLeft,
    GitBranch,
    Filter,
    Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface ValueChain {
    id: string;
    name: string;
    segment: string;
    product: string;
    startPoint: string;
    endPoint: string;
    status: 'draft' | 'active' | 'archived';
    processCount: number;
    createdAt: string;
    updatedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
    active: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
    archived: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400',
};

export default function ValueChainLibraryPage() {
    const router = useRouter();
    const [chains, setChains] = useState<ValueChain[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [segmentFilter, setSegmentFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const fetchChains = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (segmentFilter !== 'all') params.set('segment', segmentFilter);
            if (searchQuery) params.set('search', searchQuery);
            const res = await fetch(`/api/value-chain/maps?${params}`);
            if (res.ok) {
                const data = await res.json();
                const mapped: ValueChain[] = (data.valueChains || []).map((vc: Record<string, unknown>) => ({
                    id: vc.id,
                    name: vc.name || 'Unnamed',
                    segment: (vc.segment as string) || '—',
                    product: (vc.description as string) || '—',
                    startPoint: (vc.startPoint as string) || '—',
                    endPoint: (vc.endPoint as string) || '—',
                    status: 'active' as const,
                    processCount: (vc.stagesCount as number) || (vc.nodesCount as number) || 0,
                    createdAt: vc.updatedAt ? new Date(vc.updatedAt as string).toLocaleDateString('pl-PL') : '—',
                    updatedAt: vc.updatedAt ? new Date(vc.updatedAt as string).toLocaleDateString('pl-PL') : '—',
                }));
                setChains(mapped);
            }
        } catch (err) {
            console.error('Error fetching value chains:', err);
        } finally {
            setLoading(false);
        }
    }, [segmentFilter, searchQuery]);

    useEffect(() => { fetchChains(); }, [fetchChains]);

    // Filter chains
    const filteredChains = chains.filter(chain => {
        const matchesSearch = chain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chain.product.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSegment = segmentFilter === 'all' || chain.segment === segmentFilter;
        const matchesStatus = statusFilter === 'all' || chain.status === statusFilter;
        return matchesSearch && matchesSegment && matchesStatus;
    });

    // Get unique segments for filter
    const segments = [...new Set(chains.map(c => c.segment))];

    const handleView = (id: string) => {
        router.push(`/value-chain?id=${id}`);
    };

    const handleClone = (chain: ValueChain) => {
        const newChain: ValueChain = {
            ...chain,
            id: `${Date.now()}`,
            name: `${chain.name} (Copy)`,
            status: 'draft',
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
        };
        setChains([newChain, ...chains]);
    };

    const handleDelete = (id: string) => {
        setChains(chains.filter(c => c.id !== id));
    };

    return loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        </div>
    ) : (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/value-chain">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <GitBranch className="h-6 w-6 text-cyan-500" />
                            Biblioteka Łańcuchów Wartości
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Zarządzaj wszystkimi łańcuchami wartości swojej organizacji
                        </p>
                    </div>
                </div>
                <Button onClick={() => router.push('/value-chain/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nowy Łańcuch
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj po nazwie lub produkcie..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Segment" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Wszystkie segmenty</SelectItem>
                            {segments.map(segment => (
                                <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Wszystkie</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg border bg-card">
                    <div className="text-2xl font-bold">{chains.length}</div>
                    <div className="text-sm text-muted-foreground">Łańcuchów Łącznie</div>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                    <div className="text-2xl font-bold text-green-600">
                        {chains.filter(c => c.status === 'active').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Aktywnych</div>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                    <div className="text-2xl font-bold text-yellow-600">
                        {chains.filter(c => c.status === 'draft').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Wersji Roboczych</div>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                    <div className="text-2xl font-bold">
                        {chains.reduce((sum, c) => sum + c.processCount, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Procesów Łącznie</div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nazwa</TableHead>
                            <TableHead>Segment</TableHead>
                            <TableHead>Produkt</TableHead>
                            <TableHead>Start Point</TableHead>
                            <TableHead>End Point</TableHead>
                            <TableHead>Procesów</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[60px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredChains.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    Nie znaleziono łańcuchów wartości
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredChains.map((chain) => (
                                <TableRow key={chain.id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <GitBranch className="h-4 w-4 text-cyan-500" />
                                            {chain.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{chain.segment}</Badge>
                                    </TableCell>
                                    <TableCell>{chain.product}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{chain.startPoint}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{chain.endPoint}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{chain.processCount}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={STATUS_COLORS[chain.status]}>
                                            {chain.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleView(chain.id)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Otwórz
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleView(chain.id)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edytuj
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleClone(chain)}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Klonuj
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(chain.id)}
                                                    className="text-red-600"
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

            {/* Info */}
            <div className="mt-6 p-4 rounded-lg border bg-muted/50">
                <h3 className="font-semibold mb-2">💡 Jak używać</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Start Point</strong> - od którego procesu zaczyna się analiza</li>
                    <li>• <strong>End Point</strong> - do którego procesu końcowego przechodzimy</li>
                    <li>• Użyj <strong>Klonuj</strong> aby stworzyć wariant istniejącego łańcucha</li>
                    <li>• Łańcuchy można grupować po <strong>segmentach</strong> klientów i <strong>produktach</strong></li>
                </ul>
            </div>
        </div>
    );
}
