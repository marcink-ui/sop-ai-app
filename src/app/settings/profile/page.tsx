'use client';

import { useState, useEffect, useRef } from 'react';
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
    Loader2,
    Upload,
    X,
    Sparkles,
    Target,
    MessageSquare,
    Briefcase,
    Star,
    Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ProfileSettingsPage() {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        role: '',
        organization: '',
        avatar: '',
        // Profile fields
        bio: '',
        cv: '',
        phone: '',
        linkedin: '',
        // Personality Tests
        mbti: '',
        disc: '',
        strengthsFinder: '',
        enneagram: '',
        personalityNotes: '',
        // Communication & Work
        communicationStyle: 'direct',
        workingHours: '',
        preferredLanguage: 'pl',
        // Career & Professional
        certifications: '',
        skills: '',
        interests: '',
        goals: '',
        values: '',
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load profile from API
    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await fetch('/api/users/me/context');
                if (res.ok) {
                    const data = await res.json();
                    setProfile(prev => ({
                        ...prev,
                        name: data.name || '',
                        email: data.email || '',
                        role: data.role || '',
                        organization: data.organization || '',
                        avatar: data.avatar || '',
                        bio: data.bio || '',
                        cv: data.cv || '',
                        phone: data.phone || '',
                        linkedin: data.linkedin || '',
                        mbti: data.mbti || '',
                        disc: data.disc || '',
                        strengthsFinder: data.strengthsFinder || '',
                        enneagram: data.enneagram || '',
                        personalityNotes: data.personalityNotes || '',
                        communicationStyle: data.communicationStyle || 'direct',
                        workingHours: data.workingHours || '',
                        preferredLanguage: data.preferredLanguage || 'pl',
                        certifications: data.certifications || '',
                        skills: data.skills || '',
                        interests: data.interests || '',
                        goals: data.goals || '',
                        values: data.values || '',
                    }));
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
                toast.error('Nie udało się załadować profilu');
            } finally {
                setIsLoading(false);
            }
        }
        loadProfile();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/users/me/context', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });
            if (res.ok) {
                toast.success('Profil został zapisany');
            } else {
                toast.error('Nie udało się zapisać profilu');
            }
        } catch {
            toast.error('Błąd podczas zapisywania');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            toast.error('Wybierz plik graficzny (JPG, PNG, GIF)');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Plik jest za duży. Maksymalnie 2MB');
            return;
        }

        setIsUploading(true);
        try {
            // Convert to base64 data URL for storage
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result as string;
                setProfile(prev => ({ ...prev, avatar: base64 }));

                // Save immediately
                try {
                    const res = await fetch('/api/users/me/avatar', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: base64 }),
                    });
                    if (res.ok) {
                        toast.success('Zdjęcie profilowe zostało zaktualizowane');
                    } else {
                        toast.error('Nie udało się zapisać zdjęcia');
                    }
                } catch {
                    toast.error('Błąd podczas przesyłania zdjęcia');
                }
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch {
            toast.error('Błąd podczas przesyłania');
            setIsUploading(false);
        }
    };

    const removePhoto = () => {
        setProfile(prev => ({ ...prev, avatar: '' }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

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
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
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
                    {/* Avatar with upload */}
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            {profile.avatar ? (
                                <div className="relative">
                                    <img
                                        src={profile.avatar}
                                        alt={profile.name}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-violet-500/30"
                                    />
                                    <button
                                        onClick={removePhoto}
                                        className="absolute -top-1 -right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                    {profile.name?.charAt(0) || '?'}
                                </div>
                            )}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-card border border-border hover:bg-muted transition-colors shadow-sm"
                            >
                                {isUploading ? (
                                    <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
                                ) : (
                                    <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">Zdjęcie profilowe</p>
                            <p className="text-xs text-muted-foreground">JPG, PNG lub GIF. Max 2MB</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="mt-1 flex items-center gap-1 text-xs text-violet-500 hover:text-violet-400 transition-colors"
                            >
                                <Upload className="h-3 w-3" />
                                {isUploading ? 'Przesyłanie...' : 'Wybierz plik'}
                            </button>
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
                                    className="pl-10 bg-muted/30"
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefon</Label>
                            <Input
                                id="phone"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                placeholder="+48 ..."
                                className="bg-muted/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn</Label>
                            <Input
                                id="linkedin"
                                value={profile.linkedin}
                                onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                                placeholder="https://linkedin.com/in/..."
                                className="bg-muted/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="organization">Organizacja</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="organization"
                                    value={profile.organization}
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
                <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-cyan-400" />
                    <h2 className="text-lg font-semibold text-foreground">Kontekst AI</h2>
                </div>
                <p className="text-xs text-muted-foreground mb-6 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Te dane są automatycznie używane przez AI Chat do personalizacji odpowiedzi
                </p>

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
                        <Label htmlFor="cv" className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-blue-400" />
                            CV / Doświadczenie zawodowe
                        </Label>
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

                    {/* Skills & Interests */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="skills" className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-400" />
                                Umiejętności
                            </Label>
                            <textarea
                                id="skills"
                                value={profile.skills}
                                onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                                placeholder="Kluczowe umiejętności, technologie, kompetencje..."
                                className="w-full h-20 px-3 py-2 rounded-lg bg-muted/30 border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="interests" className="flex items-center gap-2">
                                <Compass className="h-4 w-4 text-emerald-400" />
                                Zainteresowania
                            </Label>
                            <textarea
                                id="interests"
                                value={profile.interests}
                                onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
                                placeholder="Zainteresowania zawodowe, obszary rozwoju..."
                                className="w-full h-20 px-3 py-2 rounded-lg bg-muted/30 border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            />
                        </div>
                    </div>

                    {/* Goals & Values */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="goals" className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-red-400" />
                                Cele
                            </Label>
                            <textarea
                                id="goals"
                                value={profile.goals}
                                onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
                                placeholder="Cele zawodowe i osobiste..."
                                className="w-full h-20 px-3 py-2 rounded-lg bg-muted/30 border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="values">Wartości</Label>
                            <textarea
                                id="values"
                                value={profile.values}
                                onChange={(e) => setProfile({ ...profile, values: e.target.value })}
                                placeholder="Kluczowe wartości, którymi się kierujesz..."
                                className="w-full h-20 px-3 py-2 rounded-lg bg-muted/30 border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            />
                        </div>
                    </div>

                    {/* Personality Tests */}
                    <div>
                        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                            <Heart className="h-4 w-4 text-rose-400" />
                            Testy osobowości
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="mbti">MBTI</Label>
                                <Input
                                    id="mbti"
                                    value={profile.mbti}
                                    onChange={(e) => setProfile({ ...profile, mbti: e.target.value })}
                                    placeholder="np. INTJ"
                                    className="bg-muted/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="disc">DISC</Label>
                                <Input
                                    id="disc"
                                    value={profile.disc}
                                    onChange={(e) => setProfile({ ...profile, disc: e.target.value })}
                                    placeholder="np. D/I"
                                    className="bg-muted/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="enneagram">Enneagram</Label>
                                <Input
                                    id="enneagram"
                                    value={profile.enneagram}
                                    onChange={(e) => setProfile({ ...profile, enneagram: e.target.value })}
                                    placeholder="np. Type 3"
                                    className="bg-muted/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="strengthsFinder">StrengthsFinder</Label>
                                <Input
                                    id="strengthsFinder"
                                    value={profile.strengthsFinder}
                                    onChange={(e) => setProfile({ ...profile, strengthsFinder: e.target.value })}
                                    placeholder="Top 5 talents"
                                    className="bg-muted/30"
                                />
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <Label htmlFor="personalityNotes">Dodatkowe notatki / inne testy</Label>
                            <textarea
                                id="personalityNotes"
                                value={profile.personalityNotes}
                                onChange={(e) => setProfile({ ...profile, personalityNotes: e.target.value })}
                                placeholder="Wyniki innych testów, notatki o osobowości..."
                                className="w-full h-20 px-3 py-2 rounded-lg bg-muted/30 border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
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
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-blue-400" />
                            Preferowany styl komunikacji
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: 'direct', label: 'Bezpośredni' },
                                { value: 'detailed', label: 'Szczegółowy' },
                                { value: 'concise', label: 'Zwięzły' },
                                { value: 'formal', label: 'Formalny' },
                                { value: 'casual', label: 'Swobodny' },
                                { value: 'analytical', label: 'Analityczny' },
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

                    {/* Working Hours & Language */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="workingHours">Godziny pracy</Label>
                            <Input
                                id="workingHours"
                                value={profile.workingHours}
                                onChange={(e) => setProfile({ ...profile, workingHours: e.target.value })}
                                placeholder="np. 9:00-17:00 CET"
                                className="bg-muted/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="preferredLanguage">Preferowany język AI</Label>
                            <select
                                id="preferredLanguage"
                                value={profile.preferredLanguage}
                                onChange={(e) => setProfile({ ...profile, preferredLanguage: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-input text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            >
                                <option value="pl">Polski</option>
                                <option value="en">English</option>
                                <option value="de">Deutsch</option>
                            </select>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
