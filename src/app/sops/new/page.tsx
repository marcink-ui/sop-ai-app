'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import {
    FileText,
    Upload,
    Mic,
    ArrowLeft,
    Sparkles,
    Image,
    Video,
    Link as LinkIcon,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Plus,
    Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreatableCombobox } from '@/components/ui/creatable-combobox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Department {
    id: string;
    name: string;
}

interface OrganizationalRole {
    id: string;
    name: string;
    departmentId?: string;
}

interface TriggerSuggestion {
    text: string;
    category: string;
}

// Polish trigger suggestions based on common business processes
const defaultTriggerSuggestions: TriggerSuggestion[] = [
    { text: 'Otrzymanie zapytania od klienta', category: 'Obsługa Klienta' },
    { text: 'Nowe zamówienie w systemie', category: 'Sprzedaż' },
    { text: 'Zgłoszenie błędu lub problemu', category: 'IT' },
    { text: 'Koniec miesiąca rozliczeniowego', category: 'Finanse' },
    { text: 'Nowy pracownik w zespole', category: 'HR' },
    { text: 'Spotkanie statusowe zespołu', category: 'Zarządzanie' },
    { text: 'Wpłynięcie faktury do systemu', category: 'Finanse' },
    { text: 'Reklamacja produktu/usługi', category: 'Obsługa Klienta' },
    { text: 'Rozpoczęcie nowego projektu', category: 'Operacje' },
    { text: 'Zmiana w regulacjach prawnych', category: 'Compliance' },
];

