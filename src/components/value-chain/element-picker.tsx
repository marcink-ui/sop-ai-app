'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    FileText,
    Bot,
    Users,
    AlertTriangle,
    Settings2,
    GitBranch,
    ArrowRightLeft,
    Plus,
    Loader2,
} from 'lucide-react';

interface DatabaseElement {
    id: string;
    type: 'sop' | 'agent' | 'role' | 'muda';
    name: string;
    description?: string;
    status?: string;
}

interface ElementPickerProps {
    onAddNewNode: (type: string) => void;
    onAddFromDatabase: (element: DatabaseElement) => void;
}

const nodeTypeConfig = [
    { type: 'process', label: 'Proces', Icon: Settings2, color: 'text-blue-500' },
    { type: 'sop', label: 'SOP', Icon: FileText, color: 'text-emerald-500' },
    { type: 'agent', label: 'Agent AI', Icon: Bot, color: 'text-purple-500' },
    { type: 'decision', label: 'Decyzja', Icon: GitBranch, color: 'text-amber-500' },
    { type: 'handoff', label: 'Delegacja', Icon: ArrowRightLeft, color: 'text-rose-500' },
];

const elementTypeConfig: Record<string, { Icon: typeof FileText; color: string; label: string }> = {
    sop: { Icon: FileText, color: 'text-emerald-500', label: 'SOP' },
    agent: { Icon: Bot, color: 'text-purple-500', label: 'Agent AI' },
    role: { Icon: Users, color: 'text-blue-500', label: 'Rola' },
    muda: { Icon: AlertTriangle, color: 'text-amber-500', label: 'MUDA' },
};

export function ElementPicker({ onAddNewNode, onAddFromDatabase }: ElementPickerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [elements, setElements] = useState<DatabaseElement[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);

    // Fetch elements from database
    useEffect(() => {
        const fetchElements = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (searchQuery) params.set('search', searchQuery);
                if (selectedType) params.set('type', selectedType);

                const response = await fetch(`/api/value-chain/elements?${params}`);
                if (response.ok) {
                    const data = await response.json();
                    setElements(data.elements || []);
                }
            } catch (error) {
                console.error('Failed to fetch elements:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchElements, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery, selectedType]);

    const filteredElements = elements.filter((el) =>
        el.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedElements = filteredElements.reduce((acc, el) => {
        if (!acc[el.type]) acc[el.type] = [];
        acc[el.type].push(el);
        return acc;
    }, {} as Record<string, DatabaseElement[]>);

    return (
        <div className="absolute top-4 left-4 z-10 w-72 bg-white dark:bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/30">
                <h3 className="font-semibold text-sm text-foreground">Dodaj element</h3>
            </div>

            <Tabs defaultValue="new" className="w-full">
                <TabsList className="w-full rounded-none border-b bg-transparent h-auto p-0">
                    <TabsTrigger
                        value="new"
                        className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Nowy
                    </TabsTrigger>
                    <TabsTrigger
                        value="database"
                        className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2"
                    >
                        <Search className="h-4 w-4 mr-1" />
                        Z bazy
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="new" className="p-3 m-0">
                    <p className="text-xs text-muted-foreground mb-3">
                        Kliknij, aby dodać pusty element na mapę
                    </p>
                    <div className="space-y-1">
                        {nodeTypeConfig.map(({ type, label, Icon, color }) => (
                            <Button
                                key={type}
                                variant="ghost"
                                className="w-full justify-start h-10 px-3"
                                onClick={() => onAddNewNode(type)}
                            >
                                <Icon className={`h-4 w-4 mr-2 ${color}`} />
                                <span>{label}</span>
                            </Button>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="database" className="p-3 m-0 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Szukaj w bazie..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>

                    <div className="flex gap-1 flex-wrap">
                        {Object.entries(elementTypeConfig).map(([type, config]) => (
                            <Badge
                                key={type}
                                variant={selectedType === type ? 'default' : 'outline'}
                                className="cursor-pointer transition-colors"
                                onClick={() => setSelectedType(selectedType === type ? null : type)}
                            >
                                <config.Icon className="h-3 w-3 mr-1" />
                                {config.label}
                            </Badge>
                        ))}
                    </div>

                    <ScrollArea className="h-[200px]">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : Object.keys(groupedElements).length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                {searchQuery ? 'Brak wyników' : 'Wprowadź frazę lub wybierz typ'}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(groupedElements).map(([type, items]) => {
                                    const config = elementTypeConfig[type];
                                    return (
                                        <div key={type}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <config.Icon className={`h-4 w-4 ${config.color}`} />
                                                <span className="text-xs font-medium text-muted-foreground uppercase">
                                                    {config.label}
                                                </span>
                                            </div>
                                            <div className="space-y-1 pl-6">
                                                {items.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        className="w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors"
                                                        onClick={() => onAddFromDatabase(item)}
                                                    >
                                                        <div className="font-medium truncate">{item.name}</div>
                                                        {item.description && (
                                                            <div className="text-xs text-muted-foreground truncate">
                                                                {item.description}
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
}
