'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    User,
    Mail,
    Building2,
    Shield,
    Camera,
    Save,
    Brain,
    Heart,
    GraduationCap,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ProfileSettingsPage() {
    const [profile, setProfile] = useState({
        name: 'Demo User',
        email: 'demo@vantage.os',
        role: 'Administrator',
        organization: 'VantageOS Demo',
        avatar: '',
        // AI Context
        bio: '',
        cv: '',
        personalityTest: '',
        mbti: '',
        disc: '',
        certifications: '',
        communicationStyle: 'direct'
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        toast.success('Profil został zapisany');
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <Link href="/settings">
                        <Button variant="ghost" size="icon" className="hover:bg-muted">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Profil</h1>
                        <p className="text-sm text-muted-foreground">Dane osobowe i kontekst dla AI</p>
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-violet-600 hover:bg-violet-700"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </Button>
            </motion.div>

            {/* Standard Profile Data */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-xl border border-border bg-card/50 p-6"
            >
                <div className="flex items-center gap-2 mb-6">
                    <User className="h-5 w-5 text-violet-400" />
                    <h2 className="text-lg font-semibold text-foreground">Dane podstawowe</h2>
                </div>

                <div className="grid gap-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                {profile.name.charAt(0)}
                            </div>
                            <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-card border border-border hover:bg-muted transition-colors">
                                <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">Zdjęcie profilowe</p>
                            <p className="text-xs text-muted-foreground">JPG, PNG lub GIF. Max 2MB</p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Imię i nazwisko</Label>
                            <Input
                                id="name"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="bg-muted/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    className="pl-10 bg-muted/30"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="organization">Organizacja</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="organization"
                                    value={profile.organization}
                                    onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                                    className="pl-10 bg-muted/30"
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Rola</Label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="role"
                                    value={profile.role}
                                    className="pl-10 bg-muted/30"
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* AI Context Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-xl border border-border bg-card/50 p-6"
            >
                <div className="flex items-center gap-2 mb-6">
                    <Brain className="h-5 w-5 text-cyan-400" />
                    <h2 className="text-lg font-semibold text-foreground">Kontekst AI</h2>
                    <span className="text-xs text-muted-foreground ml-2">
                        Informacje używane przez agentów AI do personalizacji
                    </span>
                </div>

                <div className="grid gap-6">
                    {/* Bio */}
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio / Krótki opis</Label>
                        <textarea
                            id="bio"
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            placeholder="Opisz siebie, swoje doświadczenie i kompetencje..."
                            className="w-full h-24 px-3 py-2 rounded-lg bg-muted/30 border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground text-right">{profile.bio.length}/500</p>
                    </div>

                    {/* CV */}
                    <div className="space-y-2">
                        <Label htmlFor="cv">CV / Doświadczenie zawodowe</Label>
                        <textarea
                            id="cv"
                            value={profile.cv}
                            onChange={(e) => setProfile({ ...profile, cv: e.target.value })}
                            placeholder="Opisz swoje doświadczenie zawodowe, historię kariery, kluczowe projekty..."
                            className="w-full h-32 px-3 py-2 rounded-lg bg-muted/30 border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            maxLength={2000}
                        />
                        <p className="text-xs text-muted-foreground text-right">{profile.cv.length}/2000</p>
                    </div>

                    {/* Personality Tests */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="mbti" className="flex items-center gap-2">
                                <Heart className="h-4 w-4 text-rose-400" />
                                MBTI Type
                            </Label>
                            <Input
                                id="mbti"
                                value={profile.mbti}
                                onChange={(e) => setProfile({ ...profile, mbti: e.target.value })}
                                placeholder="np. INTJ, ENFP..."
                                className="bg-muted/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="disc" className="flex items-center gap-2">
                                <Heart className="h-4 w-4 text-amber-400" />
                                DISC Profile
                            </Label>
                            <Input
                                id="disc"
                                value={profile.disc}
                                onChange={(e) => setProfile({ ...profile, disc: e.target.value })}
                                placeholder="np. D, Di, iS..."
                                className="bg-muted/30"
                            />
                        </div>
                    </div>

                    {/* Certifications */}
                    <div className="space-y-2">
                        <Label htmlFor="certifications" className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-emerald-400" />
                            Certyfikaty i kursy
                        </Label>
                        <textarea
                            id="certifications"
                            value={profile.certifications}
                            onChange={(e) => setProfile({ ...profile, certifications: e.target.value })}
                            placeholder="Lista certyfikatów, ukończonych kursów, szkoleń..."
                            className="w-full h-20 px-3 py-2 rounded-lg bg-muted/30 border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        />
                    </div>

                    {/* Communication Style */}
                    <div className="space-y-2">
                        <Label>Preferowany styl komunikacji</Label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: 'direct', label: 'Bezpośredni' },
                                { value: 'detailed', label: 'Szczegółowy' },
                                { value: 'concise', label: 'Zwięzły' },
                                { value: 'formal', label: 'Formalny' },
                                { value: 'casual', label: 'Swobodny' }
                            ].map((style) => (
                                <button
                                    key={style.value}
                                    onClick={() => setProfile({ ...profile, communicationStyle: style.value })}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${profile.communicationStyle === style.value
                                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                        : 'bg-muted/30 text-muted-foreground border border-transparent hover:border-border'
                                        }`}
                                >
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
