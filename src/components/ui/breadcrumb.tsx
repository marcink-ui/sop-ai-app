'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
    label: string;
    href: string;
    isCurrentPage: boolean;
}

// Human-readable labels for routes
const routeLabels: Record<string, string> = {
    '': 'Dashboard',
    'sops': 'SOPs',
    'agents': 'Agenci AI',
    'value-chain': 'Łańcuch Wartości',
    'library': 'Biblioteka',
    'council': 'Rada',
    'tasks': 'Zadania',
    'knowledge-graph': 'Graf Wiedzy',
    'chat-library': 'Historia AI',
    'roles': 'Role',
    'muda': 'MUDA',
    'ontology': 'Ontologia',
    'settings': 'Ustawienia',
    'profile': 'Profil',
    'api-keys': 'Klucze API',
    'integrations': 'Integracje',
    'language': 'Język',
    'style': 'Styl',
    'backoffice': 'Backoffice',
    'companies': 'Firmy',
    'users': 'Użytkownicy',
    'prompts': 'Prompty',
    'ai-models': 'Modele AI',
    'context': 'Kontekst',
    'transcript-processor': 'Transkrypcje',
    'resources': 'Zasoby',
    'wiki': 'Wiki',
    'newsletter': 'Newsletter',
    'notifications': 'Powiadomienia',
    'gamification': 'Gamifikacja',
    'pandas': 'Pandy',
    'roi-calculator': 'Kalkulator ROI',
    'canvas': 'Canvas',
    'pipeline': 'Pipeline',
    'meta-admin': 'Meta Admin',
    'new': 'Nowy',
    'edit': 'Edycja',
    'onboarding': 'Onboarding',
    'analytics': 'Analityka',
    'auth': 'Logowanie',
    'login': 'Zaloguj',
};

function getLabel(segment: string): string {
    // Check if it's a UUID or dynamic segment
    if (segment.match(/^[0-9a-f-]{36}$/i) || segment.startsWith('[')) {
        return 'Szczegóły';
    }
    // Check for step patterns
    if (segment.match(/^step-\d+$/)) {
        return `Krok ${segment.split('-')[1]}`;
    }
    return routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function Breadcrumb({ className }: { className?: string }) {
    const pathname = usePathname();

    const items = React.useMemo<BreadcrumbItem[]>(() => {
        if (pathname === '/') {
            return [];
        }

        const segments = pathname.split('/').filter(Boolean);
        const breadcrumbs: BreadcrumbItem[] = [];

        // Always start with home
        breadcrumbs.push({
            label: 'Dashboard',
            href: '/',
            isCurrentPage: false,
        });

        // Build up the path
        let currentPath = '';
        segments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            breadcrumbs.push({
                label: getLabel(segment),
                href: currentPath,
                isCurrentPage: index === segments.length - 1,
            });
        });

        return breadcrumbs;
    }, [pathname]);

    if (items.length === 0) {
        return null;
    }

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn("flex items-center text-sm", className)}
        >
            <ol className="flex items-center gap-1">
                {items.map((item, index) => (
                    <li key={item.href} className="flex items-center gap-1">
                        {index > 0 && (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                        )}
                        {item.isCurrentPage ? (
                            <span
                                className="font-medium text-foreground truncate max-w-[150px]"
                                aria-current="page"
                            >
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                href={item.href}
                                className={cn(
                                    "text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px]",
                                    index === 0 && "flex items-center gap-1"
                                )}
                            >
                                {index === 0 && <Home className="h-3.5 w-3.5 flex-shrink-0" />}
                                <span className={index === 0 ? "sr-only sm:not-sr-only" : ""}>
                                    {item.label}
                                </span>
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
