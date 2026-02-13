'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    Shield,
    Building2,
    Mail,
    Copy,
    Check,
    X,
    Loader2,
    ArrowLeft,
    Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// ─── Types ────────────────────────────────────────────────────
interface UserData {
    id: string;
    name: string | null;
    email: string;
    role: string;
    emailVerified: string | null;
    createdAt: string;
    organization: { id: string; name: string; slug: string } | null;
    department: { id: string; name: string } | null;
}

interface OrgData {
    id: string;
    name: string;
    slug: string;
}

interface DeptData {
    id: string;
    name: string;
}

const ROLES = [
    { value: 'META_ADMIN', label: 'Meta Admin', color: 'bg-red-500/20 text-red-400' },
    { value: 'PARTNER', label: 'Partner', color: 'bg-violet-500/20 text-violet-400' },
    { value: 'SPONSOR', label: 'Sponsor (Zarząd)', color: 'bg-amber-500/20 text-amber-400' },
    { value: 'PILOT', label: 'Pilot (COO)', color: 'bg-sky-500/20 text-sky-400' },
    { value: 'MANAGER', label: 'Manager Działu', color: 'bg-blue-500/20 text-blue-400' },
    { value: 'EXPERT', label: 'Expert', color: 'bg-emerald-500/20 text-emerald-400' },
    { value: 'CITIZEN_DEV', label: 'Citizen Dev', color: 'bg-gray-500/20 text-gray-400' },
];

// Higher roles don't need company selection — they go to SYHI org
const SYHI_ROLES = ['META_ADMIN', 'PARTNER'];
// Roles that require picking an organization
const ORG_REQUIRED_ROLES = ['SPONSOR', 'PILOT', 'MANAGER', 'EXPERT', 'CITIZEN_DEV'];
// Roles that require a department
const DEPT_REQUIRED_ROLES = ['MANAGER'];

