'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FileText,
    Bot,
    Search,
    Users,
    GitBranch,
    Scale,
    Plus,
    Settings2,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Sparkles,
    MessageCircle,
    Command,
    BookOpen,
    BarChart3,
    MessageSquare,
    Network,
    Calculator,
    Trophy,
    FolderOpen,
    Library,
    Newspaper,
    Code2,
    Wrench,
    ClipboardList,
    Home,
    Briefcase,
    User,
    GraduationCap,
    History,
    Lightbulb,
    Rocket,
    Building2,
    Target,
    AppWindow,
    Cog,
    Shield,
    FolderKanban,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PandaIcon } from '@/components/icons/panda-icon';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useChat } from '@/components/ai-chat';

// Multi-dimensional role access (imported from permissions.ts logic)
// INTERNAL: CITIZEN_DEV → EXPERT → MANAGER → PILOT → SPONSOR
// EXTERNAL: PARTNER (separate axis — only Partner Portal)
// PLATFORM: META_ADMIN (sees everything)
const INTERNAL_LEVELS: Record<string, number> = {
    EXPLORER: 0, CITIZEN_DEV: 1, EXPERT: 2, MANAGER: 3, PILOT: 4, SPONSOR: 5,
    PARTNER: -1, META_ADMIN: 99,
};

const hasMinRole = (userRole: string | undefined, minRole: string): boolean => {
    if (!userRole) return false;
    if (userRole === 'META_ADMIN') return true;
    if (minRole === 'PARTNER') return userRole === 'PARTNER' || userRole === 'META_ADMIN';
    if (minRole === 'META_ADMIN') return userRole === 'META_ADMIN';
    if (userRole === 'PARTNER') return false; // PARTNER can't access internal pages
    return (INTERNAL_LEVELS[userRole] ?? 0) >= (INTERNAL_LEVELS[minRole] ?? 0);
};

interface NavItemData {
    name: string;
    href: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    minRole: string;
}

