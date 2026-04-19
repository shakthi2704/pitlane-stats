import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/football/scorers
// ?competition=PL              — required: competition code
// ?limit=20                    — default: 20, max: 50
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const code = searchParams.get("competition")
        const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50)

        if (!code) {
            return NextResponse.json(
                { error: "competition query param is required" },
                { status: 400 }
            )
        }

        const competition = await prisma.footballCompetition.findUnique({
            where: { code },
            include: {
                seasons: {
                    where: { isCurrent: true },
                    take: 1,
                },
            },
        })

        if (!competition) {
            return NextResponse.json({ error: `Competition '${code}' not found` }, { status: 404 })
        }

        const season = competition.seasons[0]
        if (!season) {
            return NextResponse.json({
                competition: { code, name: competition.name },
                season: null,
                scorers: [],
            })
        }

        const scorers = await prisma.footballScorer.findMany({
            where: { seasonId: season.id },
            orderBy: [
                { goals: "desc" },
                { assists: "desc" },
            ],
            take: limit,
            include: {
                player: {
                    select: {
                        id: true,
                        name: true,
                        firstName: true,
                        lastName: true,
                        nationality: true,
                        position: true,
                        shirtNumber: true,
                        dateOfBirth: true,
                    },
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                        shortName: true,
                        tla: true,
                        crestUrl: true,
                    },
                },
            },
        })

        return NextResponse.json({
            competition: {
                id: competition.id,
                code: competition.code,
                name: competition.name,
                shortName: competition.shortName,
                emblemUrl: competition.emblemUrl,
            },
            season: {
                id: season.id,
                year: season.year,
                currentMatchday: season.currentMatchday,
            },
            scorers,
        })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        console.error("[Football] scorers GET error:", message)
        return NextResponse.json({ error: message, scorers: [] }, { status: 500 })
    }
}