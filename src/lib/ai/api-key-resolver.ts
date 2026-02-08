// =====================================
// AI API Key Resolver — Multi-Tier System
// =====================================
// Resolves the correct AI API key based on user role:
//
// TIER 1: Platform Keys (env vars)
//   → META_ADMIN & PARTNER use platform-owned keys
//   → Never touches client's API quota
//
// TIER 2: Organization Keys (DB)
//   → Client org has their own keys in settings
//   → SPONSOR/PILOT/MANAGER/EXPERT/CITIZEN_DEV use org keys
//
// TIER 3: Fallback (simulated)
//   → No keys configured → simulated responses
//

export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface ResolvedApiKey {
    provider: AIProvider;
    apiKey: string;
    tier: 'platform' | 'organization' | 'simulated';
    model: string;
}

export interface KeyResolutionContext {
    userRole: string;
    organizationId?: string;
    preferredProvider?: AIProvider;
}

// Platform-level keys from environment variables
// These are owned by SYHI and used by META_ADMIN / PARTNER
const PLATFORM_KEYS: Record<AIProvider, { envVar: string; defaultModel: string }> = {
    openai: {
        envVar: 'PLATFORM_OPENAI_API_KEY',
        defaultModel: 'gpt-4-turbo',
    },
    anthropic: {
        envVar: 'PLATFORM_ANTHROPIC_API_KEY',
        defaultModel: 'claude-3-sonnet-20240229',
    },
    google: {
        envVar: 'PLATFORM_GOOGLE_API_KEY',
        defaultModel: 'gemini-1.5-pro',
    },
};

// Organization-level keys from environment variables
// These belong to the client organization
const ORG_KEYS: Record<AIProvider, { envVar: string; defaultModel: string }> = {
    openai: {
        envVar: 'OPENAI_API_KEY',
        defaultModel: 'gpt-4-turbo',
    },
    anthropic: {
        envVar: 'ANTHROPIC_API_KEY',
        defaultModel: 'claude-3-sonnet-20240229',
    },
    google: {
        envVar: 'GOOGLE_API_KEY',
        defaultModel: 'gemini-1.5-pro',
    },
};

// Roles that should use platform keys (never client's API)
const PLATFORM_ROLES = ['META_ADMIN', 'PARTNER'];

// Priority order for provider fallback
const PROVIDER_PRIORITY: AIProvider[] = ['openai', 'anthropic', 'google'];

/**
 * Resolve the appropriate AI API key based on user role and available keys.
 * 
 * Resolution order:
 * 1. If user is META_ADMIN or PARTNER → use PLATFORM_* keys
 * 2. If user is a client role → use ORG_* keys  
 * 3. If no keys available → return simulated tier
 */
export function resolveApiKey(context: KeyResolutionContext): ResolvedApiKey {
    const isPlatformUser = PLATFORM_ROLES.includes(context.userRole);

    // Determine which key set to search
    const keySet = isPlatformUser ? PLATFORM_KEYS : ORG_KEYS;
    const tier = isPlatformUser ? 'platform' : 'organization';

    // Try preferred provider first
    if (context.preferredProvider) {
        const config = keySet[context.preferredProvider];
        const key = process.env[config.envVar];
        if (key) {
            return {
                provider: context.preferredProvider,
                apiKey: key,
                tier: tier as 'platform' | 'organization',
                model: config.defaultModel,
            };
        }
    }

    // Try each provider in priority order
    for (const provider of PROVIDER_PRIORITY) {
        const config = keySet[provider];
        const key = process.env[config.envVar];
        if (key) {
            return {
                provider,
                apiKey: key,
                tier: tier as 'platform' | 'organization',
                model: config.defaultModel,
            };
        }
    }

    // Platform user fallback: try org keys as last resort
    if (isPlatformUser) {
        for (const provider of PROVIDER_PRIORITY) {
            const config = ORG_KEYS[provider];
            const key = process.env[config.envVar];
            if (key) {
                return {
                    provider,
                    apiKey: key,
                    tier: 'organization',
                    model: config.defaultModel,
                };
            }
        }
    }

    // No keys available → simulated mode
    return {
        provider: 'openai',
        apiKey: '',
        tier: 'simulated',
        model: 'simulated-wiki',
    };
}

/**
 * Get a human-readable description of the current API tier for logging/UI.
 */
export function getTierLabel(tier: ResolvedApiKey['tier']): string {
    switch (tier) {
        case 'platform':
            return '🏢 Klucz platformy (SYHI)';
        case 'organization':
            return '🔑 Klucz organizacji';
        case 'simulated':
            return '🤖 Tryb symulowany (brak klucza API)';
    }
}

/**
 * Check if real AI is available (any tier except simulated).
 */
export function isRealAIAvailable(resolved: ResolvedApiKey): boolean {
    return resolved.tier !== 'simulated';
}
