import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const season = request.nextUrl.searchParams.get("season") ?? "2025"

        // Current season standing — driver relation only (no constructor relation on F1DriverStanding)
        const currentStanding = await prisma.f1DriverStanding.findFirst({
            where: { driverId: id, season },
            include: { driver: true },
        })

        // If not found in requested season, try any season so we still get driver info
        const fallbackStanding = !currentStanding
            ? await prisma.f1DriverStanding.findFirst({
                where: { driverId: id },
                orderBy: { season: "desc" },
                include: { driver: true },
            })
            : null

        const standing = currentStanding ?? fallbackStanding

        if (!standing) {
            return NextResponse.json({ error: "Driver not found" }, { status: 404 })
        }

        // Career history — all seasons (constructorId + constructorName are plain string fields)
        const careerStandings = await prisma.f1DriverStanding.findMany({
            where: { driverId: id },
            orderBy: { season: "desc" },
        })

        // Season stats from race results
        const [podiums, pointsFinishes, fastestLaps, dnfs] = await Promise.all([
            prisma.f1RaceResult.count({
                where: { driverId: id, race: { season }, position: { in: [1, 2, 3] } },
            }),
            prisma.f1RaceResult.count({
                where: { driverId: id, race: { season }, points: { gt: 0 } },
            }),
            prisma.f1RaceResult.count({
                where: { driverId: id, race: { season }, fastestLapRank: 1 },
            }),
            prisma.f1RaceResult.count({
                where: {
                    driverId: id,
                    race: { season },
                    status: { not: "Finished" },
                    positionText: {
                        notIn: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
                            "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"],
                    },
                },
            }),
        ])

        // Teammate this season — same constructorId, different driver
        const teammateStanding = currentStanding
            ? await prisma.f1DriverStanding.findFirst({
                where: {
                    season,
                    constructorId: currentStanding.constructorId,
                    driverId: { not: id },
                },
                include: { driver: true },
            })
            : null

        // Career totals
        const [careerTotals, careerWins, careerPodiums, careerFastestLaps] = await Promise.all([
            prisma.f1RaceResult.aggregate({
                where: { driverId: id },
                _sum: { points: true },
                _count: { id: true },
            }),
            prisma.f1RaceResult.count({ where: { driverId: id, position: 1 } }),
            prisma.f1RaceResult.count({ where: { driverId: id, position: { in: [1, 2, 3] } } }),
            prisma.f1RaceResult.count({ where: { driverId: id, fastestLapRank: 1 } }),
        ])

        const championships = careerStandings.filter(s => s.position === 1).length

        return NextResponse.json({
            driver: standing.driver,
            constructorId: standing.constructorId,
            constructorName: standing.constructorName,
            currentStanding: currentStanding
                ? {
                    position: currentStanding.position,
                    points: currentStanding.points,
                    wins: currentStanding.wins,
                    season,
                }
                : null,
            seasonStats: { podiums, pointsFinishes, fastestLaps, dnfs },
            careerHistory: careerStandings.map(s => ({
                season: s.season,
                position: s.position,
                points: s.points,
                wins: s.wins,
                constructorId: s.constructorId,
                constructorName: s.constructorName,
            })),
            careerTotals: {
                races: careerTotals._count.id,
                points: careerTotals._sum.points ?? 0,
                wins: careerWins,
                podiums: careerPodiums,
                fastestLaps: careerFastestLaps,
                championships,
            },
            teammate: teammateStanding
                ? {
                    driverId: teammateStanding.driverId,
                    driver: teammateStanding.driver,
                    position: teammateStanding.position,
                    points: teammateStanding.points,
                    wins: teammateStanding.wins,
                }
                : null,
        })
    } catch (error) {
        console.error("[driver profile]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}