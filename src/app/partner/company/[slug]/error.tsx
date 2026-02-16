'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function CompanyError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[CompanyDashboard] Rendering error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 p-8">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                    Błąd ładowania strony firmy
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
                    Wystąpił błąd podczas ładowania danych firmy. Spróbuj odświeżyć stronę.
                </p>
                {error.message && (
                    <p className="text-xs text-red-500 font-mono mt-2 max-w-lg break-all">
                        {error.message}
                    </p>
                )}
            </div>
            <div className="flex gap-3">
                <Button variant="outline" onClick={() => window.location.href = '/partner'}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Wróć do Partnera
                </Button>
                <Button onClick={reset}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Spróbuj ponownie
                </Button>
            </div>
        </div>
    );
}
