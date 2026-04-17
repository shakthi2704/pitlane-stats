import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isStale, syncRaceSchedule } from "@/lib/f1-sync"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const season = searchParams.get("season") ?? "2025"

    if (await isStale("races", season)) {
        try {
            await syncRaceSchedule(season)
        } catch (e) {
            console.warn("[races] Auto-sync failed:", e)
        }
    }

    const races = await prisma.f1Race.findMany({
        where: { season },
        orderBy: { round: "asc" },
        include: { circuit: true },
    })

    return NextResponse.json({ season, races })
}