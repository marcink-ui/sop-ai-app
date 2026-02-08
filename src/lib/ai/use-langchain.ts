'use client';

/**
 * React Hooks for LangChain Chains
 * 
 * Provides React-friendly wrappers around LangChain chains
 * with loading states, error handling, and caching.
 */

import { useState, useCallback, useRef } from 'react';
import type {
    SOPAnalysisResult,
    MUDAAnalysisResult,
    KnowledgeExtractionResult,
    ChainConfig,
    ConversationalChainMessage,
} from './langchain-chains';

// ============================================
// Types
// ============================================

export interface UseChainState<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    execute: (input: string) => Promise<T | null>;
    reset: () => void;
}

export interface UseConversationalChainState {
    messages: ConversationalChainMessage[];
    isLoading: boolean;
    error: Error | null;
    sendMessage: (message: string) => Promise<string | null>;
    clearHistory: () => void;
}

// ============================================
// Generic Chain Hook
// ============================================

function useChain<T>(
    chainFn: (input: string, config?: ChainConfig) => Promise<T>,
    config?: ChainConfig
): UseChainState<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const execute = useCallback(
        async (input: string): Promise<T | null> => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await chainFn(input, config);
                setData(result);
                return result;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [chainFn, config]
    );

    const reset = useCallback(() => {
        setData(null);
        setError(null);
    }, []);

    return { data, isLoading, error, execute, reset };
}

// ============================================
// SOP Analyzer Hook
// ============================================

export function useSOPAnalyzer(config?: ChainConfig): UseChainState<SOPAnalysisResult> {
    // Dynamically import to avoid SSR issues
    const analyzeRef = useRef<((input: string, config?: ChainConfig) => Promise<SOPAnalysisResult>) | null>(null);

    const analyzeFn = useCallback(async (input: string, cfg?: ChainConfig): Promise<SOPAnalysisResult> => {
        if (!analyzeRef.current) {
            const module = await import('./langchain-chains');
            analyzeRef.current = module.analyzeSOPFromText;
        }
        return analyzeRef.current(input, cfg);
    }, []);

    return useChain(analyzeFn, config);
}

// ============================================
// MUDA Detector Hook
// ============================================

export function useMUDADetector(config?: ChainConfig): UseChainState<MUDAAnalysisResult> {
    const detectRef = useRef<((input: string, config?: ChainConfig) => Promise<MUDAAnalysisResult>) | null>(null);

    const detectFn = useCallback(async (input: string, cfg?: ChainConfig): Promise<MUDAAnalysisResult> => {
        if (!detectRef.current) {
            const module = await import('./langchain-chains');
            detectRef.current = module.detectMUDA;
        }
        return detectRef.current(input, cfg);
    }, []);

    return useChain(detectFn, config);
}

// ============================================
// Knowledge Extractor Hook
// ============================================

export function useKnowledgeExtractor(config?: ChainConfig): UseChainState<KnowledgeExtractionResult> {
    const extractRef = useRef<((input: string, config?: ChainConfig) => Promise<KnowledgeExtractionResult>) | null>(null);

    const extractFn = useCallback(async (input: string, cfg?: ChainConfig): Promise<KnowledgeExtractionResult> => {
        if (!extractRef.current) {
            const module = await import('./langchain-chains');
            extractRef.current = module.extractKnowledge;
        }
        return extractRef.current(input, cfg);
    }, []);

    return useChain(extractFn, config);
}

// ============================================
// Conversational Chain Hook
// ============================================

