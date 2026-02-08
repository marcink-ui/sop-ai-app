'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    X,
    Sparkles,
    RotateCcw,
    Maximize2,
    Minimize2,
    Bot,
    FileText,
    Target,
    TrendingUp,
    Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';
import { ContextProgressBar } from './context-progress-bar';
import { useTokenTracker } from './token-tracker-provider';
import {
    ResizableLayout,
    ResizablePanel,
    ResizeHandle,
} from '@/components/ui/resizable-layout';
import { estimateTokens } from '@/lib/ai/token-tracker';
import { ChatMessageBubble, ChatEmptyState } from './chat-message-bubble';
import { ChatComposer } from './chat-composer';
import { useAttachments, type ChatAttachment } from './chat-file-upload';
import { useModelSelector, type AIModel } from './model-selector';
import { useAssistantPicker, type SystemAgent } from './assistant-picker';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    context?: {
        currentPage?: string;
        sopTitle?: string;
        agentName?: string;
    };
}

// Suggested prompts for empty state
const SUGGESTIONS = [
    {
        icon: FileText,
        label: 'Stwórz SOP dla procesu',
        prompt: 'Pomóż mi stworzyć SOP dla procesu obsługi klienta',
        color: 'text-blue-500',
    },
    {
        icon: Target,
        label: 'Znajdź marnotrawstwa',
        prompt: 'Jakie marnotrawstwa (MUDA) mogą występować w procesie sprzedaży?',
        color: 'text-amber-500',
    },
    {
        icon: TrendingUp,
        label: 'Optymalizuj proces',
        prompt: 'Jak mogę zoptymalizować proces reklamacji?',
        color: 'text-emerald-500',
    },
    {
        icon: Lightbulb,
        label: 'Automatyzacja AI',
        prompt: 'Jakie procesy w mojej firmie można zautomatyzować za pomocą AI?',
        color: 'text-purple-500',
    },
];

export function ChatModal({ isOpen, onClose, context }: ChatModalProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [showContextPanel, setShowContextPanel] = useState(false);

    // AI Chat enhancement hooks
    const userRole = 'CITIZEN_DEV'; // TODO: Get from session
    const { attachments, addAttachments, removeAttachment, clearAttachments } = useAttachments();
    const { currentModel, handleModelChange } = useModelSelector(userRole);
    const { currentAssistant, handleAssistantSelect, getSystemPrompt } = useAssistantPicker(userRole);

    // Token tracking
    const { track, updateContextTokens } = useTokenTracker();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleSubmit = async (messageContent: string) => {
        if (!messageContent.trim() && attachments.length === 0) return;
        if (isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: messageContent,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                    context,
                    model: currentModel,
                    systemPrompt: getSystemPrompt(),
                    attachments: attachments.map((a) => ({ type: a.type, name: a.name })),
                }),
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();

            // Track token usage
            const inputTokens = estimateTokens(messageContent);
            const outputTokens = estimateTokens(data.content || '');
            track(inputTokens, outputTokens);

            // Update total context
            const totalTokens = messages.reduce((sum, m) => sum + estimateTokens(m.content), 0) + inputTokens + outputTokens;
            updateContextTokens(totalTokens);

            const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: data.content || 'Przepraszam, wystąpił błąd. Spróbuj ponownie.',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            clearAttachments();
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: 'Przepraszam, nie mogę teraz odpowiedzieć. Sprawdź ustawienia API w Settings → API Keys.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyMessage = async (content: string, messageId: string) => {
        await navigator.clipboard.writeText(content);
        setCopiedMessageId(messageId);
        toast.success('Skopiowano do schowka');
        setTimeout(() => setCopiedMessageId(null), 2000);
    };

    const handleClearChat = () => {
        setMessages([]);
    };

    const handleSuggestionClick = (prompt: string) => {
        handleSubmit(prompt);
    };

    const isEmpty = messages.length === 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={cn(
                            'fixed z-50 flex flex-col overflow-hidden',
                            'bg-white dark:bg-neutral-900',
                            'border border-neutral-200 dark:border-neutral-700',
                            'shadow-2xl shadow-neutral-900/20 dark:shadow-black/50',
                            isFullscreen
                                ? 'inset-0 rounded-none'
                                : 'inset-4 md:inset-8 lg:inset-12 xl:inset-20 rounded-2xl'
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-center gap-4">
                                {/* Logo/Avatar */}
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 shadow-lg shadow-purple-500/25">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                                        {currentAssistant?.name || 'VantageOS AI'}
                                    </h3>
                                    <p className="text-xs text-neutral-500">
                                        {currentAssistant?.description || 'Twój asystent Lean AI'}
                                    </p>
                                </div>

                                {/* Token Progress */}
                                <ContextProgressBar variant="minimal" className="ml-4 hidden sm:flex" />
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Context indicator */}
                                {(context?.sopTitle || context?.agentName) && (
                                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30">
                                        <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                            {context.sopTitle || context.agentName}
                                        </span>
                                    </div>
                                )}

                                {/* Actions */}
                                {messages.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClearChat}
                                        className="h-9 w-9 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                        title="Wyczyść czat"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="h-9 w-9 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hidden md:flex"
                                >
                                    {isFullscreen ? (
                                        <Minimize2 className="h-4 w-4" />
                                    ) : (
                                        <Maximize2 className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="h-9 w-9 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1">
                            {isEmpty ? (
                                <ChatEmptyState
                                    onSuggestionClick={handleSuggestionClick}
                                    suggestions={SUGGESTIONS}
                                />
                            ) : (
                                <div className="px-6 py-6 space-y-6">
                                    {messages.map((message) => (
                                        <ChatMessageBubble
                                            key={message.id}
                                            id={message.id}
                                            role={message.role}
                                            content={message.content}
                                            timestamp={message.timestamp}
                                            isCopied={copiedMessageId === message.id}
                                            onCopy={handleCopyMessage}
                                            agentName={
                                                message.role === 'assistant'
                                                    ? currentAssistant?.name
                                                    : undefined
                                            }
                                        />
                                    ))}

                                    {/* Loading indicator */}
                                    {isLoading && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-3"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                                                <Bot className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl rounded-bl-md px-4 py-3">
                                                <div className="flex gap-1.5">
                                                    <span
                                                        className="h-2 w-2 rounded-full bg-purple-400 animate-bounce"
                                                        style={{ animationDelay: '0ms' }}
                                                    />
                                                    <span
                                                        className="h-2 w-2 rounded-full bg-purple-400 animate-bounce"
                                                        style={{ animationDelay: '150ms' }}
                                                    />
                                                    <span
                                                        className="h-2 w-2 rounded-full bg-purple-400 animate-bounce"
                                                        style={{ animationDelay: '300ms' }}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </ScrollArea>

                        {/* Composer */}
                        <ChatComposer
                            onSubmit={handleSubmit}
                            isLoading={isLoading}
                            placeholder={
                                currentAssistant
                                    ? `Zapytaj ${currentAssistant.name}...`
                                    : 'Napisz wiadomość...'
                            }
                            attachments={attachments}
                            onAddAttachments={addAttachments}
                            onRemoveAttachment={removeAttachment}
                            currentModel={currentModel}
                            onModelChange={handleModelChange}
                            currentAssistant={currentAssistant}
                            onAssistantSelect={handleAssistantSelect}
                            userRole={userRole}
                        />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
