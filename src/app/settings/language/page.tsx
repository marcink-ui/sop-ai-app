'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const languages = [
    {
        code: 'pl',
        name: 'Polski',
        nativeName: 'Polski',
        flag: '🇵🇱',
        description: 'Interfejs użytkownika w języku polskim'
    },
    {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇬🇧',
        description: 'User interface in English'
    }
];

export default function LanguageSettingsPage() {
    const [selectedLanguage, setSelectedLanguage] = useState('pl');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate save - in real app would update next-intl locale
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsSaving(false);
        toast.success(
            selectedLanguage === 'pl'
                ? 'Język został zmieniony na Polski'
                : 'Language changed to English'
        );
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <Link href="/settings">
                        <Button variant="ghost" size="icon" className="hover:bg-muted">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Język / Language</h1>
                        <p className="text-sm text-muted-foreground">Wybierz język interfejsu / Choose interface language</p>
                    </div>
                </div>
            </motion.div>

            {/* Language Options */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-3"
            >
                {languages.map((lang) => {
                    const isSelected = selectedLanguage === lang.code;

                    return (
                        <button
                            key={lang.code}
                            onClick={() => setSelectedLanguage(lang.code)}
                            className={cn(
                                'w-full rounded-xl border p-5 text-left transition-all duration-300',
                                isSelected
                                    ? 'border-violet-500/50 bg-violet-500/5'
                                    : 'border-border bg-card/50 hover:border-violet-500/30'
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{lang.flag}</span>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">{lang.nativeName}</h3>
                                        <p className="text-sm text-muted-foreground">{lang.description}</p>
                                    </div>
                                </div>
                                <div className={cn(
                                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                                    isSelected
                                        ? 'border-violet-500 bg-violet-500'
                                        : 'border-muted-foreground'
                                )}>
                                    {isSelected && <Check className="h-4 w-4 text-white" />}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </motion.div>

            {/* Save Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-violet-600 hover:bg-violet-700"
                >
                    {isSaving
                        ? (selectedLanguage === 'pl' ? 'Zapisywanie...' : 'Saving...')
                        : (selectedLanguage === 'pl' ? 'Zapisz język' : 'Save language')
                    }
                </Button>
            </motion.div>

            {/* Info Note */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="rounded-xl border border-border bg-muted/20 p-4"
            >
                <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">
                            {selectedLanguage === 'pl' ? 'Uwaga' : 'Note'}
                        </p>
                        <p>
                            {selectedLanguage === 'pl'
                                ? 'Zmiana języka wpływa tylko na interfejs użytkownika. Treści SOPs i innych danych pozostają w oryginalnym języku.'
                                : 'Language change affects only the user interface. Content of SOPs and other data remains in the original language.'
                            }
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
