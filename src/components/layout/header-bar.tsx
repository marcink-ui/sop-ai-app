'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    Info,
    Bell,
    MessageSquare,
    User,
    Settings,
    LogOut,
    CheckCircle2,
    AlertCircle,
    BookOpen,
    ListTodo,
    ChevronRight,
    ChevronLeft,
    ArrowLeft,
    ArrowRight,
    Sun,
    Moon,
    Key,
    Plug,
    Globe,
    Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from '@/components/ui/tooltip';
import Link from 'next/link';

// Page descriptions for info tooltip
interface PageInfo {
    title: string;
    description: string;
    howToUse?: string[];
    tips?: string;
}

const pageDescriptions: Record<string, PageInfo> = {
    '/': {
        title: 'Dashboard',
        description: 'Główny pulpit z przeglądem KPI, aktywności i szybkim dostępem do wszystkich modułów.',
        howToUse: ['Sprawdź statusy zadań i KPI', 'Przejdź do modułów z kart szybkiego dostępu', 'Monitoruj aktywność AI'],
        tips: 'Dashboard odświeża się automatycznie co 5 minut.'
    },
    '/sops': {
        title: 'Baza SOPs',
        description: 'Biblioteka procedur operacyjnych z wersjonowaniem i połączeniami do AI Agentów.',
        howToUse: ['Kliknij "Nowy SOP" aby utworzyć procedurę', 'Użyj filtrów do wyszukiwania', 'Połącz SOP z Agentem AI'],
        tips: 'SOPy z połączonymi Agentami są priorytetowo wspierane przez AI.'
    },
    '/agents': {
        title: 'Agenci AI',
        description: 'Katalog asystentów AI przypisanych do konkretnych SOPów i procesów.',
        howToUse: ['Użyj czatu aby porozmawiać z agentem', 'Sprawdź statystyki użycia', 'Połącz agentów z SOPami'],
        tips: 'Agenci uczą się z każdej interakcji i poprawiają swoje odpowiedzi.'
    },
    '/value-chain': {
        title: 'Łańcuch Wartości',
        description: 'Interaktywna mapa procesów z analizą automatyzacji i ROI.',
        howToUse: ['Przeciągnij elementy na whiteboard', 'Połącz procesy strzałkami', 'Użyj widoku "Lista" dla przeglądu'],
        tips: 'Zapisuj snapshoty aby porównać różne wersje workflow.'
    },
    '/council': {
        title: 'Rada',
        description: 'Panel wniosków o nowe SOPy i zmiany. Głosowanie i zatwierdzanie przez uprawnionych.',
        howToUse: ['Złóż wniosek o nowy SOP', 'Głosuj za lub przeciw', 'Sprawdź status swoich wniosków'],
        tips: 'Wnioski z ponad 50% głosów są automatycznie eskalowane.'
    },
    '/tasks': {
        title: 'Zadania',
        description: 'Kanban board z zadaniami do realizacji przypisanymi do użytkowników.',
        howToUse: ['Przeciągaj karty między kolumnami', 'Kliknij zadanie aby zobaczyć szczegóły', 'Filtruj po przypisanym'],
        tips: 'Zadania z AI Agentami mogą być częściowo automatyzowane.'
    },
    '/knowledge-graph': {
        title: 'Graf Wiedzy',
        description: 'Wizualizacja powiązań między SOPami, rolami, agentami i ontologią.',
        howToUse: ['Kliknij węzeł aby zobaczyć szczegóły', 'Użyj kółka myszy do zoom', 'Przeciągaj aby eksplorować'],
        tips: 'Graf pokazuje tylko aktywne powiązania.'
    },
    '/chat-library': {
        title: 'Historia AI',
        description: 'Archiwum sesji czatu z AI uporządkowane chronologicznie.',
        howToUse: ['Przeszukuj historię czatów', 'Eksportuj rozmowy', 'Przywróć poprzednie sesje'],
        tips: 'Czaty starsze niż 90 dni są automatycznie archiwizowane.'
    },
    '/roles': {
        title: 'Rejestr Ról',
        description: 'Definicje ról organizacyjnych z uprawnieniami i przypisaniami.',
        howToUse: ['Stwórz nową rolę', 'Przypisz uprawnienia', 'Połącz z użytkownikami'],
        tips: 'Role dziedziczą uprawnienia hierarchicznie.'
    },
    '/muda': {
        title: 'Raporty MUDA',
        description: 'Analiza marnotrawstwa według metodologii Lean.',
        howToUse: ['Zgłoś nowe marnotrawstwo', 'Przypisz priorytet', 'Śledź postęp eliminacji'],
        tips: 'MUDA = Muri (przeciążenie), Mura (nierówność), Muda (marnotrawstwo).'
    },
    '/ontology': {
        title: 'Ontologia',
        description: 'Słownik pojęć firmowych używanych w całym systemie.',
        howToUse: ['Dodaj nowy termin', 'Zdefiniuj relacje', 'Połącz z SOPami'],
        tips: 'Ontologia jest używana przez AI do lepszego rozumienia kontekstu.'
    },
    '/settings': {
        title: 'Ustawienia',
        description: 'Konfiguracja profilu, integracji i preferencji.',
        howToUse: ['Zmień motyw', 'Skonfiguruj integracje', 'Zarządzaj powiadomieniami'],
    },
    '/backoffice': {
        title: 'Backoffice',
        description: 'Panel administracyjny: zarządzanie promptami, firmami i użytkownikami.',
        howToUse: ['Zarządzaj organizacjami', 'Konfiguruj prompty AI', 'Przetwarzaj transkrypcje'],
        tips: 'Dostęp tylko dla administratorów.'
    },
    '/notifications': {
        title: 'Powiadomienia',
        description: 'Centrum powiadomień o zadaniach, SOPach i aktywnościach.',
        howToUse: ['Przeglądaj wszystkie powiadomienia', 'Oznaczaj jako przeczytane', 'Filtruj po typie'],
    },
};

