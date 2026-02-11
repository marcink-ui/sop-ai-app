'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ClipboardList, Target, FolderKanban } from 'lucide-react';

const canvasTabs = [
    { name: 'AI Canvas', href: '/canvas', icon: ClipboardList },
    { name: 'Twórz Canvas', href: '/canvas/gtm', icon: Target },
    { name: 'Baza Canvas', href: '/canvas/base', icon: FolderKanban },
];

export default function CanvasLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div>
            {/* Tab Navigation */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 mb-6">
                <nav className="flex items-center gap-1 -mb-px" aria-label="Canvas tabs">
                    {canvasTabs.map((tab) => {
                        const isActive = tab.href === '/canvas'
                            ? pathname === '/canvas'
                            : pathname.startsWith(tab.href);
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                                    isActive
                                        ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                                        : "text-neutral-500 dark:text-neutral-400 border-transparent hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600"
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Content */}
            {children}
        </div>
    );
}
