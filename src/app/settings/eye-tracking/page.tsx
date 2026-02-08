'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Eye,
    Download,
    Trash2,
    Camera,
    AlertCircle,
    Play,
    Square,
    Loader2,
    CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const STORAGE_KEY = 'vantage-webgazer-enabled';
const GAZE_DATA_KEY = 'vantage-webgazer-gaze-data';

export default function EyeTrackingSettingsPage() {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [dataPointsCount, setDataPointsCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [webgazer, setWebgazer] = useState<typeof import('webgazer') | null>(null);

    // Load preferences and data count from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            setIsEnabled(saved === 'true');

            const gazeData = localStorage.getItem(GAZE_DATA_KEY);
            if (gazeData) {
                try {
                    const parsed = JSON.parse(gazeData);
                    setDataPointsCount(parsed.gazePoints?.length || 0);
                } catch (e) {
                    console.warn('Failed to parse gaze data:', e);
                }
            }
        }
    }, []);

    const handleToggleEnabled = (checked: boolean) => {
        setIsEnabled(checked);
        localStorage.setItem(STORAGE_KEY, checked.toString());

        if (!checked && isTracking) {
            handleStopTracking();
        }
    };

    const handleStartTracking = async () => {
        if (typeof window === 'undefined') return;

        setIsLoading(true);
        try {
            const webgazerModule = await import('webgazer');
            setWebgazer(webgazerModule);

            await webgazerModule.default
                .setRegression('ridge')
                .setTracker('TFFacemesh')
                .showVideoPreview(true)
                .showPredictionPoints(true)
                .setGazeListener((data: { x: number; y: number } | null) => {
                    if (data) {
                        // Update local count
                        setDataPointsCount(prev => prev + 1);

                        // Save to localStorage
                        const saved = localStorage.getItem(GAZE_DATA_KEY);
                        const existing = saved ? JSON.parse(saved) : { gazePoints: [], heatmapData: [] };
                        existing.gazePoints.push({
                            x: Math.round(data.x),
                            y: Math.round(data.y),
                            timestamp: Date.now(),
                        });
                        // Keep last 10000 points
                        if (existing.gazePoints.length > 10000) {
                            existing.gazePoints = existing.gazePoints.slice(-10000);
                        }
                        localStorage.setItem(GAZE_DATA_KEY, JSON.stringify(existing));
                    }
                })
                .begin();

            setIsTracking(true);
        } catch (error) {
            console.error('Failed to start WebGazer:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStopTracking = () => {
        if (webgazer) {
            try {
                webgazer.default.end();
                setIsTracking(false);
            } catch (error) {
                console.error('Failed to stop WebGazer:', error);
            }
        }
    };

    const handleExportData = () => {
        const gazeData = localStorage.getItem(GAZE_DATA_KEY);
        if (gazeData) {
            const data = JSON.parse(gazeData);
            const exportData = {
                exportedAt: new Date().toISOString(),
                screenSize: { width: window.innerWidth, height: window.innerHeight },
                ...data,
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `eye-tracking-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const handleClearData = () => {
        localStorage.removeItem(GAZE_DATA_KEY);
        setDataPointsCount(0);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3"
            >
                <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-3 border border-emerald-500/20">
                    <Eye className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Eye Tracking</h1>
                    <p className="text-sm text-muted-foreground">Śledzenie wzroku dla badań UX i heatmap</p>
                </div>
            </motion.div>

            {/* Warning Alert */}
            <Alert variant="default" className="border-amber-500/30 bg-amber-500/5">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-500">Funkcja eksperymentalna</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                    Eye tracking wykorzystuje kamerę do śledzenia kierunku wzroku. Dane są przechowywane lokalnie
                    i nigdy nie są wysyłane na serwer. Wymaga zgody na dostęp do kamery.
                </AlertDescription>
            </Alert>

            {/* Main Toggle Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Eye Tracking
                    </CardTitle>
                    <CardDescription>
                        Włącz śledzenie wzroku dla zbierania danych o interakcji użytkownika
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="eye-tracking-toggle" className="flex flex-col gap-1">
                            <span>Włącz Eye Tracking</span>
                            <span className="font-normal text-xs text-muted-foreground">
                                Pozwól na zbieranie danych o kierunku wzroku
                            </span>
                        </Label>
                        <Switch
                            id="eye-tracking-toggle"
                            checked={isEnabled}
                            onCheckedChange={handleToggleEnabled}
                        />
                    </div>

                    {isEnabled && (
                        <div className="flex items-center gap-3 pt-2">
                            {isTracking ? (
                                <Button
                                    variant="destructive"
                                    onClick={handleStopTracking}
                                    className="gap-2"
                                >
                                    <Square className="h-4 w-4" />
                                    Zatrzymaj śledzenie
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleStartTracking}
                                    disabled={isLoading}
                                    className="gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Play className="h-4 w-4" />
                                    )}
                                    Rozpocznij śledzenie
                                </Button>
                            )}

                            {isTracking && (
                                <Badge variant="outline" className="gap-1 text-green-500 border-green-500/30">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Aktywne
                                </Badge>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Data Management Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Zebrane dane</CardTitle>
                    <CardDescription>
                        Zarządzaj danymi eye trackingu przechowywanymi lokalnie
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                        <div>
                            <p className="text-sm font-medium">Punkty danych</p>
                            <p className="text-2xl font-bold text-foreground">
                                {dataPointsCount.toLocaleString('pl-PL')}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportData}
                                disabled={dataPointsCount === 0}
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Eksportuj JSON
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleClearData}
                                disabled={dataPointsCount === 0}
                                className="gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                Wyczyść dane
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* How it works Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Jak to działa?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="rounded-full bg-emerald-500/10 p-2 mt-0.5">
                            <span className="text-sm font-bold text-emerald-500">1</span>
                        </div>
                        <div>
                            <p className="font-medium">Kalibracja</p>
                            <p className="text-sm text-muted-foreground">
                                WebGazer kalibruje się automatycznie poprzez obserwację Twoich kliknięć
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="rounded-full bg-emerald-500/10 p-2 mt-0.5">
                            <span className="text-sm font-bold text-emerald-500">2</span>
                        </div>
                        <div>
                            <p className="font-medium">Śledzenie</p>
                            <p className="text-sm text-muted-foreground">
                                Algorytm AI analizuje obraz z kamery i estymuje punkt skupienia wzroku
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="rounded-full bg-emerald-500/10 p-2 mt-0.5">
                            <span className="text-sm font-bold text-emerald-500">3</span>
                        </div>
                        <div>
                            <p className="font-medium">Analiza</p>
                            <p className="text-sm text-muted-foreground">
                                Zebrane dane można eksportować do analizy heatmap i optymalizacji UX
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