// NEW SIDEBAR STRUCTURE — priority-based, grouped by usage
const SIDEBAR_CATEGORIES = {
    szybkiDostep: {
        label: 'Szybki Dostęp',
        icon: Home,
        defaultOpen: true,
        items: [
            { name: 'Moje Zadania', href: '/tasks', icon: ClipboardList, color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-100 dark:bg-rose-500/20', minRole: 'CITIZEN_DEV' },
            { name: 'Pandy', href: '/pandas', icon: PandaIcon, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-500/20', minRole: 'EXPLORER' },
            { name: 'Kaizen', href: '/kaizen', icon: Lightbulb, color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-500/20', minRole: 'CITIZEN_DEV' },
            { name: 'Mój kontekst', href: '/my-context', icon: User, color: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-100 dark:bg-cyan-500/20', minRole: 'CITIZEN_DEV' },
        ] as NavItemData[],
    },
    procesy: {
        label: 'Procesy',
        icon: FileText,
        defaultOpen: false,
        items: [
            { name: 'SOP', href: '/sops', icon: FileText, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-500/20', minRole: 'CITIZEN_DEV' },
            { name: 'Proces SOP', href: '/sops/process', icon: Rocket, color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-100 dark:bg-indigo-500/20', minRole: 'CITIZEN_DEV' },
            { name: 'Agenci AI', href: '/agents', icon: Bot, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-500/20', minRole: 'CITIZEN_DEV' },
            { name: 'Raporty MUDA', href: '/muda', icon: Search, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-500/20', minRole: 'CITIZEN_DEV' },
            { name: 'Słownik', href: '/ontology', icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-500/20', minRole: 'CITIZEN_DEV' },
        ] as NavItemData[],
    },
    wiedza: {
        label: 'Wiedza & Zasoby',
        icon: Library,
        defaultOpen: false,
        items: [
            { name: 'Resources Hub', href: '/resources', icon: Library, color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-100 dark:bg-violet-500/20', minRole: 'CITIZEN_DEV' },
            { name: 'Graf Wiedzy', href: '/knowledge-graph', icon: Network, color: 'text-pink-600 dark:text-pink-400', bgColor: 'bg-pink-100 dark:bg-pink-500/20', minRole: 'CITIZEN_DEV' },
            { name: 'Kursy', href: '/courses', icon: GraduationCap, color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-100 dark:bg-rose-500/20', minRole: 'CITIZEN_DEV' },
        ] as NavItemData[],
    },
    canvas: {
        label: 'Canvas',
        icon: ClipboardList,
        defaultOpen: false,
        items: [
            { name: 'AI Canvas', href: '/canvas', icon: ClipboardList, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-500/20', minRole: 'CITIZEN_DEV' },
            { name: 'Twórz Canvas', href: '/canvas/gtm', icon: Target, color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-100 dark:bg-violet-500/20', minRole: 'CITIZEN_DEV' },
        ] as NavItemData[],
    },
    zarzadzanie: {
        label: 'Zarządzanie',
        icon: Briefcase,
        defaultOpen: false,
        items: [
            { name: 'Analityka', href: '/analytics', icon: BarChart3, color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-100 dark:bg-violet-500/20', minRole: 'CITIZEN_DEV' },
            { name: 'Łańcuch Wartości', href: '/value-chain', icon: GitBranch, color: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-100 dark:bg-cyan-500/20', minRole: 'CITIZEN_DEV' },
            { name: 'Kontekst Firmowy', href: '/backoffice/context', icon: Building2, color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-100 dark:bg-rose-500/20', minRole: 'CITIZEN_DEV' },
            { name: 'Baza Canvas', href: '/canvas/base', icon: FolderKanban, color: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-100 dark:bg-teal-500/20', minRole: 'CITIZEN_DEV' },
            { name: 'Rada', href: '/council', icon: Scale, color: 'text-amber-600 dark:text-yellow-400', bgColor: 'bg-amber-100 dark:bg-yellow-500/20', minRole: 'MANAGER' },
            { name: 'Kalkulator ROI', href: '/roi-calculator', icon: Calculator, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-500/20', minRole: 'MANAGER' },
            { name: 'Rejestr Ról', href: '/roles', icon: Users, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-500/20', minRole: 'MANAGER' },
            { name: 'Historia Czat AI', href: '/chat-history-admin', icon: History, color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-100 dark:bg-indigo-500/20', minRole: 'SPONSOR' },
            { name: 'Backoffice', href: '/backoffice', icon: Settings2, color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-100 dark:bg-violet-500/20', minRole: 'CITIZEN_DEV' },
        ] as NavItemData[],
    },
    partner: {
        label: 'Partner',
        icon: Building2,
        defaultOpen: false,
        items: [
            { name: 'Dashboard', href: '/partner', icon: BarChart3, color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-100 dark:bg-violet-500/20', minRole: 'PARTNER' },
            { name: 'Transformacje', href: '/partner/transformations', icon: Rocket, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-500/20', minRole: 'PARTNER' },
            { name: 'Firmy', href: '/backoffice/companies', icon: Building2, color: 'text-sky-600 dark:text-sky-400', bgColor: 'bg-sky-100 dark:bg-sky-500/20', minRole: 'PARTNER' },
            { name: 'Admin', href: '/admin-panel', icon: Shield, color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-500/20', minRole: 'META_ADMIN' },
        ] as NavItemData[],
    },
};

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { toggleChat, isOpen: isChatOpen } = useChat();
    const { data: session, isPending } = useSession();
    const userRole = session?.user?.role;
    const [orgName, setOrgName] = useState<string>('Business OS');

    // Fetch organization name dynamically
    useEffect(() => {
        if (session?.user) {
            fetch('/api/user/organization')
                .then(res => res.json())
                .then(data => { if (data.name) setOrgName(data.name); })
                .catch(() => { /* keep fallback */ });
        }
    }, [session?.user]);

    // State for category expansion
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
        Object.fromEntries(
            Object.entries(SIDEBAR_CATEGORIES).map(([key, cat]) => [key, cat.defaultOpen])
        )
    );

    const toggleCategory = (key: string) => {
        setOpenCategories(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    'sticky top-0 z-40 h-screen shrink-0 border-r transition-all duration-300 ease-in-out',
                    'border-neutral-200 bg-white/80 backdrop-blur-xl',
                    'dark:border-neutral-800/50 dark:bg-neutral-950/80',
                    collapsed ? 'w-16' : 'w-64'
                )}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                <div className="relative flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-16 items-center justify-between border-b border-neutral-200 dark:border-neutral-800/50 px-4">
                        {!collapsed && (
                            <Link href="/" className="flex items-center gap-3 group">
                                {/* iOS 26 Liquid Glass squircle */}
                                <div className="relative flex h-10 w-10 items-center justify-center rounded-[22%] bg-gradient-to-br from-white/80 to-white/40 dark:from-white/15 dark:to-white/5 backdrop-blur-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-black/[0.06] dark:ring-white/[0.12] group-hover:ring-black/[0.12] dark:group-hover:ring-white/[0.2] group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all duration-300 overflow-hidden">
                                    <Image
                                        src="/logo.png"
                                        alt="VantageOS"
                                        width={28}
                                        height={28}
                                        className="object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-white/95">VantageOS</span>
                                    <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 tracking-[0.08em] uppercase truncate max-w-[140px] block">{orgName}</span>
                                </div>
                            </Link>
                        )}
                        {collapsed && (
                            <div className="flex h-10 w-10 items-center justify-center rounded-[22%] bg-gradient-to-br from-white/80 to-white/40 dark:from-white/15 dark:to-white/5 backdrop-blur-2xl mx-auto overflow-hidden ring-1 ring-black/[0.06] dark:ring-white/[0.12] shadow-[0_2px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
                                <Image
                                    src="/logo.png"
                                    alt="VantageOS"
                                    width={28}
                                    height={28}
                                    className="object-contain drop-shadow-sm"
                                />
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                        {/* Pulpit - top level, always visible */}
                        <NavItem
                            href="/"
                            icon={LayoutDashboard}
                            label="Pulpit"
                            active={pathname === '/'}
                            collapsed={collapsed}
                        />

                        <Separator className="my-3 bg-neutral-200 dark:bg-neutral-800/50" />

                        {/* Collapsible Categories */}
                        {Object.entries(SIDEBAR_CATEGORIES).map(([key, category]) => {
                            // While session is loading, show all items to avoid flash of empty sidebar
                            const visibleItems = (!userRole && isPending)
                                ? category.items
                                : category.items.filter(item => hasMinRole(userRole, item.minRole));
                            if (visibleItems.length === 0) return null;

                            // Collapsed mode: flat icon list
                            if (collapsed) {
                                return (
                                    <div key={key} className="space-y-0.5">
                                        {visibleItems.map((item) => (
                                            <NavItem
                                                key={item.href}
                                                href={item.href}
                                                icon={item.icon}
                                                label={item.name}
                                                active={pathname === item.href || pathname.startsWith(item.href + '/')}
                                                collapsed={collapsed}
                                                iconColor={item.color}
                                                iconBgColor={item.bgColor}
                                            />
                                        ))}
                                    </div>
                                );
                            }

                            // Expanded mode: collapsible sections
                            return (
                                <Collapsible
                                    key={key}
                                    open={openCategories[key]}
                                    onOpenChange={() => toggleCategory(key)}
                                >
                                    <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-400 transition-colors">
                                        <span className="flex items-center gap-2">
                                            <category.icon className="h-3 w-3" />
                                            {category.label}
                                        </span>
                                        <ChevronDown className={cn(
                                            "h-3 w-3 transition-transform duration-200",
                                            openCategories[key] ? "" : "-rotate-90"
                                        )} />
                                    </CollapsibleTrigger>

                                    <CollapsibleContent className="space-y-0.5">
                                        {visibleItems.map((item) => (
                                            <NavItem
                                                key={item.href}
                                                href={item.href}
                                                icon={item.icon}
                                                label={item.name}
                                                active={pathname === item.href || pathname.startsWith(item.href + '/')}
                                                collapsed={collapsed}
                                                iconColor={item.color}
                                                iconBgColor={item.bgColor}
                                            />
                                        ))}
                                    </CollapsibleContent>
                                </Collapsible>
                            );
                        })}

                        <Separator className="my-3 bg-neutral-200 dark:bg-neutral-800/50" />

                        {/* New SOP Button */}
                        <Link href="/sops/new">
                            <Button
                                variant="outline"
                                className={cn(
                                    'w-full border-dashed transition-all',
                                    'border-neutral-300 text-neutral-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600',
                                    'dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-blue-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-400',
                                    collapsed && 'px-0'
                                )}
                            >
                                <Plus className="h-4 w-4" />
                                {!collapsed && <span className="ml-2">Nowy SOP</span>}
                            </Button>
                        </Link>
                    </nav>

                    {/* Footer */}
                    <div className="border-t border-neutral-200 dark:border-neutral-800/50 p-3 space-y-2">
                        {/* AI Chat Toggle */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleChat}
                                    className={cn(
                                        'w-full justify-start gap-3 px-3 py-2.5 text-sm font-semibold transition-all relative overflow-hidden',
                                        isChatOpen
                                            ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-500 hover:to-violet-500 dark:shadow-blue-500/20'
                                            : 'bg-gradient-to-r from-blue-50 to-violet-50 text-blue-700 hover:from-blue-100 hover:to-violet-100 border border-blue-200/60 dark:from-blue-500/10 dark:to-violet-500/10 dark:text-blue-300 dark:border-blue-500/20 dark:hover:from-blue-500/20 dark:hover:to-violet-500/20',
                                        collapsed && 'justify-center px-0'
                                    )}
                                >
                                    <div className={cn(
                                        'flex h-7 w-7 items-center justify-center rounded-lg transition-colors shrink-0',
                                        isChatOpen
                                            ? 'bg-white/20'
                                            : 'bg-gradient-to-br from-blue-500 to-violet-600 shadow-sm'
                                    )}>
                                        <Sparkles className={cn(
                                            'h-4 w-4',
                                            isChatOpen
                                                ? 'text-white'
                                                : 'text-white'
                                        )} />
                                    </div>
                                    {!collapsed && <span>Czat AI</span>}
                                    {!collapsed && isChatOpen && (
                                        <div className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse shadow-sm shadow-white/50" />
                                    )}
                                    {!collapsed && !isChatOpen && (
                                        <span className="ml-auto text-[10px] font-medium opacity-60 tracking-wider">⌘/</span>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            {collapsed && (
                                <TooltipContent side="right">Czat AI (⌘/)</TooltipContent>
                            )}
                        </Tooltip>

                        {/* Collapse Toggle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCollapsed(!collapsed)}
                            className="mt-2 w-full justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:text-white dark:hover:bg-neutral-800/50"
                        >
                            {collapsed ? (
                                <ChevronRight className="h-4 w-4" />
                            ) : (
                                <ChevronLeft className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </aside>
        </TooltipProvider>
    );
}

interface NavItemProps {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active: boolean;
    collapsed: boolean;
    iconColor?: string;
    iconBgColor?: string;
}

function NavItem({ href, icon: Icon, label, active, collapsed, iconColor, iconBgColor }: NavItemProps) {
    const content = (
        <Link
            href={href}
            className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                active
                    ? 'bg-neutral-100 text-neutral-900 shadow-sm dark:bg-neutral-800/80 dark:text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-white',
                collapsed && 'justify-center px-0'
            )}
        >
            {iconBgColor ? (
                <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                    active ? iconBgColor : 'bg-neutral-100 dark:bg-neutral-800/50')}>
                    <Icon className={cn('h-4 w-4 flex-shrink-0', active ? iconColor : 'text-neutral-500 dark:text-neutral-400')} />
                </div>
            ) : (
                <Icon className={cn('h-5 w-5 flex-shrink-0', iconColor || 'text-neutral-500 dark:text-neutral-400')} />
            )}
            {!collapsed && <span>{label}</span>}
            {!collapsed && active && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />
            )}
        </Link>
    );

    if (collapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent side="right">
                    {label}
                </TooltipContent>
            </Tooltip>
        );
    }

    return content;
}
