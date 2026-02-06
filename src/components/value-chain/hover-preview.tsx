'use client';

import { useState, useEffect } from 'react';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Bot, Users, AlertTriangle, Calendar, User } from 'lucide-react';

interface NodeData {
    label: string;
    description?: string;
    dbId?: string;
    dbType?: 'sop' | 'agent' | 'role' | 'muda';
}

interface PreviewData {
    id: string;
    name: string;
    description?: string;
    status?: string;
    createdAt?: string;
    updatedBy?: string;
    metrics?: Record<string, string | number>;
}

interface HoverPreviewProps {
    children: React.ReactNode;
    nodeData: NodeData;
    side?: 'top' | 'right' | 'bottom' | 'left';
}

const typeConfig: Record<string, { Icon: typeof FileText; color: string; bgColor: string }> = {
    sop: { Icon: FileText, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
    agent: { Icon: Bot, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    role: { Icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    muda: { Icon: AlertTriangle, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
};

export function HoverPreview({ children, nodeData, side = 'right' }: HoverPreviewProps) {
    const [preview, setPreview] = useState<PreviewData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchPreview = async () => {
        if (!nodeData.dbId || !nodeData.dbType) return;

        setLoading(true);
        try {
            const response = await fetch(
                `/api/value-chain/elements/${nodeData.dbType}/${nodeData.dbId}`
            );
            if (response.ok) {
                const data = await response.json();
                setPreview(data);
            }
        } catch (error) {
            console.error('Failed to fetch preview:', error);
        } finally {
            setLoading(false);
        }
    };

    const config = nodeData.dbType ? typeConfig[nodeData.dbType] : null;

    // If no database link, just return children
    if (!nodeData.dbId || !nodeData.dbType) {
        return <>{children}</>;
    }

    return (
        <HoverCard openDelay={300} closeDelay={100} onOpenChange={(open) => open && fetchPreview()}>
            <HoverCardTrigger asChild>{children}</HoverCardTrigger>
            <HoverCardContent
                side={side}
                className="w-80 p-0 overflow-hidden"
                sideOffset={10}
            >
                {loading ? (
                    <div className="p-4 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                ) : preview ? (
                    <div className="divide-y divide-border">
                        {/* Header */}
                        <div className={`p-3 ${config?.bgColor || 'bg-muted/30'}`}>
                            <div className="flex items-center gap-2">
                                {config && <config.Icon className={`h-5 w-5 ${config.color}`} />}
                                <div>
                                    <h4 className="font-semibold text-sm">{preview.name}</h4>
                                    {preview.status && (
                                        <Badge variant="secondary" className="mt-1 text-xs">
                                            {preview.status}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-3 space-y-3">
                            {preview.description && (
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {preview.description}
                                </p>
                            )}

                            {/* Metadata */}
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                {preview.createdAt && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            {new Date(preview.createdAt).toLocaleDateString('pl-PL')}
                                        </span>
                                    </div>
                                )}
                                {preview.updatedBy && (
                                    <div className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        <span>{preview.updatedBy}</span>
                                    </div>
                                )}
                            </div>

                            {/* Metrics */}
                            {preview.metrics && Object.keys(preview.metrics).length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(preview.metrics).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="px-2 py-1 rounded-md bg-muted text-xs"
                                        >
                                            <span className="text-muted-foreground">{key}:</span>{' '}
                                            <span className="font-medium">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        Nie można pobrać szczegółów
                    </div>
                )}
            </HoverCardContent>
        </HoverCard>
    );
}
