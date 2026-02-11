'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import {
    User,
    Brain,
    Sparkles,
    MessageSquare,
    PenSquare,
    Save,
    ChevronRight,
    Heart,
    GraduationCap,
    Target,
    Star,
    Briefcase,
    Phone,
    Linkedin,
    Globe,
    Clock,
    Shield,
    Camera,
    Loader2,
    CheckCircle2,
    Lightbulb,
    LayoutDashboard,
    Edit3,
    Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────

type TabId = 'dashboard' | 'chat' | 'edit' | 'personality';

interface UserContext {
    name: string;
    email: string;
    role: string;
    organization: string;
    department: string | null;
    avatar: string | null;
    bio: string;
    cv: string;
    phone: string;
    linkedin: string;
    mbti: string;
    disc: string;
    strengthsFinder: string;
    enneagram: string;
    personalityNotes: string;
    communicationStyle: string;
    workingHours: string;
    preferredLanguage: string;
    certifications: string;
    skills: string;
    interests: string;
    goals: string;
    values: string;
    contextCompleteness: number;
    aiInteractions: number;
    lastActive: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// ── Constants ──────────────────────────────────────

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    META_ADMIN: { label: 'Meta Admin', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
    PARTNER: { label: 'Partner', color: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400' },
    SPONSOR: { label: 'Sponsor', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
    PILOT: { label: 'Pilot', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400' },
    MANAGER: { label: 'Manager', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
    EXPERT: { label: 'Ekspert', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
    CITIZEN_DEV: { label: 'Citizen Dev', color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400' },
    EXPLORER: { label: 'Explorer', color: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400' },
};

const MBTI_TYPES = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
const DISC_TYPES = ['D', 'I', 'S', 'C', 'D/I', 'D/C', 'I/S', 'I/D', 'S/C', 'S/I', 'C/D', 'C/S'];
const ENNEAGRAM_TYPES = [
    'Type 1 — Reformer', 'Type 2 — Helper', 'Type 3 — Achiever',
    'Type 4 — Individualist', 'Type 5 — Investigator', 'Type 6 — Loyalist',
    'Type 7 — Enthusiast', 'Type 8 — Challenger', 'Type 9 — Peacemaker',
];
const COMM_STYLES = ['direct', 'analytical', 'expressive', 'amiable'];

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard; description: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Profil i statystyki' },
    { id: 'chat', label: 'Chat AI', icon: MessageSquare, description: 'Wprowadzaj kontekst przez rozmowę' },
    { id: 'edit', label: 'Edycja profilu', icon: Edit3, description: 'Ręczna edycja danych' },
    { id: 'personality', label: 'Osobowość', icon: Brain, description: 'Testy i profil osobowości' },
];

// ── Helper Components ──────────────────────────────

function FieldGroup({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                {icon} {label}
            </Label>
            {children}
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="rounded-xl border p-3 text-center">
            <div className="flex justify-center mb-1 text-muted-foreground">{icon}</div>
            <div className="text-lg font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
        </div>
    );
}

// ── Dashboard Tab ──────────────────────────────────

function DashboardTab({ context }: { context: UserContext }) {
    const roleInfo = ROLE_LABELS[context.role] || ROLE_LABELS.CITIZEN_DEV;

    const contextFields = [
        { label: 'Imię i rola', filled: !!context.name },
        { label: 'Bio', filled: !!context.bio },
        { label: 'MBTI', filled: !!context.mbti },
        { label: 'DISC', filled: !!context.disc },
        { label: 'Styl komunikacji', filled: !!context.communicationStyle },
        { label: 'Cele', filled: !!context.goals },
        { label: 'Umiejętności', filled: !!context.skills },
        { label: 'Certyfikaty', filled: !!context.certifications },
        { label: 'Wartości', filled: !!context.values },
        { label: 'Zainteresowania', filled: !!context.interests },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Profile Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border bg-card p-6 space-y-4"
            >
                <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                        {context.avatar ? (
                            <img src={context.avatar} alt={context.name} className="w-full h-full object-cover" />
                        ) : (
                            context.name?.charAt(0)?.toUpperCase() || 'U'
                        )}
                    </div>
                    <h3 className="mt-3 font-semibold text-lg">{context.name || 'Użytkownik'}</h3>
                    <p className="text-sm text-muted-foreground">{context.email}</p>
                    <Badge className={`mt-2 ${roleInfo.color}`}>{roleInfo.label}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{context.organization}</p>
                    {context.department && (
                        <p className="text-xs text-muted-foreground">{context.department}</p>
                    )}
                </div>

                <Separator />

                {/* Quick Stats */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                            <MessageSquare className="h-3.5 w-3.5" /> Interakcje AI
                        </span>
                        <span className="font-medium">{context.aiInteractions}</span>
                    </div>
                    {context.mbti && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                                <Brain className="h-3.5 w-3.5" /> MBTI
                            </span>
                            <Badge variant="outline">{context.mbti}</Badge>
                        </div>
                    )}
                    {context.disc && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                                <Target className="h-3.5 w-3.5" /> DISC
                            </span>
                            <Badge variant="outline">{context.disc}</Badge>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Context Completeness */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Kompletność profilu</span>
                        <span className="font-medium">{context.contextCompleteness}%</span>
                    </div>
                    <Progress value={context.contextCompleteness} className="h-2" />
                    {context.contextCompleteness < 60 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Lightbulb className="h-3 w-3" />
                            Uzupełnij profil, by AI lepiej Cię rozumiał
                        </p>
                    )}
                </div>
            </motion.div>

            {/* Right: AI context overview + stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="md:col-span-2 space-y-4"
            >
                {/* AI Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard label="Interakcje AI" value={String(context.aiInteractions)} icon={<MessageSquare className="h-4 w-4" />} />
                    <StatCard label="Profil" value={`${context.contextCompleteness}%`} icon={<CheckCircle2 className="h-4 w-4" />} />
                    <StatCard label="Rola" value={roleInfo.label} icon={<Shield className="h-4 w-4" />} />
                    <StatCard label="MBTI" value={context.mbti || '—'} icon={<Brain className="h-4 w-4" />} />
                </div>

                {/* AI Context Box */}
                <Card className="bg-card/50 border-border">
                    <CardContent className="p-5 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-500/20">
                                <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                                <h3 className="font-medium text-sm">Jak AI wykorzystuje Twój kontekst</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    AI Chat czyta Twoje dane profilowe, osobowość i cele, aby dopasować odpowiedzi do Twojego stylu komunikacji
                                    i preferencji. Im więcej uzupełnisz, tym bardziej spersonalizowane odpowiedzi otrzymasz.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data shared with AI */}
                <Card className="bg-card/50 border-border">
                    <CardContent className="p-5 space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                            <ChevronRight className="h-4 w-4" />
                            Dane udostępniane AI
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {contextFields.map(item => (
                                <div key={item.label} className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${item.filled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                    <span className={item.filled ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                                    {item.filled && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* AI Context Preview */}
                <Card className="bg-card/50 border-dashed border-violet-300 dark:border-violet-500/30">
                    <CardContent className="p-5 space-y-2">
                        <h4 className="font-medium text-sm flex items-center gap-2 text-violet-600 dark:text-violet-400">
                            <Sparkles className="h-4 w-4" />
                            Podgląd kontekstu AI
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Tak AI &quot;widzi&quot; Twój profil podczas rozmowy:
                        </p>
                        <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono text-muted-foreground space-y-1 max-h-40 overflow-y-auto">
                            <p><span className="text-foreground">Imię:</span> {context.name || '(brak)'}</p>
                            <p><span className="text-foreground">Rola:</span> {roleInfo.label} @ {context.organization}</p>
                            {context.bio && <p><span className="text-foreground">Bio:</span> {context.bio.substring(0, 100)}{context.bio.length > 100 ? '...' : ''}</p>}
                            {context.mbti && <p><span className="text-foreground">MBTI:</span> {context.mbti}</p>}
                            {context.disc && <p><span className="text-foreground">DISC:</span> {context.disc}</p>}
                            {context.communicationStyle && <p><span className="text-foreground">Styl:</span> {context.communicationStyle}</p>}
                            {context.skills && <p><span className="text-foreground">Skills:</span> {context.skills.substring(0, 80)}{context.skills.length > 80 ? '...' : ''}</p>}
                            {context.goals && <p><span className="text-foreground">Cele:</span> {context.goals.substring(0, 80)}{context.goals.length > 80 ? '...' : ''}</p>}
                            {context.preferredLanguage && <p><span className="text-foreground">Język:</span> {context.preferredLanguage === 'pl' ? 'Polski' : context.preferredLanguage}</p>}
                        </div>
                        <div className="text-xs text-muted-foreground text-right">
                            Ostatnia aktywność: {new Date(context.lastActive).toLocaleString('pl-PL')}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

// ── Chat Tab ───────────────────────────────────────

function ChatTab() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1', role: 'assistant',
            content: 'Cześć! Jestem Twoim asystentem kontekstu osobistego. Opowiedz mi o sobie, a uzupełnię Twój profil:\n\n• Kim jesteś i czym się zajmujesz\n• Twoje doświadczenie i umiejętności\n• Styl pracy i komunikacji\n• Cele i motywacje',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = useCallback(async () => {
        if (!input.trim() || sending) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setSending(true);

        // Simulate AI response (replace with real API)
        setTimeout(() => {
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Świetnie! Zaktualizowałem Twój profil na podstawie tych informacji. Czy chcesz dodać coś jeszcze?',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMsg]);
            setSending(false);
        }, 1500);
    }, [input, sending]);

    return (
        <div className="flex flex-col h-[600px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 p-4 rounded-xl border border-border bg-muted/20 mb-3">
                {messages.map((msg) => (
                    <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                        <div className={cn(
                            'max-w-[80%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap',
                            msg.role === 'user'
                                ? 'bg-violet-600 text-white'
                                : 'bg-card border border-border text-foreground'
                        )}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {sending && (
                    <div className="flex justify-start">
                        <div className="bg-card border border-border rounded-xl px-4 py-2.5">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Opowiedz o sobie, umiejętnościach, celach..."
                    className="flex-1 resize-none h-12 min-h-[48px] bg-muted/30"
                    rows={1}
                />
                <Button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="bg-violet-600 hover:bg-violet-700 h-12 px-4"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// ── Edit Tab ───────────────────────────────────────

function EditTab({ context, updateField, handleSave, saving }: {
    context: UserContext;
    updateField: (field: keyof UserContext, value: string) => void;
    handleSave: () => void;
    saving: boolean;
}) {
    return (
        <div className="space-y-6">
            {/* Save button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Zapisz zmiany
                </Button>
            </div>

            {/* Przegląd */}
            <div className="rounded-2xl border bg-card">
                <div className="flex items-center gap-2 px-6 py-4 border-b">
                    <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-500/20">
                        <User className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h2 className="font-semibold text-sm">Dane podstawowe</h2>
                </div>
                <div className="p-6 space-y-5">
                    <FieldGroup label="Imię" icon={<User className="h-4 w-4" />}>
                        <Input value={context.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Twoje imię i nazwisko" />
                    </FieldGroup>

                    <FieldGroup label="Bio / O mnie" icon={<User className="h-4 w-4" />}>
                        <textarea
                            value={context.bio}
                            onChange={(e) => updateField('bio', e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            placeholder="Krótko o Tobie — doświadczenie, rola, czym się zajmujesz..."
                        />
                    </FieldGroup>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldGroup label="Telefon" icon={<Phone className="h-4 w-4" />}>
                            <Input value={context.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+48 ..." />
                        </FieldGroup>
                        <FieldGroup label="LinkedIn" icon={<Linkedin className="h-4 w-4" />}>
                            <Input value={context.linkedin} onChange={(e) => updateField('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
                        </FieldGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldGroup label="Godziny pracy" icon={<Clock className="h-4 w-4" />}>
                            <Input value={context.workingHours} onChange={(e) => updateField('workingHours', e.target.value)} placeholder="9:00-17:00 CET" />
                        </FieldGroup>
                        <FieldGroup label="Język" icon={<Globe className="h-4 w-4" />}>
                            <select
                                value={context.preferredLanguage}
                                onChange={(e) => updateField('preferredLanguage', e.target.value)}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                            >
                                <option value="pl">Polski</option>
                                <option value="en">English</option>
                                <option value="de">Deutsch</option>
                            </select>
                        </FieldGroup>
                    </div>
                </div>
            </div>

            {/* Kariera */}
            <div className="rounded-2xl border bg-card">
                <div className="flex items-center gap-2 px-6 py-4 border-b">
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-500/20">
                        <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="font-semibold text-sm">Kariera</h2>
                </div>
                <div className="p-6 space-y-5">
                    <FieldGroup label="CV / Doświadczenie zawodowe" icon={<Briefcase className="h-4 w-4" />}>
                        <textarea
                            value={context.cv}
                            onChange={(e) => updateField('cv', e.target.value)}
                            rows={6}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-y focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            placeholder="Krótkie podsumowanie Twojego doświadczenia zawodowego..."
                        />
                    </FieldGroup>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldGroup label="Certyfikaty" icon={<GraduationCap className="h-4 w-4" />}>
                            <textarea
                                value={context.certifications}
                                onChange={(e) => updateField('certifications', e.target.value)}
                                rows={2}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-violet-500"
                                placeholder="PMP, Scrum Master, AWS, ..."
                            />
                        </FieldGroup>
                        <FieldGroup label="Kluczowe umiejętności" icon={<Star className="h-4 w-4" />}>
                            <textarea
                                value={context.skills}
                                onChange={(e) => updateField('skills', e.target.value)}
                                rows={2}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-violet-500"
                                placeholder="Leadership, AI/ML, Project Management, ..."
                            />
                        </FieldGroup>
                    </div>

                    <FieldGroup label="Cele zawodowe" icon={<Target className="h-4 w-4" />}>
                        <textarea
                            value={context.goals}
                            onChange={(e) => updateField('goals', e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-violet-500"
                            placeholder="Twoje cele na najbliższe 6-12 miesięcy..."
                        />
                    </FieldGroup>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldGroup label="Zainteresowania" icon={<Heart className="h-4 w-4" />}>
                            <textarea
                                value={context.interests}
                                onChange={(e) => updateField('interests', e.target.value)}
                                rows={2}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-violet-500"
                                placeholder="AI, Lean, Design Thinking, ..."
                            />
                        </FieldGroup>
                        <FieldGroup label="Wartości" icon={<Shield className="h-4 w-4" />}>
                            <textarea
                                value={context.values}
                                onChange={(e) => updateField('values', e.target.value)}
                                rows={2}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-violet-500"
                                placeholder="Innowacyjność, Transparentność, ..."
                            />
                        </FieldGroup>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Personality Tab ────────────────────────────────

function PersonalityTab({ context, updateField, handleSave, saving }: {
    context: UserContext;
    updateField: (field: keyof UserContext, value: string) => void;
    handleSave: () => void;
    saving: boolean;
}) {
    return (
        <div className="space-y-6">
            {/* Save button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Zapisz zmiany
                </Button>
            </div>

            <div className="rounded-2xl border bg-card">
                <div className="flex items-center gap-2 px-6 py-4 border-b">
                    <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-500/20">
                        <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="font-semibold text-sm">Testy osobowości</h2>
                </div>
                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldGroup label="MBTI" icon={<Brain className="h-4 w-4" />}>
                            <select
                                value={context.mbti}
                                onChange={(e) => updateField('mbti', e.target.value)}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Wybierz typ MBTI...</option>
                                {MBTI_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </FieldGroup>

                        <FieldGroup label="DISC" icon={<Target className="h-4 w-4" />}>
                            <select
                                value={context.disc}
                                onChange={(e) => updateField('disc', e.target.value)}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Wybierz profil DISC...</option>
                                {DISC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </FieldGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldGroup label="Enneagram" icon={<Heart className="h-4 w-4" />}>
                            <select
                                value={context.enneagram}
                                onChange={(e) => updateField('enneagram', e.target.value)}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Wybierz typ Enneagram...</option>
                                {ENNEAGRAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </FieldGroup>

                        <FieldGroup label="Styl komunikacji" icon={<MessageSquare className="h-4 w-4" />}>
                            <select
                                value={context.communicationStyle}
                                onChange={(e) => updateField('communicationStyle', e.target.value)}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Wybierz styl...</option>
                                {COMM_STYLES.map(s => (
                                    <option key={s} value={s}>
                                        {s === 'direct' ? 'Bezpośredni' : s === 'analytical' ? 'Analityczny' : s === 'expressive' ? 'Ekspresyjny' : 'Przyjazny'}
                                    </option>
                                ))}
                            </select>
                        </FieldGroup>
                    </div>

                    <FieldGroup label="CliftonStrengths / StrengthsFinder" icon={<Star className="h-4 w-4" />}>
                        <textarea
                            value={context.strengthsFinder}
                            onChange={(e) => updateField('strengthsFinder', e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-violet-500"
                            placeholder="Np. Achiever, Strategic, Learner, Relator, Command..."
                        />
                    </FieldGroup>

                    <FieldGroup label="Inne testy / notatki" icon={<PenSquare className="h-4 w-4" />}>
                        <textarea
                            value={context.personalityNotes}
                            onChange={(e) => updateField('personalityNotes', e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-violet-500"
                            placeholder="Inne wyniki testów, obserwacje, preferencje..."
                        />
                    </FieldGroup>
                </div>
            </div>

            {/* Current personality badges */}
            {(context.mbti || context.disc || context.enneagram) && (
                <Card className="bg-card/50 border-border">
                    <CardContent className="p-5">
                        <h3 className="text-sm font-semibold mb-3">Twój profil osobowości</h3>
                        <div className="flex flex-wrap gap-2">
                            {context.mbti && (
                                <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400 text-sm px-3 py-1">
                                    MBTI: {context.mbti}
                                </Badge>
                            )}
                            {context.disc && (
                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-sm px-3 py-1">
                                    DISC: {context.disc}
                                </Badge>
                            )}
                            {context.enneagram && (
                                <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 text-sm px-3 py-1">
                                    {context.enneagram}
                                </Badge>
                            )}
                            {context.communicationStyle && (
                                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-sm px-3 py-1">
                                    Styl: {context.communicationStyle === 'direct' ? 'Bezpośredni' :
                                        context.communicationStyle === 'analytical' ? 'Analityczny' :
                                            context.communicationStyle === 'expressive' ? 'Ekspresyjny' : 'Przyjazny'}
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────

export default function MyContextPage() {
    const { data: session, isPending } = useSession();
    const [context, setContext] = useState<UserContext | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');

    const fetchContext = useCallback(async () => {
        try {
            const res = await fetch('/api/users/me/context');
            if (res.ok) {
                const data = await res.json();
                setContext(data);
            } else {
                setContext({
                    name: session?.user?.name || 'Demo User',
                    email: session?.user?.email || 'demo@vantage.os',
                    role: (session?.user as Record<string, unknown>)?.role as string || 'CITIZEN_DEV',
                    organization: 'VantageOS Demo',
                    department: null,
                    avatar: session?.user?.image || null,
                    bio: '', cv: '', phone: '', linkedin: '',
                    mbti: '', disc: '', strengthsFinder: '', enneagram: '', personalityNotes: '',
                    communicationStyle: '', workingHours: '', preferredLanguage: 'pl',
                    certifications: '', skills: '', interests: '', goals: '', values: '',
                    contextCompleteness: 15, aiInteractions: 0, lastActive: new Date().toISOString(),
                });
            }
        } catch {
            setContext({
                name: session?.user?.name || 'Demo User',
                email: session?.user?.email || 'demo@vantage.os',
                role: 'CITIZEN_DEV', organization: 'VantageOS Demo', department: null,
                avatar: null, bio: '', cv: '', phone: '', linkedin: '',
                mbti: '', disc: '', strengthsFinder: '', enneagram: '', personalityNotes: '',
                communicationStyle: '', workingHours: '', preferredLanguage: 'pl',
                certifications: '', skills: '', interests: '', goals: '', values: '',
                contextCompleteness: 15, aiInteractions: 0, lastActive: new Date().toISOString(),
            });
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        if (!isPending) fetchContext();
    }, [isPending, fetchContext]);

    const handleSave = async () => {
        if (!context) return;
        setSaving(true);
        try {
            const res = await fetch('/api/users/me/context', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(context),
            });
            if (res.ok) {
                toast.success('Kontekst zapisany!');
                fetchContext();
            } else {
                toast.error('Błąd zapisu');
            }
        } catch {
            toast.error('Błąd połączenia');
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: keyof UserContext, value: string) => {
        if (!context) return;
        setContext({ ...context, [field]: value });
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-6 space-y-6">
                <Skeleton className="h-8 w-60" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64 md:col-span-2" />
                </div>
            </div>
        );
    }

    if (!context) return null;

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                    <User className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-foreground">Mój Kontekst</h1>
                    <p className="text-sm text-muted-foreground">
                        Profil i dane kontekstowe dla AI — im więcej uzupełnisz, tym lepiej AI Cię zrozumie
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center',
                                isActive
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'dashboard' && <DashboardTab context={context} />}
                    {activeTab === 'chat' && <ChatTab />}
                    {activeTab === 'edit' && (
                        <EditTab
                            context={context}
                            updateField={updateField}
                            handleSave={handleSave}
                            saving={saving}
                        />
                    )}
                    {activeTab === 'personality' && (
                        <PersonalityTab
                            context={context}
                            updateField={updateField}
                            handleSave={handleSave}
                            saving={saving}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
