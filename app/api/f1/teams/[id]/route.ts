import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const season = request.nextUrl.searchParams.get("season") ?? "2025"

        // Constructor info — fallback to any season just to get the team name/nationality
        // but we ONLY use this for static info, not for standings/stats
        const constructorRecord = await prisma.f1Constructor.findUnique({
            where: { constructorId: id },
        })

        if (!constructorRecord) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 })
        }

        // Standing STRICTLY for the requested season — no fallback
        const standing = await prisma.f1ConstructorStanding.findFirst({
            where: { constructorId: id, season },
        })

        // Drivers STRICTLY for the requested season — no fallback
        const driverStandings = await prisma.f1DriverStanding.findMany({
            where: { constructorId: id, season },
            orderBy: { position: "asc" },
            include: { driver: true },
        })

        // Career history — all seasons
        const careerStandings = await prisma.f1ConstructorStanding.findMany({
            where: { constructorId: id },
            orderBy: { season: "desc" },
        })

        // Race results STRICTLY for the requested season
        const raceResults = await prisma.f1RaceResult.findMany({
            where: { constructorId: id, race: { season } },
            orderBy: [{ race: { round: "asc" } }, { position: "asc" }],
            include: {
                race: { include: { circuit: true } },
                driver: true,
                constructor: true,
            },
        })

        // Career totals — all time
        const [careerWins, careerPodiums, careerFastestLaps, careerPointsAgg] = await Promise.all([
            prisma.f1RaceResult.count({ where: { constructorId: id, position: 1 } }),
            prisma.f1RaceResult.count({ where: { constructorId: id, position: { in: [1, 2, 3] } } }),
            prisma.f1RaceResult.count({ where: { constructorId: id, fastestLapRank: 1 } }),
            prisma.f1RaceResult.aggregate({
                where: { constructorId: id },
                _sum: { points: true },
            }),
        ])

        const championships = careerStandings.filter(s => s.position === 1).length

        // Whether data exists for the requested season
        const hasSeasonData = standing !== null || raceResults.length > 0

        // Group race results by round
        const roundMap: Record<number, {
            round: number
            raceName: string
            circuit: string
            country: string
            date: string
            drivers: {
                driverId: string
                driverName: string
                driverCode: string | null
                position: number | null
                positionText: string
                grid: number | null
                points: number | null
                status: string | null
                time: string | null
                fastestLapRank: number | null
                fastestLapTime: string | null
            }[]
        }> = {}

        for (const r of raceResults) {
            if (!roundMap[r.race.round]) {
                roundMap[r.race.round] = {
                    round: r.race.round,
                    raceName: r.race.raceName,
                    circuit: r.race.circuit?.circuitName ?? "",
                    country: r.race.circuit?.country ?? "",
                    date: r.race.date,
                    drivers: [],
                }
            }
            roundMap[r.race.round].drivers.push({
                driverId: r.driverId,
                driverName: `${r.driver.givenName} ${r.driver.familyName}`,
                driverCode: r.driver.code,
                position: r.position,
                positionText: r.positionText,
                grid: r.grid,
                points: r.points,
                status: r.status,
                time: r.time,
                fastestLapRank: r.fastestLapRank,
                fastestLapTime: r.fastestLapTime,
            })
        }

        return NextResponse.json({
            constructor: constructorRecord,
            hasSeasonData,
            standing: standing
                ? { position: standing.position, points: standing.points, wins: standing.wins, season }
                : null,
            drivers: driverStandings.map(d => ({
                driverId: d.driverId,
                driver: d.driver,
                position: d.position,
                points: d.points,
                wins: d.wins,
            })),
            raceResults: Object.values(roundMap).sort((a, b) => a.round - b.round),
            careerHistory: careerStandings.map(s => ({
                season: s.season,
                position: s.position,
                points: s.points,
                wins: s.wins,
            })),
            careerTotals: {
                seasons: careerStandings.length,
                championships,
                wins: careerWins,
                podiums: careerPodiums,
                fastestLaps: careerFastestLaps,
                points: careerPointsAgg._sum.points ?? 0,
            },
        })
    } catch (error) {
        console.error("[team detail]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}