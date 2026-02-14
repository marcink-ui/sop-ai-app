'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Users, FileText, Bot, ArrowLeft,
    BarChart3, Target, Lightbulb, CheckCircle2,
    Clock, AlertTriangle, TrendingUp, Rocket,
    Shield, Zap, ChevronRight, Plus, Download,
    RefreshCw, Search, Edit3, Eye, MoreHorizontal,
    Activity, Layers, Brain, Settings2,
    ArrowUpDown, Filter, UserCheck, Mail,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================================
// DEMO DATA — realistic blind data for testing & presentations
// ============================================================

interface CompanyData {
    id: string;
    name: string;
    slug: string;
    industry: string;
    employees: number;
    transformationPhase: number;
    transformationPhaseName: string;
    startDate: string;
    partnerRole: string;
    stats: {
        totalSOPs: number;
        digitizedSOPs: number;
        aiAgents: number;
        mudaReports: number;
        kaizenIdeas: number;
        roiSaved: number;
    };
    team: TeamMember[];
    sops: SOPItem[];
    agents: AgentItem[];
    mudaReports: MudaReport[];
    timeline: TimelineEvent[];
    canvasData: Record<string, string>;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    department: string;
    avatar: string;
    sopCount: number;
    aiUsage: number;
}

interface SOPItem {
    id: string;
    name: string;
    department: string;
    status: 'ACTIVE' | 'DRAFT' | 'IN_REVIEW' | 'ARCHIVED';
    version: string;
    lastUpdated: string;
    aiEnhanced: boolean;
    steps: number;
}

interface AgentItem {
    id: string;
    name: string;
    type: string;
    sopsUsed: number;
    interactions: number;
    satisfaction: number;
    status: 'ACTIVE' | 'TESTING' | 'DRAFT';
}

interface MudaReport {
    id: string;
    title: string;
    category: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    estimatedSaving: number;
    department: string;
}

interface TimelineEvent {
    id: string;
    date: string;
    title: string;
    description: string;
    type: 'milestone' | 'workshop' | 'deploy' | 'review';
    completed: boolean;
}

