'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Bot,
  Search,
  Users,
  GitBranch,
  Scale,
  TrendingUp,
  Clock,
  Plus,
  Sparkles,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { sopDb, mudaDb, agentDb } from '@/lib/db';
import type { SOP } from '@/lib/types';

interface Stats {
  sops: number;
  agents: number;
  muda: number;
  savings: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ sops: 0, agents: 0, muda: 0, savings: 0 });
  const [recentSops, setRecentSops] = useState<SOP[]>([]);

  useEffect(() => {
    const sops = sopDb.getAll();
    const agents = agentDb.getAll();
    const muda = mudaDb.getAll();

    const totalSavings = muda.reduce((acc, m) => acc + (m.summary?.total_potential_saving_min || 0) / 60, 0);

    setStats({
      sops: sops.length,
      agents: agents.length,
      muda: muda.length,
      savings: totalSavings,
    });

    setRecentSops(sops.slice(-5).reverse());
  }, []);

  const databases = [
    { name: 'SOPs', href: '/sops', icon: FileText, count: stats.sops, gradient: 'from-blue-500/20 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/10', iconColor: 'text-blue-600 dark:text-blue-400', borderColor: 'hover:border-blue-500/50' },
    { name: 'AI Agents', href: '/agents', icon: Bot, count: stats.agents, gradient: 'from-purple-500/20 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/10', iconColor: 'text-purple-600 dark:text-purple-400', borderColor: 'hover:border-purple-500/50' },
    { name: 'MUDA Reports', href: '/muda', icon: Search, count: stats.muda, gradient: 'from-orange-500/20 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-600/10', iconColor: 'text-orange-600 dark:text-orange-400', borderColor: 'hover:border-orange-500/50' },
    { name: 'Roles Registry', href: '/roles', icon: Users, count: 0, gradient: 'from-green-500/20 to-green-600/10 dark:from-green-500/20 dark:to-green-600/10', iconColor: 'text-green-600 dark:text-green-400', borderColor: 'hover:border-green-500/50' },
    { name: 'Value Chain', href: '/value-chain', icon: GitBranch, count: 0, gradient: 'from-cyan-500/20 to-cyan-600/10 dark:from-cyan-500/20 dark:to-cyan-600/10', iconColor: 'text-cyan-600 dark:text-cyan-400', borderColor: 'hover:border-cyan-500/50' },
    { name: 'Council', href: '/council', icon: Scale, count: 0, gradient: 'from-amber-500/20 to-amber-600/10 dark:from-yellow-500/20 dark:to-yellow-600/10', iconColor: 'text-amber-600 dark:text-yellow-400', borderColor: 'hover:border-yellow-500/50' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl border p-8 border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-blue-50 dark:border-neutral-800 dark:bg-gradient-to-br dark:from-neutral-900 dark:via-neutral-900 dark:to-blue-950/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">SOP-AI</span>
            </div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
              Welcome back
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
              Transform your Standard Operating Procedures into intelligent AI Agents.
              Automate workflows and eliminate waste.
            </p>
          </div>
          <Link href="/sops/new">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-105">
              <Plus className="mr-2 h-5 w-5" />
              Create New SOP
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards with Gradient Borders */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total SOPs"
          value={stats.sops}
          icon={FileText}
          trend="+12%"
          gradient="from-blue-500 to-blue-600"
          bgGradient="from-blue-500/10 to-transparent"
        />
        <StatCard
          title="AI Agents"
          value={stats.agents}
          icon={Bot}
          trend="+5"
          gradient="from-purple-500 to-purple-600"
          bgGradient="from-purple-500/10 to-transparent"
        />
        <StatCard
          title="MUDA Reports"
          value={stats.muda}
          icon={Search}
          trend="+3"
          gradient="from-orange-500 to-orange-600"
          bgGradient="from-orange-500/10 to-transparent"
        />
        <StatCard
          title="Monthly Savings"
          value={`${Math.round(stats.savings)}h`}
          icon={Clock}
          trend="+18%"
          gradient="from-green-500 to-green-600"
          bgGradient="from-green-500/10 to-transparent"
        />
      </div>

      {/* Database Grid with Hover Effects */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Zap className="h-5 w-5 text-amber-500 dark:text-yellow-400" />
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Databases</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {databases.map((db) => (
            <Link key={db.href} href={db.href}>
              <div className={`group relative overflow-hidden rounded-xl border p-5 transition-all duration-300 ${db.borderColor} hover:shadow-lg hover:-translate-y-1 border-neutral-200 bg-white dark:border-neutral-800 dark:bg-gradient-to-br ${db.gradient}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2.5 backdrop-blur-sm bg-neutral-100 dark:bg-neutral-900/50">
                      <db.icon className={`h-5 w-5 ${db.iconColor}`} />
                    </div>
                    <span className="font-medium text-neutral-900 dark:text-white">{db.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-neutral-100 dark:bg-neutral-900/70 backdrop-blur-sm border-0">
                      {db.count} records
                    </Badge>
                    <ArrowUpRight className="h-4 w-4 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent SOPs with Enhanced Table */}
      {recentSops.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Recent Activity</h2>
            <Link href="/sops" className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
              View all
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-xl border overflow-hidden backdrop-blur-sm border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/50">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/80">
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSops.map((sop, index) => (
                  <tr
                    key={sop.id}
                    className="border-b last:border-0 transition-colors cursor-pointer border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800/50 dark:hover:bg-neutral-800/30"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-4 py-4">
                      <span className="font-medium text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{sop.meta.process_name}</span>
                    </td>
                    <td className="px-4 py-4 text-neutral-600 dark:text-neutral-400">{sop.meta.department}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={sop.status} />
                    </td>
                    <td className="px-4 py-4 text-neutral-500 text-sm">
                      {new Date(sop.meta.created_date).toLocaleDateString('pl-PL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State with Call to Action */}
      {recentSops.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-4">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No SOPs yet</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-sm mx-auto">
            Create your first Standard Operating Procedure to start transforming your workflows into AI agents.
          </p>
          <Link href="/sops/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create your first SOP
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  gradient,
  bgGradient
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  gradient: string;
  bgGradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border p-5 transition-all hover:shadow-lg border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700 dark:hover:shadow-black/20">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/10 px-2 py-1 rounded-full">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">{value}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{title}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; dot: string }> = {
    draft: { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-600 dark:text-neutral-400', dot: 'bg-neutral-500' },
    generated: { bg: 'bg-blue-100 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
    audited: { bg: 'bg-orange-100 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
    architected: { bg: 'bg-cyan-100 dark:bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', dot: 'bg-cyan-500' },
    'prompt-generated': { bg: 'bg-purple-100 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' },
    completed: { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' },
  };

  const style = styles[status] || styles.draft;

  return (
    <Badge className={`${style.bg} ${style.text} border-0`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${style.dot} inline-block`} />
      {status}
    </Badge>
  );
}
