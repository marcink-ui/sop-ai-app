/**
 * LangChain Chains for VantageOS
 * 
 * Provides specialized AI chains for:
 * - SOP Analysis
 * - MUDA Detection (8 wastes of Lean)
 * - Knowledge Extraction
 */

import { ChatOpenAI } from '@langchain/openai';
import {
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
} from '@langchain/core/prompts';
import {
    RunnableSequence,
    RunnablePassthrough,
} from '@langchain/core/runnables';
import { StringOutputParser, JsonOutputParser } from '@langchain/core/output_parsers';
import { AIMessage, HumanMessage, BaseMessage } from '@langchain/core/messages';

// ============================================
// Types
// ============================================

export interface SOPAnalysisResult {
    title: string;
    summary: string;
    steps: SOPStep[];
    roles: string[];
    triggers: string[];
    outputs: string[];
    automationPotential: number; // 0-100
    suggestions: string[];
}

export interface SOPStep {
    number: number;
    action: string;
    owner: string;
    duration?: string;
    tools?: string[];
    decision?: boolean;
}

export interface MUDAAnalysisResult {
    overallScore: number; // 0-100 (higher = more waste)
    wastes: MUDAWaste[];
    recommendations: MUDARecommendation[];
    quickWins: string[];
    estimatedSavings: string;
}

export type MUDACategory =
    | 'transport'
    | 'inventory'
    | 'motion'
    | 'waiting'
    | 'overprocessing'
    | 'overproduction'
    | 'defects'
    | 'skills';

export interface MUDAWaste {
    category: MUDACategory;
    description: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    location: string;
    evidence: string;
}

export interface MUDARecommendation {
    waste: MUDACategory;
    action: string;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    priority: number; // 1-5
}

export interface KnowledgeExtractionResult {
    entities: ExtractedEntity[];
    relationships: ExtractedRelationship[];
    facts: string[];
    questions: string[];
}

export interface ExtractedEntity {
    name: string;
    type: 'person' | 'role' | 'process' | 'tool' | 'document' | 'system';
    context: string;
}

export interface ExtractedRelationship {
    from: string;
    to: string;
    type: string;
    description: string;
}

// ============================================
// Chain Configuration
// ============================================

export interface ChainConfig {
    openAIApiKey?: string;
    modelName?: string;
    temperature?: number;
    maxTokens?: number;
}

const DEFAULT_CONFIG: Required<ChainConfig> = {
    openAIApiKey: process.env.OPENAI_API_KEY || '',
    modelName: 'gpt-4o',
    temperature: 0.3,
    maxTokens: 4096,
};

function createModel(config: ChainConfig = {}): ChatOpenAI {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    return new ChatOpenAI({
        openAIApiKey: mergedConfig.openAIApiKey,
        modelName: mergedConfig.modelName,
        temperature: mergedConfig.temperature,
        maxTokens: mergedConfig.maxTokens,
    });
}

// ============================================
// SOP Analyzer Chain
// ============================================

const SOP_ANALYZER_SYSTEM = `You are an expert SOP (Standard Operating Procedure) analyst for VantageOS.
Your role is to analyze processes and extract structured SOP information.

When analyzing a process description:
1. Identify the clear sequence of steps
2. Determine who is responsible for each step (roles)
3. Identify triggers that start the process
4. Note expected outputs/deliverables
5. Assess automation potential (0-100)
6. Provide actionable improvement suggestions

Respond ONLY with valid JSON matching this structure:
{
    "title": "SOP title",
    "summary": "Brief description",
    "steps": [
        {"number": 1, "action": "Step description", "owner": "Role name", "duration": "5 min", "tools": ["tool1"], "decision": false}
    ],
    "roles": ["Role1", "Role2"],
    "triggers": ["When X happens"],
    "outputs": ["Document Y", "Email Z"],
    "automationPotential": 75,
    "suggestions": ["Suggestion 1", "Suggestion 2"]
}`;

