'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface NavigationHistoryState {
    history: string[];
    currentIndex: number;
}

const STORAGE_KEY = 'vantage-nav-history';
const MAX_HISTORY = 50;

/**
 * Hook for managing browser-like navigation history with Back/Forward support
 */
export function useNavigationHistory() {
    const pathname = usePathname();
    const router = useRouter();
    const [state, setState] = useState<NavigationHistoryState>({
        history: [],
        currentIndex: -1,
    });

    // Load initial state from sessionStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as NavigationHistoryState;
                setState(parsed);
            }
        } catch {
            // Ignore parse errors
        }
    }, []);

    // Track navigation changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        setState((prev) => {
            // Skip if this is the same page
            if (prev.history[prev.currentIndex] === pathname) {
                return prev;
            }

            // If we're not at the end of history, we're navigating after going back
            // Truncate the forward history
            const newHistory = prev.currentIndex >= 0
                ? prev.history.slice(0, prev.currentIndex + 1)
                : [];

            // Add new entry
            newHistory.push(pathname);

            // Limit history size
            if (newHistory.length > MAX_HISTORY) {
                newHistory.shift();
            }

            const newState = {
                history: newHistory,
                currentIndex: newHistory.length - 1,
            };

            // Persist to sessionStorage
            try {
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
            } catch {
                // Ignore storage errors
            }

            return newState;
        });
    }, [pathname]);

    const canGoBack = state.currentIndex > 0;
    const canGoForward = state.currentIndex < state.history.length - 1;

    const goBack = useCallback(() => {
        if (!canGoBack) return;

        const newIndex = state.currentIndex - 1;
        const targetPath = state.history[newIndex];

        setState((prev) => ({
            ...prev,
            currentIndex: newIndex,
        }));

        // Update storage immediately
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                history: state.history,
                currentIndex: newIndex,
            }));
        } catch {
            // Ignore
        }

        router.push(targetPath);
    }, [canGoBack, state.currentIndex, state.history, router]);

    const goForward = useCallback(() => {
        if (!canGoForward) return;

        const newIndex = state.currentIndex + 1;
        const targetPath = state.history[newIndex];

        setState((prev) => ({
            ...prev,
            currentIndex: newIndex,
        }));

        // Update storage immediately
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                history: state.history,
                currentIndex: newIndex,
            }));
        } catch {
            // Ignore
        }

        router.push(targetPath);
    }, [canGoForward, state.currentIndex, state.history, router]);

    // Keyboard shortcuts
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Alt+Left = Back
            if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                goBack();
            }
            // Alt+Right = Forward
            if (e.altKey && e.key === 'ArrowRight') {
                e.preventDefault();
                goForward();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goBack, goForward]);

    return {
        canGoBack,
        canGoForward,
        goBack,
        goForward,
        historyLength: state.history.length,
        currentIndex: state.currentIndex,
    };
}
