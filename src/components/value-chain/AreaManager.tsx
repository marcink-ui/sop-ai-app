'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    Plus,
    Palette,
    Trash2,
    GripVertical,
    ChevronDown,
    ChevronRight,
    Edit2,
    Check,
    X,
    Layers,
    Users,
    Factory,
    ShieldCheck,
    Truck,
    HeadphonesIcon,
    Banknote,
    Code2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface Area {
    id: string;
    name: string;
    description?: string;
    color: string;
    icon: string;
    order: number;
    nodeCount: number;
}

interface AreaManagerProps {
    areas: Area[];
    selectedAreaId: string | null;
    onSelectArea: (id: string | null) => void;
    onCreateArea: (area: Omit<Area, 'id' | 'order' | 'nodeCount'>) => void;
    onUpdateArea: (id: string, updates: Partial<Area>) => void;
    onDeleteArea: (id: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const AREA_COLORS = [
    '#3B82F6', // Blue
    '#22C55E', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#A855F7', // Purple
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#F97316', // Orange
    '#8B5CF6', // Violet
    '#14B8A6', // Teal
];

const AREA_ICONS: { name: string; icon: typeof Building2 }[] = [
    { name: 'Building2', icon: Building2 },
    { name: 'Users', icon: Users },
    { name: 'Factory', icon: Factory },
    { name: 'ShieldCheck', icon: ShieldCheck },
    { name: 'Truck', icon: Truck },
    { name: 'Headphones', icon: HeadphonesIcon },
    { name: 'Banknote', icon: Banknote },
    { name: 'Code2', icon: Code2 },
    { name: 'Layers', icon: Layers },
];

const ICON_MAP: Record<string, typeof Building2> = Object.fromEntries(
    AREA_ICONS.map(i => [i.name, i.icon])
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AreaManager({
    areas,
    selectedAreaId,
    onSelectArea,
    onCreateArea,
    onUpdateArea,
    onDeleteArea,
    isOpen,
    onToggle,
}: AreaManagerProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState(AREA_COLORS[0]);
    const [newIcon, setNewIcon] = useState('Building2');
    const [editName, setEditName] = useState('');

    const handleCreate = useCallback(() => {
        if (!newName.trim()) return;
        onCreateArea({
            name: newName.trim(),
            color: newColor,
            icon: newIcon,
        });
        setNewName('');
        setNewColor(AREA_COLORS[Math.floor(Math.random() * AREA_COLORS.length)]);
        setNewIcon('Building2');
        setIsCreating(false);
    }, [newName, newColor, newIcon, onCreateArea]);

    const startEditing = (area: Area) => {
        setEditingId(area.id);
        setEditName(area.name);
    };

    const saveEdit = (id: string) => {
        if (editName.trim()) {
            onUpdateArea(id, { name: editName.trim() });
        }
        setEditingId(null);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <button
                onClick={onToggle}
                className="flex items-center justify-between px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-cyan-500" />
                    <span className="text-sm font-semibold">Obszary</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {areas.length}
                    </Badge>
                </div>
                {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
            </button>

            {/* Content */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 space-y-2">
                            {/* "All" filter */}
                            <button
                                onClick={() => onSelectArea(null)}
                                className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                                    selectedAreaId === null
                                        ? "bg-muted text-foreground font-medium"
                                        : "text-muted-foreground hover:bg-muted/50"
                                )}
                            >
                                <Layers className="h-3.5 w-3.5" />
                                <span>Wszystkie obszary</span>
                            </button>

                            {/* Area List */}
                            {areas.map((area) => {
                                const IconComp = ICON_MAP[area.icon] || Building2;
                                return (
                                    <div
                                        key={area.id}
                                        className={cn(
                                            "group flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer",
                                            selectedAreaId === area.id
                                                ? "bg-muted text-foreground font-medium"
                                                : "text-muted-foreground hover:bg-muted/50"
                                        )}
                                    >
                                        <GripVertical className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                                        <div
                                            className="h-3 w-3 rounded-sm flex-shrink-0"
                                            style={{ backgroundColor: area.color }}
                                        />
                                        <IconComp className="h-3.5 w-3.5 flex-shrink-0" style={{ color: area.color }} />

                                        {editingId === area.id ? (
                                            <div className="flex items-center gap-1 flex-1">
                                                <Input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="h-6 text-xs px-1"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveEdit(area.id);
                                                        if (e.key === 'Escape') setEditingId(null);
                                                    }}
                                                />
                                                <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => saveEdit(area.id)}>
                                                    <Check className="h-3 w-3 text-green-500" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => setEditingId(null)}>
                                                    <X className="h-3 w-3 text-red-500" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => onSelectArea(area.id)}
                                                    className="flex-1 text-left truncate"
                                                >
                                                    {area.name}
                                                </button>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {area.nodeCount}
                                                </span>
                                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                                                                <Palette className="h-3 w-3" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-2" side="right">
                                                            <div className="grid grid-cols-5 gap-1.5">
                                                                {AREA_COLORS.map((c) => (
                                                                    <button
                                                                        key={c}
                                                                        onClick={() => onUpdateArea(area.id, { color: c })}
                                                                        className={cn(
                                                                            "h-6 w-6 rounded-md border-2 transition-transform hover:scale-110",
                                                                            area.color === c ? "border-foreground scale-110" : "border-transparent"
                                                                        )}
                                                                        style={{ backgroundColor: c }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => startEditing(area)}>
                                                        <Edit2 className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-5 w-5 p-0 text-red-500 hover:text-red-600"
                                                        onClick={() => onDeleteArea(area.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Create New Area */}
                            {isCreating ? (
                                <Card className="border-dashed">
                                    <CardContent className="p-3 space-y-3">
                                        <Input
                                            placeholder="Nazwa obszaru..."
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="h-8 text-sm"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleCreate();
                                                if (e.key === 'Escape') setIsCreating(false);
                                            }}
                                        />
                                        {/* Color picker */}
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-muted-foreground mr-1">Kolor:</span>
                                            {AREA_COLORS.slice(0, 6).map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => setNewColor(c)}
                                                    className={cn(
                                                        "h-5 w-5 rounded-md border-2 transition-transform hover:scale-110",
                                                        newColor === c ? "border-foreground scale-110" : "border-transparent"
                                                    )}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                        {/* Icon picker */}
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-muted-foreground mr-1">Ikona:</span>
                                            {AREA_ICONS.slice(0, 6).map((i) => {
                                                const Ic = i.icon;
                                                return (
                                                    <button
                                                        key={i.name}
                                                        onClick={() => setNewIcon(i.name)}
                                                        className={cn(
                                                            "h-6 w-6 rounded-md border flex items-center justify-center transition-all hover:scale-110",
                                                            newIcon === i.name
                                                                ? "border-foreground bg-muted"
                                                                : "border-transparent"
                                                        )}
                                                    >
                                                        <Ic className="h-3.5 w-3.5" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>
                                                Anuluj
                                            </Button>
                                            <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
                                                Dodaj
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted/50 transition-colors border border-dashed border-border"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Nowy obszar
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
