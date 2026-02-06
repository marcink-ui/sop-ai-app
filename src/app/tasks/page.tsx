import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { TaskBoard } from '@/components/tasks/task-board';

export const metadata: Metadata = {
    title: 'Zadania | VantageOS',
    description: 'Zarządzaj zadaniami i requestami - stwórz SOP, ulepsz agenta, zaproponuj zmiany',
};

export default async function TasksPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/login');
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col gap-2 mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Zadania 📋</h1>
                <p className="text-muted-foreground">
                    Kanban board do zarządzania requestami: nowe SOPy, ulepszenia agentów, zmiany procesów.
                </p>
            </div>

            <TaskBoard />
        </div>
    );
}

