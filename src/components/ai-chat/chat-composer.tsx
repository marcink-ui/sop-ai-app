'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Send,
    Loader2,
    Paperclip,
    AtSign,
    Hash,
    Mic,
    StopCircle,
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChatFileUpload, AttachmentPreview, type ChatAttachment } from './chat-file-upload';
import { ModelSelector, type AIModel } from './model-selector';
import { AssistantPicker, type SystemAgent } from './assistant-picker';

interface ChatComposerProps {
    readonly onSubmit: (message: string) => void;
    readonly isLoading?: boolean;
    readonly placeholder?: string;
    readonly attachments: ChatAttachment[];
    readonly onAddAttachments: (attachments: ChatAttachment[]) => void;
    readonly onRemoveAttachment: (id: string) => void;
    readonly currentModel: string;
    readonly onModelChange: (model: AIModel) => void;
    readonly currentAssistant: SystemAgent | null;
    readonly onAssistantSelect: (agent: SystemAgent) => void;
    readonly userRole: string;
    readonly disabled?: boolean;
}

export function ChatComposer({
    onSubmit,
    isLoading = false,
    placeholder = 'Napisz wiadomość...',
    attachments,
    onAddAttachments,
    onRemoveAttachment,
    currentModel,
    onModelChange,
    currentAssistant,
    onAssistantSelect,
    userRole,
    disabled = false,
}: ChatComposerProps) {
    const [input, setInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleSubmit = useCallback(() => {
        const trimmed = input.trim();
        if ((trimmed || attachments.length > 0) && !isLoading && !disabled) {
            onSubmit(trimmed);
            setInput('');
        }
    }, [input, attachments.length, isLoading, disabled, onSubmit]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }, [handleSubmit]);

    const canSubmit = (input.trim().length > 0 || attachments.length > 0) && !isLoading && !disabled;

    return (
        <div className="border-t border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl">
            {/* Attachment previews */}
            <AnimatePresence>
                {attachments.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pt-3 pb-1"
                    >
                        <div className="flex flex-wrap gap-2">
                            {attachments.map((attachment) => (
                                <AttachmentPreview
                                    key={attachment.id}
                                    attachment={attachment}
                                    onRemove={onRemoveAttachment}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main composer area */}
            <div className="p-4">
                <div
                    className={cn(
                        'relative flex flex-col rounded-2xl border transition-all duration-200',
                        isFocused
                            ? 'border-purple-300 dark:border-purple-600 ring-2 ring-purple-100 dark:ring-purple-900/30'
                            : 'border-neutral-200 dark:border-neutral-700',
                        disabled && 'opacity-50'
                    )}
                >
                    {/* Top toolbar */}
                    <div className="flex items-center gap-1 px-3 pt-2 pb-1">
                        <TooltipProvider delayDuration={300}>
                            {/* Assistant picker */}
                            <AssistantPicker
                                currentAssistant={currentAssistant}
                                onAssistantSelect={onAssistantSelect}
                                userRole={userRole}
                            />

                            {/* Model selector */}
                            <ModelSelector
                                currentModel={currentModel}
                                onModelChange={onModelChange}
                                userRole={userRole}
                            />

                            <div className="flex-1" />

                            {/* @ mention hint */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                        disabled
                                    >
                                        <AtSign className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>@ wspomnij agenta</p>
                                </TooltipContent>
                            </Tooltip>

                            {/* # command hint */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                        disabled
                                    >
                                        <Hash className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p># dodaj link lub plik</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Textarea */}
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        disabled={disabled || isLoading}
                        className={cn(
                            'min-h-[44px] max-h-[200px] resize-none border-0 focus-visible:ring-0 px-3 py-2',
                            'bg-transparent placeholder:text-neutral-400',
                            'text-sm leading-relaxed'
                        )}
                        rows={1}
                    />

                    {/* Bottom toolbar */}
                    <div className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-1">
                            {/* File upload */}
                            <ChatFileUpload
                                onFilesSelected={onAddAttachments}
                                attachments={attachments}
                                onRemoveAttachment={onRemoveAttachment}
                                disabled={disabled || isLoading}
                            />

                            {/* Voice input (future) */}
                            <TooltipProvider delayDuration={300}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                            disabled
                                        >
                                            <Mic className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Nagrywanie głosu (wkrótce)</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* Submit button */}
                        <Button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            size="sm"
                            className={cn(
                                'h-8 px-4 rounded-full transition-all duration-200',
                                canSubmit
                                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-md shadow-purple-500/25'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                    <span>Myślę...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-1.5" />
                                    <span>Wyślij</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Character count / hint */}
                <div className="flex items-center justify-between mt-2 px-1">
                    <p className="text-[10px] text-neutral-400">
                        Shift + Enter dla nowej linii
                    </p>
                    {input.length > 0 && (
                        <p className="text-[10px] text-neutral-400">
                            {input.length} znaków
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
