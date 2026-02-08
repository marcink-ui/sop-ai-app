'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User, Bot, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageBubbleProps {
    readonly id: string;
    readonly role: 'user' | 'assistant' | 'system';
    readonly content: string;
    readonly timestamp: Date;
    readonly isStreaming?: boolean;
    readonly isCopied?: boolean;
    readonly onCopy?: (content: string, id: string) => void;
    readonly agentName?: string;
    readonly agentIcon?: React.ReactNode;
}

export const ChatMessageBubble = memo(function ChatMessageBubble({
    id,
    role,
    content,
    timestamp,
    isStreaming = false,
    isCopied = false,
    onCopy,
    agentName,
    agentIcon,
}: ChatMessageBubbleProps) {
    const isUser = role === 'user';

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
                'flex gap-3 w-full',
                isUser ? 'flex-row-reverse' : 'flex-row'
            )}
        >
            {/* Avatar */}
            <div
                className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm',
                    isUser
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : 'bg-gradient-to-br from-violet-500 to-purple-600'
                )}
            >
                {isUser ? (
                    <User className="h-4 w-4 text-white" />
                ) : agentIcon ? (
                    agentIcon
                ) : (
                    <Bot className="h-4 w-4 text-white" />
                )}
            </div>

            {/* Message Content */}
            <div
                className={cn(
                    'flex flex-col max-w-[75%]',
                    isUser ? 'items-end' : 'items-start'
                )}
            >
                {/* Agent name (for assistant) */}
                {!isUser && agentName && (
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1 ml-1">
                        {agentName}
                    </span>
                )}

                {/* Bubble */}
                <div
                    className={cn(
                        'relative px-4 py-3 rounded-2xl shadow-sm',
                        isUser
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                            : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-bl-md'
                    )}
                >
                    {/* Streaming indicator */}
                    {isStreaming && (
                        <div className="absolute -top-1 -right-1">
                            <Sparkles className="h-3.5 w-3.5 text-purple-500 animate-pulse" />
                        </div>
                    )}

                    {/* Content */}
                    <div
                        className={cn(
                            'prose prose-sm max-w-none',
                            isUser
                                ? 'prose-invert'
                                : 'dark:prose-invert',
                            'prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5',
                            'prose-code:bg-black/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs',
                            isUser && 'prose-code:bg-white/20',
                            'prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-700 prose-pre:rounded-lg prose-pre:my-2',
                            'text-sm leading-relaxed'
                        )}
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Metadata row */}
                <div
                    className={cn(
                        'flex items-center gap-2 mt-1 px-1',
                        isUser ? 'flex-row-reverse' : 'flex-row'
                    )}
                >
                    <span className="text-[10px] text-neutral-400">
                        {formatTime(timestamp)}
                    </span>

                    {/* Copy button (assistant messages only) */}
                    {!isUser && onCopy && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onCopy(content, id)}
                        >
                            {isCopied ? (
                                <Check className="h-3 w-3 text-green-500" />
                            ) : (
                                <Copy className="h-3 w-3 text-neutral-400" />
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

// Empty state hero component
export function ChatEmptyState({
    onSuggestionClick,
    suggestions,
}: {
    onSuggestionClick: (prompt: string) => void;
    suggestions: Array<{
        icon: React.ComponentType<{ className?: string }>;
        label: string;
        prompt: string;
        color: string;
    }>;
}) {
    return (
        <div className="flex flex-col items-center justify-center h-full px-8 py-12">
            {/* Hero Avatar */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="relative mb-6"
            >
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 shadow-xl shadow-purple-500/25">
                    <Bot className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-neutral-800 border-2 border-white dark:border-neutral-800 shadow-md">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                </div>
            </motion.div>

            {/* Title */}
            <motion.h3
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold text-neutral-900 dark:text-white mb-2"
            >
                Cześć! Jestem VantageOS AI
            </motion.h3>

            {/* Subtitle */}
            <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-neutral-500 dark:text-neutral-400 text-center max-w-md mb-8"
            >
                Pomogę Ci tworzyć SOPy, analizować procesy, znajdować MUDA
                i optymalizować pracę z wykorzystaniem AI.
            </motion.p>

            {/* Suggestion Cards */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-3 w-full max-w-lg"
            >
                {suggestions.map((suggestion, index) => (
                    <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 + index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSuggestionClick(suggestion.prompt)}
                        className={cn(
                            'flex flex-col items-start gap-2 p-4 rounded-xl',
                            'bg-white dark:bg-neutral-800/50',
                            'border border-neutral-200 dark:border-neutral-700',
                            'hover:border-neutral-300 dark:hover:border-neutral-600',
                            'hover:shadow-md hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50',
                            'transition-all duration-200 text-left group'
                        )}
                    >
                        <suggestion.icon className={cn('h-5 w-5', suggestion.color)} />
                        <span className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-200">
                            {suggestion.label}
                        </span>
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
}
