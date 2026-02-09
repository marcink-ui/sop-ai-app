import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { CompanyContextManager } from '@/components/backoffice/company-context-manager';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Building2, ClipboardList, Target, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Kontekst Firmowy | Backoffice | VantageOS',
    description: 'Zarządzaj kontekstem firmowym - firma, działy, pracownicy, ontologia',
};

export default async function BackofficeContextPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/login');
    }

    // Only CITIZEN_DEV+ can access (includes EXPERT, META_ADMIN)
    const allowedRoles = ['CITIZEN_DEV', 'EXPERT', 'MANAGER', 'PILOT', 'SPONSOR', 'META_ADMIN'];
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

            {/* Quick links to Canvas tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/canvas" className="group">
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                            <ClipboardList className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">AI Canvas</h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Dashboard widgetów AI</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>
                <Link href="/canvas/gtm" className="group">
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md transition-all">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                            <Target className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">GTM Canvas</h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Go-to-Market Strategy</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>
            </div>

            <CompanyContextManager />
        </div>
    );
}

