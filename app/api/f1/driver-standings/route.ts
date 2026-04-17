import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isStale, syncDriverStandings } from "@/lib/f1-sync"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const season = searchParams.get("season") ?? "2025"

    // Auto-sync if stale
    if (await isStale("driver_standings", season)) {
        try {
            await syncDriverStandings(season)
        } catch (e) {
            console.warn("[driver-standings] Auto-sync failed, serving cached data:", e)
        }
    }

    const standings = await prisma.f1DriverStanding.findMany({
        where: { season },
        orderBy: { position: "asc" },
        include: { driver: true },
    })

    return NextResponse.json({ season, standings })
}