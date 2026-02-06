'use client';

import { useROIStore } from '@/lib/roi/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Calculator,
    Plus,
    Save,
    FileText,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Clock,
    Target,
} from 'lucide-react';
import { OperationCard } from './OperationCard';
import { ROIDashboard } from './ROIDashboard';

export function ROICalculator() {
    const {
        report,
        setClientInfo,
        addOperation,
        saveCurrentReport,
    } = useROIStore();

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                        <Calculator className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kalkulator ROI</h1>
                        <p className="text-sm text-muted-foreground">
                            Oblicz zwrot z inwestycji w transformację procesów
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={saveCurrentReport}>
                        <Save className="h-4 w-4" />
                        Zapisz raport
                    </Button>
                </div>
            </div>

            {/* Report Metadata */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-4 w-4" />
                        Dane raportu
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Numer raportu</Label>
                            <Input value={report.reportNumber} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Label>Nazwa klienta</Label>
                            <Input
                                value={report.clientName}
                                onChange={(e) => setClientInfo({ clientName: e.target.value })}
                                placeholder="Wpisz nazwę firmy..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Data raportu</Label>
                            <Input value={report.reportDate} disabled className="bg-muted" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dashboard Summary */}
            <ROIDashboard />

            {/* Operations List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Operacje ({report.operations.length})</h2>
                    <Button onClick={() => addOperation()} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Dodaj operację
                    </Button>
                </div>

                {report.operations.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-12 text-center">
                            <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-medium mb-2">Brak operacji</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Dodaj operacje do analizy ROI
                            </p>
                            <Button onClick={() => addOperation()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Dodaj pierwszą operację
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {report.operations.map((op) => (
                            <OperationCard key={op.id} operation={op} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
