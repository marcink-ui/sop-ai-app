'use client';

import { ReactNode } from 'react';

/**
 * AuthProvider — with better-auth, no wrapper provider is needed.
 * The useSession hook from @/lib/auth-client works standalone.
 * Keeping this component for backward compatibility (used in layout.tsx).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
