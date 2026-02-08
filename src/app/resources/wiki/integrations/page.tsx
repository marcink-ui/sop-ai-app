'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    Brain,
    Wrench,
    Palette,
    Plug,
    Search,
    ExternalLink,
    Sparkles,
    MessageSquare,
    FileText,
    Music,
    Home,
    Shield,
    Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function IntegrationsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const aiModels = [
        { name: 'Anthropic Claude', models: ['Claude Pro', 'Opus 4.5'], status: 'active', color: 'bg-orange-500' },
        { name: 'OpenAI', models: ['GPT-4', 'GPT-5', 'o1'], status: 'active', color: 'bg-green-500' },
        { name: 'Google Gemini', models: ['Gemini 2.5 Pro', 'Flash'], status: 'active', color: 'bg-blue-500' },
        { name: 'xAI Grok', models: ['Grok 3', 'Grok 4'], status: 'planned', color: 'bg-red-500' },
        { name: 'DeepSeek', models: ['V3', 'R1'], status: 'planned', color: 'bg-purple-500' },
        { name: 'Mistral', models: ['Large', 'Codestral'], status: 'planned', color: 'bg-cyan-500' },
    ];

    const integrations = [
        {
            category: 'messaging',
            name: 'Messaging',
            icon: MessageSquare,
            items: [
                { name: 'WhatsApp', status: 'planned' },
                { name: 'Telegram', status: 'planned' },
                { name: 'Slack', status: 'planned' },
                { name: 'Discord', status: 'planned' },
                { name: 'Microsoft Teams', status: 'planned' },
            ],
        },
        {
            category: 'productivity',
            name: 'Productivity',
            icon: FileText,
            items: [
                { name: 'Google Workspace', status: 'active' },
                { name: 'Notion', status: 'planned' },
                { name: 'Coda', status: 'active' },
                { name: 'Todoist', status: 'planned' },
                { name: 'GitHub', status: 'planned' },
                { name: 'Trello', status: 'planned' },
            ],
        },
        {
            category: 'media',
            name: 'Media & Creative',
            icon: Music,
            items: [
                { name: 'Spotify', status: 'planned' },
                { name: 'Stitch (UI Generation)', status: 'active' },
                { name: 'Remotion (Video)', status: 'active' },
                { name: 'Figma', status: 'planned' },
            ],
        },
        {
            category: 'automation',
            name: 'Automation',
            icon: Zap,
            items: [
                { name: 'Shell Commands', status: 'active' },
                { name: 'File Management', status: 'active' },
                { name: 'Cron Jobs', status: 'active' },
                { name: 'Web Automation', status: 'active' },
            ],
        },
        {
            category: 'security',
            name: 'Security',
            icon: Shield,
            items: [
                { name: '1Password', status: 'planned' },
                { name: 'Audit Logging', status: 'active' },
                { name: 'RBAC', status: 'active' },
            ],
        },
    ];

    const filteredModels = aiModels.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredIntegrations = integrations.map((category) => ({
        ...category,
        items: category.items.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    })).filter((category) => category.items.length > 0);

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link
                        href="/resources/wiki"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Powrót do Wiki
                    </Link>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                            <Plug className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Integracje</h1>
                            <p className="text-muted-foreground">
                                Modele AI, narzędzia i integracje VantageOS
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">OpenClaw-inspired</Badge>
                        <Badge variant="outline">Multi-Provider</Badge>
                        <Badge variant="outline">50+ Tools</Badge>
                    </div>
                </motion.div>

                {/* Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj integracji..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Tabs defaultValue="models" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="models" className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            Modele AI
                        </TabsTrigger>
                        <TabsTrigger value="tools" className="flex items-center gap-2">
                            <Wrench className="h-4 w-4" />
                            Narzędzia
                        </TabsTrigger>
                        <TabsTrigger value="creative" className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            Creative
                        </TabsTrigger>
                    </TabsList>

                    {/* AI Models Tab */}
                    <TabsContent value="models">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredModels.map((provider, index) => (
                                <motion.div
                                    key={provider.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    <Card className="h-full hover:shadow-lg transition-shadow">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${provider.color}`} />
                                                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                                                </div>
                                                <Badge
                                                    variant={provider.status === 'active' ? 'default' : 'secondary'}
                                                >
                                                    {provider.status === 'active' ? 'Aktywny' : 'Planowany'}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {provider.models.map((model) => (
                                                    <Badge key={model} variant="outline">
                                                        {model}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Tools Tab */}
                    <TabsContent value="tools">
                        <div className="grid gap-6">
                            {filteredIntegrations.filter((c) => c.category !== 'media').map((category, index) => (
                                <motion.div
                                    key={category.category}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <category.icon className="h-5 w-5" />
                                                {category.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                                {category.items.map((item) => (
                                                    <div
                                                        key={item.name}
                                                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                                    >
                                                        <span className="font-medium">{item.name}</span>
                                                        <Badge
                                                            variant={item.status === 'active' ? 'default' : 'outline'}
                                                            className="text-xs"
                                                        >
                                                            {item.status === 'active' ? '✓' : 'Soon'}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Creative Tab */}
                    <TabsContent value="creative">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="border-purple-500/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-purple-500" />
                                        Stitch UI Generator
                                    </CardTitle>
                                    <CardDescription>
                                        Generowanie interfejsów użytkownika z promptów
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <p>• Generowanie HTML/React z opisów</p>
                                        <p>• Design system documentation</p>
                                        <p>• Multi-page website generation</p>
                                        <p>• Prompt enhancement</p>
                                    </div>
                                    <Badge className="mt-4" variant="default">Aktywny</Badge>
                                </CardContent>
                            </Card>

                            <Card className="border-pink-500/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Home className="h-5 w-5 text-pink-500" />
                                        Remotion Video
                                    </CardTitle>
                                    <CardDescription>
                                        Programmatic video generation
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <p>• Walkthrough video generation</p>
                                        <p>• Smooth transitions</p>
                                        <p>• Text overlays</p>
                                        <p>• Zoom effects</p>
                                    </div>
                                    <Badge className="mt-4" variant="default">Aktywny</Badge>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-muted-foreground">
                    <p>
                        Inspired by{' '}
                        <a
                            href="https://openclaw.ai/integrations"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                            OpenClaw Integrations
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
