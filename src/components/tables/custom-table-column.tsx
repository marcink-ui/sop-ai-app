'use client';

import React, { useState } from 'react';
import {
    Settings,
    Trash2,
    GripVertical,
    ChevronDown,
    Sparkles,
    Calculator,
    Type,
    Hash,
    Calendar,
    CheckSquare,
    Link,
    Mail,
    DollarSign,
    List,
    ListChecks,
    Table2,
    BarChart3,
    Send,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FormulaEditor, ColumnType } from './formula-editor';

// ============================================================================
// TYPES
// ============================================================================

export type ColumnApprovalStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CustomColumnConfig {
    id: string;
    name: string;
    slug: string;
    type: ColumnType;
    entityType: string;
    width?: number;
    order: number;
    isVisible: boolean;
    isLocked: boolean;
    formula?: string;
    formulaConfig?: Record<string, any>;
    options?: { value: string; label: string; color?: string }[];
    isRequired: boolean;
    validation?: Record<string, any>;
    approvalStatus: ColumnApprovalStatus;
    approvedById?: string;
    approvedAt?: Date;
    rejectionNote?: string;
    createdById: string;
    createdAt: Date;
}

export interface CustomTableColumnProps {
    column: CustomColumnConfig;
    onChange: (column: CustomColumnConfig) => void;
    onDelete?: () => void;
    onSubmitForApproval?: () => void;
    availableColumns?: string[];
    canApprove?: boolean;
    onApprove?: () => void;
    onReject?: (note: string) => void;
    className?: string;
}

// ============================================================================
// COLUMN TYPE CONFIG
// ============================================================================

const COLUMN_TYPES: {
    type: ColumnType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    requiresFormula?: boolean;
}[] = [
        { type: 'TEXT', label: 'Tekst', icon: Type, description: 'Pole tekstowe' },
        { type: 'NUMBER', label: 'Liczba', icon: Hash, description: 'Wartość numeryczna' },
        { type: 'DATE', label: 'Data', icon: Calendar, description: 'Data i czas' },
        { type: 'CHECKBOX', label: 'Checkbox', icon: CheckSquare, description: 'Tak/Nie' },
        { type: 'SELECT', label: 'Wybór', icon: List, description: 'Pojedynczy wybór z listy' },
        { type: 'MULTISELECT', label: 'Multi-wybór', icon: ListChecks, description: 'Wiele opcji z listy' },
        { type: 'URL', label: 'Link', icon: Link, description: 'Adres URL' },
        { type: 'EMAIL', label: 'Email', icon: Mail, description: 'Adres email' },
        { type: 'CURRENCY', label: 'Waluta', icon: DollarSign, description: 'Kwota pieniężna' },
        { type: 'FORMULA', label: 'Formuła', icon: Calculator, description: 'Wyliczana wartość', requiresFormula: true },
        { type: 'AI_FORMULA', label: 'AI Formuła', icon: Sparkles, description: 'Generowana przez AI', requiresFormula: true },
        { type: 'LOOKUP', label: 'Lookup', icon: Table2, description: 'Pobiera z innej tabeli', requiresFormula: true },
        { type: 'ROLLUP', label: 'Rollup', icon: BarChart3, description: 'Agreguje powiązane dane', requiresFormula: true },
    ];

