'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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
    MessageSquare,
    ChevronRight,
    History,
    PanelRightClose,
    Minus,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { useChat, type ChatOverlayMode, type Message } from './chat-provider';
import { formatContextForPrompt } from '@/lib/ai/context-bridge';
import { ContextProgressBar } from './context-progress-bar';
import { useTokenTracker } from './token-tracker-provider';
import { estimateTokens } from '@/lib/ai/token-tracker';
import { ChatFileUpload, AttachmentPreviewList, useAttachments } from './chat-file-upload';
import { useModelSelector } from './model-selector';
import { AssistantPicker, useAssistantPicker } from './assistant-picker';
import { ChatHistorySidebar } from './chat-history-sidebar';

// Suggested prompts for empty state
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

const MIN_WIDTH = 320;
const MAX_WIDTH = 600;
const COMPACT_WIDTH = 60;

export function ChatOverlay() {
    const {
        mode,
        setMode,
        expand,
        minimize,
        hide,
        messages,
        setMessages,
        addMessage,
        clearMessages,
        panelWidth,
        setPanelWidth,
        pageContext,
    } = useChat();

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // AI Chat enhancement hooks
    const userRole = 'CITIZEN_DEV';
    const { clearAttachments } = useAttachments();
    const { currentModel } = useModelSelector(userRole);
    const { getSystemPrompt } = useAssistantPicker(userRole);
    const { track } = useTokenTracker();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const resizeRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Focus input when expanded
    useEffect(() => {
        if (mode === 'expanded' && textareaRef.current) {
            setTimeout(() => textareaRef.current?.focus(), 300);
        }
    }, [mode]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // ⌘/ or Ctrl+/ to toggle
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault();
                setMode(mode === 'hidden' || mode === 'minimized' ? 'expanded' : 'hidden');
            }
            // ESC to minimize when expanded
            if (e.key === 'Escape' && mode === 'expanded') {
                minimize();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mode, setMode, minimize]);

    // Resize handling
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !panelRef.current) return;
            const panelRect = panelRef.current.getBoundingClientRect();
            const newWidth = panelRect.right - e.clientX;
            setPanelWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth)));
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, setPanelWidth]);

    const handleSubmit = async (messageContent?: string) => {
        const content = messageContent || input.trim();
        if (!content || isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date(),
        };

        addMessage(userMessage);
        setInput('');
        clearAttachments();
        setIsLoading(true);

        try {
            // Build context-aware system message
            const contextInfo = formatContextForPrompt(pageContext);
            const systemMessage = contextInfo
                ? `${getSystemPrompt()}\n\nKontekst strony:\n${contextInfo}`
                : getSystemPrompt();

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: systemMessage },
                        ...messages.map((m) => ({ role: m.role, content: m.content })),
                        { role: 'user', content },
                    ],
                    model: currentModel,
                }),
            });

            if (!response.ok) throw new Error('Failed to get AI response');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantContent = '';

            const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: '',
                timestamp: new Date(),
            };
            addMessage(assistantMessage);

            while (reader) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;
                        try {
                            const parsed = JSON.parse(data);
                            const delta = parsed.choices?.[0]?.delta?.content || '';
                            assistantContent += delta;
                            setMessages((prev) =>
                                prev.map((m) =>
                                    m.id === assistantMessage.id
                                        ? { ...m, content: assistantContent }
                                        : m
                                )
                            );
                        } catch {
                            // Skip invalid JSON
                        }
                    }
                }
            }

            // Track tokens
            const inputTokens = estimateTokens(content);
            const outputTokens = estimateTokens(assistantContent);
            track(inputTokens, outputTokens);
        } catch (error) {
            toast.error('Nie udało się uzyskać odpowiedzi AI');
            console.error('Chat error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyMessage = (content: string, messageId: string) => {
        navigator.clipboard.writeText(content);
        setCopiedMessageId(messageId);
        toast.success('Skopiowano do schowka');
        setTimeout(() => setCopiedMessageId(null), 2000);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    };

    const isEmpty = messages.length === 0;
    const lastMessage = messages[messages.length - 1];

    // Minimized FAB button
    if (mode === 'minimized') {
        return (
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={expand}
                className={cn(
                    'fixed bottom-6 right-6 z-50',
                    'flex h-14 w-14 items-center justify-center',
                    'rounded-full shadow-lg',
                    'bg-gradient-to-br from-blue-500 to-purple-600',
                    'text-white hover:shadow-xl',
                    'transition-shadow duration-200'
                )}
            >
                <MessageSquare className="h-6 w-6" />
                {messages.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
                        {messages.filter((m) => m.role === 'assistant').length}
                    </span>
                )}
            </motion.button>
        );
    }

    // Hidden state
    if (mode === 'hidden') {
        return null;
    }

    // Compact bar
    if (mode === 'compact') {
        return (
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className={cn(
                    'fixed right-0 top-0 z-50 h-full',
                    'flex flex-col items-center py-4',
                    'border-l border-neutral-200 dark:border-neutral-800',
                    'bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm',
                    'shadow-lg'
                )}
                style={{ width: COMPACT_WIDTH }}
            >
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={expand}
                    className="mb-4"
                    title="Rozwiń czat"
                >
                    <ChevronRight className="h-5 w-5 rotate-180" />
                </Button>
                <div className="flex-1 flex flex-col items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    {messages.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {messages.length}
                        </Badge>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={minimize}
                    className="mt-auto"
                    title="Minimalizuj"
                >
                    <Minus className="h-4 w-4" />
                </Button>
            </motion.div>
        );
    }

    // Expanded panel
    return (
        <AnimatePresence>
            <motion.div
                ref={panelRef}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className={cn(
                    'fixed right-0 top-0 z-50 h-full',
                    'flex flex-col',
                    'border-l border-neutral-200 dark:border-neutral-800',
                    'bg-white dark:bg-neutral-950',
                    'shadow-2xl'
                )}
                style={{ width: panelWidth }}
            >
                {/* Resize handle */}
                <div
                    ref={resizeRef}
                    onMouseDown={() => setIsResizing(true)}
                    className={cn(
                        'absolute left-0 top-0 bottom-0 w-1 cursor-col-resize',
                        'hover:bg-blue-500/50 transition-colors',
                        isResizing && 'bg-blue-500'
                    )}
                />

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
                                {pageContext.pageType === 'sop'
                                    ? `SOP: ${pageContext.sopTitle || 'Edycja'}`
                                    : 'Twój asystent Lean AI'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowHistory(!showHistory)}
                            className="h-8 w-8 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                            title="Historia"
                        >
                            <History className="h-4 w-4" />
                        </Button>
                        {messages.length > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={clearMessages}
                                className="h-8 w-8 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                title="Wyczyść czat"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMode('compact')}
                            className="h-8 w-8 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                            title="Zwiń"
                        >
                            <PanelRightClose className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={hide}
                            className="h-8 w-8 text-neutral-400 hover:text-red-500"
                            title="Zamknij (⌘/)"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Context indicator */}
                {pageContext.selectedText && (
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/30">
                        <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                            📝 Zaznaczony tekst: &quot;{pageContext.selectedText.slice(0, 50)}...&quot;
                        </p>
                    </div>
                )}

                {/* Messages */}
                <ScrollArea className="flex-1 px-4 py-4">
                    {isEmpty ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="mb-6">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                                    <Bot className="h-8 w-8 text-blue-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Jak mogę Ci pomóc?
                                </h3>
                                <p className="text-sm text-neutral-500 mt-1">
                                    Jestem Twoim asystentem Lean AI
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                                {SUGGESTED_PROMPTS.map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSubmit(item.prompt)}
                                        className="flex items-center gap-2 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-left"
                                    >
                                        <item.icon className={cn('h-4 w-4', item.color)} />
                                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        'flex gap-3',
                                        message.role === 'user' && 'flex-row-reverse'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                                            message.role === 'user'
                                                ? 'bg-blue-500'
                                                : 'bg-gradient-to-br from-purple-500 to-blue-500'
                                        )}
                                    >
                                        {message.role === 'user' ? (
                                            <User className="h-4 w-4 text-white" />
                                        ) : (
                                            <Bot className="h-4 w-4 text-white" />
                                        )}
                                    </div>
                                    <div
                                        className={cn(
                                            'flex-1 rounded-lg px-3 py-2',
                                            message.role === 'user'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-neutral-100 dark:bg-neutral-800'
                                        )}
                                    >
                                        {message.role === 'assistant' ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {message.content || '...'}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="text-sm">{message.content}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs opacity-60">
                                                {formatTime(message.timestamp)}
                                            </span>
                                            {message.role === 'assistant' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleCopyMessage(message.content, message.id)
                                                    }
                                                    className="h-6 w-6"
                                                >
                                                    {copiedMessageId === message.id ? (
                                                        <Check className="h-3 w-3 text-green-500" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </ScrollArea>

                {/* Input */}
                <div className="border-t border-neutral-100 dark:border-neutral-800 px-4 py-3">
                    <div className="flex gap-2">
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            placeholder="Napisz wiadomość..."
                            disabled={isLoading}
                            className="min-h-[44px] max-h-32 resize-none"
                            rows={1}
                        />
                        <Button
                            onClick={() => handleSubmit()}
                            disabled={!input.trim() || isLoading}
                            className="shrink-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-neutral-400 mt-2 text-center">
                        ⌘/ aby toggle • ESC aby zwinąć
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
