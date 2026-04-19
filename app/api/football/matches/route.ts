import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/football/matches
// ?competition=PL              — required: competition code
// ?matchday=33                 — optional: filter by matchday number
// ?status=FINISHED|TIMED|IN_PLAY|SCHEDULED  — optional: filter by status
// ?stage=GROUP_STAGE           — optional: for WC/CL knockout stages
// ?limit=20                    — default: 50
// ?offset=0                    — default: 0  (for pagination)
// ?dateFrom=2025-01-01         — optional: filter by date range
// ?dateTo=2025-01-31           — optional: filter by date range
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const code = searchParams.get("competition")
        const matchday = searchParams.get("matchday")
        const status = searchParams.get("status")
        const stage = searchParams.get("stage")
        const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200)
        const offset = parseInt(searchParams.get("offset") ?? "0")
        const dateFrom = searchParams.get("dateFrom")
        const dateTo = searchParams.get("dateTo")

        if (!code) {
            return NextResponse.json(
                { error: "competition query param is required" },
                { status: 400 }
            )
        }

        // Resolve current season for this competition
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
                matches: [],
                total: 0,
            })
        }

        // Build where clause dynamically
        const where: Record<string, unknown> = { seasonId: season.id }
        if (matchday) where.matchday = parseInt(matchday)
        if (status) where.status = status
        if (stage) where.stage = stage
        if (dateFrom || dateTo) {
            where.utcDate = {
                ...(dateFrom ? { gte: dateFrom } : {}),
                ...(dateTo ? { lte: dateTo + "T23:59:59Z" } : {}),
            }
        }

        const [matches, total] = await Promise.all([
            prisma.footballMatch.findMany({
                where,
                orderBy: { utcDate: "asc" },
                take: limit,
                skip: offset,
                include: {
                    homeTeam: {
                        select: {
                            id: true,
                            name: true,
                            shortName: true,
                            tla: true,
                            crestUrl: true,
                        },
                    },
                    awayTeam: {
                        select: {
                            id: true,
                            name: true,
                            shortName: true,
                            tla: true,
                            crestUrl: true,
                        },
                    },
                },
            }),
            prisma.footballMatch.count({ where }),
        ])

        // Collect distinct matchdays for the selector UI
        const matchdayRows = await prisma.footballMatch.findMany({
            where: { seasonId: season.id },
            select: { matchday: true },
            distinct: ["matchday"],
            orderBy: { matchday: "asc" },
        })
        const matchdays = matchdayRows
            .map((r) => r.matchday)
            .filter((m): m is number => m !== null)

        return NextResponse.json({
            competition: {
                id: competition.id,
                code: competition.code,
                name: competition.name,
                shortName: competition.shortName,
                emblemUrl: competition.emblemUrl,
                type: competition.type,
            },
            season: {
                id: season.id,
                year: season.year,
                currentMatchday: season.currentMatchday,
            },
            matchdays,
            total,
            limit,
            offset,
            matches,
        })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        console.error("[Football] matches GET error:", message)
        return NextResponse.json({ error: message, matches: [], total: 0 }, { status: 500 })
    }
}