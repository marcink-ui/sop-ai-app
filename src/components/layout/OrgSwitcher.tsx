'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Building2, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface OrgInfo {
    id: string;
    name: string;
    slug: string;
}

/**
 * OrgSwitcher — visible only for PARTNER and META_ADMIN roles.
 * Shows "Aktualny klient: XYZ [Zmień]" in the top bar.
 * Uses cookie-based context switching via /api/context/switch.
 */
export function OrgSwitcher() {
    const { data: session } = useSession();
    const router = useRouter();
    const [activeOrg, setActiveOrg] = useState<OrgInfo | null>(null);
    const [orgs, setOrgs] = useState<OrgInfo[]>([]);
    const [canSwitch, setCanSwitch] = useState(false);
    const [isOverride, setIsOverride] = useState(false);

    const userRole = session?.user?.role;
    const userOrgId = (session?.user as Record<string, unknown>)?.organizationId as string | undefined;

    // Fetch current context and available orgs
    useEffect(() => {
        if (!userRole || (userRole !== 'PARTNER' && userRole !== 'META_ADMIN')) return;

        // Get current active org
        fetch('/api/context/switch')
            .then(r => r.json())
            .then(data => {
                if (data.organization) {
                    setActiveOrg(data.organization);
                    setCanSwitch(data.canSwitch);
                    setIsOverride(data.organizationId !== userOrgId);
                }
            })
            .catch(() => { });

        // Get available orgs for switching
        if (userRole === 'PARTNER') {
            fetch('/api/partner/organizations')
                .then(r => r.json())
                .then(data => {
                    if (data.organizations) setOrgs(data.organizations);
                })
                .catch(() => { });
        } else if (userRole === 'META_ADMIN') {
            fetch('/api/organizations')
                .then(r => r.json())
                .then(data => {
                    if (data.organizations) setOrgs(data.organizations);
                    else if (Array.isArray(data)) setOrgs(data);
                })
                .catch(() => { });
        }
    }, [userRole, userOrgId]);

    if (!canSwitch || !activeOrg) return null;

    const switchOrg = async (orgId: string) => {
        try {
            const res = await fetch('/api/context/switch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organizationId: orgId }),
            });
            const data = await res.json();
            if (data.organization) {
                setActiveOrg(data.organization);
                setIsOverride(orgId !== userOrgId);
                router.refresh();
            }
        } catch (err) {
            console.error('Failed to switch org:', err);
        }
    };

    const clearOverride = async () => {
        try {
            const res = await fetch('/api/context/switch', { method: 'DELETE' });
            const data = await res.json();
            if (data.organizationId) {
                setIsOverride(false);
                router.refresh();
            }
        } catch (err) {
            console.error('Failed to clear override:', err);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={`gap-2 ${isOverride ? 'border-amber-500 bg-amber-50 text-amber-700 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-400' : ''}`}
                    >
                        <Building2 className="h-4 w-4" />
                        <span className="max-w-[200px] truncate">{activeOrg.name}</span>
                        {isOverride && (
                            <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0 bg-amber-200 text-amber-800 dark:bg-amber-500/30 dark:text-amber-300">
                                Klient
                            </Badge>
                        )}
                        <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                    {orgs.map(org => (
                        <DropdownMenuItem
                            key={org.id}
                            onClick={() => switchOrg(org.id)}
                            className={org.id === activeOrg.id ? 'bg-accent' : ''}
                        >
                            <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="truncate">{org.name}</span>
                            {org.id === activeOrg.id && (
                                <Badge variant="secondary" className="ml-auto text-[10px]">Aktywna</Badge>
                            )}
                        </DropdownMenuItem>
                    ))}
                    {isOverride && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={clearOverride} className="text-muted-foreground">
                                <X className="h-4 w-4 mr-2" />
                                Wróć do swojej organizacji
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
