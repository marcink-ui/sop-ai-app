'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
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
} from 'lucide-react';
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

// Role hierarchy for access control
const ROLE_HIERARCHY = ['EMPLOYEE', 'CITIZEN_DEV', 'MANAGER', 'PILOT', 'SPONSOR'];

const hasMinRole = (userRole: string | undefined, minRole: string): boolean => {
    if (!userRole) return false;
    const userIndex = ROLE_HIERARCHY.indexOf(userRole);
    const minIndex = ROLE_HIERARCHY.indexOf(minRole);
    return userIndex >= minIndex;
};

interface NavItemData {
    name: string;
    href: string;
    icon: any;
    color: string;
    bgColor: string;
    minRole: string;
}

// Category definitions with items
const SIDEBAR_CATEGORIES = {
    databases: {
        label: 'Bazy Danych',
        icon: FolderOpen,
        defaultOpen: true,
        items: [
            { name: 'SOPs', href: '/sops', icon: FileText, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-500/20', minRole: 'EMPLOYEE' },
            { name: 'Agenci AI', href: '/agents', icon: Bot, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-500/20', minRole: 'EMPLOYEE' },
            { name: 'Raporty MUDA', href: '/muda', icon: Search, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-500/20', minRole: 'EMPLOYEE' },
            { name: 'Rejestr Ról', href: '/roles', icon: Users, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-500/20', minRole: 'EMPLOYEE' },
            { name: 'Ontologia', href: '/ontology', icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-500/20', minRole: 'EMPLOYEE' },
        ] as NavItemData[],
    },
    visualizations: {
        label: 'Wizualizacje',
        icon: Network,
        defaultOpen: true,
        items: [
            { name: 'Łańcuch Wartości', href: '/value-chain', icon: GitBranch, color: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-100 dark:bg-cyan-500/20', minRole: 'EMPLOYEE' },
            { name: 'Graf Wiedzy', href: '/knowledge-graph', icon: Network, color: 'text-pink-600 dark:text-pink-400', bgColor: 'bg-pink-100 dark:bg-pink-500/20', minRole: 'EMPLOYEE' },
            { name: 'AI Canvas', href: '/canvas', icon: BarChart3, color: 'text-sky-600 dark:text-sky-400', bgColor: 'bg-sky-100 dark:bg-sky-500/20', minRole: 'MANAGER' },
        ] as NavItemData[],
    },
    tools: {
        label: 'Narzędzia',
        icon: Calculator,
        defaultOpen: true,
        items: [
            { name: 'Kalkulator ROI', href: '/roi-calculator', icon: Calculator, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-500/20', minRole: 'MANAGER' },
            { name: 'Zadania', href: '/tasks', icon: LayoutDashboard, color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-100 dark:bg-rose-500/20', minRole: 'EMPLOYEE' },
            { name: 'Pandy 🐼', href: '/pandas', icon: Users, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-500/20', minRole: 'EMPLOYEE' },
            { name: 'Gamification 🎮', href: '/gamification', icon: Trophy, color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-100 dark:bg-rose-500/20', minRole: 'EMPLOYEE' },
        ] as NavItemData[],
    },
    resources: {
        label: 'Zasoby',
        icon: Library,
        defaultOpen: true,
        items: [
            { name: 'Resources', href: '/resources', icon: BookOpen, color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-100 dark:bg-violet-500/20', minRole: 'EMPLOYEE' },
            { name: 'Wiki', href: '/resources/wiki', icon: Library, color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-100 dark:bg-indigo-500/20', minRole: 'EMPLOYEE' },
            { name: 'Newsletter', href: '/resources/newsletter', icon: Newspaper, color: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-100 dark:bg-teal-500/20', minRole: 'EMPLOYEE' },
            { name: 'System Prompts', href: '/resources/prompts', icon: Code2, color: 'text-slate-600 dark:text-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-500/20', minRole: 'CITIZEN_DEV' },
        ] as NavItemData[],
    },
    management: {
        label: 'Zarządzanie',
        icon: Settings2,
        defaultOpen: false,
        items: [
            { name: 'Historia AI', href: '/chat-library', icon: MessageSquare, color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-100 dark:bg-indigo-500/20', minRole: 'CITIZEN_DEV' },
            { name: 'Rada', href: '/council', icon: Scale, color: 'text-amber-600 dark:text-yellow-400', bgColor: 'bg-amber-100 dark:bg-yellow-500/20', minRole: 'CITIZEN_DEV' },
            { name: 'Backoffice', href: '/backoffice', icon: Settings2, color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-100 dark:bg-violet-500/20', minRole: 'CITIZEN_DEV' },
        ] as NavItemData[],
    },
};

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { toggleChat, isOpen: isChatOpen } = useChat();
    const { data: session } = useSession();
    const userRole = session?.user?.role;

    // State for category expansion
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
        databases: true,
        visualizations: true,
        tools: true,
        resources: true,
        management: false,
    });

    const toggleCategory = (key: string) => {
        setOpenCategories(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    'fixed left-0 top-0 z-40 h-screen border-r transition-all duration-300 ease-in-out',
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
                                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-semibold text-neutral-900 dark:text-white tracking-tight">VantageOS</span>
                            </Link>
                        )}
                        {collapsed && (
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 mx-auto">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Quick Search */}
                    {!collapsed && (
                        <div className="mx-3 mt-3">
                            <button className="w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors border-neutral-200 bg-neutral-50 text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-500 dark:hover:text-neutral-400 dark:hover:border-neutral-700">
                                <Search className="h-4 w-4" />
                                <span className="flex-1 text-left">Szybkie wyszukiwanie...</span>
                                <kbd className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                    <Command className="h-3 w-3" />K
                                </kbd>
                            </button>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                        {/* Dashboard */}
                        <NavItem
                            href="/"
                            icon={LayoutDashboard}
                            label="Pulpit"
                            active={pathname === '/'}
                            collapsed={collapsed}
                        />
                        <NavItem
                            href="/analytics"
                            icon={BarChart3}
                            label="Analityka"
                            active={pathname === '/analytics'}
                            collapsed={collapsed}
                            iconColor="text-violet-600 dark:text-violet-400"
                            iconBgColor="bg-violet-100 dark:bg-violet-500/20"
                        />

                        <Separator className="my-3 bg-neutral-200 dark:bg-neutral-800/50" />

                        {/* Collapsible Categories */}
                        {Object.entries(SIDEBAR_CATEGORIES).map(([key, category]) => {
                            const visibleItems = category.items.filter(item => hasMinRole(userRole, item.minRole));
                            if (visibleItems.length === 0) return null;

                            return (
                                <Collapsible
                                    key={key}
                                    open={!collapsed && openCategories[key]}
                                    onOpenChange={() => !collapsed && toggleCategory(key)}
                                >
                                    {!collapsed ? (
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
                                    ) : null}

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
                                        'w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium transition-all',
                                        isChatOpen
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-white',
                                        collapsed && 'justify-center px-0'
                                    )}
                                >
                                    <div className={cn(
                                        'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                                        isChatOpen
                                            ? 'bg-blue-200 dark:bg-blue-500/30'
                                            : 'bg-neutral-100 dark:bg-neutral-800/50'
                                    )}>
                                        <MessageSquare className={cn(
                                            'h-4 w-4',
                                            isChatOpen
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-neutral-500 dark:text-neutral-400'
                                        )} />
                                    </div>
                                    {!collapsed && <span>Czat AI</span>}
                                    {!collapsed && isChatOpen && (
                                        <div className="ml-auto h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            {collapsed && (
                                <TooltipContent side="right">Czat AI</TooltipContent>
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
