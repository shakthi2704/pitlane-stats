import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const [
        seasons,
        categories,
        events,
        sessions,
        results,
        riders,
        teams,
        constructors,
        riderStandings,
        recentLogs,
    ] = await Promise.all([
        prisma.motoGPSeason.count(),
        prisma.motoGPCategory.count(),
        prisma.motoGPEvent.count(),
        prisma.motoGPSession.count(),
        prisma.motoGPResult.count(),
        prisma.motoGPRider.count(),
        prisma.motoGPTeam.count(),
        prisma.motoGPConstructor.count(),
        prisma.motoGPRiderStanding.count(),
        prisma.syncLog.findMany({
            where: { sport: "motogp" },
            orderBy: { syncedAt: "desc" },
            take: 10,
        }),
    ])

    // Breakdown by season
    const seasonBreakdown = await prisma.motoGPSeason.findMany({
        orderBy: { year: "desc" },
        include: {
            _count: {
                select: { events: true, riderStandings: true },
            },
        },
    })

    return NextResponse.json({
        counts: {
            seasons,
            categories,
            events,
            sessions,
            results,
            riders,
            teams,
            constructors,
            riderStandings,
        },
        seasonBreakdown: seasonBreakdown.map(s => ({
            year: s.year,
            current: s.current,
            events: s._count.events,
            standings: s._count.riderStandings,
        })),
        recentLogs,
    })
}