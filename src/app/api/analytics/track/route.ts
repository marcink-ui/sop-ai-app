import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Track UI interaction events
interface TrackingEvent {
    type: 'click' | 'scroll' | 'view' | 'interaction';
    page: string;
    element?: string;
    x?: number;
    y?: number;
    metadata?: Record<string, unknown>;
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json() as { events: TrackingEvent[] };
        const { events } = body;

        if (!events || !Array.isArray(events) || events.length === 0) {
            return NextResponse.json({ error: 'No events provided' }, { status: 400 });
        }

        const organizationId = session.user.organizationId;
        const userId = session.user.id;

        // Store events in a lightweight way (you could use a separate analytics table)
        // For now, we'll log them and could aggregate later
        const eventLog = events.map(event => ({
            ...event,
            userId,
            organizationId,
            timestamp: new Date().toISOString()
        }));

        // In production, you would store this in an analytics database
        // For now, console log for debugging
        console.log('[ANALYTICS_EVENTS]', JSON.stringify(eventLog, null, 2));

        return NextResponse.json({
            success: true,
            eventsProcessed: events.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[ANALYTICS_TRACK_ERROR]', error);
        return NextResponse.json(
            { error: 'Failed to track events' },
            { status: 500 }
        );
    }
}

// Get aggregated tracking data (for heatmaps, etc.)
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || 'all';
        const period = searchParams.get('period') || '7d';

        // For demo purposes, return sample aggregated data
        // In production, this would query the analytics database
        const sampleClickData = generateSampleClickData(page);

        return NextResponse.json({
            page,
            period,
            clicks: sampleClickData,
            totalClicks: sampleClickData.length,
            hotspots: identifyHotspots(sampleClickData),
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('[ANALYTICS_TRACK_GET_ERROR]', error);
        return NextResponse.json(
            { error: 'Failed to fetch tracking data' },
            { status: 500 }
        );
    }
}

function generateSampleClickData(page: string): { x: number; y: number; count: number }[] {
    // Generate realistic sample data based on common UI patterns
    const baseData = [
        // Navbar area - high activity
        { x: 120, y: 30, count: 15 },
        { x: 250, y: 30, count: 12 },
        { x: 380, y: 32, count: 8 },
        // Sidebar area
        { x: 50, y: 150, count: 20 },
        { x: 50, y: 200, count: 18 },
        { x: 50, y: 250, count: 14 },
        { x: 50, y: 300, count: 22 },
        // Main CTA buttons
        { x: 450, y: 180, count: 25 },
        { x: 600, y: 180, count: 15 },
        // Cards area
        { x: 300, y: 350, count: 10 },
        { x: 500, y: 350, count: 18 },
        { x: 700, y: 350, count: 8 },
        // Bottom actions
        { x: 400, y: 500, count: 12 },
    ];

    // Add some randomization
    return baseData.map(point => ({
        ...point,
        x: point.x + Math.floor(Math.random() * 10) - 5,
        y: point.y + Math.floor(Math.random() * 10) - 5,
        count: point.count + Math.floor(Math.random() * 5)
    }));
}

function identifyHotspots(clicks: { x: number; y: number; count: number }[]) {
    // Identify regions with highest activity
    const sortedByCount = [...clicks].sort((a, b) => b.count - a.count);
    const topHotspots = sortedByCount.slice(0, 5);

    return topHotspots.map((spot, index) => ({
        rank: index + 1,
        x: spot.x,
        y: spot.y,
        clicks: spot.count,
        region: getRegionName(spot.x, spot.y)
    }));
}

function getRegionName(x: number, y: number): string {
    if (y < 60) return 'Nawigacja górna';
    if (x < 100) return 'Sidebar';
    if (y < 250) return 'Główne akcje';
    if (y < 450) return 'Karty treści';
    return 'Dolna sekcja';
}
