'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    SlidersHorizontal,
    RotateCcw,
    Info,
    Thermometer,
    Hash,
    Layers,
    Zap,
    MessageSquare,
} from 'lucide-react';

// ============================================
// Types
// ============================================

export interface ModelParameters {
    temperature: number;
    topP: number;
    topK: number;
    maxTokens: number;
    frequencyPenalty: number;
    presencePenalty: number;
    streamResponse: boolean;
    seed?: number;
}

export interface ModelParameterSlidersProps {
    /** Current parameter values */
    parameters: ModelParameters;
    /** Called when parameters change */
    onChange: (params: ModelParameters) => void;
    /** Show as popover or inline */
    variant?: 'popover' | 'inline';
    /** Show advanced parameters */
    showAdvanced?: boolean;
    /** Additional CSS class */
    className?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Show only specific parameters */
    visibleParams?: (keyof ModelParameters)[];
}

// Default values for reset
const DEFAULT_PARAMETERS: ModelParameters = {
    temperature: 0.7,
    topP: 1.0,
    topK: 50,
    maxTokens: 4096,
    frequencyPenalty: 0,
    presencePenalty: 0,
    streamResponse: true,
    seed: undefined,
};

// Parameter metadata
const PARAM_INFO: Record<keyof ModelParameters, { label: string; description: string; icon: typeof Thermometer }> = {
    temperature: {
        label: 'Temperature',
        description: 'Controls randomness. Lower = more focused, higher = more creative.',
        icon: Thermometer,
    },
    topP: {
        label: 'Top P',
        description: 'Nucleus sampling. Controls diversity via cumulative probability.',
        icon: Layers,
    },
    topK: {
        label: 'Top K',
        description: 'Limits vocabulary to top K tokens for each step.',
        icon: Hash,
    },
    maxTokens: {
        label: 'Max Tokens',
        description: 'Maximum number of tokens in the response.',
        icon: MessageSquare,
    },
    frequencyPenalty: {
        label: 'Frequency Penalty',
        description: 'Reduces repetition by penalizing frequent tokens.',
        icon: Zap,
    },
    presencePenalty: {
        label: 'Presence Penalty',
        description: 'Reduces repetition by penalizing already-used tokens.',
        icon: Zap,
    },
    streamResponse: {
        label: 'Stream Response',
        description: 'Show response as it generates vs waiting for complete response.',
        icon: Zap,
    },
    seed: {
        label: 'Seed',
        description: 'Random seed for reproducible outputs.',
        icon: Hash,
    },
};

// ============================================
// Parameter Slider Component
// ============================================

interface ParamSliderProps {
    label: string;
    description: string;
    icon: typeof Thermometer;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    disabled?: boolean;
    showValue?: boolean;
    formatter?: (value: number) => string;
}

function ParamSlider({
    label,
    description,
    icon: Icon,
    value,
    onChange,
    min,
    max,
    step,
    disabled,
    showValue = true,
    formatter = (v) => v.toString(),
}: ParamSliderProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">{label}</Label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                                <p className="text-xs">{description}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                {showValue && (
                    <Badge variant="secondary" className="font-mono text-xs">
                        {formatter(value)}
                    </Badge>
                )}
            </div>
            <Slider
                value={[value]}
                onValueChange={([v]) => onChange(v)}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                className="w-full"
            />
        </div>
    );
}

// ============================================
// Parameters Panel (Inline)
// ============================================

interface ParametersPanelProps {
    parameters: ModelParameters;
    onChange: (params: ModelParameters) => void;
    showAdvanced?: boolean;
    disabled?: boolean;
    visibleParams?: (keyof ModelParameters)[];
}

