'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    RefreshCw,
    ThumbsUp,
    ThumbsDown,
    Copy,
    Check,
    MoreHorizontal,
    Volume2,
    Share2,
    Edit3,
    Flag,
    Trash2,
} from 'lucide-react';

// ============================================
// Types
// ============================================

export type ReactionType = 'thumbs_up' | 'thumbs_down' | null;
export type FeedbackReason =
    | 'helpful'
    | 'accurate'
    | 'creative'
    | 'clear'
    | 'inaccurate'
    | 'unhelpful'
    | 'incomplete'
    | 'inappropriate'
    | 'other';

export interface MessageActionsProps {
    /** Message ID for action callbacks */
    messageId: string;
    /** Current reaction */
    reaction?: ReactionType;
    /** Called when regenerate is clicked */
    onRegenerate?: () => void;
    /** Called when reaction changes */
    onReaction?: (reaction: ReactionType, reason?: FeedbackReason) => void;
    /** Called when copy is clicked */
    onCopy?: () => void;
    /** Called when edit is clicked */
    onEdit?: () => void;
    /** Called when delete is clicked */
    onDelete?: () => void;
    /** Called when share is clicked */
    onShare?: () => void;
    /** Called when report is clicked */
    onReport?: () => void;
    /** Called when read aloud is clicked */
    onReadAloud?: () => void;
    /** Message content for copy */
    content?: string;
    /** Additional CSS class */
    className?: string;
    /** Show regenerate button */
    showRegenerate?: boolean;
    /** Show reactions */
    showReactions?: boolean;
    /** Show copy button */
    showCopy?: boolean;
    /** Size variant */
    size?: 'sm' | 'md';
    /** Is this an assistant message */
    isAssistant?: boolean;
    /** Is regenerating */
    isRegenerating?: boolean;
}

// ============================================
// Reaction Button Component
// ============================================

interface ReactionButtonProps {
    type: 'thumbs_up' | 'thumbs_down';
    isActive: boolean;
    onClick: () => void;
    disabled?: boolean;
    size?: 'sm' | 'md';
}

function ReactionButton({ type, isActive, onClick, disabled, size = 'sm' }: ReactionButtonProps) {
    const Icon = type === 'thumbs_up' ? ThumbsUp : ThumbsDown;
    const sizeClass = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
    const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            sizeClass,
                            isActive && type === 'thumbs_up' && 'text-green-500 bg-green-500/10',
                            isActive && type === 'thumbs_down' && 'text-red-500 bg-red-500/10'
                        )}
                        onClick={onClick}
                        disabled={disabled}
                    >
                        <Icon className={cn(iconSize, isActive && 'fill-current')} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {type === 'thumbs_up' ? 'Good response' : 'Bad response'}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// ============================================
// Copy Button Component
// ============================================

interface CopyButtonProps {
    content: string;
    onCopy?: () => void;
    size?: 'sm' | 'md';
}

