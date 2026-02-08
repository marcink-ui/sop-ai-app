// LangChain Integration for VantageOS
// =====================================

// Core Chains
export {
    createSOPAnalyzerChain,
    createMUDADetectorChain,
    createKnowledgeExtractorChain,
    createChain,
    createConversationalChain,
    ConversationalSOPChain,
    analyzeSOPFromText,
    detectMUDA,
    extractKnowledge,
    MUDA_CATEGORIES,
} from './langchain-chains';

export type {
    SOPAnalysisResult,
    SOPStep,
    MUDAAnalysisResult,
    MUDACategory,
    MUDAWaste,
    MUDARecommendation,
    KnowledgeExtractionResult,
    ExtractedEntity,
    ExtractedRelationship,
    ChainConfig,
    ConversationalChainMessage,
} from './langchain-chains';

// React Hooks
export {
    useSOPAnalyzer,
    useMUDADetector,
    useKnowledgeExtractor,
    useConversationalChain,
    useCombinedAnalysis,
} from './use-langchain';

export type {
    UseChainState,
    UseConversationalChainState,
    CombinedAnalysisResult,
    UseCombinedAnalysisState,
} from './use-langchain';

// Headless Agent for programmatic AI workflows
export {
    HeadlessAgent,
    createHeadlessAgent,
    quickQuery,
    runFlow,
    PREDEFINED_FLOWS,
} from './headless-agent';

export type {
    AgentFlow,
    AgentFlowStep,
    FlowExecutionResult,
    HeadlessAgentConfig,
} from './headless-agent';

