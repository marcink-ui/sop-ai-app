'use client';

import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Filter,
    X,
    MoreHorizontal,
    Columns,
    Download,
    Check,
    Loader2,
    Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export type SortDirection = 'asc' | 'desc' | null;

export type ColumnType = 'text' | 'number' | 'select' | 'date' | 'badge' | 'progress' | 'custom';

export interface ColumnDef<T> {
    id: string;
    header: string;
    accessorKey: keyof T | ((row: T) => any);
    type?: ColumnType;
    sortable?: boolean;
    filterable?: boolean;
    editable?: boolean;
    width?: string;
    options?: { value: string; label: string }[]; // For select type
    cell?: (value: any, row: T) => React.ReactNode; // Custom cell renderer
    editCell?: (value: any, onChange: (value: any) => void, row: T) => React.ReactNode;
}

export interface DataTableProps<T extends { id: string }> {
    data: T[];
    columns: ColumnDef<T>[];
    isLoading?: boolean;
    onRowEdit?: (id: string, field: string, value: any) => Promise<void> | void;
    onRowDelete?: (id: string) => Promise<void> | void;
    onRowClick?: (row: T) => void;
    sortable?: boolean;
    filterable?: boolean;
    editable?: boolean;
    showColumnToggle?: boolean;
    showExport?: boolean;
    emptyMessage?: string;
    className?: string;
}

interface SortState {
    column: string | null;
    direction: SortDirection;
}

interface FilterState {
    [key: string]: string;
}

// =====================================================
// EDITABLE CELL COMPONENT
// =====================================================

interface EditableCellProps {
    value: any;
    type: ColumnType;
    options?: { value: string; label: string }[];
    onSave: (value: any) => Promise<void> | void;
    editable?: boolean;
    customEditor?: (value: any, onChange: (value: any) => void) => React.ReactNode;
}

function EditableCell({
    value,
    type,
    options,
    onSave,
    editable = true,
    customEditor,
}: EditableCellProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState(value);
    const [isSaving, setIsSaving] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    React.useEffect(() => {
        setEditValue(value);
    }, [value]);

    const handleSave = async () => {
        if (editValue === value) {
            setIsEditing(false);
            return;
        }
        setIsSaving(true);
        try {
            await onSave(editValue);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save:', error);
            setEditValue(value);
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setEditValue(value);
            setIsEditing(false);
        }
    };

    if (!editable) {
        return <span>{value}</span>;
    }

    if (isEditing) {
        if (customEditor) {
            return (
                <div className="flex items-center gap-1">
                    {customEditor(editValue, setEditValue)}
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <Check className="h-3 w-3" />
                        )}
                    </Button>
                </div>
            );
        }

        if (type === 'select' && options) {
            return (
                <select
                    value={editValue}
                    onChange={(e) => {
                        setEditValue(e.target.value);
                        onSave(e.target.value);
                        setIsEditing(false);
                    }}
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                    autoFocus
                    onBlur={() => setIsEditing(false)}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            );
        }

        return (
            <div className="flex items-center gap-1">
                <Input
                    ref={inputRef}
                    type={type === 'number' ? 'number' : 'text'}
                    value={editValue ?? ''}
                    onChange={(e) =>
                        setEditValue(
                            type === 'number'
                                ? parseFloat(e.target.value) || 0
                                : e.target.value
                        )
                    }
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    className="h-8 text-sm"
                    disabled={isSaving}
                />
            </div>
        );
    }

    return (
        <span
            onDoubleClick={() => setIsEditing(true)}
            className="cursor-pointer hover:bg-muted/50 px-1 py-0.5 rounded transition-colors"
            title="Kliknij dwukrotnie aby edytować"
        >
            {value ?? '—'}
        </span>
    );
}

// =====================================================
// COLUMN HEADER COMPONENT
// =====================================================

interface ColumnHeaderProps {
    column: ColumnDef<any>;
    sortState: SortState;
    onSort: (columnId: string) => void;
    filterValue: string;
    onFilter: (value: string) => void;
    sortable?: boolean;
    filterable?: boolean;
}

