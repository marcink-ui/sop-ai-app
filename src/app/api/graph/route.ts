
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const organizationId = session.user.organizationId;

        // Fetch all related entities for the graph
        const [users, departments, sops, agents, ontologyEntries, agentSopConnections] = await Promise.all([
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
                select: { id: true, title: true, status: true, departmentId: true, createdById: true }
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
            })
        ]);

        const nodes = [
            // Departments
            ...departments.map(d => ({
                data: { id: d.id, label: d.name, type: 'department', color: '#6366f1' } // Indigo-500
            })),
            // Users
            ...users.map(u => ({
                data: { id: u.id, label: u.name || u.email, type: 'user', role: u.role, color: '#10b981' } // Emerald-500
            })),
            // SOPs
            ...sops.map(s => ({
                data: { id: s.id, label: s.title, type: 'sop', status: s.status, color: '#f59e0b' } // Amber-500
            })),
            // Agents
            ...agents.map(a => ({
                data: { id: a.id, label: a.name, type: 'agent', agentType: a.type, color: '#ef4444' } // Red-500
            })),
            // Ontology
            ...ontologyEntries.map(o => ({
                data: { id: o.id, label: o.term, type: 'ontology', category: o.category, color: '#8b5cf6' } // Violet-500
            }))
        ];

        const edges = [
            // User -> Department
            ...users
                .filter(u => u.departmentId)
                .map(u => ({
                    data: { source: u.id, target: u.departmentId!, label: 'belongs_to', type: 'structure' }
                })),

            // SOP -> Department
            ...sops
                .filter(s => s.departmentId)
                .map(s => ({
                    data: { source: s.id, target: s.departmentId!, label: 'assigned_to', type: 'structure' }
                })),

            // SOP -> User (Created By)
            ...sops
                .map(s => ({
                    data: { source: s.createdById, target: s.id, label: 'created', type: 'authorship' }
                })),

            // Agent -> SOP (Execution)
            ...agentSopConnections.map(conn => ({
                data: { source: conn.agentId, target: conn.sopId, label: 'executes', role: conn.role, type: 'execution' }
            }))
        ];

        return NextResponse.json({ elements: [...nodes, ...edges] });
    } catch (error) {
        console.error('Graph API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
