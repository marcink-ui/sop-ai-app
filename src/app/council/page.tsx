'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
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
    ThumbsDown,
    Shield,
    Activity,
    BarChart3,
    FileText,
    Lightbulb,
    Gavel,
    Eye,
    Edit3,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AnimatedCard } from '@/components/ui/animated-card';
import { RoleBadge } from '@/components/ui/status-badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Types matching API response
interface CouncilRequestAPI {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    type: string;
    module: string | null;
    labels: string[];
    createdAt: string;
    createdBy: {
        id: string;
        name: string | null;
        email: string;
        role: string;
    };
    voteCounts: { up: number; down: number };
    userVote?: string;
}

// Status mapping for API status values
const apiStatusMap: Record<string, string> = {
    'PENDING': 'pending',
    'VOTING': 'in-review',
    'APPROVED': 'approved',
    'REJECTED': 'rejected',
    'IMPLEMENTED': 'approved',
    'WITHDRAWN': 'rejected',
};

const priorityMap: Record<string, string> = {
    'HIGH': 'high',
    'MEDIUM': 'medium',
    'LOW': 'low',
    'CRITICAL': 'high',
};


const statusStyles = {
    pending: { label: 'Oczekuje', icon: Clock, class: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' },
    'in-review': { label: 'W przeglądzie', icon: AlertTriangle, class: 'bg-blue-500/20 text-blue-600 dark:text-blue-400' },
    approved: { label: 'Zatwierdzono', icon: CheckCircle2, class: 'bg-green-500/20 text-green-600 dark:text-green-400' },
    rejected: { label: 'Odrzucono', icon: XCircle, class: 'bg-red-500/20 text-red-600 dark:text-red-400' },
};

const priorityStyles = {
    high: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    low: 'bg-neutral-500/20 text-neutral-600 dark:text-neutral-400 border-neutral-500/30',
};

// Role-specific header components
function SponsorHeader() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 mb-6"
        >
            <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                <div>
                    <h2 className="text-xl font-bold text-foreground">Sponsor Decision Center</h2>
                    <p className="text-sm text-muted-foreground">Strategic oversight & final approvals</p>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-xl bg-card/50 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Gavel className="h-4 w-4" />
                        <span className="text-sm">Pending Decisions</span>
                    </div>
                    <p className="text-3xl font-bold text-amber-500 dark:text-amber-400">2</p>
                </div>
                <div className="p-4 rounded-xl bg-card/50 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm">Approved This Month</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-500 dark:text-emerald-400">5</p>
                </div>
                <div className="p-4 rounded-xl bg-card/50 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-sm">Impact Score</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-500 dark:text-blue-400">8.5</p>
                </div>
            </div>
        </motion.div>
    );
}

function PilotHeader() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 mb-6"
        >
            <div className="flex items-center gap-3 mb-4">
                <Activity className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                <div>
                    <h2 className="text-xl font-bold text-foreground">Operations Review Queue</h2>
                    <p className="text-sm text-muted-foreground">Review and prioritize change requests</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
                    <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                    <span className="text-sm font-medium text-foreground">2 requiring review</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                    <Eye className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    <span className="text-sm font-medium text-foreground">1 in review</span>
                </div>
            </div>
        </motion.div>
    );
}

function ManagerHeader() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 mb-6"
        >
            <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                <div>
                    <h2 className="text-xl font-bold text-foreground">Department Requests</h2>
                    <p className="text-sm text-muted-foreground">Your team's proposals & status</p>
                </div>
            </div>
        </motion.div>
    );
}

function ExpertHeader() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 mb-6"
        >
            <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-purple-500 dark:text-purple-400" />
                <div>
                    <h2 className="text-xl font-bold text-foreground">Expert Review Required</h2>
                    <p className="text-sm text-muted-foreground">Requests affecting your knowledge domain</p>
                </div>
            </div>
        </motion.div>
    );
}

function CitizenDevHeader() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6 mb-6"
        >
            <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="h-6 w-6 text-cyan-500 dark:text-cyan-400" />
                <div>
                    <h2 className="text-xl font-bold text-foreground">Your Innovation Proposals</h2>
                    <p className="text-sm text-muted-foreground">Track your submitted ideas & suggestions</p>
                </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Submit New Idea
                </Button>
            </div>
        </motion.div>
    );
}

