'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
    FileText,
    Bot,
    Search,
    Users,
    BookOpen,
    GitBranch,
    Network,
    Scale,
    LayoutDashboard,
    MessageSquare,
    Settings,
    Home,
    Sparkles,
    Plus,
    Loader2,
    Database,
    Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
    onOpenChat?: () => void;
}

interface SearchResult {
    id: string;
    title: string;
    type: 'sop' | 'wiki' | 'role' | 'agent';
    description?: string;
    path: string;
}

// Sample data for search (will be replaced with API calls)
const SAMPLE_SOPS: SearchResult[] = [
    { id: '1', title: 'Obsługa reklamacji klienta', type: 'sop', description: 'Proces obsługi reklamacji od A do Z', path: '/sops/1' },
    { id: '2', title: 'Onboarding nowego pracownika', type: 'sop', description: 'Wprowadzenie do firmy w 7 dni', path: '/sops/2' },
    { id: '3', title: 'Proces fakturowania', type: 'sop', description: 'Wystawianie i wysyłka faktur', path: '/sops/3' },
];

const SAMPLE_WIKI: SearchResult[] = [
    { id: 'soul', title: 'VantageOS Soul Document', type: 'wiki', description: 'Tożsamość AI i wartości', path: '/resources/wiki/soul' },
    { id: 'isoa', title: 'ISOA - Metodologia Transformacji', type: 'wiki', description: 'Iterate, Simplify, Optimize, Automate', path: '/resources/wiki/isoa' },
    { id: 'muda-guide', title: 'MUDA Analysis', type: 'wiki', description: 'Identyfikacja strat w procesach', path: '/resources/wiki/muda-guide' },
];

const SAMPLE_ROLES: SearchResult[] = [
    { id: '1', title: 'Kierownik Projektu', type: 'role', description: 'Zarządzanie projektami i zespołem', path: '/roles?id=1' },
    { id: '2', title: 'Specjalista ds. Sprzedaży', type: 'role', description: 'Obsługa klienta i sprzedaż', path: '/roles?id=2' },
    { id: '3', title: 'Analityk Biznesowy', type: 'role', description: 'Analiza procesów i raportowanie', path: '/roles?id=3' },
];

