'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, Command, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AICommandInputProps {
    onSubmit?: (message: string) => void;
    onOpenFullChat?: () => void;
    placeholder?: string;
    className?: string;
}

const QUICK_ACTIONS = [
    { icon: Zap, label: 'Utwórz nowy SOP', prompt: 'Pomóż mi stworzyć nowy SOP dla procesu...' },
    { icon: Command, label: 'Znajdź procedurę', prompt: 'Znajdź procedury dotyczące...' },
    { icon: ArrowRight, label: 'Generuj agenta', prompt: 'Wygeneruj AI agenta dla SOP...' },
];

export function AICommandInput({ onSubmit, onOpenFullChat, placeholder = 'Zapytaj AI o cokolwiek...', className }: AICommandInputProps) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        setIsLoading(true);
        try {
            if (onSubmit) {
                await onSubmit(input.trim());
            } else if (onOpenFullChat) {
                onOpenFullChat();
            }
        } finally {
            setIsLoading(false);
            setInput('');
        }
    };

    const handleQuickAction = (prompt: string) => {
        setInput(prompt);
        inputRef.current?.focus();
    };

    return (
        <div className={cn('space-y-3', className)}>
            {/* Main Input */}
            <motion.form
                onSubmit={handleSubmit}
                initial={false}
                animate={{
                    boxShadow: isFocused
                        ? '0 0 0 2px rgba(59, 130, 246, 0.5), 0 4px 20px rgba(59, 130, 246, 0.15)'
                        : '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}
                className={cn(
                    'relative flex items-center gap-3 rounded-2xl border px-4 py-3',
                    'bg-white dark:bg-neutral-900',
                    'border-neutral-200 dark:border-neutral-700',
                    'transition-colors duration-200',
                    isFocused && 'border-blue-400 dark:border-blue-500'
                )}
            >
                <motion.div
                    animate={{
                        rotate: isLoading ? 360 : 0,
                        scale: isFocused ? 1.1 : 1,
                    }}
                    transition={{
                        rotate: { duration: 2, repeat: isLoading ? Infinity : 0, ease: 'linear' },
                        scale: { duration: 0.2 },
                    }}
                    className="flex-shrink-0"
                >
                    <Sparkles className={cn(
                        'h-5 w-5 transition-colors',
                        isFocused ? 'text-blue-500' : 'text-neutral-400'
                    )} />
                </motion.div>

                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    disabled={isLoading}
                    className={cn(
                        'flex-1 bg-transparent border-0 outline-none',
                        'text-neutral-900 dark:text-white',
                        'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                        'text-base'
                    )}
                />

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="send"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            <Button
                                type="submit"
                                size="icon"
                                variant="ghost"
                                disabled={!input.trim()}
                                className={cn(
                                    'h-8 w-8 rounded-xl transition-all',
                                    input.trim()
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'text-neutral-400'
                                )}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.form>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
                {QUICK_ACTIONS.map((action, index) => (
                    <motion.button
                        key={action.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        onClick={() => handleQuickAction(action.prompt)}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
                            'bg-neutral-100 dark:bg-neutral-800',
                            'text-neutral-600 dark:text-neutral-400',
                            'hover:bg-neutral-200 dark:hover:bg-neutral-700',
                            'hover:text-neutral-900 dark:hover:text-white',
                            'transition-colors duration-150'
                        )}
                    >
                        <action.icon className="h-3 w-3" />
                        {action.label}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
