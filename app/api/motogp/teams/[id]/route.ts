import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { MOTOGP_CATEGORIES } from "@/lib/motogp-sync"

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params
    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get("year") ?? new Date().getFullYear().toString())
    const cat = searchParams.get("category") ?? "MotoGP"

    const categoryId = MOTOGP_CATEGORIES[cat as keyof typeof MOTOGP_CATEGORIES]?.id
        ?? MOTOGP_CATEGORIES.MotoGP.id

    // ── Team base ────────────────────────────────────────────────────────────
    const team = await prisma.motoGPTeam.findUnique({ where: { id } })
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 })

    const season = await prisma.motoGPSeason.findFirst({ where: { year } })

    // ── Season standing ──────────────────────────────────────────────────────
    const standing = season ? await prisma.motoGPTeamStanding.findFirst({
        where: { teamId: id, seasonId: season.id, categoryId },
    }) : null

    // ── Riders this season ───────────────────────────────────────────────────
    const riderStandings = season ? await prisma.motoGPRiderStanding.findMany({
        where: { seasonId: season.id, categoryId, teamName: team.name },
        orderBy: { position: "asc" },
        include: { rider: true },
    }) : []

    // ── Race results for this season (RAC + SPR, this team's riders) ─────────
    const raceResults = season ? await prisma.motoGPResult.findMany({
        where: {
            teamId: id,
            session: {
                type: { in: ["RAC", "SPR"] },
                event: { seasonId: season.id, categoryId, isTest: false },
            },
        },
        orderBy: { session: { date: "asc" } },
        include: {
            rider: true,
            session: {
                include: {
                    event: { include: { circuit: true } },
                },
            },
        },
    }) : []

    // Group race results by event so we can show per-event rows
    const eventMap: Record<string, {
        eventId: string
        eventName: string
        shortName: string
        nation: string
        date: string | null
        results: {
            riderId: string
            riderName: string
            riderNumber: number | null
            sessionType: string
            position: number | null
            status: string | null
            points: number | null
            time: string | null
            gapFirst: string | null
        }[]
    }> = {}

    for (const r of raceResults) {
        const ev = r.session.event
        if (!eventMap[ev.id]) {
            eventMap[ev.id] = {
                eventId: ev.id,
                eventName: ev.sponsoredName ?? ev.name,
                shortName: ev.shortName,
                nation: ev.circuit?.nation ?? "",
                date: r.session.date,
                results: [],
            }
        }
        eventMap[ev.id].results.push({
            riderId: r.rider.id,
            riderName: r.rider.fullName,
            riderNumber: r.rider.number,
            sessionType: r.session.type,
            position: r.position,
            status: r.status,
            points: r.points,
            time: r.time,
            gapFirst: r.gapFirst,
        })
    }

    // ── Career history ────────────────────────────────────────────────────────
    const careerStandings = await prisma.motoGPTeamStanding.findMany({
        where: { teamId: id, categoryId },
        orderBy: { season: { year: "desc" } },
        include: { season: true },
    })

    const careerTotals = careerStandings.reduce(
        (acc, s) => ({
            seasons: acc.seasons + 1,
            wins: acc.wins + s.wins,
            points: acc.points + s.points,
            championships: acc.championships + (s.position === 1 ? 1 : 0),
        }),
        { seasons: 0, wins: 0, points: 0, championships: 0 }
    )

    return NextResponse.json({
        team: {
            id: team.id,
            name: team.name,
            color: team.color,
        },
        standing: standing ? {
            position: standing.position,
            points: standing.points,
            wins: standing.wins,
        } : null,
        riders: riderStandings.map(rs => ({
            id: rs.rider.id,
            fullName: rs.rider.fullName,
            firstName: rs.rider.firstName,
            lastName: rs.rider.lastName,
            nationality: rs.rider.nationality,
            number: rs.rider.number,
            photoUrl: rs.rider.photoUrl,
            position: rs.position,
            points: rs.points,
            raceWins: rs.raceWins,
            podiums: rs.podiums,
            constructorName: rs.constructorName,
        })),
        raceResults: Object.values(eventMap),
        careerHistory: careerStandings.map(s => ({
            year: s.season.year,
            position: s.position,
            points: s.points,
            wins: s.wins,
        })),
        careerTotals,
    })
}