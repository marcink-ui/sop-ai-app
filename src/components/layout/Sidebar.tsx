'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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
    Settings,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Command,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/theme-toggle';

const databases = [
    { name: 'SOPs', href: '/sops', icon: FileText, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-500/20' },
    { name: 'AI Agents', href: '/agents', icon: Bot, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-500/20' },
    { name: 'MUDA Reports', href: '/muda', icon: Search, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-500/20' },
    { name: 'Roles Registry', href: '/roles', icon: Users, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-500/20' },
    { name: 'Value Chain', href: '/value-chain', icon: GitBranch, color: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-100 dark:bg-cyan-500/20' },
    { name: 'Council', href: '/council', icon: Scale, color: 'text-amber-600 dark:text-yellow-400', bgColor: 'bg-amber-100 dark:bg-yellow-500/20' },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

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
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                <div className="relative flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-16 items-center justify-between border-b border-neutral-200 dark:border-neutral-800/50 px-4">
                        {!collapsed && (
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
                                    <Sparkles className="h-5 w-5 text-white" />
                                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <span className="font-semibold text-neutral-900 dark:text-white tracking-tight">SOP-AI</span>
                            </Link>
                        )}
                        {collapsed && (
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 mx-auto">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Quick Search Hint */}
                    {!collapsed && (
                        <div className="mx-3 mt-3">
                            <button className="w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors border-neutral-200 bg-neutral-50 text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-500 dark:hover:text-neutral-400 dark:hover:border-neutral-700">
                                <Search className="h-4 w-4" />
                                <span className="flex-1 text-left">Quick search...</span>
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
                            label="Dashboard"
                            active={pathname === '/'}
                            collapsed={collapsed}
                        />

                        <Separator className="my-4 bg-neutral-200 dark:bg-neutral-800/50" />

                        {/* Databases Section */}
                        {!collapsed && (
                            <span className="mb-2 block px-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-600">
                                Databases
                            </span>
                        )}

                        {databases.map((db) => (
                            <NavItem
                                key={db.href}
                                href={db.href}
                                icon={db.icon}
                                label={db.name}
                                active={pathname === db.href || pathname.startsWith(db.href + '/')}
                                collapsed={collapsed}
                                iconColor={db.color}
                                iconBgColor={db.bgColor}
                            />
                        ))}

                        <Separator className="my-4 bg-neutral-200 dark:bg-neutral-800/50" />

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
                                {!collapsed && <span className="ml-2">New SOP</span>}
                            </Button>
                        </Link>
                    </nav>

                    {/* Footer */}
                    <div className="border-t border-neutral-200 dark:border-neutral-800/50 p-3 space-y-2">
                        {/* Theme Toggle */}
                        <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between px-2")}>
                            {!collapsed && <span className="text-sm text-neutral-500 dark:text-neutral-400">Theme</span>}
                            <ThemeToggle />
                        </div>

                        <NavItem
                            href="/settings"
                            icon={Settings}
                            label="Settings"
                            active={pathname === '/settings'}
                            collapsed={collapsed}
                        />

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
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                    ? 'bg-neutral-100 text-neutral-900 shadow-sm dark:bg-neutral-800/80 dark:text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-white',
                collapsed && 'justify-center px-0'
            )}
        >
            {iconBgColor ? (
                <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                    active ? iconBgColor : 'bg-neutral-100 dark:bg-neutral-800/50 group-hover:' + iconBgColor)}>
                    <Icon className={cn('h-4 w-4 flex-shrink-0', active ? iconColor : 'text-neutral-500 dark:text-neutral-400 group-hover:' + iconColor)} />
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
                <TooltipContent side="right" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border-neutral-200 dark:border-neutral-800">
                    {label}
                </TooltipContent>
            </Tooltip>
        );
    }

    return content;
}
