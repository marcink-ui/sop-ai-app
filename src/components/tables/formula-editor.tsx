'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
    Sparkles,
    Calculator,
    Table2,
    BarChart3,
    Hash,
    Type,
    Calendar,
    CheckSquare,
    Link,
    DollarSign,
    HelpCircle,
    X,
    Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

// ============================================================================
// TYPES
// ============================================================================

export type ColumnType =
    | 'TEXT'
    | 'NUMBER'
    | 'DATE'
    | 'SELECT'
    | 'MULTISELECT'
    | 'FORMULA'
    | 'AI_FORMULA'
    | 'LOOKUP'
    | 'ROLLUP'
    | 'CHECKBOX'
    | 'URL'
    | 'EMAIL'
    | 'CURRENCY';

export interface FormulaFunction {
    name: string;
    description: string;
    syntax: string;
    category: 'math' | 'text' | 'date' | 'lookup' | 'ai';
}

export interface FormulaEditorProps {
    value: string;
    onChange: (value: string) => void;
    columnType: ColumnType;
    availableColumns?: string[];
    onTest?: () => Promise<{ result: any; error?: string }>;
    disabled?: boolean;
    className?: string;
}

// ============================================================================
// FORMULA FUNCTIONS CATALOG
// ============================================================================

const FORMULA_FUNCTIONS: FormulaFunction[] = [
    // Math
    { name: 'SUM', description: 'Sumuje wartości', syntax: 'SUM(kolumna)', category: 'math' },
    { name: 'AVG', description: 'Średnia wartość', syntax: 'AVG(kolumna)', category: 'math' },
    { name: 'MIN', description: 'Minimalna wartość', syntax: 'MIN(kolumna)', category: 'math' },
    { name: 'MAX', description: 'Maksymalna wartość', syntax: 'MAX(kolumna)', category: 'math' },
    { name: 'COUNT', description: 'Zlicza rekordy', syntax: 'COUNT(warunek)', category: 'math' },
    { name: 'ROUND', description: 'Zaokrągla liczbę', syntax: 'ROUND(liczba, miejsca)', category: 'math' },

    // Text
    { name: 'CONCAT', description: 'Łączy teksty', syntax: 'CONCAT(tekst1, tekst2)', category: 'text' },
    { name: 'UPPER', description: 'Wielkie litery', syntax: 'UPPER(tekst)', category: 'text' },
    { name: 'LOWER', description: 'Małe litery', syntax: 'LOWER(tekst)', category: 'text' },
    { name: 'IF', description: 'Warunek logiczny', syntax: 'IF(warunek, tak, nie)', category: 'text' },

    // Date
    { name: 'NOW', description: 'Aktualna data', syntax: 'NOW()', category: 'date' },
    { name: 'TODAY', description: 'Dzisiejsza data', syntax: 'TODAY()', category: 'date' },
    { name: 'DATEDIFF', description: 'Różnica dat', syntax: 'DATEDIFF(data1, data2, jednostka)', category: 'date' },

    // Lookup
    { name: 'LOOKUP', description: 'Szuka w tabeli', syntax: 'LOOKUP(tabela, pole)', category: 'lookup' },
    { name: 'FILTER', description: 'Filtruje dane', syntax: 'FILTER(tabela, warunek)', category: 'lookup' },

    // AI
    { name: '@AI', description: 'AI przetwarza zapytanie', syntax: '@AI("opisz w języku naturalnym")', category: 'ai' },
];

const CATEGORY_ICONS = {
    math: Calculator,
    text: Type,
    date: Calendar,
    lookup: Table2,
    ai: Sparkles,
};

const CATEGORY_LABELS = {
    math: 'Matematyczne',
    text: 'Tekstowe',
    date: 'Daty',
    lookup: 'Lookup',
    ai: 'AI',
};

// ============================================================================
// COMPONENT
// ============================================================================

