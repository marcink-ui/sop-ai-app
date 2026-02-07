'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Tag, User, Calendar, GitBranch, ChevronRight, History, Edit, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Field types for the detail sheet
export interface DetailField {
    label: string;
    value: React.ReactNode;
    icon?: React.ElementType;
    type?: 'text' | 'badge' | 'tags' | 'link' | 'date' | 'user';
    onClick?: () => void;
    editable?: boolean;
}

export interface VersionEntry {
    version: string;
    date: string;
    author: string;
    changes?: string;
}

export interface DetailSheetProps {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    iconColor?: string;
    fields: DetailField[];
    description?: string;
    tags?: string[];
    versions?: VersionEntry[];
    onEdit?: () => void;
    onViewFull?: () => void;
    children?: React.ReactNode;
}

export function DetailSheet({
    open,
    onClose,
    title,
    subtitle,
    icon,
    iconColor = 'bg-blue-500',
    fields,
    description,
    tags,
    versions,
    onEdit,
    onViewFull,
    children,
}: DetailSheetProps) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/50"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 z-50 h-full w-full max-w-lg border-l border-border bg-background shadow-2xl"
                    >
                        <div className="flex h-full flex-col">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4 border-b border-border p-4">
                                <div className="flex items-start gap-3">
                                    {icon && (
                                        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconColor)}>
                                            {icon}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <h2 className="text-lg font-semibold truncate">{title}</h2>
                                        {subtitle && (
                                            <p className="text-sm text-muted-foreground">{subtitle}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {onEdit && (
                                        <Button variant="outline" size="sm" onClick={onEdit}>
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edytuj
                                        </Button>
                                    )}
                                    {onViewFull && (
                                        <Button variant="ghost" size="sm" onClick={onViewFull}>
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" onClick={onClose}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Content */}
                            <ScrollArea className="flex-1">
                                <div className="p-4 space-y-6">
                                    {/* Tags */}
                                    {tags && tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag, i) => (
                                                <Badge
                                                    key={i}
                                                    variant="secondary"
                                                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                                                >
                                                    <Tag className="h-3 w-3 mr-1" />
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Description */}
                                    {description && (
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                                Opis
                                            </h3>
                                            <p className="text-sm leading-relaxed">{description}</p>
                                        </div>
                                    )}

                                    {/* Fields Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {fields.map((field, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    'p-3 rounded-lg bg-muted/50 transition-colors',
                                                    field.onClick && 'cursor-pointer hover:bg-muted',
                                                    field.editable && 'border border-dashed border-border hover:border-primary/50'
                                                )}
                                                onClick={field.onClick}
                                            >
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                                    {field.icon && <field.icon className="h-3 w-3" />}
                                                    <span>{field.label}</span>
                                                    {field.editable && (
                                                        <Edit className="h-2.5 w-2.5 ml-auto opacity-50" />
                                                    )}
                                                </div>
                                                <div className="text-sm font-medium">
                                                    {field.type === 'badge' ? (
                                                        <Badge variant="outline" className="text-xs">
                                                            {field.value}
                                                        </Badge>
                                                    ) : field.type === 'link' ? (
                                                        <span className="text-blue-500 hover:underline flex items-center gap-1">
                                                            {field.value}
                                                            <ChevronRight className="h-3 w-3" />
                                                        </span>
                                                    ) : (
                                                        field.value
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Custom children */}
                                    {children}

                                    {/* Version History */}
                                    {versions && versions.length > 0 && (
                                        <div>
                                            <Separator className="my-4" />
                                            <div className="flex items-center gap-2 mb-3">
                                                <History className="h-4 w-4 text-muted-foreground" />
                                                <h3 className="text-sm font-medium">Historia wersji</h3>
                                            </div>
                                            <div className="space-y-2">
                                                {versions.slice(0, 5).map((v, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors text-sm"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-[10px]">
                                                                v{v.version}
                                                            </Badge>
                                                            <span className="text-muted-foreground">
                                                                {v.changes || 'Bez opisu'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span>{v.author}</span>
                                                            <span>·</span>
                                                            <span>{v.date}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Helper component for clickable table cells
export interface ClickableCellProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export function ClickableCell({ children, onClick, className }: ClickableCellProps) {
    return (
        <span
            onClick={(e) => {
                if (onClick) {
                    e.stopPropagation();
                    onClick();
                }
            }}
            className={cn(
                onClick && 'cursor-pointer hover:text-primary transition-colors',
                className
            )}
        >
            {children}
        </span>
    );
}
