'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Tag, BookOpen, Download, Copy, Sparkles, FolderOpen, Puzzle, ChevronRight, Pencil, Eye, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Sample article content (in production, this would come from an API/database)
const ARTICLES: Record<string, {
    title: string;
    category: string;
    content: string;
    author: string;
    updatedAt: string;
    tags: string[];
}> = {
    '1': {
        title: 'Jak tworzyć efektywne SOPy',
        category: 'Procesy',
        content: `## Wprowadzenie

Standard Operating Procedures (SOPy) są kluczowym elementem efektywnego zarządzania procesami w organizacji. Dobrze napisane SOPy pomagają:

- Standaryzować procesy
- Redukować błędy
- Ułatwiać onboarding nowych pracowników
- Zapewniać zgodność z regulacjami

## Struktura efektywnego SOPu

### 1. Cel procedury
Jasno określ, dlaczego ta procedura istnieje i jakie problemy rozwiązuje.

### 2. Zakres
Określ, kto jest odpowiedzialny za wykonanie i kiedy procedura ma zastosowanie.

### 3. Kroki wykonania
Opisz każdy krok w sposób:
- Jednoznaczny
- Mierzalny
- Wykonalny

### 4. Metryki i KPI
Zdefiniuj, jak mierzyć sukces wykonania procedury.

## Najlepsze praktyki

1. **KISS** - Keep It Simple, Stupid
2. **Testuj** - Przed wdrożeniem przetestuj z użytkownikami
3. **Aktualizuj** - Regularnie przeglądaj i aktualizuj procedury
4. **Wizualizuj** - Używaj diagramów i zrzutów ekranu`,
        author: 'Admin',
        updatedAt: '2024-01-15',
        tags: ['SOP', 'Procesy', 'Best Practices'],
    },
    '2': {
        title: 'Wprowadzenie do VantageOS',
        category: 'Onboarding',
        content: `## Czym jest VantageOS?

VantageOS to kompleksowy system operacyjny dla biznesu, który łączy:

- **Zarządzanie procesami (SOPy)**
- **Sztuczną inteligencję (Agenci AI)**
- **Metodologię Lean (MUDA Analysis)**

## Pierwsze kroki

### 1. Dashboard
Po zalogowaniu zobaczysz dashboard z kluczowymi metrykami organizacji.

### 2. Nawigacja
Boczny panel zawiera wszystkie moduły systemu pogrupowane tematycznie.

### 3. AI Chat
W prawym dolnym rogu znajdziesz asystenta AI, który pomoże Ci w codziennej pracy.

## Kluczowe moduły

- **SOPy** - twórz i zarządzaj procedurami
- **Raporty MUDA** - identyfikuj straty w procesach
- **Agenci AI** - automatyzuj rutynowe zadania
- **Rada** - zgłaszaj i wymagaj decyzji od kierownictwa`,
        author: 'Admin',
        updatedAt: '2024-01-20',
        tags: ['Onboarding', 'Podstawy', 'Start'],
    },
    '3': {
        title: 'Konfiguracja Agentów AI',
        category: 'AI',
        content: `## O agentach AI

Agenci AI w VantageOS to specjalizowane jednostki, które automatyzują konkretne zadania w organizacji.

## Typy agentów

### 1. Asystent (Assistant)
Dobrze ustrukturyzowany system prompt + baza wiedzy. Odpowiada na pytania.

### 2. Agent
Prompt + wiedza + wykonuje konkretne akcje (wewnętrzne lub zewnętrzne).

### 3. Automatyzacja (Automation)
Deterministyczna logika algorytmiczna — skrypty, wyliczenia, funkcje. Brak AI, 100% pewny wynik.

## Konfiguracja

1. Przejdź do sekcji **Agenci AI**
2. Wybierz typ: Asystent, Agent lub Automatyzacja
3. Skonfiguruj parametry
4. Przypisz do odpowiednich procesów

## Najlepsze praktyki

- Zacznij od jednego agenta
- Monitoruj jego działanie
- Stopniowo rozszerzaj zakres`,
        author: 'AI Team',
        updatedAt: '2024-02-01',
        tags: ['AI', 'Automatyzacja', 'Konfiguracja'],
    },
    '4': {
        title: 'MUDA Analysis - Identyfikacja Strat',
        category: 'Lean',
        content: `## Czym jest MUDA?

MUDA to japońskie słowo oznaczające "stratę". W kontekście Lean Management oznacza wszelkie działania, które nie dodają wartości.

## 7 typów strat (MUDA)

1. **Transport** - niepotrzebne przemieszczanie materiałów
2. **Inventory** - nadmierny zapas
3. **Motion** - zbędny ruch pracowników
4. **Waiting** - czas oczekiwania
5. **Overproduction** - nadprodukcja
6. **Overprocessing** - nadmierne przetwarzanie
7. **Defects** - wady i błędy

## Jak identyfikować straty?

### Gemba Walk
Idź tam, gdzie praca jest wykonywana i obserwuj.

### Mapowanie strumienia wartości
Narysuj przepływ procesu i zidentyfikuj wąskie gardła.

### Analiza czasowa
Zmierz, ile czasu każdy krok faktycznie zajmuje.

## W VantageOS

Moduł MUDA Reports pozwala:
- Zgłaszać zaobserwowane straty
- Kategoryzować je według typu
- Szacować potencjalne oszczędności
- Śledzić postęp eliminacji`,
        author: 'Lean Team',
        updatedAt: '2024-02-05',
        tags: ['MUDA', 'Lean', 'Optymalizacja'],
    },
};

