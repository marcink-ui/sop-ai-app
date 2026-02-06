import { ROICalculator } from '@/components/roi/ROICalculator';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Kalkulator ROI | VantageOS',
    description: 'Oblicz zwrot z inwestycji w transformację cyfrową',
};

export default function ROICalculatorPage() {
    return (
        <main className="container mx-auto py-8 px-4 max-w-6xl">
            <ROICalculator />
        </main>
    );
}
