'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Code2, Copy, Check, Plus, Star, Download } from 'lucide-react';

interface SystemPrompt {
    id: string;
    name: string;
    category: string;
    description: string;
    prompt: string;
    useCases: string[];
    rating: number;
    uses: number;
}

const SAMPLE_PROMPTS: SystemPrompt[] = [
    {
        id: '1',
        name: 'Asystent Sprzedaży B2B',
        category: 'Sales',
        description: 'Prompt do generowania personalizowanych wiadomości sprzedażowych dla klientów B2B',
        prompt: `Jesteś ekspertem sprzedaży B2B z 15-letnim doświadczeniem. Twoje zadanie to:
1. Analizować profil klienta i jego potrzeby
2. Generować personalizowane wiadomości outreach
3. Identyfikować pain points i proponować rozwiązania
4. Używać tonu profesjonalnego, ale przyjaznego

Zawsze zaczynaj od pytania o kontekst klienta i branżę.`,
        useCases: ['Cold outreach', 'Follow-up emails', 'LinkedIn messages'],
        rating: 4.8,
        uses: 234,
    },
    {
        id: '2',
        name: 'Analizator Procesów MUDA',
        category: 'Lean',
        description: 'Identyfikacja strat i nieefektywności w procesach biznesowych',
        prompt: `Jesteś ekspertem Lean Manufacturing i Six Sigma. Analizujesz procesy pod kątem 8 rodzajów strat (MUDA):
1. Transport - niepotrzebne przemieszczanie
2. Inventory - nadmiarowe zapasy
3. Motion - zbędne ruchy
4. Waiting - oczekiwanie
5. Overproduction - nadprodukcja
6. Overprocessing - nadmierne przetwarzanie
7. Defects - wady
8. Skills - niewykorzystane umiejętności

Dla każdego procesu podaj konkretne rekomendacje.`,
        useCases: ['Process audit', 'Efficiency analysis', 'Cost reduction'],
        rating: 4.9,
        uses: 156,
    },
    {
        id: '3',
        name: 'Kreator Dokumentacji SOP',
        category: 'Operations',
        description: 'Automatyczne tworzenie Standard Operating Procedures z transkrypcji',
        prompt: `Jesteś technical writerem specjalizującym się w dokumentacji procesów. Na podstawie transkrypcji rozmowy stwórz strukturyzowany SOP zawierający:

1. Cel procedury
2. Zakres stosowania
3. Wymagane zasoby i narzędzia
4. Kroki procedury (szczegółowo, z podpunktami)
5. Checklisty weryfikacyjne
6. Potencjalne problemy i rozwiązania
7. Metryki sukcesu

Używaj języka prostego i jasnego. Każdy krok musi być wykonalny.`,
        useCases: ['SOP creation', 'Documentation', 'Training materials'],
        rating: 4.7,
        uses: 189,
    },
];

const CATEGORIES = ['Wszystkie', 'Sales', 'Lean', 'Operations', 'HR', 'Marketing'];

export default function PromptsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Wszystkie');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const filteredPrompts = SAMPLE_PROMPTS.filter(prompt => {
        const matchesSearch = prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Wszystkie' || prompt.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const copyToClipboard = async (prompt: SystemPrompt) => {
        await navigator.clipboard.writeText(prompt.prompt);
        setCopiedId(prompt.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Code2 className="h-6 w-6 text-slate-500" />
                        System Prompts
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Baza gotowych promptów do implementacji w różnych środowiskach
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj Prompt
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj promptów..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map(category => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Prompts Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPrompts.map(prompt => (
                    <Card key={prompt.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <Badge variant="outline">{prompt.category}</Badge>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span className="text-sm font-medium">{prompt.rating}</span>
                                </div>
                            </div>
                            <CardTitle className="text-lg">{prompt.name}</CardTitle>
                            <CardDescription>{prompt.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <div className="flex flex-wrap gap-1 mb-4">
                                {prompt.useCases.map(use => (
                                    <Badge key={use} variant="secondary" className="text-xs">
                                        {use}
                                    </Badge>
                                ))}
                            </div>
                            <div className="mt-auto flex items-center justify-between pt-4 border-t">
                                <span className="text-xs text-muted-foreground">
                                    {prompt.uses} uses
                                </span>
                                <div className="flex gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                Podgląd
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>{prompt.name}</DialogTitle>
                                                <DialogDescription>{prompt.description}</DialogDescription>
                                            </DialogHeader>
                                            <Textarea
                                                value={prompt.prompt}
                                                readOnly
                                                className="min-h-[300px] font-mono text-sm"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" onClick={() => copyToClipboard(prompt)}>
                                                    {copiedId === prompt.id ? (
                                                        <Check className="h-4 w-4 mr-2" />
                                                    ) : (
                                                        <Copy className="h-4 w-4 mr-2" />
                                                    )}
                                                    {copiedId === prompt.id ? 'Skopiowano!' : 'Kopiuj'}
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <Button
                                        size="sm"
                                        onClick={() => copyToClipboard(prompt)}
                                    >
                                        {copiedId === prompt.id ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredPrompts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Code2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nie znaleziono promptów</p>
                </div>
            )}
        </div>
    );
}