function CopyButton({ content, onCopy, size = 'sm' }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);
    const sizeClass = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
    const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            onCopy?.();
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [content, onCopy]);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(sizeClass, copied && 'text-green-500')}
                        onClick={handleCopy}
                    >
                        {copied ? (
                            <Check className={iconSize} />
                        ) : (
                            <Copy className={iconSize} />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{copied ? 'Copied!' : 'Copy to clipboard'}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// ============================================
// Regenerate Button Component
// ============================================

interface RegenerateButtonProps {
    onClick: () => void;
    isRegenerating?: boolean;
    size?: 'sm' | 'md';
}

function RegenerateButton({ onClick, isRegenerating, size = 'sm' }: RegenerateButtonProps) {
    const sizeClass = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
    const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={sizeClass}
                        onClick={onClick}
                        disabled={isRegenerating}
                    >
                        <RefreshCw className={cn(iconSize, isRegenerating && 'animate-spin')} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Regenerate response</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// ============================================
// More Actions Menu Component
// ============================================

interface MoreActionsMenuProps {
    onEdit?: () => void;
    onShare?: () => void;
    onReadAloud?: () => void;
    onReport?: () => void;
    onDelete?: () => void;
    isAssistant?: boolean;
    size?: 'sm' | 'md';
}

function MoreActionsMenu({
    onEdit,
    onShare,
    onReadAloud,
    onReport,
    onDelete,
    isAssistant,
    size = 'sm',
}: MoreActionsMenuProps) {
    const sizeClass = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
    const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={sizeClass}>
                    <MoreHorizontal className={iconSize} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {!isAssistant && onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit message
                    </DropdownMenuItem>
                )}
                {isAssistant && onReadAloud && (
                    <DropdownMenuItem onClick={onReadAloud}>
                        <Volume2 className="h-4 w-4 mr-2" />
                        Read aloud
                    </DropdownMenuItem>
                )}
                {onShare && (
                    <DropdownMenuItem onClick={onShare}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {isAssistant && onReport && (
                    <DropdownMenuItem onClick={onReport}>
                        <Flag className="h-4 w-4 mr-2" />
                        Report issue
                    </DropdownMenuItem>
                )}
                {onDelete && (
                    <DropdownMenuItem onClick={onDelete} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ============================================
// Main Message Actions Component
// ============================================

export function MessageActions({
    messageId,
    reaction = null,
    onRegenerate,
    onReaction,
    onCopy,
    onEdit,
    onDelete,
    onShare,
    onReport,
    onReadAloud,
    content = '',
    className,
    showRegenerate = true,
    showReactions = true,
    showCopy = true,
    size = 'sm',
    isAssistant = true,
    isRegenerating = false,
}: MessageActionsProps) {
    const handleReaction = useCallback(
        (type: 'thumbs_up' | 'thumbs_down') => {
            const newReaction = reaction === type ? null : type;
            onReaction?.(newReaction);
        },
        [reaction, onReaction]
    );

    return (
        <div className={cn('flex items-center gap-0.5', className)}>
            {/* Reactions - Only for assistant messages */}
            {showReactions && isAssistant && (
                <>
                    <ReactionButton
                        type="thumbs_up"
                        isActive={reaction === 'thumbs_up'}
                        onClick={() => handleReaction('thumbs_up')}
                        size={size}
                    />
                    <ReactionButton
                        type="thumbs_down"
                        isActive={reaction === 'thumbs_down'}
                        onClick={() => handleReaction('thumbs_down')}
                        size={size}
                    />
                </>
            )}

            {/* Regenerate - Only for assistant messages */}
            {showRegenerate && isAssistant && onRegenerate && (
                <RegenerateButton
                    onClick={onRegenerate}
                    isRegenerating={isRegenerating}
                    size={size}
                />
            )}

            {/* Copy */}
            {showCopy && content && <CopyButton content={content} onCopy={onCopy} size={size} />}

            {/* More Actions */}
            <MoreActionsMenu
                onEdit={onEdit}
                onShare={onShare}
                onReadAloud={onReadAloud}
                onReport={onReport}
                onDelete={onDelete}
                isAssistant={isAssistant}
                size={size}
            />
        </div>
    );
}

// ============================================
// Reaction Summary Component
// ============================================

export interface ReactionSummaryProps {
    thumbsUp: number;
    thumbsDown: number;
    className?: string;
}

export function ReactionSummary({ thumbsUp, thumbsDown, className }: ReactionSummaryProps) {
    const total = thumbsUp + thumbsDown;
    if (total === 0) return null;

    const positiveRatio = total > 0 ? thumbsUp / total : 0;

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3 text-green-500" />
                <span className="text-xs font-medium">{thumbsUp}</span>
            </div>
            <div className="flex items-center gap-1">
                <ThumbsDown className="h-3 w-3 text-red-500" />
                <span className="text-xs font-medium">{thumbsDown}</span>
            </div>
            <Badge
                variant="secondary"
                className={cn(
                    'text-xs',
                    positiveRatio >= 0.7 && 'bg-green-100 text-green-700',
                    positiveRatio < 0.3 && 'bg-red-100 text-red-700'
                )}
            >
                {Math.round(positiveRatio * 100)}% positive
            </Badge>
        </div>
    );
}

export default MessageActions;
