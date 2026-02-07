'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Sparkles, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WidgetContainer } from './widget-container';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatWidgetProps {
    onRemove?: () => void;
    onExpand?: () => void;
}

export function ChatWidget({ onRemove, onExpand }: ChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Cześć! Jak mogę Ci dzisiaj pomóc?',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Simulated AI response - in production connect to your API
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Rozumiem. Pozwól, że to sprawdzę dla Ciebie...',
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
        <WidgetContainer
            id="chat-widget"
            title="Chat AI"
            icon={<Sparkles className="h-3.5 w-3.5" />}
            size="md"
            removable={!!onRemove}
            onRemove={onRemove}
            headerActions={
                onExpand && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onExpand}
                    >
                        <Maximize2 className="h-3.5 w-3.5" />
                    </Button>
                )
            }
            contentClassName="p-0"
        >
            {/* Messages */}
            <div className="h-48 overflow-y-auto px-4 py-2 space-y-3">
                {messages.slice(-5).map((message) => (
                    <div
                        key={message.id}
                        className={cn(
                            'flex',
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        <div
                            className={cn(
                                'rounded-xl px-3 py-2 text-sm max-w-[85%]',
                                message.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
                            )}
                        >
                            {message.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl px-3 py-2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 p-3">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Napisz wiadomość..."
                        className="flex-1 h-9 text-sm"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="h-9 w-9"
                        disabled={!input.trim() || isLoading}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </WidgetContainer>
    );
}