interface Notification {
    id: string;
    type: 'task' | 'knowledge' | 'alert' | 'panda';
    title: string;
    description: string;
    time: string;
    read: boolean;
    link?: string;
}

interface HeaderBarProps {
    onOpenChat?: () => void;
}

export function HeaderBar({ onOpenChat }: HeaderBarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch notifications from API
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications');
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
        // Refresh every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Mark all as read (local state only - no DB persistence)
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    // Get current page info
    const currentPage = pageDescriptions[pathname] || {
        title: 'Strona',
        description: 'Opis tej strony nie jest jeszcze dostępny.'
    };

    // Get user initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'task': return <ListTodo className="h-4 w-4 text-blue-500" />;
            case 'knowledge': return <BookOpen className="h-4 w-4 text-emerald-500" />;
            case 'alert': return <AlertCircle className="h-4 w-4 text-amber-500" />;
            case 'panda': return <span className="text-sm">🐼</span>;
            default: return <Bell className="h-4 w-4" />;
        }
    };

    const { canGoBack, canGoForward, goBack, goForward } = useNavigationHistory();

    return (
        <TooltipProvider>
            <div className="flex items-center justify-between w-full gap-4">
                {/* Left Group: Navigation + Breadcrumbs */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-0.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={goBack}
                                    disabled={!canGoBack}
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Wstecz (Alt+←)</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={goForward}
                                    disabled={!canGoForward}
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Dalej (Alt+→)</TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Breadcrumbs */}
                    <Breadcrumb className="hidden md:flex ml-2" />
                </div>

                {/* Center Group: Search Bar Trigger */}
                <div className="flex-1 flex justify-center max-w-xl mx-4">
                    <button
                        onClick={() => {
                            // Trigger Command Palette by dispatching ⌘K event
                            const event = new KeyboardEvent('keydown', {
                                key: 'k',
                                metaKey: true,
                                ctrlKey: false,
                                bubbles: true,
                            });
                            document.dispatchEvent(event);
                        }}
                        className="w-full max-w-md flex items-center gap-3 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-white dark:hover:bg-neutral-800 transition-all group"
                    >
                        <Search className="h-4 w-4" />
                        <span className="text-sm flex-1 text-left">Szukaj...</span>
                        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-700 rounded group-hover:bg-neutral-200 dark:group-hover:bg-neutral-600 transition-colors">
                            ⌘K
                        </kbd>
                    </button>
                </div>

                {/* Right Group: Actions */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Info Tooltip */}
                    <HoverCard openDelay={100} closeDelay={100}>
                        <HoverCardTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                            >
                                <Info className="h-4 w-4" />
                            </Button>
                        </HoverCardTrigger>
                        <HoverCardContent align="end" className="w-96">
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-semibold text-base">{currentPage.title}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {currentPage.description}
                                    </p>
                                </div>

                                {currentPage.howToUse && currentPage.howToUse.length > 0 && (
                                    <div className="pt-2 border-t">
                                        <p className="text-xs font-medium text-muted-foreground mb-2">Jak używać:</p>
                                        <ul className="space-y-1">
                                            {currentPage.howToUse.map((step, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <span className="text-primary font-medium">{i + 1}.</span>
                                                    <span>{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {currentPage.tips && (
                                    <div className="flex items-start gap-2 pt-2 border-t text-xs text-muted-foreground bg-muted/50 rounded-md p-2 -mx-1">
                                        <span className="text-amber-500">💡</span>
                                        <span>{currentPage.tips}</span>
                                    </div>
                                )}
                            </div>
                        </HoverCardContent>
                    </HoverCard>

                    {/* Notifications Bell */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 relative text-muted-foreground hover:text-foreground"
                            >
                                <Bell className="h-4 w-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel className="flex items-center justify-between">
                                <span>Powiadomienia</span>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <>
                                            <Badge variant="secondary" className="text-xs">
                                                {unreadCount} nowe
                                            </Badge>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    markAllAsRead();
                                                }}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                Oznacz jako przeczytane
                                            </button>
                                        </>
                                    )}
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    Brak powiadomień
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        className="flex items-start gap-3 p-3 cursor-pointer"
                                    >
                                        <div className="mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {notification.description}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {notification.time}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="h-2 w-2 rounded-full bg-blue-500 mt-1" />
                                        )}
                                    </DropdownMenuItem>
                                ))
                            )}
                            <DropdownMenuSeparator />
                            <Link href="/notifications" className="block">
                                <DropdownMenuItem className="justify-center text-sm text-muted-foreground cursor-pointer">
                                    Zobacz wszystkie
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Chat AI Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onOpenChat}
                        className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <MessageSquare className="h-4 w-4" />
                        <span className="hidden sm:inline">Chat AI</span>
                    </Button>

                    {/* User Avatar Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={session?.user?.image || undefined}
                                        alt={session?.user?.name || 'User'}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs">
                                        {session?.user?.name ? getInitials(session.user.name) : 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                            {/* User Info */}
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={session?.user?.image || undefined} />
                                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                                            {session?.user?.name ? getInitials(session.user.name) : 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {session?.user?.name || 'Użytkownik'}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {session?.user?.email || 'demo@vantageos.io'}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {/* Profile & Settings */}
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings/profile" className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        Profil
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings" className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Ustawienia ogólne
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />

                            {/* Theme Toggle */}
                            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                                Motyw
                            </DropdownMenuLabel>
                            <div className="px-2 py-1.5">
                                <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
                                    <button
                                        onClick={() => {
                                            document.documentElement.classList.remove('dark');
                                            localStorage.setItem('theme', 'light');
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors hover:bg-background data-[active=true]:bg-background data-[active=true]:shadow-sm"
                                        data-active={typeof window !== 'undefined' && !document.documentElement.classList.contains('dark')}
                                    >
                                        <Sun className="h-3.5 w-3.5" />
                                        Jasny
                                    </button>
                                    <button
                                        onClick={() => {
                                            document.documentElement.classList.add('dark');
                                            localStorage.setItem('theme', 'dark');
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors hover:bg-background data-[active=true]:bg-background data-[active=true]:shadow-sm"
                                        data-active={typeof window !== 'undefined' && document.documentElement.classList.contains('dark')}
                                    >
                                        <Moon className="h-3.5 w-3.5" />
                                        Ciemny
                                    </button>
                                </div>
                            </div>
                            <DropdownMenuSeparator />

                            {/* Additional Settings */}
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings/api-keys" className="cursor-pointer">
                                        <Key className="mr-2 h-4 w-4" />
                                        Klucze API
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings/integrations" className="cursor-pointer">
                                        <Plug className="mr-2 h-4 w-4" />
                                        Integracje
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings/language" className="cursor-pointer">
                                        <Globe className="mr-2 h-4 w-4" />
                                        Język
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />

                            {/* Logout */}
                            <DropdownMenuItem
                                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                                className="text-red-600 focus:text-red-600 cursor-pointer"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Wyloguj się
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </TooltipProvider>
    );
}

