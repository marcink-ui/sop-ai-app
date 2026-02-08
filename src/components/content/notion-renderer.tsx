'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    FileText,
    Code,
    Eye,
    Sparkles,
    AlertTriangle,
    CheckCircle2,
    Lightbulb,
    BookOpen,
} from 'lucide-react';

// Import Notion renderer dynamically for SSR compatibility
const NotionRenderer = dynamic(
    () => import('react-notion-x').then((mod) => mod.NotionRenderer),
    { ssr: false }
);

// ============================================
// Types
// ============================================

export type BlockType =
    | 'text'
    | 'heading_1'
    | 'heading_2'
    | 'heading_3'
    | 'bulleted_list'
    | 'numbered_list'
    | 'toggle'
    | 'code'
    | 'quote'
    | 'callout'
    | 'divider'
    | 'image'
    // Custom VantageOS blocks
    | 'ai_suggestion'
    | 'muda_tag'
    | 'sop_reference'
    | 'agent_action';

export interface ContentBlock {
    id: string;
    type: BlockType;
    content: string;
    properties?: Record<string, unknown>;
    children?: ContentBlock[];
}

export interface NotionPageData {
    pageId: string;
    title: string;
    blocks: ContentBlock[];
    lastEdited?: string;
}

type ViewMode = 'notion' | 'markdown';

export interface NotionRendererProps {
    /** Page data to render */
    data?: NotionPageData;
    /** Raw markdown content (alternative to data) */
    markdown?: string;
    /** Initial view mode */
    defaultViewMode?: ViewMode;
    /** Show view toggle */
    showViewToggle?: boolean;
    /** Additional CSS class */
    className?: string;
    /** Dark mode */
    darkMode?: boolean;
    /** Enable custom VantageOS blocks */
    enableCustomBlocks?: boolean;
}

// ============================================
// Custom Block Components
// ============================================

interface AISuggestionBlockProps {
    content: string;
    confidence?: number;
    source?: string;
}

