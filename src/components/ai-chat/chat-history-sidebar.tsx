'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Search,
    Trash2,
    MessageSquare,
    Clock,
    MoreHorizontal,
    Star,
    Archive,
    Folder,
    ChevronRight,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

// ============================================
// Types
// ============================================

export interface Conversation {
    id: string;
    title: string;
    preview?: string;
    createdAt: Date;
    updatedAt: Date;
    messageCount: number;
    starred?: boolean;
    archived?: boolean;
    folder?: string;
    modelId?: string;
}

export interface ConversationFolder {
    id: string;
    name: string;
    color?: string;
    count: number;
}

export interface ChatHistorySidebarProps {
    /** List of conversations */
    conversations: Conversation[];
    /** List of folders */
    folders?: ConversationFolder[];
    /** Currently selected conversation ID */
    selectedId?: string;
    /** Called when a conversation is selected */
    onSelect?: (conversation: Conversation) => void;
    /** Called when a new conversation is requested */
    onNewChat?: () => void;
    /** Called when a conversation is deleted */
    onDelete?: (id: string) => void;
    /** Called when a conversation is starred/unstarred */
    onToggleStar?: (id: string) => void;
    /** Called when a conversation is archived/unarchived */
    onToggleArchive?: (id: string) => void;
    /** Called when a conversation is renamed */
    onRename?: (id: string, newTitle: string) => void;
    /** Called when a conversation is moved to a folder */
    onMoveToFolder?: (id: string, folderId: string | null) => void;
    /** Additional CSS class */
    className?: string;
    /** Collapsed state */
    collapsed?: boolean;
    /** Show starred section */
    showStarred?: boolean;
    /** Show archived section */
    showArchived?: boolean;
}

// ============================================
// Helper Functions
// ============================================

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return date.toLocaleDateString();
}

function groupConversationsByDate(conversations: Conversation[]): Map<string, Conversation[]> {
    const groups = new Map<string, Conversation[]>();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const lastWeek = new Date(today.getTime() - 7 * 86400000);
    const lastMonth = new Date(today.getTime() - 30 * 86400000);

    conversations.forEach((conv) => {
        const convDate = new Date(conv.updatedAt);
        let groupKey: string;

        if (convDate >= today) {
            groupKey = 'Today';
        } else if (convDate >= yesterday) {
            groupKey = 'Yesterday';
        } else if (convDate >= lastWeek) {
            groupKey = 'Last 7 days';
        } else if (convDate >= lastMonth) {
            groupKey = 'Last 30 days';
        } else {
            groupKey = convDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }

        if (!groups.has(groupKey)) {
            groups.set(groupKey, []);
        }
        groups.get(groupKey)!.push(conv);
    });

    return groups;
}

// ============================================
// Conversation Item Component
// ============================================

interface ConversationItemProps {
    conversation: Conversation;
    isSelected: boolean;
    onSelect: () => void;
    onDelete?: () => void;
    onToggleStar?: () => void;
    onToggleArchive?: () => void;
    onRename?: (newTitle: string) => void;
}

function ConversationItem({
    conversation,
    isSelected,
    onSelect,
    onDelete,
    onToggleStar,
    onToggleArchive,
    onRename,
}: ConversationItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(conversation.title);

    const handleRename = () => {
        if (editTitle.trim() && editTitle !== conversation.title) {
            onRename?.(editTitle.trim());
        }
        setIsEditing(false);
    };

    return (
        <div
            className={cn(
                'group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors',
                isSelected
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted/50 text-foreground'
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onSelect}
        >
            <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />

            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename();
                            if (e.key === 'Escape') {
                                setEditTitle(conversation.title);
                                setIsEditing(false);
                            }
                        }}
                        className="h-6 py-0 px-1 text-sm"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <>
                        <p className="truncate font-medium">{conversation.title}</p>
                        {conversation.preview && (
                            <p className="truncate text-xs text-muted-foreground mt-0.5">
                                {conversation.preview}
                            </p>
                        )}
                    </>
                )}
            </div>

            {/* Starred indicator */}
            {conversation.starred && !isHovered && (
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            )}

            {/* Actions dropdown */}
            {isHovered && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                        >
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleStar?.();
                            }}
                        >
                            {conversation.starred ? 'Remove star' : 'Add star'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleArchive?.();
                            }}
                        >
                            {conversation.archived ? 'Unarchive' : 'Archive'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.();
                            }}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {/* Time indicator */}
            {!isHovered && !isEditing && (
                <span className="text-xs text-muted-foreground shrink-0">
                    {formatRelativeTime(conversation.updatedAt)}
                </span>
            )}
        </div>
    );
}

