'use client';

import { useState } from 'react';
import { Lightbulb, Send, Loader2, Sparkles, AppWindow, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KaizenFormProps {
    onSuccess?: () => void;
}

export function KaizenForm({ onSuccess }: KaizenFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<'APPLICATION' | 'COMPANY_PROCESS'>('APPLICATION');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            toast.error('Wypełnij wszystkie pola');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/kaizen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, category }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Błąd podczas wysyłania');
            }

            // Show success animation
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);

            toast.success('🐼 +10 Pand! Twoja sugestia została wysłana.');

            // Reset form
            setTitle('');
            setDescription('');
            setCategory('APPLICATION');

            onSuccess?.();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Coś poszło nie tak');
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = [
        { value: 'APPLICATION', label: 'Aplikacja', icon: AppWindow, description: 'Usprawnienia VantageOS' },
        { value: 'COMPANY_PROCESS', label: 'Proces', icon: Building2, description: 'Usprawnienia organizacyjne' },
    ] as const;

    return (
        <Card className="overflow-hidden border-0 shadow-lg">
            {/* Gradient Header */}
            <div className="relative bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 p-6 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />

                <div className="relative flex items-start gap-4">
                    <motion.div
                        className="p-3 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <Lightbulb className="h-8 w-8" />
                    </motion.div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            Zgłoś pomysł Kaizen
                            <Sparkles className="h-5 w-5" />
                        </h3>
                        <p className="text-white/80 text-sm mt-1">
                            Podziel się swoim pomysłem na usprawnienie
                        </p>
                        <div className="flex gap-2 mt-3">
                            <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                                🐼 +10 za zgłoszenie
                            </Badge>
                            <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                                🐼 +50 za wdrożenie
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Success Animation Overlay */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center bg-emerald-500/90 backdrop-blur-sm"
                        >
                            <div className="text-center">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: 2, duration: 0.3 }}
                                    className="text-5xl mb-2"
                                >
                                    🐼
                                </motion.div>
                                <p className="text-xl font-bold">+10 Pand!</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <CardContent className="p-6 bg-card">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Category Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Kategoria</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {categories.map(({ value, label, icon: Icon, description }) => (
                                <motion.button
                                    key={value}
                                    type="button"
                                    onClick={() => setCategory(value)}
                                    className={cn(
                                        "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                        category === value
                                            ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
                                            : "border-muted hover:border-amber-300 hover:bg-muted/50"
                                    )}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSubmitting}
                                >
                                    <div className={cn(
                                        "p-2 rounded-lg",
                                        category === value
                                            ? "bg-amber-500 text-white"
                                            : "bg-muted text-muted-foreground"
                                    )}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className={cn(
                                        "font-medium text-sm",
                                        category === value && "text-amber-700 dark:text-amber-400"
                                    )}>
                                        {label}
                                    </span>
                                    <span className="text-xs text-muted-foreground text-center">
                                        {description}
                                    </span>
                                    {category === value && (
                                        <motion.div
                                            layoutId="selectedCategory"
                                            className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 rounded-full flex items-center justify-center"
                                        >
                                            <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Title Input */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium">
                            Tytuł pomysłu
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Np. Automatyczne powiadomienia o zmianach SOP"
                            maxLength={255}
                            disabled={isSubmitting}
                            className="h-11 transition-shadow focus:shadow-md"
                        />
                    </div>

                    {/* Description Textarea */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                            Opis pomysłu
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Opisz szczegółowo swój pomysł i jakie korzyści przyniesie..."
                            rows={4}
                            disabled={isSubmitting}
                            className="resize-none transition-shadow focus:shadow-md"
                        />
                    </div>

                    {/* Submit Button */}
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-medium text-base shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Wysyłanie pomysłu...
                                </>
                            ) : (
                                <>
                                    <Send className="h-5 w-5 mr-2" />
                                    Wyślij pomysł Kaizen
                                </>
                            )}
                        </Button>
                    </motion.div>
                </form>
            </CardContent>
        </Card>
    );
}