function ColumnHeader({
    column,
    sortState,
    onSort,
    filterValue,
    onFilter,
    sortable = true,
    filterable = true,
}: ColumnHeaderProps) {
    const isSorted = sortState.column === column.id;
    const canSort = sortable && column.sortable !== false;
    const canFilter = filterable && column.filterable !== false;

    return (
        <div className="flex items-center gap-1">
            {canSort ? (
                <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                    onClick={() => onSort(column.id)}
                >
                    <span>{column.header}</span>
                    {isSorted ? (
                        sortState.direction === 'asc' ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                        )
                    ) : (
                        <ChevronsUpDown className="ml-1 h-4 w-4 opacity-50" />
                    )}
                </Button>
            ) : (
                <span className="font-medium">{column.header}</span>
            )}

            {canFilter && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                'h-6 w-6',
                                filterValue && 'text-primary'
                            )}
                        >
                            <Filter className="h-3 w-3" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60 p-2" align="start">
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder={`Filtruj ${column.header.toLowerCase()}...`}
                                value={filterValue}
                                onChange={(e) => onFilter(e.target.value)}
                                className="h-8"
                            />
                            {filterValue && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    onClick={() => onFilter('')}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}

// =====================================================
// MAIN DATATABLE COMPONENT
// =====================================================