function generateDemoData(slug: string): CompanyData {
    return {
        id: `demo-${slug}`,
        name: 'TechFlow Solutions',
        slug,
        industry: 'IT Services & Consulting',
        employees: 48,
        transformationPhase: 2,
        transformationPhaseName: 'Digitalizacja',
        startDate: '2025-11-15',
        partnerRole: 'CONSULTANT',
        stats: {
            totalSOPs: 14,
            digitizedSOPs: 8,
            aiAgents: 3,
            mudaReports: 6,
            kaizenIdeas: 12,
            roiSaved: 187500,
        },
        team: [
            { id: 't1', name: 'Anna Kowalska', role: 'CEO', department: 'Zarząd', avatar: 'AK', sopCount: 2, aiUsage: 78 },
            { id: 't2', name: 'Marcin Nowak', role: 'CTO', department: 'IT', avatar: 'MN', sopCount: 4, aiUsage: 92 },
            { id: 't3', name: 'Ewa Wiśniewska', role: 'Head of Operations', department: 'Operacje', avatar: 'EW', sopCount: 6, aiUsage: 85 },
            { id: 't4', name: 'Piotr Dąbrowski', role: 'Product Manager', department: 'Produkt', avatar: 'PD', sopCount: 3, aiUsage: 67 },
            { id: 't5', name: 'Katarzyna Lewandowska', role: 'HR Manager', department: 'HR', avatar: 'KL', sopCount: 5, aiUsage: 43 },
            { id: 't6', name: 'Tomasz Zieliński', role: 'Sales Director', department: 'Sprzedaż', avatar: 'TZ', sopCount: 2, aiUsage: 56 },
            { id: 't7', name: 'Joanna Szymańska', role: 'Quality Lead', department: 'Jakość', avatar: 'JS', sopCount: 8, aiUsage: 91 },
            { id: 't8', name: 'Krzysztof Wójcik', role: 'DevOps Engineer', department: 'IT', avatar: 'KW', sopCount: 3, aiUsage: 88 },
            { id: 't9', name: 'Monika Kamińska', role: 'Customer Success', department: 'CS', avatar: 'MK', sopCount: 4, aiUsage: 72 },
            { id: 't10', name: 'Adam Mazur', role: 'Finance Manager', department: 'Finanse', avatar: 'AM', sopCount: 2, aiUsage: 34 },
            { id: 't11', name: 'Natalia Jankowska', role: 'Marketing Lead', department: 'Marketing', avatar: 'NJ', sopCount: 3, aiUsage: 61 },
            { id: 't12', name: 'Łukasz Kowalczyk', role: 'Support Lead', department: 'Support', avatar: 'ŁK', sopCount: 5, aiUsage: 79 },
        ],
        sops: [
            { id: 's1', name: 'Onboarding nowego pracownika', department: 'HR', status: 'ACTIVE', version: 'v2.1', lastUpdated: '2026-01-28', aiEnhanced: true, steps: 12 },
            { id: 's2', name: 'Obsługa zgłoszenia klienta', department: 'Support', status: 'ACTIVE', version: 'v3.0', lastUpdated: '2026-02-01', aiEnhanced: true, steps: 8 },
            { id: 's3', name: 'Deploy aplikacji na produkcję', department: 'IT', status: 'ACTIVE', version: 'v1.4', lastUpdated: '2026-01-15', aiEnhanced: true, steps: 15 },
            { id: 's4', name: 'Proces sprzedażowy B2B', department: 'Sprzedaż', status: 'IN_REVIEW', version: 'v2.0', lastUpdated: '2026-02-05', aiEnhanced: false, steps: 10 },
            { id: 's5', name: 'Przegląd jakości kodu', department: 'IT', status: 'ACTIVE', version: 'v1.2', lastUpdated: '2025-12-20', aiEnhanced: true, steps: 7 },
            { id: 's6', name: 'Raportowanie finansowe', department: 'Finanse', status: 'ACTIVE', version: 'v1.0', lastUpdated: '2025-12-10', aiEnhanced: false, steps: 9 },
            { id: 's7', name: 'Planowanie sprintu', department: 'Produkt', status: 'ACTIVE', version: 'v2.3', lastUpdated: '2026-01-22', aiEnhanced: true, steps: 6 },
            { id: 's8', name: 'Kampania marketingowa', department: 'Marketing', status: 'DRAFT', version: 'v0.5', lastUpdated: '2026-02-03', aiEnhanced: false, steps: 11 },
            { id: 's9', name: 'Offboarding pracownika', department: 'HR', status: 'ACTIVE', version: 'v1.1', lastUpdated: '2025-11-30', aiEnhanced: true, steps: 8 },
            { id: 's10', name: 'Eskalacja incydentu', department: 'IT', status: 'IN_REVIEW', version: 'v1.8', lastUpdated: '2026-02-06', aiEnhanced: true, steps: 10 },
            { id: 's11', name: 'Proces rekrutacyjny', department: 'HR', status: 'ACTIVE', version: 'v1.5', lastUpdated: '2026-01-10', aiEnhanced: false, steps: 14 },
            { id: 's12', name: 'Zarządzanie dostawcami', department: 'Operacje', status: 'DRAFT', version: 'v0.3', lastUpdated: '2026-02-04', aiEnhanced: false, steps: 7 },
            { id: 's13', name: 'Customer Onboarding SaaS', department: 'CS', status: 'ACTIVE', version: 'v2.0', lastUpdated: '2026-01-18', aiEnhanced: true, steps: 9 },
            { id: 's14', name: 'Analiza konkurencji', department: 'Produkt', status: 'DRAFT', version: 'v0.2', lastUpdated: '2026-02-07', aiEnhanced: false, steps: 5 },
        ],
        agents: [
            { id: 'a1', name: 'Asystent HR', type: 'Doradczy', sopsUsed: 3, interactions: 342, satisfaction: 94, status: 'ACTIVE' },
            { id: 'a2', name: 'Support Agent', type: 'Wykonawczy', sopsUsed: 2, interactions: 1247, satisfaction: 91, status: 'ACTIVE' },
            { id: 'a3', name: 'DevOps Bot', type: 'Automatyzacja', sopsUsed: 3, interactions: 567, satisfaction: 88, status: 'ACTIVE' },
        ],
        mudaReports: [
            { id: 'm1', title: 'Ręczne kopiowanie danych między systemami', category: 'Nadprodukcja', severity: 'HIGH', status: 'IN_PROGRESS', estimatedSaving: 45000, department: 'Operacje' },
            { id: 'm2', title: 'Wielokrotna weryfikacja umów', category: 'Nadmierne przetwarzanie', severity: 'MEDIUM', status: 'OPEN', estimatedSaving: 28000, department: 'Sprzedaż' },
            { id: 'm3', title: 'Oczekiwanie na code review', category: 'Oczekiwanie', severity: 'HIGH', status: 'IN_PROGRESS', estimatedSaving: 52000, department: 'IT' },
            { id: 'm4', title: 'Duplikacja raportów', category: 'Nadprodukcja', severity: 'LOW', status: 'RESOLVED', estimatedSaving: 15000, department: 'Marketing' },
            { id: 'm5', title: 'Szukanie dokumentacji', category: 'Ruch', severity: 'MEDIUM', status: 'IN_PROGRESS', estimatedSaving: 32000, department: 'Support' },
            { id: 'm6', title: 'Manual onboarding checklist', category: 'Defekty', severity: 'HIGH', status: 'RESOLVED', estimatedSaving: 15500, department: 'HR' },
        ],
        timeline: [
            { id: 'tl1', date: '2025-11-15', title: 'Kick-off transformacji', description: 'Spotkanie startowe z zarządem', type: 'milestone', completed: true },
            { id: 'tl2', date: '2025-11-22', title: 'AI Sprint Workshop', description: 'Warsztaty strategiczne – Pre-Mortem, Red Dot', type: 'workshop', completed: true },
            { id: 'tl3', date: '2025-12-05', title: 'Audit procesów (Phase 1)', description: 'Mapowanie 14 kluczowych procesów', type: 'review', completed: true },
            { id: 'tl4', date: '2025-12-20', title: 'Pierwsze 3 SOPs zdigitalizowane', description: 'HR Onboarding, Support, Deploy', type: 'deploy', completed: true },
            { id: 'tl5', date: '2026-01-10', title: 'Start Phase 2: Digitalizacja', description: 'Wdrożenie VantageOS w 3 działach', type: 'milestone', completed: true },
            { id: 'tl6', date: '2026-01-22', title: '8 SOPs active', description: 'Digitalizacja 57% procesów', type: 'deploy', completed: true },
            { id: 'tl7', date: '2026-02-01', title: 'Agent AI: Support Agent', description: 'Pierwszy agent produkcyjny', type: 'deploy', completed: true },
            { id: 'tl8', date: '2026-02-10', title: 'Przegląd Q1 z Radą', description: 'Status review + ROI raport', type: 'review', completed: false },
            { id: 'tl9', date: '2026-03-01', title: 'Start Phase 3: Automatyzacja', description: 'Agenci AI na kluczowych procesach', type: 'milestone', completed: false },
            { id: 'tl10', date: '2026-04-15', title: 'Target: 100% digitalizacja', description: 'Pełne pokrycie procesów', type: 'milestone', completed: false },
        ],
        canvasData: {},
    };
}

