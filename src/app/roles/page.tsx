'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Plus,
    Building2,
    UserCheck,
    Bot,
    ChevronRight,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Types matching API response
interface Department {
    id: string;
    name: string;
    users: Array<{ id: string; name: string | null; email: string; role: string }>;
    _count: { users: number; sops: number };
}

interface OrganizationalRole {
    id: string;
    name: string;
    description: string | null;
    raciMatrix: Record<string, unknown> | null;
}

interface RolesApiResponse {
    success: boolean;
    departments: Department[];
    roles: OrganizationalRole[];
    stats: {
        totalDepartments: number;
        totalRoles: number;
        totalPeople: number;
        rolesWithAssignments: number;
    };
}

export default function RolesPage() {
    const [search, setSearch] = useState('');
    const [expandedDepts, setExpandedDepts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [roles, setRoles] = useState<OrganizationalRole[]>([]);
    const [stats, setStats] = useState({
        totalDepartments: 0,
        totalRoles: 0,
        totalPeople: 0,
        rolesWithAssignments: 0,
    });

    const loadRoles = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/roles${search ? `?search=${encodeURIComponent(search)}` : ''}`);
            if (response.ok) {
                const data: RolesApiResponse = await response.json();
                setDepartments(data.departments);
                setRoles(data.roles);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            loadRoles();
        }, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const toggleDept = (id: string) => {
        setExpandedDepts(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-500/20 p-2">
                        <Users className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Roles Registry</h1>
                        <p className="text-sm text-muted-foreground">
                            {stats.totalDepartments} departments • {stats.totalRoles} roles • {stats.totalPeople} people
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadRoles} disabled={isLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Role
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm">Departments</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalDepartments}</p>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <UserCheck className="h-4 w-4" />
                        <span className="text-sm">Total Roles</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalRoles}</p>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">People</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalPeople}</p>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Bot className="h-4 w-4" />
                        <span className="text-sm">With RACI</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-green-400">{stats.rolesWithAssignments}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search departments or roles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card border-border"
                    />
                </div>
            </div>

            {/* Loading State */}
            {isLoading && departments.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-3 text-muted-foreground">Loading roles...</span>
                </div>
            ) : (
                <>
                    {/* Departments List */}
                    <div className="space-y-3">
                        {departments.length === 0 ? (
                            <div className="rounded-lg border border-border bg-card/50 p-12 text-center">
                                <Building2 className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-30" />
                                <p className="text-muted-foreground">No departments found</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {search ? 'Try a different search term' : 'Create your first department to get started'}
                                </p>
                            </div>
                        ) : (
                            departments.map((dept) => (
                                <div
                                    key={dept.id}
                                    className="rounded-xl border border-border bg-card/50 overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggleDept(dept.id)}
                                        className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30"
                                    >
                                        <div className="flex items-center gap-3">
                                            <ChevronRight
                                                className={`h-5 w-5 text-muted-foreground transition-transform ${expandedDepts.includes(dept.id) ? 'rotate-90' : ''
                                                    }`}
                                            />
                                            <Building2 className="h-5 w-5 text-green-400" />
                                            <div>
                                                <span className="font-medium text-foreground">{dept.name}</span>
                                                <span className="ml-3 text-sm text-muted-foreground">
                                                    {dept._count.users} people • {dept._count.sops} SOPs
                                                </span>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="border-border">
                                            {dept._count.users} members
                                        </Badge>
                                    </button>

                                    {expandedDepts.includes(dept.id) && (
                                        <div className="border-t border-border bg-card/30">
                                            {dept.users.length === 0 ? (
                                                <div className="p-8 text-center text-muted-foreground">
                                                    No members in this department
                                                </div>
                                            ) : (
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b border-border">
                                                            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">
                                                                Name
                                                            </th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">
                                                                Email
                                                            </th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">
                                                                Role
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {dept.users.map((user) => (
                                                            <tr key={user.id} className="border-b border-border last:border-0">
                                                                <td className="px-4 py-3 text-foreground">{user.name || 'Unnamed'}</td>
                                                                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                                                <td className="px-4 py-3">
                                                                    <Badge variant="outline" className="border-green-500/30 text-green-400">
                                                                        {user.role}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Organizational Roles Section */}
                    {roles.length > 0 && (
                        <div className="mt-8">
                            <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-green-400" />
                                Organizational Roles (RACI)
                            </h2>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {roles.map((role) => (
                                    <div
                                        key={role.id}
                                        className="rounded-lg border border-border bg-card/50 p-4 hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-foreground">{role.name}</span>
                                            {role.raciMatrix && Object.keys(role.raciMatrix).length > 0 && (
                                                <Badge className="bg-green-500/20 text-green-400">
                                                    <Bot className="mr-1 h-3 w-3" />
                                                    RACI
                                                </Badge>
                                            )}
                                        </div>
                                        {role.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {role.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
