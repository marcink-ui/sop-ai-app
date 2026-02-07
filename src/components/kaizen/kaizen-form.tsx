'use client';

import { useState } from 'react';
import { Lightbulb, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface KaizenFormProps {
    onSuccess?: () => void;
}

export function KaizenForm({ onSuccess }: KaizenFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<'APPLICATION' | 'COMPANY_PROCESS'>('APPLICATION');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    return (
        <Card className="border-amber-200 dark:border-amber-500/30">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                        <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Zgłoś pomysł Kaizen</CardTitle>
                        <CardDescription>
                            Każde zgłoszenie = +10 🐼 | Wdrożenie = +50 🐼
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Tytuł pomysłu</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Np. Automatyczne powiadomienia o zmianach SOP"
                            maxLength={255}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Opis</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Opisz szczegółowo swój pomysł..."
                            rows={4}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Kategoria</Label>
                        <Select
                            value={category}
                            onValueChange={(value: 'APPLICATION' | 'COMPANY_PROCESS') => setCategory(value)}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Wybierz kategorię" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="APPLICATION">Usprawnienie aplikacji</SelectItem>
                                <SelectItem value="COMPANY_PROCESS">Usprawnienie procesu firmowego</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Wysyłanie...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Wyślij pomysł
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