export function DataTable<T extends { id: string }>({
    data,
    columns,
    isLoading = false,
    onRowEdit,
    onRowDelete,
    onRowClick,
    sortable = true,
    filterable = true,
    editable = false,
    showColumnToggle = true,
    showExport = true,
    emptyMessage = 'Brak danych',
    className,
}: DataTableProps<T>) {
    const [sortState, setSortState] = React.useState<SortState>({
        column: null,
        direction: null,
    });
    const [filters, setFilters] = React.useState<FilterState>({});
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(
        new Set(columns.map((c) => c.id))
    );

    // Get value from row using accessor
    const getValue = React.useCallback(
        (row: T, column: ColumnDef<T>): any => {
            if (typeof column.accessorKey === 'function') {
                return column.accessorKey(row);
            }
            return row[column.accessorKey as keyof T];
        },
        []
    );

    // Sort handler
    const handleSort = React.useCallback((columnId: string) => {
        setSortState((prev) => {
            if (prev.column !== columnId) {
                return { column: columnId, direction: 'asc' };
            }
            if (prev.direction === 'asc') {
                return { column: columnId, direction: 'desc' };
            }
            return { column: null, direction: null };
        });
    }, []);

    // Filter handler
    const handleFilter = React.useCallback(
        (columnId: string, value: string) => {
            setFilters((prev) => ({
                ...prev,
                [columnId]: value,
            }));
        },
        []
    );

    // Toggle column visibility
    const toggleColumn = React.useCallback((columnId: string) => {
        setVisibleColumns((prev) => {
            const next = new Set(prev);
            if (next.has(columnId)) {
                next.delete(columnId);
            } else {
                next.add(columnId);
            }
            return next;
        });
    }, []);

    // Process data: global filter + column filters + sort
    const processedData = React.useMemo(() => {
        let result = [...data];

        // Apply global filter (search across all columns)
        if (globalFilter.trim()) {
            const searchTerm = globalFilter.toLowerCase().trim();
            result = result.filter((row) => {
                return columns.some((column) => {
                    const value = getValue(row, column);
                    if (value == null) return false;
                    return String(value).toLowerCase().includes(searchTerm);
                });
            });
        }

        // Apply column-specific filters
        Object.entries(filters).forEach(([columnId, filterValue]) => {
            if (!filterValue) return;
            const column = columns.find((c) => c.id === columnId);
            if (!column) return;

            result = result.filter((row) => {
                const value = getValue(row, column);
                if (value == null) return false;
                return String(value)
                    .toLowerCase()
                    .includes(filterValue.toLowerCase());
            });
        });

        // Apply sort
        if (sortState.column && sortState.direction) {
            const column = columns.find((c) => c.id === sortState.column);
            if (column) {
                result.sort((a, b) => {
                    const aValue = getValue(a, column);
                    const bValue = getValue(b, column);

                    if (aValue == null && bValue == null) return 0;
                    if (aValue == null) return 1;
                    if (bValue == null) return -1;

                    let comparison = 0;
                    if (typeof aValue === 'number' && typeof bValue === 'number') {
                        comparison = aValue - bValue;
                    } else {
                        comparison = String(aValue).localeCompare(String(bValue));
                    }

                    return sortState.direction === 'asc' ? comparison : -comparison;
                });
            }
        }

        return result;
    }, [data, globalFilter, filters, sortState, columns, getValue]);

    // Export to CSV
    const exportToCSV = React.useCallback(() => {
        const visibleCols = columns.filter((c) => visibleColumns.has(c.id));
        const headers = visibleCols.map((c) => c.header).join(',');
        const rows = processedData.map((row) =>
            visibleCols
                .map((col) => {
                    const value = getValue(row, col);
                    if (value == null) return '';
                    const stringValue = String(value);
                    // Escape quotes and wrap in quotes if contains comma
                    if (stringValue.includes(',') || stringValue.includes('"')) {
                        return `"${stringValue.replace(/"/g, '""')}"`;
                    }
                    return stringValue;
                })
                .join(',')
        );
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }, [columns, processedData, visibleColumns, getValue]);

    // Visible columns
    const visibleColumnsList = columns.filter((c) => visibleColumns.has(c.id));

    // Active filters count
    const activeFiltersCount = Object.values(filters).filter(Boolean).length;

    return (
        <div className={cn('space-y-4', className)}>
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                    {/* Global Search */}
                    {filterable && (
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Szukaj we wszystkich kolumnach..."
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="pl-8 h-9"
                            />
                            {globalFilter && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                                    onClick={() => setGlobalFilter('')}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                    )}
                    {activeFiltersCount > 0 && (
                        <Badge variant="secondary">
                            {activeFiltersCount} filtr
                            {activeFiltersCount > 1 ? 'ów' : ''}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {showColumnToggle && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Columns className="mr-2 h-4 w-4" />
                                    Kolumny
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                {columns.map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        checked={visibleColumns.has(column.id)}
                                        onCheckedChange={() => toggleColumn(column.id)}
                                    >
                                        {column.header}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    {showExport && (
                        <Button variant="outline" size="sm" onClick={exportToCSV}>
                            <Download className="mr-2 h-4 w-4" />
                            Eksport CSV
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {visibleColumnsList.map((column) => (
                                <TableHead
                                    key={column.id}
                                    style={{ width: column.width }}
                                >
                                    <ColumnHeader
                                        column={column}
                                        sortState={sortState}
                                        onSort={handleSort}
                                        filterValue={filters[column.id] || ''}
                                        onFilter={(value) =>
                                            handleFilter(column.id, value)
                                        }
                                        sortable={sortable}
                                        filterable={filterable}
                                    />
                                </TableHead>
                            ))}
                            {(onRowDelete || onRowClick) && (
                                <TableHead className="w-[50px]" />
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={visibleColumnsList.length + 1}
                                    className="h-24 text-center"
                                >
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : processedData.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={visibleColumnsList.length + 1}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            processedData.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className={cn(
                                        onRowClick && 'cursor-pointer hover:bg-muted/50'
                                    )}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {visibleColumnsList.map((column) => {
                                        const value = getValue(row, column);
                                        const isEditable =
                                            editable && column.editable !== false;

                                        return (
                                            <TableCell
                                                key={column.id}
                                                onClick={(e) => {
                                                    if (isEditable) {
                                                        e.stopPropagation();
                                                    }
                                                }}
                                            >
                                                {column.cell ? (
                                                    column.cell(value, row)
                                                ) : isEditable && onRowEdit ? (
                                                    <EditableCell
                                                        value={value}
                                                        type={column.type || 'text'}
                                                        options={column.options}
                                                        onSave={(newValue) =>
                                                            onRowEdit(
                                                                row.id,
                                                                String(column.accessorKey),
                                                                newValue
                                                            )
                                                        }
                                                        customEditor={
                                                            column.editCell
                                                                ? (v, onChange) =>
                                                                    column.editCell!(
                                                                        v,
                                                                        onChange,
                                                                        row
                                                                    )
                                                                : undefined
                                                        }
                                                    />
                                                ) : (
                                                    <span>{value ?? '—'}</span>
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                    {(onRowDelete || onRowClick) && (
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {onRowClick && (
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onRowClick(row);
                                                            }}
                                                        >
                                                            Szczegóły
                                                        </DropdownMenuItem>
                                                    )}
                                                    {onRowDelete && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onRowDelete(row.id);
                                                                }}
                                                                className="text-destructive"
                                                            >
                                                                Usuń
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer with count */}
            <div className="text-sm text-muted-foreground">
                {processedData.length} z {data.length} rekordów
            </div>
        </div>
    );
}

export default DataTable;
