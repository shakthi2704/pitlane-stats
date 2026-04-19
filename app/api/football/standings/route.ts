import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/football/standings
// ?competition=PL              — required: competition code
// ?type=TOTAL|HOME|AWAY        — default: TOTAL
// ?stage=REGULAR_SEASON        — optional: filter by stage (omit to get all stages)
// ?group=A                     — optional: for WC/CL group-stage filtering
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const code = searchParams.get("competition")
        const type = searchParams.get("type") ?? "TOTAL"
        const stage = searchParams.get("stage")  // null = no filter, returns all stages
        const group = searchParams.get("group")

        if (!code) {
            return NextResponse.json(
                { error: "competition query param is required" },
                { status: 400 }
            )
        }

        const competition = await prisma.footballCompetition.findUnique({
            where: { code },
            include: {
                seasons: { where: { isCurrent: true }, take: 1 },
            },
        })

        if (!competition) {
            return NextResponse.json({ error: `Competition '${code}' not found` }, { status: 404 })
        }

        const season = competition.seasons[0]
        if (!season) {
            return NextResponse.json({
                competition: { code, name: competition.name },
                season: null, standings: [], groups: [], stages: [],
            })
        }

        const standings = await prisma.footballStanding.findMany({
            where: {
                seasonId: season.id,
                type,
                ...(stage ? { stage } : {}),
                ...(group ? { group } : {}),
            },
            orderBy: [{ stage: "asc" }, { group: "asc" }, { position: "asc" }],
            include: {
                team: {
                    select: { id: true, name: true, shortName: true, tla: true, crestUrl: true },
                },
            },
        })

        // Collect distinct stages and groups for UI selectors
        const stages = [...new Set(standings.map((s) => s.stage).filter(Boolean))] as string[]
        const groups = [...new Set(standings.map((s) => s.group).filter(Boolean))] as string[]

        return NextResponse.json({
            competition: {
                id: competition.id, code: competition.code, name: competition.name,
                shortName: competition.shortName, emblemUrl: competition.emblemUrl,
                type: competition.type,
            },
            season: {
                id: season.id, year: season.year,
                currentMatchday: season.currentMatchday,
                startDate: season.startDate, endDate: season.endDate,
            },
            type, stage, stages, groups, standings,
        })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        console.error("[Football] standings GET error:", message)
        return NextResponse.json({ error: message, standings: [], groups: [], stages: [] }, { status: 500 })
    }
}