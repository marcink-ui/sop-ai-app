// Extended types for SOP-AI Digital Twin Platform
// BPMN, Value Chain, Roles, Council, Syllabus, and Agent Registry
// Based on VantageOS methodology

import { SupportedIntegration } from './types';

// ============================================================================
// BPMN Types - Business Process Model and Notation
// ============================================================================
export type BPMNElementType =
    | 'start_event'
    | 'end_event'
    | 'task'
    | 'gateway_xor'
    | 'gateway_and'
    | 'message'
    | 'timer'
    | 'data_object';

export interface BPMNElement {
    id: string;
    type: BPMNElementType;
    label: string;
    lane_id: string;
    position: { x: number; y: number };
    connections: { target_id: string; label?: string }[];
}

export interface BPMNSwimlane {
    id: string;
    role_id: string;
    role_name: string;
    order: number;
}

export interface BPMNDiagram {
    id: string;
    sop_id: string;
    meta: {
        process_name: string;
        version: string;
        created_date: string;
        author: string;
    };
    lanes: BPMNSwimlane[];
    elements: BPMNElement[];
    mermaid_code: string;
    automation_candidates: {
        element_id: string;
        potential: 'manual' | 'semi' | 'full';
        ai_agent?: string;
    }[];
    handoffs: {
        from_role: string;
        to_role: string;
        data_transferred: string;
    }[];
}

// ============================================================================
// Value Chain Types - Porter's Value Chain + Lean
// ============================================================================
export type ValueChainCategory =
    | 'inbound_logistics'
    | 'operations'
    | 'outbound_logistics'
    | 'marketing_sales'
    | 'service'
    | 'infrastructure'
    | 'hr_management'
    | 'technology'
    | 'procurement';

