import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isStale, syncRaceSchedule, syncRaceResults } from "@/lib/f1-sync"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const season = searchParams.get("season") ?? new Date().getFullYear().toString()

    // Auto-sync schedule if stale
    if (await isStale("races", season)) {
        try { await syncRaceSchedule(season) } catch (e) {
            console.warn("[results] Schedule sync failed:", e)
        }
    }

    const today = new Date().toISOString().split("T")[0]

    // Fetch all races for the season
    const races = await prisma.f1Race.findMany({
        where: { season },
        orderBy: { round: "asc" },
        include: {
            circuit: true,
            results: {
                orderBy: { position: "asc" },
                include: {
                    driver: true,
                    constructor: true,
                },
            },
        },
    })

    const formatted = races.map(race => {
        const isPast = race.date < today
        const top3 = race.results.slice(0, 3).map(r => ({
            position: r.position,
            driverId: r.driverId,
            driverCode: r.driver.code,
            givenName: r.driver.givenName,
            familyName: r.driver.familyName,
            nationality: r.driver.nationality,
            constructorId: r.constructorId,
            constructorName: r.constructor.name,
            time: r.time,
            points: r.points,
        }))

        const fastestLap = race.results.find(r => r.fastestLapRank === 1)

        return {
            id: race.id,
            round: race.round,
            season: race.season,
            raceName: race.raceName,
            date: race.date,
            time: race.time,
            isPast,
            circuit: {
                circuitId: race.circuit.circuitId,
                circuitName: race.circuit.circuitName,
                locality: race.circuit.locality,
                country: race.circuit.country,
            },
            podium: top3,
            fastestLap: fastestLap ? {
                driverId: fastestLap.driverId,
                driverCode: fastestLap.driver.code,
                familyName: fastestLap.driver.familyName,
                constructorId: fastestLap.constructorId,
                time: fastestLap.fastestLapTime,
            } : null,
            totalResults: race.results.length,
        }
    })

    return NextResponse.json({ season, races: formatted })
}