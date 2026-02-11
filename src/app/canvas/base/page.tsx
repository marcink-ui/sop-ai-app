'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
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
    Circle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

// Mock data
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
        name: 'Twórz Canvas — Q1 2026',
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
        name: 'Twórz Canvas — Nowy Produkt',
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

const statusConfig: Record<CanvasStatus, { label: string; dot: string; text: string }> = {
    draft: { label: 'Szkic', dot: 'bg-neutral-400', text: 'text-muted-foreground' },
    active: { label: 'Aktywny', dot: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
    review: { label: 'Do przeglądu', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
    approved: { label: 'Zatwierdzony', dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
};

const typeConfig: Record<CanvasType, { label: string; icon: typeof ClipboardList; color: string; badge: string }> = {
    ai: { label: 'AI Canvas', icon: ClipboardList, color: 'from-blue-500 to-cyan-600', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
    gtm: { label: 'Twórz Canvas', icon: Target, color: 'from-violet-500 to-purple-600', badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20' },
};

type SortField = 'name' | 'updatedAt' | 'department' | 'status';

export default function BaseCanvasPage() {
    const { data: session, isPending } = useSession();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterType, setFilterType] = useState<CanvasType | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<CanvasStatus | 'all'>('all');
    const [sortBy, setSortBy] = useState<SortField>('updatedAt');

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            </div>
        );
    }

    if (!session) {
        redirect('/auth/login');
    }

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
        <div className="space-y-5">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                        <FolderKanban className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Baza Canvas</h1>
                        <p className="text-[13px] text-muted-foreground">
                            Wszystkie canvasy organizacji
                        </p>
                    </div>
                </div>
                <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs">
                    <Plus className="h-3.5 w-3.5" />
                    Nowy Canvas
                </Button>
            </div>

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 h-8 text-xs bg-muted/30 border-border"
                    />
                </div>

                {/* Type Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs text-muted-foreground">
                            <Filter className="h-3 w-3" />
                            {filterType === 'all' ? 'Typ' : typeConfig[filterType].label}
                            <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setFilterType('all')}>Wszystkie</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setFilterType('ai')}>AI Canvas</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterType('gtm')}>Twórz Canvas</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Status Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs text-muted-foreground">
                            <Circle className="h-3 w-3" />
                            {filterStatus === 'all' ? 'Status' : statusConfig[filterStatus].label}
                            <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setFilterStatus('all')}>Wszystkie</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {(Object.keys(statusConfig) as CanvasStatus[]).map(s => (
                            <DropdownMenuItem key={s} onClick={() => setFilterStatus(s)} className="gap-2">
                                <span className={cn("h-2 w-2 rounded-full", statusConfig[s].dot)} />
                                {statusConfig[s].label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Sort */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs text-muted-foreground">
                            <ArrowUpDown className="h-3 w-3" />
                            Sortuj
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setSortBy('updatedAt')}>Data aktualizacji</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy('name')}>Nazwa</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy('department')}>Dział</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy('status')}>Status</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* View Toggle */}
                <div className="flex items-center p-0.5 rounded-md border border-border ml-auto bg-muted/20">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "p-1.5 rounded-sm transition-colors",
                            viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <LayoutGrid className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "p-1.5 rounded-sm transition-colors",
                            viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <List className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{filteredCanvases.length}</span>
                <span>z {mockCanvases.length} canvasów</span>
                <span className="text-border">•</span>
                <span>{mockCanvases.filter(c => c.type === 'ai').length} AI</span>
                <span>{mockCanvases.filter(c => c.type === 'gtm').length} Twórz</span>
                <span className="text-border">•</span>
                <span>{mockCanvases.filter(c => c.status === 'review').length} do przeglądu</span>
            </div>

            {/* ── Content: Grid / List ── */}
            <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                    >
                        {filteredCanvases.map((canvas, index) => {
                            const typeInfo = typeConfig[canvas.type];
                            const statusInfo = statusConfig[canvas.status];
                            const TypeIcon = typeInfo.icon;

                            return (
                                <motion.div
                                    key={canvas.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <Card className="group border-border/60 hover:border-border hover:bg-accent/30 transition-all duration-150 cursor-pointer">
                                        <CardContent className="p-4 space-y-3">
                                            {/* Top */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className={cn(
                                                        "h-8 w-8 rounded-md flex items-center justify-center shrink-0",
                                                        `bg-gradient-to-br ${typeInfo.color}`
                                                    )}>
                                                        <TypeIcon className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm leading-tight truncate">
                                                            {canvas.name}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                                            {canvas.department}
                                                        </p>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="h-6 w-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-accent transition-all shrink-0">
                                                            <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuItem className="gap-2 text-xs"><ExternalLink className="h-3 w-3" /> Otwórz</DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2 text-xs"><Edit3 className="h-3 w-3" /> Edytuj</DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2 text-xs"><Copy className="h-3 w-3" /> Duplikuj</DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2 text-xs"><Download className="h-3 w-3" /> Pobierz</DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2 text-xs"><Send className="h-3 w-3" /> Deleguj</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="gap-2 text-xs text-red-500"><Trash2 className="h-3 w-3" /> Usuń</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            {/* Meta */}
                                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {canvas.owner}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {canvas.updatedAt}
                                                </span>
                                            </div>

                                            {/* Bottom */}
                                            <div className="flex items-center justify-between pt-1 border-t border-border/50">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={cn("h-1.5 w-1.5 rounded-full", statusInfo.dot)} />
                                                    <span className={cn("text-[11px] font-medium", statusInfo.text)}>
                                                        {statusInfo.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
                                                    <span>{canvas.widgetCount} widgetów</span>
                                                    {canvas.comments > 0 && (
                                                        <span className="flex items-center gap-0.5">
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
                        transition={{ duration: 0.15 }}
                        className="border border-border rounded-lg overflow-hidden"
                    >
                        {/* List Header */}
                        <div className="grid grid-cols-12 gap-3 px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border">
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
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    className={cn(
                                        "grid grid-cols-12 gap-3 px-4 py-2.5 items-center hover:bg-accent/40 transition-colors group cursor-pointer",
                                        index < filteredCanvases.length - 1 && "border-b border-border/50"
                                    )}
                                >
                                    <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 shrink-0 border", typeConfig[canvas.type].badge)}>
                                            {canvas.type === 'ai' ? 'AI' : 'Twórz'}
                                        </Badge>
                                        <span className="text-sm font-medium truncate">
                                            {canvas.name}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-xs text-muted-foreground">{canvas.department}</div>
                                    <div className="col-span-2 text-xs text-muted-foreground">{canvas.owner}</div>
                                    <div className="col-span-1 flex items-center gap-1.5">
                                        <span className={cn("h-1.5 w-1.5 rounded-full", statusInfo.dot)} />
                                        <span className={cn("text-[11px]", statusInfo.text)}>{statusInfo.label}</span>
                                    </div>
                                    <div className="col-span-1 text-[11px] text-muted-foreground">{canvas.updatedAt}</div>
                                    <div className="col-span-2 flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-accent"><ExternalLink className="h-3 w-3 text-muted-foreground" /></button>
                                        <button className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-accent"><Edit3 className="h-3 w-3 text-muted-foreground" /></button>
                                        <button className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-accent"><Copy className="h-3 w-3 text-muted-foreground" /></button>
                                        <button className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-accent"><Download className="h-3 w-3 text-muted-foreground" /></button>
                                        <button className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-accent"><Send className="h-3 w-3 text-muted-foreground" /></button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {filteredCanvases.length === 0 && (
                <div className="border border-dashed border-border rounded-lg p-12 text-center">
                    <FolderKanban className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                    <h3 className="font-medium text-sm mb-1">Brak canvasów</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                        Nie znaleziono canvasów pasujących do filtrów
                    </p>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => { setSearchQuery(''); setFilterType('all'); setFilterStatus('all'); }}>
                        Wyczyść filtry
                    </Button>
                </div>
            )}
        </div>
    );
}