const STATUS_CONFIG = {
    DRAFT: { label: 'Szkic', color: 'bg-gray-100 text-gray-700', icon: Clock },
    PENDING: { label: 'Oczekuje', color: 'bg-yellow-100 text-yellow-700', icon: Send },
    APPROVED: { label: 'Zatwierdzona', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    REJECTED: { label: 'Odrzucona', color: 'bg-red-100 text-red-700', icon: XCircle },
};

// ============================================================================
// COMPONENT
// ============================================================================

export function CustomTableColumn({
    column,
    onChange,
    onDelete,
    onSubmitForApproval,
    availableColumns = [],
    canApprove = false,
    onApprove,
    onReject,
    className,
}: CustomTableColumnProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [rejectionNote, setRejectionNote] = useState('');

    const typeConfig = COLUMN_TYPES.find(t => t.type === column.type);
    const statusConfig = STATUS_CONFIG[column.approvalStatus];
    const StatusIcon = statusConfig.icon;
    const TypeIcon = typeConfig?.icon || Type;

    const handleTypeChange = (newType: ColumnType) => {
        onChange({
            ...column,
            type: newType,
            formula: COLUMN_TYPES.find(t => t.type === newType)?.requiresFormula ? column.formula : undefined,
        });
    };

    const handleFormulaChange = (formula: string) => {
        onChange({ ...column, formula });
    };

    const showFormulaEditor = typeConfig?.requiresFormula;

    return (
        <div
            className={cn(
                "border rounded-lg p-3 bg-card",
                column.approvalStatus === 'REJECTED' && "border-destructive/50 bg-destructive/5",
                column.approvalStatus === 'APPROVED' && "border-green-500/50 bg-green-50/50 dark:bg-green-950/20",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />

                <TypeIcon className="h-4 w-4 text-muted-foreground" />

                <Input
                    value={column.name}
                    onChange={(e) => onChange({ ...column, name: e.target.value })}
                    className="h-8 flex-1 font-medium"
                    placeholder="Nazwa kolumny"
                    disabled={column.isLocked}
                />

                {/* Status Badge */}
                <Badge className={cn("text-xs", statusConfig.color)}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                </Badge>

                {/* Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
                            {isEditing ? 'Zamknij edycję' : 'Edytuj kolumnę'}
                        </DropdownMenuItem>
                        {column.approvalStatus === 'DRAFT' && onSubmitForApproval && (
                            <DropdownMenuItem onClick={onSubmitForApproval}>
                                <Send className="h-4 w-4 mr-2" />
                                Wyślij do zatwierdzenia
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {onDelete && (
                            <DropdownMenuItem
                                onClick={onDelete}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Usuń kolumnę
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Expanded Editor */}
            {isEditing && (
                <div className="space-y-4 pt-3 border-t">
                    {/* Column Type Selector */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Typ kolumny</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between" disabled={column.isLocked}>
                                    <span className="flex items-center gap-2">
                                        <TypeIcon className="h-4 w-4" />
                                        {typeConfig?.label || column.type}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                {COLUMN_TYPES.map((type) => (
                                    <DropdownMenuItem
                                        key={type.type}
                                        onClick={() => handleTypeChange(type.type)}
                                    >
                                        <type.icon className="h-4 w-4 mr-2" />
                                        <div className="flex-1">
                                            <div className="font-medium">{type.label}</div>
                                            <div className="text-xs text-muted-foreground">{type.description}</div>
                                        </div>
                                        {type.requiresFormula && (
                                            <Calculator className="h-3 w-3 text-muted-foreground" />
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Formula Editor (for formula types) */}
                    {showFormulaEditor && (
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Formuła</Label>
                            <FormulaEditor
                                value={column.formula || ''}
                                onChange={handleFormulaChange}
                                columnType={column.type}
                                availableColumns={availableColumns}
                                disabled={column.isLocked}
                            />
                        </div>
                    )}

                    {/* Options */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Switch
                                id={`required-${column.id}`}
                                checked={column.isRequired}
                                onCheckedChange={(checked) => onChange({ ...column, isRequired: checked })}
                                disabled={column.isLocked}
                            />
                            <Label htmlFor={`required-${column.id}`} className="text-sm">
                                Wymagane
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id={`visible-${column.id}`}
                                checked={column.isVisible}
                                onCheckedChange={(checked) => onChange({ ...column, isVisible: checked })}
                                disabled={column.isLocked}
                            />
                            <Label htmlFor={`visible-${column.id}`} className="text-sm">
                                Widoczna
                            </Label>
                        </div>
                    </div>

                    {/* Rejection Note */}
                    {column.approvalStatus === 'REJECTED' && column.rejectionNote && (
                        <div className="p-2 rounded bg-destructive/10 text-destructive text-sm">
                            <strong>Powód odrzucenia:</strong> {column.rejectionNote}
                        </div>
                    )}

                    {/* Approval Actions (for reviewers) */}
                    {canApprove && column.approvalStatus === 'PENDING' && (
                        <div className="flex gap-2 pt-2 border-t">
                            <Button
                                variant="default"
                                size="sm"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={onApprove}
                            >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Zatwierdź
                            </Button>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="destructive" size="sm" className="flex-1">
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Odrzuć
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64" align="end">
                                    <div className="space-y-2">
                                        <Label className="text-sm">Powód odrzucenia</Label>
                                        <Input
                                            value={rejectionNote}
                                            onChange={(e) => setRejectionNote(e.target.value)}
                                            placeholder="Opisz powód..."
                                        />
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="w-full"
                                            onClick={() => {
                                                onReject?.(rejectionNote);
                                                setRejectionNote('');
                                            }}
                                            disabled={!rejectionNote}
                                        >
                                            Potwierdź odrzucenie
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CustomTableColumn;