export function CommandPalette({ onOpenChat }: CommandPaletteProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();

    // Debounced search
    const performSearch = useCallback((query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);

        // Simulate API search (in production, call actual API)
        const lowerQuery = query.toLowerCase();
        const results: SearchResult[] = [
            ...SAMPLE_SOPS.filter(s => s.title.toLowerCase().includes(lowerQuery) || s.description?.toLowerCase().includes(lowerQuery)),
            ...SAMPLE_WIKI.filter(w => w.title.toLowerCase().includes(lowerQuery) || w.description?.toLowerCase().includes(lowerQuery)),
            ...SAMPLE_ROLES.filter(r => r.title.toLowerCase().includes(lowerQuery) || r.description?.toLowerCase().includes(lowerQuery)),
        ];

        setTimeout(() => {
            setSearchResults(results);
            setIsSearching(false);
        }, 100);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(searchQuery);
        }, 150);
        return () => clearTimeout(timer);
    }, [searchQuery, performSearch]);

    // Open on ⌘K / Ctrl+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
            // ⌘J for AI Chat
            if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onOpenChat?.();
            }
            // Escape to close
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [onOpenChat]);

    const navigate = (path: string) => {
        router.push(path);
        setOpen(false);
        setSearchQuery('');
    };

    const pages = [
        { name: 'Dashboard', icon: Home, path: '/' },
        { name: 'SOPs', icon: FileText, path: '/sops' },
        { name: 'Nowy SOP', icon: Plus, path: '/sops/new' },
        { name: 'Agenci AI', icon: Bot, path: '/agents' },
        { name: 'Raporty MUDA', icon: Search, path: '/muda' },
        { name: 'Rejestr Ról', icon: Users, path: '/roles' },
        { name: 'Wiki', icon: BookOpen, path: '/resources/wiki' },
        { name: 'Łańcuch Wartości', icon: GitBranch, path: '/value-chain' },
        { name: 'Graf Wiedzy', icon: Network, path: '/knowledge-graph' },
        { name: 'Rada', icon: Scale, path: '/council' },
        { name: 'Zadania', icon: LayoutDashboard, path: '/tasks' },
        { name: 'Historia AI', icon: MessageSquare, path: '/chat-library' },
        { name: 'Ustawienia', icon: Settings, path: '/settings' },
    ];

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'sop': return FileText;
            case 'wiki': return BookOpen;
            case 'role': return Users;
            case 'agent': return Bot;
            default: return Hash;
        }
    };

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            sop: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            wiki: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            role: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            agent: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        };
        const labels: Record<string, string> = {
            sop: 'SOP',
            wiki: 'Wiki',
            role: 'Rola',
            agent: 'Agent',
        };
        return { color: colors[type] || 'bg-gray-100 text-gray-700', label: labels[type] || type };
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            />

            {/* Command Palette */}
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
                <Command
                    className={cn(
                        'bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700',
                        'overflow-hidden'
                    )}
                >
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                        {isSearching ? (
                            <Loader2 className="h-4 w-4 text-neutral-400 animate-spin" />
                        ) : (
                            <Search className="h-4 w-4 text-neutral-400" />
                        )}
                        <Command.Input
                            placeholder="Szukaj SOPs, Wiki, Ról, stron..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            className={cn(
                                'flex-1 bg-transparent outline-none text-sm',
                                'text-neutral-900 dark:text-white',
                                'placeholder:text-neutral-400'
                            )}
                            autoFocus
                        />
                        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded">
                            ESC
                        </kbd>
                    </div>

                    <Command.List className="max-h-96 overflow-y-auto p-2">
                        <Command.Empty className="py-6 text-center text-sm text-neutral-400">
                            {searchQuery.length >= 2 ? 'Nic nie znaleziono.' : 'Wpisz min. 2 znaki aby wyszukać...'}
                        </Command.Empty>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <Command.Group heading="Wyniki wyszukiwania">
                                <p className="px-2 py-1.5 text-xs font-medium text-neutral-400 uppercase tracking-wide flex items-center gap-2">
                                    <Database className="h-3 w-3" />
                                    Znaleziono {searchResults.length} wynik(ów)
                                </p>
                                {searchResults.map((result) => {
                                    const Icon = getTypeIcon(result.type);
                                    const badge = getTypeBadge(result.type);
                                    return (
                                        <Command.Item
                                            key={`${result.type}-${result.id}`}
                                            value={`${result.title} ${result.description || ''}`}
                                            onSelect={() => navigate(result.path)}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer',
                                                'text-sm text-neutral-700 dark:text-neutral-300',
                                                'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                                                'data-[selected=true]:bg-blue-50 dark:data-[selected=true]:bg-blue-500/20',
                                                'data-[selected=true]:text-blue-600 dark:data-[selected=true]:text-blue-400'
                                            )}
                                        >
                                            <Icon className="h-4 w-4 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium truncate">{result.title}</span>
                                                    <span className={cn('px-1.5 py-0.5 text-[10px] font-medium rounded', badge.color)}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                {result.description && (
                                                    <p className="text-xs text-neutral-500 truncate">{result.description}</p>
                                                )}
                                            </div>
                                        </Command.Item>
                                    );
                                })}
                            </Command.Group>
                        )}

                        {/* Navigation (show when no search query) */}
                        {searchQuery.length < 2 && (
                            <>
                                <Command.Group heading="Nawigacja" className="mb-2">
                                    <p className="px-2 py-1.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">
                                        Strony
                                    </p>
                                    {pages.map((page) => (
                                        <Command.Item
                                            key={page.path}
                                            value={page.name}
                                            onSelect={() => navigate(page.path)}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer',
                                                'text-sm text-neutral-700 dark:text-neutral-300',
                                                'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                                                'data-[selected=true]:bg-blue-50 dark:data-[selected=true]:bg-blue-500/20',
                                                'data-[selected=true]:text-blue-600 dark:data-[selected=true]:text-blue-400'
                                            )}
                                        >
                                            <page.icon className="h-4 w-4" />
                                            <span>{page.name}</span>
                                        </Command.Item>
                                    ))}
                                </Command.Group>

                                <Command.Group heading="Akcje">
                                    <p className="px-2 py-1.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">
                                        Skróty
                                    </p>
                                    <Command.Item
                                        value="AI Chat"
                                        onSelect={() => {
                                            onOpenChat?.();
                                            setOpen(false);
                                        }}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer',
                                            'text-sm text-neutral-700 dark:text-neutral-300',
                                            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                                            'data-[selected=true]:bg-blue-50 dark:data-[selected=true]:bg-blue-500/20',
                                            'data-[selected=true]:text-blue-600 dark:data-[selected=true]:text-blue-400'
                                        )}
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        <span className="flex-1">Otwórz AI Chat</span>
                                        <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded">
                                            ⌘J
                                        </kbd>
                                    </Command.Item>
                                </Command.Group>
                            </>
                        )}
                    </Command.List>

                    <div className="flex items-center justify-between px-3 py-2 border-t border-neutral-200 dark:border-neutral-700 text-[10px] text-neutral-400">
                        <div className="flex items-center gap-3">
                            <span>↑↓ Nawiguj</span>
                            <span>↵ Wybierz</span>
                            <span className="text-blue-500">Szukaj: SOPs, Wiki, Role</span>
                        </div>
                        <span>⌘K Otwórz</span>
                    </div>
                </Command>
            </div>
        </div>
    );
}

