'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

/**
 * Context Bridge API
 * Provides page context information to the AI Chat overlay
 * for context-aware conversations
 */

export interface PageContext {
    url: string;
    pathname: string;
    title: string;
    selectedText?: string;
    // VantageOS specific context
    sopId?: string;
    sopTitle?: string;
    currentSection?: string;
    pageType?: 'sop' | 'dashboard' | 'settings' | 'analytics' | 'other';
}

export interface PageMetadata {
    title: string;
    description?: string;
    breadcrumb?: string[];
}

/**
 * Capture currently selected text from the page
 */
export function captureSelection(): string | null {
    if (typeof window === 'undefined') return null;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return null;
    return selection.toString().trim() || null;
}

/**
 * Get page metadata from document
 */
export function getPageMetadata(): PageMetadata {
    if (typeof document === 'undefined') {
        return { title: 'VantageOS' };
    }

    const title = document.title || 'VantageOS';
    const metaDesc = document.querySelector('meta[name="description"]');
    const description = metaDesc?.getAttribute('content') || undefined;

    // Extract breadcrumb from pathname
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const breadcrumb = pathname
        .split('/')
        .filter(Boolean)
        .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '));

    return { title, description, breadcrumb };
}

/**
 * Detect page type from pathname
 */
function detectPageType(pathname: string): PageContext['pageType'] {
    if (pathname.startsWith('/sops')) return 'sop';
    if (pathname === '/' || pathname.startsWith('/dashboard')) return 'dashboard';
    if (pathname.startsWith('/settings')) return 'settings';
    if (pathname.startsWith('/analytics')) return 'analytics';
    return 'other';
}

/**
 * Extract SOP context from URL if on SOP page
 */
function extractSopContext(pathname: string): { sopId?: string; currentSection?: string } {
    const sopMatch = pathname.match(/\/sops\/([^/]+)/);
    if (!sopMatch) return {};

    const sopId = sopMatch[1];
    const sectionMatch = pathname.match(/\/sops\/[^/]+\/([^/]+)/);
    const currentSection = sectionMatch?.[1] || undefined;

    return { sopId, currentSection };
}

/**
 * Hook to get current page context
 * Updates automatically on navigation
 */
export function usePageContext(): PageContext {
    const pathname = usePathname();
    const [context, setContext] = useState<PageContext>({
        url: '',
        pathname: pathname || '/',
        title: 'VantageOS',
        pageType: 'other',
    });

    const updateContext = useCallback(() => {
        if (typeof window === 'undefined') return;

        const metadata = getPageMetadata();
        const pageType = detectPageType(pathname || '/');
        const sopContext = extractSopContext(pathname || '/');

        // Try to get SOP title from page h1
        let sopTitle: string | undefined;
        if (pageType === 'sop') {
            const h1 = document.querySelector('h1');
            sopTitle = h1?.textContent || undefined;
        }

        setContext({
            url: window.location.href,
            pathname: pathname || '/',
            title: metadata.title,
            selectedText: captureSelection() || undefined,
            pageType,
            sopId: sopContext.sopId,
            sopTitle,
            currentSection: sopContext.currentSection,
        });
    }, [pathname]);

    // Update on pathname change
    useEffect(() => {
        updateContext();
    }, [pathname, updateContext]);

    // Listen for selection changes
    useEffect(() => {
        const handleSelectionChange = () => {
            const selection = captureSelection();
            if (selection) {
                setContext(prev => ({ ...prev, selectedText: selection }));
            }
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, []);

    return context;
}

/**
 * Format context for AI prompt injection
 */
export function formatContextForPrompt(context: PageContext): string {
    const parts: string[] = [];

    if (context.pageType === 'sop' && context.sopTitle) {
        parts.push(`Użytkownik przegląda SOP: "${context.sopTitle}"`);
        if (context.currentSection) {
            parts.push(`Sekcja: ${context.currentSection}`);
        }
    } else if (context.pageType === 'dashboard') {
        parts.push('Użytkownik jest na stronie głównej (Dashboard)');
    } else if (context.pageType === 'analytics') {
        parts.push('Użytkownik przegląda Analytics');
    } else if (context.pageType === 'settings') {
        parts.push('Użytkownik jest w Ustawieniach');
    }

    if (context.selectedText) {
        parts.push(`Zaznaczony tekst: "${context.selectedText.slice(0, 500)}${context.selectedText.length > 500 ? '...' : ''}"`);
    }

    return parts.join('\n');
}
