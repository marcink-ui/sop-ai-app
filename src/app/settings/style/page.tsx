'use client';

import { motion } from 'framer-motion';
import { Palette, Check, ChevronLeft, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useThemeStyle, THEME_STYLES, ThemeStyle } from '@/components/theme/ThemeStyleProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function StyleSettingsPage() {
    const { themeStyle, setThemeStyle } = useThemeStyle();

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3"
            >
                <Link href="/settings">
                    <Button variant="ghost" size="icon" className="mr-2">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3 border border-purple-500/20">
                    <Palette className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Styl interfejsu</h1>
                    <p className="text-sm text-muted-foreground">Wybierz preferowany wygląd aplikacji</p>
                </div>
            </motion.div>

            {/* Theme Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid gap-4 md:grid-cols-3"
            >
                {(Object.keys(THEME_STYLES) as ThemeStyle[]).map((styleKey, index) => {
                    const style = THEME_STYLES[styleKey];
                    const isActive = themeStyle === styleKey;
                    // Show dark mode preview colors
                    const darkColors = style.dark;
                    const lightColors = style.light;

                    return (
                        <motion.div
                            key={styleKey}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                        >
                            <button
                                onClick={() => setThemeStyle(styleKey)}
                                className={cn(
                                    'w-full group relative rounded-xl border p-4 transition-all duration-300 text-left',
                                    isActive
                                        ? 'border-2 ring-2 ring-offset-2 ring-offset-background'
                                        : 'border-border hover:border-muted-foreground/30',
                                    styleKey === 'linear' && isActive && 'border-indigo-500 ring-indigo-500/30',
                                    styleKey === 'notion' && isActive && 'border-red-500 ring-red-500/30',
                                    styleKey === 'hero' && isActive && 'border-purple-500 ring-purple-500/30'
                                )}
                            >
                                {/* Check badge */}
                                {isActive && (
                                    <div className={cn(
                                        'absolute -top-2 -right-2 rounded-full p-1',
                                        styleKey === 'linear' && 'bg-indigo-500',
                                        styleKey === 'notion' && 'bg-red-500',
                                        styleKey === 'hero' && 'bg-purple-500'
                                    )}>
                                        <Check className="h-3 w-3 text-white" />
                                    </div>
                                )}

                                {/* Preview - Dark and Light side by side */}
                                <div className="h-24 rounded-lg mb-4 flex overflow-hidden border border-border">
                                    {/* Dark side */}
                                    <div
                                        className="flex-1 flex items-center justify-center relative"
                                        style={{ background: darkColors.bgPrimary }}
                                    >
                                        <Moon className="absolute top-1 left-1 h-3 w-3" style={{ color: darkColors.textPrimary, opacity: 0.5 }} />
                                        <div className="flex flex-col items-center gap-1">
                                            <div
                                                className="w-10 h-1.5 rounded-full"
                                                style={{ background: darkColors.accent }}
                                            />
                                            <div className="flex gap-0.5">
                                                <div
                                                    className="w-3 h-3 rounded"
                                                    style={{
                                                        background: darkColors.bgSecondary,
                                                        borderRadius: darkColors.radius,
                                                    }}
                                                />
                                                <div
                                                    className="w-4 h-3 rounded"
                                                    style={{
                                                        background: darkColors.accent,
                                                        borderRadius: darkColors.radius,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Light side */}
                                    <div
                                        className="flex-1 flex items-center justify-center relative"
                                        style={{ background: lightColors.bgPrimary }}
                                    >
                                        <Sun className="absolute top-1 right-1 h-3 w-3" style={{ color: lightColors.textPrimary, opacity: 0.5 }} />
                                        <div className="flex flex-col items-center gap-1">
                                            <div
                                                className="w-10 h-1.5 rounded-full"
                                                style={{ background: lightColors.accent }}
                                            />
                                            <div className="flex gap-0.5">
                                                <div
                                                    className="w-3 h-3 rounded"
                                                    style={{
                                                        background: lightColors.bgSecondary,
                                                        borderRadius: lightColors.radius,
                                                    }}
                                                />
                                                <div
                                                    className="w-4 h-3 rounded"
                                                    style={{
                                                        background: lightColors.accent,
                                                        borderRadius: lightColors.radius,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{style.preview}</span>
                                        <h3 className="font-semibold text-foreground">{style.name}</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{style.description}</p>
                                </div>

                                {/* Color swatches - both modes */}
                                <div className="flex gap-3 mt-3">
                                    <div className="flex gap-1" title="Dark mode">
                                        <div
                                            className="w-3 h-3 rounded-full border border-border"
                                            style={{ background: darkColors.accent }}
                                        />
                                        <div
                                            className="w-3 h-3 rounded-full border border-border"
                                            style={{ background: darkColors.bgPrimary }}
                                        />
                                    </div>
                                    <div className="flex gap-1" title="Light mode">
                                        <div
                                            className="w-3 h-3 rounded-full border border-border"
                                            style={{ background: lightColors.accent }}
                                        />
                                        <div
                                            className="w-3 h-3 rounded-full border border-border"
                                            style={{ background: lightColors.bgPrimary }}
                                        />
                                    </div>
                                </div>
                            </button>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="rounded-xl border border-border bg-card/50 p-4"
            >
                <p className="text-xs text-muted-foreground">
                    💡 Każdy styl wspiera tryb jasny i ciemny. Użyj przełącznika w nagłówku aby zmienić tryb.
                    Styl zostanie zapisany lokalnie i zastosowany przy każdej wizycie.
                </p>
            </motion.div>
        </div>
    );
}
