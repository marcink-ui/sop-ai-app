'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Palette,
    Save,
    RotateCcw,
    Sun,
    Moon,
    Monitor,
    Check,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Type definitions
interface ColorTheme {
    id: string;
    name: string;
    primary: string;
    accent: string;
    preview: string;
}

interface StylingSettings {
    theme: string;
    colorScheme: string;
    font: string;
    borderRadius: number;
    animations: boolean;
    glassmorphism: boolean;
}

// Predefined color themes
const colorThemes: ColorTheme[] = [
    { id: 'default', name: 'VantageOS Blue', primary: '#3b82f6', accent: '#8b5cf6', preview: 'from-blue-500 to-violet-500' },
    { id: 'emerald', name: 'Emerald', primary: '#10b981', accent: '#14b8a6', preview: 'from-emerald-500 to-teal-500' },
    { id: 'rose', name: 'Rose', primary: '#f43f5e', accent: '#ec4899', preview: 'from-rose-500 to-pink-500' },
    { id: 'amber', name: 'Amber', primary: '#f59e0b', accent: '#f97316', preview: 'from-amber-500 to-orange-500' },
    { id: 'violet', name: 'Violet', primary: '#8b5cf6', accent: '#a855f7', preview: 'from-violet-500 to-purple-500' },
    { id: 'slate', name: 'Slate', primary: '#64748b', accent: '#475569', preview: 'from-slate-500 to-slate-600' },
];

// Font options
const fontOptions = [
    { id: 'inter', name: 'Inter', family: 'Inter, sans-serif' },
    { id: 'roboto', name: 'Roboto', family: 'Roboto, sans-serif' },
    { id: 'outfit', name: 'Outfit', family: 'Outfit, sans-serif' },
    { id: 'poppins', name: 'Poppins', family: 'Poppins, sans-serif' },
    { id: 'system', name: 'System', family: 'system-ui, sans-serif' },
];

// Display mode options
const displayModes = [
    { id: 'light', name: 'Jasny', icon: Sun },
    { id: 'dark', name: 'Ciemny', icon: Moon },
    { id: 'system', name: 'Systemowy', icon: Monitor },
];

// Default settings
const defaultSettings: StylingSettings = {
    theme: 'default',
    colorScheme: 'dark',
    font: 'inter',
    borderRadius: 8,
    animations: true,
    glassmorphism: true,
};

