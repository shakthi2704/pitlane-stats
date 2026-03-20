import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isStale, syncRaceResults } from "@/lib/sync-service"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const season = searchParams.get("season") ?? "2025"
    const round = searchParams.get("round")

    if (!round) {
        return NextResponse.json({ error: "round query param is required" }, { status: 400 })
    }

    if (await isStale("race_results", season, round)) {
        try {
            await syncRaceResults(season, round)
        } catch (e) {
            console.warn(`[race-results] Auto-sync failed for R${round}:`, e)
        }
    }

    const race = await prisma.f1Race.findUnique({
        where: { season_round: { season, round: parseInt(round) } },
        include: {
            circuit: true,
            results: {
                orderBy: { position: "asc" },
                include: { driver: true, constructor: true },
            },
        },
    })

    if (!race) {
        return NextResponse.json({ error: "Race not found" }, { status: 404 })
    }

    return NextResponse.json({ season, round, race })
}