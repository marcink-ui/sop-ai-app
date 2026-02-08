import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ChatLibrary } from '@/components/ai-chat/chat-library';
import { MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Biblioteka Rozmów | VantageOS',
    description: 'Historia rozmów z AI asystentem',
};

export default async function ChatLibraryPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/login');
    }

    // CitizenDev+ access check
    const allowedRoles = ['CITIZEN_DEV', 'MANAGER', 'PILOT', 'SPONSOR'];
    if (!allowedRoles.includes(session.user.role)) {
        redirect('/');
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-500/20">
                    <MessageSquare className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Biblioteka Rozmów</h1>
                    <p className="text-sm text-muted-foreground">
                        Historia Twoich rozmów z VantageOS AI. Przeszukuj, filtruj i wracaj do poprzednich sesji.
                    </p>
                </div>
            </div>

            <ChatLibrary />
        </div>
    );
}

