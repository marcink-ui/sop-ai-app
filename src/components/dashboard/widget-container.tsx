'use client';

import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, X, Maximize2, Minimize2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type WidgetSize = 'third' | 'half' | 'full';

export interface WidgetContainerProps {
    id: string;
    title: string;
    icon?: ReactNode;
    size?: WidgetSize;
    children: ReactNode;
    removable?: boolean;
    expandable?: boolean;
    draggable?: boolean;
    className?: string;
    contentClassName?: string;
    headerActions?: ReactNode;
    onRemove?: () => void;
    onSizeChange?: (size: WidgetSize) => void;
}

// Size classes: 1/3 (third), 1/2 (half), 1/1 (full)
const sizeClasses: Record<WidgetSize, string> = {
    third: 'col-span-1', // 1/3 on lg, 1/2 on md, full on sm
    half: 'col-span-1 md:col-span-1 lg:col-span-2', // 1/2 on lg, 1/2 on md
    full: 'col-span-full', // Full width
};

export function WidgetContainer({
    id,
    title,
    icon,
    size = 'third',
    children,
    removable = true,
    expandable = true,
    draggable = false,
    className,
    contentClassName,
    headerActions,
    onRemove,
    onSizeChange,
}: WidgetContainerProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggleExpand = () => {
        if (!expandable) return;

        const newExpanded = !isExpanded;
        setIsExpanded(newExpanded);

        if (onSizeChange) {
            onSizeChange(newExpanded ? 'full' : size);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                'rounded-2xl border backdrop-blur-sm overflow-hidden',
                'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/50',
                'shadow-sm hover:shadow-md transition-shadow duration-200',
                isExpanded ? 'col-span-full' : sizeClasses[size],
                className
            )}
            data-widget-id={id}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800/50">
                <div className="flex items-center gap-2">
                    {draggable && (
                        <button
                            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Drag to reorder"
                        >
                            <GripVertical className="h-4 w-4" />
                        </button>
                    )}
                    {icon && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            {icon}
                        </div>
                    )}
                    <h3 className="font-medium text-sm text-neutral-900 dark:text-white">
                        {title}
                    </h3>
                </div>

                <div className="flex items-center gap-1">
                    {headerActions}

                    {expandable && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleToggleExpand}
                        >
                            {isExpanded ? (
                                <Minimize2 className="h-3.5 w-3.5" />
                            ) : (
                                <Maximize2 className="h-3.5 w-3.5" />
                            )}
                        </Button>
                    )}

                    {(removable || onSizeChange) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {onSizeChange && !isExpanded && (
                                    <>
                                        <DropdownMenuItem onClick={() => onSizeChange('third')}>
                                            1/3 ekranu
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onSizeChange('half')}>
                                            1/2 ekranu
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onSizeChange('full')}>
                                            1/1 ekranu (pełna szerokość)
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {removable && onRemove && (
                                    <DropdownMenuItem
                                        onClick={onRemove}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        <X className="h-3.5 w-3.5 mr-2" />
                                        Usuń widget
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className={cn('p-4', contentClassName)}>
                {children}
            </div>
        </motion.div>
    );
}
