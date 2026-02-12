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
import { L10Meeting } from '@/components/council/L10Meeting';
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

const typeCategories = [
    { key: 'all', label: 'Wszystkie', icon: MessageSquare },
    { key: 'AGENT', label: 'Agenci AI', icon: Activity },
    { key: 'SOP', label: 'SOP', icon: FileText },
    { key: 'MUDA', label: 'MUDA', icon: AlertTriangle },
    { key: 'KAIZEN', label: 'Kaizen', icon: Lightbulb },
    { key: 'AUTOMATION', label: 'Automatyzacje', icon: Gavel },
    { key: 'TASK', label: 'Zadania', icon: CheckCircle2 },
];

// Role-specific header components
function SponsorHeader({ stats }: { stats: { total: number; pending: number; approved: number; rejected: number; voting: number } }) {
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
                    <p className="text-3xl font-bold text-amber-500 dark:text-amber-400">{stats.pending}</p>
                </div>
                <div className="p-4 rounded-xl bg-card/50 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm">Approved</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-500 dark:text-emerald-400">{stats.approved}</p>
                </div>
                <div className="p-4 rounded-xl bg-card/50 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-sm">Total Requests</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-500 dark:text-blue-400">{stats.total}</p>
                </div>
            </div>
        </motion.div>
    );
}

function PilotHeader({ stats }: { stats: { total: number; pending: number; approved: number; rejected: number; voting: number } }) {
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
                    <span className="text-sm font-medium text-foreground">{stats.pending} requiring review</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                    <Eye className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    <span className="text-sm font-medium text-foreground">{stats.voting} in review</span>
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
    const [typeFilter, setTypeFilter] = useState('all');
    const [activeView, setActiveView] = useState<'requests' | 'l10'>('requests');

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
    })).filter(req => {
        if (typeFilter === 'all') return true;
        const originalReq = requests.find(r => r.id === req.id);
        return originalReq?.type === typeFilter;
    });


    // Determine if user can approve/reject (Sponsor, Pilot)
    const canApprove = role === 'SPONSOR' || role === 'PILOT';
    // Determine if user can edit (Manager, Expert)
    const canEdit = role === 'MANAGER' || role === 'EXPERT' || role === 'SPONSOR' || role === 'PILOT';

    // Render role-specific header
    const renderHeader = () => {
        switch (role) {
            case 'SPONSOR':
                return <SponsorHeader stats={stats} />;
            case 'PILOT':
                return <PilotHeader stats={stats} />;
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
                        <h1 className="text-2xl font-bold text-foreground">Rada Transformacji</h1>
                        <p className="text-sm text-muted-foreground">Wnioski, decyzje i spotkania Level 10</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <RoleBadge role={role as 'SPONSOR' | 'PILOT' | 'MANAGER' | 'EXPERT' | 'CITIZEN_DEV'} />
                    {activeView === 'requests' && (
                        <Button className="bg-pink-600 hover:bg-pink-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Nowy wniosek
                        </Button>
                    )}
                </div>
            </div>

            {/* View Tabs */}
            <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl w-fit">
                <button
                    onClick={() => setActiveView('requests')}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeView === 'requests'
                        ? 'bg-card shadow-sm text-foreground border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <MessageSquare className="h-4 w-4 inline-block mr-2" />
                    Wnioski
                </button>
                <button
                    onClick={() => setActiveView('l10')}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeView === 'l10'
                        ? 'bg-card shadow-sm text-foreground border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Clock className="h-4 w-4 inline-block mr-2" />
                    Level 10
                </button>
            </div>

            {activeView === 'l10' ? (
                <L10Meeting />
            ) : (
                <>
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

                    {/* Type Category Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 -mb-px">
                        {typeCategories.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = typeFilter === cat.key;
                            return (
                                <button
                                    key={cat.key}
                                    onClick={() => setTypeFilter(cat.key)}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${isActive
                                        ? 'bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/30'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {cat.label}
                                </button>
                            );
                        })}
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

                    {/* Requests Table */}
                    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-[1fr_140px_100px_120px_80px_auto] gap-4 px-5 py-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            <span>Wniosek</span>
                            <span>Wnioskodawca</span>
                            <span>Dział</span>
                            <span>Status</span>
                            <span>Głosy</span>
                            <span>Akcje</span>
                        </div>

                        {filteredRequests.length === 0 ? (
                            <div className="p-12 text-center">
                                <MessageSquare className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">Nie znaleziono wniosków</p>
                            </div>
                        ) : (
                            filteredRequests.map((request, index) => {
                                const StatusIcon = statusStyles[request.status as keyof typeof statusStyles].icon;
                                return (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 * index }}
                                        className="grid grid-cols-[1fr_140px_100px_120px_80px_auto] gap-4 px-5 py-4 border-b border-border/50 last:border-0 items-center transition-colors hover:bg-muted/20 cursor-pointer"
                                    >
                                        {/* Title + Priority */}
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium text-foreground text-sm truncate">{request.title}</h3>
                                                <Badge
                                                    variant="outline"
                                                    className={`shrink-0 text-[10px] px-1.5 py-0 ${priorityStyles[request.priority as keyof typeof priorityStyles]}`}
                                                >
                                                    {request.priority === 'high' ? 'H' : request.priority === 'medium' ? 'M' : 'L'}
                                                </Badge>
                                            </div>
                                            {request.description && (
                                                <p className="text-xs text-muted-foreground truncate">{request.description}</p>
                                            )}
                                        </div>

                                        {/* Requester */}
                                        <div className="flex items-center gap-2 min-w-0">
                                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <span className="text-sm text-muted-foreground truncate">{request.requester}</span>
                                        </div>

                                        {/* Department */}
                                        <Badge variant="outline" className="border-border text-xs justify-center">
                                            {request.department}
                                        </Badge>

                                        {/* Status */}
                                        <Badge className={`text-xs justify-center ${statusStyles[request.status as keyof typeof statusStyles].class}`}>
                                            <StatusIcon className="mr-1 h-3 w-3" />
                                            {statusStyles[request.status as keyof typeof statusStyles].label}
                                        </Badge>

                                        {/* Votes */}
                                        <div className="flex items-center gap-2">
                                            <button className="flex items-center gap-0.5 text-green-500 dark:text-green-400 hover:text-green-600">
                                                <ThumbsUp className="h-3.5 w-3.5" />
                                                <span className="text-xs">{request.votes.up}</span>
                                            </button>
                                            <button className="flex items-center gap-0.5 text-red-500 dark:text-red-400 hover:text-red-600">
                                                <ThumbsDown className="h-3.5 w-3.5" />
                                                <span className="text-xs">{request.votes.down}</span>
                                            </button>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1">
                                            {canApprove && request.status === 'pending' && (
                                                <>
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-500 hover:bg-green-500/10">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10">
                                                        <XCircle className="h-3.5 w-3.5" />
                                                    </Button>
                                                </>
                                            )}
                                            {canEdit && (
                                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                            {role === 'SPONSOR' && (
                                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
