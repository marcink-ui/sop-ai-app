'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Send,
    Bot,
    User,
    Check,
    X,
    RefreshCw,
    Lightbulb,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { chatWithAI, type AIChatMessage } from '@/lib/ai-service';
import type { SOP } from '@/lib/types';

interface SOPChatProps {
    sop?: SOP;
    mode: 'refine' | 'create' | 'general';
    onUpdate?: (suggestion: string) => void;
    className?: string;
}

interface ChatMessage extends AIChatMessage {
    id: string;
    type: 'user' | 'assistant' | 'suggestion';
    status?: 'pending' | 'accepted' | 'rejected';
}

const suggestions = [
    'Dodaj nowy krok do procedury',
    'Zmień opis kroku 2',
    'Zasugeruj automatyzację',
    'Pokaż punkty decyzyjne',
    'Dodaj ostrzeżenie',
];

export function SOPChat({ sop, mode, onUpdate, className }: SOPChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            type: 'assistant',
            content: mode === 'refine' && sop
                ? `Cześć! Pracujemy nad procedurą "${sop.meta.process_name}". Jak mogę Ci pomóc? Możesz poprosić o dodanie kroków, edycję, lub sugestie optymalizacji.`
                : mode === 'create'
                    ? 'Cześć! Pomogę Ci stworzyć nową procedurę SOP. Opisz proces, który chcesz udokumentować.'
                    : 'Cześć! Jestem asystentem VantageOS. W czym mogę pomóc?',
            timestamp: new Date().toISOString(),
        }
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

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            type: 'user',
            content: input,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const aiMessages: AIChatMessage[] = messages
                .filter(m => m.type !== 'suggestion')
                .concat(userMessage)
                .map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp }));

            const response = await chatWithAI(aiMessages, { sop, mode });

            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                type: 'assistant',
                content: response,
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch {
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                type: 'assistant',
                content: 'Przepraszam, wystąpił błąd. Spróbuj ponownie.',
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className={cn('flex flex-col h-full bg-card/50 rounded-xl border border-border', className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-purple-500/20 p-2">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-medium text-foreground">AI Asystent</h3>
                        <p className="text-xs text-muted-foreground">
                            {mode === 'refine' ? 'Tryb edycji SOP' : mode === 'create' ? 'Tworzenie SOP' : 'Ogólny'}
                        </p>
                    </div>
                </div>
                <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                    {isLoading ? 'Odpowiadam...' : 'Online'}
                </Badge>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={cn(
                            'flex gap-3',
                            message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                        )}
                    >
                        <div className={cn(
                            'rounded-full p-2 h-8 w-8 flex items-center justify-center shrink-0',
                            message.type === 'user'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-purple-500/20 text-purple-400'
                        )}>
                            {message.type === 'user' ? (
                                <User className="h-4 w-4" />
                            ) : (
                                <Bot className="h-4 w-4" />
                            )}
                        </div>
                        <div className={cn(
                            'rounded-xl px-4 py-2 max-w-[80%]',
                            message.type === 'user'
                                ? 'bg-blue-500/10 border border-blue-500/20 text-foreground'
                                : 'bg-muted/50 border border-border text-foreground'
                        )}>
                            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                            <span className="text-[10px] text-muted-foreground mt-1 block">
                                {new Date(message.timestamp).toLocaleTimeString('pl-PL', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="rounded-full p-2 h-8 w-8 flex items-center justify-center bg-purple-500/20 text-purple-400">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="rounded-xl px-4 py-3 bg-muted/50 border border-border">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && (
                <div className="px-4 pb-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Sugestie</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.slice(0, 3).map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="text-xs px-3 py-1.5 rounded-full bg-muted/50 border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Wpisz wiadomość..."
                        className="bg-muted/30 border-border"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="bg-purple-600 hover:bg-purple-500"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
