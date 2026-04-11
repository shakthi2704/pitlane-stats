import { prisma } from "@/lib/prisma"

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE = "https://api.motogp.pulselive.com/motogp/v1"

// Category UUIDs are stable across all seasons
export const MOTOGP_CATEGORIES = {
    MotoGP: { id: "e8c110ad-64aa-4e8e-8a86-f2f152f6a942", legacyId: 3, name: "MotoGP™" },
    Moto2: { id: "549640b8-fd9c-4245-acfd-60e4bc38b25c", legacyId: 2, name: "Moto2™" },
    Moto3: { id: "954f7e65-2ef2-4423-b949-4961cc603e45", legacyId: 1, name: "Moto3™" },
} as const

export const MOTOGP_CATEGORY_IDS = Object.values(MOTOGP_CATEGORIES).map(c => c.id)

// Seasons to sync: 2015 → current
export const MOTOGP_SYNC_YEARS = [
    2015, 2016, 2017, 2018, 2019,
    2020, 2021, 2022, 2023, 2024, 2025, 2026,
]

// ─── API Client ───────────────────────────────────────────────────────────────

async function mgpGet<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: { "Accept": "application/json" },
        next: { revalidate: 0 },
    })
    if (!res.ok) throw new Error(`MotoGP API ${res.status}: ${BASE}${path}`)
    return res.json()
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function logSync(
    dataType: string,
    season: string,
    round: string | null,
    success: boolean,
    error?: string
) {
    await prisma.syncLog.create({
        data: { sport: "motogp", dataType, season, round, success, error },
    })
}

async function isStale(dataType: string, season: string, round?: string): Promise<boolean> {
    const staleMinutes = parseInt(process.env.SYNC_STALE_MINUTES ?? "60")
    const threshold = new Date(Date.now() - staleMinutes * 60 * 1000)
    const last = await prisma.syncLog.findFirst({
        where: {
            sport: "motogp",
            dataType,
            season,
            round: round ?? null,
            success: true,
            syncedAt: { gte: threshold },
        },
        orderBy: { syncedAt: "desc" },
    })
    return !last
}

// ─── API Types ────────────────────────────────────────────────────────────────

interface ApiSeason {
    id: string
    year: number
    current: boolean
}

interface ApiCategory {
    id: string
    name: string
    legacy_id: number
}

interface ApiEvent {
    id: string
    name: string
    short_name: string
    sponsored_name?: string
    date_start: string
    date_end: string
    status?: string
    test: boolean
    circuit?: { id: string; name: string; legacy_id?: number; place?: string; nation?: string }
    country?: { iso: string; name: string }
    season: { id: string; year: number }
}

interface ApiSession {
    id: string
    type: string
    date?: string
    status?: string
    number?: number
    condition?: {
        track?: string
        air?: string
        humidity?: string
        ground?: string
        weather?: string
    }
}

interface ApiRider {
    id: string
    full_name: string
    country?: { iso: string }
    legacy_id?: number
    number?: number
    riders_api_uuid?: string
    riders_id?: string
}

interface ApiResult {
    id: string
    position?: number
    status?: string
    points?: number
    time?: string
    gap?: { first?: string; prev?: string; lap?: number }
    average_speed?: number
    total_laps?: number
    best_lap?: { number?: number; time?: string }
    top_speed?: number
    rider: ApiRider
    team?: { id: string; name: string; legacy_id?: number }
    constructor?: { id: string; name: string; legacy_id?: number }
}

interface ApiStandingEntry {
    id: string
    position: number
    points: number
    race_wins?: number
    podiums?: number
    sprint_wins?: number
    sprint_podiums?: number
    rider?: ApiRider
    team?: { id: string; name: string; legacy_id?: number }
    constructor?: { id: string; name: string; legacy_id?: number }
}

interface ApiClassification {
    classification: ApiResult[]
    records?: unknown[]
}

// ─── Seed categories (run once) ───────────────────────────────────────────────

