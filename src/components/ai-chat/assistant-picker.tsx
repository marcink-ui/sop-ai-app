'use client';

import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Bot,
    ChevronDown,
    Check,
    Sparkles,
    FileText,
    Target,
    BarChart3,
    Lightbulb,
    Users,
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

// System Agent Types
export interface SystemAgent {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
    icon: string;
    color: string;
    allowedRoles: string[];
    category: 'general' | 'sop' | 'analytics' | 'creative';
}

// Default system agents
export const DEFAULT_AGENTS: SystemAgent[] = [
    {
        id: 'default',
        name: 'VantageOS AI',
        description: 'Ogólny asystent systemu',
        systemPrompt: 'Jesteś VantageOS AI - pomocnym asystentem do zarządzania procesami biznesowymi.',
        icon: '🤖',
        color: 'bg-primary',
        allowedRoles: ['EXPLORER', 'CITIZEN_DEV', 'MANAGER', 'PILOT', 'SPONSOR'],
        category: 'general',
    },
    {
        id: 'sop-creator',
        name: 'SOP Creator',
        description: 'Specjalista tworzenia procedur',
        systemPrompt: 'Jesteś ekspertem w tworzeniu Standard Operating Procedures (SOP). Pomagasz użytkownikom dokumentować procesy biznesowe krok po kroku.',
        icon: '📋',
        color: 'bg-blue-500',
        allowedRoles: ['CITIZEN_DEV', 'MANAGER', 'PILOT', 'SPONSOR'],
        category: 'sop',
    },
    {
        id: 'muda-hunter',
        name: 'MUDA Hunter',
        description: 'Wykrywacz marnotrawstwa',
        systemPrompt: 'Jesteś ekspertem Lean Manufacturing. Analizujesz procesy pod kątem 8 typów MUDA (marnotrawstwa) i sugerujesz ulepszenia.',
        icon: '🎯',
        color: 'bg-orange-500',
        allowedRoles: ['MANAGER', 'PILOT', 'SPONSOR'],
        category: 'analytics',
    },
    {
        id: 'value-chain',
        name: 'Value Chain Mapper',
        description: 'Analiza łańcucha wartości',
        systemPrompt: 'Pomagasz mapować łańcuch wartości organizacji, identyfikować kluczowe procesy i punkty optymalizacji.',
        icon: '🔗',
        color: 'bg-emerald-500',
        allowedRoles: ['MANAGER', 'PILOT', 'SPONSOR'],
        category: 'analytics',
    },
    {
        id: 'kaizen-coach',
        name: 'Kaizen Coach',
        description: 'Mentor ciągłego doskonalenia',
        systemPrompt: 'Jesteś coachem metodologii Kaizen. Prowadzisz przez procesy ciągłego doskonalenia i pomagasz wdrażać małe, inkrementalne zmiany.',
        icon: '💡',
        color: 'bg-purple-500',
        allowedRoles: ['CITIZEN_DEV', 'MANAGER', 'PILOT', 'SPONSOR'],
        category: 'creative',
    },
];

// Get icon component from string
const getIconComponent = (iconName: string) => {
    const icons: Record<string, typeof Bot> = {
        bot: Bot,
        file: FileText,
        target: Target,
        chart: BarChart3,
        lightbulb: Lightbulb,
        users: Users,
        sparkles: Sparkles,
    };
    return icons[iconName.toLowerCase()] || Bot;
};

// Props
interface AssistantPickerProps {
    currentAssistant: SystemAgent | null;
    onAssistantSelect: (agent: SystemAgent) => void;
    userRole: string;
    agents?: SystemAgent[];
    disabled?: boolean;
    className?: string;
}

// Main Component
export function AssistantPicker({
    currentAssistant,
    onAssistantSelect,
    userRole,
    agents = DEFAULT_AGENTS,
    disabled = false,
    className,
}: AssistantPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const availableAgents = agents.filter((agent) =>
        agent.allowedRoles.includes(userRole)
    );

    const filteredAgents = availableAgents.filter(
        (agent) =>
            agent.name.toLowerCase().includes(search.toLowerCase()) ||
            agent.description.toLowerCase().includes(search.toLowerCase())
    );

    const groupedAgents = filteredAgents.reduce(
        (acc, agent) => {
            const category = agent.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(agent);
            return acc;
        },
        {} as Record<string, SystemAgent[]>
    );

    const categoryLabels: Record<string, string> = {
        general: 'Ogólne',
        sop: 'Procedury (SOP)',
        analytics: 'Analityka',
        creative: 'Kreatywne',
    };

    const handleSelect = useCallback(
        (agent: SystemAgent) => {
            onAssistantSelect(agent);
            setOpen(false);
            setSearch('');
        },
        [onAssistantSelect]
    );

    const selected = currentAssistant || availableAgents[0];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={disabled}
                                className={cn(
                                    'h-8 gap-2 px-3 text-muted-foreground',
                                    'hover:text-foreground hover:bg-muted/50',
                                    className
                                )}
                            >
                                <span className="text-sm">{selected?.icon || '🤖'}</span>
                                <span className="hidden sm:inline text-xs font-medium max-w-[100px] truncate">
                                    {selected?.name || 'Wybierz asystenta'}
                                </span>
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Wybierz asystenta AI</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <PopoverContent className="w-72 p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Szukaj asystenta..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        <CommandEmpty>
                            Nie znaleziono asystentów.
                        </CommandEmpty>

                        {Object.entries(groupedAgents).map(([category, categoryAgents]) => (
                            <CommandGroup
                                key={category}
                                heading={categoryLabels[category] || category}
                            >
                                {categoryAgents.map((agent) => (
                                    <CommandItem
                                        key={agent.id}
                                        value={agent.id}
                                        onSelect={() => handleSelect(agent)}
                                        className="flex items-center gap-3 cursor-pointer py-2"
                                    >
                                        <div
                                            className={cn(
                                                'flex items-center justify-center',
                                                'w-8 h-8 rounded-lg text-lg',
                                                agent.color,
                                                'text-white'
                                            )}
                                        >
                                            {agent.icon}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm">
                                                {agent.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {agent.description}
                                            </div>
                                        </div>

                                        {currentAssistant?.id === agent.id && (
                                            <Check className="h-4 w-4 text-primary" />
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

// Hook for assistant management
export function useAssistantPicker(userRole: string, agents: SystemAgent[] = DEFAULT_AGENTS) {
    const [currentAssistant, setCurrentAssistant] = useState<SystemAgent | null>(null);

    // Set default assistant based on role
    useEffect(() => {
        const available = agents.filter((a) => a.allowedRoles.includes(userRole));
        if (available.length > 0 && !currentAssistant) {
            setCurrentAssistant(available[0]);
        }
    }, [userRole, agents, currentAssistant]);

    const handleAssistantSelect = useCallback((agent: SystemAgent) => {
        setCurrentAssistant(agent);
    }, []);

    const getSystemPrompt = useCallback(() => {
        return currentAssistant?.systemPrompt || '';
    }, [currentAssistant]);

    return {
        currentAssistant,
        handleAssistantSelect,
        getSystemPrompt,
    };
}
