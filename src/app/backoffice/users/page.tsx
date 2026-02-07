'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Plus,
    Search,
    ChevronLeft,
    MoreHorizontal,
    Edit,
    Trash2,
    Shield,
    Mail,
    CheckCircle2,
    XCircle,
    UserCog,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// Sample data
const users = [
    {
        id: '1',
        name: 'Marcin Kapusta',
        email: 'marcin@syhi.pl',
        role: 'SPONSOR',
        department: 'Zarząd',
        status: 'active',
        lastActive: '2 min temu',
        avatar: null,
    },
    {
        id: '2',
        name: 'Anna Kowalska',
        email: 'anna@syhi.pl',
        role: 'MANAGER',
        department: 'Operacje',
        status: 'active',
        lastActive: '1 godz. temu',
        avatar: null,
    },
    {
        id: '3',
        name: 'Jan Nowak',
        email: 'jan@syhi.pl',
        role: 'EMPLOYEE',
        department: 'IT',
        status: 'inactive',
        lastActive: '3 dni temu',
        avatar: null,
    },
];

const roleColors: Record<string, string> = {
    SPONSOR: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400',
    MANAGER: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    EMPLOYEE: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-400',
};

export default function UsersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/backoffice">
                    <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                        <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Użytkownicy</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Zarządzaj kontami i rolami
                        </p>
                    </div>
                </div>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                        placeholder="Szukaj użytkownika..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj użytkownika
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-white/50 dark:bg-neutral-900/50">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {users.filter(u => u.status === 'active').length}
                        </div>
                        <div className="text-sm text-neutral-500">Aktywni</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/50 dark:bg-neutral-900/50">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                            {users.filter(u => u.role === 'SPONSOR').length}
                        </div>
                        <div className="text-sm text-neutral-500">Sponsorzy</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/50 dark:bg-neutral-900/50">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {users.filter(u => u.role === 'MANAGER').length}
                        </div>
                        <div className="text-sm text-neutral-500">Managerowie</div>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card className="bg-white dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-neutral-200 dark:border-neutral-800">
                            <TableHead className="text-neutral-500">Użytkownik</TableHead>
                            <TableHead className="text-neutral-500">Rola</TableHead>
                            <TableHead className="text-neutral-500">Dział</TableHead>
                            <TableHead className="text-neutral-500">Status</TableHead>
                            <TableHead className="text-neutral-500">Ostatnia aktywność</TableHead>
                            <TableHead className="text-right text-neutral-500">Akcje</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user, index) => (
                            <motion.tr
                                key={user.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800 text-neutral-600 dark:text-neutral-300 text-sm">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-neutral-900 dark:text-white">
                                                {user.name}
                                            </div>
                                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={cn('font-medium', roleColors[user.role])}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-neutral-600 dark:text-neutral-400">
                                    {user.department}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        {user.status === 'active' ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                <span className="text-emerald-600 dark:text-emerald-400">Aktywny</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-4 w-4 text-neutral-400" />
                                                <span className="text-neutral-500">Nieaktywny</span>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-neutral-500 dark:text-neutral-400">
                                    {user.lastActive}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edytuj
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <UserCog className="h-4 w-4 mr-2" />
                                                Zmień rolę
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Mail className="h-4 w-4 mr-2" />
                                                Wyślij email
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Usuń
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </motion.tr>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {filteredUsers.length === 0 && (
                <Card className="bg-neutral-50 dark:bg-neutral-900/30 border-dashed">
                    <CardContent className="py-12 text-center">
                        <Users className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                        <h3 className="font-medium text-neutral-900 dark:text-white mb-1">
                            Brak użytkowników
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Nie znaleziono użytkowników pasujących do zapytania
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
