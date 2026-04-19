import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/football/players/[id]
// Returns player profile + their scorer stats across seasons + recent match events.
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const playerId = parseInt(id)

        if (isNaN(playerId)) {
            return NextResponse.json({ error: "Invalid player id" }, { status: 400 })
        }

        const player = await prisma.footballPlayer.findUnique({
            where: { id: playerId },
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        shortName: true,
                        tla: true,
                        crestUrl: true,
                        country: true,
                    },
                },
            },
        })

        if (!player) {
            return NextResponse.json({ error: `Player ${playerId} not found` }, { status: 404 })
        }

        // Scorer stats across all seasons (most recent first)
        const scorerRows = await prisma.footballScorer.findMany({
            where: { playerId },
            orderBy: { seasonId: "desc" },
            include: {
                season: {
                    select: {
                        id: true,
                        year: true,
                        competition: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                emblemUrl: true,
                            },
                        },
                    },
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                        shortName: true,
                        crestUrl: true,
                    },
                },
            },
        })

        // Recent match events (last 30 — goals, cards, subs)
        const recentEvents = await prisma.footballMatchEvent.findMany({
            where: { playerId },
            orderBy: { matchId: "desc" },
            take: 30,
            include: {
                match: {
                    select: {
                        id: true,
                        utcDate: true,
                        status: true,
                        matchday: true,
                        scoreFullHome: true,
                        scoreFullAway: true,
                        homeTeam: { select: { id: true, name: true, shortName: true, crestUrl: true } },
                        awayTeam: { select: { id: true, name: true, shortName: true, crestUrl: true } },
                        season: {
                            select: {
                                competition: {
                                    select: { id: true, code: true, name: true },
                                },
                            },
                        },
                    },
                },
            },
        })

        return NextResponse.json({
            player: {
                id: player.id,
                name: player.name,
                firstName: player.firstName,
                lastName: player.lastName,
                dateOfBirth: player.dateOfBirth,
                nationality: player.nationality,
                position: player.position,
                shirtNumber: player.shirtNumber,
                marketValue: player.marketValue,
                team: player.team,
            },
            scorerStats: scorerRows,
            recentEvents,
        })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        console.error("[Football] player GET error:", message)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}