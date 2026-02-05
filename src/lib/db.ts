// Local storage database for SOP-AI application
// Uses localStorage for persistence (MVP approach)

import { SOP, MudaReport, AgentSpec, MasterPrompt } from './types';

const STORAGE_KEYS = {
    SOPS: 'sop-ai-sops',
    MUDA_REPORTS: 'sop-ai-muda',
    AGENT_SPECS: 'sop-ai-agents',
    MASTER_PROMPTS: 'sop-ai-prompts',
} as const;

// Generic CRUD operations
function getAll<T>(key: string): T[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function getById<T extends { id: string }>(key: string, id: string): T | null {
    const items = getAll<T>(key);
    return items.find(item => item.id === id) || null;
}

function save<T extends { id: string }>(key: string, item: T): T {
    const items = getAll<T>(key);
    const existingIndex = items.findIndex(i => i.id === item.id);

    if (existingIndex >= 0) {
        items[existingIndex] = item;
    } else {
        items.push(item);
    }

    localStorage.setItem(key, JSON.stringify(items));
    return item;
}

function remove<T extends { id: string }>(key: string, id: string): boolean {
    const items = getAll<T>(key);
    const filteredItems = items.filter(item => item.id !== id);

    if (filteredItems.length === items.length) return false;

    localStorage.setItem(key, JSON.stringify(filteredItems));
    return true;
}

// UUID generator
export function generateId(): string {
    return 'sop-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// SOP operations
export const sopDb = {
    getAll: () => getAll<SOP>(STORAGE_KEYS.SOPS),
    getById: (id: string) => getById<SOP>(STORAGE_KEYS.SOPS, id),
    save: (sop: SOP) => save<SOP>(STORAGE_KEYS.SOPS, sop),
    delete: (id: string) => remove<SOP>(STORAGE_KEYS.SOPS, id),
};

// MUDA Report operations
export const mudaDb = {
    getAll: () => getAll<MudaReport>(STORAGE_KEYS.MUDA_REPORTS),
    getBySopId: (sopId: string) => getAll<MudaReport>(STORAGE_KEYS.MUDA_REPORTS).find(m => m.sop_id === sopId),
    save: (report: MudaReport) => save<MudaReport>(STORAGE_KEYS.MUDA_REPORTS, report),
    delete: (id: string) => remove<MudaReport>(STORAGE_KEYS.MUDA_REPORTS, id),
};

// Agent Spec operations
export const agentDb = {
    getAll: () => getAll<AgentSpec>(STORAGE_KEYS.AGENT_SPECS),
    getById: (id: string) => getById<AgentSpec>(STORAGE_KEYS.AGENT_SPECS, id),
    getBySopId: (sopId: string) => getAll<AgentSpec>(STORAGE_KEYS.AGENT_SPECS).find(a => a.sop_id === sopId),
    save: (spec: AgentSpec) => save<AgentSpec>(STORAGE_KEYS.AGENT_SPECS, spec),
    delete: (id: string) => remove<AgentSpec>(STORAGE_KEYS.AGENT_SPECS, id),
};

// Master Prompt operations
export const promptDb = {
    getAll: () => getAll<MasterPrompt>(STORAGE_KEYS.MASTER_PROMPTS),
    getById: (id: string) => getById<MasterPrompt>(STORAGE_KEYS.MASTER_PROMPTS, id),
    getByAgentSpecId: (specId: string) => getAll<MasterPrompt>(STORAGE_KEYS.MASTER_PROMPTS).filter(p => p.agent_spec_id === specId),
    save: (prompt: MasterPrompt) => save<MasterPrompt>(STORAGE_KEYS.MASTER_PROMPTS, prompt),
    delete: (id: string) => remove<MasterPrompt>(STORAGE_KEYS.MASTER_PROMPTS, id),
};

// Export all data (for backup/migration)
export function exportAllData() {
    return {
        sops: sopDb.getAll(),
        mudaReports: mudaDb.getAll(),
        agentSpecs: agentDb.getAll(),
        masterPrompts: promptDb.getAll(),
        exportedAt: new Date().toISOString(),
    };
}

// Import data (from backup)
export function importAllData(data: ReturnType<typeof exportAllData>) {
    localStorage.setItem(STORAGE_KEYS.SOPS, JSON.stringify(data.sops || []));
    localStorage.setItem(STORAGE_KEYS.MUDA_REPORTS, JSON.stringify(data.mudaReports || []));
    localStorage.setItem(STORAGE_KEYS.AGENT_SPECS, JSON.stringify(data.agentSpecs || []));
    localStorage.setItem(STORAGE_KEYS.MASTER_PROMPTS, JSON.stringify(data.masterPrompts || []));
}
