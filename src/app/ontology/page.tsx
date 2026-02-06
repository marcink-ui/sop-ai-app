'use client';

import { useState, useEffect } from 'react';
import {
    BookOpen,
    Plus,
    Search,
    MoreHorizontal,
    Trash2,
    Edit,
    Eye,
    ArrowUpDown,
    Save,
    X,
    Tag,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Ontology term type
interface OntologyTerm {
    id: string;
    term: string;
    definition: string;
    category: string;
    synonyms: string[];
    relatedTerms: string[];
    examples: string[];
    source?: string;
    createdAt: string;
    updatedAt: string;
}

const STORAGE_KEY = 'vantage-ontology';

// Default ontology terms for demo
const defaultOntology: OntologyTerm[] = [
    {
        id: 'ont-1',
        term: 'SOP',
        definition: 'Standard Operating Procedure - dokumentacja opisująca krok po kroku jak wykonać określony proces biznesowy.',
        category: 'Procesy',
        synonyms: ['Procedura', 'Instrukcja stanowiskowa'],
        relatedTerms: ['Proces', 'Workflow', 'Automatyzacja'],
        examples: ['Onboarding pracownika', 'Obsługa reklamacji', 'Zamknięcie miesiąca'],
        source: 'ISO 9001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'ont-2',
        term: 'MUDA',
        definition: 'Japońskie słowo oznaczające "marnotrawstwo". W kontekście Lean to każda czynność, która zużywa zasoby bez dodawania wartości dla klienta.',
        category: 'Lean',
        synonyms: ['Marnotrawstwo', 'Waste'],
        relatedTerms: ['Kaizen', 'Value Stream', '7 Wastes'],
        examples: ['Nadprodukcja', 'Zbędne ruchy', 'Defekty', 'Czekanie'],
        source: 'Toyota Production System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'ont-3',
        term: 'Value Chain',
        definition: 'Łańcuch wartości - sekwencja działań, które organizacja wykonuje aby dostarczyć produkt lub usługę do klienta końcowego.',
        category: 'Strategia',
        synonyms: ['Łańcuch wartości', 'Value Stream'],
        relatedTerms: ['Porter', 'Mapowanie procesów', 'BPM'],
        examples: ['Od zamówienia do dostawy', 'Od pomysłu do produktu'],
        source: 'Michael Porter',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'ont-4',
        term: 'AI Agent',
        definition: 'Autonomiczny asystent AI zaprojektowany do wykonywania określonych zadań biznesowych na podstawie zdefiniowanych instrukcji i uprawnień.',
        category: 'AI',
        synonyms: ['Bot', 'Asystent AI', 'Microagent'],
        relatedTerms: ['LLM', 'Automatyzacja', 'RPA', 'Prompt'],
        examples: ['Agent obsługi klienta', 'Agent do fakturowania', 'Agent HR'],
        source: 'VantageOS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'ont-5',
        term: 'Council',
        definition: 'Organ decyzyjny w VantageOS odpowiedzialny za zatwierdzanie zmian w procesach, nowych SOP i wdrożeń AI agentów.',
        category: 'Governance',
        synonyms: ['Rada', 'Komitet sterujący'],
        relatedTerms: ['Sponsor', 'Pilot', 'Governance'],
        examples: ['Zatwierdzenie nowego procesu', 'Akceptacja agenta AI'],
        source: 'VantageOS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

// Category options
const categories = ['Procesy', 'Lean', 'Strategia', 'AI', 'Governance', 'HR', 'Finanse', 'IT', 'Inne'];

export default function OntologyPage() {
    const [terms, setTerms] = useState<OntologyTerm[]>([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [viewTerm, setViewTerm] = useState<OntologyTerm | null>(null);
    const [editTerm, setEditTerm] = useState<OntologyTerm | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        term: '',
        definition: '',
        category: 'Procesy',
        synonyms: '',
        relatedTerms: '',
        examples: '',
        source: '',
    });

    useEffect(() => {
        // Load from localStorage or use defaults
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            setTerms(JSON.parse(stored));
        } else {
            setTerms(defaultOntology);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultOntology));
        }
    }, []);

    const saveTerms = (newTerms: OntologyTerm[]) => {
        setTerms(newTerms);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTerms));
    };

    const handleSubmit = () => {
        const newTerm: OntologyTerm = {
            id: editTerm?.id || `ont-${Date.now()}`,
            term: formData.term,
            definition: formData.definition,
            category: formData.category,
            synonyms: formData.synonyms.split(',').map(s => s.trim()).filter(Boolean),
            relatedTerms: formData.relatedTerms.split(',').map(s => s.trim()).filter(Boolean),
            examples: formData.examples.split(',').map(s => s.trim()).filter(Boolean),
            source: formData.source,
            createdAt: editTerm?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        if (editTerm) {
            saveTerms(terms.map(t => t.id === editTerm.id ? newTerm : t));
        } else {
            saveTerms([...terms, newTerm]);
        }

        resetForm();
        setIsDialogOpen(false);
        setEditTerm(null);
    };

    const handleEdit = (term: OntologyTerm) => {
        setEditTerm(term);
        setFormData({
            term: term.term,
            definition: term.definition,
            category: term.category,
            synonyms: term.synonyms.join(', '),
            relatedTerms: term.relatedTerms.join(', '),
            examples: term.examples.join(', '),
            source: term.source || '',
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Czy na pewno chcesz usunąć ten termin?')) {
            saveTerms(terms.filter(t => t.id !== id));
        }
    };

    const resetForm = () => {
        setFormData({
            term: '',
            definition: '',
            category: 'Procesy',
            synonyms: '',
            relatedTerms: '',
            examples: '',
            source: '',
        });
    };

    const filteredTerms = terms
        .filter(term => {
            const matchesSearch =
                term.term.toLowerCase().includes(search.toLowerCase()) ||
                term.definition.toLowerCase().includes(search.toLowerCase()) ||
                term.synonyms.some(s => s.toLowerCase().includes(search.toLowerCase()));
            const matchesCategory = categoryFilter === 'all' || term.category === categoryFilter;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            return sortOrder === 'asc'
                ? a.term.localeCompare(b.term, 'pl')
                : b.term.localeCompare(a.term, 'pl');
        });

    const uniqueCategories = Array.from(new Set(terms.map(t => t.category)));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-500/20 p-2">
                        <BookOpen className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Ontologia</h1>
                        <p className="text-sm text-muted-foreground">
                            {terms.length} terminów w słowniku firmowym
                        </p>
                    </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        resetForm();
                        setEditTerm(null);
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Nowy termin
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg bg-card border-border">
                        <DialogHeader>
                            <DialogTitle className="text-foreground">
                                {editTerm ? 'Edytuj termin' : 'Dodaj nowy termin'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="term">Termin *</Label>
                                <Input
                                    id="term"
                                    value={formData.term}
                                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                                    placeholder="np. SOP, MUDA, Value Chain"
                                    className="bg-card border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="definition">Definicja *</Label>
                                <Textarea
                                    id="definition"
                                    value={formData.definition}
                                    onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                                    placeholder="Szczegółowa definicja terminu..."
                                    rows={3}
                                    className="bg-card border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Kategoria</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger className="bg-card border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="synonyms">Synonimy (oddzielone przecinkami)</Label>
                                <Input
                                    id="synonyms"
                                    value={formData.synonyms}
                                    onChange={(e) => setFormData({ ...formData, synonyms: e.target.value })}
                                    placeholder="Procedura, Instrukcja"
                                    className="bg-card border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="relatedTerms">Powiązane terminy</Label>
                                <Input
                                    id="relatedTerms"
                                    value={formData.relatedTerms}
                                    onChange={(e) => setFormData({ ...formData, relatedTerms: e.target.value })}
                                    placeholder="Proces, Workflow"
                                    className="bg-card border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="examples">Przykłady</Label>
                                <Input
                                    id="examples"
                                    value={formData.examples}
                                    onChange={(e) => setFormData({ ...formData, examples: e.target.value })}
                                    placeholder="Onboarding, Reklamacje"
                                    className="bg-card border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="source">Źródło</Label>
                                <Input
                                    id="source"
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                    placeholder="ISO 9001, VantageOS"
                                    className="bg-card border-border"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsDialogOpen(false);
                                        resetForm();
                                        setEditTerm(null);
                                    }}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Anuluj
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!formData.term || !formData.definition}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {editTerm ? 'Zapisz zmiany' : 'Dodaj termin'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj terminów..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card border-border"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40 bg-card border-border">
                        <Tag className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Kategoria" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Wszystkie</SelectItem>
                        {uniqueCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="border-border"
                >
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    {sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
                </Button>
            </div>

            {/* View Term Dialog */}
            {viewTerm && (
                <Dialog open={!!viewTerm} onOpenChange={() => setViewTerm(null)}>
                    <DialogContent className="sm:max-w-lg bg-card border-border">
                        <DialogHeader>
                            <DialogTitle className="text-foreground flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-emerald-400" />
                                {viewTerm.term}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Definicja</h4>
                                <p className="text-foreground">{viewTerm.definition}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-emerald-500/20 text-emerald-400">
                                    {viewTerm.category}
                                </Badge>
                                {viewTerm.source && (
                                    <Badge variant="outline" className="border-border">
                                        {viewTerm.source}
                                    </Badge>
                                )}
                            </div>
                            {viewTerm.synonyms.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Synonimy</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {viewTerm.synonyms.map(s => (
                                            <Badge key={s} variant="secondary">{s}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {viewTerm.relatedTerms.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Powiązane terminy</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {viewTerm.relatedTerms.map(t => (
                                            <Badge key={t} variant="outline" className="border-border">{t}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {viewTerm.examples.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Przykłady</h4>
                                    <ul className="list-disc list-inside text-muted-foreground">
                                        {viewTerm.examples.map(e => (
                                            <li key={e}>{e}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Table */}
            <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-card">
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Termin
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Definicja
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Kategoria
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Synonimy
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Akcje
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTerms.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                                    <BookOpen className="mx-auto mb-3 h-12 w-12 opacity-20" />
                                    <p>Brak terminów w ontologii</p>
                                    <button
                                        onClick={() => setIsDialogOpen(true)}
                                        className="mt-2 text-emerald-400 hover:underline"
                                    >
                                        Dodaj pierwszy termin
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            filteredTerms.map((term) => (
                                <tr
                                    key={term.id}
                                    className="border-b border-border transition-colors hover:bg-muted/30 last:border-0 cursor-pointer"
                                    onClick={() => setViewTerm(term)}
                                >
                                    <td className="px-4 py-4">
                                        <span className="font-medium text-foreground">{term.term}</span>
                                    </td>
                                    <td className="px-4 py-4 text-muted-foreground max-w-md">
                                        <p className="truncate">{term.definition}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Badge className="bg-emerald-500/20 text-emerald-400">
                                            {term.category}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {term.synonyms.slice(0, 2).map(s => (
                                                <Badge key={s} variant="secondary" className="text-xs">
                                                    {s}
                                                </Badge>
                                            ))}
                                            {term.synonyms.length > 2 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    +{term.synonyms.length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-popover border-border">
                                                <DropdownMenuItem
                                                    className="text-popover-foreground"
                                                    onClick={() => setViewTerm(term)}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Zobacz
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-popover-foreground"
                                                    onClick={() => handleEdit(term)}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edytuj
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-400"
                                                    onClick={() => handleDelete(term.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Usuń
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
