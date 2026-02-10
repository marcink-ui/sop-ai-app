
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const organizationId = session.user.organizationId;

        // Fetch all related entities for the graph
        const [
            users,
            departments,
            sops,
            agents,
            ontologyEntries,
            agentSopConnections,
            valueChainNodes,
            tags,
            categories,
        ] = await Promise.all([
            prisma.user.findMany({
                where: { organizationId },
                select: { id: true, name: true, role: true, departmentId: true, email: true }
            }),
            prisma.department.findMany({
                where: { organizationId },
                select: { id: true, name: true }
            }),
            prisma.sOP.findMany({
                where: { organizationId },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    departmentId: true,
                    createdById: true,
                    categoryId: true,
                    tags: { select: { id: true } },
                    organizationalRoles: { select: { id: true } },
                    ontologyEntries: { select: { id: true } },
                }
            }),
            prisma.agent.findMany({
                where: { organizationId },
                select: { id: true, name: true, type: true }
            }),
            prisma.ontologyEntry.findMany({
                where: { organizationId },
                select: { id: true, term: true, category: true }
            }),
            prisma.agentSOPConnection.findMany({
                where: { agent: { organizationId }, sop: { organizationId } },
                select: { agentId: true, sopId: true, role: true }
            }),
            prisma.valueChainNode.findMany({
                where: { map: { organizationId } },
                select: { id: true, label: true, type: true, mapId: true, sopId: true, agentId: true }
            }),
            prisma.tag.findMany({
                where: { organizationId },
                select: { id: true, name: true, color: true }
            }),
            prisma.category.findMany({
                where: { organizationId },
                select: { id: true, name: true, parentId: true }
            }),
        ]);

        // Build nodes — colors are applied in the frontend by NODE_COLORS map
        const nodes = [
            ...departments.map((d: { id: string; name: string }) => ({
                data: { id: d.id, label: d.name, type: 'department' }
            })),
            ...users.map((u: { id: string; name: string | null; email: string; role: string | null }) => ({
                data: { id: u.id, label: u.name || u.email, type: 'user', role: u.role }
            })),
            ...sops.map((s: { id: string; title: string; status: string }) => ({
                data: { id: s.id, label: s.title, type: 'sop', status: s.status }
            })),
            ...agents.map((a: { id: string; name: string; type: string }) => ({
                data: { id: a.id, label: a.name, type: 'agent', agentType: a.type }
            })),
            ...ontologyEntries.map((o: { id: string; term: string; category: string | null }) => ({
                data: { id: o.id, label: o.term, type: 'ontology', category: o.category }
            })),
            ...valueChainNodes.map((v: { id: string; label: string }) => ({
                data: { id: v.id, label: v.label, type: 'process' }
            })),
        ];

        // Build edges
        const edges = [
            // User -> Department
            ...users
                .filter((u: { departmentId: string | null }) => u.departmentId)
                .map((u: { id: string; departmentId: string | null }) => ({
                    data: { source: u.id, target: u.departmentId!, label: 'belongs_to' }
                })),

            // SOP -> Department
            ...sops
                .filter((s: { departmentId: string | null }) => s.departmentId)
                .map((s: { id: string; departmentId: string | null }) => ({
                    data: { source: s.id, target: s.departmentId!, label: 'assigned_to' }
                })),

            // SOP -> User (Created By)
            ...sops
                .map((s: { createdById: string | null; id: string }) => ({
                    data: { source: s.createdById, target: s.id, label: 'created' }
                })),

            // Agent -> SOP (Execution)
            ...agentSopConnections.map((conn: { agentId: string; sopId: string; role: string | null }) => ({
                data: { source: conn.agentId, target: conn.sopId, label: 'executes' }
            })),

            // ValueChainNode -> SOP (linked SOP)
            ...valueChainNodes
                .filter((v: { sopId: string | null }) => v.sopId)
                .map((v: { id: string; sopId: string | null }) => ({
                    data: { source: v.id, target: v.sopId!, label: 'implements' }
                })),

            // ValueChainNode -> Agent (linked Agent)
            ...valueChainNodes
                .filter((v: { agentId: string | null }) => v.agentId)
                .map((v: { id: string; agentId: string | null }) => ({
                    data: { source: v.id, target: v.agentId!, label: 'uses_agent' }
                })),

            // SOP -> Category
            ...sops
                .filter((s: { categoryId: string | null }) => s.categoryId)
                .map((s: { id: string; categoryId: string | null }) => ({
                    data: { source: s.id, target: s.categoryId!, label: 'categorized_as' }
                })),

            // SOP -> Tags (many-to-many)
            ...sops.flatMap((s: { id: string; tags: Array<{ id: string }> }) =>
                (s.tags || []).map((t: { id: string }) => ({
                    data: { source: s.id, target: t.id, label: 'tagged' }
                }))
            ),

            // SOP -> OrganizationalRoles (many-to-many)
            ...sops.flatMap((s: { id: string; organizationalRoles: Array<{ id: string }> }) =>
                (s.organizationalRoles || []).map((r: { id: string }) => ({
                    data: { source: s.id, target: r.id, label: 'assigned_role' }
                }))
            ),

            // SOP -> OntologyEntries (many-to-many)
            ...sops.flatMap((s: { id: string; ontologyEntries: Array<{ id: string }> }) =>
                (s.ontologyEntries || []).map((o: { id: string }) => ({
                    data: { source: s.id, target: o.id, label: 'references' }
                }))
            ),

            // Category -> Parent Category
            ...categories
                .filter((c: { parentId: string | null }) => c.parentId)
                .map((c: { id: string; parentId: string | null }) => ({
                    data: { source: c.id, target: c.parentId!, label: 'subcategory_of' }
                })),
        ];

        return NextResponse.json({ elements: [...nodes, ...edges] });
    } catch (error) {
        console.error('Graph API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
