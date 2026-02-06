'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface Option {
    label: string;
    value: string;
}

interface CreatableComboboxProps {
    options: Option[];
    value?: string;
    onChange: (value: string) => void;
    onCreate?: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function CreatableCombobox({
    options,
    value,
    onChange,
    onCreate,
    placeholder = 'Select option...',
    className,
}: CreatableComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');

    const selectedOption = options.find((option) => option.value === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('w-full justify-between', className)}
                >
                    {selectedOption ? selectedOption.label : value || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder={`Search ${placeholder.toLowerCase()}...`}
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {onCreate && inputValue ? (
                                <div className="p-1">
                                    <p className="p-2 text-sm text-muted-foreground">
                                        No matching option found.
                                    </p>
                                    <Button
                                        variant="secondary"
                                        className="w-full justify-start h-8"
                                        onClick={() => {
                                            onCreate(inputValue);
                                            onChange(inputValue);
                                            setOpen(false);
                                            setInputValue('');
                                        }}
                                    >
                                        <Plus className="mr-2 h-3 w-3" />
                                        Create "{inputValue}"
                                    </Button>
                                </div>
                            ) : (
                                "No option found."
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={(currentValue) => {
                                        // We select by label in CommandItem but want to return the value
                                        // Or if values are same as labels, it works.
                                        // Ideally we match back to the option.
                                        const matchedOption = options.find(o => o.label.toLowerCase() === currentValue.toLowerCase());
                                        onChange(matchedOption ? matchedOption.value : currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            value === option.value ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