export interface ValueChainProcess {
    id: string;
    sop_ids: string[];
    category: ValueChainCategory;
    name: string;
    value_add_time_min: number;
    wait_time_min: number;
    va_ratio: number; // value_add / (value_add + wait)
    bottleneck_level: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface ValueChainMap {
    id: string;
    meta: {
        company_name: string;
        created_date: string;
        last_updated: string;
        analyst: string;
    };
    processes: ValueChainProcess[];
    total_metrics: {
        total_processes: number;
        avg_va_ratio: number;
        critical_bottlenecks: number;
        automation_opportunities: number;
    };
    kaizen_proposals: {
        process_id: string;
        proposal: string;
        effort: 'S' | 'M' | 'L';
        impact: 'S' | 'M' | 'L';
        priority: 'low' | 'medium' | 'high';
    }[];
}

// ============================================================================
// Roles Registry Types - Organizational Roles and RACI
// ============================================================================
export type RACILevel = 'R' | 'A' | 'C' | 'I' | null;

export interface OrganizationalRole {
    id: string;
    name: string;
    type: 'human' | 'ai' | 'hybrid';
    department: string;
    reports_to?: string;
    sop_count: number;
    primary_responsibilities: string[];
    permissions: string[];
    escalation_path: string[];
}

export interface RACIEntry {
    sop_id: string;
    step_id: number;
    task_name: string;
    roles: Record<string, RACILevel>; // role_id -> RACI level
}

export interface RACIMatrix {
    id: string;
    sop_id: string;
    created_date: string;
    entries: RACIEntry[];
    gaps: {
        step_id: number;
        issue: 'no_accountable' | 'multiple_responsible' | 'orphan_role';
        description: string;
    }[];
}

// ============================================================================
// Council Types - Transformation Council Decisions
// ============================================================================
export type CouncilVote = 'approve' | 'reject' | 'abstain' | 'pending';

export interface CouncilMember {
    id: string;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    has_veto: boolean;
}

export interface CouncilRequest {
    id: string;
    title: string;
    type: 'budget' | 'process_change' | 'ai_deploy' | 'data_migration' | 'role_change';
    status: 'draft' | 'voting' | 'approved' | 'rejected' | 'expired';
    created_by: string;
    created_date: string;
    deadline: string;
    description: string;
    impact: {
        sops_affected: number;
        budget_pln?: number;
        risk_level: 'low' | 'medium' | 'high';
    };
    votes: {
        member_id: string;
        vote: CouncilVote;
        comment?: string;
        voted_at?: string;
    }[];
    quorum_required: number;
    approval_threshold: number; // percentage needed
    result?: {
        decision: 'approved' | 'rejected';
        final_votes: { approve: number; reject: number; abstain: number };
        decided_at: string;
    };
}

// ============================================================================
// Syllabus Types - Corporate Dictionary
// ============================================================================
export type SyllabusCategory =
    | 'process'
    | 'system'
    | 'role'
    | 'document'
    | 'metric'
    | 'tool'
    | 'term'
    | 'abbreviation';

export interface SyllabusEntry {
    id: string;
    term: string;
    definition: string;
    category: SyllabusCategory;
    synonyms: string[];
    related_sops: string[];
    source: string;
    created_date: string;
    updated_date: string;
    approved_by?: string;
}

export interface Syllabus {
    id: string;
    meta: {
        company_name: string;
        version: string;
        last_updated: string;
    };
    entries: SyllabusEntry[];
    pending_review: {
        term: string;
        context: string;
        source_sop: string;
        suggested_category: SyllabusCategory;
    }[];
}

// ============================================================================
// Agent Registry Types - AI Agent Inventory
// ============================================================================
export type AgentSize = 'micro' | 'small' | 'medium' | 'large';
export type AgentStatus = 'draft' | 'testing' | 'production' | 'deprecated';
export type AgentType = 'orchestrator' | 'processor' | 'analyzer' | 'generator' | 'validator';

export interface RegisteredAgent {
    id: string;
    name: string;
    type: AgentType;
    size: AgentSize;
    status: AgentStatus;
    version: string;
    context_budget: {
        system_prompt_tokens: number;
        domain_knowledge_tokens: number;
        working_memory_tokens: number;
        total_tokens: number;
    };
    sop_coverage: {
        sop_id: string;
        step_range: [number, number];
    }[];
    integrations: SupportedIntegration[];
    escalation_triggers: string[];
    handoffs: {
        input_from: string; // agent_id or 'human'
        output_to: string; // agent_id or 'human'
    };
    metrics?: {
        total_executions: number;
        success_rate: number;
        avg_response_time_ms: number;
        escalation_rate: number;
    };
    created_date: string;
    deployed_date?: string;
    master_prompt_id: string;
}

export interface AgentRegistry {
    id: string;
    meta: {
        company_name: string;
        last_sync: string;
    };
    agents: RegisteredAgent[];
    orchestration_flow: string; // mermaid diagram
    total_automation_coverage: number; // percentage
}

// ============================================================================
// Digital Twin Types - Complete Company Model
// ============================================================================
export interface DigitalTwinLayer {
    name: string;
    status: 'incomplete' | 'partial' | 'complete';
    coverage: number; // percentage
    last_updated: string;
}

export interface DigitalTwin {
    id: string;
    company_name: string;
    created_date: string;
    last_updated: string;
    layers: {
        process: DigitalTwinLayer;
        people: DigitalTwinLayer;
        ai: DigitalTwinLayer;
        data: DigitalTwinLayer;
        waste: DigitalTwinLayer;
    };
    key_metrics: {
        total_sops: number;
        total_agents: number;
        automation_rate: number;
        monthly_savings_hours: number;
        muda_eliminated: number;
    };
    databases: {
        sops: string; // coda doc id
        muda: string;
        agents: string;
        roles: string;
        value_chain: string;
        council: string;
        syllabus: string;
    };
}

// ============================================================================
// API Request/Response Types for AI Integration
// ============================================================================
export interface AgentInvocationRequest {
    agent_type: string;
    input: Record<string, unknown>;
    context?: {
        sop_id?: string;
        company_id?: string;
        user_id?: string;
        session_id?: string;
    };
    options?: {
        max_tokens?: number;
        temperature?: number;
        model?: string;
    };
}

export interface AgentInvocationResponse {
    success: boolean;
    agent_type: string;
    output: Record<string, unknown>;
    metadata: {
        tokens_used: number;
        execution_time_ms: number;
        model_used: string;
    };
    next_agent?: string;
    escalate?: {
        to: string;
        reason: string;
    };
    database_updates?: {
        table: string;
        operation: 'insert' | 'update' | 'delete';
        data: Record<string, unknown>;
    }[];
}

export interface OrchestratorRoutingDecision {
    route_to: string;
    context: Record<string, unknown>;
    priority: 'low' | 'medium' | 'high' | 'critical';
    requires_human: boolean;
    next_steps: string[];
}
