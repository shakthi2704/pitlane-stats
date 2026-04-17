import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isStale, syncConstructorStandings } from "@/lib/f1-sync"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const season = searchParams.get("season") ?? "2025"

    if (await isStale("constructor_standings", season)) {
        try {
            await syncConstructorStandings(season)
        } catch (e) {
            console.warn("[constructor-standings] Auto-sync failed:", e)
        }
    }

    const standings = await prisma.f1ConstructorStanding.findMany({
        where: { season },
        orderBy: { position: "asc" },
        include: { constructor: true },
    })

    return NextResponse.json({ season, standings })
}