export async function seedCategories() {
    for (const cat of Object.values(MOTOGP_CATEGORIES)) {
        await prisma.motoGPCategory.upsert({
            where: { id: cat.id },
            update: { name: cat.name, legacyId: cat.legacyId },
            create: { id: cat.id, name: cat.name, legacyId: cat.legacyId },
        })
    }
    return { synced: 3 }
}

// ─── Sync seasons ─────────────────────────────────────────────────────────────

export async function syncSeasons() {
    const allSeasons = await mgpGet<ApiSeason[]>("/results/seasons")
    const toSync = allSeasons.filter(s => MOTOGP_SYNC_YEARS.includes(s.year))

    for (const s of toSync) {
        await prisma.motoGPSeason.upsert({
            where: { id: s.id },
            update: { year: s.year, current: s.current ?? false },
            create: { id: s.id, year: s.year, current: s.current ?? false },
        })
    }

    return { synced: toSync.length }
}

// ─── Sync events (race calendar) for one season + category ───────────────────

export async function syncEvents(seasonId: string, categoryId: string, year: number) {
    const season = String(year)
    try {
        const events = await mgpGet<ApiEvent[]>(
            `/results/events?seasonUuid=${seasonId}&categoryUuid=${categoryId}`
        )

        // Only race events, no tests
        const raceEvents = events.filter(e => !e.test && !e.name?.toLowerCase().includes("test"))

        for (const e of raceEvents) {
            // Upsert circuit if present
            if (e.circuit?.id) {
                await prisma.motoGPCircuit.upsert({
                    where: { id: e.circuit.id },
                    update: {
                        name: e.circuit.name,
                        place: e.circuit.place ?? null,
                        nation: e.circuit.nation ?? null,
                        legacyId: e.circuit.legacy_id ?? null,
                    },
                    create: {
                        id: e.circuit.id,
                        name: e.circuit.name,
                        place: e.circuit.place ?? null,
                        nation: e.circuit.nation ?? null,
                        legacyId: e.circuit.legacy_id ?? null,
                    },
                })
            }

            await prisma.motoGPEvent.upsert({
                // where: {
                //     seasonId_categoryId_shortName: {
                //         seasonId,
                //         categoryId,
                //         shortName: e.short_name ?? e.id,
                //     },
                // },
                where: { id: e.id },
                update: {
                    name: e.name,
                    sponsoredName: e.sponsored_name ?? null,
                    dateStart: e.date_start,
                    dateEnd: e.date_end,
                    status: e.status ?? null,
                    circuitId: e.circuit?.id ?? null,
                },
                create: {
                    id: e.id,
                    seasonId,
                    categoryId,
                    circuitId: e.circuit?.id ?? null,
                    name: e.name,
                    shortName: e.short_name ?? e.id,
                    sponsoredName: e.sponsored_name ?? null,
                    dateStart: e.date_start,
                    dateEnd: e.date_end,
                    status: e.status ?? null,
                    isTest: false,
                },
            })
        }

        await logSync("events", season, null, true)
        return { synced: raceEvents.length }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        await logSync("events", season, null, false, message)
        throw err
    }
}

// ─── Sync sessions for one event ─────────────────────────────────────────────

export async function syncSessions(eventId: string, categoryId: string, season: string) {
    try {
        const sessions = await mgpGet<ApiSession[]>(
            `/results/sessions?eventUuid=${eventId}&categoryUuid=${categoryId}`
        )

        // Track session numbers for Q1/Q2, FP1/FP2 etc.
        const typeCounts: Record<string, number> = {}

        for (const s of sessions) {
            typeCounts[s.type] = (typeCounts[s.type] ?? 0) + 1
            const sessionNumber = typeCounts[s.type]

            await prisma.motoGPSession.upsert({
                where: { id: s.id },
                update: {
                    type: s.type,
                    sessionNumber,
                    date: s.date ?? null,
                    status: s.status ?? null,
                    trackCondition: s.condition?.track ?? null,
                    airTemp: s.condition?.air ?? null,
                    humidity: s.condition?.humidity ?? null,
                    groundTemp: s.condition?.ground ?? null,
                    weather: s.condition?.weather ?? null,
                },
                create: {
                    id: s.id,
                    eventId,
                    type: s.type,
                    sessionNumber,
                    date: s.date ?? null,
                    status: s.status ?? null,
                    trackCondition: s.condition?.track ?? null,
                    airTemp: s.condition?.air ?? null,
                    humidity: s.condition?.humidity ?? null,
                    groundTemp: s.condition?.ground ?? null,
                    weather: s.condition?.weather ?? null,
                },
            })
        }

        return { synced: sessions.length, sessions }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        await logSync("sessions", season, eventId, false, message)
        throw err
    }
}