export function createSOPAnalyzerChain(config: ChainConfig = {}) {
    const model = createModel({ ...config, temperature: 0.2 });

    const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(SOP_ANALYZER_SYSTEM),
        HumanMessagePromptTemplate.fromTemplate(
            'Analyze this process and create a structured SOP:\n\n{input}'
        ),
    ]);

    const chain = RunnableSequence.from([
        prompt,
        model,
        new JsonOutputParser<SOPAnalysisResult>(),
    ]);

    return chain;
}

export async function analyzeSOPFromText(
    text: string,
    config: ChainConfig = {}
): Promise<SOPAnalysisResult> {
    const chain = createSOPAnalyzerChain(config);
    return chain.invoke({ input: text });
}

// ============================================
// MUDA Detector Chain
// ============================================

const MUDA_DETECTOR_SYSTEM = `You are a Lean Manufacturing expert specializing in MUDA (waste) detection.
You analyze processes to identify the 8 wastes:

1. **Transport** - Unnecessary movement of materials/information
2. **Inventory** - Excess materials, data, or work-in-progress
3. **Motion** - Unnecessary movement by people
4. **Waiting** - Idle time between steps
5. **Overprocessing** - More work than necessary
6. **Overproduction** - Making more than needed
7. **Defects** - Errors requiring rework
8. **Skills** - Underutilized talent/capabilities

For each waste found, provide:
- Clear description
- Impact level (low/medium/high/critical)
- Location in the process
- Evidence from the text

Then provide prioritized recommendations.

Respond ONLY with valid JSON:
{
    "overallScore": 45,
    "wastes": [
        {"category": "waiting", "description": "...", "impact": "high", "location": "Step 3", "evidence": "..."}
    ],
    "recommendations": [
        {"waste": "waiting", "action": "...", "effort": "low", "impact": "high", "priority": 1}
    ],
    "quickWins": ["Win 1", "Win 2"],
    "estimatedSavings": "20% time reduction"
}`;

export function createMUDADetectorChain(config: ChainConfig = {}) {
    const model = createModel({ ...config, temperature: 0.2 });

    const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(MUDA_DETECTOR_SYSTEM),
        HumanMessagePromptTemplate.fromTemplate(
            'Analyze this process for MUDA (waste):\n\n{input}'
        ),
    ]);

    const chain = RunnableSequence.from([
        prompt,
        model,
        new JsonOutputParser<MUDAAnalysisResult>(),
    ]);

    return chain;
}

export async function detectMUDA(
    processDescription: string,
    config: ChainConfig = {}
): Promise<MUDAAnalysisResult> {
    const chain = createMUDADetectorChain(config);
    return chain.invoke({ input: processDescription });
}

// ============================================
// Knowledge Extraction Chain
// ============================================

const KNOWLEDGE_EXTRACTOR_SYSTEM = `You are a knowledge extraction specialist.
Analyze text to extract structured knowledge for a knowledge graph.

Extract:
1. **Entities**: People, roles, processes, tools, documents, systems
2. **Relationships**: How entities connect to each other
3. **Facts**: Key factual statements
4. **Questions**: Gaps in knowledge that should be clarified

Respond ONLY with valid JSON:
{
    "entities": [
        {"name": "...", "type": "role", "context": "..."}
    ],
    "relationships": [
        {"from": "...", "to": "...", "type": "owns", "description": "..."}
    ],
    "facts": ["Fact 1", "Fact 2"],
    "questions": ["What about X?"]
}`;

export function createKnowledgeExtractorChain(config: ChainConfig = {}) {
    const model = createModel({ ...config, temperature: 0.1 });

    const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(KNOWLEDGE_EXTRACTOR_SYSTEM),
        HumanMessagePromptTemplate.fromTemplate(
            'Extract knowledge from this text:\n\n{input}'
        ),
    ]);

    const chain = RunnableSequence.from([
        prompt,
        model,
        new JsonOutputParser<KnowledgeExtractionResult>(),
    ]);

    return chain;
}

export async function extractKnowledge(
    text: string,
    config: ChainConfig = {}
): Promise<KnowledgeExtractionResult> {
    const chain = createKnowledgeExtractorChain(config);
    return chain.invoke({ input: text });
}

