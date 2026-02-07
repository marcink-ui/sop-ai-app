'use client';

import * as React from 'react';

export type ThemeStyle = 'linear' | 'notion' | 'hero';

interface ThemeStyleContextType {
    themeStyle: ThemeStyle;
    setThemeStyle: (style: ThemeStyle) => void;
}

const ThemeStyleContext = React.createContext<ThemeStyleContextType | undefined>(undefined);

interface ThemeColors {
    accent: string;
    accentHover: string;
    bgPrimary: string;
    bgSecondary: string;
    textPrimary: string;
    borderColor: string;
    radius: string;
}

export const THEME_STYLES: Record<ThemeStyle, {
    name: string;
    description: string;
    preview: string;
    dark: ThemeColors;
    light: ThemeColors;
}> = {
    linear: {
        name: 'Linear',
        description: 'Minimalistyczny, czysty design inspirowany Linear.app',
        preview: '🔷',
        dark: {
            accent: '#5e6ad2',
            accentHover: '#4f5bc4',
            bgPrimary: '#000000',
            bgSecondary: '#1a1a1f',
            textPrimary: '#f5f5f5',
            borderColor: 'rgba(255,255,255,0.1)',
            radius: '6px',
        },
        light: {
            accent: '#5e6ad2',
            accentHover: '#4f5bc4',
            bgPrimary: '#ffffff',
            bgSecondary: '#f8f9fa',
            textPrimary: '#1a1a1f',
            borderColor: 'rgba(0,0,0,0.1)',
            radius: '6px',
        },
    },
    notion: {
        name: 'Notion',
        description: 'Ciepły, blokowy styl inspirowany Notion',
        preview: '📝',
        dark: {
            accent: '#eb5757',
            accentHover: '#d64545',
            bgPrimary: '#191919',
            bgSecondary: '#252525',
            textPrimary: '#e0e0e0',
            borderColor: 'rgba(255,255,255,0.1)',
            radius: '3px',
        },
        light: {
            accent: '#eb5757',
            accentHover: '#d64545',
            bgPrimary: '#ffffff',
            bgSecondary: '#f7f6f3',
            textPrimary: '#37352f',
            borderColor: 'rgba(55,53,47,0.16)',
            radius: '3px',
        },
    },
    hero: {
        name: 'Hero',
        description: 'Żywy, gradientowy design z efektami neonu',
        preview: '🎨',
        dark: {
            accent: '#8b5cf6',
            accentHover: '#7c3aed',
            bgPrimary: '#0a0a0f',
            bgSecondary: '#12121a',
            textPrimary: '#ffffff',
            borderColor: 'rgba(139,92,246,0.2)',
            radius: '12px',
        },
        light: {
            accent: '#7c3aed',
            accentHover: '#6d28d9',
            bgPrimary: '#fafafa',
            bgSecondary: '#f3f0ff',
            textPrimary: '#1a1a2e',
            borderColor: 'rgba(124,58,237,0.15)',
            radius: '12px',
        },
    },
};

const STORAGE_KEY = 'vantageos-theme-style';

function getSystemDarkMode(): boolean {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getCurrentDarkMode(): boolean {
    if (typeof document === 'undefined') return true;
    return document.documentElement.classList.contains('dark');
}

export function ThemeStyleProvider({ children }: { children: React.ReactNode }) {
    const [themeStyle, setThemeStyleState] = React.useState<ThemeStyle>('linear');
    const [mounted, setMounted] = React.useState(false);

    // Load saved theme on mount
    React.useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as ThemeStyle | null;
        if (saved && THEME_STYLES[saved]) {
            setThemeStyleState(saved);
        }
        setMounted(true);
    }, []);

    // Apply theme CSS variables when style changes or dark mode toggles
    React.useEffect(() => {
        if (!mounted) return;

        const applyTheme = () => {
            const isDark = getCurrentDarkMode();
            const style = THEME_STYLES[themeStyle];
            const colors = isDark ? style.dark : style.light;
            const root = document.documentElement;

            // Set data attribute for CSS selectors
            root.setAttribute('data-theme-style', themeStyle);

            // Apply CSS variables
            root.style.setProperty('--theme-accent', colors.accent);
            root.style.setProperty('--theme-accent-hover', colors.accentHover);
            root.style.setProperty('--theme-bg-primary', colors.bgPrimary);
            root.style.setProperty('--theme-bg-secondary', colors.bgSecondary);
            root.style.setProperty('--theme-text-primary', colors.textPrimary);
            root.style.setProperty('--theme-border', colors.borderColor);
            root.style.setProperty('--theme-radius', colors.radius);
        };

        // Initial apply
        applyTheme();

        // Listen for class changes on html element (dark mode toggle)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    applyTheme();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        // Listen for system preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => applyTheme();
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, [themeStyle, mounted]);

    const setThemeStyle = React.useCallback((style: ThemeStyle) => {
        setThemeStyleState(style);
        localStorage.setItem(STORAGE_KEY, style);
    }, []);

    return (
        <ThemeStyleContext.Provider value={{ themeStyle, setThemeStyle }}>
            {children}
        </ThemeStyleContext.Provider>
    );
}

export function useThemeStyle() {
    const context = React.useContext(ThemeStyleContext);
    if (context === undefined) {
        throw new Error('useThemeStyle must be used within ThemeStyleProvider');
    }
    return context;
}

// Helper to get colors for preview (used in settings page)
export function getThemePreviewColors(style: ThemeStyle, isDark: boolean = true): ThemeColors {
    return isDark ? THEME_STYLES[style].dark : THEME_STYLES[style].light;
}
