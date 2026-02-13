import { prisma } from '@/lib/prisma';

// ── In-memory cache for system prompts ──
const promptCache = new Map<string, { content: string; fetchedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get a system prompt by slug from the database.
 * Results are cached for 5 minutes in memory.
 * Falls back to provided defaultContent when DB has no entry.
 */
export async function getSystemPrompt(slug: string, defaultContent?: string): Promise<string> {
    // 1. Check cache
    const cached = promptCache.get(slug);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        return cached.content;
    }

    // 2. Fetch from DB
    try {
        const prompt = await prisma.systemPrompt.findUnique({
            where: { slug },
        });

        if (prompt?.isActive && prompt.content) {
            promptCache.set(slug, { content: prompt.content, fetchedAt: Date.now() });
            return prompt.content;
        }
    } catch (error) {
        console.error(`[SystemPrompts] Failed to fetch prompt "${slug}":`, error);
    }

    // 3. Fallback to default
    if (defaultContent) {
        return defaultContent;
    }

    return `[System prompt "${slug}" not found]`;
}

/**
 * Get all prompts by category.
 */
export async function getPromptsByCategory(category: string): Promise<Array<{ slug: string; name: string; content: string; description: string | null }>> {
    try {
        const prompts = await prisma.systemPrompt.findMany({
            where: { category, isActive: true },
            select: { slug: true, name: true, content: true, description: true },
            orderBy: { slug: 'asc' },
        });
        return prompts;
    } catch (error) {
        console.error(`[SystemPrompts] Failed to fetch category "${category}":`, error);
        return [];
    }
}

/**
 * Invalidate a specific cached prompt (call after edit in admin panel).
 */
export function invalidatePromptCache(slug?: string): void {
    if (slug) {
        promptCache.delete(slug);
    } else {
        promptCache.clear();
    }
}