// ============================================================
// HELPER COMPONENTS
// ============================================================

function StatCard({ icon: Icon, label, value, color, subtext }: {
    icon: React.ElementType; label: string; value: string | number; color: string; subtext?: string;
}) {
    return (
        <Card className={cn('border-l-4', color)}>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', color.replace('border-l-', 'bg-').replace('-500', '-100'), 'dark:' + color.replace('border-l-', 'bg-').replace('-500', '-500/20'))}>
                        <Icon className={cn('h-5 w-5', color.replace('border-l-', 'text-'))} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">{label}</div>
                        {subtext && <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">{subtext}</div>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

const sopStatusStyles: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: 'Aktywny', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
    DRAFT: { label: 'Draft', className: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-500/20 dark:text-neutral-400' },
    IN_REVIEW: { label: 'W przeglądzie', className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
    ARCHIVED: { label: 'Archiwum', className: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
};

const severityStyles: Record<string, { className: string }> = {
    HIGH: { className: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
    MEDIUM: { className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
    LOW: { className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
};

const mudaStatusStyles: Record<string, { label: string; className: string }> = {
    OPEN: { label: 'Otwarty', className: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
    IN_PROGRESS: { label: 'W trakcie', className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
    RESOLVED: { label: 'Rozwiązany', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
};

const timelineTypeStyles: Record<string, { icon: React.ElementType; color: string }> = {
    milestone: { icon: Target, color: 'text-violet-500 bg-violet-100 dark:bg-violet-500/20' },
    workshop: { icon: Brain, color: 'text-blue-500 bg-blue-100 dark:bg-blue-500/20' },
    deploy: { icon: Rocket, color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20' },
    review: { icon: Eye, color: 'text-amber-500 bg-amber-100 dark:bg-amber-500/20' },
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CompanyDashboard() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [company, setCompany] = useState<CompanyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [sopSearch, setSopSearch] = useState('');
    const [notes, setNotes] = useState('');
    // Team filtering/sorting state
    const [teamSearch, setTeamSearch] = useState('');
    const [teamRoleFilter, setTeamRoleFilter] = useState('ALL');
    const [teamDeptFilter, setTeamDeptFilter] = useState('ALL');
    const [teamSort, setTeamSort] = useState<'name' | 'role' | 'department' | 'aiUsage'>('name');

    // Load data from API, fill fields API doesn't provide yet with demo placeholders
    useEffect(() => {
        async function loadCompanyData() {
            const demo = generateDemoData(slug);
            try {
                const res = await fetch(`/api/partner/company/${slug}`);
                if (res.ok) {
                    const apiData = await res.json();
                    const phase = apiData.transformationPhase;
                    const merged: CompanyData = {
                        id: apiData.id || demo.id,
                        name: apiData.name || demo.name,
                        slug: apiData.slug || demo.slug,
                        industry: demo.industry, // API doesn't return yet
                        employees: apiData.stats?.totalUsers ?? demo.employees,
                        transformationPhase: phase?.number ?? demo.transformationPhase,
                        transformationPhaseName: phase?.name ?? demo.transformationPhaseName,
                        startDate: demo.startDate, // API doesn't return yet
                        partnerRole: demo.partnerRole,
                        stats: {
                            totalSOPs: apiData.stats?.totalSOPs ?? 0,
                            digitizedSOPs: apiData.sops?.filter((s: { status: string }) => s.status === 'ACTIVE').length ?? 0,
                            aiAgents: apiData.stats?.totalAgents ?? 0,
                            mudaReports: demo.stats.mudaReports, // API doesn't track yet
                            kaizenIdeas: demo.stats.kaizenIdeas, // API doesn't track yet
                            roiSaved: demo.stats.roiSaved, // API doesn't track yet
                        },
                        team: (apiData.team || []).map((u: { id: string; name: string; role: string; department: string; avatar: string | null; aiUsage: number }) => ({
                            id: u.id,
                            name: u.name,
                            role: u.role,
                            department: u.department || '—',
                            avatar: u.avatar || u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
                            sopCount: 0,
                            aiUsage: u.aiUsage || 0,
                        })),
                        sops: (apiData.sops || []).map((s: { id: string; name: string; code: string; status: string; version: string; lastUpdated: string; department: string }) => ({
                            id: s.id,
                            name: s.name,
                            department: s.department || '—',
                            status: s.status as SOPItem['status'],
                            version: s.version,
                            lastUpdated: s.lastUpdated ? new Date(s.lastUpdated).toLocaleDateString('pl-PL') : '—',
                            aiEnhanced: false,
                            steps: 0,
                        })),
                        agents: (apiData.agents || []).map((a: { id: string; name: string; type: string; status: string; description?: string }) => ({
                            id: a.id,
                            name: a.name,
                            type: a.type || 'Asystent',
                            sopsUsed: 0,
                            interactions: 0,
                            satisfaction: 0,
                            status: (a.status || 'ACTIVE') as AgentItem['status'],
                        })),
                        mudaReports: demo.mudaReports, // API doesn't track yet
                        timeline: demo.timeline, // API doesn't track yet
                        canvasData: {},
                    };
                    setCompany(merged);
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.warn('[CompanyDashboard] API unavailable, using demo data:', err);
            }
            // Full fallback to demo data
            setCompany(demo);
            setLoading(false);
        }
        loadCompanyData();
    }, [slug]);

    // Save to per-company localStorage on changes
    const saveCompanyData = (updatedData: CompanyData) => {
        const storageKey = `vos_company_${slug}`;
        const toSave = { ...updatedData, _partnerNotes: notes };
        localStorage.setItem(storageKey, JSON.stringify(toSave));
        setCompany(updatedData);
        toast.success('Dane zapisane');
    };

    const saveNotes = () => {
        if (!company) return;
        const storageKey = `vos_company_${slug}`;
        const toSave = { ...company, _partnerNotes: notes };
        localStorage.setItem(storageKey, JSON.stringify(toSave));
        toast.success('Notatki zapisane');
    };

    if (loading || !company) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-20 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />)}
                </div>
            </div>
        );
    }

    const digitizationPercent = company.stats.totalSOPs > 0
        ? Math.round((company.stats.digitizedSOPs / company.stats.totalSOPs) * 100)
        : 0;
    const filteredSOPs = company.sops.filter(s => s.name.toLowerCase().includes(sopSearch.toLowerCase()));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/partner')} className="shrink-0">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <span className="text-xl font-bold text-white">{company.name.charAt(0)}</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{company.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400">{company.industry}</Badge>
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                                Phase {company.transformationPhase}: {company.transformationPhaseName}
                            </Badge>
                            <span className="text-xs text-neutral-400">{company.employees} pracowników</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast.info('Export w przygotowaniu...')}>
                        <Download className="h-4 w-4 mr-2" />
                        Eksport
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Nowy Raport
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <StatCard icon={FileText} label="SOPs" value={company.stats.totalSOPs} color="border-l-blue-500" subtext={`${company.stats.digitizedSOPs} zdigitalizowanych`} />
                <StatCard icon={Bot} label="Agenci AI" value={company.stats.aiAgents} color="border-l-purple-500" subtext="aktywnych" />
                <StatCard icon={AlertTriangle} label="MUDA" value={company.stats.mudaReports} color="border-l-amber-500" subtext={`${company.mudaReports.filter(m => m.status === 'RESOLVED').length} rozwiązanych`} />
                <StatCard icon={Lightbulb} label="Kaizen" value={company.stats.kaizenIdeas} color="border-l-yellow-500" subtext="pomysłów" />
                <StatCard icon={Users} label="Zespół" value={company.team.length} color="border-l-cyan-500" />
                <StatCard icon={TrendingUp} label="ROI Savings" value={`${Math.round(company.stats.roiSaved / 1000)}k`} color="border-l-emerald-500" subtext="PLN / rok" />
            </div>

            {/* Transformation Progress */}
            <Card className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 border-violet-200 dark:border-violet-800">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="font-semibold text-neutral-900 dark:text-white">Postęp Transformacji</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Phase {company.transformationPhase} z 5 • {company.transformationPhaseName}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">{digitizationPercent}%</span>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">digitalizacji SOPs</p>
                        </div>
                    </div>
                    <Progress value={digitizationPercent} className="h-2" />
                    <div className="flex justify-between mt-3">
                        {['Audit', 'Digitalizacja', 'Automatyzacja', 'Optymalizacja', 'Autonomia'].map((phase, i) => (
                            <div key={phase} className={cn('text-xs text-center', i < company.transformationPhase ? 'text-violet-600 dark:text-violet-400 font-medium' : 'text-neutral-400')}>
                                <div className={cn('h-2 w-2 rounded-full mx-auto mb-1', i < company.transformationPhase ? 'bg-violet-500' : 'bg-neutral-300 dark:bg-neutral-600')} />
                                {phase}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6 bg-neutral-100 dark:bg-neutral-800/50">
                    <TabsTrigger value="overview">Przegląd</TabsTrigger>
                    <TabsTrigger value="sops">SOPs ({company.stats.totalSOPs})</TabsTrigger>
                    <TabsTrigger value="agents">Agenci ({company.stats.aiAgents})</TabsTrigger>
                    <TabsTrigger value="muda">MUDA ({company.stats.mudaReports})</TabsTrigger>
                    <TabsTrigger value="team">Zespół ({company.team.length})</TabsTrigger>
                    <TabsTrigger value="notes">Notatki</TabsTrigger>
                </TabsList>

                {/* ===== OVERVIEW TAB ===== */}
                <TabsContent value="overview" className="space-y-6 mt-4">
                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-violet-500" />
                                Timeline Transformacji
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-700" />
                                <div className="space-y-4">
                                    {company.timeline.map((event) => {
                                        const style = timelineTypeStyles[event.type];
                                        const EventIcon = style.icon;
                                        return (
                                            <motion.div
                                                key={event.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="relative flex items-start gap-4 pl-0"
                                            >
                                                <div className={cn('relative z-10 h-10 w-10 rounded-full flex items-center justify-center shrink-0', style.color, event.completed ? 'ring-2 ring-emerald-400' : 'opacity-60')}>
                                                    <EventIcon className="h-4 w-4" />
                                                </div>
                                                <div className={cn('flex-1 pb-4', !event.completed && 'opacity-60')}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm text-neutral-900 dark:text-white">{event.title}</span>
                                                        {event.completed && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                                                    </div>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{event.description}</p>
                                                    <span className="text-xs text-neutral-400">{new Date(event.date).toLocaleDateString('pl-PL')}</span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Bot className="h-4 w-4 text-purple-500" />
                                    Top Agenci AI
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {company.agents.map(agent => (
                                    <div key={agent.id} className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                                        <div>
                                            <span className="font-medium text-sm">{agent.name}</span>
                                            <p className="text-xs text-neutral-500">{agent.type} • {agent.sopsUsed} SOPs</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-semibold text-emerald-600">{agent.satisfaction}%</span>
                                            <p className="text-xs text-neutral-400">{agent.interactions} interakcji</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    Top MUDA Issues
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {company.mudaReports.filter(m => m.status !== 'RESOLVED').slice(0, 3).map(report => (
                                    <div key={report.id} className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                                        <div>
                                            <span className="font-medium text-sm">{report.title}</span>
                                            <p className="text-xs text-neutral-500">{report.department}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge className={cn('text-xs', severityStyles[report.severity].className)}>{report.severity}</Badge>
                                            <p className="text-xs text-emerald-600 mt-1">{(report.estimatedSaving / 1000).toFixed(0)}k PLN/rok</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ===== SOPS TAB ===== */}
                <TabsContent value="sops" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input placeholder="Szukaj SOP..." value={sopSearch} onChange={(e) => setSopSearch(e.target.value)} className="pl-10" />
                        </div>
                        <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Nowy SOP</Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {filteredSOPs.map((sop, i) => (
                            <motion.div key={sop.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', sop.aiEnhanced ? 'bg-purple-100 dark:bg-purple-500/20' : 'bg-neutral-100 dark:bg-neutral-700')}>
                                                    {sop.aiEnhanced ? <Zap className="h-4 w-4 text-purple-500" /> : <FileText className="h-4 w-4 text-neutral-400" />}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-sm text-neutral-900 dark:text-white">{sop.name}</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-neutral-500">{sop.department}</span>
                                                        <span className="text-xs text-neutral-400">• {sop.steps} kroków</span>
                                                        <span className="text-xs text-neutral-400">• {sop.version}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {sop.aiEnhanced && <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 text-xs">AI</Badge>}
                                                <Badge className={cn('text-xs', sopStatusStyles[sop.status].className)}>
                                                    {sopStatusStyles[sop.status].label}
                                                </Badge>
                                                <span className="text-xs text-neutral-400">{sop.lastUpdated}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>

                {/* ===== AGENTS TAB ===== */}
                <TabsContent value="agents" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {company.agents.map(agent => (
                            <Card key={agent.id} className="hover:shadow-lg transition-all hover:border-purple-300 dark:hover:border-purple-700">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                                                <Bot className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">{agent.name}</CardTitle>
                                                <CardDescription>{agent.type}</CardDescription>
                                            </div>
                                        </div>
                                        <Badge className={cn('text-xs', agent.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400')}>
                                            {agent.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <div className="text-lg font-bold text-neutral-900 dark:text-white">{agent.sopsUsed}</div>
                                            <div className="text-xs text-neutral-500">SOPs</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-neutral-900 dark:text-white">{agent.interactions}</div>
                                            <div className="text-xs text-neutral-500">Interakcji</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-emerald-600">{agent.satisfaction}%</div>
                                            <div className="text-xs text-neutral-500">Satysfakcja</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* ===== MUDA TAB ===== */}
                <TabsContent value="muda" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 gap-3">
                        {company.mudaReports.map((report, i) => (
                            <motion.div key={report.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={cn('h-2 w-2 rounded-full', report.severity === 'HIGH' ? 'bg-red-500' : report.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500')} />
                                                <div>
                                                    <span className="font-medium text-sm text-neutral-900 dark:text-white">{report.title}</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-neutral-500">{report.category}</span>
                                                        <span className="text-xs text-neutral-400">• {report.department}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{(report.estimatedSaving / 1000).toFixed(0)}k PLN</span>
                                                <Badge className={cn('text-xs', mudaStatusStyles[report.status].className)}>
                                                    {mudaStatusStyles[report.status].label}
                                                </Badge>
                                                <Badge className={cn('text-xs', severityStyles[report.severity].className)}>
                                                    {report.severity}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 text-sm">
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Potencjalne oszczędności: </span>
                            <span className="text-emerald-600 dark:text-emerald-300">{(company.mudaReports.reduce((s, m) => s + m.estimatedSaving, 0) / 1000).toFixed(0)}k PLN / rok</span>
                        </div>
                    </div>
                </TabsContent>

                {/* ===== TEAM TAB ===== */}
                <TabsContent value="team" className="space-y-4 mt-4">
                    {/* Team Filters */}
                    {(() => {
                        const departments = [...new Set(company.team.map(m => m.department))];
                        const roles = [...new Set(company.team.map(m => m.role))];
                        const filteredTeam = company.team
                            .filter(m => {
                                if (teamSearch && !m.name.toLowerCase().includes(teamSearch.toLowerCase()) && !m.role.toLowerCase().includes(teamSearch.toLowerCase())) return false;
                                if (teamRoleFilter !== 'ALL' && m.role !== teamRoleFilter) return false;
                                if (teamDeptFilter !== 'ALL' && m.department !== teamDeptFilter) return false;
                                return true;
                            })
                            .sort((a, b) => {
                                if (teamSort === 'name') return a.name.localeCompare(b.name);
                                if (teamSort === 'role') return a.role.localeCompare(b.role);
                                if (teamSort === 'department') return a.department.localeCompare(b.department);
                                if (teamSort === 'aiUsage') return b.aiUsage - a.aiUsage;
                                return 0;
                            });

                        return (
                            <>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                        <Input
                                            placeholder="Szukaj po imieniu lub roli..."
                                            value={teamSearch}
                                            onChange={(e) => setTeamSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <select
                                        value={teamRoleFilter}
                                        onChange={(e) => setTeamRoleFilter(e.target.value)}
                                        className="h-9 px-3 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white"
                                    >
                                        <option value="ALL">Wszystkie role</option>
                                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                    <select
                                        value={teamDeptFilter}
                                        onChange={(e) => setTeamDeptFilter(e.target.value)}
                                        className="h-9 px-3 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white"
                                    >
                                        <option value="ALL">Wszystkie działy</option>
                                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <select
                                        value={teamSort}
                                        onChange={(e) => setTeamSort(e.target.value as 'name' | 'role' | 'department' | 'aiUsage')}
                                        className="h-9 px-3 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white"
                                    >
                                        <option value="name">Sortuj: Imię</option>
                                        <option value="role">Sortuj: Rola</option>
                                        <option value="department">Sortuj: Dział</option>
                                        <option value="aiUsage">Sortuj: AI Usage ↓</option>
                                    </select>
                                    <Badge variant="outline" className="text-xs">
                                        {filteredTeam.length} / {company.team.length}
                                    </Badge>
                                </div>

                                {/* Team Table */}
                                <Card>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Użytkownik</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Rola</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Dział</th>
                                                        <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">SOPs</th>
                                                        <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">AI Usage</th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Akcje</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                                    {filteredTeam.map((member, i) => (
                                                        <motion.tr
                                                            key={member.id}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: i * 0.02 }}
                                                            className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                                                        >
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-medium text-xs shrink-0">
                                                                        {member.avatar}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <span className="font-medium text-sm text-neutral-900 dark:text-white block truncate">{member.name}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <Badge className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400">
                                                                    {member.role}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="text-sm text-neutral-600 dark:text-neutral-300">{member.department}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{member.sopCount}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <div className="w-16 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={cn('h-full rounded-full transition-all',
                                                                                member.aiUsage > 70 ? 'bg-emerald-500' :
                                                                                    member.aiUsage > 40 ? 'bg-amber-500' : 'bg-red-500'
                                                                            )}
                                                                            style={{ width: `${Math.min(member.aiUsage, 100)}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className={cn('text-xs font-medium',
                                                                        member.aiUsage > 70 ? 'text-emerald-600 dark:text-emerald-400' :
                                                                            member.aiUsage > 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'
                                                                    )}>{member.aiUsage}%</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <Button variant="ghost" size="sm" className="h-7 text-xs">
                                                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                                                    Profil
                                                                </Button>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {filteredTeam.length === 0 && (
                                            <div className="py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                                                <UserCheck className="h-8 w-8 mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
                                                Brak użytkowników pasujących do filtrów
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        );
                    })()}
                </TabsContent>

                {/* ===== NOTES TAB ===== */}
                <TabsContent value="notes" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Edit3 className="h-5 w-5 text-violet-500" />
                                Notatki Partnera
                            </CardTitle>
                            <CardDescription>Prywatne notatki zapisywane per firma. Widoczne tylko dla Ciebie.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Dodaj notatki o firmie, statusie transformacji, kolejnych krokach..."
                                className="min-h-[300px] font-mono text-sm"
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-neutral-400">{notes.length} znaków</span>
                                <Button onClick={saveNotes}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Zapisz notatki
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
