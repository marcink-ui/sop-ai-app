'use client';

import { Sidebar } from './Sidebar';
import { HeaderBar } from './header-bar';
import { ChatOverlay } from '@/components/ai-chat';
import { useChat } from '@/components/ai-chat/chat-provider';
import { CommandPalette } from '@/components/ui/command-palette';
import { Toaster } from '@/components/ui/sonner';

interface MainLayoutProps {
    children: React.ReactNode;
}

/**
 * MainLayout — flex-based layout with integrated side chat panel.
 * 
 * The chat panel is part of the flex flow (not a fixed overlay),
 * so the main content reflows when the panel opens/closes —
 * similar to VS Code's terminal/sidebar behavior.
 */
export function MainLayout({ children }: MainLayoutProps) {
    const { expand, mode, dockSide } = useChat();

    // Chat panel should be in the flex flow when expanded or compact
    const showInlineChat = mode === 'expanded' || mode === 'compact';

    return (
        <div className="h-screen flex overflow-hidden bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Main content area with optional chat panel */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Fixed Header Bar */}
                <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
                    <HeaderBar onOpenChat={expand} />
                </header>

                {/* Content + Chat Panel flex row */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left-docked chat panel */}
                    {showInlineChat && dockSide === 'left' && (
                        <ChatOverlay inline />
                    )}

                    {/* Main Content — scrollable */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="min-h-[calc(100vh-3.5rem)] p-6">
                            {children}
                        </div>
                    </div>

                    {/* Right-docked chat panel */}
                    {showInlineChat && dockSide === 'right' && (
                        <ChatOverlay inline />
                    )}
                </div>
            </div>

            {/* Minimized/hidden chat - render as FAB overlay outside the flex flow */}
            {!showInlineChat && <ChatOverlay />}

            {/* Command Palette (⌘K) */}
            <CommandPalette onOpenChat={expand} />

            {/* Toast Notifications */}
            <Toaster position="bottom-right" />
        </div>
    );
}