// ─── Upsert rider ─────────────────────────────────────────────────────────────

// async function upsertRider(rider: ApiRider, categoryId: string) {
//     const riderId = rider.riders_api_uuid ?? rider.riders_id ?? rider.id
//     await prisma.motoGPRider.upsert({
//         where: { id: riderId },
//         update: {
//             fullName: rider.full_name,
//             nationality: rider.country?.iso ?? null,
//             number: rider.number ?? null,
//             legacyId: rider.legacy_id ?? null,
//         },
//         create: {
//             id: riderId,
//             fullName: rider.full_name,
//             nationality: rider.country?.iso ?? null,
//             number: rider.number ?? null,
//             legacyId: rider.legacy_id ?? null,
//             categoryId,
//         },
//     })
//     return riderId
// }

async function upsertRider(rider: ApiRider, categoryId: string) {
    const riderId = rider.riders_api_uuid ?? rider.riders_id ?? rider.id

    // Fetch photo URL from rider profile API
    let photoUrl: string | null = null
    try {
        const profile = await mgpGet<any>(`/riders/${riderId}`)
        const career = Array.isArray(profile.career)
            ? profile.career
            : Object.values(profile.career ?? {})
        const current = (career as any[]).find((c: any) => c.current) ?? career[0]
        photoUrl = current?.pictures?.profile?.main ?? null
    } catch {
        // photo fetch failed — continue without it
    }

    await prisma.motoGPRider.upsert({
        where: { id: riderId },
        update: {
            fullName: rider.full_name,
            nationality: rider.country?.iso ?? null,
            number: rider.number ?? null,
            legacyId: rider.legacy_id ?? null,
            ...(photoUrl ? { photoUrl } : {}),
        },
        create: {
            id: riderId,
            fullName: rider.full_name,
            nationality: rider.country?.iso ?? null,
            number: rider.number ?? null,
            legacyId: rider.legacy_id ?? null,
            categoryId,
            photoUrl,
        },
    })
    return riderId
}