// Must reads sidebar content
const MUST_READS = [
    { title: 'Wprowadzenie do VantageOS', type: 'guide' },
    { title: 'Struktura SOP', type: 'article' },
    { title: 'Kaizen - ciągłe doskonalenie', type: 'article' },
    { title: 'MUDA vs Value Stream', type: 'comparison' },
];

// Related directories
const EXPLORE_DIRECTORIES = [
    { title: 'Procedury SOP', count: '45+ dokumentów', icon: '📋' },
    { title: 'Szablony', count: '12 szablonów', icon: '📄' },
    { title: 'Case Studies', count: '8 studiów', icon: '📊' },
    { title: 'Video Tutoriale', count: '15 filmów', icon: '🎬' },
];

// Related extensions/tools
const SUGGESTED_EXTENSIONS = [
    { title: 'SOP Generator', color: 'bg-blue-500' },
    { title: 'MUDA Analyzer', color: 'bg-emerald-500' },
];

export default function WikiArticlePage() {
    const params = useParams();
    const router = useRouter();
    const articleId = params.id as string;
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const article = ARTICLES[articleId];

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState('');

    useEffect(() => {
        if (article) {
            setEditContent(article.content);
            setEditTitle(article.title);
        }
    }, [article]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current && isEditing) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [editContent, isEditing]);

    const handleCopy = () => {
        if (article) {
            navigator.clipboard.writeText(article.content);
            toast.success('Skopiowano do schowka');
        }
    };

    const handleDownload = () => {
        if (article) {
            const blob = new Blob([`# ${article.title}\n\n${article.content}`], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${article.title.replace(/\s+/g, '_')}.md`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Pobrano plik');
        }
    };

    const handleSave = () => {
        // In production, this would POST to API
        toast.success('Zapisano zmiany', {
            description: 'Artykuł został zaktualizowany pomyślnie.',
        });
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        if (article) {
            setEditContent(article.content);
            setEditTitle(article.title);
        }
        setIsEditing(false);
    };

    if (!article) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="text-center py-12 max-w-md">
                    <CardContent>
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h2 className="text-xl font-semibold mb-2">Artykuł nie znaleziony</h2>
                        <p className="text-muted-foreground mb-4">
                            Przepraszamy, nie możemy znaleźć tego artykułu.
                        </p>
                        <Button onClick={() => router.push('/resources')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Wróć do Resources
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Parse content into sections
    const renderContent = (content: string) => {
        const lines = content.split('\n');
        const elements: React.ReactNode[] = [];
        let currentList: string[] = [];
        let listType: 'ul' | 'ol' | null = null;

        const flushList = () => {
            if (currentList.length > 0 && listType) {
                const ListTag = listType === 'ol' ? 'ol' : 'ul';
                elements.push(
                    <ListTag key={`list-${elements.length}`} className={cn(
                        "my-4 space-y-2",
                        listType === 'ol' ? "list-decimal" : "list-disc",
                        "ml-6"
                    )}>
                        {currentList.map((item, i) => (
                            <li key={i} className="text-muted-foreground">
                                {item.includes('**') ? (
                                    <>
                                        <strong className="text-foreground">{item.match(/\*\*(.+?)\*\*/)?.[1]}</strong>
                                        {item.replace(/\*\*(.+?)\*\*/, '')}
                                    </>
                                ) : item}
                            </li>
                        ))}
                    </ListTag>
                );
                currentList = [];
                listType = null;
            }
        };

        lines.forEach((line, i) => {
            if (line.startsWith('## ')) {
                flushList();
                elements.push(
                    <h2 key={i} className="text-xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
                        <span className="w-1 h-6 bg-primary rounded-full" />
                        {line.slice(3)}
                    </h2>
                );
            } else if (line.startsWith('### ')) {
                flushList();
                elements.push(
                    <h3 key={i} className="text-lg font-medium mt-6 mb-3 text-foreground/90">
                        {line.slice(4)}
                    </h3>
                );
            } else if (line.startsWith('- ')) {
                if (listType !== 'ul') {
                    flushList();
                    listType = 'ul';
                }
                currentList.push(line.slice(2));
            } else if (line.match(/^\d+\. /)) {
                if (listType !== 'ol') {
                    flushList();
                    listType = 'ol';
                }
                currentList.push(line.replace(/^\d+\. /, ''));
            } else if (line.trim()) {
                flushList();
                elements.push(
                    <p key={i} className="text-muted-foreground my-3 leading-relaxed">
                        {line}
                    </p>
                );
            }
        });

        flushList();
        return elements;
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="flex">
                {/* Main Content Area */}
                <div className="flex-1 max-w-4xl mx-auto px-6 py-8">
                    {/* Back Navigation */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/resources')}
                            className="text-muted-foreground hover:text-foreground -ml-2"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Wróć do Resources
                        </Button>
                    </motion.div>

                    {/* Title Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-start justify-between mb-6"
                    >
                        <div className="flex-1">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="text-3xl font-bold mb-4 bg-transparent border-b-2 border-primary/30 focus:border-primary outline-none w-full pb-2 transition-colors"
                                    placeholder="Tytuł artykułu..."
                                />
                            ) : (
                                <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {article.tags.map(tag => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="bg-muted/50 hover:bg-muted text-xs"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 ml-4">
                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    <motion.div
                                        key="editing-buttons"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex gap-2"
                                    >
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleCancelEdit}
                                            className="gap-2 text-red-500 border-red-500/30 hover:bg-red-500/10"
                                        >
                                            <X className="h-4 w-4" />
                                            Anuluj
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSave}
                                            className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                                        >
                                            <Save className="h-4 w-4" />
                                            Zapisz
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="view-buttons"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex gap-2"
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsEditing(true)}
                                            className="gap-2 border-violet-500/30 text-violet-600 hover:bg-violet-500/10"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Edytuj
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDownload}
                                            className="gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Pobierz
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopy}
                                            className="gap-2"
                                        >
                                            <Copy className="h-4 w-4" />
                                            Kopiuj
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Edit Mode Indicator */}
                    <AnimatePresence>
                        {isEditing && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4"
                            >
                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                                    <Pencil className="h-4 w-4 text-violet-500" />
                                    <span className="text-sm text-violet-600 dark:text-violet-400 font-medium">Tryb edycji</span>
                                    <span className="text-xs text-muted-foreground ml-2">Edytuj treść w formacie Markdown. Kliknij &quot;Zapisz&quot; gdy skończysz.</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Article Content Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-8">
                                {isEditing ? (
                                    <textarea
                                        ref={textareaRef}
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full min-h-[400px] bg-transparent text-foreground font-mono text-sm leading-relaxed resize-none outline-none border-none focus:ring-0 p-0"
                                        placeholder="Treść artykułu w formacie Markdown..."
                                    />
                                ) : (
                                    renderContent(article.content)
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Metadata Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-6 mt-6 text-sm text-muted-foreground"
                    >
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{article.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Zaktualizowano {article.updatedAt}</span>
                        </div>
                        <Badge variant="outline">{article.category}</Badge>
                    </motion.div>
                </div>

                {/* Right Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="hidden xl:block w-80 border-l border-border/50 p-6 space-y-8"
                >
                    {/* Must Reads Section */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                            Warto przeczytać
                        </h4>
                        <div className="space-y-3">
                            {MUST_READS.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 text-sm cursor-pointer hover:text-primary transition-colors group"
                                >
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        i === 0 ? "bg-primary" : "bg-muted-foreground/30"
                                    )} />
                                    <span className="group-hover:translate-x-0.5 transition-transform">
                                        {item.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Explore Directories */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                            Przeglądaj katalogi
                        </h4>
                        <div className="space-y-2">
                            {EXPLORE_DIRECTORIES.map((item, i) => (
                                <Card
                                    key={i}
                                    className="cursor-pointer hover:bg-accent/50 transition-colors border-border/50"
                                >
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <span className="text-lg">{item.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">{item.title}</div>
                                            <div className="text-xs text-muted-foreground">{item.count}</div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Suggested Extensions */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                            Powiązane narzędzia
                        </h4>
                        <div className="space-y-2">
                            {SUGGESTED_EXTENSIONS.map((item, i) => (
                                <Card
                                    key={i}
                                    className="cursor-pointer hover:bg-accent/50 transition-colors border-border/50"
                                >
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center",
                                            item.color
                                        )}>
                                            <Puzzle className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="font-medium text-sm">{item.title}</span>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
