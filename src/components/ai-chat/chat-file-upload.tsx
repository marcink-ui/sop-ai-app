'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Paperclip,
    X,
    Image as ImageIcon,
    FileText,
    Link as LinkIcon,
    Upload,
    File,
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

// Types
export interface ChatAttachment {
    id: string;
    type: 'image' | 'document' | 'link';
    name: string;
    url?: string;
    preview?: string;
    file?: File;
    size?: number;
}

interface ChatFileUploadProps {
    onFilesSelected: (files: ChatAttachment[]) => void;
    attachments: ChatAttachment[];
    onRemoveAttachment: (id: string) => void;
    maxFiles?: number;
    maxFileSize?: number; // in MB
    acceptedTypes?: string[];
    disabled?: boolean;
    className?: string;
}

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 9);

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getFileType = (file: File): ChatAttachment['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    return 'document';
};

const getFileIcon = (type: ChatAttachment['type']) => {
    switch (type) {
        case 'image':
            return ImageIcon;
        case 'link':
            return LinkIcon;
        default:
            return FileText;
    }
};

// Main Component
export function ChatFileUpload({
    onFilesSelected,
    attachments,
    onRemoveAttachment,
    maxFiles = 5,
    maxFileSize = 10, // 10 MB default
    acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt', '.md'],
    disabled = false,
    className,
}: ChatFileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [showDropzone, setShowDropzone] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropzoneRef = useRef<HTMLDivElement>(null);

    // Handle file selection
    const processFiles = useCallback(
        (files: FileList | File[]) => {
            const fileArray = Array.from(files);
            const remainingSlots = maxFiles - attachments.length;

            if (remainingSlots <= 0) {
                console.warn(`Max ${maxFiles} files allowed`);
                return;
            }

            const validFiles = fileArray
                .slice(0, remainingSlots)
                .filter((file) => {
                    // Check file size
                    if (file.size > maxFileSize * 1024 * 1024) {
                        console.warn(`${file.name} exceeds ${maxFileSize}MB limit`);
                        return false;
                    }
                    return true;
                });

            const newAttachments: ChatAttachment[] = validFiles.map((file) => {
                const type = getFileType(file);
                const attachment: ChatAttachment = {
                    id: generateId(),
                    type,
                    name: file.name,
                    file,
                    size: file.size,
                };

                // Generate preview for images
                if (type === 'image') {
                    attachment.preview = URL.createObjectURL(file);
                }

                return attachment;
            });

            if (newAttachments.length > 0) {
                onFilesSelected(newAttachments);
            }
        },
        [attachments.length, maxFiles, maxFileSize, onFilesSelected]
    );

    // Drag and drop handlers
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setShowDropzone(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Only hide if leaving the dropzone entirely
        if (!dropzoneRef.current?.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            setShowDropzone(false);

            if (disabled) return;

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                processFiles(files);
            }
        },
        [disabled, processFiles]
    );

    // Paste handler for images
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (disabled) return;

            const items = e.clipboardData?.items;
            if (!items) return;

            const imageItems = Array.from(items).filter(
                (item) => item.type.startsWith('image/')
            );

            if (imageItems.length > 0) {
                const files = imageItems
                    .map((item) => item.getAsFile())
                    .filter((file): file is File => file !== null);

                if (files.length > 0) {
                    processFiles(files);
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [disabled, processFiles]);

    // Cleanup previews on unmount
    useEffect(() => {
        return () => {
            attachments.forEach((att) => {
                if (att.preview) {
                    URL.revokeObjectURL(att.preview);
                }
            });
        };
    }, [attachments]);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFiles(files);
        }
        // Reset input
        e.target.value = '';
    };

    return (
        <div className={cn('relative', className)}>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
            />

            {/* Upload button */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleButtonClick}
                            disabled={disabled || attachments.length >= maxFiles}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                            <Paperclip className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Załącz plik (max {maxFiles})</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* Dropzone overlay */}
            <AnimatePresence>
                {showDropzone && (
                    <motion.div
                        ref={dropzoneRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={cn(
                            'fixed inset-0 z-50 flex items-center justify-center',
                            'bg-background/80 backdrop-blur-sm'
                        )}
                        onClick={() => setShowDropzone(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            className={cn(
                                'flex flex-col items-center gap-4 p-8 rounded-xl',
                                'border-2 border-dashed',
                                isDragging
                                    ? 'border-primary bg-primary/10'
                                    : 'border-muted-foreground/30 bg-card'
                            )}
                        >
                            <Upload className="h-12 w-12 text-muted-foreground" />
                            <p className="text-lg font-medium">
                                Upuść pliki tutaj
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Obrazy, PDF, dokumenty (max {maxFileSize}MB)
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Single Attachment Preview (for composer inline display)
export { AttachmentPreview as SingleAttachmentPreview };
export function AttachmentPreview({
    attachment,
    onRemove,
    className,
}: {
    attachment: ChatAttachment;
    onRemove: (id: string) => void;
    className?: string;
}) {
    const Icon = getFileIcon(attachment.type);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
                'relative group flex items-center gap-2',
                'px-3 py-2 rounded-lg',
                'bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
                className
            )}
        >
            {/* Thumbnail or icon */}
            {attachment.type === 'image' && attachment.preview ? (
                <div className="w-8 h-8 rounded overflow-hidden">
                    <img
                        src={attachment.preview}
                        alt={attachment.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <Icon className="h-4 w-4 text-neutral-500" />
            )}

            {/* File info */}
            <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium truncate max-w-[120px] text-neutral-900 dark:text-neutral-100">
                    {attachment.name}
                </span>
                {attachment.size && (
                    <span className="text-[10px] text-neutral-500">
                        {formatFileSize(attachment.size)}
                    </span>
                )}
            </div>

            {/* Remove button */}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemove(attachment.id)}
                className={cn(
                    'h-5 w-5 rounded-full ml-1',
                    'hover:bg-red-100 dark:hover:bg-red-900/30',
                    'text-neutral-400 hover:text-red-500'
                )}
            >
                <X className="h-3 w-3" />
            </Button>
        </motion.div>
    );
}

// Multi Attachment Preview Component
export function AttachmentPreviewList({
    attachments,
    onRemove,
    className,
}: {
    attachments: ChatAttachment[];
    onRemove: (id: string) => void;
    className?: string;
}) {
    if (attachments.length === 0) return null;

    return (
        <div className={cn('flex flex-wrap gap-2 p-2', className)}>
            <AnimatePresence mode="popLayout">
                {attachments.map((attachment) => {
                    const Icon = getFileIcon(attachment.type);

                    return (
                        <motion.div
                            key={attachment.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className={cn(
                                'relative group flex items-center gap-2',
                                'px-3 py-2 rounded-lg',
                                'bg-muted/50 border border-border'
                            )}
                        >
                            {/* Thumbnail or icon */}
                            {attachment.type === 'image' && attachment.preview ? (
                                <div className="w-8 h-8 rounded overflow-hidden">
                                    <img
                                        src={attachment.preview}
                                        alt={attachment.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            )}

                            {/* File info */}
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-medium truncate max-w-[120px]">
                                    {attachment.name}
                                </span>
                                {attachment.size && (
                                    <span className="text-[10px] text-muted-foreground">
                                        {formatFileSize(attachment.size)}
                                    </span>
                                )}
                            </div>

                            {/* Remove button */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemove(attachment.id)}
                                className={cn(
                                    'h-5 w-5 rounded-full',
                                    'opacity-0 group-hover:opacity-100',
                                    'transition-opacity'
                                )}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

// Hook for managing attachments
export function useAttachments(maxFiles = 5) {
    const [attachments, setAttachments] = useState<ChatAttachment[]>([]);

    const addAttachments = useCallback((newAttachments: ChatAttachment[]) => {
        setAttachments((prev) => {
            const combined = [...prev, ...newAttachments];
            return combined.slice(0, maxFiles);
        });
    }, [maxFiles]);

    const removeAttachment = useCallback((id: string) => {
        setAttachments((prev) => {
            const attachment = prev.find((a) => a.id === id);
            if (attachment?.preview) {
                URL.revokeObjectURL(attachment.preview);
            }
            return prev.filter((a) => a.id !== id);
        });
    }, []);

    const clearAttachments = useCallback(() => {
        attachments.forEach((att) => {
            if (att.preview) {
                URL.revokeObjectURL(att.preview);
            }
        });
        setAttachments([]);
    }, [attachments]);

    return {
        attachments,
        addAttachments,
        removeAttachment,
        clearAttachments,
    };
}
