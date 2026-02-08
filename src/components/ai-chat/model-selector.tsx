'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles,
    Zap,
    Brain,
    ChevronDown,
    Lock,
    Check,
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

// Model definitions
export interface AIModel {
    id: string;
    name: string;
    provider: 'openai' | 'anthropic' | 'google';
    description: string;
    icon: typeof Sparkles;
    color: string;
    allowedRoles: string[];
    isDefault?: boolean;
}

export const AI_MODELS: AIModel[] = [
    {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'google',
        description: 'Szybki i wszechstronny',
        icon: Zap,
        color: 'text-blue-500',
        allowedRoles: ['EXPLORER', 'CITIZEN_DEV', 'MANAGER', 'PILOT', 'SPONSOR'],
        isDefault: true,
    },
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        description: 'Zaawansowane rozumowanie',
        icon: Sparkles,
        color: 'text-emerald-500',
        allowedRoles: ['CITIZEN_DEV', 'MANAGER', 'PILOT', 'SPONSOR'],
    },
    {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        description: 'Najlepszy do kodowania',
        icon: Brain,
        color: 'text-purple-500',
        allowedRoles: ['PILOT', 'SPONSOR'],
    },
];

// Props
interface ModelSelectorProps {
    currentModel: string;
    onModelChange: (model: AIModel) => void;
    userRole: string;
    disabled?: boolean;
    className?: string;
}

// Helper function
export const getDefaultModel = (): AIModel => {
    return AI_MODELS.find((m) => m.isDefault) || AI_MODELS[0];
};

export const getModelById = (id: string): AIModel | undefined => {
    return AI_MODELS.find((m) => m.id === id);
};

export const getAvailableModels = (userRole: string): AIModel[] => {
    return AI_MODELS.filter((model) => model.allowedRoles.includes(userRole));
};

// Main Component
export function ModelSelector({
    currentModel,
    onModelChange,
    userRole,
    disabled = false,
    className,
}: ModelSelectorProps) {
    const [open, setOpen] = useState(false);

    const availableModels = getAvailableModels(userRole);
    const selectedModel = getModelById(currentModel) || getDefaultModel();
    const Icon = selectedModel.icon;

    const handleSelect = useCallback(
        (model: AIModel) => {
            onModelChange(model);
            setOpen(false);
        },
        [onModelChange]
    );

    const isModelAvailable = (model: AIModel) => {
        return model.allowedRoles.includes(userRole);
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
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
                                <Icon className={cn('h-4 w-4', selectedModel.color)} />
                                <span className="hidden sm:inline text-xs font-medium">
                                    {selectedModel.name}
                                </span>
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Wybierz model AI</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Dostępne modele ({availableModels.length}/{AI_MODELS.length})
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {AI_MODELS.map((model) => {
                    const ModelIcon = model.icon;
                    const available = isModelAvailable(model);
                    const isSelected = currentModel === model.id;

                    return (
                        <DropdownMenuItem
                            key={model.id}
                            disabled={!available}
                            onClick={() => available && handleSelect(model)}
                            className={cn(
                                'flex items-center gap-3 cursor-pointer',
                                !available && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <ModelIcon className={cn('h-4 w-4', model.color)} />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                        {model.name}
                                    </span>
                                    {model.isDefault && (
                                        <Badge
                                            variant="secondary"
                                            className="text-[10px] px-1 py-0"
                                        >
                                            Default
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {model.description}
                                </span>
                            </div>

                            {!available ? (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                            ) : isSelected ? (
                                <Check className="h-4 w-4 text-primary" />
                            ) : null}
                        </DropdownMenuItem>
                    );
                })}

                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                    <p className="text-[10px] text-muted-foreground">
                        🔒 Niektóre modele wymagają wyższych uprawnień
                    </p>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Hook for model state management
export function useModelSelector(userRole: string) {
    const defaultModel = getDefaultModel();
    const [currentModel, setCurrentModel] = useState(defaultModel.id);

    const handleModelChange = useCallback((model: AIModel) => {
        setCurrentModel(model.id);
    }, []);

    const selectedModel = getModelById(currentModel) || defaultModel;
    const availableModels = getAvailableModels(userRole);

    return {
        currentModel,
        selectedModel,
        availableModels,
        handleModelChange,
    };
}