// ─── Sync rider photos (run after standings sync) ─────────────────────────────
export async function syncRiderPhotos(year: number) {
    const season = await prisma.motoGPSeason.findFirst({ where: { year } })
    if (!season) throw new Error(`Season ${year} not found`)

    const standings = await prisma.motoGPRiderStanding.findMany({
        where: { seasonId: season.id },
        include: { rider: true },
        distinct: ["riderId"],
    })

    console.log(`Fetching photos for ${standings.length} riders...`)
    let updated = 0
    let failed = 0
    const errors: string[] = []   // ← collect errors

    for (const s of standings) {
        try {
            const profile = await mgpGet<any>(`/riders/${s.riderId}`)
            const career = Array.isArray(profile.career)
                ? profile.career
                : Object.values(profile.career ?? {})
            const current = (career as any[]).find((c: any) => c.current) ?? career[0]
            const photoUrl = current?.pictures?.profile?.main ?? null

            if (photoUrl) {
                await prisma.motoGPRider.update({
                    where: { id: s.riderId },
                    data: { photoUrl },
                })
                updated++
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            errors.push(`${s.riderId}: ${msg}`)  // ← log it
            failed++
        }
    }

    return { total: standings.length, updated, failed, errors: errors.slice(0, 5) }
    //                                                   ↑ first 5 errors only
}
// ─── Upsert team ──────────────────────────────────────────────────────────────

async function upsertTeam(team: { id: string; name: string; legacy_id?: number }) {
    await prisma.motoGPTeam.upsert({
        where: { id: team.id },
        update: { name: team.name, legacyId: team.legacy_id ?? null },
        create: { id: team.id, name: team.name, legacyId: team.legacy_id ?? null },
    })
}

// ─── Upsert constructor ───────────────────────────────────────────────────────

async function upsertConstructor(constructor: { id: string; name: string; legacy_id?: number }) {
    await prisma.motoGPConstructor.upsert({
        where: { id: constructor.id },
        update: { name: constructor.name, legacyId: constructor.legacy_id ?? null },
        create: { id: constructor.id, name: constructor.name, legacyId: constructor.legacy_id ?? null },
    })
}

// ─── Sync results for one session ─────────────────────────────────────────────

export async function syncSessionResults(
    sessionId: string,
    categoryId: string,
    season: string
) {
    try {
        const data = await mgpGet<ApiClassification>(
            `/results/session/${sessionId}/classification`
        )
        const results = data.classification ?? []
        if (!results.length) return { synced: 0 }

        for (const r of results) {
            // Upsert rider
            const riderId = await upsertRider(r.rider, categoryId)

            // Upsert team + constructor if present
            if (r.team) await upsertTeam(r.team)
            if (r.constructor) await upsertConstructor(r.constructor)

            await prisma.motoGPResult.upsert({
                where: { sessionId_riderId: { sessionId, riderId } },
                update: {
                    position: r.position ?? null,
                    status: r.status ?? null,
                    points: r.points ?? null,
                    time: r.time ?? null,
                    gapFirst: r.gap?.first ?? null,
                    gapLap: r.gap?.lap != null ? parseInt(String(r.gap.lap)) : null,
                    averageSpeed: r.average_speed ?? null,
                    totalLaps: r.total_laps ?? null,
                    bestLapTime: r.best_lap?.time ?? null,
                    bestLapNumber: r.best_lap?.number ?? null,
                    topSpeed: r.top_speed ?? null,
                    gapPrev: r.gap?.prev ?? null,
                    teamId: r.team?.id ?? null,
                    constructorId: r.constructor?.id ?? null,
                },
                create: {
                    id: r.id,
                    sessionId,
                    riderId,
                    teamId: r.team?.id ?? null,
                    constructorId: r.constructor?.id ?? null,
                    position: r.position ?? null,
                    status: r.status ?? null,
                    points: r.points ?? null,
                    time: r.time ?? null,
                    gapFirst: r.gap?.first ?? null,
                    gapLap: r.gap?.lap != null ? parseInt(String(r.gap.lap)) : null,
                    averageSpeed: r.average_speed ?? null,
                    totalLaps: r.total_laps ?? null,
                    bestLapTime: r.best_lap?.time ?? null,
                    bestLapNumber: r.best_lap?.number ?? null,
                    topSpeed: r.top_speed ?? null,
                    gapPrev: r.gap?.prev ?? null,
                },
            })
        }

        return { synced: results.length }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        await logSync("session_results", season, sessionId, false, message)
        throw err
    }
}

// ─── Sync standings for one season + category ─────────────────────────────────

export async function syncStandings(seasonId: string, categoryId: string, year: number) {
    const season = String(year)
    try {
        // ── Rider standings ──
        const riderData = await mgpGet<{ classification: ApiStandingEntry[] }>(
            `/results/standings?seasonUuid=${seasonId}&categoryUuid=${categoryId}`
        )
        const riderEntries = riderData.classification ?? []

        for (const entry of riderEntries) {
            if (!entry.rider) continue
            const riderId = await upsertRider(entry.rider, categoryId)
            if (entry.team) await upsertTeam(entry.team)
            if (entry.constructor) await upsertConstructor(entry.constructor)

            await prisma.motoGPRiderStanding.upsert({
                where: { seasonId_categoryId_riderId: { seasonId, categoryId, riderId } },
                update: {
                    position: entry.position,
                    points: entry.points,
                    raceWins: entry.race_wins ?? 0,
                    podiums: entry.podiums ?? 0,
                    sprintWins: entry.sprint_wins ?? 0,
                    sprintPodiums: entry.sprint_podiums ?? 0,
                    teamName: entry.team?.name ?? null,
                    constructorName: entry.constructor?.name ?? null,
                },
                create: {
                    seasonId,
                    categoryId,
                    riderId,
                    position: entry.position,
                    points: entry.points,
                    raceWins: entry.race_wins ?? 0,
                    podiums: entry.podiums ?? 0,
                    sprintWins: entry.sprint_wins ?? 0,
                    sprintPodiums: entry.sprint_podiums ?? 0,
                    teamName: entry.team?.name ?? null,
                    constructorName: entry.constructor?.name ?? null,
                },
            })
        }

        // ── Constructor standings (API returns per-rider rows — aggregate) ──
        const consData = await mgpGet<{ classification: ApiStandingEntry[] }>(
            `/results/standings?seasonUuid=${seasonId}&categoryUuid=${categoryId}&type=constructor`
        )
        const consEntries = consData.classification ?? []

        // Group by constructor and take best position + sum wins
        const consMap = new Map<string, { points: number; wins: number; position: number; obj: NonNullable<ApiStandingEntry["constructor"]> }>()
        for (const entry of consEntries) {
            if (!entry.constructor) continue
            const existing = consMap.get(entry.constructor.id)
            if (!existing) {
                consMap.set(entry.constructor.id, {
                    points: entry.points,
                    wins: entry.race_wins ?? 0,
                    position: entry.position,
                    obj: entry.constructor,
                })
            } else {
                // Sum points, sum wins, keep best (lowest) position
                existing.points += entry.points
                existing.wins += entry.race_wins ?? 0
                existing.position = Math.min(existing.position, entry.position)
            }
        }

        // Re-rank by total points
        const ranked = [...consMap.values()].sort((a, b) => b.points - a.points)
        let consPosition = 1
        for (const c of ranked) {
            await upsertConstructor(c.obj)
            await prisma.motoGPConstructorStanding.upsert({
                where: { seasonId_categoryId_constructorId: { seasonId, categoryId, constructorId: c.obj.id } },
                update: { position: consPosition, points: c.points, wins: c.wins },
                create: { seasonId, categoryId, constructorId: c.obj.id, position: consPosition, points: c.points, wins: c.wins },
            })
            consPosition++
        }

        // ── Team standings ──
        const teamData = await mgpGet<{ classification: ApiStandingEntry[] }>(
            `/results/standings?seasonUuid=${seasonId}&categoryUuid=${categoryId}&type=team`
        )
        const teamEntries = teamData.classification ?? []

        // Same grouping issue as constructors — group by team ID
        const teamMap = new Map<string, { points: number; wins: number; position: number; obj: NonNullable<ApiStandingEntry["team"]> }>()
        for (const entry of teamEntries) {
            if (!entry.team) continue
            const existing = teamMap.get(entry.team.id)
            if (!existing) {
                teamMap.set(entry.team.id, {
                    points: entry.points,
                    wins: entry.race_wins ?? 0,
                    position: entry.position,
                    obj: entry.team,
                })
            } else {
                existing.points += entry.points
                existing.wins += entry.race_wins ?? 0
                existing.position = Math.min(existing.position, entry.position)
            }
        }

        const rankedTeams = [...teamMap.values()].sort((a, b) => b.points - a.points)
        let teamPosition = 1
        for (const t of rankedTeams) {
            await upsertTeam(t.obj)
            await prisma.motoGPTeamStanding.upsert({
                where: { seasonId_categoryId_teamId: { seasonId, categoryId, teamId: t.obj.id } },
                update: { position: teamPosition, points: t.points, wins: t.wins },
                create: { seasonId, categoryId, teamId: t.obj.id, position: teamPosition, points: t.points, wins: t.wins },
            })
            teamPosition++
        }

        await logSync("standings", season, null, true)
        return {
            riders: riderEntries.length,
            constructors: ranked.length,
            teams: rankedTeams.length,
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        await logSync("standings", season, null, false, message)
        throw err
    }
}

// ─── Sync one full event (sessions + results for RAC + SPR only) ──────────────
// For historical backfill we only sync RAC + SPR to keep data manageable.
// FP and Quali can be added later on demand.

export async function syncEventResults(
    eventId: string,
    categoryId: string,
    season: string,
    includeAllSessions = false
) {
    try {
        const { sessions } = await syncSessions(eventId, categoryId, season)

        const targetTypes = includeAllSessions
            ? ["FP", "PR", "Q", "SPR", "WUP", "RAC"]
            : ["RAC", "SPR"]

        let totalSynced = 0
        for (const session of sessions) {
            if (!targetTypes.includes(session.type)) continue
            const r = await syncSessionResults(session.id, categoryId, season)
            totalSynced += r.synced
        }

        return { synced: totalSynced }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        await logSync("event_results", season, eventId, false, message)
        throw err
    }
}

// ─── Sync one full season (all 3 categories) ──────────────────────────────────

export async function syncMotoGPSeason(year: number) {
    const results: Record<string, unknown> = {}

    // Ensure categories exist
    await seedCategories()

    // Ensure seasons exist
    await syncSeasons()

    // Get season record
    const season = await prisma.motoGPSeason.findFirst({ where: { year } })
    if (!season) throw new Error(`Season ${year} not found — run syncSeasons first`)

    results.season = year
    results.categories = {}

    for (const cat of Object.values(MOTOGP_CATEGORIES)) {
        const catResults: Record<string, unknown> = {}

        // Events / calendar
        const eventsResult = await syncEvents(season.id, cat.id, year)
        catResults.events = eventsResult

        // Standings
        const standingsResult = await syncStandings(season.id, cat.id, year)
        catResults.standings = standingsResult

        // Results for finished events
        const events = await prisma.motoGPEvent.findMany({
            where: { seasonId: season.id, categoryId: cat.id, isTest: false },
        })

        const finishedEvents = events.filter(e =>
            e.status === "FINISHED" ||
            new Date(e.dateEnd) < new Date()
        )

        let totalResults = 0
        for (const event of finishedEvents) {
            const r = await syncEventResults(event.id, cat.id, String(year))
            totalResults += r.synced
        }
        catResults.results = { events: finishedEvents.length, totalResults }

            ; (results.categories as Record<string, unknown>)[cat.name] = catResults
    }

    await logSync("full_season", String(year), null, true)
    return results
}

// ─── Sync current season only (fast refresh) ──────────────────────────────────

export async function syncCurrentSeason() {
    const allSeasons = await mgpGet<ApiSeason[]>("/results/seasons")
    const current = allSeasons.find(s => s.current)
    if (!current) throw new Error("No current season found")
    return syncMotoGPSeason(current.year)
}

// ─── Sync historical seasons (backfill) ───────────────────────────────────────
// Syncs standings + events only (no results) for speed.
// Call syncMotoGPSeason(year) for full results on a specific year.

export async function syncHistoricalSeasons(fromYear = 2015, toYear = 2022) {
    const results: Record<string, unknown> = {}
    await seedCategories()
    await syncSeasons()

    for (let year = fromYear; year <= toYear; year++) {
        try {
            const season = await prisma.motoGPSeason.findFirst({ where: { year } })
            if (!season) { results[year] = "season not found"; continue }

            const yearResults: Record<string, unknown> = {}
            for (const cat of Object.values(MOTOGP_CATEGORIES)) {
                const events = await syncEvents(season.id, cat.id, year)
                const standings = await syncStandings(season.id, cat.id, year)
                yearResults[cat.name] = { events, standings }
            }
            results[year] = yearResults
        } catch (err: unknown) {
            results[year] = { error: err instanceof Error ? err.message : String(err) }
        }
    }

    return results
}