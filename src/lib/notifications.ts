import { prisma } from '@/lib/prisma';
import type { NotificationType } from '@prisma/client';

interface CreateNotificationParams {
    type: NotificationType;
    title: string;
    description?: string;
    link?: string;
    sopId?: string;
    agentId?: string;
    metadata?: Record<string, unknown>;
    userId: string;
    organizationId: string;
}

/**
 * Create a single notification for a specific user.
 */
export async function createNotification(params: CreateNotificationParams) {
    return prisma.notification.create({
        data: {
            type: params.type,
            title: params.title,
            description: params.description,
            link: params.link,
            sopId: params.sopId,
            agentId: params.agentId,
            metadata: params.metadata as Record<string, unknown> | undefined,
            userId: params.userId,
            organizationId: params.organizationId,
        },
    });
}

/**
 * Create notifications for all users in an organization 
 * (e.g., when a pipeline step completes or council decision is made).
 */
export async function notifyOrganization(
    organizationId: string,
    params: Omit<CreateNotificationParams, 'userId' | 'organizationId'>,
    excludeUserId?: string
) {
    const users = await prisma.user.findMany({
        where: {
            organizationId,
            ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
        },
        select: { id: true },
    });

    if (users.length === 0) return [];

    return prisma.notification.createMany({
        data: users.map(user => ({
            type: params.type,
            title: params.title,
            description: params.description,
            link: params.link,
            sopId: params.sopId,
            agentId: params.agentId,
            metadata: params.metadata as Record<string, unknown> | undefined,
            userId: user.id,
            organizationId,
        })),
    });
}

/**
 * Pipeline-specific notification helpers.
 */
export const pipelineNotifications = {
    /** When a pipeline step is completed */
    async stepCompleted(
        sopId: string,
        sopTitle: string,
        stepName: string,
        stepNumber: number,
        userId: string,
        organizationId: string
    ) {
        const stepLabels: Record<number, string> = {
            1: 'Generowanie SOP',
            2: 'Audyt MUDA',
            3: 'Architekt AI',
            4: 'Generator AI',
            5: 'Finalny audyt',
        };

        return notifyOrganization(organizationId, {
            type: 'PIPELINE_STEP',
            title: `Pipeline krok ${stepNumber}/5 ukończony`,
            description: `${sopTitle} — ${stepLabels[stepNumber] || stepName}`,
            link: `/sops/${sopId}/pipeline`,
            sopId,
            metadata: { stepNumber, stepName },
        }, userId);
    },

    /** When SOP is sent to Council */
    async sentToCouncil(
        sopId: string,
        sopTitle: string,
        userId: string,
        organizationId: string
    ) {
        return notifyOrganization(organizationId, {
            type: 'COUNCIL_REQUEST',
            title: 'SOP wysłany do Rady Transformacji',
            description: sopTitle,
            link: '/council',
            sopId,
        }, userId);
    },

    /** When Council makes a decision */
    async councilDecision(
        sopId: string,
        sopTitle: string,
        decision: 'approved' | 'rejected' | 'revision',
        userId: string,
        organizationId: string
    ) {
        const titles: Record<string, string> = {
            approved: '✅ SOP zatwierdzony przez Radę',
            rejected: '❌ SOP odrzucony przez Radę',
            revision: '🔄 SOP wymaga poprawek (Rada)',
        };

        return createNotification({
            type: 'COUNCIL_DECISION',
            title: titles[decision] || 'Decyzja Rady',
            description: sopTitle,
            link: `/sops/${sopId}`,
            sopId,
            metadata: { decision },
            userId,
            organizationId,
        });
    },
};
