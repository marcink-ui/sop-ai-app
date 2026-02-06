import { Metadata } from 'next';
import { AICanvas } from '@/components/canvas/AICanvas';

export const metadata: Metadata = {
    title: 'AI Canvas | VantageOS',
    description: 'Interaktywny dashboard AI dla managerów',
};

export default function CanvasPage() {
    return (
        <div className="container max-w-7xl mx-auto px-6 py-10">
            <AICanvas />
        </div>
    );
}
