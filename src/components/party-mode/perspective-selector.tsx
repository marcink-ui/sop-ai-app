'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronDown, Check, Info, X } from 'lucide-react';
import {
    C_SUITE_PERSPECTIVES,
    CSuitePerspective,
    PerspectiveConfig,
    getAllPerspectives,
} from '@/lib/party-mode/c-suite-perspectives';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface PerspectiveSelectorProps {
    selectedPerspectives: CSuitePerspective[];
    onPerspectivesChange: (perspectives: CSuitePerspective[]) => void;
    maxSelections?: number;
    className?: string;
}

export function PerspectiveSelector({
    selectedPerspectives,
    onPerspectivesChange,
    maxSelections = 3,
    className,
}: PerspectiveSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const perspectives = getAllPerspectives();

    const togglePerspective = (perspective: CSuitePerspective) => {
        if (selectedPerspectives.includes(perspective)) {
            onPerspectivesChange(selectedPerspectives.filter(p => p !== perspective));
        } else if (selectedPerspectives.length < maxSelections) {
            onPerspectivesChange([...selectedPerspectives, perspective]);
        }
    };

    const clearAll = () => {
        onPerspectivesChange([]);
    };

    return (
        <TooltipProvider>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            'gap-2 h-9 px-3',
                            selectedPerspectives.length > 0 && 'border-primary/50 bg-primary/5',
                            className
                        )}
                    >
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                            {selectedPerspectives.length === 0
                                ? 'Party Mode'
                                : `${selectedPerspectives.join(' + ')}`}
                        </span>
                        <ChevronDown className={cn(
                            'h-4 w-4 transition-transform',
                            isOpen && 'rotate-180'
                        )} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                    <div className="p-3 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-sm">Party Mode - C-Suite Perspectives</h4>
                                <p className="text-xs text-muted-foreground">
                                    Wybierz max {maxSelections} perspektywy analizy
                                </p>
                            </div>
                            {selectedPerspectives.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAll}
                                    className="h-7 px-2 text-xs"
                                >
                                    <X className="h-3 w-3 mr-1" />
                                    Wyczyść
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="p-2 max-h-[300px] overflow-y-auto">
                        <div className="space-y-1">
                            {perspectives.map((perspective) => (
                                <PerspectiveItem
                                    key={perspective.id}
                                    perspective={perspective}
                                    isSelected={selectedPerspectives.includes(perspective.id)}
                                    isDisabled={
                                        !selectedPerspectives.includes(perspective.id) &&
                                        selectedPerspectives.length >= maxSelections
                                    }
                                    onToggle={() => togglePerspective(perspective.id)}
                                />
                            ))}
                        </div>
                    </div>
                    {selectedPerspectives.length > 0 && (
                        <div className="p-3 border-t border-border bg-muted/30">
                            <p className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">Aktywne:</span>{' '}
                                {selectedPerspectives.map(p => C_SUITE_PERSPECTIVES[p].subtitle).join(', ')}
                            </p>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </TooltipProvider>
    );
}

interface PerspectiveItemProps {
    perspective: PerspectiveConfig;
    isSelected: boolean;
    isDisabled: boolean;
    onToggle: () => void;
}

function PerspectiveItem({
    perspective,
    isSelected,
    isDisabled,
    onToggle,
}: PerspectiveItemProps) {
    const Icon = perspective.icon;

    return (
        <motion.button
            onClick={onToggle}
            disabled={isDisabled}
            className={cn(
                'w-full flex items-center gap-3 p-2.5 rounded-lg transition-all',
                'hover:bg-muted/50 text-left',
                isSelected && `${perspective.bgColor} ${perspective.borderColor} border`,
                isDisabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
            )}
            whileHover={!isDisabled ? { scale: 1.01 } : undefined}
            whileTap={!isDisabled ? { scale: 0.99 } : undefined}
        >
            <div className={cn(
                'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
                isSelected ? perspective.bgColor : 'bg-muted'
            )}>
                <Icon className={cn('h-5 w-5', perspective.color)} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{perspective.title}</span>
                    <span className="text-xs text-muted-foreground truncate">
                        {perspective.subtitle}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                    {perspective.focusAreas.slice(0, 2).join(' • ')}
                </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 hover:bg-muted rounded"
                        >
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[200px]">
                        <p className="text-xs font-medium mb-1">{perspective.subtitle}</p>
                        <ul className="text-xs space-y-0.5">
                            {perspective.focusAreas.map((area, i) => (
                                <li key={i} className="text-muted-foreground">• {area}</li>
                            ))}
                        </ul>
                    </TooltipContent>
                </Tooltip>
                <AnimatePresence>
                    {isSelected && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                        >
                            <Check className={cn('h-4 w-4', perspective.color)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.button>
    );
}

// Badge display for selected perspectives
interface PerspectiveBadgesProps {
    perspectives: CSuitePerspective[];
    onRemove?: (perspective: CSuitePerspective) => void;
    className?: string;
}

export function PerspectiveBadges({
    perspectives,
    onRemove,
    className,
}: PerspectiveBadgesProps) {
    if (perspectives.length === 0) return null;

    return (
        <div className={cn('flex flex-wrap gap-1.5', className)}>
            {perspectives.map((perspectiveId) => {
                const perspective = C_SUITE_PERSPECTIVES[perspectiveId];
                const Icon = perspective.icon;

                return (
                    <motion.div
                        key={perspectiveId}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={cn(
                            'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
                            perspective.bgColor,
                            perspective.borderColor,
                            'border'
                        )}
                    >
                        <Icon className={cn('h-3 w-3', perspective.color)} />
                        <span>{perspective.title}</span>
                        {onRemove && (
                            <button
                                onClick={() => onRemove(perspectiveId)}
                                className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 -mr-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}