// ============================================
// Conversational Chain with Manual History
// ============================================

export interface ConversationalChainMessage {
    role: 'user' | 'assistant';
    content: string;
}

export class ConversationalSOPChain {
    private model: ChatOpenAI;
    private history: BaseMessage[] = [];
    private systemPrompt: string;

    constructor(config: ChainConfig = {}, systemPrompt?: string) {
        this.model = createModel(config);
        this.systemPrompt = systemPrompt || `You are a VantageOS SOP assistant.
Help users understand, create, and improve their Standard Operating Procedures.
Be concise, practical, and focused on actionable improvements.
When analyzing processes, look for MUDA (waste) and automation opportunities.`;
    }

    async chat(userMessage: string): Promise<string> {
        // Create prompt with history
        const prompt = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate(this.systemPrompt),
            new MessagesPlaceholder('history'),
            HumanMessagePromptTemplate.fromTemplate('{input}'),
        ]);

        // Create chain
        const chain = RunnableSequence.from([
            {
                input: new RunnablePassthrough(),
                history: () => this.history,
            },
            prompt,
            this.model,
            new StringOutputParser(),
        ]);

        // Get response
        const response = await chain.invoke(userMessage);

        // Save to history
        this.history.push(new HumanMessage(userMessage));
        this.history.push(new AIMessage(response));

        return response;
    }

    getHistory(): ConversationalChainMessage[] {
        return this.history.map((msg) => ({
            role: msg instanceof HumanMessage ? 'user' : 'assistant',
            content: msg.content as string,
        }));
    }

    clearHistory(): void {
        this.history = [];
    }

    loadHistory(messages: ConversationalChainMessage[]): void {
        this.history = messages.map((msg) =>
            msg.role === 'user'
                ? new HumanMessage(msg.content)
                : new AIMessage(msg.content)
        );
    }
}

// ============================================
// Factory Functions
// ============================================

export function createChain(type: 'sop-analyzer' | 'muda-detector' | 'knowledge-extractor', config?: ChainConfig) {
    switch (type) {
        case 'sop-analyzer':
            return createSOPAnalyzerChain(config);
        case 'muda-detector':
            return createMUDADetectorChain(config);
        case 'knowledge-extractor':
            return createKnowledgeExtractorChain(config);
        default:
            throw new Error(`Unknown chain type: ${type}`);
    }
}

export function createConversationalChain(config?: ChainConfig, systemPrompt?: string) {
    return new ConversationalSOPChain(config, systemPrompt);
}

// ============================================
// Utility: MUDA Category Labels
// ============================================

export const MUDA_CATEGORIES: Record<MUDACategory, { label: string; description: string; icon: string }> = {
    transport: {
        label: 'Transport',
        description: 'Unnecessary movement of materials or information',
        icon: '🚚',
    },
    inventory: {
        label: 'Inventory',
        description: 'Excess materials, data, or work-in-progress',
        icon: '📦',
    },
    motion: {
        label: 'Motion',
        description: 'Unnecessary movement by people',
        icon: '🏃',
    },
    waiting: {
        label: 'Waiting',
        description: 'Idle time between process steps',
        icon: '⏳',
    },
    overprocessing: {
        label: 'Over-processing',
        description: 'Doing more work than necessary',
        icon: '⚙️',
    },
    overproduction: {
        label: 'Over-production',
        description: 'Creating more than needed',
        icon: '📈',
    },
    defects: {
        label: 'Defects',
        description: 'Errors requiring correction or rework',
        icon: '❌',
    },
    skills: {
        label: 'Skills Waste',
        description: 'Underutilized talent and capabilities',
        icon: '🧠',
    },
};

export default {
    createSOPAnalyzerChain,
    createMUDADetectorChain,
    createKnowledgeExtractorChain,
    createConversationalChain,
    analyzeSOPFromText,
    detectMUDA,
    extractKnowledge,
    MUDA_CATEGORIES,
};
