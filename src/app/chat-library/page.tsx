import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ChatLibrary } from '@/components/ai-chat/chat-library';

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
            <div className="flex flex-col gap-2 mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Biblioteka Rozmów 💬</h1>
                <p className="text-muted-foreground">
                    Historia Twoich rozmów z VantageOS AI. Przeszukuj, filtruj i wracaj do poprzednich sesji.
                </p>
            </div>

            <ChatLibrary />
        </div>
    );
}

