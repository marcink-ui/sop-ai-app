import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { DashboardClient } from './dashboard-client';

export const dynamic = 'force-dynamic';

async function getDashboardData(organizationId: string) {
  const [sops, agents, mudaReports, council, departments, users] = await Promise.all([
    prisma.sOP.count({ where: { organizationId } }),
    prisma.agent.count({ where: { organizationId } }),
    prisma.mUDAReport.count({ where: { organizationId } }),
    prisma.councilRequest.count({ where: { organizationId } }),
    prisma.department.count({ where: { organizationId } }),
    prisma.user.count({ where: { organizationId } }),
  ]);

  // Get recent SOPs
  const recentSops = await prisma.sOP.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      department: true,
      createdBy: { select: { name: true } },
    },
  });

  // Get total potential savings from MUDA reports
  const mudaData = await prisma.mUDAReport.findMany({
    where: { organizationId },
    select: { estimatedSavings: true },
  });

  const totalSavings = mudaData.reduce((acc: number, m: { estimatedSavings: number | null }) => acc + (m.estimatedSavings || 0), 0);

  return {
    stats: {
      sops,
      agents,
      mudaReports,
      council,
      departments,
      users,
      totalSavings,
    },
    recentSops,
  };
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/auth/login');
  }

  let stats = {
    sops: 0,
    agents: 0,
    mudaReports: 0,
    council: 0,
    departments: 0,
    users: 0,
    totalSavings: 0,
  };
  let recentSops: Awaited<ReturnType<typeof getDashboardData>>['recentSops'] = [];

  try {
    const data = await getDashboardData(session.user.organizationId);
    stats = data.stats;
    recentSops = data.recentSops;
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    // Continue with empty/default data
  }

  return (
    <DashboardClient
      user={{
        name: session.user.name || 'User',
        email: session.user.email || '',
        role: session.user.role,
      }}
      stats={stats}
      recentSops={recentSops}
    />
  );
}
