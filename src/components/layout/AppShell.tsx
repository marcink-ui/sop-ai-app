'use client';

import { usePathname } from 'next/navigation';
import { MainLayout } from './MainLayout';

/**
 * AppShell — conditionally wraps children in MainLayout.
 * 
 * Auth pages (/auth/*) render full-screen without sidebar/header.
 * All other pages get the standard MainLayout with sidebar + header.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Auth routes should be full-screen — no sidebar, no header
    const isAuthRoute = pathname?.startsWith('/auth');

    if (isAuthRoute) {
        return <>{children}</>;
    }

    return <MainLayout>{children}</MainLayout>;
}
