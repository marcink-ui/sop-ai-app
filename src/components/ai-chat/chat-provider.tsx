'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContext {
    currentPage?: string;
    sopTitle?: string;
    agentName?: string;
}

interface ChatContextValue {
    isOpen: boolean;
    openChat: () => void;
    closeChat: () => void;
    toggleChat: () => void;
    context: ChatContext;
    setContext: (ctx: ChatContext) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [context, setContext] = useState<ChatContext>({});

    const openChat = () => setIsOpen(true);
    const closeChat = () => setIsOpen(false);
    const toggleChat = () => setIsOpen((prev) => !prev);

    return (
        <ChatContext.Provider
            value={{
                isOpen,
                openChat,
                closeChat,
                toggleChat,
                context,
                setContext,
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
