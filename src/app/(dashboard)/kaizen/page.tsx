'use client';

import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { KaizenForm, KaizenList } from '@/components/kaizen';

export default function KaizenPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSuccess = () => {
        setRefreshKey((k) => k + 1);
    };

    return (
        <div className="container py-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/20">
                        <Lightbulb className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Kaizen</h1>
                        <p className="text-muted-foreground">
                            Ciągłe doskonalenie - zgłoś swój pomysł!
                        </p>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div>
                    <KaizenForm onSuccess={handleSuccess} />
                </div>
                <div>
                    <KaizenList myOnly refreshKey={refreshKey} />
                </div>
            </div>
        </div>
    );
}
