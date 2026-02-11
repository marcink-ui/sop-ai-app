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
    PanelLeftClose,
    Minus,
    ArrowLeftRight,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { useChat, type ChatOverlayMode, type Message } from './chat-provider';
import { useTokenTracker } from './token-tracker-provider';
import { estimateTokens } from '@/lib/ai/token-tracker';
import { ChatFileUpload, AttachmentPreviewList, useAttachments } from './chat-file-upload';
import { useModelSelector } from './model-selector';
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
const MAX_WIDTH = 800;
const COMPACT_WIDTH = 60;

interface ChatOverlayProps {
    /** When true, renders as an inline flex child (side-by-side with content).
     *  When false/omitted, renders as a fixed overlay (minimized FAB). */
    inline?: boolean;
}

export function ChatOverlay({ inline = false }: ChatOverlayProps) {
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
        dockSide,
        toggleDock,
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
            let newWidth: number;
            if (dockSide === 'right') {
                newWidth = panelRect.right - e.clientX;
            } else {
                newWidth = e.clientX - panelRect.left;
            }
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
    }, [isResizing, setPanelWidth, dockSide]);

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
            // Build page context for the API
            const contextPayload = {
                currentPage: pageContext.pathname,
                sopTitle: pageContext.sopTitle,
                agentName: undefined as string | undefined,
                pageType: pageContext.pageType,
            };

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        ...messages.map((m) => ({ role: m.role, content: m.content })),
                        { role: 'user', content },
                    ],
                    context: contextPayload,
                    model: currentModel,
                }),
            });

            if (!response.ok) throw new Error('Failed to get AI response');

            const data = await response.json();
            const assistantContent = data.content || 'Brak odpowiedzi.';

            // Build response with source badges
            let displayContent = assistantContent;
            if (data.wikiSources && data.wikiSources.length > 0) {
                const sourceBadges = data.wikiSources
                    .map((s: { title: string; link: string }) => `[📚 ${s.title}](${s.link})`)
                    .join(' • ');
                displayContent += `\n\n---\n🔗 Źródła: ${sourceBadges}`;
            }

            const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: displayContent,
                timestamp: new Date(),
            };
            addMessage(assistantMessage);

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

    // ── Non-inline mode: Only render the minimized FAB ──
    if (!inline) {
        if (mode !== 'minimized') return null;
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
                <Sparkles className="h-6 w-6" />
                {messages.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
                        {messages.filter((m) => m.role === 'assistant').length}
                    </span>
                )}
            </motion.button>
        );
    }

    // ── Inline mode: Compact bar with predefined areas ──
    if (mode === 'compact') {
        const quickAreas = [
            { icon: '📋', label: 'SOPs', prompt: 'Pokaż listę SOPów w mojej organizacji' },
            { icon: '📚', label: 'Wiki', prompt: 'Pokaż artykuły z Wiki' },
            { icon: '🤖', label: 'Agenci', prompt: 'Pokaż agentów AI' },
            { icon: '📦', label: 'Zasoby', prompt: 'Pokaż zasoby organizacji' },
        ];
        return (
            <div
                className={cn(
                    'h-full flex flex-col items-center py-4 shrink-0',
                    'border-neutral-200 dark:border-neutral-800',
                    'bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm',
                    dockSide === 'right' ? 'border-l' : 'border-r'
                )}
                style={{ width: COMPACT_WIDTH }}
            >
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={expand}
                    className="mb-3"
                    title="Rozwiń czat"
                >
                    <ChevronRight className={cn('h-5 w-5', dockSide === 'right' && 'rotate-180')} />
                </Button>
                <div className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 cursor-pointer hover:shadow-lg hover:shadow-blue-500/30 transition-shadow" onClick={expand}>
                        <Sparkles className="h-5 w-5 text-white" />
                        {messages.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
                                {messages.filter(m => m.role === 'assistant').length}
                            </span>
                        )}
                    </div>
                    <div className="w-8 h-px bg-neutral-200 dark:bg-neutral-800 my-1" />
                    {quickAreas.map((area) => (
                        <button
                            key={area.label}
                            onClick={() => {
                                expand();
                                // Small delay to let panel expand before sending
                                setTimeout(() => {
                                    const event = new CustomEvent('chat:quick-prompt', { detail: area.prompt });
                                    window.dispatchEvent(event);
                                }, 300);
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                            title={area.label}
                        >
                            {area.icon}
                        </button>
                    ))}
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
            </div>
        );
    }

    // ── Inline mode: Expanded panel (side-by-side) ──
    const resizeHandle = (
        <div
            ref={resizeRef}
            onMouseDown={() => setIsResizing(true)}
            className={cn(
                'absolute top-0 bottom-0 w-1.5 cursor-col-resize z-10',
                'hover:bg-blue-500/50 active:bg-blue-500 transition-colors',
                isResizing && 'bg-blue-500',
                dockSide === 'right' ? 'left-0' : 'right-0'
            )}
        />
    );

    return (
        <div
            ref={panelRef}
            className={cn(
                'relative h-full flex flex-col shrink-0',
                'border-neutral-200 dark:border-neutral-800',
                'bg-white dark:bg-neutral-950',
                dockSide === 'right' ? 'border-l' : 'border-r'
            )}
            style={{ width: panelWidth }}
        >
            {/* Resize handle */}
            {resizeHandle}

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800/50 shrink-0">
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
                    {/* Dock toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleDock}
                        className="h-8 w-8 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                        title={dockSide === 'right' ? 'Zadokuj po lewej' : 'Zadokuj po prawej'}
                    >
                        <ArrowLeftRight className="h-4 w-4" />
                    </Button>
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
                        {dockSide === 'right' ? (
                            <PanelRightClose className="h-4 w-4" />
                        ) : (
                            <PanelLeftClose className="h-4 w-4" />
                        )}
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
                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/30 shrink-0">
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
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    a: ({ href, children }) => {
                                                        const isInternal = href?.startsWith('/');
                                                        return (
                                                            <a
                                                                href={href}
                                                                onClick={(e) => {
                                                                    if (isInternal && href) {
                                                                        e.preventDefault();
                                                                        window.location.href = href;
                                                                    }
                                                                }}
                                                                target={isInternal ? undefined : '_blank'}
                                                                rel={isInternal ? undefined : 'noopener noreferrer'}
                                                                className="text-violet-500 hover:text-violet-400 underline underline-offset-2 decoration-violet-500/30 hover:decoration-violet-400/60 transition-colors font-medium"
                                                            >
                                                                {children}
                                                                {!isInternal && (
                                                                    <span className="inline-block ml-0.5 text-[0.65em] align-super">↗</span>
                                                                )}
                                                            </a>
                                                        );
                                                    },
                                                }}
                                            >
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
            <div className="border-t border-neutral-100 dark:border-neutral-800 px-4 py-3 shrink-0">
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
                    ⌘/ aby toggle • ESC aby zwinąć • ↔ aby zmienić stronę
                </p>
            </div>
        </div>
    );
}
