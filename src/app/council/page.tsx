'use client';

import { useState } from 'react';
import {
    MessageSquare,
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    User,
    Calendar,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Sample council requests
const sampleRequests = [
    {
        id: 'req-1',
        title: 'Add CRM integration to Sales SOP',
        description: 'Request to integrate HubSpot CRM with the sales process SOP for automatic lead tracking.',
        status: 'pending',
        priority: 'high',
        requester: 'Anna Nowak',
        department: 'Sales',
        createdAt: '2024-01-15',
        votes: { up: 5, down: 1 },
    },
    {
        id: 'req-2',
        title: 'Update onboarding documentation',
        description: 'The current onboarding SOP is outdated and needs revision for new compliance requirements.',
        status: 'approved',
        priority: 'medium',
        requester: 'Piotr Wiśniewski',
        department: 'HR',
        createdAt: '2024-01-12',
        votes: { up: 8, down: 0 },
    },
    {
        id: 'req-3',
        title: 'Automate invoice processing',
        description: 'Proposal to create an AI agent for automatic invoice data extraction and entry.',
        status: 'in-review',
        priority: 'high',
        requester: 'Maria Kowalska',
        department: 'Finance',
        createdAt: '2024-01-10',
        votes: { up: 12, down: 2 },
    },
    {
        id: 'req-4',
        title: 'Remove legacy shipping SOP',
        description: 'The old shipping process is no longer used since the new logistics system was implemented.',
        status: 'rejected',
        priority: 'low',
        requester: 'Jan Mazur',
        department: 'Operations',
        createdAt: '2024-01-08',
        votes: { up: 2, down: 6 },
    },
];

const statusStyles = {
    pending: { label: 'Pending', icon: Clock, class: 'bg-yellow-500/20 text-yellow-400' },
    'in-review': { label: 'In Review', icon: AlertTriangle, class: 'bg-blue-500/20 text-blue-400' },
    approved: { label: 'Approved', icon: CheckCircle2, class: 'bg-green-500/20 text-green-400' },
    rejected: { label: 'Rejected', icon: XCircle, class: 'bg-red-500/20 text-red-400' },
};

const priorityStyles = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
};

export default function CouncilPage() {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [search, setSearch] = useState('');

    const filteredRequests = sampleRequests.filter((req) => {
        const matchesSearch = req.title.toLowerCase().includes(search.toLowerCase()) ||
            req.description.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: sampleRequests.length,
        pending: sampleRequests.filter(r => r.status === 'pending').length,
        approved: sampleRequests.filter(r => r.status === 'approved').length,
        rejected: sampleRequests.filter(r => r.status === 'rejected').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-pink-500/20 p-2">
                        <MessageSquare className="h-6 w-6 text-pink-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Council Requests</h1>
                        <p className="text-sm text-muted-foreground">SOP change requests & proposals</p>
                    </div>
                </div>
                <Button className="bg-pink-600 hover:bg-pink-700">
                    <Plus className="mr-2 h-4 w-4" />
                    New Request
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">Total Requests</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Pending</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-yellow-400">{stats.pending}</p>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm">Approved</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-green-400">{stats.approved}</p>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">Rejected</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-red-400">{stats.rejected}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <MessageSquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search requests..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card border-border"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 bg-card border-border">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-review">In Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card/50 p-12 text-center">
                        <MessageSquare className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No requests found</p>
                    </div>
                ) : (
                    filteredRequests.map((request) => {
                        const StatusIcon = statusStyles[request.status as keyof typeof statusStyles].icon;
                        return (
                            <div
                                key={request.id}
                                className="rounded-xl border border-border bg-card/50 p-5 transition-colors hover:bg-muted/30"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-medium text-foreground">{request.title}</h3>
                                            <Badge
                                                variant="outline"
                                                className={priorityStyles[request.priority as keyof typeof priorityStyles]}
                                            >
                                                {request.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-4">{request.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                {request.requester}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {request.createdAt}
                                            </div>
                                            <Badge variant="outline" className="border-border">
                                                {request.department}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <Badge className={statusStyles[request.status as keyof typeof statusStyles].class}>
                                            <StatusIcon className="mr-1 h-3 w-3" />
                                            {statusStyles[request.status as keyof typeof statusStyles].label}
                                        </Badge>
                                        <div className="flex items-center gap-3">
                                            <button className="flex items-center gap-1 text-green-400 hover:text-green-300">
                                                <ThumbsUp className="h-4 w-4" />
                                                <span className="text-sm">{request.votes.up}</span>
                                            </button>
                                            <button className="flex items-center gap-1 text-red-400 hover:text-red-300">
                                                <ThumbsDown className="h-4 w-4" />
                                                <span className="text-sm">{request.votes.down}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
