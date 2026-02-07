import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { CompanyContextManager } from '@/components/backoffice/company-context-manager';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Building2 } from 'lucide-react';

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
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/backoffice">
                    <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Kontekst Firmowy</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Informacje o firmie, działach i pracownikach dla AI
                        </p>
                    </div>
                </div>
            </div>

            <CompanyContextManager />
        </div>
    );
}

