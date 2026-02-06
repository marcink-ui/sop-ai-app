'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Heart, Users, Lightbulb, Star, Crown, Target, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface User {
    id: string;
    name: string | null;
    email: string;
}

interface PandaGiveCardProps {
    users: User[];
    onSuccess?: () => void;
}

const CATEGORIES = [
    { value: 'TEAMWORK', label: 'Współpraca', icon: Users, color: 'text-blue-500' },
    { value: 'INNOVATION', label: 'Innowacyjność', icon: Lightbulb, color: 'text-yellow-500' },
    { value: 'QUALITY', label: 'Jakość', icon: Star, color: 'text-purple-500' },
    { value: 'LEADERSHIP', label: 'Przywództwo', icon: Crown, color: 'text-amber-500' },
    { value: 'CUSTOMER_FOCUS', label: 'Orientacja na klienta', icon: Target, color: 'text-green-500' },
];

export function PandaGiveCard({ users, onSuccess }: PandaGiveCardProps) {
    const [toUserId, setToUserId] = useState('');
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!toUserId || !category || !message.trim()) {
            toast.error('Wypełnij wszystkie pola');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/pandas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toUserId, category, message }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Błąd wysyłania');
            }

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);

            setToUserId('');
            setCategory('');
            setMessage('');
            toast.success('Panda wysłana! 🐼');
            onSuccess?.();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Błąd wysyłania');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="relative overflow-hidden">
            {showSuccess && (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/90 to-yellow-500/90 flex items-center justify-center z-10 animate-in fade-in duration-300">
                    <div className="text-center text-white">
                        <span className="text-6xl animate-bounce block">🐼</span>
                        <p className="text-xl font-bold mt-2">Wysłano!</p>
                    </div>
                </div>
            )}
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="h-5 w-5 text-pink-500" />
                    Wyślij Pandę
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Komu?</Label>
                        <Select value={toUserId} onValueChange={setToUserId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Wybierz osobę..." />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name || user.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Za co?</Label>
                        <div className="grid grid-cols-5 gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setCategory(cat.value)}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${category === cat.value
                                            ? 'border-primary bg-primary/10'
                                            : 'border-transparent bg-muted/50 hover:bg-muted'
                                        }`}
                                >
                                    <cat.icon className={`h-5 w-5 ${cat.color}`} />
                                    <span className="text-[10px] text-center">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Wiadomość</Label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Dziękuję za..."
                            rows={3}
                        />
                    </div>

                    <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                🐼 Wyślij Pandę
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
