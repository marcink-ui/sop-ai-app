'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Access level types for the Digital Twin platform
export type AccessLevel = 'partner' | 'citizen_dev' | 'rada_transformacji' | 'meta_admin';

export interface User {
    id: string;
    name: string;
    email: string;
    company_id: string;
    company_name: string;
    role: string;
    access_level: AccessLevel;
    avatar_url?: string;
}

// Permission matrix based on access levels
export const ACCESS_PERMISSIONS: Record<AccessLevel, {
    label: string;
    description: string;
    canViewSOPs: boolean;
    canCreateSOPs: boolean;
    canEditSOPs: boolean;
    canDeleteSOPs: boolean;
    canRunPipeline: boolean;
    canViewMUDA: boolean;
    canManageAgents: boolean;
    canViewCouncil: boolean;
    canVoteCouncil: boolean;
    canManageRoles: boolean;
    canEditSyllabus: boolean;
    canAccessSettings: boolean;
    budgetLimit: number; // PLN
}> = {
    partner: {
        label: 'Partner',
        description: 'Dostęp tylko do odczytu dla zewnętrznych partnerów',
        canViewSOPs: true,
        canCreateSOPs: false,
        canEditSOPs: false,
        canDeleteSOPs: false,
        canRunPipeline: false,
        canViewMUDA: true,
        canManageAgents: false,
        canViewCouncil: true,
        canVoteCouncil: false,
        canManageRoles: false,
        canEditSyllabus: false,
        canAccessSettings: false,
        budgetLimit: 0,
    },
    citizen_dev: {
        label: 'Citizen Developer',
        description: 'Twórca procedur i procesów - pracownik operacyjny',
        canViewSOPs: true,
        canCreateSOPs: true,
        canEditSOPs: true,
        canDeleteSOPs: false,
        canRunPipeline: true,
        canViewMUDA: true,
        canManageAgents: false,
        canViewCouncil: true,
        canVoteCouncil: false,
        canManageRoles: false,
        canEditSyllabus: true,
        canAccessSettings: false,
        budgetLimit: 0,
    },
    rada_transformacji: {
        label: 'Rada Transformacji',
        description: 'Członek Rady - zatwierdza decyzje strategiczne',
        canViewSOPs: true,
        canCreateSOPs: true,
        canEditSOPs: true,
        canDeleteSOPs: false,
        canRunPipeline: true,
        canViewMUDA: true,
        canManageAgents: true,
        canViewCouncil: true,
        canVoteCouncil: true,
        canManageRoles: true,
        canEditSyllabus: true,
        canAccessSettings: false,
        budgetLimit: 50000, // 50k PLN
    },
    meta_admin: {
        label: 'Meta Admin',
        description: 'Pełny dostęp - administrator systemu',
        canViewSOPs: true,
        canCreateSOPs: true,
        canEditSOPs: true,
        canDeleteSOPs: true,
        canRunPipeline: true,
        canViewMUDA: true,
        canManageAgents: true,
        canViewCouncil: true,
        canVoteCouncil: true,
        canManageRoles: true,
        canEditSyllabus: true,
        canAccessSettings: true,
        budgetLimit: Infinity,
    },
};

// Mock user for development
const MOCK_USER: User = {
    id: 'user_dev_1',
    name: 'Jan Kowalski',
    email: 'jan@example.com',
    company_id: 'company_1',
    company_name: 'Example Corp',
    role: 'Process Manager',
    access_level: 'citizen_dev',
};

interface UserContextType {
    user: User | null;
    isAuthenticated: boolean;
    permissions: typeof ACCESS_PERMISSIONS[AccessLevel] | null;
    login: (user: User) => void;
    logout: () => void;
    switchAccessLevel: (level: AccessLevel) => void; // Dev only
    hasPermission: (permission: keyof typeof ACCESS_PERMISSIONS[AccessLevel]) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
    initialUser?: User | null;
}

export function UserProvider({ children, initialUser = MOCK_USER }: UserProviderProps) {
    const [user, setUser] = useState<User | null>(initialUser);

    const permissions = user ? ACCESS_PERMISSIONS[user.access_level] : null;

    const login = useCallback((newUser: User) => {
        setUser(newUser);
        // TODO: Persist to localStorage or session
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        // TODO: Clear session
    }, []);

    // Dev helper - switch access level without re-login
    const switchAccessLevel = useCallback((level: AccessLevel) => {
        if (user) {
            setUser({ ...user, access_level: level });
        }
    }, [user]);

    const hasPermission = useCallback((permission: keyof typeof ACCESS_PERMISSIONS[AccessLevel]): boolean => {
        if (!permissions) return false;
        const value = permissions[permission];
        return typeof value === 'boolean' ? value : value !== 0;
    }, [permissions]);

    const value: UserContextType = {
        user,
        isAuthenticated: !!user,
        permissions,
        login,
        logout,
        switchAccessLevel,
        hasPermission,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser(): UserContextType {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

// Helper hook for checking specific permissions
export function usePermission(permission: keyof typeof ACCESS_PERMISSIONS[AccessLevel]): boolean {
    const { hasPermission } = useUser();
    return hasPermission(permission);
}

// Access level badge component helper
export function getAccessLevelColor(level: AccessLevel): string {
    const colors: Record<AccessLevel, string> = {
        partner: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        citizen_dev: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        rada_transformacji: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        meta_admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[level];
}
