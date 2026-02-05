'use client';

import { useState } from 'react';
import {
    Users,
    Search,
    Plus,
    Building2,
    UserCheck,
    Bot,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Sample data structure based on ROLE_MAP.yaml
const sampleRoles = [
    {
        id: 'dept-1',
        department: 'Sprzedaż',
        manager: 'Jan Kowalski',
        roles: [
            {
                name: 'Handlowiec',
                people: ['Anna N.', 'Piotr W.'],
                sops: ['SOP_Ofertowanie', 'SOP_Negocjacje'],
                aiAugmented: true
            },
            {
                name: 'Asystent sprzedaży',
                people: ['Anna N.'],
                sops: ['SOP_CRM', 'SOP_Raporty'],
                aiAugmented: false
            },
        ],
    },
    {
        id: 'dept-2',
        department: 'Marketing',
        manager: 'Maria Nowak',
        roles: [
            {
                name: 'Content Manager',
                people: ['Tomek K.'],
                sops: ['SOP_Content', 'SOP_Social'],
                aiAugmented: true
            },
        ],
    },
    {
        id: 'dept-3',
        department: 'Operacje',
        manager: 'Adam Wiśniewski',
        roles: [
            {
                name: 'Koordynator',
                people: ['Ewa Z.', 'Michał P.'],
                sops: ['SOP_Zamówienia'],
                aiAugmented: false
            },
        ],
    },
];

export default function RolesPage() {
    const [search, setSearch] = useState('');
    const [expandedDepts, setExpandedDepts] = useState<string[]>([]);

    const toggleDept = (id: string) => {
        setExpandedDepts(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const filteredDepts = sampleRoles.filter((dept) =>
        dept.department.toLowerCase().includes(search.toLowerCase()) ||
        dept.roles.some(r => r.name.toLowerCase().includes(search.toLowerCase()))
    );

    const totalRoles = sampleRoles.reduce((acc, d) => acc + d.roles.length, 0);
    const totalPeople = new Set(sampleRoles.flatMap(d => d.roles.flatMap(r => r.people))).size;
    const aiAugmentedRoles = sampleRoles.reduce(
        (acc, d) => acc + d.roles.filter(r => r.aiAugmented).length,
        0
    );

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
                            {sampleRoles.length} departments • {totalRoles} roles • {totalPeople} people
                        </p>
                    </div>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Import from YAML
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm">Departments</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">{sampleRoles.length}</p>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <UserCheck className="h-4 w-4" />
                        <span className="text-sm">Total Roles</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">{totalRoles}</p>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">People</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">{totalPeople}</p>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Bot className="h-4 w-4" />
                        <span className="text-sm">AI-Augmented</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-green-400">{aiAugmentedRoles}</p>
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

            {/* Departments List */}
            <div className="space-y-3">
                {filteredDepts.map((dept) => (
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
                                    <span className="font-medium text-foreground">{dept.department}</span>
                                    <span className="ml-3 text-sm text-muted-foreground">
                                        Manager: {dept.manager}
                                    </span>
                                </div>
                            </div>
                            <Badge variant="outline" className="border-border">
                                {dept.roles.length} roles
                            </Badge>
                        </button>

                        {expandedDepts.includes(dept.id) && (
                            <div className="border-t border-border bg-card/30">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">
                                                Role
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">
                                                People
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">
                                                SOPs
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">
                                                AI Augmented
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dept.roles.map((role) => (
                                            <tr key={role.name} className="border-b border-border last:border-0">
                                                <td className="px-4 py-3 text-foreground">{role.name}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {role.people.map((p) => (
                                                            <Badge key={p} variant="secondary" className="bg-muted">
                                                                {p}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {role.sops.map((sop) => (
                                                            <Badge key={sop} variant="outline" className="border-blue-500/30 text-blue-400">
                                                                {sop}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {role.aiAugmented ? (
                                                        <Badge className="bg-green-500/20 text-green-400">
                                                            <Bot className="mr-1 h-3 w-3" />
                                                            Yes
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-muted text-muted-foreground">No</Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
