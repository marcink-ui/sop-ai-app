'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, GripVertical, Edit3, Check, X } from 'lucide-react';

// ============================================================
// Types
// ============================================================
export interface SOPStep {
    nr: number;
    action: string;
    tool: string;
    time: string;
    role: string;
    kpi: string;
}

interface SOPStepsTableProps {
    steps: SOPStep[];
    onUpdate: (steps: SOPStep[]) => void;
    readOnly?: boolean;
}

// ============================================================
// Component
// ============================================================
export function SOPStepsTable({ steps, onUpdate, readOnly = false }: SOPStepsTableProps) {
    const [editingRow, setEditingRow] = useState<number | null>(null);
    const [editData, setEditData] = useState<Partial<SOPStep>>({});

    const startEdit = (nr: number) => {
        const step = steps.find(s => s.nr === nr);
        if (step) {
            setEditingRow(nr);
            setEditData({ ...step });
        }
    };

    const saveEdit = () => {
        if (editingRow === null) return;
        const updated = steps.map(s =>
            s.nr === editingRow ? { ...s, ...editData } as SOPStep : s
        );
        onUpdate(updated);
        setEditingRow(null);
        setEditData({});
    };

    const cancelEdit = () => {
        setEditingRow(null);
        setEditData({});
    };

    const addStep = () => {
        const newNr = steps.length > 0 ? Math.max(...steps.map(s => s.nr)) + 1 : 1;
        onUpdate([...steps, { nr: newNr, action: '', tool: '', time: '', role: '', kpi: '' }]);
        startEdit(newNr);
    };

    const removeStep = (nr: number) => {
        onUpdate(steps.filter(s => s.nr !== nr).map((s, i) => ({ ...s, nr: i + 1 })));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Kroki procedury</h3>
                <Badge variant="secondary" className="text-xs">
                    {steps.length} kroków
                </Badge>
            </div>

            <div className="rounded-lg border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[40px]">Nr</TableHead>
                            <TableHead>Akcja</TableHead>
                            <TableHead className="w-[120px]">Narzędzie</TableHead>
                            <TableHead className="w-[80px]">Czas</TableHead>
                            <TableHead className="w-[120px]">Rola</TableHead>
                            <TableHead className="w-[120px]">KPI</TableHead>
                            {!readOnly && <TableHead className="w-[80px]">Akcje</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {steps.map((step) => {
                            const isEditing = editingRow === step.nr;

                            return (
                                <TableRow key={step.nr} className="group">
                                    <TableCell className="font-mono text-xs">
                                        <div className="flex items-center gap-1">
                                            {!readOnly && (
                                                <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                                            )}
                                            {step.nr}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {isEditing ? (
                                            <Input
                                                value={editData.action || ''}
                                                onChange={e => setEditData({ ...editData, action: e.target.value })}
                                                className="h-7 text-xs"
                                                autoFocus
                                            />
                                        ) : (
                                            <span className="text-sm">{step.action || '—'}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {isEditing ? (
                                            <Input
                                                value={editData.tool || ''}
                                                onChange={e => setEditData({ ...editData, tool: e.target.value })}
                                                className="h-7 text-xs"
                                            />
                                        ) : (
                                            <Badge variant="outline" className="text-xs font-normal">
                                                {step.tool || '—'}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {isEditing ? (
                                            <Input
                                                value={editData.time || ''}
                                                onChange={e => setEditData({ ...editData, time: e.target.value })}
                                                className="h-7 text-xs w-[70px]"
                                            />
                                        ) : (
                                            <span className="text-xs text-muted-foreground">{step.time || '—'}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {isEditing ? (
                                            <Input
                                                value={editData.role || ''}
                                                onChange={e => setEditData({ ...editData, role: e.target.value })}
                                                className="h-7 text-xs"
                                            />
                                        ) : (
                                            <span className="text-xs">{step.role || '—'}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {isEditing ? (
                                            <Input
                                                value={editData.kpi || ''}
                                                onChange={e => setEditData({ ...editData, kpi: e.target.value })}
                                                className="h-7 text-xs"
                                            />
                                        ) : (
                                            <span className="text-xs text-muted-foreground">{step.kpi || '—'}</span>
                                        )}
                                    </TableCell>
                                    {!readOnly && (
                                        <TableCell>
                                            {isEditing ? (
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={saveEdit}>
                                                        <Check className="h-3 w-3 text-green-600" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEdit}>
                                                        <X className="h-3 w-3 text-red-600" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(step.nr)}>
                                                        <Edit3 className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeStep(step.nr)}>
                                                        <Trash2 className="h-3 w-3 text-red-500" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {!readOnly && (
                <Button variant="outline" size="sm" className="w-full" onClick={addStep}>
                    <Plus className="h-3 w-3 mr-2" />
                    Dodaj krok
                </Button>
            )}
        </div>
    );
}
