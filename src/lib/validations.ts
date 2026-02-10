/**
 * Zod validation schemas for API route inputs.
 * 
 * Centralized schemas ensure consistent validation rules across all routes.
 * Import individual schemas where needed in route handlers.
 */
import { z } from 'zod';

// ====================
// Shared primitives
// ====================
export const idSchema = z.string().min(1, 'ID is required');
export const nameSchema = z.string().min(1).max(200);
export const descriptionSchema = z.string().max(5000).optional();
export const titleSchema = z.string().min(1, 'Title is required').max(500);

// ====================
// Admin: AI Keys
// ====================
export const createAiKeySchema = z.object({
    organizationId: idSchema,
    provider: z.enum(['OPENAI', 'ANTHROPIC', 'GOOGLE', 'AZURE_OPENAI', 'OLLAMA', 'LOCAL_LLM']),
    label: z.string().min(1).max(100),
    apiKey: z.string().min(10, 'API key too short'),
    monthlyBudget: z.number().positive().optional(),
    note: z.string().max(500).optional(),
});

export const updateAiKeySchema = z.object({
    keyId: idSchema,
    isActive: z.boolean().optional(),
    monthlyBudget: z.number().positive().optional(),
    note: z.string().max(500).optional(),
});

// ====================
// SOPs
// ====================
export const createSopSchema = z.object({
    title: titleSchema,
    code: z.string().min(1, 'Code is required').max(50),
    purpose: z.string().optional(),
    scope: z.string().optional(),
    departmentId: z.string().optional(),
    steps: z.string().optional(),
    kpis: z.string().optional(),
    definitions: z.string().optional(),
    owner: z.string().optional(),
    reviewer: z.string().optional(),
});

export const updateSopSchema = createSopSchema.partial();

// ====================
// Council
// ====================
export const createCouncilRequestSchema = z.object({
    title: titleSchema,
    description: descriptionSchema,
    type: z.enum(['NEW_SOP', 'SOP_CHANGE', 'NEW_AGENT', 'PROCESS_CHANGE', 'BUDGET_REQUEST', 'OTHER']),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    rationale: z.string().max(5000).optional(),
    impact: z.string().max(5000).optional(),
    labels: z.array(z.string()).optional(),
    dueDate: z.string().datetime().optional().nullable(),
});

export const voteSchema = z.object({
    decision: z.enum(['APPROVE', 'REJECT', 'ABSTAIN']),
});

// ====================
// Agents
// ====================
export const createAgentKnowledgeSchema = z.object({
    name: nameSchema,
    type: z.string().min(1, 'Type is required'),
    content: z.string().optional(),
    url: z.string().url().optional(),
    fileUrl: z.string().optional(),
    description: descriptionSchema,
    mimeType: z.string().optional(),
    fileSize: z.number().optional(),
    accessLevel: z.enum(['PUBLIC', 'PRIVATE', 'RESTRICTED']).optional(),
});

export const createAgentVersionSchema = z.object({
    version: z.string().min(1, 'Version is required'),
    changelog: z.string().optional(),
    masterPrompt: z.string().optional(),
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    tools: z.any().optional(),
    isActive: z.boolean().optional(),
});

export const activateVersionSchema = z.object({
    versionId: idSchema,
});

// ====================
// Chat
// ====================
export const chatMessageSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().min(1),
    })).min(1),
    context: z.record(z.string(), z.unknown()).optional(),
    sessionId: z.string().optional(),
});

// ====================
// Categories / Tags / Departments
// ====================
export const createCategorySchema = z.object({
    name: nameSchema,
    description: descriptionSchema,
    color: z.string().max(7).optional(),
    icon: z.string().max(50).optional(),
});

export const createTagSchema = z.object({
    name: nameSchema,
    color: z.string().max(7).optional(),
});

export const createDepartmentSchema = z.object({
    name: nameSchema,
    description: descriptionSchema,
});

// ====================
// Kaizen
// ====================
export const createKaizenSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().min(1, 'Description is required'),
    category: z.enum(['APPLICATION', 'COMPANY_PROCESS']),
});

// ====================
// Tasks
// ====================
export const createTaskSchema = z.object({
    title: titleSchema,
    description: descriptionSchema,
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    dueDate: z.string().datetime().optional(),
    assigneeId: z.string().optional(),
    status: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

// ====================
// Transformation
// ====================
export const createPhaseSchema = z.object({
    name: nameSchema,
    description: descriptionSchema,
    order: z.number().int().min(0).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});

export const createTransformationTaskSchema = z.object({
    title: titleSchema,
    description: descriptionSchema,
    phaseId: z.string().optional(),
    assigneeId: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    status: z.string().optional(),
});

// ====================
// Value Chain
// ====================
export const updateNodeSchema = z.object({
    label: z.string().optional(),
    description: descriptionSchema,
    status: z.string().optional(),
    metrics: z.record(z.string(), z.unknown()).optional(),
    position: z.object({
        x: z.number(),
        y: z.number(),
    }).optional(),
});

export const delegateSchema = z.object({
    nodeId: idSchema,
    userId: idSchema,
    role: z.string().optional(),
});

// ====================
// Analytics
// ====================
export const trackEventSchema = z.object({
    event: z.string().min(1).max(100),
    properties: z.record(z.string(), z.unknown()).optional(),
    page: z.string().optional(),
});

// ====================
// Newsletters
// ====================
export const createNewsletterSchema = z.object({
    title: titleSchema,
    content: z.string().min(1),
    type: z.string().optional(),
});

// ====================
// Resources
// ====================
export const createResourceSchema = z.object({
    title: titleSchema,
    description: descriptionSchema,
    url: z.string().url().optional(),
    type: z.string().optional(),
    categoryId: z.string().optional(),
});

// ====================
// Validation helper
// ====================

/**
 * Parse and validate request body against a Zod schema.
 * Returns { data, error } — use error for NextResponse if validation fails.
 * 
 * Usage:
 *   const { data, error } = await validateBody(request, createSopSchema);
 *   if (error) return error;
 *   // data is fully typed
 */
export async function validateBody<T extends z.ZodType>(
    request: Request,
    schema: T
): Promise<{ data: z.infer<T>; error?: never } | { data?: never; error: Response }> {
    try {
        const body = await request.json();
        const result = schema.safeParse(body);

        if (!result.success) {
            const errors = result.error.issues.map(i => ({
                path: i.path.join('.'),
                message: i.message,
            }));
            return {
                error: Response.json(
                    { error: 'Validation failed', details: errors },
                    { status: 400 }
                ),
            };
        }

        return { data: result.data };
    } catch {
        return {
            error: Response.json(
                { error: 'Invalid JSON body' },
                { status: 400 }
            ),
        };
    }
}
