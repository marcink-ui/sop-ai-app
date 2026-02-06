'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Bot, AlertTriangle, Users, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface DelegationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    nodeData?: {
        id: string;
        label: string;
        type: string;
    };
    currentUserRole: 'SPONSOR' | 'PILOT' | 'MANAGER' | 'EXPERT' | 'CITIZEN_DEV';
}

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
}

// Role hierarchy for delegation permissions
const roleHierarchy: Record<string, number> = {
    SPONSOR: 5,
    PILOT: 4,
    MANAGER: 3,
    EXPERT: 2,
    CITIZEN_DEV: 1,
};

const elementTypes = [
    { value: 'sop', label: 'Nowe SOP', Icon: FileText, color: 'text-emerald-500' },
    { value: 'agent', label: 'Nowy Agent AI', Icon: Bot, color: 'text-purple-500' },
    { value: 'muda', label: 'Raport MUDA', Icon: AlertTriangle, color: 'text-amber-500' },
    { value: 'role', label: 'Nowa Rola', Icon: Users, color: 'text-blue-500' },
];

export function DelegationModal({
    open,
    onOpenChange,
    nodeData,
    currentUserRole,
}: DelegationModalProps) {
    const [elementType, setElementType] = useState<string>('sop');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState<string>('');
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Fetch team members for delegation
    useEffect(() => {
        const fetchTeamMembers = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/users/team');
                if (response.ok) {
                    const data = await response.json();
                    setTeamMembers(data.members || []);
                }
            } catch (error) {
                console.error('Failed to fetch team members:', error);
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            fetchTeamMembers();
            // Pre-fill title from node if available
            if (nodeData?.label) {
                setTitle(nodeData.label);
            }
        }
    }, [open, nodeData]);

    // All team members are eligible for delegation
    // Delegation can be done to any role (including lower roles like regular employees)
    const eligibleMembers = teamMembers;

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error('Tytuł jest wymagany');
            return;
        }

        if (!assigneeId) {
            toast.error('Wybierz osobę odpowiedzialną');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch('/api/value-chain/delegate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    elementType,
                    title: title.trim(),
                    description: description.trim(),
                    assigneeId,
                    nodeId: nodeData?.id,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create delegation');
            }

            const result = await response.json();
            toast.success('Zadanie zostało delegowane', {
                description: `Utworzono wniosek #${result.requestId}`,
            });

            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error('Delegation error:', error);
            toast.error('Nie udało się delegować zadania');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setElementType('sop');
        setTitle('');
        setDescription('');
        setAssigneeId('');
    };

    const selectedType = elementTypes.find((t) => t.value === elementType);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Deleguj Zadanie
                    </DialogTitle>
                    <DialogDescription>
                        Deleguj tworzenie nowego elementu do członka zespołu. Utworzy to wniosek w
                        systemie Rady.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Element Type */}
                    <div className="space-y-2">
                        <Label>Typ elementu</Label>
                        <div className="flex flex-wrap gap-2">
                            {elementTypes.map((type) => (
                                <Badge
                                    key={type.value}
                                    variant={elementType === type.value ? 'default' : 'outline'}
                                    className="cursor-pointer transition-colors px-3 py-1.5"
                                    onClick={() => setElementType(type.value)}
                                >
                                    <type.Icon className={`h-3.5 w-3.5 mr-1.5 ${type.color}`} />
                                    {type.label}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Tytuł zadania</Label>
                        <Input
                            id="title"
                            placeholder={`np. "${selectedType?.label} dla procesu fakturowania"`}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Opis (opcjonalny)</Label>
                        <Textarea
                            id="description"
                            placeholder="Dodatkowe informacje i kontekst..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Assignee */}
                    <div className="space-y-2">
                        <Label>Przypisz do</Label>
                        {loading ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Ładowanie zespołu...</span>
                            </div>
                        ) : (
                            <Select value={assigneeId} onValueChange={setAssigneeId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Wybierz osobę odpowiedzialną" />
                                </SelectTrigger>
                                <SelectContent>
                                    {eligibleMembers.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            Brak dostępnych osób
                                        </div>
                                    ) : (
                                        eligibleMembers.map((member) => (
                                            <SelectItem key={member.id} value={member.id}>
                                                <div className="flex items-center gap-2">
                                                    <span>{member.name}</span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {member.role}
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Wybierz osobę z zespołu odpowiedzialną za realizację.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Anuluj
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Deleguj zadanie
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