export default function StylingPage() {
    const router = useRouter();
    const [settings, setSettings] = useState<StylingSettings>(defaultSettings);
    const [hasChanges, setHasChanges] = useState(false);

    // Load settings from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem('vantageOsStyling');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    // Update settings
    const updateSetting = <K extends keyof StylingSettings>(key: K, value: StylingSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    // Save settings
    const saveSettings = () => {
        localStorage.setItem('vantageOsStyling', JSON.stringify(settings));
        setHasChanges(false);
        toast.success('Ustawienia zapisane!');
    };

    // Reset to defaults
    const resetSettings = () => {
        setSettings(defaultSettings);
        setHasChanges(true);
        toast.info('Przywrócono domyślne ustawienia');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/meta-admin')}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <Palette className="w-8 h-8 text-pink-500" />
                                App Styling
                            </h1>
                            <p className="text-gray-400 mt-1">Dostosuj wygląd i styl aplikacji</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={resetSettings}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                        <Button
                            onClick={saveSettings}
                            disabled={!hasChanges}
                            className="bg-gradient-to-r from-pink-500 to-rose-500"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Zapisz zmiany
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Color Theme */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-white">Paleta kolorów</CardTitle>
                                <CardDescription>Wybierz główny schemat kolorystyczny</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {colorThemes.map((theme) => (
                                        <button
                                            key={theme.id}
                                            onClick={() => updateSetting('theme', theme.id)}
                                            className={cn(
                                                "p-3 rounded-lg border-2 transition-all",
                                                settings.theme === theme.id
                                                    ? "border-white ring-2 ring-white/20"
                                                    : "border-gray-600 hover:border-gray-500"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-8 rounded-md bg-gradient-to-r mb-2",
                                                theme.preview
                                            )} />
                                            <span className="text-sm text-gray-300">{theme.name}</span>
                                            {settings.theme === theme.id && (
                                                <Check className="w-4 h-4 text-green-500 absolute top-2 right-2" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Display Mode */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-white">Tryb wyświetlania</CardTitle>
                                <CardDescription>Jasny, ciemny lub systemowy</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-3">
                                    {displayModes.map((mode) => {
                                        const Icon = mode.icon;
                                        return (
                                            <button
                                                key={mode.id}
                                                onClick={() => updateSetting('colorScheme', mode.id)}
                                                className={cn(
                                                    "flex-1 p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                                                    settings.colorScheme === mode.id
                                                        ? "border-pink-500 bg-pink-500/10 text-white"
                                                        : "border-gray-600 hover:border-gray-500 text-gray-400"
                                                )}
                                            >
                                                <Icon className="w-6 h-6" />
                                                <span className="text-sm">{mode.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Font Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-white">Czcionka</CardTitle>
                                <CardDescription>Wybierz główną czcionkę aplikacji</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {fontOptions.map((font) => (
                                        <button
                                            key={font.id}
                                            onClick={() => updateSetting('font', font.id)}
                                            className={cn(
                                                "w-full p-3 rounded-lg border transition-all flex items-center justify-between",
                                                settings.font === font.id
                                                    ? "border-pink-500 bg-pink-500/10"
                                                    : "border-gray-600 hover:border-gray-500"
                                            )}
                                            style={{ fontFamily: font.family }}
                                        >
                                            <span className="text-white">{font.name}</span>
                                            <span className="text-gray-400 text-sm">Aa Bb Cc 123</span>
                                            {settings.font === font.id && (
                                                <Badge className="bg-pink-500">Aktywna</Badge>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* UI Options */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-white">Opcje UI</CardTitle>
                                <CardDescription>Dodatkowe ustawienia interfejsu</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Border Radius Selection */}
                                <div>
                                    <Label className="text-white mb-3 block">Zaokrąglenie rogów</Label>
                                    <div className="flex gap-2">
                                        {[0, 4, 8, 12, 16].map((radius) => (
                                            <button
                                                key={radius}
                                                onClick={() => updateSetting('borderRadius', radius)}
                                                className={cn(
                                                    "px-3 py-2 border transition-all text-sm",
                                                    settings.borderRadius === radius
                                                        ? "border-pink-500 bg-pink-500/20 text-white"
                                                        : "border-gray-600 text-gray-400 hover:border-gray-500"
                                                )}
                                                style={{ borderRadius: radius }}
                                            >
                                                {radius}px
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Animations Toggle */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-white">Animacje</Label>
                                        <p className="text-sm text-gray-400">Włącz/wyłącz animacje UI</p>
                                    </div>
                                    <Switch
                                        checked={settings.animations}
                                        onCheckedChange={(checked) => updateSetting('animations', checked)}
                                    />
                                </div>

                                {/* Glassmorphism Toggle */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-white">Glassmorphism</Label>
                                        <p className="text-sm text-gray-400">Efekt szkła w interfejsie</p>
                                    </div>
                                    <Switch
                                        checked={settings.glassmorphism}
                                        onCheckedChange={(checked) => updateSetting('glassmorphism', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Preview Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6"
                >
                    <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-white">Podgląd</CardTitle>
                            <CardDescription>Zobacz jak wyglądają wybrane ustawienia</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={cn(
                                "p-6 rounded-lg bg-gradient-to-r",
                                colorThemes.find(t => t.id === settings.theme)?.preview || 'from-blue-500 to-violet-500'
                            )}>
                                <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-white">
                                    <h3 className="text-lg font-bold mb-2">Przykładowy komponent</h3>
                                    <p className="text-white/80 text-sm mb-4">
                                        Ten komponent pokazuje jak wyglądają twoje ustawienia stylowania.
                                    </p>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="secondary">
                                            Przycisk 1
                                        </Button>
                                        <Button size="sm" variant="outline" className="border-white/30 text-white">
                                            Przycisk 2
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
