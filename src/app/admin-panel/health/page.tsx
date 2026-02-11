'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft, Activity, CheckCircle2, AlertTriangle,
    XCircle, Clock, Server, Database, Globe,
    Cpu, HardDrive, Zap, RefreshCw, Wifi,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ServiceStatus {
    id: string;
    name: string;
    icon: React.ElementType;
    status: 'healthy' | 'degraded' | 'down';
    uptime: string;
    latency: string;
    lastCheck: string;
    details: string;
}

const services: ServiceStatus[] = [
    { id: 's1', name: 'Next.js Application', icon: Globe, status: 'healthy', uptime: '99.97%', latency: '45ms', lastCheck: '30s ago', details: 'All routes responding normally' },
    { id: 's2', name: 'PostgreSQL Database', icon: Database, status: 'healthy', uptime: '99.99%', latency: '12ms', lastCheck: '15s ago', details: 'Primary + replica healthy, 2.4GB used' },
    { id: 's3', name: 'Redis Cache', icon: Zap, status: 'healthy', uptime: '99.98%', latency: '2ms', lastCheck: '10s ago', details: 'Hit ratio 94%, 128MB used' },
    { id: 's4', name: 'OpenAI API', icon: Cpu, status: 'healthy', uptime: '99.8%', latency: '850ms', lastCheck: '1m ago', details: 'GPT-4 Turbo - rate limit OK' },
    { id: 's5', name: 'Email Service (Resend)', icon: Wifi, status: 'degraded', uptime: '98.5%', latency: '1.2s', lastCheck: '2m ago', details: 'Elevated latency on newsletter delivery' },
    { id: 's6', name: 'Railway Hosting', icon: Server, status: 'healthy', uptime: '99.95%', latency: '38ms', lastCheck: '30s ago', details: 'All containers running, 512MB RAM used' },
    { id: 's7', name: 'File Storage (S3)', icon: HardDrive, status: 'healthy', uptime: '99.99%', latency: '65ms', lastCheck: '1m ago', details: '1.2GB stored, CDN cached' },
    { id: 's8', name: 'Cron Jobs', icon: Clock, status: 'healthy', uptime: '100%', latency: '—', lastCheck: '5m ago', details: 'Backup: OK, Cleanup: OK, Report: OK' },
];

const systemMetrics = [
    { label: 'CPU Usage', value: 23, max: 100, unit: '%', color: 'bg-blue-500' },
    { label: 'Memory Usage', value: 512, max: 1024, unit: 'MB', color: 'bg-violet-500' },
    { label: 'Disk Usage', value: 2.4, max: 10, unit: 'GB', color: 'bg-emerald-500' },
    { label: 'Active Connections', value: 34, max: 200, unit: '', color: 'bg-amber-500' },
];

const statusIcons: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    healthy: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Healthy' },
    degraded: { icon: AlertTriangle, color: 'text-amber-500', label: 'Degraded' },
    down: { icon: XCircle, color: 'text-red-500', label: 'Down' },
};

export default function SystemHealthPage() {
    const { data: session, isPending } = useSession();
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    if (isPending) {
        return <div className="flex items-center justify-center h-64"><Activity className="h-8 w-8 animate-pulse text-green-500" /></div>;
    }
    if (session?.user?.role !== 'META_ADMIN') {
        redirect('/');
    }

    const healthyCount = services.filter(s => s.status === 'healthy').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;
    const downCount = services.filter(s => s.status === 'down').length;
    const overallStatus = downCount > 0 ? 'down' : degradedCount > 0 ? 'degraded' : 'healthy';
    const OverallIcon = statusIcons[overallStatus].icon;

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            setLastRefresh(new Date());
        }, 1500);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin-panel">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Stan Systemu</h1>
                            <Badge className={cn('text-xs',
                                overallStatus === 'healthy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                    overallStatus === 'degraded' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                        'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                            )}>
                                <OverallIcon className="h-3 w-3 mr-1" />
                                {statusIcons[overallStatus].label}
                            </Badge>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {healthyCount} healthy, {degradedCount} degraded, {downCount} down
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
                    {refreshing ? 'Odświeżanie...' : 'Odśwież'}
                </Button>
            </div>

            {/* System Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {systemMetrics.map((metric, i) => (
                    <motion.div key={metric.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{metric.label}</span>
                                    <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                        {metric.value}{metric.unit} / {metric.max}{metric.unit}
                                    </span>
                                </div>
                                <Progress value={(metric.value / metric.max) * 100} className="h-1.5" />
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Services */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Server className="h-4 w-4 text-emerald-500" />
                        Serwisy ({services.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {services.map((service, i) => {
                            const StatusIcon = statusIcons[service.status].icon;
                            const ServiceIcon = service.icon;
                            return (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="px-4 py-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-9 w-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                                            <ServiceIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <StatusIcon className={cn('h-4 w-4', statusIcons[service.status].color)} />
                                                <span className="font-medium text-sm text-neutral-900 dark:text-white">{service.name}</span>
                                            </div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{service.details}</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs shrink-0">
                                            <div className="text-center">
                                                <div className="font-semibold text-neutral-900 dark:text-white">{service.uptime}</div>
                                                <div className="text-neutral-400">Uptime</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-semibold text-neutral-900 dark:text-white">{service.latency}</div>
                                                <div className="text-neutral-400">Latency</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-neutral-400">{service.lastCheck}</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Last refresh */}
            <div className="text-xs text-neutral-400 text-center">
                Ostatnie odświeżenie: {lastRefresh.toLocaleString('pl-PL')}
            </div>
        </div>
    );
}