// ============================================
// Collapsible Section Component
// ============================================

interface CollapsibleSectionProps {
    title: string;
    count: number;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

function CollapsibleSection({ title, count, defaultOpen = true, children }: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="mb-4">
            <button
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(!isOpen)}
            >
                <ChevronRight className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-90')} />
                <span className="uppercase tracking-wider">{title}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                    {count}
                </Badge>
            </button>
            {isOpen && <div className="space-y-1">{children}</div>}
        </div>
    );
}

// ============================================
// Main Chat History Sidebar Component
// ============================================

export function ChatHistorySidebar({
    conversations,
    folders = [],
    selectedId,
    onSelect,
    onNewChat,
    onDelete,
    onToggleStar,
    onToggleArchive,
    onRename,
    onMoveToFolder,
    className,
    collapsed = false,
    showStarred = true,
    showArchived = false,
}: ChatHistorySidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter and group conversations
    const { starredConversations, archivedConversations, activeConversations } = useMemo(() => {
        let filtered = conversations;

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (c) =>
                    c.title.toLowerCase().includes(query) ||
                    c.preview?.toLowerCase().includes(query)
            );
        }

        return {
            starredConversations: filtered.filter((c) => c.starred && !c.archived),
            archivedConversations: filtered.filter((c) => c.archived),
            activeConversations: filtered.filter((c) => !c.starred && !c.archived),
        };
    }, [conversations, searchQuery]);

    // Group active conversations by date
    const groupedConversations = useMemo(
        () => groupConversationsByDate(activeConversations),
        [activeConversations]
    );

    const handleSelect = useCallback(
        (conversation: Conversation) => {
            onSelect?.(conversation);
        },
        [onSelect]
    );

    if (collapsed) {
        return (
            <div className={cn('flex flex-col items-center gap-2 py-4', className)}>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onNewChat}
                                className="h-10 w-10"
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">New Chat</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {conversations.slice(0, 5).map((conv) => (
                    <TooltipProvider key={conv.id}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={selectedId === conv.id ? 'secondary' : 'ghost'}
                                    size="icon"
                                    onClick={() => handleSelect(conv)}
                                    className="h-10 w-10"
                                >
                                    <MessageSquare className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">{conv.title}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
        );
    }

    return (
        <div className={cn('flex h-full flex-col', className)}>
            {/* Header with New Chat button */}
            <div className="flex items-center gap-2 p-4 border-b">
                <Button onClick={onNewChat} className="flex-1 gap-2">
                    <Plus className="h-4 w-4" />
                    New Chat
                </Button>
            </div>

            {/* Search */}
            <div className="p-4 pb-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1 px-2">
                {/* Starred Section */}
                {showStarred && starredConversations.length > 0 && (
                    <CollapsibleSection title="Starred" count={starredConversations.length}>
                        {starredConversations.map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                conversation={conv}
                                isSelected={selectedId === conv.id}
                                onSelect={() => handleSelect(conv)}
                                onDelete={() => onDelete?.(conv.id)}
                                onToggleStar={() => onToggleStar?.(conv.id)}
                                onToggleArchive={() => onToggleArchive?.(conv.id)}
                                onRename={(title) => onRename?.(conv.id, title)}
                            />
                        ))}
                    </CollapsibleSection>
                )}

                {/* Date-grouped conversations */}
                {Array.from(groupedConversations.entries()).map(([dateGroup, convs]) => (
                    <CollapsibleSection key={dateGroup} title={dateGroup} count={convs.length}>
                        {convs.map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                conversation={conv}
                                isSelected={selectedId === conv.id}
                                onSelect={() => handleSelect(conv)}
                                onDelete={() => onDelete?.(conv.id)}
                                onToggleStar={() => onToggleStar?.(conv.id)}
                                onToggleArchive={() => onToggleArchive?.(conv.id)}
                                onRename={(title) => onRename?.(conv.id, title)}
                            />
                        ))}
                    </CollapsibleSection>
                ))}

                {/* Archived Section */}
                {showArchived && archivedConversations.length > 0 && (
                    <CollapsibleSection
                        title="Archived"
                        count={archivedConversations.length}
                        defaultOpen={false}
                    >
                        {archivedConversations.map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                conversation={conv}
                                isSelected={selectedId === conv.id}
                                onSelect={() => handleSelect(conv)}
                                onDelete={() => onDelete?.(conv.id)}
                                onToggleStar={() => onToggleStar?.(conv.id)}
                                onToggleArchive={() => onToggleArchive?.(conv.id)}
                                onRename={(title) => onRename?.(conv.id, title)}
                            />
                        ))}
                    </CollapsibleSection>
                )}

                {/* Empty State */}
                {conversations.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-sm font-medium">No conversations</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Start a new chat to begin
                        </p>
                    </div>
                )}

                {/* No Search Results */}
                {searchQuery && conversations.length > 0 && activeConversations.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-sm font-medium">No results found</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Try a different search term
                        </p>
                    </div>
                )}
            </ScrollArea>

            {/* Footer with folder links */}
            {folders.length > 0 && (
                <div className="border-t p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Folders</p>
                    <div className="space-y-1">
                        {folders.map((folder) => (
                            <button
                                key={folder.id}
                                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/50"
                            >
                                <Folder className="h-4 w-4" />
                                <span className="flex-1 text-left truncate">{folder.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                    {folder.count}
                                </Badge>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// Sample Data Helper
// ============================================

export function createSampleConversations(): Conversation[] {
    const now = new Date();
    return [
        {
            id: '1',
            title: 'SOP Analysis for Finance Department',
            preview: 'Let me help you analyze the invoice processing workflow...',
            createdAt: new Date(now.getTime() - 3600000),
            updatedAt: new Date(now.getTime() - 1800000),
            messageCount: 12,
            starred: true,
        },
        {
            id: '2',
            title: 'Value Chain Mapping Session',
            preview: 'Based on the current structure, I recommend...',
            createdAt: new Date(now.getTime() - 86400000),
            updatedAt: new Date(now.getTime() - 43200000),
            messageCount: 24,
        },
        {
            id: '3',
            title: 'MUDA Detection Report',
            preview: 'I found 7 potential waste areas in your process...',
            createdAt: new Date(now.getTime() - 172800000),
            updatedAt: new Date(now.getTime() - 86400000),
            messageCount: 8,
        },
        {
            id: '4',
            title: 'AI Agent Configuration',
            preview: 'The SOUL agent has been configured with...',
            createdAt: new Date(now.getTime() - 604800000),
            updatedAt: new Date(now.getTime() - 172800000),
            messageCount: 5,
            starred: true,
        },
        {
            id: '5',
            title: 'Monthly Review Summary',
            preview: 'Here is the summary of last month...',
            createdAt: new Date(now.getTime() - 2592000000),
            updatedAt: new Date(now.getTime() - 1296000000),
            messageCount: 18,
            archived: true,
        },
    ];
}

export default ChatHistorySidebar;
