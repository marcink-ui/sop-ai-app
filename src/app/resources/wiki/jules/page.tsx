'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    Cloud,
    GitBranch,
    Play,
    Layers,
    Database,
    Code,
    Zap,
    Users,
    FileCode,
    Terminal,
    Image,
    Search,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function JulesSDKPage() {
    const coreFeatures = [
        {
            name: 'Cloud Sessions',
            icon: Cloud,
            description: 'Run coding agents in ephemeral cloud environments',
            code: `const session = await jules.session({
  prompt: 'Fix visibility issues...',
  source: { github: 'org/repo', baseBranch: 'main' },
  autoPr: true,
});`,
        },
        {
            name: 'Fleet Orchestration',
            icon: Users,
            description: 'Process multiple tasks in parallel with concurrency control',
            code: `const sessions = await jules.all(todos, (task) => ({
  prompt: task,
  source: { github: 'user/repo', baseBranch: 'main' },
}), { concurrency: 10 });`,
        },
        {
            name: 'Reactive Streams',
            icon: Zap,
            description: 'Observe agent progress with async iterators',
            code: `for await (const activity of session.stream()) {
  switch (activity.type) {
    case 'planGenerated':
      console.log(activity.plan.steps.length);
      break;
    case 'sessionCompleted':
      console.log('Done!');
      break;
  }
}`,
        },
        {
            name: 'Local Query Language',
            icon: Search,
            description: 'Filter and project across cached session data',
            code: `const failures = await jules.select({
  from: 'sessions',
  where: { state: 'failed' },
  limit: 10,
});`,
        },
    ];

    const artifacts = [
        { type: 'changeSet', icon: FileCode, description: 'Code diffs (+additions, -deletions)' },
        { type: 'bashOutput', icon: Terminal, description: 'Shell command output' },
        { type: 'media', icon: Image, description: 'Screenshots and images' },
    ];

    const sessionMethods = [
        { method: 'session.ask()', description: 'Send message and await reply' },
        { method: 'session.send()', description: 'Fire-and-forget message' },
        { method: 'session.approve()', description: 'Approve pending plan' },
        { method: 'session.waitFor()', description: 'Pause until specific state' },
        { method: 'session.result()', description: 'Await final outcome' },
        { method: 'session.stream()', description: 'Async iterator of activities' },
    ];

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
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                            <Layers className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Jules SDK</h1>
                            <p className="text-muted-foreground">
                                Orkiestracja floty coding agents w chmurze
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">Google Labs</Badge>
                        <Badge variant="outline">Agent Fleet</Badge>
                        <Badge variant="outline">GitHub Integration</Badge>
                    </div>
                </motion.div>

                {/* Introduction */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="mb-8 border-blue-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Code className="h-5 w-5" />
                                Co to jest Jules SDK?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                            <p>
                                <strong>Jules SDK</strong> to narzędzie do orkiestracji złożonych,
                                długotrwałych zadań kodowania w efemerycznym środowisku chmurowym
                                zintegrowanym z GitHub.
                            </p>
                            <p>
                                Kluczowe wzorce architektoniczne z Jules SDK mogą być zastosowane
                                w VantageOS do automatyzacji procesów SOP i transformacji cyfrowej.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Core Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold mb-6">Kluczowe Wzorce</h2>

                    <div className="grid gap-4">
                        {coreFeatures.map((feature, index) => (
                            <Card key={feature.name}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <feature.icon className="h-5 w-5 text-primary" />
                                        {feature.name}
                                    </CardTitle>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <pre className="bg-muted/50 p-4 rounded-lg text-xs overflow-x-auto">
                                        <code>{feature.code}</code>
                                    </pre>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>

                <Separator className="my-8" />

                {/* Session API */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Play className="h-6 w-6 text-primary" />
                        Session API
                    </h2>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid gap-3 sm:grid-cols-2">
                                {sessionMethods.map((item) => (
                                    <div
                                        key={item.method}
                                        className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                                    >
                                        <code className="text-sm font-mono text-primary">
                                            {item.method}
                                        </code>
                                        <span className="text-sm text-muted-foreground">
                                            {item.description}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Artifacts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Database className="h-6 w-6 text-primary" />
                        Typy Artefaktów
                    </h2>

                    <div className="grid gap-4 md:grid-cols-3">
                        {artifacts.map((artifact) => (
                            <Card key={artifact.type}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <artifact.icon className="h-4 w-4 text-primary" />
                                        {artifact.type}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {artifact.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>

                {/* VantageOS Application */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="border-amber-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GitBranch className="h-5 w-5 text-amber-500" />
                                Zastosowanie w VantageOS
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <h4 className="font-medium">Digital Twin Pattern</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• Session jako cyfrowy bliźniak procesu</li>
                                        <li>• Stream dla real-time monitoringu</li>
                                        <li>• Artifacts dla dokumentacji zmian</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium">Fleet Pattern</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• jules.all() dla batch SOP analysis</li>
                                        <li>• Concurrency control dla wydajności</li>
                                        <li>• Error handling dla resilience</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-muted-foreground">
                    <p>
                        Source:{' '}
                        <a
                            href="https://github.com/google-labs-code/jules-sdk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            github.com/google-labs-code/jules-sdk
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
