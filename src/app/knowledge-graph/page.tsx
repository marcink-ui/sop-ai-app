
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import KnowledgeGraph from '@/components/graph/KnowledgeGraph';

export const metadata: Metadata = {
    title: 'Knowledge Graph | VantageOS',
    description: 'Interactive organization structure and knowledge map',
};

export default async function KnowledgeGraphPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/login');
    }

    return (
        <div className="container mx-auto px-4 py-6 h-full flex flex-col">
            <div className="flex flex-col gap-2 mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Knowledge Graph 🕸️</h1>
                <p className="text-muted-foreground">
                    Visual map of your organization's structure, standard operating procedures, and AI agents.
                </p>
            </div>

            <div className="flex-1 min-h-0">
                <KnowledgeGraph />
            </div>
        </div>
    );
}