export default function NewSOPPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    // State
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSuggestingDescription, setIsSuggestingDescription] = useState(false);
    const [inputMode, setInputMode] = useState<'text' | 'audio'>('text');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    // Data from API
    const [departments, setDepartments] = useState<Department[]>([]);
    const [roles, setRoles] = useState<OrganizationalRole[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Filtered options for comboboxes
    const [availableDepartments, setAvailableDepartments] = useState<{ label: string; value: string }[]>([]);
    const [availableRoles, setAvailableRoles] = useState<{ label: string; value: string }[]>([]);
    const [triggerSuggestions, setTriggerSuggestions] = useState<TriggerSuggestion[]>(defaultTriggerSuggestions);

    // Form state
    const [form, setForm] = useState({
        processName: '',
        department: '',
        departmentId: '',
        role: '',
        roleId: '',
        trigger: '',
        outcome: '',
        transcript: '',
        description: '',
    });

    // Media attachments
    const [attachments, setAttachments] = useState<{
        type: 'image' | 'video' | 'link';
        url: string;
        name: string;
    }[]>([]);

    // Load departments and roles from API
    useEffect(() => {
        async function loadData() {
            if (isPending || !session) return;

            setIsLoadingData(true);
            try {
                // Fetch departments
                const deptRes = await fetch('/api/departments');
                if (deptRes.ok) {
                    const deptData = await deptRes.json();
                    setDepartments(deptData.departments || []);
                    setAvailableDepartments(
                        (deptData.departments || []).map((d: Department) => ({
                            label: d.name,
                            value: d.id,
                        }))
                    );
                }

                // Fetch roles
                const rolesRes = await fetch('/api/roles');
                if (rolesRes.ok) {
                    const rolesData = await rolesRes.json();
                    setRoles(rolesData.roles || []);
                    setAvailableRoles(
                        (rolesData.roles || []).map((r: OrganizationalRole) => ({
                            label: r.name,
                            value: r.id,
                        }))
                    );
                }

                // Auto-select user's department if available
                // Note: This would come from session.user.departmentId when available
            } catch (error) {
                console.error('Error loading form data:', error);
                // Fall back to default static lists
                setAvailableDepartments([
                    { label: 'Sprzedaż', value: 'sprzedaz' },
                    { label: 'Marketing', value: 'marketing' },
                    { label: 'Operacje', value: 'operacje' },
                    { label: 'Finanse', value: 'finanse' },
                    { label: 'HR', value: 'hr' },
                    { label: 'IT', value: 'it' },
                    { label: 'Obsługa Klienta', value: 'obsluga-klienta' },
                    { label: 'Produkcja', value: 'produkcja' },
                    { label: 'Logistyka', value: 'logistyka' },
                ]);
                setAvailableRoles([
                    { label: 'Specjalista', value: 'specjalista' },
                    { label: 'Manager', value: 'manager' },
                    { label: 'Dyrektor', value: 'dyrektor' },
                    { label: 'Asystent', value: 'asystent' },
                    { label: 'Analityk', value: 'analityk' },
                    { label: 'Konsultant', value: 'konsultant' },
                    { label: 'Administrator', value: 'administrator' },
                ]);
            } finally {
                setIsLoadingData(false);
            }
        }

        loadData();
    }, [isPending, session]);

    // Filter trigger suggestions based on selected department
    useEffect(() => {
        if (form.department) {
            const deptName = availableDepartments.find(d => d.value === form.department)?.label;
            if (deptName) {
                const filtered = defaultTriggerSuggestions.filter(
                    t => t.category === deptName || t.category === 'Zarządzanie'
                );
                setTriggerSuggestions(filtered.length > 0 ? filtered : defaultTriggerSuggestions);
            }
        } else {
            setTriggerSuggestions(defaultTriggerSuggestions);
        }
    }, [form.department, availableDepartments]);

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreateDepartment = async (value: string) => {
        // Add to local state immediately
        const newDept = { label: value, value: `new-${Date.now()}` };
        setAvailableDepartments(prev => [...prev, newDept]);
        setForm(prev => ({ ...prev, department: newDept.value }));

        // TODO: Create in database via API
        // const res = await fetch('/api/departments', {
        //     method: 'POST',
        //     body: JSON.stringify({ name: value }),
        // });
    };

    const handleCreateRole = async (value: string) => {
        // Add to local state immediately
        const newRole = { label: value, value: `new-${Date.now()}` };
        setAvailableRoles(prev => [...prev, newRole]);
        setForm(prev => ({ ...prev, role: newRole.value }));

        // TODO: Create in database via API with validation
        // If role is outside user's department, require approval from Citizen Dev+
    };

    const handleSuggestDescription = async () => {
        if (!form.processName || !form.trigger) {
            return;
        }

        setIsSuggestingDescription(true);
        try {
            const res = await fetch('/api/sops/suggest-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    processName: form.processName,
                    department: availableDepartments.find(d => d.value === form.department)?.label,
                    role: availableRoles.find(r => r.value === form.role)?.label,
                    trigger: form.trigger,
                    outcome: form.outcome,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                handleChange('description', data.suggestion || '');
            }
        } catch (error) {
            console.error('Error suggesting description:', error);
        } finally {
            setIsSuggestingDescription(false);
        }
    };

    const handleGenerate = async () => {
        if (!form.processName || !form.department || !form.transcript) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
            return;
        }

        setIsGenerating(true);
        setSaveStatus('saving');

        try {
            // Get department name for display
            const deptName = availableDepartments.find(d => d.value === form.department)?.label || form.department;
            const roleName = availableRoles.find(r => r.value === form.role)?.label || form.role;

            // Generate SOP code
            const code = `SOP-${deptName.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

            const res = await fetch('/api/sops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.processName,
                    code,
                    purpose: form.description || `Proces wyzwalany przez: ${form.trigger || 'N/A'}. Oczekiwany rezultat: ${form.outcome || 'N/A'}`,
                    scope: JSON.stringify({
                        trigger: form.trigger || 'Nie określono',
                        outcome: form.outcome || 'Nie określono',
                    }),
                    departmentId: form.department.startsWith('new-') ? null : form.department,
                    steps: JSON.stringify([{
                        id: 1,
                        name: 'Krok początkowy',
                        actions: ['Przeanalizuj dane wejściowe zgodnie ze standardowymi procedurami'],
                    }]),
                    owner: roleName,
                    transcript: form.transcript,
                    attachments: attachments,
                }),
            });

            if (res.ok) {
                setSaveStatus('success');
                setTimeout(() => {
                    router.push('/sops');
                }, 1000);
            } else {
                throw new Error('Failed to create SOP');
            }
        } catch (error) {
            console.error('Error creating SOP:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setIsGenerating(false);
        }
    };

    // Loading state
    if (isPending || isLoadingData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/sops">
                    <Button variant="ghost" size="sm" className="hover:bg-muted">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 shadow-lg">
                        <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Nowy SOP</h1>
                        <p className="text-sm text-muted-foreground">Utwórz z transkrypcji lub nagrania audio</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <Card className="border-border bg-card shadow-sm">
                <CardContent className="p-6 space-y-8">
                    {/* Process Details Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-foreground">Szczegóły procesu</h2>
                            <Badge variant="secondary" className="text-xs">Wymagane</Badge>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Process Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Nazwa procesu <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="np. Obsługa reklamacji klienta"
                                    value={form.processName}
                                    onChange={(e) => handleChange('processName', e.target.value)}
                                    className="bg-background border-input focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            {/* Department */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Dział <span className="text-red-500">*</span>
                                </label>
                                <CreatableCombobox
                                    options={availableDepartments}
                                    value={form.department}
                                    onChange={(v) => handleChange('department', v)}
                                    onCreate={handleCreateDepartment}
                                    placeholder="Wybierz lub wpisz dział..."
                                    className="bg-background border-input"
                                />
                            </div>

                            {/* Role */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Główna rola <span className="text-muted-foreground font-normal ml-1">(opcjonalne)</span>
                                </label>
                                <CreatableCombobox
                                    options={availableRoles}
                                    value={form.role}
                                    onChange={(v) => handleChange('role', v)}
                                    onCreate={handleCreateRole}
                                    placeholder="Wybierz lub wpisz rolę..."
                                    className="bg-background border-input"
                                />
                            </div>

                            {/* Trigger with smart suggestions */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Wyzwalacz <span className="text-muted-foreground font-normal ml-1">(opcjonalne)</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        placeholder="Co uruchamia ten proces?"
                                        value={form.trigger}
                                        onChange={(e) => handleChange('trigger', e.target.value)}
                                        className="bg-background border-input focus:ring-2 focus:ring-blue-500/20"
                                        list="triggers-list"
                                    />
                                    <datalist id="triggers-list">
                                        {triggerSuggestions.map(t => (
                                            <option key={t.text} value={t.text} />
                                        ))}
                                    </datalist>
                                </div>
                                {form.department && triggerSuggestions.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {triggerSuggestions.slice(0, 3).map((t) => (
                                            <button
                                                key={t.text}
                                                type="button"
                                                onClick={() => handleChange('trigger', t.text)}
                                                className={cn(
                                                    "text-xs px-2 py-1 rounded-full transition-colors",
                                                    "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {t.text.length > 30 ? t.text.substring(0, 30) + '...' : t.text}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Expected Outcome */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Oczekiwany rezultat <span className="text-muted-foreground font-normal ml-1">(opcjonalne)</span>
                            </label>
                            <Input
                                placeholder="Jaki jest końcowy efekt tego procesu?"
                                value={form.outcome}
                                onChange={(e) => handleChange('outcome', e.target.value)}
                                className="bg-background border-input focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        {/* AI Description Generator */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-foreground">
                                    Opis procesu
                                </label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleSuggestDescription}
                                                disabled={isSuggestingDescription || !form.processName}
                                                className="h-7 text-xs gap-1"
                                            >
                                                {isSuggestingDescription ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <Wand2 className="h-3 w-3" />
                                                )}
                                                Wygeneruj opis AI
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>AI wygeneruje opis na podstawie podanych danych</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Textarea
                                placeholder="Opisz krótko cel i zakres tego procesu..."
                                value={form.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className="min-h-[80px] bg-background border-input focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Input Mode Tabs */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-foreground">Opis procedury</h2>

                        <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'text' | 'audio')}>
                            <TabsList className="bg-muted/50">
                                <TabsTrigger
                                    value="text"
                                    className={cn(
                                        "data-[state=active]:bg-background data-[state=active]:text-foreground",
                                        "data-[state=active]:shadow-sm"
                                    )}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Wklej transkrypcję
                                </TabsTrigger>
                                <TabsTrigger
                                    value="audio"
                                    className={cn(
                                        "data-[state=active]:bg-background data-[state=active]:text-foreground",
                                        "data-[state=active]:shadow-sm"
                                    )}
                                >
                                    <Mic className="mr-2 h-4 w-4" />
                                    Prześlij audio
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="text" className="mt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">
                                        Transkrypcja <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        placeholder={`Wklej transkrypcję opisu procesu...

Przykład:
"Najpierw loguję się do systemu CRM. Następnie sprawdzam nowe leady przypisane do mnie. Dla każdego leada przeglądam profil firmy i przygotowuję spersonalizowaną wiadomość..."`}
                                        value={form.transcript}
                                        onChange={(e) => handleChange('transcript', e.target.value)}
                                        className="min-h-[200px] bg-background border-input font-mono text-sm focus:ring-2 focus:ring-blue-500/20"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Wklej transkrypcję nagrania z Fireflies, Otter, Komodo lub innego źródła
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="audio" className="mt-4">
                                <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center transition-colors hover:bg-muted/50">
                                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <p className="mt-4 text-foreground font-medium">
                                        Przeciągnij i upuść plik audio lub kliknij, aby wybrać
                                    </p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Obsługiwane formaty: MP3, WAV, M4A, OGG (max 25MB)
                                    </p>
                                    <Button variant="outline" className="mt-4">
                                        Wybierz plik
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <Separator />

                    {/* Media Attachments Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Załączniki</h2>
                                <p className="text-sm text-muted-foreground">
                                    Dodaj obrazy lub filmy jako materiały pomocnicze
                                </p>
                            </div>
                            <Badge variant="outline" className="text-xs">Opcjonalne</Badge>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                            <button
                                type="button"
                                className={cn(
                                    "flex flex-col items-center gap-2 p-4 rounded-lg",
                                    "border-2 border-dashed border-border",
                                    "text-muted-foreground hover:text-foreground",
                                    "hover:border-blue-500/50 hover:bg-blue-500/5",
                                    "transition-all duration-200"
                                )}
                            >
                                <Image className="h-6 w-6" />
                                <span className="text-sm font-medium">Dodaj obrazek</span>
                            </button>
                            <button
                                type="button"
                                className={cn(
                                    "flex flex-col items-center gap-2 p-4 rounded-lg",
                                    "border-2 border-dashed border-border",
                                    "text-muted-foreground hover:text-foreground",
                                    "hover:border-purple-500/50 hover:bg-purple-500/5",
                                    "transition-all duration-200"
                                )}
                            >
                                <Video className="h-6 w-6" />
                                <span className="text-sm font-medium">Prześlij wideo</span>
                            </button>
                            <button
                                type="button"
                                className={cn(
                                    "flex flex-col items-center gap-2 p-4 rounded-lg",
                                    "border-2 border-dashed border-border",
                                    "text-muted-foreground hover:text-foreground",
                                    "hover:border-green-500/50 hover:bg-green-500/5",
                                    "transition-all duration-200"
                                )}
                            >
                                <LinkIcon className="h-6 w-6" />
                                <span className="text-sm font-medium">Link do Loom/Komodo</span>
                            </button>
                        </div>

                        {attachments.length > 0 && (
                            <div className="space-y-2">
                                {attachments.map((att, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                    >
                                        <div className="flex items-center gap-2">
                                            {att.type === 'image' && <Image className="h-4 w-4" />}
                                            {att.type === 'video' && <Video className="h-4 w-4" />}
                                            {att.type === 'link' && <LinkIcon className="h-4 w-4" />}
                                            <span className="text-sm">{att.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                                        >
                                            Usuń
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            <span>W przyszłości AI będzie analizować przesłane materiały</span>
                        </p>
                    </div>

                    {/* Generate Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                        <AnimatePresence mode="wait">
                            {saveStatus === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 text-green-600 dark:text-green-400"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="text-sm">SOP utworzony pomyślnie!</span>
                                </motion.div>
                            )}
                            {saveStatus === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 text-red-600 dark:text-red-400"
                                >
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm">Wypełnij wymagane pola</span>
                                </motion.div>
                            )}
                            {saveStatus === 'idle' && <div />}
                        </AnimatePresence>

                        <div className="flex gap-3">
                            <Link href="/sops">
                                <Button variant="outline">
                                    Anuluj
                                </Button>
                            </Link>
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || saveStatus === 'saving'}
                                className={cn(
                                    "bg-gradient-to-r from-blue-600 to-cyan-600",
                                    "hover:from-blue-700 hover:to-cyan-700",
                                    "text-white shadow-lg shadow-blue-500/25"
                                )}
                            >
                                {isGenerating || saveStatus === 'saving' ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generowanie...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Wygeneruj SOP
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
