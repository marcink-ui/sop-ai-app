'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    X,
    Send,
    Sparkles,
    Loader2,
    User,
    Bot,
    RotateCcw,
    Copy,
    Check,
    Lightbulb,
    FileText,
    Target,
    TrendingUp,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { ContextProgressBar } from './context-progress-bar';
import { useTokenTracker } from './token-tracker-provider';
import { estimateTokens } from '@/lib/ai/token-tracker';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    context?: {
        currentPage?: string;
        sopTitle?: string;
        agentName?: string;
    };
}

// Suggested prompts - client-centric, actionable
const SUGGESTED_PROMPTS = [
    {
        icon: FileText,
        label: 'Stwórz SOP',
        prompt: 'Pomóż mi stworzyć SOP dla procesu obsługi klienta',
        color: 'text-blue-500',
    },
    {
        icon: Target,
        label: 'Znajdź MUDA',
        prompt: 'Jakie marnotrawstwa (MUDA) mogą występować w procesie sprzedaży?',
        color: 'text-amber-500',
    },
    {
        icon: TrendingUp,
        label: 'Optymalizuj',
        prompt: 'Jak mogę zoptymalizować proces reklamacji?',
        color: 'text-emerald-500',
    },
    {
        icon: Lightbulb,
        label: 'AI pomysły',
        prompt: 'Jakie procesy w mojej firmie można zautomatyzować za pomocą AI?',
        color: 'text-purple-500',
    },
];

