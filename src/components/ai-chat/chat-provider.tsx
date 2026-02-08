'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usePageContext, type PageContext } from '@/lib/ai/context-bridge';

/**
 * Chat Overlay Modes
 * - expanded: Full panel (320-600px)
 * - compact: Narrow bar with last message preview
 * - minimized: Only floating button
 * - hidden: Completely hidden
 */
export type ChatOverlayMode = 'expanded' | 'compact' | 'minimized' | 'hidden';

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

interface ChatState {
    mode: ChatOverlayMode;
    messages: Message[];
    panelWidth: number;
    sessionId: string | null;
}

interface ChatContextValue {
    // Legacy API (backwards compatible)
    isOpen: boolean;
    openChat: () => void;
    closeChat: () => void;
    toggleChat: () => void;
    context: PageContext;
    setContext: (ctx: Partial<PageContext>) => void;

    // New Overlay API
    mode: ChatOverlayMode;
    setMode: (mode: ChatOverlayMode) => void;
    expand: () => void;
    compact: () => void;
    minimize: () => void;
    hide: () => void;

    // Session persistence
    messages: Message[];
    setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
    addMessage: (message: Message) => void;
    clearMessages: () => void;

    // Panel sizing
    panelWidth: number;
    setPanelWidth: (width: number) => void;

    // Page context
    pageContext: PageContext;
}

const STORAGE_KEY = 'vantage-chat-state';
const DEFAULT_WIDTH = 400;
const MIN_WIDTH = 320;
const MAX_WIDTH = 600;

const ChatContext = createContext<ChatContextValue | null>(null);

/**
 * Load persisted state from localStorage
 */
function loadPersistedState(): Partial<ChatState> {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Restore messages with Date objects
            if (parsed.messages) {
                parsed.messages = parsed.messages.map((m: Message & { timestamp: string }) => ({
                    ...m,
                    timestamp: new Date(m.timestamp),
                }));
            }
            return parsed;
        }
    } catch (e) {
        console.warn('Failed to load chat state:', e);
    }
    return {};
}

/**
 * Save state to localStorage
 */
function persistState(state: Partial<ChatState>) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to persist chat state:', e);
    }
}

export function ChatProvider({ children }: { children: ReactNode }) {
    // Load initial state from localStorage
    const [initialized, setInitialized] = useState(false);
    const [mode, setModeState] = useState<ChatOverlayMode>('hidden');
    const [messages, setMessagesState] = useState<Message[]>([]);
    const [panelWidth, setPanelWidthState] = useState(DEFAULT_WIDTH);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [legacyContext, setLegacyContext] = useState<Partial<PageContext>>({});

    // Get live page context from bridge
    const pageContext = usePageContext();

    // Hydrate from localStorage on mount
    useEffect(() => {
        const stored = loadPersistedState();
        if (stored.mode) setModeState(stored.mode);
        if (stored.messages) setMessagesState(stored.messages);
        if (stored.panelWidth) setPanelWidthState(stored.panelWidth);
        if (stored.sessionId) setSessionId(stored.sessionId);
        setInitialized(true);
    }, []);

    // Persist to localStorage on changes
    useEffect(() => {
        if (!initialized) return;
        persistState({
            mode,
            messages,
            panelWidth,
            sessionId,
        });
    }, [mode, messages, panelWidth, sessionId, initialized]);

    // Mode setters
    const setMode = useCallback((newMode: ChatOverlayMode) => {
        setModeState(newMode);
    }, []);

    const expand = useCallback(() => setModeState('expanded'), []);
    const compact = useCallback(() => setModeState('compact'), []);
    const minimize = useCallback(() => setModeState('minimized'), []);
    const hide = useCallback(() => setModeState('hidden'), []);

    // Message management
    const setMessages = useCallback((update: Message[] | ((prev: Message[]) => Message[])) => {
        setMessagesState(prev => typeof update === 'function' ? update(prev) : update);
    }, []);

    const addMessage = useCallback((message: Message) => {
        setMessagesState(prev => [...prev, message]);
    }, []);

    const clearMessages = useCallback(() => {
        setMessagesState([]);
        setSessionId(null);
    }, []);

    // Panel width with bounds
    const setPanelWidth = useCallback((width: number) => {
        const bounded = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width));
        setPanelWidthState(bounded);
    }, []);

    // Legacy API compatibility
    const isOpen = mode === 'expanded' || mode === 'compact';
    const openChat = useCallback(() => setModeState('expanded'), []);
    const closeChat = useCallback(() => setModeState('hidden'), []);
    const toggleChat = useCallback(() => {
        setModeState(prev => prev === 'hidden' || prev === 'minimized' ? 'expanded' : 'hidden');
    }, []);

    // Merge legacy context with page context
    const context: PageContext = {
        ...pageContext,
        ...legacyContext,
    };

    const setContext = useCallback((ctx: Partial<PageContext>) => {
        setLegacyContext(prev => ({ ...prev, ...ctx }));
    }, []);

    return (
        <ChatContext.Provider
            value={{
                // Legacy API
                isOpen,
                openChat,
                closeChat,
                toggleChat,
                context,
                setContext,

                // New Overlay API
                mode,
                setMode,
                expand,
                compact,
                minimize,
                hide,

                // Session
                messages,
                setMessages,
                addMessage,
                clearMessages,

                // Panel
                panelWidth,
                setPanelWidth,

                // Context
                pageContext,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChat(): ChatContextValue {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}

// Export types
export type { PageContext };
