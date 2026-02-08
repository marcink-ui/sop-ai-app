'use server';

import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// =====================================
// VantageOS Headless Chat Agent Service
// =====================================
// Enables programmatic AI conversations without UI dependency
// Supports pre-defined flows, step-by-step execution, and database logging

export interface AgentFlowStep {
    id: string;
    prompt: string;
    expectedOutput?: 'text' | 'json' | 'confirmation';
    validation?: (response: string) => boolean;
    onSuccess?: (response: string) => void;
    nextStep?: string;
}

export interface AgentFlow {
    id: string;
    name: string;
    description: string;
    steps: AgentFlowStep[];
    context?: Record<string, unknown>;
    onComplete?: (results: FlowExecutionResult) => void;
}

export interface FlowExecutionResult {
    flowId: string;
    flowName: string;
    success: boolean;
    steps: {
        stepId: string;
        prompt: string;
        response: string;
        success: boolean;
        timestamp: Date;
    }[];
    totalDurationMs: number;
    error?: string;
}

export interface HeadlessAgentConfig {
    systemPrompt?: string;
    model?: 'GPT-4o' | 'GPT-4.1' | 'Claude-Sonnet-4' | 'Claude-Opus-4' | 'Gemini-2.5-Flash' | 'Gemini-2.5-Pro';
    temperature?: number;
    maxTokens?: number;
    saveToDatabase?: boolean;
    userId?: string;
}

// Pre-defined flows for common VantageOS tasks
export const PREDEFINED_FLOWS: Record<string, AgentFlow> = {
    'sop-creation': {
        id: 'sop-creation',
        name: 'SOP Creation Flow',
        description: 'Guided flow for creating a new SOP',
        steps: [
            {
                id: 'collect-name',
                prompt: 'Podaj nazwę nowego SOPa. Powinna być krótka i opisowa.',
                expectedOutput: 'text',
            },
            {
                id: 'collect-purpose',
                prompt: 'Jaki jest cel (Purpose) tego SOPa? Opisz problem, który rozwiązuje.',
                expectedOutput: 'text',
            },
            {
                id: 'collect-scope',
                prompt: 'Jaki jest zakres (Scope) tego SOPa? Kto będzie go używał i w jakich sytuacjach?',
                expectedOutput: 'text',
            },
            {
                id: 'collect-steps',
                prompt: 'Opisz kroki procedury. Możesz podać listę kroków, a ja pomogę je ustrukturyzować.',
                expectedOutput: 'text',
            },
            {
                id: 'generate-sop',
                prompt: 'Na podstawie zebranych informacji, wygeneruję pełny SOP w formacie VantageOS.',
                expectedOutput: 'json',
            },
        ],
    },
    'muda-analysis': {
        id: 'muda-analysis',
        name: 'MUDA Analysis Flow',
        description: 'Analyze a process for waste and improvement opportunities',
        steps: [
            {
                id: 'describe-process',
                prompt: 'Opisz proces, który chcesz przeanalizować pod kątem MUDA.',
                expectedOutput: 'text',
            },
            {
                id: 'identify-waste',
                prompt: 'Przeanalizuję ten proces pod kątem 7 rodzajów marnotrawstwa (MUDA).',
                expectedOutput: 'json',
            },
            {
                id: 'recommendations',
                prompt: 'Przedstawię rekomendacje optymalizacji i kandydatów do automatyzacji AI.',
                expectedOutput: 'text',
            },
        ],
    },
    'agent-configuration': {
        id: 'agent-configuration',
        name: 'Agent Configuration Flow',
        description: 'Configure an AI Agent with Master Prompt',
        steps: [
            {
                id: 'agent-role',
                prompt: 'Jaka jest główna rola tego agenta? Co będzie robił?',
                expectedOutput: 'text',
            },
            {
                id: 'agent-sops',
                prompt: 'Jakie SOPy będzie obsługiwał ten agent? Podaj nazwy lub ID.',
                expectedOutput: 'text',
            },
            {
                id: 'agent-tools',
                prompt: 'Jakie narzędzia/integracje (MCPs) ma mieć dostępne?',
                expectedOutput: 'text',
            },
            {
                id: 'generate-prompt',
                prompt: 'Wygeneruję Master Prompt dla tego agenta.',
                expectedOutput: 'text',
            },
        ],
    },
};

// Generate AI response (simulated - replace with actual LLM call)
async function generateResponse(
    prompt: string,
    context: Record<string, unknown>,
    _config: HeadlessAgentConfig
): Promise<string> {
    // This is a placeholder - in production, call actual LLM API
    // e.g., OpenAI, Anthropic, or Google AI

    const systemContext = context.flowName
        ? `Wykonuję flow: ${context.flowName}. Krok: ${context.stepId}`
        : 'VantageOS Headless Agent';

    // Simulated response based on step type
    if (context.expectedOutput === 'json') {
        return JSON.stringify({
            status: 'generated',
            context: systemContext,
            data: { prompt, timestamp: new Date().toISOString() }
        }, null, 2);
    }

    return `[Headless Agent Response] ${systemContext}\n\nPrompt: ${prompt}\n\nTo jest symulowana odpowiedź. W produkcji, połącz z prawdziwym LLM API.`;
}