export function ChatPanel({ isOpen, onClose, context }: ChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

    // Token tracking
    const { track, updateContextTokens } = useTokenTracker();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen && textareaRef.current) {
            setTimeout(() => textareaRef.current?.focus(), 300);
        }
    }, [isOpen]);

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

    const handleSubmit = async (messageContent?: string) => {
        const content = messageContent || input.trim();
        if (!content || isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
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
                }),
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();

            // Track token usage (estimate)
            const inputTokens = estimateTokens(content);
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

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
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

    const handleSuggestedPrompt = (prompt: string) => {
        handleSubmit(prompt);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    };

    // Check if this is empty state (no messages)
    const isEmpty = messages.length === 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className={cn(
                            'fixed right-0 top-0 z-50 h-full w-full max-w-md',
                            'flex flex-col',
                            'border-l border-neutral-200 dark:border-neutral-800',
                            'bg-white dark:bg-neutral-950',
                            'shadow-2xl'
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800/50">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm">
                                    <Sparkles className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">
                                        VantageOS AI
                                    </h3>
                                    <p className="text-xs text-neutral-500">
                                        Twój asystent Lean AI
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {messages.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClearChat}
                                        className="h-8 w-8 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                        title="Wyczyść czat"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="h-8 w-8 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Token Progress Bar */}
                            <ContextProgressBar variant="minimal" className="ml-2" />
                        </div>

                        {/* Context Banner */}
                        {(context?.sopTitle || context?.agentName) && (
                            <div className="px-4 py-2 bg-blue-50/50 dark:bg-blue-500/5 border-b border-blue-100 dark:border-blue-500/10">
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    <span className="font-medium">Kontekst:</span>{' '}
                                    {context.sopTitle || context.agentName}
                                </p>
                            </div>
                        )}

                        {/* Messages Area */}
                        <ScrollArea className="flex-1">
                            {isEmpty ? (
                                // Empty State - Onboarding
                                <div className="flex flex-col items-center justify-center h-full px-6 py-8">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-4">
                                        <Sparkles className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                                        Witaj w VantageOS AI!
                                    </h4>
                                    <p className="text-sm text-neutral-500 text-center mb-6 max-w-xs">
                                        Mogę pomóc Ci tworzyć SOPy, analizować procesy i znajdować
                                        możliwości optymalizacji z AI.
                                    </p>

                                    {/* Suggested Prompts */}
                                    <div className="w-full space-y-2">
                                        <p className="text-xs text-neutral-400 text-center mb-3">
                                            Zacznij od jednego z tych tematów:
                                        </p>
                                        {SUGGESTED_PROMPTS.map((suggestion, index) => (
                                            <motion.button
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => handleSuggestedPrompt(suggestion.prompt)}
                                                className={cn(
                                                    'w-full flex items-center gap-3 p-3 rounded-xl',
                                                    'bg-neutral-50 dark:bg-neutral-900/50',
                                                    'border border-neutral-200 dark:border-neutral-800',
                                                    'hover:bg-neutral-100 dark:hover:bg-neutral-800/50',
                                                    'hover:border-neutral-300 dark:hover:border-neutral-700',
                                                    'transition-all duration-200 text-left group'
                                                )}
                                            >
                                                <suggestion.icon className={cn('h-4 w-4', suggestion.color)} />
                                                <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white">
                                                    {suggestion.label}
                                                </span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                // Messages List
                                <div className="px-4 py-4 space-y-4">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                'flex gap-3',
                                                message.role === 'user' && 'flex-row-reverse'
                                            )}
                                        >
                                            {/* Avatar */}
                                            <div
                                                className={cn(
                                                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                                                    message.role === 'user'
                                                        ? 'bg-blue-500'
                                                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                                                )}
                                            >
                                                {message.role === 'user' ? (
                                                    <User className="h-3.5 w-3.5 text-white" />
                                                ) : (
                                                    <Bot className="h-3.5 w-3.5 text-white" />
                                                )}
                                            </div>

                                            {/* Message Content */}
                                            <div className={cn('max-w-[85%] group', message.role === 'user' && 'flex flex-col items-end')}>
                                                <div
                                                    className={cn(
                                                        'rounded-2xl px-4 py-2.5 relative',
                                                        message.role === 'user'
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100'
                                                    )}
                                                >
                                                    {message.role === 'user' ? (
                                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                                    ) : (
                                                        <div className="text-sm prose prose-sm dark:prose-invert prose-p:m-0 prose-p:leading-relaxed prose-headings:mt-2 prose-headings:mb-1 prose-ul:m-0 prose-ol:m-0 prose-li:m-0 max-w-none">
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {message.content}
                                                            </ReactMarkdown>
                                                        </div>
                                                    )}

                                                    {/* Copy button for assistant messages */}
                                                    {message.role === 'assistant' && (
                                                        <button
                                                            onClick={() => handleCopyMessage(message.content, message.id)}
                                                            className={cn(
                                                                'absolute -right-8 top-1/2 -translate-y-1/2',
                                                                'opacity-0 group-hover:opacity-100 transition-opacity',
                                                                'p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                                            )}
                                                        >
                                                            {copiedMessageId === message.id ? (
                                                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                            ) : (
                                                                <Copy className="h-3.5 w-3.5 text-neutral-400" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Timestamp */}
                                                <span className={cn(
                                                    'text-[10px] mt-1 px-1',
                                                    message.role === 'user'
                                                        ? 'text-neutral-400'
                                                        : 'text-neutral-400'
                                                )}>
                                                    {formatTime(message.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Loading indicator */}
                                    {isLoading && (
                                        <div className="flex gap-3">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                                                <Bot className="h-3.5 w-3.5 text-white" />
                                            </div>
                                            <div className="bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl px-4 py-3">
                                                <div className="flex gap-1.5">
                                                    <span className="h-2 w-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="h-2 w-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="h-2 w-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="border-t border-neutral-100 dark:border-neutral-800/50 p-4">
                            <form onSubmit={handleFormSubmit} className="flex gap-2">
                                <Textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Napisz wiadomość..."
                                    className={cn(
                                        'min-h-[44px] max-h-[120px] resize-none text-sm rounded-xl',
                                        'bg-neutral-50 dark:bg-neutral-900',
                                        'border-neutral-200 dark:border-neutral-800',
                                        'focus:border-blue-500 dark:focus:border-blue-500',
                                        'placeholder:text-neutral-400'
                                    )}
                                    disabled={isLoading}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim() || isLoading}
                                    className={cn(
                                        'shrink-0 h-11 w-11 rounded-xl',
                                        'bg-blue-500 hover:bg-blue-600',
                                        'disabled:bg-neutral-200 dark:disabled:bg-neutral-800',
                                        'transition-colors'
                                    )}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </form>
                            <p className="mt-2 text-[10px] text-neutral-400 text-center">
                                Enter aby wysłać • Shift+Enter nowa linia • ESC zamknij
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
