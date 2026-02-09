'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FolderKanban,
    Search,
    Filter,
    Plus,
    Download,
    Copy,
    MessageSquare,
    Edit3,
    Trash2,
    LayoutGrid,
    List,
    ChevronDown,
    ArrowUpDown,
    Users,
    Calendar,
    ClipboardList,
    Target,
    MoreVertical,
    ExternalLink,
    Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type CanvasType = 'ai' | 'gtm';
type CanvasStatus = 'draft' | 'active' | 'review' | 'approved';

interface CanvasItem {
    id: string;
    name: string;
    type: CanvasType;
    department: string;
    owner: string;
    status: CanvasStatus;
    updatedAt: string;
    widgetCount: number;
    comments: number;
}

// Mock data - will come from database
const mockCanvases: CanvasItem[] = [
    {
        id: '1',
        name: 'AI Canvas — Sprzedaż',
        type: 'ai',
        department: 'Sprzedaż',
        owner: 'Jan Kowalski',
        status: 'active',
        updatedAt: '2026-02-09',
        widgetCount: 8,
        comments: 3,
    },
    {
        id: '2',
        name: 'AI Canvas — Produkcja',
        type: 'ai',
        department: 'Produkcja',
        owner: 'Anna Nowak',
        status: 'review',
        updatedAt: '2026-02-08',
        widgetCount: 6,
        comments: 5,
    },
    {
        id: '3',
        name: 'GTM Canvas — Q1 2026',
        type: 'gtm',
        department: 'Marketing',
        owner: 'Piotr Wiśniewski',
        status: 'approved',
        updatedAt: '2026-02-07',
        widgetCount: 12,
        comments: 8,
    },
    {
        id: '4',
        name: 'AI Canvas — HR',
        type: 'ai',
        department: 'HR',
        owner: 'Maria Kowalczyk',
        status: 'draft',
        updatedAt: '2026-02-06',
        widgetCount: 4,
        comments: 0,
    },
    {
        id: '5',
        name: 'GTM Canvas — Nowy Produkt',
        type: 'gtm',
        department: 'R&D',
        owner: 'Tomasz Zieliński',
        status: 'draft',
        updatedAt: '2026-02-05',
        widgetCount: 3,
        comments: 1,
    },
    {
        id: '6',
        name: 'AI Canvas — Finanse',
        type: 'ai',
        department: 'Finanse',
        owner: 'Katarzyna Wójcik',
        status: 'active',
        updatedAt: '2026-02-04',
        widgetCount: 7,
        comments: 2,
    },
];

