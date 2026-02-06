import { Metadata } from 'next';
import { AIModelConfigManager } from '@/components/backoffice/ai-model-config-manager';

export const metadata: Metadata = {
    title: 'Modele AI | VantageOS Backoffice',
    description: 'Konfiguracja modeli AI i routingu',
};

export default function AIModelsPage() {
    return (
        <div className="container max-w-5xl mx-auto px-6 py-10">
            <AIModelConfigManager />
        </div>
    );
}