function getRoleBadge(role: string) {
    const r = ROLES.find(r => r.value === role);
    return r ? <Badge className={r.color}>{r.label}</Badge> : <Badge>{role}</Badge>;
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [organizations, setOrganizations] = useState<OrgData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // Dialog state
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [tempPasswordDialog, setTempPasswordDialog] = useState<{ open: boolean; password: string; userName: string }>({
        open: false,
        password: '',
        userName: '',
    });
    const [copied, setCopied] = useState(false);

    // Form state
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formRole, setFormRole] = useState('CITIZEN_DEV');
    const [formOrgId, setFormOrgId] = useState('');
    const [formDeptId, setFormDeptId] = useState('');
    const [departments, setDepartments] = useState<DeptData[]>([]);
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // ─── Data Fetching ────────────────────────────────────────
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (roleFilter) params.set('role', roleFilter);
            const res = await fetch(`/api/admin/users?${params}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
                setOrganizations(data.organizations || []);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setIsLoading(false);
        }
    }, [search, roleFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Fetch departments when org changes
    const fetchDepartments = async (orgId: string) => {
        if (!orgId) {
            setDepartments([]);
            return;
        }
        try {
            const res = await fetch(`/api/departments?organizationId=${orgId}`);
            if (res.ok) {
                const data = await res.json();
                setDepartments(data.departments || []);
            }
        } catch {
            setDepartments([]);
        }
    };

    // ─── SYHI org helper ──────────────────────────────────────
    const syhiOrg = organizations.find(o =>
        o.slug === 'syhi-digital' || o.name.toLowerCase().includes('syhi')
    );

    // ─── Create User ──────────────────────────────────────────
    const handleCreate = async () => {
        setFormError('');

        if (!formName.trim() || !formEmail.trim()) {
            setFormError('Imię i email są wymagane');
            return;
        }

        // Determine organizationId
        let orgId = formOrgId;
        if (SYHI_ROLES.includes(formRole)) {
            orgId = syhiOrg?.id || formOrgId;
        }

        if (!orgId) {
            setFormError('Wybierz organizację');
            return;
        }

        if (DEPT_REQUIRED_ROLES.includes(formRole) && !formDeptId) {
            setFormError('Rola MANAGER wymaga przypisania do działu');
            return;
        }

        setFormLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formName.trim(),
                    email: formEmail.trim().toLowerCase(),
                    role: formRole,
                    organizationId: orgId,
                    departmentId: formDeptId || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setFormError(data.error || 'Błąd tworzenia użytkownika');
                return;
            }

            setCreateOpen(false);
            resetForm();
            fetchUsers();

            // Show temp password dialog
            setTempPasswordDialog({
                open: true,
                password: data.tempPassword,
                userName: data.user.name,
            });
        } catch {
            setFormError('Błąd połączenia z serwerem');
        } finally {
            setFormLoading(false);
        }
    };

    // ─── Edit User ────────────────────────────────────────────
    const openEditDialog = (user: UserData) => {
        setSelectedUser(user);
        setFormName(user.name || '');
        setFormRole(user.role);
        setFormOrgId(user.organization?.id || '');
        setFormDeptId(user.department?.id || '');
        setFormError('');
        if (user.organization?.id) {
            fetchDepartments(user.organization.id);
        }
        setEditOpen(true);
    };

    const handleEdit = async () => {
        if (!selectedUser) return;
        setFormError('');
        setFormLoading(true);

        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    name: formName.trim(),
                    role: formRole,
                    organizationId: formOrgId || undefined,
                    departmentId: formDeptId || undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setFormError(data.error || 'Błąd edycji użytkownika');
                return;
            }

            setEditOpen(false);
            resetForm();
            fetchUsers();
        } catch {
            setFormError('Błąd połączenia z serwerem');
        } finally {
            setFormLoading(false);
        }
    };

    // ─── Delete User ──────────────────────────────────────────
    const handleDelete = async () => {
        if (!selectedUser) return;
        setFormLoading(true);

        try {
            const res = await fetch(`/api/admin/users?userId=${selectedUser.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setDeleteOpen(false);
                setSelectedUser(null);
                fetchUsers();
            }
        } catch {
            console.error('Failed to delete user');
        } finally {
            setFormLoading(false);
        }
    };

    // ─── Helpers ──────────────────────────────────────────────
    const resetForm = () => {
        setFormName('');
        setFormEmail('');
        setFormRole('CITIZEN_DEV');
        setFormOrgId('');
        setFormDeptId('');
        setFormError('');
        setDepartments([]);
        setSelectedUser(null);
    };

    const copyPassword = () => {
        navigator.clipboard.writeText(tempPasswordDialog.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Role determines required fields
    const showOrgSelect = ORG_REQUIRED_ROLES.includes(formRole);
    const showDeptSelect = formRole === 'MANAGER' || formRole === 'EXPERT' || formRole === 'CITIZEN_DEV';
    const emailHint = formRole === 'META_ADMIN' ? 'Wymagany email @syhidigital.com' : '';

    // ─── Render ───────────────────────────────────────────────
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/admin-panel')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg"
                    >
                        <Users className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Zarządzanie Użytkownikami</h1>
                        <p className="text-sm text-muted-foreground">{users.length} użytkowników na platformie</p>
                    </div>
                </div>
                <Button className="btn-primary" onClick={() => { resetForm(); setCreateOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nowy użytkownik
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj po nazwie lub emailu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card border-border"
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-48 bg-card border-border">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Wszystkie role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Wszystkie role</SelectItem>
                        {ROLES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="theme-card overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-card">
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Użytkownik</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Rola</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Organizacja</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Dział</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin opacity-50" />
                                    <p className="mt-2">Ładowanie użytkowników...</p>
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                    <Users className="mx-auto mb-3 h-12 w-12 opacity-20" />
                                    <p>Brak użytkowników</p>
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="border-b border-border transition-colors hover:bg-muted/50 last:border-0">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold uppercase text-muted-foreground">
                                                {(user.name || user.email)[0]}
                                            </div>
                                            <span className="font-medium text-foreground">{user.name || '—'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-muted-foreground">{user.email}</td>
                                    <td className="px-4 py-4">{getRoleBadge(user.role)}</td>
                                    <td className="px-4 py-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Building2 className="h-3 w-3" />
                                            {user.organization?.name || '—'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-muted-foreground">
                                        {user.department?.name || '—'}
                                    </td>
                                    <td className="px-4 py-4">
                                        {user.emailVerified ? (
                                            <Badge className="bg-green-500/20 text-green-400">Aktywny</Badge>
                                        ) : (
                                            <Badge className="bg-amber-500/20 text-amber-400">Nowe konto</Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-400 hover:text-red-300"
                                                onClick={() => { setSelectedUser(user); setDeleteOpen(true); }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ──────────── CREATE DIALOG ──────────── */}
            <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-md bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-amber-400" />
                            Nowy użytkownik
                        </DialogTitle>
                        <DialogDescription>
                            Formularz zależy od wybranej roli. Hasło zostanie wygenerowane automatycznie.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {formError && (
                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                                {formError}
                            </div>
                        )}

                        {/* Role selector — first, because it changes the form */}
                        <div className="space-y-2">
                            <Label>Rola *</Label>
                            <Select value={formRole} onValueChange={(v) => {
                                setFormRole(v);
                                setFormDeptId('');
                                if (SYHI_ROLES.includes(v)) {
                                    setFormOrgId(syhiOrg?.id || '');
                                } else {
                                    setFormOrgId('');
                                }
                            }}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLES.map(r => (
                                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label>Imię i nazwisko *</Label>
                            <Input
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="Jan Kowalski"
                                className="bg-background border-border"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label>Email *</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="email"
                                    value={formEmail}
                                    onChange={(e) => setFormEmail(e.target.value)}
                                    placeholder={formRole === 'META_ADMIN' ? 'jan@syhidigital.com' : 'jan@firma.pl'}
                                    className="pl-9 bg-background border-border"
                                />
                            </div>
                            {emailHint && (
                                <p className="text-xs text-amber-400">{emailHint}</p>
                            )}
                        </div>

                        {/* Organization — for SYHI roles, show as readonly */}
                        {SYHI_ROLES.includes(formRole) && syhiOrg && (
                            <div className="space-y-2">
                                <Label>Organizacja</Label>
                                <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span>{syhiOrg.name}</span>
                                    <Badge className="ml-auto bg-blue-500/20 text-blue-400 text-xs">Auto</Badge>
                                </div>
                                {formRole === 'PARTNER' && (
                                    <p className="text-xs text-muted-foreground">
                                        Firmy klientów przypisz osobno w Portalu Partnera
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Organization — for lower roles, select */}
                        {showOrgSelect && (
                            <div className="space-y-2">
                                <Label>Organizacja *</Label>
                                <Select value={formOrgId} onValueChange={(v) => {
                                    setFormOrgId(v);
                                    setFormDeptId('');
                                    fetchDepartments(v);
                                }}>
                                    <SelectTrigger className="bg-background border-border">
                                        <SelectValue placeholder="Wybierz firmę..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {organizations.map(org => (
                                            <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Department — for applicable roles */}
                        {showDeptSelect && formOrgId && (
                            <div className="space-y-2">
                                <Label>
                                    Dział {DEPT_REQUIRED_ROLES.includes(formRole) ? '*' : '(opcjonalnie)'}
                                </Label>
                                {departments.length > 0 ? (
                                    <Select value={formDeptId} onValueChange={setFormDeptId}>
                                        <SelectTrigger className="bg-background border-border">
                                            <SelectValue placeholder="Wybierz dział..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map(dept => (
                                                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Brak działów w tej organizacji
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm(); }}>
                            Anuluj
                        </Button>
                        <Button onClick={handleCreate} disabled={formLoading} className="btn-primary">
                            {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Utwórz użytkownika
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ──────────── EDIT DIALOG ──────────── */}
            <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-md bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5 text-blue-400" />
                            Edytuj użytkownika
                        </DialogTitle>
                        <DialogDescription>
                            {selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {formError && (
                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                                {formError}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Imię i nazwisko</Label>
                            <Input
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                className="bg-background border-border"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Rola</Label>
                            <Select value={formRole} onValueChange={(v) => {
                                setFormRole(v);
                                if (SYHI_ROLES.includes(v)) {
                                    setFormOrgId(syhiOrg?.id || '');
                                }
                            }}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLES.map(r => (
                                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {ORG_REQUIRED_ROLES.includes(formRole) && (
                            <div className="space-y-2">
                                <Label>Organizacja</Label>
                                <Select value={formOrgId} onValueChange={(v) => {
                                    setFormOrgId(v);
                                    setFormDeptId('');
                                    fetchDepartments(v);
                                }}>
                                    <SelectTrigger className="bg-background border-border">
                                        <SelectValue placeholder="Wybierz firmę..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {organizations.map(org => (
                                            <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {(formRole === 'MANAGER' || formRole === 'EXPERT' || formRole === 'CITIZEN_DEV') && formOrgId && (
                            <div className="space-y-2">
                                <Label>
                                    Dział {formRole === 'MANAGER' ? '*' : '(opcjonalnie)'}
                                </Label>
                                {departments.length > 0 ? (
                                    <Select value={formDeptId} onValueChange={setFormDeptId}>
                                        <SelectTrigger className="bg-background border-border">
                                            <SelectValue placeholder="Wybierz dział..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map(dept => (
                                                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="text-xs text-muted-foreground">Brak działów w tej organizacji</p>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setEditOpen(false); resetForm(); }}>
                            Anuluj
                        </Button>
                        <Button onClick={handleEdit} disabled={formLoading} className="btn-primary">
                            {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Zapisz zmiany
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ──────────── DELETE CONFIRM ──────────── */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-sm bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-400">
                            <Trash2 className="h-5 w-5" />
                            Potwierdź usunięcie
                        </DialogTitle>
                        <DialogDescription>
                            Czy na pewno chcesz usunąć użytkownika <strong>{selectedUser?.name || selectedUser?.email}</strong>? Tej operacji nie można cofnąć.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                            Anuluj
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={formLoading}
                        >
                            {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Usuń użytkownika
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ──────────── TEMP PASSWORD DIALOG ──────────── */}
            <Dialog open={tempPasswordDialog.open} onOpenChange={(open) => setTempPasswordDialog(prev => ({ ...prev, open }))}>
                <DialogContent className="sm:max-w-sm bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-400">
                            <Check className="h-5 w-5" />
                            Użytkownik utworzony!
                        </DialogTitle>
                        <DialogDescription>
                            Przekaż poniższe hasło tymczasowe użytkownikowi <strong>{tempPasswordDialog.userName}</strong>. Po pierwszym logowaniu powinien je zmienić.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-4">
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
                            <code className="flex-1 text-lg font-mono font-bold text-foreground tracking-wider">
                                {tempPasswordDialog.password}
                            </code>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyPassword}
                                className="shrink-0"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-green-400" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            className="w-full btn-primary"
                            onClick={() => setTempPasswordDialog({ open: false, password: '', userName: '' })}
                        >
                            Rozumiem, zamknij
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