function ParametersPanel({
    parameters,
    onChange,
    showAdvanced = false,
    disabled = false,
    visibleParams,
}: ParametersPanelProps) {
    const [showAdvancedSection, setShowAdvancedSection] = useState(showAdvanced);

    const updateParam = useCallback(
        <K extends keyof ModelParameters>(key: K, value: ModelParameters[K]) => {
            onChange({ ...parameters, [key]: value });
        },
        [parameters, onChange]
    );

    const handleReset = useCallback(() => {
        onChange(DEFAULT_PARAMETERS);
    }, [onChange]);

    const isVisible = (param: keyof ModelParameters) => {
        if (!visibleParams) return true;
        return visibleParams.includes(param);
    };

    return (
        <div className="space-y-4">
            {/* Basic Parameters */}
            <div className="space-y-4">
                {isVisible('temperature') && (
                    <ParamSlider
                        {...PARAM_INFO.temperature}
                        value={parameters.temperature}
                        onChange={(v) => updateParam('temperature', v)}
                        min={0}
                        max={2}
                        step={0.1}
                        disabled={disabled}
                        formatter={(v) => v.toFixed(1)}
                    />
                )}

                {isVisible('topP') && (
                    <ParamSlider
                        {...PARAM_INFO.topP}
                        value={parameters.topP}
                        onChange={(v) => updateParam('topP', v)}
                        min={0}
                        max={1}
                        step={0.05}
                        disabled={disabled}
                        formatter={(v) => v.toFixed(2)}
                    />
                )}

                {isVisible('maxTokens') && (
                    <ParamSlider
                        {...PARAM_INFO.maxTokens}
                        value={parameters.maxTokens}
                        onChange={(v) => updateParam('maxTokens', v)}
                        min={256}
                        max={16384}
                        step={256}
                        disabled={disabled}
                        formatter={(v) => v.toLocaleString()}
                    />
                )}
            </div>

            {/* Stream toggle */}
            {isVisible('streamResponse') && (
                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Stream Response</Label>
                    </div>
                    <Switch
                        checked={parameters.streamResponse}
                        onCheckedChange={(v) => updateParam('streamResponse', v)}
                        disabled={disabled}
                    />
                </div>
            )}

            {/* Advanced Section Toggle */}
            <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={() => setShowAdvancedSection(!showAdvancedSection)}
            >
                {showAdvancedSection ? 'Hide advanced' : 'Show advanced'}
            </Button>

            {/* Advanced Parameters */}
            {showAdvancedSection && (
                <div className="space-y-4 border-t pt-4">
                    {isVisible('topK') && (
                        <ParamSlider
                            {...PARAM_INFO.topK}
                            value={parameters.topK}
                            onChange={(v) => updateParam('topK', v)}
                            min={1}
                            max={100}
                            step={1}
                            disabled={disabled}
                        />
                    )}

                    {isVisible('frequencyPenalty') && (
                        <ParamSlider
                            {...PARAM_INFO.frequencyPenalty}
                            value={parameters.frequencyPenalty}
                            onChange={(v) => updateParam('frequencyPenalty', v)}
                            min={-2}
                            max={2}
                            step={0.1}
                            disabled={disabled}
                            formatter={(v) => v.toFixed(1)}
                        />
                    )}

                    {isVisible('presencePenalty') && (
                        <ParamSlider
                            {...PARAM_INFO.presencePenalty}
                            value={parameters.presencePenalty}
                            onChange={(v) => updateParam('presencePenalty', v)}
                            min={-2}
                            max={2}
                            step={0.1}
                            disabled={disabled}
                            formatter={(v) => v.toFixed(1)}
                        />
                    )}

                    {isVisible('seed') && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">Seed</Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-xs">
                                            <p className="text-xs">{PARAM_INFO.seed.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Input
                                type="number"
                                placeholder="Random"
                                value={parameters.seed ?? ''}
                                onChange={(e) =>
                                    updateParam(
                                        'seed',
                                        e.target.value ? parseInt(e.target.value) : undefined
                                    )
                                }
                                disabled={disabled}
                                className="font-mono"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Reset Button */}
            <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={handleReset}
                disabled={disabled}
            >
                <RotateCcw className="h-4 w-4" />
                Reset to defaults
            </Button>
        </div>
    );
}

// ============================================
// Main Model Parameter Sliders Component
// ============================================

export function ModelParameterSliders({
    parameters,
    onChange,
    variant = 'popover',
    showAdvanced = false,
    className,
    disabled = false,
    visibleParams,
}: ModelParameterSlidersProps) {
    if (variant === 'inline') {
        return (
            <div className={cn('p-4', className)}>
                <ParametersPanel
                    parameters={parameters}
                    onChange={onChange}
                    showAdvanced={showAdvanced}
                    disabled={disabled}
                    visibleParams={visibleParams}
                />
            </div>
        );
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn('h-8 w-8', className)}
                    disabled={disabled}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium">Model Parameters</h4>
                        <Badge variant="outline" className="text-xs">
                            temp: {parameters.temperature.toFixed(1)}
                        </Badge>
                    </div>
                    <ParametersPanel
                        parameters={parameters}
                        onChange={onChange}
                        showAdvanced={showAdvanced}
                        disabled={disabled}
                        visibleParams={visibleParams}
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}

// ============================================
// Sample Data Helper
// ============================================

export function getDefaultParameters(): ModelParameters {
    return { ...DEFAULT_PARAMETERS };
}

export default ModelParameterSliders;