const statusConfig: Record<CanvasStatus, { label: string; color: string; bg: string }> = {
    draft: { label: 'Szkic', color: 'text-neutral-600 dark:text-neutral-400', bg: 'bg-neutral-100 dark:bg-neutral-800' },
    active: { label: 'Aktywny', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/20' },
    review: { label: 'Do przeglądu', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/20' },
    approved: { label: 'Zatwierdzony', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/20' },
};

const typeConfig: Record<CanvasType, { label: string; icon: typeof ClipboardList; color: string }> = {
    ai: { label: 'AI Canvas', icon: ClipboardList, color: 'from-blue-500 to-cyan-600' },
    gtm: { label: 'GTM Canvas', icon: Target, color: 'from-violet-500 to-purple-600' },
};

type SortField = 'name' | 'updatedAt' | 'department' | 'status';

export default function BaseCanvasPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterType, setFilterType] = useState<CanvasType | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<CanvasStatus | 'all'>('all');
    const [sortBy, setSortBy] = useState<SortField>('updatedAt');

    const filteredCanvases = mockCanvases
        .filter(c => {
            if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !c.department.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !c.owner.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (filterType !== 'all' && c.type !== filterType) return false;
            if (filterStatus !== 'all' && c.status !== filterStatus) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'updatedAt') return b.updatedAt.localeCompare(a.updatedAt);
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'department') return a.department.localeCompare(b.department);
            if (sortBy === 'status') return a.status.localeCompare(b.status);
            return 0;
        });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <FolderKanban className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Baza Canvas</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Wszystkie canvasy organizacji — weryfikuj, zarządzaj, deleguj
                        </p>
                    </div>
                </div>
                <Button size="sm" className="gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white">
                    <Plus className="h-4 w-4" />
                    Nowy Canvas
                </Button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                        placeholder="Szukaj po nazwie, dziale, właścicielu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Type Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Typ: {filterType === 'all' ? 'Wszystkie' : typeConfig[filterType].label}
                            <ChevronDown className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setFilterType('all')}>Wszystkie</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterType('ai')}>AI Canvas</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterType('gtm')}>GTM Canvas</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Status Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Status: {filterStatus === 'all' ? 'Wszystkie' : statusConfig[filterStatus].label}
                            <ChevronDown className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setFilterStatus('all')}>Wszystkie</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {(Object.keys(statusConfig) as CanvasStatus[]).map(s => (
                            <DropdownMenuItem key={s} onClick={() => setFilterStatus(s)}>
                                {statusConfig[s].label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Sort */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <ArrowUpDown className="h-4 w-4" />
                            Sortuj
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setSortBy('updatedAt')}>Data aktualizacji</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy('name')}>Nazwa</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy('department')}>Dział</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy('status')}>Status</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* View Toggle */}
                <div className="flex items-center border rounded-lg overflow-hidden ml-auto">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-r-none"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-l-none"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                <span>{filteredCanvases.length} z {mockCanvases.length} canvasów</span>
                <span>•</span>
                <span>{mockCanvases.filter(c => c.type === 'ai').length} AI</span>
                <span>{mockCanvases.filter(c => c.type === 'gtm').length} GTM</span>
                <span>•</span>
                <span>{mockCanvases.filter(c => c.status === 'review').length} do przeglądu</span>
            </div>

            {/* Canvas Grid/List */}
            <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {filteredCanvases.map((canvas, index) => {
                            const typeInfo = typeConfig[canvas.type];
                            const statusInfo = statusConfig[canvas.status];
                            const TypeIcon = typeInfo.icon;

                            return (
                                <motion.div
                                    key={canvas.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                >
                                    <Card className="group hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 bg-white dark:bg-neutral-900/80">
                                        <CardContent className="p-4 space-y-3">
                                            {/* Top Row */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-lg flex items-center justify-center",
                                                        `bg-gradient-to-br ${typeInfo.color}`
                                                    )}>
                                                        <TypeIcon className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-neutral-900 dark:text-white text-sm leading-tight">
                                                            {canvas.name}
                                                        </p>
                                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                            {canvas.department}
                                                        </p>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem className="gap-2"><ExternalLink className="h-3 w-3" /> Otwórz</DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2"><Edit3 className="h-3 w-3" /> Edytuj</DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2"><Copy className="h-3 w-3" /> Duplikuj</DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2"><Download className="h-3 w-3" /> Pobierz</DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2"><Send className="h-3 w-3" /> Deleguj</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="gap-2 text-red-600"><Trash2 className="h-3 w-3" /> Usuń</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            {/* Meta Row */}
                                            <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {canvas.owner}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {canvas.updatedAt}
                                                </span>
                                            </div>

                                            {/* Bottom Row */}
                                            <div className="flex items-center justify-between">
                                                <Badge className={cn("text-[10px]", statusInfo.color, statusInfo.bg)}>
                                                    {statusInfo.label}
                                                </Badge>
                                                <div className="flex items-center gap-3 text-xs text-neutral-400">
                                                    <span>{canvas.widgetCount} widgetów</span>
                                                    {canvas.comments > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare className="h-3 w-3" />
                                                            {canvas.comments}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-1"
                    >
                        {/* List Header */}
                        <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                            <div className="col-span-4">Nazwa</div>
                            <div className="col-span-2">Dział</div>
                            <div className="col-span-2">Właściciel</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-1">Data</div>
                            <div className="col-span-2 text-right">Akcje</div>
                        </div>
                        {filteredCanvases.map((canvas, index) => {
                            const statusInfo = statusConfig[canvas.status];
                            return (
                                <motion.div
                                    key={canvas.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <Card className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <CardContent className="p-3">
                                            <div className="grid grid-cols-12 gap-3 items-center">
                                                <div className="col-span-4 flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px]">
                                                        {canvas.type === 'ai' ? 'AI' : 'GTM'}
                                                    </Badge>
                                                    <span className="font-medium text-sm text-neutral-900 dark:text-white truncate">
                                                        {canvas.name}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 text-sm text-neutral-600 dark:text-neutral-400">{canvas.department}</div>
                                                <div className="col-span-2 text-sm text-neutral-600 dark:text-neutral-400">{canvas.owner}</div>
                                                <div className="col-span-1">
                                                    <Badge className={cn("text-[10px]", statusInfo.color, statusInfo.bg)}>
                                                        {statusInfo.label}
                                                    </Badge>
                                                </div>
                                                <div className="col-span-1 text-xs text-neutral-400">{canvas.updatedAt}</div>
                                                <div className="col-span-2 flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><ExternalLink className="h-3 w-3" /></Button>
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Edit3 className="h-3 w-3" /></Button>
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Copy className="h-3 w-3" /></Button>
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Download className="h-3 w-3" /></Button>
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Send className="h-3 w-3" /></Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {filteredCanvases.length === 0 && (
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                    <FolderKanban className="h-12 w-12 mx-auto text-neutral-400 dark:text-neutral-600 mb-4" />
                    <h3 className="font-medium text-neutral-900 dark:text-white mb-2">Brak canvasów</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                        Nie znaleziono canvasów pasujących do filtrów
                    </p>
                    <Button variant="outline" onClick={() => { setSearchQuery(''); setFilterType('all'); setFilterStatus('all'); }}>
                        Wyczyść filtry
                    </Button>
                </div>
            )}
        </div>
    );
}
