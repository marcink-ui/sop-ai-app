'use client';

import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
    onOpenChat?: () => void;
}

export function CommandPalette({ onOpenChat }: CommandPaletteProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

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
    };

    const pages = [
        { name: 'Dashboard', icon: Home, path: '/' },
        { name: 'SOPs', icon: FileText, path: '/sops' },
        { name: 'Nowy SOP', icon: Plus, path: '/sops/new' },
        { name: 'Agenci AI', icon: Bot, path: '/agents' },
        { name: 'Raporty MUDA', icon: Search, path: '/muda' },
        { name: 'Rejestr Ról', icon: Users, path: '/roles' },
        { name: 'Ontologia', icon: BookOpen, path: '/ontology' },
        { name: 'Łańcuch Wartości', icon: GitBranch, path: '/value-chain' },
        { name: 'Graf Wiedzy', icon: Network, path: '/knowledge-graph' },
        { name: 'Rada', icon: Scale, path: '/council' },
        { name: 'Zadania', icon: LayoutDashboard, path: '/tasks' },
        { name: 'Historia AI', icon: MessageSquare, path: '/chat-library' },
        { name: 'Ustawienia', icon: Settings, path: '/settings' },
    ];

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            />

            {/* Command Palette */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg">
                <Command
                    className={cn(
                        'bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700',
                        'overflow-hidden'
                    )}
                >
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                        <Search className="h-4 w-4 text-neutral-400" />
                        <Command.Input
                            placeholder="Szukaj stron, akcji..."
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

                    <Command.List className="max-h-80 overflow-y-auto p-2">
                        <Command.Empty className="py-6 text-center text-sm text-neutral-400">
                            Nic nie znaleziono.
                        </Command.Empty>

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
                    </Command.List>

                    <div className="flex items-center justify-between px-3 py-2 border-t border-neutral-200 dark:border-neutral-700 text-[10px] text-neutral-400">
                        <div className="flex items-center gap-2">
                            <span>↑↓ Nawiguj</span>
                            <span>↵ Wybierz</span>
                        </div>
                        <span>⌘K Otwórz</span>
                    </div>
                </Command>
            </div>
        </div>
    );
}
