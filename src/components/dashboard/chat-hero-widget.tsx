'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Send,
    Loader2,
    Maximize2,
    MessageSquare,
    Wand2,
    FileText,
    Bot,
    Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatHeroWidgetProps {
    onOpenFullChat?: () => void;
    className?: string;
}

const QUICK_SUGGESTIONS = [
    { label: 'Znajdź SOP', icon: FileText, prompt: 'Pokaż mi najnowsze procedury SOP' },
    { label: 'Utwórz agenta', icon: Bot, prompt: 'Pomóż mi stworzyć nowego AI agenta' },
    { label: 'Analiza MUDA', icon: Search, prompt: 'Przeprowadź analizę marnotrawstwa' },
];

export function ChatHeroWidget({ onOpenFullChat, className }: ChatHeroWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Witaj! 👋 Jestem Twoim asystentem AI. Jak mogę Ci dzisiaj pomóc w transformacji procesów?',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (customPrompt?: string) => {
        const messageContent = customPrompt || input.trim();
        if (!messageContent || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: messageContent,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Simulated AI response - in production connect to your API
            await new Promise((resolve) => setTimeout(resolve, 1200));

            const responses = [
                'Rozumiem. Pozwól, że przeanalizuję to dla Ciebie...',
                'Świetne pytanie! Sprawdzam bazę wiedzy VantageOS...',
                'Już sprawdzam. Mam kilka propozycji dla Ciebie...',
            ];

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responses[Math.floor(Math.random() * responses.length)],
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                'relative overflow-hidden rounded-2xl border backdrop-blur-sm',
                'border-neutral-200 dark:border-neutral-800',
                'bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30',
                'dark:from-neutral-900 dark:via-blue-950/20 dark:to-purple-950/20',
                className
            )}
        >
            {/* Animated gradient background */}
            <motion.div
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"
            />

            {/* Header */}
            <div className="relative flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800/50">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25"
                    >
                        <Sparkles className="h-5 w-5 text-white" />
                    </motion.div>
                    <div>
                        <h2 className="font-semibold text-neutral-900 dark:text-white">
                            Asystent AI
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Twój partner w transformacji
                        </p>
                    </div>
                </div>
                {onOpenFullChat && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onOpenFullChat}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Maximize2 className="h-4 w-4 mr-1" />
                        Pełny chat
                    </Button>
                )}
            </div>

            {/* Messages */}
            <div className="h-56 overflow-y-auto px-5 py-4 space-y-3">
                <AnimatePresence mode="popLayout">
                    {messages.slice(-6).map((message, index) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                'flex',
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            <div
                                className={cn(
                                    'rounded-2xl px-4 py-2.5 text-sm max-w-[85%]',
                                    message.role === 'user'
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                                        : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-100 dark:border-neutral-700 shadow-sm'
                                )}
                            >
                                {message.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                    >
                        <div className="bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                <span className="text-sm text-neutral-500">Myślę...</span>
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-5 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                    {QUICK_SUGGESTIONS.map((suggestion) => (
                        <motion.button
                            key={suggestion.label}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSend(suggestion.prompt)}
                            disabled={isLoading}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
                                'bg-neutral-100/80 dark:bg-neutral-800/80',
                                'text-neutral-600 dark:text-neutral-300',
                                'hover:bg-blue-100 hover:text-blue-700',
                                'dark:hover:bg-blue-900/30 dark:hover:text-blue-300',
                                'transition-colors disabled:opacity-50'
                            )}
                        >
                            <suggestion.icon className="h-3 w-3" />
                            {suggestion.label}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Input */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 p-4">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-3"
                >
                    <div className="relative flex-1">
                        <MessageSquare className={cn(
                            'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors',
                            isFocused ? 'text-blue-500' : 'text-neutral-400'
                        )} />
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Zapytaj o cokolwiek..."
                            className={cn(
                                'pl-10 h-11 rounded-xl',
                                'bg-neutral-50 dark:bg-neutral-800/50',
                                'border-neutral-200 dark:border-neutral-700',
                                'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                                'transition-all'
                            )}
                            disabled={isLoading}
                        />
                    </div>
                    <Button
                        type="submit"
                        size="icon"
                        className={cn(
                            'h-11 w-11 rounded-xl',
                            'bg-gradient-to-r from-blue-600 to-blue-500',
                            'hover:from-blue-500 hover:to-blue-400',
                            'shadow-lg shadow-blue-500/25',
                            'transition-all hover:shadow-blue-500/40'
                        )}
                        disabled={!input.trim() || isLoading}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </motion.div>
    );
}
