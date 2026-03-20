import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isStale, syncLapTimes } from "@/lib/sync-service"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const season = searchParams.get("season") ?? "2025"
    const round = searchParams.get("round")
    const driverId = searchParams.get("driver") // optional filter

    if (!round) {
        return NextResponse.json({ error: "round query param is required" }, { status: 400 })
    }

    if (await isStale("lap_times", season, round)) {
        try {
            await syncLapTimes(season, round)
        } catch (e) {
            console.warn(`[lap-times] Auto-sync failed for R${round}:`, e)
        }
    }

    const race = await prisma.f1Race.findUnique({
        where: { season_round: { season, round: parseInt(round) } },
    })

    if (!race) {
        return NextResponse.json({ error: "Race not found" }, { status: 404 })
    }

    const lapTimes = await prisma.f1LapTime.findMany({
        where: {
            raceId: race.id,
            ...(driverId ? { driverId } : {}),
        },
        orderBy: [{ lapNumber: "asc" }, { position: "asc" }],
        include: { driver: true },
    })

    return NextResponse.json({ season, round, lapTimes })
}