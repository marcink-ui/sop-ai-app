import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { CompanyContextManager } from '@/components/backoffice/company-context-manager';

export const metadata: Metadata = {
    title: 'Kontekst Firmowy | Backoffice | VantageOS',
    description: 'Zarządzaj kontekstem firmowym - firma, działy, pracownicy, ontologia',
};

export default async function BackofficeContextPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/login');
    }

    // Only CITIZEN_DEV+ can access
    const allowedRoles = ['CITIZEN_DEV', 'MANAGER', 'PILOT', 'SPONSOR'];
    if (!allowedRoles.includes(session.user.role)) {
        redirect('/');
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col gap-2 mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Kontekst Firmowy 🏢</h1>
                <p className="text-muted-foreground">
                    Wprowadź informacje o firmie, działach i pracownikach. Te dane będą wykorzystywane przez AI do lepszego zrozumienia kontekstu.
                </p>
            </div>

            <CompanyContextManager />
        </div>
    );
}
