import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params
    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get("year") ?? new Date().getFullYear().toString())

    // ── Rider base info ──────────────────────────────────────────────────────
    const rider = await prisma.motoGPRider.findUnique({
        where: { id },
        include: { category: true },
    })
    if (!rider) return NextResponse.json({ error: "Rider not found" }, { status: 404 })

    // ── Current season standing ──────────────────────────────────────────────
    const season = await prisma.motoGPSeason.findFirst({ where: { year } })

    const currentStanding = season ? await prisma.motoGPRiderStanding.findFirst({
        where: { riderId: id, seasonId: season.id },
        include: { category: true },
    }) : null

    // ── Season race results (RAC + SPR sessions only) ────────────────────────
    const raceResults = await prisma.motoGPResult.findMany({
        where: {
            riderId: id,
            session: {
                type: { in: ["RAC", "SPR"] },
                event: {
                    season: { year },
                    isTest: false,
                },
            },
        },
        orderBy: { session: { date: "asc" } },
        include: {
            session: {
                include: {
                    event: {
                        include: { circuit: true },
                    },
                },
            },
            team: true,
            constructor: true,
        },
    })

    // ── Career history — all seasons this rider has standing data ────────────
    const careerStandings = await prisma.motoGPRiderStanding.findMany({
        where: { riderId: id },
        orderBy: { season: { year: "desc" } },
        include: {
            season: true,
            category: true,
        },
    })

    // ── Career totals ─────────────────────────────────────────────────────────
    const careerTotals = careerStandings.reduce(
        (acc, s) => ({
            seasons: acc.seasons + 1,
            wins: acc.wins + s.raceWins,
            podiums: acc.podiums + s.podiums,
            sprintWins: acc.sprintWins + s.sprintWins,
            points: acc.points + s.points,
            championships: acc.championships + (s.position === 1 ? 1 : 0),
        }),
        { seasons: 0, wins: 0, podiums: 0, sprintWins: 0, points: 0, championships: 0 }
    )

    // ── Season stats from race results ────────────────────────────────────────
    const raceOnly = raceResults.filter(r => r.session.type === "RAC")
    const seasonStats = {
        races: raceOnly.length,
        dnfs: raceOnly.filter(r => r.status === "DNF" || r.status === "DNS" || r.status === "INSTND").length,
        pointsFinishes: raceOnly.filter(r => (r.points ?? 0) > 0).length,
        bestFinish: raceOnly.reduce((best, r) => {
            const pos = r.position ?? 99
            return pos < best ? pos : best
        }, 99),
        sprintRaces: raceResults.filter(r => r.session.type === "SPR").length,
    }

    // Shape race results for the frontend
    const formattedResults = raceResults.map(r => ({
        sessionId: r.session.id,
        sessionType: r.session.type,
        eventId: r.session.event.id,
        eventName: r.session.event.sponsoredName ?? r.session.event.name,
        shortName: r.session.event.shortName,
        circuitName: r.session.event.circuit?.name ?? "—",
        nation: r.session.event.circuit?.nation ?? "",
        date: r.session.date,
        position: r.position,
        status: r.status,
        points: r.points,
        time: r.time,
        gapFirst: r.gapFirst,
        totalLaps: r.totalLaps,
        averageSpeed: r.averageSpeed,
        constructorName: r.constructor?.name ?? null,
        teamName: r.team?.name ?? null,
    }))

    return NextResponse.json({
        rider: {
            id: rider.id,
            fullName: rider.fullName,
            firstName: rider.firstName,
            lastName: rider.lastName,
            nationality: rider.nationality,
            number: rider.number,
            photoUrl: rider.photoUrl,
            birthDate: rider.birthDate,
            birthCity: rider.birthCity,
            category: rider.category.name,
        },
        currentStanding: currentStanding ? {
            position: currentStanding.position,
            points: currentStanding.points,
            raceWins: currentStanding.raceWins,
            podiums: currentStanding.podiums,
            sprintWins: currentStanding.sprintWins,
            teamName: currentStanding.teamName,
            constructorName: currentStanding.constructorName,
            category: currentStanding.category.name,
        } : null,
        seasonStats,
        raceResults: formattedResults,
        careerHistory: careerStandings.map(s => ({
            year: s.season.year,
            position: s.position,
            points: s.points,
            raceWins: s.raceWins,
            podiums: s.podiums,
            sprintWins: s.sprintWins,
            teamName: s.teamName,
            constructorName: s.constructorName,
            category: s.category.name,
        })),
        careerTotals,
    })
}