function AISuggestionBlock({ content, confidence = 0.85, source }: AISuggestionBlockProps) {
    return (
        <Card className="my-4 border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-900/20">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-800">
                        <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                AI Suggestion
                            </span>
                            <Badge variant="secondary" className="text-xs">
                                {Math.round(confidence * 100)}% confidence
                            </Badge>
                        </div>
                        <p className="text-sm text-foreground">{content}</p>
                        {source && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                Source: {source}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

type MudaCategory = 'transport' | 'inventory' | 'motion' | 'waiting' | 'overproduction' | 'overprocessing' | 'defects' | 'unused_talent';

interface MudaTagBlockProps {
    category: MudaCategory;
    description: string;
    impact?: 'low' | 'medium' | 'high';
    suggestion?: string;
}

const MUDA_CONFIG: Record<MudaCategory, { label: string; color: string; icon: typeof AlertTriangle }> = {
    transport: { label: 'Transport', color: 'bg-blue-500', icon: AlertTriangle },
    inventory: { label: 'Inventory', color: 'bg-green-500', icon: AlertTriangle },
    motion: { label: 'Motion', color: 'bg-yellow-500', icon: AlertTriangle },
    waiting: { label: 'Waiting', color: 'bg-orange-500', icon: AlertTriangle },
    overproduction: { label: 'Overproduction', color: 'bg-red-500', icon: AlertTriangle },
    overprocessing: { label: 'Overprocessing', color: 'bg-purple-500', icon: AlertTriangle },
    defects: { label: 'Defects', color: 'bg-pink-500', icon: AlertTriangle },
    unused_talent: { label: 'Unused Talent', color: 'bg-indigo-500', icon: AlertTriangle },
};

function MudaTagBlock({ category, description, impact = 'medium', suggestion }: MudaTagBlockProps) {
    const config = MUDA_CONFIG[category] || MUDA_CONFIG.waiting;
    const Icon = config.icon;

    const impactColors = {
        low: 'text-green-600 bg-green-100',
        medium: 'text-yellow-600 bg-yellow-100',
        high: 'text-red-600 bg-red-100',
    };

    return (
        <Card className="my-4 border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/20">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', config.color)}>
                        <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                MUDA: {config.label}
                            </span>
                            <Badge className={cn('text-xs', impactColors[impact])}>
                                {impact} impact
                            </Badge>
                        </div>
                        <p className="text-sm text-foreground">{description}</p>
                        {suggestion && (
                            <div className="mt-3 flex items-start gap-2 rounded-md bg-background/50 p-2">
                                <Lightbulb className="mt-0.5 h-4 w-4 text-amber-500" />
                                <p className="text-xs text-muted-foreground">{suggestion}</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface SOPReferenceBlockProps {
    sopId: string;
    sopName: string;
    department?: string;
    status?: 'active' | 'draft' | 'archived';
}

function SOPReferenceBlock({ sopId, sopName, department, status = 'active' }: SOPReferenceBlockProps) {
    const statusColors = {
        active: 'bg-green-100 text-green-700',
        draft: 'bg-yellow-100 text-yellow-700',
        archived: 'bg-gray-100 text-gray-700',
    };

    return (
        <Card className="my-4 cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-3 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="flex-1">
                    <p className="font-medium">{sopName}</p>
                    {department && (
                        <p className="text-xs text-muted-foreground">{department}</p>
                    )}
                </div>
                <Badge className={cn('text-xs', statusColors[status])}>
                    {status}
                </Badge>
            </CardContent>
        </Card>
    );
}

interface AgentActionBlockProps {
    agentName: string;
    action: string;
    status?: 'pending' | 'running' | 'completed' | 'failed';
    result?: string;
}

function AgentActionBlock({ agentName, action, status = 'pending', result }: AgentActionBlockProps) {
    const statusConfig = {
        pending: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-100' },
        running: { icon: AlertTriangle, color: 'text-blue-500', bg: 'bg-blue-100' },
        completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100' },
        failed: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100' },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Card className="my-4 border-l-4 border-l-cyan-500 bg-cyan-50/50 dark:bg-cyan-900/20">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', config.bg)}>
                        <Icon className={cn('h-4 w-4', config.color)} />
                    </div>
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                                {agentName}
                            </span>
                            <Badge variant="outline" className="text-xs">
                                {status}
                            </Badge>
                        </div>
                        <p className="text-sm text-foreground">{action}</p>
                        {result && status === 'completed' && (
                            <div className="mt-2 rounded-md bg-background/50 p-2">
                                <p className="text-xs text-muted-foreground">{result}</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ============================================
// Markdown Renderer
// ============================================

function MarkdownView({ markdown }: { markdown: string }) {
    // Simple markdown-to-HTML conversion for display
    // In production, use a proper markdown parser like remark
    const html = useMemo(() => {
        let result = markdown
            // Headers
            .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
            .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>')
            .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-10 mb-4">$1</h1>')
            // Bold and italic
            .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Code blocks
            .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg my-4 overflow-x-auto"><code>$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
            // Lists
            .replace(/^\- (.*$)/gm, '<li class="ml-4">$1</li>')
            .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>')
            // Paragraphs
            .replace(/\n\n/g, '</p><p class="my-4">')
            // Line breaks
            .replace(/\n/g, '<br />');

        return `<p class="my-4">${result}</p>`;
    }, [markdown]);

    return (
        <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

// ============================================
// Main Notion Renderer Component
// ============================================

export function VantageNotionRenderer({
    data,
    markdown,
    defaultViewMode = 'notion',
    showViewToggle = true,
    className,
    darkMode = false,
    enableCustomBlocks = true,
}: NotionRendererProps) {
    const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);

    // Render custom VantageOS blocks
    const renderCustomBlock = (block: ContentBlock) => {
        if (!enableCustomBlocks) return null;

        switch (block.type) {
            case 'ai_suggestion':
                return (
                    <AISuggestionBlock
                        key={block.id}
                        content={block.content}
                        confidence={block.properties?.confidence as number}
                        source={block.properties?.source as string}
                    />
                );
            case 'muda_tag':
                return (
                    <MudaTagBlock
                        key={block.id}
                        category={block.properties?.category as MudaCategory}
                        description={block.content}
                        impact={block.properties?.impact as 'low' | 'medium' | 'high'}
                        suggestion={block.properties?.suggestion as string}
                    />
                );
            case 'sop_reference':
                return (
                    <SOPReferenceBlock
                        key={block.id}
                        sopId={block.properties?.sopId as string}
                        sopName={block.content}
                        department={block.properties?.department as string}
                        status={block.properties?.status as 'active' | 'draft' | 'archived'}
                    />
                );
            case 'agent_action':
                return (
                    <AgentActionBlock
                        key={block.id}
                        agentName={block.properties?.agentName as string || 'AI Agent'}
                        action={block.content}
                        status={block.properties?.status as 'pending' | 'running' | 'completed' | 'failed'}
                        result={block.properties?.result as string}
                    />
                );
            default:
                return null;
        }
    };

    // If markdown is provided and view mode is markdown, show markdown view
    if (viewMode === 'markdown' && markdown) {
        return (
            <div className={cn('notion-renderer', className)}>
                {showViewToggle && (
                    <div className="mb-4 flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewMode('notion')}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Notion
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => setViewMode('markdown')}
                        >
                            <Code className="mr-2 h-4 w-4" />
                            Markdown
                        </Button>
                    </div>
                )}
                <div className="rounded-lg border bg-card p-6">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                        {markdown}
                    </pre>
                </div>
            </div>
        );
    }

    // Notion view with custom blocks
    return (
        <div className={cn('notion-renderer', className)}>
            {showViewToggle && markdown && (
                <div className="mb-4 flex items-center gap-2">
                    <Button
                        variant={viewMode === 'notion' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('notion')}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        Notion
                    </Button>
                    <Button
                        variant={viewMode === 'markdown' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('markdown')}
                    >
                        <Code className="mr-2 h-4 w-4" />
                        Markdown
                    </Button>
                </div>
            )}

            <div className="rounded-lg border bg-card p-6">
                {data?.title && (
                    <h1 className="mb-6 text-2xl font-bold">{data.title}</h1>
                )}

                {/* Render blocks */}
                {data?.blocks?.map((block) => {
                    const customBlock = renderCustomBlock(block);
                    if (customBlock) return customBlock;

                    // Fallback to standard block rendering
                    return (
                        <div key={block.id} className="my-2">
                            {block.type === 'heading_1' && (
                                <h1 className="text-2xl font-bold mt-8 mb-4">{block.content}</h1>
                            )}
                            {block.type === 'heading_2' && (
                                <h2 className="text-xl font-semibold mt-6 mb-3">{block.content}</h2>
                            )}
                            {block.type === 'heading_3' && (
                                <h3 className="text-lg font-semibold mt-4 mb-2">{block.content}</h3>
                            )}
                            {block.type === 'text' && (
                                <p className="my-2">{block.content}</p>
                            )}
                            {block.type === 'code' && (
                                <pre className="bg-muted p-4 rounded-lg my-4 overflow-x-auto">
                                    <code>{block.content}</code>
                                </pre>
                            )}
                            {block.type === 'quote' && (
                                <blockquote className="border-l-4 border-primary pl-4 my-4 italic">
                                    {block.content}
                                </blockquote>
                            )}
                            {block.type === 'divider' && (
                                <hr className="my-6 border-border" />
                            )}
                        </div>
                    );
                })}

                {/* If markdown provided but no data, render markdown */}
                {!data && markdown && <MarkdownView markdown={markdown} />}

                {/* Empty state */}
                {!data && !markdown && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No content to display</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// Sample Data Helper
// ============================================

export function createSampleWikiPage(): NotionPageData {
    return {
        pageId: 'sample-page-1',
        title: 'Sample VantageOS Wiki Page',
        lastEdited: new Date().toISOString(),
        blocks: [
            {
                id: '1',
                type: 'heading_1',
                content: 'Introduction',
            },
            {
                id: '2',
                type: 'text',
                content: 'This is a sample wiki page demonstrating the VantageOS Notion-style renderer with custom blocks.',
            },
            {
                id: '3',
                type: 'ai_suggestion',
                content: 'Based on your organization structure, consider adding a dedicated onboarding SOP for new team members.',
                properties: {
                    confidence: 0.92,
                    source: 'SOUL Agent Analysis',
                },
            },
            {
                id: '4',
                type: 'heading_2',
                content: 'Process Optimization',
            },
            {
                id: '5',
                type: 'muda_tag',
                content: 'Current invoice processing requires manual data entry across 3 different systems.',
                properties: {
                    category: 'overprocessing',
                    impact: 'high',
                    suggestion: 'Implement automated data sync between systems using API integrations.',
                },
            },
            {
                id: '6',
                type: 'sop_reference',
                content: 'Invoice Processing SOP',
                properties: {
                    sopId: 'sop-001',
                    department: 'Finance',
                    status: 'active',
                },
            },
            {
                id: '7',
                type: 'heading_2',
                content: 'AI Agent Actions',
            },
            {
                id: '8',
                type: 'agent_action',
                content: 'Analyzing document structure for optimization opportunities',
                properties: {
                    agentName: 'SOUL',
                    status: 'completed',
                    result: 'Found 3 potential areas for process improvement',
                },
            },
            {
                id: '9',
                type: 'divider',
                content: '',
            },
            {
                id: '10',
                type: 'quote',
                content: 'Continuous improvement is better than delayed perfection. — Mark Twain',
            },
        ],
    };
}

export default VantageNotionRenderer;