export default function CouncilPage() {
    const { data: session } = useSession();
    const role = session?.user?.role || 'CITIZEN_DEV';

    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [requests, setRequests] = useState<CouncilRequestAPI[]>([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, voting: 0 });

    // Fetch requests from API
    const loadRequests = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.set('status', statusFilter);
            if (search) params.set('search', search);

            const response = await fetch(`/api/council/requests?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setRequests(data.requests || []);
                setStats(data.stats || { total: 0, pending: 0, approved: 0, rejected: 0, voting: 0 });
            }
        } catch (error) {
            console.error('Failed to load council requests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Debounced filtering
    useEffect(() => {
        const timer = setTimeout(() => { loadRequests(); }, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, search]);

    const filteredRequests = requests.map(req => ({
        id: req.id,
        title: req.title,
        description: req.description || '',
        status: apiStatusMap[req.status] || 'pending',
        priority: priorityMap[req.priority] || 'medium',
        requester: req.createdBy?.name || req.createdBy?.email || 'Unknown',
        requesterRole: req.createdBy?.role || 'CITIZEN_DEV',
        department: req.module || 'General',
        createdAt: new Date(req.createdAt).toLocaleDateString('pl-PL'),
        votes: req.voteCounts,
        estimatedImpact: req.labels.length > 0 ? req.labels.join(', ') : 'Not specified',
    }));


    // Determine if user can approve/reject (Sponsor, Pilot)
    const canApprove = role === 'SPONSOR' || role === 'PILOT';
    // Determine if user can edit (Manager, Expert)
    const canEdit = role === 'MANAGER' || role === 'EXPERT' || role === 'SPONSOR' || role === 'PILOT';

    // Render role-specific header
    const renderHeader = () => {
        switch (role) {
            case 'SPONSOR':
                return <SponsorHeader />;
            case 'PILOT':
                return <PilotHeader />;
            case 'MANAGER':
                return <ManagerHeader />;
            case 'EXPERT':
                return <ExpertHeader />;
            case 'CITIZEN_DEV':
            default:
                return <CitizenDevHeader />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-pink-500/20 p-2">
                        <MessageSquare className="h-6 w-6 text-pink-500 dark:text-pink-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Council Requests</h1>
                        <p className="text-sm text-muted-foreground">Wnioski o zmianę procedur i propozycje</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <RoleBadge role={role as 'SPONSOR' | 'PILOT' | 'MANAGER' | 'EXPERT' | 'CITIZEN_DEV'} />
                    <Button className="bg-pink-600 hover:bg-pink-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Nowy wniosek
                    </Button>
                </div>
            </div>

            {/* Role-specific Header */}
            {renderHeader()}

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <AnimatedCard delay={0.1} className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">Wszystkie wnioski</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">{stats.total}</p>
                </AnimatedCard>
                <AnimatedCard delay={0.2} className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Oczekujące</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-yellow-500 dark:text-yellow-400">{stats.pending}</p>
                </AnimatedCard>
                <AnimatedCard delay={0.3} className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm">Zatwierdzone</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-green-500 dark:text-green-400">{stats.approved}</p>
                </AnimatedCard>
                <AnimatedCard delay={0.4} className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">Odrzucone</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-red-500 dark:text-red-400">{stats.rejected}</p>
                </AnimatedCard>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <MessageSquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj wniosków..."
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
                        <SelectItem value="all">Wszystkie</SelectItem>
                        <SelectItem value="pending">Oczekujące</SelectItem>
                        <SelectItem value="in-review">W przeglądzie</SelectItem>
                        <SelectItem value="approved">Zatwierdzone</SelectItem>
                        <SelectItem value="rejected">Odrzucone</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card/50 p-12 text-center">
                        <MessageSquare className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">Nie znaleziono wniosków</p>
                    </div>
                ) : (
                    filteredRequests.map((request, index) => {
                        const StatusIcon = statusStyles[request.status as keyof typeof statusStyles].icon;
                        return (
                            <motion.div
                                key={request.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
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
                                                {request.priority === 'high' ? 'wysoki' : request.priority === 'medium' ? 'średni' : 'niski'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-4">{request.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                {request.requester}
                                            </div>
                                            <RoleBadge role={request.requesterRole as 'SPONSOR' | 'PILOT' | 'MANAGER' | 'EXPERT' | 'CITIZEN_DEV'} size="sm" />
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {request.createdAt}
                                            </div>
                                            <Badge variant="outline" className="border-border">
                                                {request.department}
                                            </Badge>
                                        </div>
                                        {/* Show impact for Sponsors and Pilots */}
                                        {(role === 'SPONSOR' || role === 'PILOT') && (
                                            <div className="mt-3 p-2 rounded-lg bg-muted/30 text-sm">
                                                <span className="text-muted-foreground">Wpływ: </span>
                                                <span className="text-foreground font-medium">{request.estimatedImpact}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <Badge className={statusStyles[request.status as keyof typeof statusStyles].class}>
                                            <StatusIcon className="mr-1 h-3 w-3" />
                                            {statusStyles[request.status as keyof typeof statusStyles].label}
                                        </Badge>
                                        <div className="flex items-center gap-3">
                                            <button className="flex items-center gap-1 text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300">
                                                <ThumbsUp className="h-4 w-4" />
                                                <span className="text-sm">{request.votes.up}</span>
                                            </button>
                                            <button className="flex items-center gap-1 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300">
                                                <ThumbsDown className="h-4 w-4" />
                                                <span className="text-sm">{request.votes.down}</span>
                                            </button>
                                        </div>
                                        {/* Role-based actions */}
                                        {canApprove && request.status === 'pending' && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <Button size="sm" variant="outline" className="text-green-500 border-green-500/30 hover:bg-green-500/10">
                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                    Zatwierdź
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-500 border-red-500/30 hover:bg-red-500/10">
                                                    <XCircle className="mr-1 h-3 w-3" />
                                                    Odrzuć
                                                </Button>
                                            </div>
                                        )}
                                        {canEdit && (
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                                                    <Edit3 className="h-3 w-3" />
                                                </Button>
                                                {role === 'SPONSOR' && (
                                                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
