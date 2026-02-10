
import { Metadata } from 'next';
import { getSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import KnowledgeGraph from '@/components/graph/KnowledgeGraph';
import { Network } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Knowledge Graph | VantageOS',
    description: 'Interactive organization structure and knowledge map',
};

export default async function KnowledgeGraphPage() {
    const session = await getSession();

    if (!session) {
        redirect('/auth/login');
    }

    return (
        <div className="container mx-auto px-4 py-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/20">
                    <Network className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Graf Wiedzy</h1>
                    <p className="text-sm text-muted-foreground">
                        Wizualna mapa struktury organizacji, procedur operacyjnych i agentów AI.
                    </p>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <KnowledgeGraph />
            </div>
        </div>
    );
}