export function FormulaEditor({
    value,
    onChange,
    columnType,
    availableColumns = [],
    onTest,
    disabled = false,
    className,
}: FormulaEditorProps) {
    const [showFunctions, setShowFunctions] = useState(false);
    const [testResult, setTestResult] = useState<{ result: any; error?: string } | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const insertFunction = useCallback((func: FormulaFunction) => {
        const cursorPos = inputRef.current?.selectionStart || value.length;
        const newValue = value.slice(0, cursorPos) + func.syntax + value.slice(cursorPos);
        onChange(newValue);
        setShowFunctions(false);

        // Focus and position cursor inside parentheses
        setTimeout(() => {
            inputRef.current?.focus();
            const newCursorPos = cursorPos + func.name.length + 1;
            inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    }, [value, onChange]);

    const insertColumn = useCallback((column: string) => {
        const cursorPos = inputRef.current?.selectionStart || value.length;
        const insertText = `[${column}]`;
        const newValue = value.slice(0, cursorPos) + insertText + value.slice(cursorPos);
        onChange(newValue);

        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    }, [value, onChange]);

    const handleTest = async () => {
        if (!onTest) return;
        setIsTesting(true);
        try {
            const result = await onTest();
            setTestResult(result);
        } catch (error) {
            setTestResult({ result: null, error: String(error) });
        } finally {
            setIsTesting(false);
        }
    };

    const isAIFormula = value.includes('@AI');

    return (
        <div className={cn("space-y-2", className)}>
            {/* Formula Input */}
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {isAIFormula ? (
                        <Sparkles className="h-4 w-4 text-purple-500" />
                    ) : (
                        <Calculator className="h-4 w-4" />
                    )}
                </div>
                <Input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="= SUM(kolumna) lub @AI('oblicz...')"
                    className={cn(
                        "pl-9 pr-20 font-mono text-sm",
                        isAIFormula && "border-purple-300 bg-purple-50/50 dark:bg-purple-950/20"
                    )}
                    disabled={disabled}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {/* Functions Help */}
                    <Popover open={showFunctions} onOpenChange={setShowFunctions}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                disabled={disabled}
                            >
                                <HelpCircle className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="end">
                            <div className="p-3 border-b">
                                <h4 className="font-medium">Dostępne funkcje</h4>
                                <p className="text-xs text-muted-foreground">
                                    Kliknij, aby wstawić do formuły
                                </p>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
                                    const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
                                    const funcs = FORMULA_FUNCTIONS.filter(f => f.category === category);

                                    return (
                                        <div key={category} className="p-2 border-b last:border-0">
                                            <div className="flex items-center gap-2 mb-2 px-1">
                                                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-xs font-medium text-muted-foreground uppercase">
                                                    {label}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {funcs.map((func) => (
                                                    <button
                                                        key={func.name}
                                                        onClick={() => insertFunction(func)}
                                                        className="w-full text-left px-2 py-1.5 rounded hover:bg-muted transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <code className="text-sm font-semibold text-primary">
                                                                {func.name}
                                                            </code>
                                                            {func.category === 'ai' && (
                                                                <Sparkles className="h-3 w-3 text-purple-500" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {func.description}
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Test Button */}
                    {onTest && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={handleTest}
                            disabled={disabled || isTesting || !value}
                        >
                            <Play className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Available Columns */}
            {availableColumns.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-muted-foreground mr-1">Kolumny:</span>
                    {availableColumns.map((col) => (
                        <Badge
                            key={col}
                            variant="outline"
                            className="cursor-pointer hover:bg-muted text-xs"
                            onClick={() => insertColumn(col)}
                        >
                            {col}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Test Result */}
            {testResult && (
                <div
                    className={cn(
                        "p-2 rounded text-sm",
                        testResult.error
                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                            : "bg-green-50 text-green-800 border border-green-200 dark:bg-green-950/20 dark:text-green-200"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <span className="font-medium">
                            {testResult.error ? 'Błąd:' : 'Wynik:'}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => setTestResult(null)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                    <code className="text-xs block mt-1">
                        {testResult.error || JSON.stringify(testResult.result)}
                    </code>
                </div>
            )}

            {/* AI Formula Hint */}
            {isAIFormula && (
                <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                    <Sparkles className="h-3 w-3" />
                    <span>
                        Formuła AI - wynik będzie wygenerowany przez asystenta
                    </span>
                </div>
            )}
        </div>
    );
}

export default FormulaEditor;
