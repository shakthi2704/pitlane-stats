import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/football/competitions
// Returns all competitions with their current season info.
// ?type=LEAGUE|CUP|TOURNAMENT  — optional filter
// ?plan=TIER_ONE               — optional filter (TIER_ONE = active, TIER_TWO = coming soon)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const type = searchParams.get("type")     // "LEAGUE" | "CUP" | "TOURNAMENT"
        const plan = searchParams.get("plan")     // "TIER_ONE" | "TIER_TWO"

        const competitions = await prisma.footballCompetition.findMany({
            where: {
                ...(type ? { type } : {}),
                ...(plan ? { plan } : {}),
            },
            include: {
                seasons: {
                    where: { isCurrent: true },
                    select: {
                        id: true,
                        year: true,
                        startDate: true,
                        endDate: true,
                        currentMatchday: true,
                        _count: {
                            select: {
                                matches: true,
                                standings: true,
                                scorers: true,
                            },
                        },
                    },
                    take: 1,
                },
            },
            orderBy: [
                { plan: "asc" },   // TIER_ONE before TIER_TWO
                { name: "asc" },
            ],
        })

        // Flatten: attach the single current season directly on each competition
        const result = competitions.map((c) => ({
            id: c.id,
            code: c.code,
            name: c.name,
            shortName: c.shortName,
            emblemUrl: c.emblemUrl,
            country: c.country,
            countryCode: c.countryCode,
            type: c.type,
            plan: c.plan,
            isCurrent: c.isCurrent,
            currentSeason: c.seasons[0] ?? null,
        }))

        return NextResponse.json({ competitions: result })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        console.error("[Football] competitions GET error:", message)
        return NextResponse.json({ error: message, competitions: [] }, { status: 500 })
    }
}