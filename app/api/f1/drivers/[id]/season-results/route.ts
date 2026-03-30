

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const season = request.nextUrl.searchParams.get("season") ?? "2025"

        // Driver's results — include constructor is fine on F1RaceResult (it has the relation)
        const results = await prisma.f1RaceResult.findMany({
            where: { driverId: id, race: { season } },
            orderBy: { race: { round: "asc" } },
            include: {
                race: { include: { circuit: true } },
                constructor: true,
            },
        })

        if (results.length === 0) {
            return NextResponse.json({ results: [] })
        }

        const constructorIds = [...new Set(results.map(r => r.constructorId))]
        const raceIds = results.map(r => r.raceId)

        // Fetch teammate results with NO include/select to avoid the JS built-in
        // `constructor` property colliding with Prisma's include/select types.
        // findMany with only `where` returns all scalar fields safely.
        const teammateRaw = await prisma.f1RaceResult.findMany({
            where: {
                driverId: { not: id },
                constructorId: { in: constructorIds },
                raceId: { in: raceIds },
            },
        })

        // Fetch teammate driver names separately
        const teammateDriverIds = [...new Set(teammateRaw.map(r => r.driverId))]
        const teammateDrivers = await prisma.f1Driver.findMany({
            where: { driverId: { in: teammateDriverIds } },
        })
        const driverNameMap = Object.fromEntries(
            teammateDrivers.map(d => [d.driverId, `${d.givenName} ${d.familyName}`])
        )

        // H2H map keyed by raceId
        const h2hMap: Record<number, {
            teammatePos: number | null
            teammateId: string
            teammateName: string
        }> = {}

        for (const tr of teammateRaw) {
            h2hMap[tr.raceId] = {
                teammatePos: tr.position,
                teammateId: tr.driverId,
                teammateName: driverNameMap[tr.driverId] ?? tr.driverId,
            }
        }

        const formatted = results.map(r => ({
            round: r.race.round,
            raceId: r.raceId,
            raceName: r.race.raceName,
            circuit: r.race.circuit?.circuitName ?? "",
            country: r.race.circuit?.country ?? "",
            date: r.race.date,
            position: r.position,
            positionText: r.positionText,
            grid: r.grid,
            points: r.points,
            laps: r.laps,
            status: r.status,
            time: r.time,
            fastestLapTime: r.fastestLapTime,
            fastestLapRank: r.fastestLapRank,
            constructorId: r.constructorId,
            constructorName: r.constructor?.name ?? "",
            h2h: h2hMap[r.raceId] ?? null,
        }))

        return NextResponse.json({ results: formatted })
    } catch (error) {
        console.error("[driver season-results]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}