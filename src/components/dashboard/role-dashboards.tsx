'use client';

import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import {
    TrendingUp,
    Target,
    DollarSign,
    Users,
    FileText,
    Bot,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Lightbulb,
    BarChart3,
    Shield,
    Sparkles,
    Activity,
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { AnimatedCard } from '@/components/ui/animated-card';

interface DashboardData {
    sops: number;
    agents: number;
    mudaReports: number;
    council: number;
    users: number;
    totalSavings: number;
}

interface RoleDashboardProps {
    data: DashboardData;
}

// SPONSOR Dashboard - Strategic overview, full metrics
export function SponsorDashboard({ data }: RoleDashboardProps) {
    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-6 w-6 text-amber-400" />
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Executive Dashboard</h2>
                        <p className="text-sm text-muted-foreground">Strategic overview & KPIs</p>
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 rounded-xl bg-card/50 border border-border">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-sm">Potential ROI</span>
                        </div>
                        <p className="text-3xl font-bold text-emerald-400">
                            {data.totalSavings.toLocaleString()} PLN
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">From MUDA elimination</p>
                    </div>
                    <div className="p-4 rounded-xl bg-card/50 border border-border">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm">AI Adoption</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-400">
                            {data.agents > 0 ? Math.round((data.agents / data.sops) * 100) : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Processes with AI</p>
                    </div>
                    <div className="p-4 rounded-xl bg-card/50 border border-border">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Target className="h-4 w-4" />
                            <span className="text-sm">Transformation Score</span>
                        </div>
                        <p className="text-3xl font-bold text-purple-400">7.2/10</p>
                        <p className="text-xs text-muted-foreground mt-1">Digital maturity</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-4">
                <StatCard title="Procedures" value={data.sops} icon={FileText} color="blue" delay={0.1} />
                <StatCard title="AI Agents" value={data.agents} icon={Bot} color="purple" delay={0.2} />
                <StatCard title="Waste Reports" value={data.mudaReports} icon={AlertTriangle} color="amber" delay={0.3} />
                <StatCard title="Team Members" value={data.users} icon={Users} color="green" delay={0.4} />
            </div>
        </div>
    );
}

// PILOT Dashboard - Operational KPIs
export function PilotDashboard({ data }: RoleDashboardProps) {
    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <Activity className="h-6 w-6 text-blue-400" />
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Operations Dashboard</h2>
                        <p className="text-sm text-muted-foreground">Performance & efficiency metrics</p>
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="p-4 rounded-xl bg-card/50 border border-border">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Pending Decisions</span>
                            <Clock className="h-4 w-4 text-amber-400" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{data.council}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-card/50 border border-border">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Active SOPs</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{data.sops}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-card/50 border border-border">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">AI Coverage</span>
                            <Bot className="h-4 w-4 text-purple-400" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{data.agents}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-card/50 border border-border">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Open Issues</span>
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{data.mudaReports}</p>
                    </div>
                </div>
            </motion.div>

            <AnimatedCard delay={0.2}>
                <h3 className="font-semibold text-foreground mb-4">Priority Actions</h3>
                <div className="space-y-3">
                    {data.council > 0 && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <Clock className="h-5 w-5 text-amber-400" />
                            <span className="text-sm text-foreground">{data.council} council requests awaiting review</span>
                        </div>
                    )}
                    {data.mudaReports > 0 && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                            <span className="text-sm text-foreground">{data.mudaReports} waste reports to analyze</span>
                        </div>
                    )}
                </div>
            </AnimatedCard>
        </div>
    );
}

// MANAGER Dashboard - Department-scoped
export function ManagerDashboard({ data }: RoleDashboardProps) {
    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="h-6 w-6 text-emerald-400" />
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Department Overview</h2>
                        <p className="text-sm text-muted-foreground">Your team's procedures & agents</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatCard title="Team SOPs" value={data.sops} icon={FileText} color="green" delay={0.1} />
                <StatCard title="Assigned Agents" value={data.agents} icon={Bot} color="purple" delay={0.2} />
                <StatCard title="Your Requests" value={data.council} icon={Clock} color="amber" delay={0.3} />
            </div>
        </div>
    );
}

// EXPERT Dashboard - Knowledge owner view
export function ExpertDashboard({ data }: RoleDashboardProps) {
    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <FileText className="h-6 w-6 text-purple-400" />
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Knowledge Base</h2>
                        <p className="text-sm text-muted-foreground">Your expertise domains</p>
                    </div>
                </div>
                <p className="text-muted-foreground">
                    You own <span className="text-purple-400 font-semibold">{data.sops} SOPs</span> and
                    manage <span className="text-pink-400 font-semibold">{data.agents} AI agents</span>.
                </p>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2">
                <StatCard title="Owned SOPs" value={data.sops} icon={FileText} color="purple" delay={0.1} />
                <StatCard title="Managed Agents" value={data.agents} icon={Bot} color="purple" delay={0.2} />
            </div>
        </div>
    );
}

// CITIZEN_DEV Dashboard - Innovation mode
export function CitizenDevDashboard({ data }: RoleDashboardProps) {
    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="h-6 w-6 text-cyan-400" />
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Innovation Hub</h2>
                        <p className="text-sm text-muted-foreground">Explore & propose improvements</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                        <Lightbulb className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm text-foreground">Submit Idea</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                        <Bot className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-foreground">Request Agent</span>
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatCard title="Available SOPs" value={data.sops} icon={FileText} color="blue" delay={0.1} description="Browse knowledge" />
                <StatCard title="Active Agents" value={data.agents} icon={Bot} color="purple" delay={0.2} description="AI assistants" />
                <StatCard title="Open Proposals" value={data.council} icon={Lightbulb} color="cyan" delay={0.3} description="Your ideas" />
            </div>
        </div>
    );
}

// Main component that renders based on role
export function RoleBasedDashboard({ data }: RoleDashboardProps) {
    const { data: session } = useSession();
    const role = session?.user?.role || 'CITIZEN_DEV';

    switch (role) {
        case 'SPONSOR':
            return <SponsorDashboard data={data} />;
        case 'PILOT':
            return <PilotDashboard data={data} />;
        case 'MANAGER':
            return <ManagerDashboard data={data} />;
        case 'EXPERT':
            return <ExpertDashboard data={data} />;
        case 'CITIZEN_DEV':
        default:
            return <CitizenDevDashboard data={data} />;
    }
}
