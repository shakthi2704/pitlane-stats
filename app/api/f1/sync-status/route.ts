import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const season = searchParams.get("season") ?? "2025"

    const dataTypes = ["driver_standings", "constructor_standings", "races", "race_results", "lap_times"]

    const logs = await Promise.all(
        dataTypes.map(async (dataType) => {
            const last = await prisma.syncLog.findFirst({
                where: { sport: "f1", dataType, season, success: true },
                orderBy: { syncedAt: "desc" },
            })
            return { dataType, lastSync: last?.syncedAt ?? null }
        })
    )

    // Count rows per table for this season
    const [drivers, constructors, races] = await Promise.all([
        prisma.f1DriverStanding.count({ where: { season } }),
        prisma.f1ConstructorStanding.count({ where: { season } }),
        prisma.f1Race.count({ where: { season } }),
    ])

    return NextResponse.json({
        season,
        syncs: logs,
        counts: { drivers, constructors, races },
    })
}