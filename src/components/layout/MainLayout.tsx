'use client';

import { Sidebar } from './Sidebar';
import { HeaderBar } from './header-bar';
import { ChatOverlay, useChat } from '@/components/ai-chat';
import { CommandPalette } from '@/components/ui/command-palette';
import { Toaster } from '@/components/ui/sonner';

interface MainLayoutProps {
    children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const { expand } = useChat();

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
            <Sidebar />
            <main className="pl-64 transition-all duration-300">
                {/* Fixed Header Bar */}
                <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
                    <HeaderBar onOpenChat={expand} />
                </header>

                {/* Main Content */}
                <div className="min-h-[calc(100vh-3.5rem)] p-6">{children}</div>
            </main>

            {/* AI Chat Overlay - Comet-like persistent panel */}
            <ChatOverlay />

            {/* Command Palette (⌘K) */}
            <CommandPalette onOpenChat={expand} />

            {/* Toast Notifications */}
            <Toaster position="bottom-right" />
        </div>
    );
}
