'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    X,
    Send,
    Sparkles,
    Loader2,
    User,
    Bot,
    Minimize2,
    Maximize2,
    RotateCcw,
    GripVertical,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

export function ChatPanel({ isOpen, onClose, context }: ChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'system-1',
            role: 'system',
            content: 'Witaj w VantageOS AI Assistant! Mogę pomóc Ci w tworzeniu SOPów, analizie procesów biznesowych, lub odpowiem na pytania dotyczące metodologii Lean AI.',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Window dimensions and position
    const [width, setWidth] = useState(420);
    const [height, setHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
    const [position, setPosition] = useState({ x: 0, y: 0 }); // Will be calculated on mount
    const [isMaximized, setIsMaximized] = useState(false);
    const [isDocked, setIsDocked] = useState(true); // Start docked to right edge

    // Drag and resize states
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isResizingLeft, setIsResizingLeft] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // Initialize position to right edge (docked mode)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const viewportHeight = window.innerHeight;
            setHeight(viewportHeight);
            setPosition({
                x: window.innerWidth - width,
                y: 0,
            });
        }
    }, []);

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

    // Drag logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && !isMaximized) {
                const newX = e.clientX - dragOffset.x;
                const newY = e.clientY - dragOffset.y;

                // Keep window within viewport bounds
                const maxX = window.innerWidth - width;
                const maxY = window.innerHeight - height;

                setPosition({
                    x: Math.max(0, Math.min(newX, maxX)),
                    y: Math.max(0, Math.min(newY, maxY)),
                });
            }

            if (isResizing && !isMaximized) {
                const newWidth = e.clientX - position.x;
                const newHeight = e.clientY - position.y;

                // Min/max constraints
                if (newWidth >= 350 && newWidth <= 900) {
                    setWidth(newWidth);
                }
                if (newHeight >= 400 && newHeight <= window.innerHeight - 40) {
                    setHeight(newHeight);
                }
            }

            // Left-edge resize (resize + reposition)
            if (isResizingLeft && !isMaximized) {
                const deltaX = e.clientX - position.x;
                const newWidth = width - deltaX;

                if (newWidth >= 350 && newWidth <= 900) {
                    setWidth(newWidth);
                    setPosition(prev => ({ ...prev, x: e.clientX }));
                }
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            setIsResizingLeft(false);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };

        if (isDragging || isResizing || isResizingLeft) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, isResizingLeft, dragOffset, position, width, height, isMaximized]);

    const startDragging = (e: React.MouseEvent) => {
        if (isMaximized) return;
        e.preventDefault();

        // Undock when starting to drag
        if (isDocked) {
            setIsDocked(false);
            setHeight(Math.min(600, window.innerHeight - 100));
        }

        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
        document.body.style.cursor = 'grabbing';
    };

    const startResizing = (e: React.MouseEvent) => {
        if (isMaximized) return;
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        document.body.style.cursor = 'nwse-resize';
    };

    const startResizingLeft = (e: React.MouseEvent) => {
        if (isMaximized) return;
        e.preventDefault();
        e.stopPropagation();

        // Undock when resizing
        if (isDocked) {
            setIsDocked(false);
            setHeight(Math.min(600, window.innerHeight - 100));
        }

        setIsResizingLeft(true);
        document.body.style.cursor = 'ew-resize';
    };

    const toggleMaximize = () => {
        setIsMaximized(prev => !prev);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input.trim(),
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleClearChat = () => {
        setMessages([
            {
                id: 'system-1',
                role: 'system',
                content: 'Czat wyczyszczony. W czym mogę pomóc?',
                timestamp: new Date(),
            },
        ]);
    };

    if (!isOpen) return null;

    return (
        <div
            ref={panelRef}
            className={cn(
                'fixed z-50 flex flex-col shadow-2xl rounded-xl overflow-hidden',
                'border border-neutral-200 dark:border-neutral-700',
                'bg-white dark:bg-neutral-900',
                isMaximized && 'rounded-none',
                isDragging && 'cursor-grabbing',
            )}
            style={{
                left: isMaximized ? 0 : position.x,
                top: isMaximized ? 0 : position.y,
                width: isMaximized ? '100vw' : width,
                height: isMaximized ? '100vh' : height,
                transition: isDragging || isResizing ? 'none' : 'box-shadow 0.2s',
            }}
        >
            {/* Header - Drag Handle */}
            <div
                className={cn(
                    'flex items-center justify-between px-3 py-2 shrink-0',
                    'bg-gradient-to-r from-blue-600 to-purple-600',
                    'cursor-grab active:cursor-grabbing select-none',
                )}
                onMouseDown={startDragging}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <GripVertical className="h-4 w-4 text-white/70 shrink-0" />
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">
                            VantageOS AI
                        </h3>
                    </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClearChat}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="text-white/80 hover:text-white hover:bg-white/20 h-7 w-7"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMaximize}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="text-white/80 hover:text-white hover:bg-white/20 h-7 w-7"
                    >
                        {isMaximized ? (
                            <Minimize2 className="h-3.5 w-3.5" />
                        ) : (
                            <Maximize2 className="h-3.5 w-3.5" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="text-white/80 hover:text-white hover:bg-red-500/80 h-7 w-7"
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* Context Banner */}
            {(context?.sopTitle || context?.agentName) && (
                <div className="border-b border-neutral-200 dark:border-neutral-700 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 shrink-0">
                    <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                        <span className="font-medium">Kontekst: </span>
                        {context.sopTitle || context.agentName}
                    </p>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={cn(
                            'flex gap-2',
                            message.role === 'user' && 'flex-row-reverse'
                        )}
                    >
                        {/* Avatar */}
                        <div
                            className={cn(
                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                                message.role === 'user'
                                    ? 'bg-neutral-200 dark:bg-neutral-700'
                                    : 'bg-gradient-to-br from-blue-500 to-purple-600'
                            )}
                        >
                            {message.role === 'user' ? (
                                <User className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-300" />
                            ) : (
                                <Bot className="h-3.5 w-3.5 text-white" />
                            )}
                        </div>

                        {/* Message */}
                        <div
                            className={cn(
                                'max-w-[85%] rounded-xl px-3 py-2',
                                message.role === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
                            )}
                        >
                            {message.role === 'user' ? (
                                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            ) : (
                                <div className="text-sm prose prose-sm dark:prose-invert prose-p:m-0 prose-p:leading-relaxed prose-headings:mt-2 prose-headings:mb-1 prose-ul:m-0 prose-ol:m-0 prose-li:m-0 prose-pre:my-2 prose-code:px-1 prose-code:py-0.5 prose-code:bg-neutral-200 prose-code:dark:bg-neutral-700 prose-code:rounded max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                            <p
                                className={cn(
                                    'mt-1 text-[10px]',
                                    message.role === 'user'
                                        ? 'text-blue-200'
                                        : 'text-neutral-400 dark:text-neutral-500'
                                )}
                            >
                                {message.timestamp.toLocaleTimeString('pl-PL', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                            <Bot className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl px-3 py-2">
                            <div className="flex gap-1">
                                <span className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-neutral-200 dark:border-neutral-700 p-3 shrink-0 bg-neutral-50 dark:bg-neutral-800/50">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Napisz wiadomość..."
                        className={cn(
                            'min-h-[40px] max-h-[100px] resize-none text-sm',
                            'bg-white border-neutral-200 focus:border-blue-500',
                            'dark:bg-neutral-900 dark:border-neutral-600 dark:focus:border-blue-500'
                        )}
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || isLoading}
                        className="shrink-0 bg-blue-500 hover:bg-blue-600 text-white w-10 h-10"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </div>

            {/* Left-edge Resize Handle */}
            {!isMaximized && (
                <div
                    className="absolute left-0 top-0 w-1 h-full cursor-ew-resize hover:bg-blue-500/50 transition-colors"
                    onMouseDown={startResizingLeft}
                />
            )}

            {/* Resize Handle (bottom-right corner) */}
            {!isMaximized && (
                <div
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
                    onMouseDown={startResizing}
                >
                    <svg
                        className="w-4 h-4 text-neutral-400"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z" />
                    </svg>
                </div>
            )}
        </div>
    );
}

