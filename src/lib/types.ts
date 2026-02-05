// Database types and schemas for SOP-AI application
// Based on VantageOS methodology: sop_to_ai_process.md

export interface SOPMeta {
  process_name: string;
  department: string;
  role: string;
  owner: string;
  version: string;
  created_date: string;
  updated_date: string;
  estimated_time: string;
}

export interface SOPStep {
  id: number;
  name: string;
  actions: string[];
  tool?: string;
  screenshot?: string;
}

export interface SOPException {
  condition: string;
  action: string;
}

export interface DictionaryCandidate {
  term: string;
  context: string;
}

export interface SOP {
  id: string;
  meta: SOPMeta;
  purpose: string;
  scope: {
    trigger: string;
    outcome: string;
  };
  prerequisites: {
    systems: string[];
    data_required: string[];
  };
  knowledge_base: {
    documents: { name: string; url: string }[];
    quality_checklist: string[];
    golden_standard: string;
    warnings: string[];
    naming_convention: string;
  };
  steps: SOPStep[];
  troubleshooting: { problem: string; solution: string }[];
  definition_of_done: string[];
  metrics: {
    frequency_per_day: number;
    avg_time_min: number;
    people_count: number;
  };
  dictionary_candidates: DictionaryCandidate[];
  exceptions: SOPException[];
  status: 'draft' | 'generated' | 'audited' | 'architected' | 'prompt-generated' | 'completed';
}

// MUDA Types (7 types of waste)
export type MudaType =
  | 'Transport'
  | 'Inventory'
  | 'Motion'
  | 'Waiting'
  | 'Overproduction'
  | 'Overprocessing'
  | 'Defects';

export interface WasteItem {
  step_id: number;
  muda_type: MudaType;
  problem: string;
  kaizen_proposal: string;
  time_saving_sec: number;
  automation_potential: 'none' | 'low' | 'medium' | 'high' | 'full';
}

export interface OptimizationApplied {
  original_step: number;
  change_type: 'removed' | 'merged' | 'simplified' | 'automated';
  description: string;
}

export interface MudaReport {
  id: string;
  sop_id: string;
  meta: {
    sop_name: string;
    sop_version: string;
    analyzed_date: string;
    analyst: string;
  };
  waste_identified: WasteItem[];
  summary: {
    total_muda_count: number;
    total_potential_saving_min: number;
    automation_score: string;
  };
  optimizations_applied: OptimizationApplied[];
  escalations: {
    issue: string;
    reason: string;
    suggested_owner: string;
  }[];
}

// Agent Specification
export interface AgentInputOutputSchema {
  type: 'object';
  properties: Record<string, { type: string; description?: string; enum?: string[] }>;
  required: string[];
}

export interface MicroAgent {
  name: string;
  responsibility: string;
  input_schema: AgentInputOutputSchema;
  output_schema: AgentInputOutputSchema;
  integrations: string[];
  escalation_triggers: string[];
  context_required: {
    sylabus_terms: string[];
    sop_steps: number[];
  };
  guardrails: {
    banned_actions: string[];
    max_retries: number;
    timeout_sec: number;
  };
}

export interface AgentSpec {
  id: string;
  sop_id: string;
  meta: {
    sop_name: string;
    sop_version: string;
    architect: string;
    created_date: string;
  };
  agents: MicroAgent[];
  flow_mermaid: string;
  requirements_for_generator: {
    templates: string[];
    access_needed: string[];
    knowledge_base: string[];
  };
}

// Master Prompt
export interface PromptSection {
  id: string;
  name: string;
  content: string;
}

export interface MasterPrompt {
  id: string;
  agent_spec_id: string;
  meta: {
    agent_name: string;
    version: string;
    created_date: string;
    author?: string;
    source_sop?: string;
    prompt_type?: 'system' | 'user' | 'assistant';
  };
  sections: PromptSection[];
  full_prompt: string;
  prompt?: {
    role: string;
    objective: string;
    context_knowledge: string;
    workflow: string;
    output_schema: string;
    guardrails: string;
  };
  xml_prompt?: string;
  evaluation?: {
    score: number;
    clarity: number;
    completeness: number;
    token_efficiency: number;
    guardrails_quality: number;
    testability: number;
    diagnoses: { problem: string; fix: string }[];
  };
}

// Supported integrations
export const SUPPORTED_INTEGRATIONS = [
  'Coda',
  'Google Workspace',
  'Fireflies',
  'Railway',
  'Komodo',
  'SendGrid',
  'Stripe'
] as const;

export type SupportedIntegration = typeof SUPPORTED_INTEGRATIONS[number];
