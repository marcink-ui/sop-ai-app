'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Plus,
    Search,
    MoreHorizontal,
    Shield,
    Mail,
    Building2,
    Clock,
    Edit,
    Trash2,
    UserPlus,
    Check,
    X,
    ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Role definitions matching Prisma schema
const ROLES = [
    { value: 'META_ADMIN', label: 'Meta Admin', color: 'bg-red-500/10 text-red-500 border-red-500/20', description: 'Platform Admin' },
    { value: 'PARTNER', label: 'Partner', color: 'bg-violet-500/10 text-violet-500 border-violet-500/20', description: 'Consultant' },
    { value: 'SPONSOR', label: 'Sponsor', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', description: 'Zarząd' },
    { value: 'PILOT', label: 'Pilot', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', description: 'COO' },
    { value: 'MANAGER', label: 'Manager', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', description: 'Manager Działu' },
    { value: 'EXPERT', label: 'Expert', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20', description: 'Właściciel Wiedzy' },
    { value: 'CITIZEN_DEV', label: 'Citizen Dev', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', description: 'Citizen Dev' },
] as const;

type UserRole = typeof ROLES[number]['value'];

interface UserData {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
    image: string | null;
    createdAt: string;
    updatedAt: string;
    organization?: { name: string };
    department?: { name: string } | null;
}

function getRoleBadge(role: string) {
    const found = ROLES.find(r => r.value === role);
    return found || ROLES[ROLES.length - 1];
}

// Sample data for MVP (no DB connection yet)
const SAMPLE_USERS: UserData[] = [
    {
        id: '1',
        name: 'Marcin Kapusta',
        email: 'marcin@syhi.pl',
        role: 'META_ADMIN',
        image: null,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2025-02-08T14:30:00Z',
        organization: { name: 'SYHI' },
        department: null,
    },
    {
        id: '2',
        name: 'Anna Kowalska',
        email: 'anna@example.com',
        role: 'MANAGER',
        image: null,
        createdAt: '2024-06-01T08:00:00Z',
        updatedAt: '2025-02-01T09:00:00Z',
        organization: { name: 'SYHI' },
        department: { name: 'Sprzedaż' },
    },
    {
        id: '3',
        name: 'Piotr Nowak',
        email: 'piotr@example.com',
        role: 'EXPERT',
        image: null,
        createdAt: '2024-09-10T12:00:00Z',
        updatedAt: '2025-01-20T16:00:00Z',
        organization: { name: 'SYHI' },
        department: { name: 'IT' },
    },
    {
        id: '4',
        name: 'Kasia Wiśniewska',
        email: 'kasia@example.com',
        role: 'CITIZEN_DEV',
        image: null,
        createdAt: '2025-01-05T09:00:00Z',
        updatedAt: '2025-02-06T11:00:00Z',
        organization: { name: 'SYHI' },
        department: { name: 'HR' },
    },
    {
        id: '5',
        name: 'Tomek Zieliński',
        email: 'tomek@example.com',
        role: 'PILOT',
        image: null,
        createdAt: '2024-03-20T14:00:00Z',
        updatedAt: '2025-02-07T10:00:00Z',
        organization: { name: 'SYHI' },
        department: null,
    },
];

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>(SAMPLE_USERS);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [editUser, setEditUser] = useState<UserData | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // New user form
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        role: 'CITIZEN_DEV' as UserRole,
    });

    // Filtered users
    const filteredUsers = users.filter(user => {
        const matchesSearch = !search ||
            user.name?.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Handlers
    const handleAddUser = () => {
        if (!newUser.name || !newUser.email) {
            toast.error('Wypełnij wszystkie pola');
            return;
        }

        const user: UserData = {
            id: `new-${Date.now()}`,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            image: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            organization: { name: 'SYHI' },
            department: null,
        };

        setUsers(prev => [...prev, user]);
        setAddDialogOpen(false);
        setNewUser({ name: '', email: '', role: 'CITIZEN_DEV' });
        toast.success(`Użytkownik ${user.name} dodany`);
    };

    const handleEditRole = (userId: string, newRole: UserRole) => {
        setUsers(prev =>
            prev.map(u =>
                u.id === userId
                    ? { ...u, role: newRole, updatedAt: new Date().toISOString() }
                    : u
            )
        );
        toast.success('Rola zmieniona');
        setEditDialogOpen(false);
    };

    const handleDelete = (userId: string) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
        setDeleteConfirm(null);
        toast.success('Użytkownik usunięty');
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // Stats
    const roleStats = ROLES.map(role => ({
        ...role,
        count: users.filter(u => u.role === role.value).length,
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-sky-500/20 p-3 border border-blue-500/20">
                        <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Użytkownicy</h1>
                        <p className="text-sm text-muted-foreground">
                            Zarządzanie kontami i rolami — {users.length} użytkowników
                        </p>
                    </div>
                </div>

                <Button
                    onClick={() => setAddDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Dodaj użytkownika
                </Button>
            </motion.div>

            {/* Role Stats Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-wrap gap-2"
            >
                <button
                    onClick={() => setRoleFilter('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${roleFilter === 'all'
                            ? 'bg-foreground text-background border-foreground'
                            : 'bg-card border-border text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Wszyscy ({users.length})
                </button>
                {roleStats.map(role => (
                    <button
                        key={role.value}
                        onClick={() => setRoleFilter(role.value)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${roleFilter === role.value
                                ? role.color + ' font-semibold'
                                : 'bg-card border-border text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {role.label} ({role.count})
                    </button>
                ))}
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="relative"
            >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Szukaj po imieniu lub emailu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </motion.div>

            {/* Users Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-xl border border-border bg-card overflow-hidden"
            >
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_200px_120px_120px_60px] gap-4 px-6 py-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <span>Użytkownik</span>
                    <span>Email</span>
                    <span>Rola</span>
                    <span>Ostatnia aktywność</span>
                    <span></span>
                </div>

                {/* Table Body */}
                {filteredUsers.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-sm text-muted-foreground">Brak użytkowników spełniających kryteria</p>
                    </div>
                ) : (
                    filteredUsers.map((user, index) => {
                        const roleBadge = getRoleBadge(user.role);
                        return (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="grid grid-cols-[1fr_200px_120px_120px_60px] gap-4 px-6 py-4 border-b border-border/50 hover:bg-muted/20 transition-colors items-center"
                            >
                                {/* User Info */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-sm font-semibold text-foreground">
                                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {user.name || 'Bez nazwy'}
                                        </p>
                                        {user.department && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Building2 className="h-3 w-3" />
                                                {user.department.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-center gap-1 text-sm text-muted-foreground truncate">
                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{user.email}</span>
                                </div>

                                {/* Role Badge */}
                                <Badge variant="outline" className={`${roleBadge.color} text-xs w-fit`}>
                                    <Shield className="h-3 w-3 mr-1" />
                                    {roleBadge.label}
                                </Badge>

                                {/* Last Activity */}
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(user.updatedAt)}
                                </div>

                                {/* Actions */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => {
                                            setEditUser(user);
                                            setEditDialogOpen(true);
                                        }}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Zmień rolę
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => setDeleteConfirm(user.id)}
                                            className="text-red-500 focus:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Usuń konto
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </motion.div>
                        );
                    })
                )}
            </motion.div>

            {/* Add User Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Dodaj użytkownika</DialogTitle>
                        <DialogDescription>
                            Utwórz nowe konto w systemie VantageOS.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="add-name">Imię i nazwisko</Label>
                            <Input
                                id="add-name"
                                placeholder="Jan Kowalski"
                                value={newUser.name}
                                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="add-email">Email</Label>
                            <Input
                                id="add-email"
                                type="email"
                                placeholder="jan@firma.pl"
                                value={newUser.email}
                                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Rola</Label>
                            <Select
                                value={newUser.role}
                                onValueChange={(val) => setNewUser(prev => ({ ...prev, role: val as UserRole }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLES.map(role => (
                                        <SelectItem key={role.value} value={role.value}>
                                            <span className="flex items-center gap-2">
                                                {role.label}
                                                <span className="text-muted-foreground text-xs">— {role.description}</span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                            Anuluj
                        </Button>
                        <Button onClick={handleAddUser}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Dodaj
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Role Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Zmień rolę</DialogTitle>
                        <DialogDescription>
                            {editUser?.name} ({editUser?.email})
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        {ROLES.map(role => (
                            <button
                                key={role.value}
                                onClick={() => editUser && handleEditRole(editUser.id, role.value)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${editUser?.role === role.value
                                        ? role.color + ' border-current'
                                        : 'border-border hover:bg-muted/50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Shield className="h-4 w-4" />
                                    <div className="text-left">
                                        <p className="text-sm font-medium">{role.label}</p>
                                        <p className="text-xs text-muted-foreground">{role.description}</p>
                                    </div>
                                </div>
                                {editUser?.role === role.value && (
                                    <Check className="h-4 w-4" />
                                )}
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-red-500">Usunąć konto?</DialogTitle>
                        <DialogDescription>
                            Tej operacji nie można cofnąć. Użytkownik straci dostęp do systemu.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                            Anuluj
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Usuń
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
