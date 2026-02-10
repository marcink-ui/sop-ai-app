'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import {
    User,
    Brain,
    Sparkles,
    MessageSquare,
    PenSquare,
    FileText,
    Heart,
    GraduationCap,
    Building2,
    Shield,
    Bot,
    Zap,
    Target,
    TrendingUp,
    Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

// Note: Page metadata is defined in layout.tsx for client components

interface UserContext {
    name: string;
    email: string;
    role: string;
    organization: string;
    avatar: string | null;
    bio: string;
    cv: string;
    mbti: string;
    disc: string;
    certifications: string;
    communicationStyle: string;
    // Computed metrics
    contextCompleteness: number;
    aiInteractions: number;
    lastActive: string;
}

export default function MyContextPage() {
    const { data: session, isPending } = useSession();
    const [context, setContext] = useState<UserContext | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch user context from API
        const fetchContext = async () => {
            try {
                const res = await fetch('/api/users/me/context');
                if (res.ok) {
                    const data = await res.json();
                    setContext(data);
                } else {
                    // Fallback to session data
                    setContext({
                        name: session?.user?.name || 'Demo User',
                        email: session?.user?.email || 'demo@vantage.os',
                        role: (session?.user as Record<string, unknown>)?.role as string || 'CITIZEN_DEV',
                        organization: 'VantageOS Demo',
                        avatar: session?.user?.image || null,
                        bio: '',
                        cv: '',
                        mbti: '',
                        disc: '',
                        certifications: '',
                        communicationStyle: 'direct',
                        contextCompleteness: 15,
                        aiInteractions: 0,
                        lastActive: new Date().toISOString(),
                    });
                }
            } catch (error) {
                console.error('Failed to fetch context:', error);
                // Use defaults
                setContext({
                    name: session?.user?.name || 'Demo User',
                    email: session?.user?.email || 'demo@vantage.os',
                    role: 'CITIZEN_DEV',
                    organization: 'VantageOS Demo',
                    avatar: null,
                    bio: '',
                    cv: '',
                    mbti: '',
                    disc: '',
                    certifications: '',
                    communicationStyle: 'direct',
                    contextCompleteness: 15,
                    aiInteractions: 0,
                    lastActive: new Date().toISOString(),
                });
            } finally {
                setLoading(false);
            }
        };

        if (!isPending) {
            fetchContext();
        }
    }, [session, isPending]);

    // Calculate context completeness
    const calculateCompleteness = () => {
        if (!context) return 0;
        let score = 20; // Base for having an account
        if (context.name) score += 10;
        if (context.bio) score += 15;
        if (context.cv) score += 20;
        if (context.mbti) score += 10;
        if (context.disc) score += 10;
        if (context.certifications) score += 15;
        return Math.min(score, 100);
    };

    const completeness = context ? calculateCompleteness() : 0;

    const contextCards = [
        {
            id: 'personality',
            title: 'Osobowość',
            icon: Heart,
            color: 'text-rose-500',
            bgColor: 'bg-rose-500/10',
            fields: [
                { label: 'MBTI', value: context?.mbti || '—' },
                { label: 'DISC', value: context?.disc || '—' },
            ],
            filled: !!(context?.mbti || context?.disc),
        },
        {
            id: 'experience',
            title: 'Doświadczenie',
            icon: FileText,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            fields: [
                { label: 'Bio', value: context?.bio ? `${context.bio.slice(0, 50)}...` : '—' },
                { label: 'CV', value: context?.cv ? '✓ Dodane' : '—' },
            ],
            filled: !!(context?.bio || context?.cv),
        },
        {
            id: 'certifications',
            title: 'Kwalifikacje',
            icon: GraduationCap,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
            fields: [
                { label: 'Certyfikaty', value: context?.certifications ? '✓ Dodane' : '—' },
            ],
            filled: !!context?.certifications,
        },
        {
            id: 'communication',
            title: 'Komunikacja',
            icon: MessageSquare,
            color: 'text-violet-500',
            bgColor: 'bg-violet-500/10',
            fields: [
                { label: 'Styl', value: context?.communicationStyle || 'Bezpośredni' },
            ],
            filled: !!context?.communicationStyle,
        },
    ];

    if (loading) {
        return (
            <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            {context?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-card border-2 border-background">
                            <Brain className="h-3 w-3 text-cyan-500" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Mój Kontekst</h1>
                        <p className="text-sm text-muted-foreground">Twój profil AI dla personalizacji agentów</p>
                    </div>
                </div>
                <Link href="/settings/profile">
                    <Button className="gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700">
                        <PenSquare className="h-4 w-4" />
                        Edytuj Profil
                    </Button>
                </Link>
            </motion.div>

            {/* Context Completeness */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-border bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-violet-500/5 p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/10">
                            <Target className="h-5 w-5 text-cyan-500" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-foreground">Kompletność Kontekstu</h2>
                            <p className="text-xs text-muted-foreground">Im więcej danych, tym lepsze odpowiedzi AI</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-bold text-foreground">{completeness}%</span>
                        <p className="text-xs text-muted-foreground">wypełnione</p>
                    </div>
                </div>
                <Progress value={completeness} className="h-2" />
                {completeness < 50 && (
                    <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
                        💡 Uzupełnij profil, aby AI lepiej dostosowywał odpowiedzi do Twoich potrzeb
                    </p>
                )}
            </motion.div>

            {/* User Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-xl border border-border bg-card/50 p-6"
            >
                <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <h2 className="font-semibold text-foreground">Dane Profilu</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Imię i nazwisko</p>
                            <p className="font-medium text-foreground">{context?.name || '—'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Organizacja</p>
                            <p className="font-medium text-foreground">{context?.organization || '—'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Rola</p>
                            <Badge variant="outline" className="mt-0.5">{context?.role || '—'}</Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <Badge className="mt-0.5 bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Aktywny</Badge>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Context Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {contextCards.map((card, index) => (
                    <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        className={`group relative rounded-xl border p-5 transition-all duration-200 hover:shadow-lg ${card.filled
                            ? 'border-border bg-card/50 hover:border-border/80'
                            : 'border-dashed border-muted-foreground/30 bg-muted/20 hover:border-muted-foreground/50'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`p-2 rounded-lg ${card.bgColor}`}>
                                <card.icon className={`h-5 w-5 ${card.color}`} />
                            </div>
                            {card.filled ? (
                                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                                    ✓ Uzupełnione
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                                    Do uzupełnienia
                                </Badge>
                            )}
                        </div>
                        <h3 className="font-semibold text-foreground mb-3">{card.title}</h3>
                        <div className="space-y-2">
                            {card.fields.map((field, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{field.label}</span>
                                    <span className={card.filled ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                        {field.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <Link
                            href="/settings/profile"
                            className="absolute inset-0"
                            aria-label={`Edytuj ${card.title}`}
                        />
                    </motion.div>
                ))}
            </div>

            {/* AI Insights Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-xl border border-border bg-gradient-to-br from-violet-500/5 to-blue-500/5 p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-violet-500/10">
                        <Sparkles className="h-5 w-5 text-violet-500" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground">Jak AI wykorzystuje Twój kontekst</h2>
                        <p className="text-xs text-muted-foreground">AI personalizuje odpowiedzi w oparciu o Twój profil</p>
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                        <Bot className="h-5 w-5 text-purple-500 mb-2" />
                        <h4 className="font-medium text-foreground text-sm">Personalizacja odpowiedzi</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                            Agenci AI dopasowują ton i styl do Twoich preferencji komunikacji
                        </p>
                    </div>
                    <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                        <Zap className="h-5 w-5 text-amber-500 mb-2" />
                        <h4 className="font-medium text-foreground text-sm">Szybsze kontekstowanie</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                            AI nie musi pytać o podstawowe informacje - zna Twoje doświadczenie
                        </p>
                    </div>
                    <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                        <TrendingUp className="h-5 w-5 text-emerald-500 mb-2" />
                        <h4 className="font-medium text-foreground text-sm">Lepsze rekomendacje</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                            Sugestie i rozwiązania dopasowane do Twojego profilu kompetencji
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
