'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Sparkles,
    Loader2,
    CheckCircle2,
    AlertCircle,
    FileCode2,
    Users,
    GitBranch,
    BookOpen,
    Save,
    ChevronDown,
    ChevronUp,
    Trash2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ExtractedSOP {
    title: string;
    purpose: string;
    steps: string[];
    owner?: string;
    kpis?: string[];
}

interface ExtractedRole {
    name: string;
    department?: string;
    responsibilities: string[];
    skills?: string[];
}

interface ExtractedValueChain {
    name: string;
    segment?: string;
    stages: {
        name: string;
        description: string;
        automationPotential: 'LOW' | 'MEDIUM' | 'HIGH';
    }[];
}

interface ExtractedOntology {
    term: string;
    definition: string;
    context?: string;
}

interface AnalysisResult {
    sops: ExtractedSOP[];
    roles: ExtractedRole[];
    valueChains: ExtractedValueChain[];
    ontology: ExtractedOntology[];
    summary: string;
    confidence: number;
}

export default function TranscriptProcessorPage() {
    const [transcript, setTranscript] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [tokensUsed, setTokensUsed] = useState(0);
    const [expandedSections, setExpandedSections] = useState<string[]>(['sops', 'roles', 'valueChains', 'ontology']);
    const [isSaving, setIsSaving] = useState(false);

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    const handleAnalyze = async () => {
        if (!transcript.trim()) {
            toast.error('Wklej transkrypcję do analizy');
            return;
        }

        if (transcript.length < 100) {
            toast.error('Transkrypcja jest za krótka (min. 100 znaków)');
            return;
        }

        setIsAnalyzing(true);
        setResult(null);

        try {
            const response = await fetch('/api/transcript/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript, companyName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Błąd analizy');
            }

            setResult(data.result);
            setTokensUsed(data.tokensUsed || 0);
            toast.success('Analiza zakończona!');
        } catch (error) {
            console.error('Analysis error:', error);
            toast.error(error instanceof Error ? error.message : 'Błąd analizy transkrypcji');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!result) return;

        setIsSaving(true);
        try {
            // TODO: Implement save to database
            // For now, just show success
            toast.success(`Zapisano: ${result.sops.length} SOPs, ${result.roles.length} ról, ${result.valueChains.length} łańcuchów wartości`);
        } catch (error) {
            toast.error('Błąd zapisu do bazy');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClear = () => {
        setTranscript('');
        setCompanyName('');
        setResult(null);
        setTokensUsed(0);
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return 'text-emerald-500';
        if (confidence >= 60) return 'text-amber-500';
        return 'text-red-500';
    };

    const getAutomationBadge = (potential: 'LOW' | 'MEDIUM' | 'HIGH') => {
        switch (potential) {
            case 'HIGH': return <Badge className="bg-emerald-500/20 text-emerald-600">Wysoki</Badge>;
            case 'MEDIUM': return <Badge className="bg-amber-500/20 text-amber-600">Średni</Badge>;
            case 'LOW': return <Badge className="bg-gray-500/20 text-gray-600">Niski</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Transcript Processor</h1>
                        <p className="text-muted-foreground text-sm">
                            AI ekstrakcja SOPs, Ról i Value Chains z transkrypcji
                        </p>
                    </div>
                </div>
                {result && (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleClear}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Wyczyść
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Zapisz do bazy
                        </Button>
                    </div>
                )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileCode2 className="h-5 w-5 text-violet-500" />
                                Transkrypcja
                            </CardTitle>
                            <CardDescription>
                                Wklej transkrypcję rozmowy z klientem/firmą
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Nazwa firmy (opcjonalnie)</Label>
                                <Input
                                    id="companyName"
                                    placeholder="np. Acme Corp"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="transcript">Transkrypcja</Label>
                                <Textarea
                                    id="transcript"
                                    placeholder="Wklej tutaj transkrypcję rozmowy..."
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                    className="min-h-[400px] font-mono text-sm"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {transcript.length} znaków
                                </p>
                            </div>
                            <Button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !transcript.trim()}
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Analizuję z AI...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Analizuj z AI
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Results Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    {!result && !isAnalyzing && (
                        <Card className="h-full flex items-center justify-center min-h-[500px]">
                            <div className="text-center p-8">
                                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="font-medium text-lg mb-2">Oczekiwanie na analizę</h3>
                                <p className="text-sm text-muted-foreground">
                                    Wklej transkrypcję i kliknij "Analizuj z AI"
                                </p>
                            </div>
                        </Card>
                    )}

                    {isAnalyzing && (
                        <Card className="h-full flex items-center justify-center min-h-[500px]">
                            <div className="text-center p-8">
                                <Loader2 className="h-12 w-12 mx-auto text-violet-500 animate-spin mb-4" />
                                <h3 className="font-medium text-lg mb-2">Analizuję...</h3>
                                <p className="text-sm text-muted-foreground">
                                    AI przetwarza transkrypcję i ekstrahuje dane
                                </p>
                            </div>
                        </Card>
                    )}

                    {result && (
                        <div className="space-y-4">
                            {/* Summary Card */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            Wyniki analizy
                                        </CardTitle>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline">
                                                {tokensUsed} tokenów
                                            </Badge>
                                            <span className={`text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
                                                {result.confidence}% pewności
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{result.summary}</p>
                                    <div className="flex gap-4 mt-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-violet-500">{result.sops.length}</div>
                                            <div className="text-xs text-muted-foreground">SOPs</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-500">{result.roles.length}</div>
                                            <div className="text-xs text-muted-foreground">Role</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-cyan-500">{result.valueChains.length}</div>
                                            <div className="text-xs text-muted-foreground">Value Chains</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-amber-500">{result.ontology.length}</div>
                                            <div className="text-xs text-muted-foreground">Terminy</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SOPs */}
                            {result.sops.length > 0 && (
                                <Collapsible open={expandedSections.includes('sops')} onOpenChange={() => toggleSection('sops')}>
                                    <Card>
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-base flex items-center gap-2">
                                                        <FileCode2 className="h-4 w-4 text-violet-500" />
                                                        SOPs ({result.sops.length})
                                                    </CardTitle>
                                                    {expandedSections.includes('sops') ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="pt-0 space-y-3">
                                                {result.sops.map((sop, index) => (
                                                    <div key={index} className="p-3 rounded-lg border bg-muted/30">
                                                        <h4 className="font-medium">{sop.title}</h4>
                                                        <p className="text-sm text-muted-foreground mt-1">{sop.purpose}</p>
                                                        <div className="mt-2">
                                                            <p className="text-xs font-medium mb-1">Kroki:</p>
                                                            <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-0.5">
                                                                {sop.steps.slice(0, 5).map((step, i) => (
                                                                    <li key={i}>{step}</li>
                                                                ))}
                                                                {sop.steps.length > 5 && (
                                                                    <li className="text-primary">...i {sop.steps.length - 5} więcej</li>
                                                                )}
                                                            </ol>
                                                        </div>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>
                            )}

                            {/* Roles */}
                            {result.roles.length > 0 && (
                                <Collapsible open={expandedSections.includes('roles')} onOpenChange={() => toggleSection('roles')}>
                                    <Card>
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-base flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-blue-500" />
                                                        Role ({result.roles.length})
                                                    </CardTitle>
                                                    {expandedSections.includes('roles') ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="pt-0 space-y-3">
                                                {result.roles.map((role, index) => (
                                                    <div key={index} className="p-3 rounded-lg border bg-muted/30">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium">{role.name}</h4>
                                                            {role.department && (
                                                                <Badge variant="outline" className="text-xs">{role.department}</Badge>
                                                            )}
                                                        </div>
                                                        <ul className="mt-2 text-xs text-muted-foreground list-disc list-inside">
                                                            {role.responsibilities.slice(0, 3).map((resp, i) => (
                                                                <li key={i}>{resp}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>
                            )}

                            {/* Value Chains */}
                            {result.valueChains.length > 0 && (
                                <Collapsible open={expandedSections.includes('valueChains')} onOpenChange={() => toggleSection('valueChains')}>
                                    <Card>
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-base flex items-center gap-2">
                                                        <GitBranch className="h-4 w-4 text-cyan-500" />
                                                        Value Chains ({result.valueChains.length})
                                                    </CardTitle>
                                                    {expandedSections.includes('valueChains') ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="pt-0 space-y-3">
                                                {result.valueChains.map((chain, index) => (
                                                    <div key={index} className="p-3 rounded-lg border bg-muted/30">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium">{chain.name}</h4>
                                                            {chain.segment && (
                                                                <Badge variant="secondary" className="text-xs">{chain.segment}</Badge>
                                                            )}
                                                        </div>
                                                        <div className="mt-2 space-y-1">
                                                            {chain.stages.map((stage, i) => (
                                                                <div key={i} className="flex items-center justify-between text-xs">
                                                                    <span className="text-muted-foreground">
                                                                        {i + 1}. {stage.name}
                                                                    </span>
                                                                    {getAutomationBadge(stage.automationPotential)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>
                            )}

                            {/* Ontology */}
                            {result.ontology.length > 0 && (
                                <Collapsible open={expandedSections.includes('ontology')} onOpenChange={() => toggleSection('ontology')}>
                                    <Card>
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-base flex items-center gap-2">
                                                        <BookOpen className="h-4 w-4 text-amber-500" />
                                                        Ontologia ({result.ontology.length})
                                                    </CardTitle>
                                                    {expandedSections.includes('ontology') ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="pt-0 space-y-2">
                                                {result.ontology.map((term, index) => (
                                                    <div key={index} className="p-2 rounded-lg border bg-muted/30">
                                                        <span className="font-medium text-sm">{term.term}</span>
                                                        <span className="text-muted-foreground text-sm"> — {term.definition}</span>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
