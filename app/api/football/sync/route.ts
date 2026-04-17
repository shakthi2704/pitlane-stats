import { NextRequest, NextResponse } from "next/server"
import {
    seedCompetitions,
    syncCompetition,
    syncAllPhase1,
    syncCurrentMatchday,
    syncMatchEvents,
    syncStandings,
    syncMatches,
    syncScorers,
    syncSquads,
} from "@/lib/football-sync"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}))
        const { type = "current", competition, seasonId } = body

        let result: unknown

        switch (type) {

            // ── Seed competition rows (run once before anything else) ──────────
            // POST { "type": "seed" }
            case "seed":
                result = await seedCompetitions()
                break

            // ── Full sync for one competition ─────────────────────────────────
            // POST { "type": "competition", "competition": "PL" }
            case "competition":
                if (!competition)
                    return NextResponse.json({ error: "competition code is required" }, { status: 400 })
                result = await syncCompetition(competition)
                break

            // ── Full sync for all Phase 1 competitions ────────────────────────
            // POST { "type": "all" }
            case "all":
                result = await syncAllPhase1()
                break

            // ── Fast refresh — standings + matches + scorers only ─────────────
            // POST { "type": "current" }
            case "current":
                result = await syncCurrentMatchday()
                break

            // ── Sync match events for a season (slow — one req per match) ─────
            // POST { "type": "events", "seasonId": 1234 }
            case "events": {
                if (!seasonId)
                    return NextResponse.json({ error: "seasonId is required" }, { status: 400 })
                result = await syncMatchEvents(parseInt(seasonId))
                break
            }

            // ── Granular: standings only ──────────────────────────────────────
            // POST { "type": "standings", "competition": "PL", "seasonId": 1234 }
            case "standings": {
                if (!competition || !seasonId)
                    return NextResponse.json(
                        { error: "competition and seasonId are required" },
                        { status: 400 }
                    )
                result = await syncStandings(competition, parseInt(seasonId))
                break
            }

            // ── Granular: matches only ────────────────────────────────────────
            // POST { "type": "matches", "competition": "PL", "seasonId": 1234 }
            case "matches": {
                if (!competition || !seasonId)
                    return NextResponse.json(
                        { error: "competition and seasonId are required" },
                        { status: 400 }
                    )
                result = await syncMatches(competition, parseInt(seasonId))
                break
            }

            // ── Granular: scorers only ────────────────────────────────────────
            // POST { "type": "scorers", "competition": "PL", "seasonId": 1234 }
            case "scorers": {
                if (!competition || !seasonId)
                    return NextResponse.json(
                        { error: "competition and seasonId are required" },
                        { status: 400 }
                    )
                result = await syncScorers(competition, parseInt(seasonId))
                break
            }

            // ── Granular: squads only ─────────────────────────────────────────
            // POST { "type": "squads", "competition": "PL" }
            case "squads": {
                if (!competition)
                    return NextResponse.json({ error: "competition code is required" }, { status: 400 })
                result = await syncSquads(competition)
                break
            }

            // ── Status: what's been synced ────────────────────────────────────
            // POST { "type": "status" }
            case "status": {
                const [competitions, recentLogs] = await Promise.all([
                    prisma.footballCompetition.findMany({
                        include: {
                            seasons: {
                                where: { isCurrent: true },
                                select: {
                                    id: true,
                                    year: true,
                                    currentMatchday: true,
                                    _count: {
                                        select: { matches: true, standings: true, scorers: true },
                                    },
                                },
                            },
                        },
                        orderBy: { plan: "asc" },
                    }),
                    prisma.syncLog.findMany({
                        where: { sport: "football" },
                        orderBy: { syncedAt: "desc" },
                        take: 20,
                    }),
                ])
                result = { competitions, recentLogs }
                break
            }

            default:
                return NextResponse.json({ error: `Unknown sync type: ${type}` }, { status: 400 })
        }

        return NextResponse.json({ ok: true, type, result })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        console.error("[Football Sync] Error:", message)
        return NextResponse.json({ ok: false, error: message }, { status: 500 })
    }
}