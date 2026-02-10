import { Metadata } from 'next';
import { getSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { TaskBoard } from '@/components/tasks/task-board';
import { ClipboardList } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Zadania | VantageOS',
    description: 'Zarządzaj zadaniami i requestami - stwórz SOP, ulepsz agenta, zaproponuj zmiany',
};

export default async function TasksPage() {
    const session = await getSession();

    if (!session) {
        redirect('/auth/login');
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/20">
                    <ClipboardList className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Zadania</h1>
                    <p className="text-sm text-muted-foreground">
                        Kanban board do zarządzania requestami: nowe SOPy, ulepszenia agentów, zmiany procesów.
                    </p>
                </div>
            </div>

            <TaskBoard />
        </div>
    );
}

