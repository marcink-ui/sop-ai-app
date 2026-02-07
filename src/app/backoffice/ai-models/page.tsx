import { Metadata } from 'next';
import { AIModelConfigManager } from '@/components/backoffice/ai-model-config-manager';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Cpu } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Modele AI | VantageOS Backoffice',
    description: 'Konfiguracja modeli AI i routingu',
};

export default function AIModelsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/backoffice">
                    <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                        <Cpu className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Modele AI</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Konfiguracja providerów i routingu modeli
                        </p>
                    </div>
                </div>
            </div>

            <AIModelConfigManager />
        </div>
    );
}

