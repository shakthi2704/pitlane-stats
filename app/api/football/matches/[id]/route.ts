import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/football/matches/[id]
// Returns full match detail including all match events (goals, cards, subs).
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const matchId = parseInt(id)

        if (isNaN(matchId)) {
            return NextResponse.json({ error: "Invalid match id" }, { status: 400 })
        }

        const match = await prisma.footballMatch.findUnique({
            where: { id: matchId },
            include: {
                homeTeam: true,
                awayTeam: true,
                season: {
                    include: {
                        competition: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                shortName: true,
                                emblemUrl: true,
                                type: true,
                            },
                        },
                    },
                },
                events: {
                    orderBy: [
                        { minute: "asc" },
                        { extraMinute: "asc" },
                    ],
                    include: {
                        player: {
                            select: {
                                id: true,
                                name: true,
                                nationality: true,
                                position: true,
                                shirtNumber: true,
                            },
                        },
                    },
                },
            },
        })

        if (!match) {
            return NextResponse.json({ error: `Match ${matchId} not found` }, { status: 404 })
        }

        // Separate events by team side for timeline rendering
        const homeEvents = match.events.filter((e) => e.teamSide === "HOME")
        const awayEvents = match.events.filter((e) => e.teamSide === "AWAY")

        return NextResponse.json({
            match: {
                id: match.id,
                utcDate: match.utcDate,
                status: match.status,
                matchday: match.matchday,
                stage: match.stage,
                group: match.group,
                lastUpdated: match.lastUpdated,
                // Scores
                score: {
                    fullTime: { home: match.scoreFullHome, away: match.scoreFullAway },
                    halfTime: { home: match.scoreHalfHome, away: match.scoreHalfAway },
                    extraTime: { home: match.scoreExtraHome, away: match.scoreExtraAway },
                    penalties: { home: match.scorePenHome, away: match.scorePenAway },
                    winner: match.winner,
                },
                // Teams
                homeTeam: match.homeTeam,
                awayTeam: match.awayTeam,
                // Referee
                refereeName: match.refereeName,
                // Competition / season context
                competition: match.season.competition,
                season: {
                    id: match.season.id,
                    year: match.season.year,
                },
                // Events
                events: match.events,
                homeEvents,
                awayEvents,
            },
        })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        console.error("[Football] match detail GET error:", message)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}