export function useConversationalChain(
    config?: ChainConfig,
    systemPrompt?: string
): UseConversationalChainState {
    const [messages, setMessages] = useState<ConversationalChainMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Store chain instance
    const chainRef = useRef<{
        chat: (message: string) => Promise<string>;
        clearHistory: () => void;
    } | null>(null);

    const initChain = useCallback(async () => {
        if (!chainRef.current) {
            const module = await import('./langchain-chains');
            const chain = new module.ConversationalSOPChain(config, systemPrompt);
            chainRef.current = {
                chat: (msg: string) => chain.chat(msg),
                clearHistory: () => chain.clearHistory(),
            };
        }
        return chainRef.current;
    }, [config, systemPrompt]);

    const sendMessage = useCallback(
        async (message: string): Promise<string | null> => {
            setIsLoading(true);
            setError(null);

            // Add user message optimistically
            setMessages((prev) => [...prev, { role: 'user', content: message }]);

            try {
                const chain = await initChain();
                if (!chain) throw new Error('Failed to initialize chain');
                const response = await chain.chat(message);

                // Add assistant response
                setMessages((prev) => [...prev, { role: 'assistant', content: response }]);

                return response;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);

                // Remove optimistic user message on error
                setMessages((prev) => prev.slice(0, -1));

                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [initChain]
    );

    const clearHistory = useCallback(() => {
        if (chainRef.current) {
            chainRef.current.clearHistory();
        }
        setMessages([]);
        setError(null);
    }, []);

    return { messages, isLoading, error, sendMessage, clearHistory };
}

// ============================================
// Combined Analysis Hook
// ============================================

export interface CombinedAnalysisResult {
    sop: SOPAnalysisResult | null;
    muda: MUDAAnalysisResult | null;
    knowledge: KnowledgeExtractionResult | null;
}

export interface UseCombinedAnalysisState {
    data: CombinedAnalysisResult;
    isLoading: boolean;
    errors: {
        sop: Error | null;
        muda: Error | null;
        knowledge: Error | null;
    };
    analyze: (input: string, chains?: ('sop' | 'muda' | 'knowledge')[]) => Promise<CombinedAnalysisResult>;
    reset: () => void;
}

export function useCombinedAnalysis(config?: ChainConfig): UseCombinedAnalysisState {
    const [data, setData] = useState<CombinedAnalysisResult>({
        sop: null,
        muda: null,
        knowledge: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{
        sop: Error | null;
        muda: Error | null;
        knowledge: Error | null;
    }>({ sop: null, muda: null, knowledge: null });

    const analyze = useCallback(
        async (
            input: string,
            chains: ('sop' | 'muda' | 'knowledge')[] = ['sop', 'muda', 'knowledge']
        ): Promise<CombinedAnalysisResult> => {
            setIsLoading(true);
            setErrors({ sop: null, muda: null, knowledge: null });

            const module = await import('./langchain-chains');
            const results: CombinedAnalysisResult = { sop: null, muda: null, knowledge: null };
            const newErrors: typeof errors = { sop: null, muda: null, knowledge: null };

            // Run selected chains in parallel
            const promises: Promise<void>[] = [];

            if (chains.includes('sop')) {
                promises.push(
                    module.analyzeSOPFromText(input, config)
                        .then((r) => { results.sop = r; })
                        .catch((e) => { newErrors.sop = e; })
                );
            }

            if (chains.includes('muda')) {
                promises.push(
                    module.detectMUDA(input, config)
                        .then((r) => { results.muda = r; })
                        .catch((e) => { newErrors.muda = e; })
                );
            }

            if (chains.includes('knowledge')) {
                promises.push(
                    module.extractKnowledge(input, config)
                        .then((r) => { results.knowledge = r; })
                        .catch((e) => { newErrors.knowledge = e; })
                );
            }

            await Promise.all(promises);

            setData(results);
            setErrors(newErrors);
            setIsLoading(false);

            return results;
        },
        [config]
    );

    const reset = useCallback(() => {
        setData({ sop: null, muda: null, knowledge: null });
        setErrors({ sop: null, muda: null, knowledge: null });
    }, []);

    return { data, isLoading, errors, analyze, reset };
}

export default {
    useSOPAnalyzer,
    useMUDADetector,
    useKnowledgeExtractor,
    useConversationalChain,
    useCombinedAnalysis,
};