// Main Headless Agent class
export class HeadlessAgent {
    private config: HeadlessAgentConfig;
    private conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [];
    private sessionId: string | null = null;

    constructor(config: HeadlessAgentConfig = {}) {
        this.config = {
            model: 'GPT-4o',
            temperature: 0.7,
            maxTokens: 2000,
            saveToDatabase: true,
            ...config,
        };
    }

    // Initialize a new session
    async initSession(userId?: string): Promise<string> {
        if (this.config.saveToDatabase) {
            const user = userId
                ? await prisma.user.findUnique({ where: { id: userId } })
                : await prisma.user.findFirst();

            if (user) {
                const session = await prisma.chatSession.create({
                    data: {
                        userId: user.id,
                        title: 'Headless Agent Session',
                        context: { type: 'headless', model: this.config.model },
                    }
                });
                this.sessionId = session.id;
            }
        }

        if (!this.sessionId) {
            this.sessionId = uuidv4();
        }

        return this.sessionId;
    }

    // Send a single message
    async sendMessage(message: string, context?: Record<string, unknown>): Promise<string> {
        if (!this.sessionId) {
            await this.initSession();
        }

        this.conversationHistory.push({ role: 'user', content: message });

        const response = await generateResponse(message, context || {}, this.config);

        this.conversationHistory.push({ role: 'assistant', content: response });

        // Save to database
        if (this.config.saveToDatabase && this.sessionId) {
            try {
                await prisma.chatMessage.create({
                    data: {
                        sessionId: this.sessionId,
                        role: 'user',
                        content: message,
                        metadata: context ? JSON.parse(JSON.stringify({ context })) : undefined
                    }
                });
                await prisma.chatMessage.create({
                    data: {
                        sessionId: this.sessionId,
                        role: 'assistant',
                        content: response,
                        metadata: { model: this.config.model }
                    }
                });
            } catch (e) {
                console.error('Failed to save chat message:', e);
            }
        }

        return response;
    }

    // Execute a predefined flow
    async executeFlow(flowId: string, inputData?: Record<string, string>): Promise<FlowExecutionResult> {
        const flow = PREDEFINED_FLOWS[flowId];
        if (!flow) {
            throw new Error(`Flow not found: ${flowId}`);
        }

        const startTime = Date.now();
        const results: FlowExecutionResult['steps'] = [];

        await this.initSession();

        for (const step of flow.steps) {
            const userInput = inputData?.[step.id] || step.prompt;

            const response = await this.sendMessage(userInput, {
                flowId: flow.id,
                flowName: flow.name,
                stepId: step.id,
                expectedOutput: step.expectedOutput,
            });

            const stepSuccess = step.validation ? step.validation(response) : true;

            results.push({
                stepId: step.id,
                prompt: userInput,
                response,
                success: stepSuccess,
                timestamp: new Date(),
            });

            if (step.onSuccess && stepSuccess) {
                step.onSuccess(response);
            }

            if (!stepSuccess) {
                return {
                    flowId: flow.id,
                    flowName: flow.name,
                    success: false,
                    steps: results,
                    totalDurationMs: Date.now() - startTime,
                    error: `Step ${step.id} failed validation`,
                };
            }
        }

        const result: FlowExecutionResult = {
            flowId: flow.id,
            flowName: flow.name,
            success: true,
            steps: results,
            totalDurationMs: Date.now() - startTime,
        };

        if (flow.onComplete) {
            flow.onComplete(result);
        }

        return result;
    }

    // Get conversation history
    getHistory(): { role: 'user' | 'assistant'; content: string }[] {
        return [...this.conversationHistory];
    }

    // Clear session
    clearSession(): void {
        this.conversationHistory = [];
        this.sessionId = null;
    }
}

// Factory function for quick initialization
export async function createHeadlessAgent(config?: HeadlessAgentConfig): Promise<HeadlessAgent> {
    const agent = new HeadlessAgent(config);
    await agent.initSession(config?.userId);
    return agent;
}

// Utility: Execute a quick one-off query
export async function quickQuery(message: string, config?: HeadlessAgentConfig): Promise<string> {
    const agent = new HeadlessAgent({ ...config, saveToDatabase: false });
    return agent.sendMessage(message);
}

// Utility: Run flow and return results
export async function runFlow(
    flowId: string,
    inputData?: Record<string, string>,
    config?: HeadlessAgentConfig
): Promise<FlowExecutionResult> {
    const agent = new HeadlessAgent(config);
    return agent.executeFlow(flowId, inputData);
}
