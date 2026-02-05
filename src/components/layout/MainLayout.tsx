'use client';

import { Sidebar } from './Sidebar';

interface MainLayoutProps {
    children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
            <Sidebar />
            <main className="pl-64 transition-all duration-300">
                <div className="min-h-screen p-6">{children}</div>
            </main>
        </div>
    );
}
