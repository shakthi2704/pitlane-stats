// import { prisma } from "@/lib/prisma"

// // ─── Constants ────────────────────────────────────────────────────────────────

// const BASE = "https://api.football-data.org/v4"

// // Active competitions — fully syncable on current API tier
// export const FOOTBALL_COMPETITIONS_PHASE1 = [
//     { code: "PL", name: "Premier League", shortName: "PL", country: "England", countryCode: "ENG", type: "LEAGUE", plan: "TIER_ONE" },
//     { code: "PD", name: "La Liga", shortName: "PD", country: "Spain", countryCode: "ESP", type: "LEAGUE", plan: "TIER_ONE" },
//     { code: "CL", name: "Champions League", shortName: "CL", country: null, countryCode: null, type: "CUP", plan: "TIER_ONE" },
//     { code: "BL1", name: "Bundesliga", shortName: "BL1", country: "Germany", countryCode: "GER", type: "LEAGUE", plan: "TIER_ONE" },
//     { code: "SA", name: "Serie A", shortName: "SA", country: "Italy", countryCode: "ITA", type: "LEAGUE", plan: "TIER_ONE" },
//     { code: "FL1", name: "Ligue 1", shortName: "FL1", country: "France", countryCode: "FRA", type: "LEAGUE", plan: "TIER_ONE" },
//     { code: "EC", name: "Euro Championship", shortName: "EC", country: null, countryCode: null, type: "TOURNAMENT", plan: "TIER_ONE" },
//     { code: "ELC", name: "Championship", shortName: "ELC", country: "England", countryCode: "ENG", type: "LEAGUE", plan: "TIER_ONE" },
//     { code: "DED", name: "Eredivisie", shortName: "DED", country: "Netherlands", countryCode: "NLD", type: "LEAGUE", plan: "TIER_ONE" },
//     { code: "PPL", name: "Primeira Liga", shortName: "PPL", country: "Portugal", countryCode: "POR", type: "LEAGUE", plan: "TIER_ONE" },
//     { code: "BSA", name: "Brasileirão Série A", shortName: "BSA", country: "Brazil", countryCode: "BRA", type: "LEAGUE", plan: "TIER_ONE" },
// ] as const

// // WC — starts June 2026, no current data yet. Seed only, sync when tournament begins.
// export const FOOTBALL_COMPETITIONS_UPCOMING = [
//     { code: "WC", name: "FIFA World Cup", shortName: "WC", country: null, countryCode: null, type: "TOURNAMENT", plan: "TIER_ONE" },
// ] as const

// // EL / ECL not available on current API tier — excluded entirely
// export const FOOTBALL_COMPETITIONS_PHASE2: never[] = []

// export const FOOTBALL_GREEN = "#00B04F"

// // ─── API Client ───────────────────────────────────────────────────────────────

// async function fbGet<T>(path: string): Promise<T> {
//     const apiKey = process.env.FOOTBALL_API_KEY
//     if (!apiKey) throw new Error("FOOTBALL_API_KEY is not set in environment")

//     const res = await fetch(`${BASE}${path}`, {
//         headers: {
//             "X-Auth-Token": apiKey,
//             "Accept": "application/json",
//         },
//         next: { revalidate: 0 },
//     })

//     if (res.status === 429) {
//         // Free tier rate limit — wait 60s and retry once
//         await new Promise(r => setTimeout(r, 60_000))
//         const retry = await fetch(`${BASE}${path}`, {
//             headers: { "X-Auth-Token": apiKey, "Accept": "application/json" },
//             next: { revalidate: 0 },
//         })
//         if (!retry.ok) throw new Error(`Football API ${retry.status} (after retry): ${path}`)
//         return retry.json()
//     }

//     if (!res.ok) throw new Error(`Football API ${res.status}: ${path}`)
//     return res.json()
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// async function logSync(
//     dataType: string,
//     season: string,
//     round: string | null,
//     success: boolean,
//     error?: string
// ) {
//     await prisma.syncLog.create({
//         data: { sport: "football", dataType, season, round, success, error },
//     })
// }

// async function isStale(dataType: string, season: string, round?: string): Promise<boolean> {
//     const staleMinutes = parseInt(process.env.SYNC_STALE_MINUTES ?? "60")
//     const threshold = new Date(Date.now() - staleMinutes * 60 * 1000)
//     const last = await prisma.syncLog.findFirst({
//         where: {
//             sport: "football",
//             dataType,
//             season,
//             round: round ?? null,
//             success: true,
//             syncedAt: { gte: threshold },
//         },
//         orderBy: { syncedAt: "desc" },
//     })
//     return !last
// }

// // ─── API Types ────────────────────────────────────────────────────────────────

// interface ApiArea {
//     id: number
//     name: string
//     code: string
//     flag?: string
// }

// interface ApiCompetition {
//     id: number
//     name: string
//     code: string
//     type: string
//     emblem?: string
//     area: ApiArea
//     currentSeason?: ApiSeason
//     seasons?: ApiSeason[]
// }

// interface ApiSeason {
//     id: number
//     startDate: string
//     endDate: string
//     currentMatchday: number | null
//     winner: null | { id: number; name: string }
// }

// interface ApiTeam {
//     id: number
//     name: string
//     shortName?: string
//     tla?: string
//     crest?: string
//     address?: string
//     website?: string
//     founded?: number
//     clubColors?: string
//     venue?: string
//     area?: ApiArea
// }

// interface ApiPlayer {
//     id: number
//     name: string
//     firstName?: string
//     lastName?: string
//     dateOfBirth?: string
//     nationality?: string
//     position?: string
//     shirtNumber?: number
// }

// interface ApiMatchScore {
//     winner: string | null
//     duration: string
//     fullTime: { home: number | null; away: number | null }
//     halfTime: { home: number | null; away: number | null }
//     extraTime: { home: number | null; away: number | null }
//     penalties: { home: number | null; away: number | null }
// }

// interface ApiMatch {
//     id: number
//     utcDate: string
//     status: string
//     matchday: number | null
//     stage: string
//     group: string | null
//     lastUpdated: string
//     homeTeam: { id: number; name: string; shortName?: string; tla?: string; crest?: string }
//     awayTeam: { id: number; name: string; shortName?: string; tla?: string; crest?: string }
//     score: ApiMatchScore
//     referees: Array<{ id: number; name: string; type: string; nationality: string }>
//     goals?: ApiMatchEvent[]
//     bookings?: ApiMatchEvent[]
//     substitutions?: ApiMatchEvent[]
// }

// interface ApiMatchEvent {
//     minute: number
//     extraTime?: number | null
//     type: string
//     detail?: string
//     team?: { id: number; name: string }
//     player?: { id: number; name: string }
//     assistPlayer?: { id: number; name: string } | null
//     playerOut?: { id: number; name: string }
// }

// interface ApiStandingTable {
//     stage: string
//     type: string
//     group: string | null
//     table: Array<{
//         position: number
//         team: { id: number; name: string; shortName?: string; tla?: string; crest?: string }
//         playedGames: number
//         won: number
//         draw: number
//         lost: number
//         points: number
//         goalsFor: number
//         goalsAgainst: number
//         goalDifference: number
//         form?: string
//     }>
// }

// interface ApiScorer {
//     player: { id: number; name: string; firstName?: string; lastName?: string; dateOfBirth?: string; nationality?: string; position?: string }
//     team: { id: number; name: string; shortName?: string; tla?: string; crest?: string }
//     playedMatches: number
//     goals: number
//     assists: number | null
//     penalties: number | null
// }

// // ─── Seed competitions (run once) ────────────────────────────────────────────
// // Seeds all Phase 1 + Phase 2 competitions as static rows.
// // Phase 2 rows have plan="TIER_TWO" and are shown as Coming Soon in the UI.

// export async function seedCompetitions() {
//     const all = [...FOOTBALL_COMPETITIONS_PHASE1, ...FOOTBALL_COMPETITIONS_UPCOMING, ...FOOTBALL_COMPETITIONS_PHASE2]
//     let seeded = 0

//     for (const comp of all) {
//         await prisma.footballCompetition.upsert({
//             where: { code: comp.code },
//             update: {
//                 name: comp.name,
//                 shortName: comp.shortName,
//                 country: comp.country ?? null,
//                 countryCode: comp.countryCode ?? null,
//                 type: comp.type,
//                 plan: comp.plan,
//             },
//             create: {
//                 code: comp.code,
//                 name: comp.name,
//                 shortName: comp.shortName,
//                 country: comp.country ?? null,
//                 countryCode: comp.countryCode ?? null,
//                 type: comp.type,
//                 plan: comp.plan,
//                 isCurrent: false,
//             },
//         })
//         seeded++
//     }

//     return { seeded }
// }

// // ─── Upsert team ──────────────────────────────────────────────────────────────

// async function upsertTeam(t: ApiTeam | ApiMatch["homeTeam"]) {
//     await prisma.footballTeam.upsert({
//         where: { id: t.id },
//         update: {
//             name: t.name,
//             shortName: (t as ApiTeam).shortName ?? null,
//             tla: t.tla ?? null,
//             crestUrl: t.crest ?? null,
//         },
//         create: {
//             id: t.id,
//             name: t.name,
//             shortName: (t as ApiTeam).shortName ?? null,
//             tla: t.tla ?? null,
//             crestUrl: t.crest ?? null,
//             country: (t as ApiTeam).area?.name ?? null,
//             founded: (t as ApiTeam).founded ?? null,
//             venue: (t as ApiTeam).venue ?? null,
//             website: (t as ApiTeam).website ?? null,
//             colors: (t as ApiTeam).clubColors ?? null,
//         },
//     })
// }

// // ─── Upsert player ────────────────────────────────────────────────────────────

// async function upsertPlayer(p: ApiPlayer, teamId?: number) {
//     await prisma.footballPlayer.upsert({
//         where: { id: p.id },
//         update: {
//             name: p.name,
//             firstName: p.firstName ?? null,
//             lastName: p.lastName ?? null,
//             dateOfBirth: p.dateOfBirth ?? null,
//             nationality: p.nationality ?? null,
//             position: p.position ?? null,
//             shirtNumber: p.shirtNumber ?? null,
//             ...(teamId ? { teamId } : {}),
//         },
//         create: {
//             id: p.id,
//             name: p.name,
//             firstName: p.firstName ?? null,
//             lastName: p.lastName ?? null,
//             dateOfBirth: p.dateOfBirth ?? null,
//             nationality: p.nationality ?? null,
//             position: p.position ?? null,
//             shirtNumber: p.shirtNumber ?? null,
//             teamId: teamId ?? null,
//         },
//     })
// }

// // ─── Sync squads for a competition (teams + players) ─────────────────────────

// export async function syncSquads(competitionCode: string) {
//     const season = "squads"
//     try {
//         const data = await fbGet<{ teams: ApiTeam[] }>(`/competitions/${competitionCode}/teams`)

//         let playersFound = 0
//         let teamsFailed = 0

//         for (const team of data.teams) {
//             await upsertTeam(team)

//             // Squad detail fetch — national team endpoints return 403 on free tier
//             try {
//                 const teamDetail = await fbGet<ApiTeam & { squad?: ApiPlayer[] }>(
//                     `/teams/${team.id}`
//                 )
//                 if (teamDetail.squad?.length) {
//                     for (const player of teamDetail.squad) {
//                         await upsertPlayer(player, team.id)
//                         playersFound++
//                     }
//                 }
//             } catch {
//                 // 403 on national teams or other restricted endpoints — skip silently
//                 teamsFailed++
//             }
//         }

//         await logSync("squads", season, competitionCode, true)
//         return { teams: data.teams.length, players: playersFound, skipped: teamsFailed }
//     } catch (err: unknown) {
//         const message = err instanceof Error ? err.message : String(err)
//         await logSync("squads", season, competitionCode, false, message)
//         throw err
//     }
// }

// // ─── Sync season for one competition ─────────────────────────────────────────
// // Fetches competition metadata from the API and upserts the current season row.

// export async function syncCompetitionSeason(competitionCode: string): Promise<number> {
//     const comp = await prisma.footballCompetition.findUnique({ where: { code: competitionCode } })
//     if (!comp) throw new Error(`Competition ${competitionCode} not seeded — run seedCompetitions first`)

//     const data = await fbGet<ApiCompetition>(`/competitions/${competitionCode}`)

//     // Update emblem on competition
//     await prisma.footballCompetition.update({
//         where: { code: competitionCode },
//         data: { emblemUrl: data.emblem ?? null, isCurrent: true },
//     })

//     const s = data.currentSeason
//     if (!s) throw new Error(`No current season found for ${competitionCode}`)

//     // Derive year from startDate e.g. "2024-08-16" → 2024
//     const year = parseInt(s.startDate.slice(0, 4))

//     await prisma.footballSeason.upsert({
//         where: { competitionId_year: { competitionId: comp.id, year } },
//         update: {
//             startDate: s.startDate,
//             endDate: s.endDate,
//             currentMatchday: s.currentMatchday ?? null,
//             isCurrent: true,
//         },
//         create: {
//             id: s.id,
//             competitionId: comp.id,
//             year,
//             startDate: s.startDate,
//             endDate: s.endDate,
//             currentMatchday: s.currentMatchday ?? null,
//             isCurrent: true,
//         },
//     })

//     // Mark all other seasons for this competition as not current
//     await prisma.footballSeason.updateMany({
//         where: { competitionId: comp.id, id: { not: s.id } },
//         data: { isCurrent: false },
//     })

//     return s.id
// }

// // ─── Sync standings ───────────────────────────────────────────────────────────

// export async function syncStandings(competitionCode: string, seasonId: number) {
//     const seasonStr = String(seasonId)
//     try {
//         const season = await prisma.footballSeason.findUnique({ where: { id: seasonId } })
//         if (!season) throw new Error(`Season ${seasonId} not found`)

//         // Use season.year (from startDate) e.g. PL 2024/25 -> year=2024
//         const data = await fbGet<{ standings: ApiStandingTable[] }>(
//             `/competitions/${competitionCode}/standings?season=${season.year}`
//         )

//         for (const table of data.standings) {
//             for (const row of table.table) {
//                 await upsertTeam(row.team)

//                 await prisma.footballStanding.upsert({
//                     where: {
//                         seasonId_teamId_stage_group_type: {
//                             seasonId,
//                             teamId: row.team.id,
//                             stage: table.stage,
//                             group: table.group ?? "",
//                             type: table.type,
//                         },
//                     },
//                     update: {
//                         position: row.position,
//                         playedGames: row.playedGames,
//                         won: row.won,
//                         draw: row.draw,
//                         lost: row.lost,
//                         points: row.points,
//                         goalsFor: row.goalsFor,
//                         goalsAgainst: row.goalsAgainst,
//                         goalDiff: row.goalDifference,
//                         form: row.form ?? null,
//                     },
//                     create: {
//                         seasonId,
//                         teamId: row.team.id,
//                         stage: table.stage,
//                         group: table.group ?? null,
//                         type: table.type,
//                         position: row.position,
//                         playedGames: row.playedGames,
//                         won: row.won,
//                         draw: row.draw,
//                         lost: row.lost,
//                         points: row.points,
//                         goalsFor: row.goalsFor,
//                         goalsAgainst: row.goalsAgainst,
//                         goalDiff: row.goalDifference,
//                         form: row.form ?? null,
//                     },
//                 })
//             }
//         }

//         await logSync("standings", seasonStr, competitionCode, true)
//         return { tables: data.standings.length }
//     } catch (err: unknown) {
//         const message = err instanceof Error ? err.message : String(err)
//         await logSync("standings", seasonStr, competitionCode, false, message)
//         throw err
//     }
// }

// // ─── Sync matches (fixtures + results) ───────────────────────────────────────

// export async function syncMatches(competitionCode: string, seasonId: number) {
//     const seasonStr = String(seasonId)
//     try {
//         const season = await prisma.footballSeason.findUnique({ where: { id: seasonId } })
//         if (!season) throw new Error(`Season ${seasonId} not found`)

//         const data = await fbGet<{ matches: ApiMatch[] }>(
//             `/competitions/${competitionCode}/matches`
//         )

//         for (const m of data.matches) {
//             // Ensure both teams exist
//             await upsertTeam(m.homeTeam)
//             await upsertTeam(m.awayTeam)

//             const referee = m.referees?.[0] ?? null

//             // Upcoming fixtures return null for score sub-objects — safe-access all of them
//             const ft = m.score?.fullTime ?? {}
//             const ht = m.score?.halfTime ?? {}
//             const et = m.score?.extraTime ?? {}
//             const pen = m.score?.penalties ?? {}

//             const scoreFields = {
//                 scoreFullHome: ft.home ?? null,
//                 scoreFullAway: ft.away ?? null,
//                 scoreHalfHome: ht.home ?? null,
//                 scoreHalfAway: ht.away ?? null,
//                 scoreExtraHome: et.home ?? null,
//                 scoreExtraAway: et.away ?? null,
//                 scorePenHome: pen.home ?? null,
//                 scorePenAway: pen.away ?? null,
//                 winner: m.score?.winner ?? null,
//             }

//             await prisma.footballMatch.upsert({
//                 where: { id: m.id },
//                 update: {
//                     utcDate: m.utcDate,
//                     status: m.status,
//                     matchday: m.matchday ?? null,
//                     stage: m.stage,
//                     group: m.group ?? null,
//                     lastUpdated: m.lastUpdated,
//                     ...scoreFields,
//                     refereeName: referee?.name ?? null,
//                 },
//                 create: {
//                     id: m.id,
//                     seasonId,
//                     homeTeamId: m.homeTeam.id,
//                     awayTeamId: m.awayTeam.id,
//                     utcDate: m.utcDate,
//                     status: m.status,
//                     matchday: m.matchday ?? null,
//                     stage: m.stage,
//                     group: m.group ?? null,
//                     lastUpdated: m.lastUpdated,
//                     ...scoreFields,
//                     refereeId: referee?.id ?? null,
//                     refereeName: referee?.name ?? null,
//                 },
//             })
//         }

//         await logSync("matches", seasonStr, competitionCode, true)
//         return { matches: data.matches.length }
//     } catch (err: unknown) {
//         const message = err instanceof Error ? err.message : String(err)
//         await logSync("matches", seasonStr, competitionCode, false, message)
//         throw err
//     }
// }

// // ─── Sync match events (goals, cards, subs) for finished matches ──────────────
// // Fetches individual match detail for each FINISHED match that has no events yet.
// // Rate-limited — free tier allows ~10 req/min. We add a small delay between calls.

// export async function syncMatchEvents(seasonId: number) {
//     const seasonStr = String(seasonId)
//     try {
//         // Find finished matches with no events synced yet
//         const matches = await prisma.footballMatch.findMany({
//             where: {
//                 seasonId,
//                 status: "FINISHED",
//                 events: { none: {} },
//             },
//             select: { id: true },
//         })

//         let synced = 0
//         let failed = 0

//         for (const match of matches) {
//             try {
//                 const data = await fbGet<{ match: ApiMatch }>(`/matches/${match.id}`)
//                 const m = data.match

//                 const allEvents: ApiMatchEvent[] = [
//                     ...(m.goals ?? []),
//                     ...(m.bookings ?? []),
//                     ...(m.substitutions ?? []),
//                 ]

//                 for (const ev of allEvents) {
//                     // Determine team side
//                     let teamSide: string | null = null
//                     if (ev.team) {
//                         teamSide = ev.team.id === m.homeTeam.id ? "HOME" : "AWAY"
//                     }

//                     // Upsert player if we have an id
//                     const playerRecord = ev.player ?? ev.playerOut ?? null
//                     if (playerRecord?.id) {
//                         await prisma.footballPlayer.upsert({
//                             where: { id: playerRecord.id },
//                             update: { name: playerRecord.name },
//                             create: { id: playerRecord.id, name: playerRecord.name },
//                         })
//                     }

//                     await prisma.footballMatchEvent.create({
//                         data: {
//                             matchId: match.id,
//                             playerId: playerRecord?.id ?? null,
//                             playerName: playerRecord?.name ?? null,
//                             minute: ev.minute ?? null,
//                             extraMinute: ev.extraTime ?? null,
//                             type: ev.type,
//                             detail: ev.detail ?? null,
//                             teamSide,
//                             assistName: ev.assistPlayer?.name ?? null,
//                         },
//                     })
//                 }

//                 synced++
//                 // Polite delay to respect free tier rate limits
//                 await new Promise(r => setTimeout(r, 700))
//             } catch {
//                 failed++
//             }
//         }

//         await logSync("match_events", seasonStr, null, true)
//         return { total: matches.length, synced, failed }
//     } catch (err: unknown) {
//         const message = err instanceof Error ? err.message : String(err)
//         await logSync("match_events", seasonStr, null, false, message)
//         throw err
//     }
// }

// // ─── Sync top scorers ─────────────────────────────────────────────────────────

// export async function syncScorers(competitionCode: string, seasonId: number) {
//     const seasonStr = String(seasonId)
//     try {
//         const data = await fbGet<{ scorers: ApiScorer[] }>(
//             `/competitions/${competitionCode}/scorers?limit=50`
//         )

//         let position = 1
//         for (const s of data.scorers) {
//             // Upsert team
//             await upsertTeam(s.team)

//             // Upsert player (minimal — full squad sync handled separately)
//             await prisma.footballPlayer.upsert({
//                 where: { id: s.player.id },
//                 update: {
//                     name: s.player.name,
//                     firstName: s.player.firstName ?? null,
//                     lastName: s.player.lastName ?? null,
//                     nationality: s.player.nationality ?? null,
//                     position: s.player.position ?? null,
//                     teamId: s.team.id,
//                 },
//                 create: {
//                     id: s.player.id,
//                     name: s.player.name,
//                     firstName: s.player.firstName ?? null,
//                     lastName: s.player.lastName ?? null,
//                     dateOfBirth: s.player.dateOfBirth ?? null,
//                     nationality: s.player.nationality ?? null,
//                     position: s.player.position ?? null,
//                     teamId: s.team.id,
//                 },
//             })

//             await prisma.footballScorer.upsert({
//                 where: { seasonId_playerId: { seasonId, playerId: s.player.id } },
//                 update: {
//                     teamId: s.team.id,
//                     position,
//                     goals: s.goals,
//                     assists: s.assists ?? null,
//                     penalties: s.penalties ?? null,
//                     playedMatches: s.playedMatches ?? null,
//                 },
//                 create: {
//                     seasonId,
//                     playerId: s.player.id,
//                     teamId: s.team.id,
//                     position,
//                     goals: s.goals,
//                     assists: s.assists ?? null,
//                     penalties: s.penalties ?? null,
//                     playedMatches: s.playedMatches ?? null,
//                 },
//             })

//             position++
//         }

//         await logSync("scorers", seasonStr, competitionCode, true)
//         return { scorers: data.scorers.length }
//     } catch (err: unknown) {
//         const message = err instanceof Error ? err.message : String(err)
//         await logSync("scorers", seasonStr, competitionCode, false, message)
//         throw err
//     }
// }

// // ─── Sync one competition (full) ──────────────────────────────────────────────
// // Runs: season → squads → standings → matches → scorers
// // Does NOT sync match events (slow, rate-limited) — call syncMatchEvents separately.

// export async function syncCompetition(competitionCode: string) {
//     const results: Record<string, unknown> = { competition: competitionCode }

//     try {
//         // 1. Season metadata
//         const seasonId = await syncCompetitionSeason(competitionCode)
//         results.seasonId = seasonId

//         // 2. Squads (teams + players)
//         const squadsResult = await syncSquads(competitionCode)
//         results.squads = squadsResult

//         // 3. Standings
//         const standingsResult = await syncStandings(competitionCode, seasonId)
//         results.standings = standingsResult

//         // 4. Matches
//         const matchesResult = await syncMatches(competitionCode, seasonId)
//         results.matches = matchesResult

//         // 5. Top scorers
//         const scorersResult = await syncScorers(competitionCode, seasonId)
//         results.scorers = scorersResult

//         await logSync("full_competition", String(seasonId), competitionCode, true)
//     } catch (err: unknown) {
//         const message = err instanceof Error ? err.message : String(err)
//         results.error = message
//         await logSync("full_competition", "unknown", competitionCode, false, message)
//         throw err
//     }

//     return results
// }

// // ─── Sync all Phase 1 competitions ───────────────────────────────────────────

// export async function syncAllPhase1() {
//     // Ensure all competition rows exist first
//     await seedCompetitions()

//     const results: Record<string, unknown> = {}

//     for (const comp of FOOTBALL_COMPETITIONS_PHASE1) {
//         try {
//             results[comp.code] = await syncCompetition(comp.code)
//         } catch (err: unknown) {
//             results[comp.code] = { error: err instanceof Error ? err.message : String(err) }
//         }
//     }

//     return results
// }

// // ─── Sync current matchday only (fast refresh) ───────────────────────────────
// // Refreshes standings + matches for all active Phase 1 competitions.
// // Use this for scheduled/cron refreshes once initial data is loaded.

// export async function syncCurrentMatchday() {
//     const results: Record<string, unknown> = {}

//     for (const comp of FOOTBALL_COMPETITIONS_PHASE1) {
//         try {
//             const competition = await prisma.footballCompetition.findUnique({
//                 where: { code: comp.code },
//                 include: { seasons: { where: { isCurrent: true } } },
//             })

//             if (!competition || !competition.seasons[0]) {
//                 results[comp.code] = "not seeded"
//                 continue
//             }

//             const seasonId = competition.seasons[0].id

//             const [standings, matches, scorers] = await Promise.allSettled([
//                 syncStandings(comp.code, seasonId),
//                 syncMatches(comp.code, seasonId),
//                 syncScorers(comp.code, seasonId),
//             ])

//             results[comp.code] = {
//                 standings: standings.status === "fulfilled" ? standings.value : standings.reason,
//                 matches: matches.status === "fulfilled" ? matches.value : matches.reason,
//                 scorers: scorers.status === "fulfilled" ? scorers.value : scorers.reason,
//             }
//         } catch (err: unknown) {
//             results[comp.code] = { error: err instanceof Error ? err.message : String(err) }
//         }
//     }

//     return results
// }


import { prisma } from "@/lib/prisma"

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE = "https://api.football-data.org/v4"

// Active competitions — fully syncable on current API tier
export const FOOTBALL_COMPETITIONS_PHASE1 = [
    { code: "PL", name: "Premier League", shortName: "PL", country: "England", countryCode: "ENG", type: "LEAGUE", plan: "TIER_ONE" },
    { code: "PD", name: "La Liga", shortName: "PD", country: "Spain", countryCode: "ESP", type: "LEAGUE", plan: "TIER_ONE" },
    { code: "CL", name: "Champions League", shortName: "CL", country: null, countryCode: null, type: "CUP", plan: "TIER_ONE" },
    { code: "BL1", name: "Bundesliga", shortName: "BL1", country: "Germany", countryCode: "GER", type: "LEAGUE", plan: "TIER_ONE" },
    { code: "SA", name: "Serie A", shortName: "SA", country: "Italy", countryCode: "ITA", type: "LEAGUE", plan: "TIER_ONE" },
    { code: "FL1", name: "Ligue 1", shortName: "FL1", country: "France", countryCode: "FRA", type: "LEAGUE", plan: "TIER_ONE" },
    { code: "EC", name: "Euro Championship", shortName: "EC", country: null, countryCode: null, type: "TOURNAMENT", plan: "TIER_ONE" },
    { code: "ELC", name: "Championship", shortName: "ELC", country: "England", countryCode: "ENG", type: "LEAGUE", plan: "TIER_ONE" },
    { code: "DED", name: "Eredivisie", shortName: "DED", country: "Netherlands", countryCode: "NLD", type: "LEAGUE", plan: "TIER_ONE" },
    { code: "PPL", name: "Primeira Liga", shortName: "PPL", country: "Portugal", countryCode: "POR", type: "LEAGUE", plan: "TIER_ONE" },
    { code: "BSA", name: "Brasileirão Série A", shortName: "BSA", country: "Brazil", countryCode: "BRA", type: "LEAGUE", plan: "TIER_ONE" },
] as const

// WC — starts June 2026, no current data yet. Seed only, sync when tournament begins.
export const FOOTBALL_COMPETITIONS_UPCOMING = [
    { code: "WC", name: "FIFA World Cup", shortName: "WC", country: null, countryCode: null, type: "TOURNAMENT", plan: "TIER_ONE" },
] as const

// EL / ECL not available on current API tier — excluded entirely
export const FOOTBALL_COMPETITIONS_PHASE2: never[] = []

export const FOOTBALL_GREEN = "#00B04F"

// ─── API Client ───────────────────────────────────────────────────────────────

async function fbGet<T>(path: string): Promise<T> {
    const apiKey = process.env.FOOTBALL_API_KEY
    if (!apiKey) throw new Error("FOOTBALL_API_KEY is not set in environment")

    const res = await fetch(`${BASE}${path}`, {
        headers: {
            "X-Auth-Token": apiKey,
            "Accept": "application/json",
        },
        next: { revalidate: 0 },
    })

    if (res.status === 429) {
        // Free tier rate limit — wait 60s and retry once
        await new Promise(r => setTimeout(r, 60_000))
        const retry = await fetch(`${BASE}${path}`, {
            headers: { "X-Auth-Token": apiKey, "Accept": "application/json" },
            next: { revalidate: 0 },
        })
        if (!retry.ok) throw new Error(`Football API ${retry.status} (after retry): ${path}`)
        return retry.json()
    }

    if (!res.ok) throw new Error(`Football API ${res.status}: ${path}`)
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
        data: { sport: "football", dataType, season, round, success, error },
    })
}

async function isStale(dataType: string, season: string, round?: string): Promise<boolean> {
    const staleMinutes = parseInt(process.env.SYNC_STALE_MINUTES ?? "60")
    const threshold = new Date(Date.now() - staleMinutes * 60 * 1000)
    const last = await prisma.syncLog.findFirst({
        where: {
            sport: "football",
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

interface ApiArea {
    id: number
    name: string
    code: string
    flag?: string
}

interface ApiCompetition {
    id: number
    name: string
    code: string
    type: string
    emblem?: string
    area: ApiArea
    currentSeason?: ApiSeason
    seasons?: ApiSeason[]
}

interface ApiSeason {
    id: number
    startDate: string
    endDate: string
    currentMatchday: number | null
    winner: null | { id: number; name: string }
}

interface ApiTeam {
    id: number
    name: string
    shortName?: string
    tla?: string
    crest?: string
    address?: string
    website?: string
    founded?: number
    clubColors?: string
    venue?: string
    area?: ApiArea
}

interface ApiPlayer {
    id: number
    name: string
    firstName?: string
    lastName?: string
    dateOfBirth?: string
    nationality?: string
    position?: string
    shirtNumber?: number
}

interface ApiMatchScore {
    winner: string | null
    duration: string
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
    extraTime: { home: number | null; away: number | null }
    penalties: { home: number | null; away: number | null }
}

interface ApiMatch {
    id: number
    utcDate: string
    status: string
    matchday: number | null
    stage: string
    group: string | null
    lastUpdated: string
    homeTeam: { id: number; name: string; shortName?: string; tla?: string; crest?: string }
    awayTeam: { id: number; name: string; shortName?: string; tla?: string; crest?: string }
    score: ApiMatchScore
    referees: Array<{ id: number; name: string; type: string; nationality: string }>
    goals?: ApiMatchEvent[]
    bookings?: ApiMatchEvent[]
    substitutions?: ApiMatchEvent[]
}

interface ApiMatchEvent {
    minute: number
    extraTime?: number | null
    type: string
    detail?: string
    team?: { id: number; name: string }
    player?: { id: number; name: string }
    assistPlayer?: { id: number; name: string } | null
    playerOut?: { id: number; name: string }
}

interface ApiStandingTable {
    stage: string
    type: string
    group: string | null
    table: Array<{
        position: number
        team: { id: number; name: string; shortName?: string; tla?: string; crest?: string }
        playedGames: number
        won: number
        draw: number
        lost: number
        points: number
        goalsFor: number
        goalsAgainst: number
        goalDifference: number
        form?: string
    }>
}

interface ApiScorer {
    player: { id: number; name: string; firstName?: string; lastName?: string; dateOfBirth?: string; nationality?: string; position?: string }
    team: { id: number; name: string; shortName?: string; tla?: string; crest?: string }
    playedMatches: number
    goals: number
    assists: number | null
    penalties: number | null
}

// ─── Seed competitions (run once) ────────────────────────────────────────────
// Seeds all Phase 1 + Phase 2 competitions as static rows.
// Phase 2 rows have plan="TIER_TWO" and are shown as Coming Soon in the UI.

export async function seedCompetitions() {
    const all = [...FOOTBALL_COMPETITIONS_PHASE1, ...FOOTBALL_COMPETITIONS_UPCOMING, ...FOOTBALL_COMPETITIONS_PHASE2]
    let seeded = 0

    for (const comp of all) {
        await prisma.footballCompetition.upsert({
            where: { code: comp.code },
            update: {
                name: comp.name,
                shortName: comp.shortName,
                country: comp.country ?? null,
                countryCode: comp.countryCode ?? null,
                type: comp.type,
                plan: comp.plan,
            },
            create: {
                code: comp.code,
                name: comp.name,
                shortName: comp.shortName,
                country: comp.country ?? null,
                countryCode: comp.countryCode ?? null,
                type: comp.type,
                plan: comp.plan,
                isCurrent: false,
            },
        })
        seeded++
    }

    return { seeded }
}

// ─── Upsert team ──────────────────────────────────────────────────────────────

async function upsertTeam(t: ApiTeam | ApiMatch["homeTeam"]) {
    await prisma.footballTeam.upsert({
        where: { id: t.id },
        update: {
            name: t.name,
            shortName: (t as ApiTeam).shortName ?? null,
            tla: t.tla ?? null,
            crestUrl: t.crest ?? null,
        },
        create: {
            id: t.id,
            name: t.name,
            shortName: (t as ApiTeam).shortName ?? null,
            tla: t.tla ?? null,
            crestUrl: t.crest ?? null,
            country: (t as ApiTeam).area?.name ?? null,
            founded: (t as ApiTeam).founded ?? null,
            venue: (t as ApiTeam).venue ?? null,
            website: (t as ApiTeam).website ?? null,
            colors: (t as ApiTeam).clubColors ?? null,
        },
    })
}

// ─── Upsert player ────────────────────────────────────────────────────────────

async function upsertPlayer(p: ApiPlayer, teamId?: number) {
    await prisma.footballPlayer.upsert({
        where: { id: p.id },
        update: {
            name: p.name,
            firstName: p.firstName ?? null,
            lastName: p.lastName ?? null,
            dateOfBirth: p.dateOfBirth ?? null,
            nationality: p.nationality ?? null,
            position: p.position ?? null,
            shirtNumber: p.shirtNumber ?? null,
            ...(teamId ? { teamId } : {}),
        },
        create: {
            id: p.id,
            name: p.name,
            firstName: p.firstName ?? null,
            lastName: p.lastName ?? null,
            dateOfBirth: p.dateOfBirth ?? null,
            nationality: p.nationality ?? null,
            position: p.position ?? null,
            shirtNumber: p.shirtNumber ?? null,
            teamId: teamId ?? null,
        },
    })
}

// ─── Sync squads for a competition (teams + players) ─────────────────────────

export async function syncSquads(competitionCode: string) {
    const season = "squads"
    try {
        const data = await fbGet<{ teams: ApiTeam[] }>(`/competitions/${competitionCode}/teams`)

        let playersFound = 0
        let teamsFailed = 0

        for (const team of data.teams) {
            await upsertTeam(team)

            // Squad detail fetch — national team endpoints return 403 on free tier
            try {
                const teamDetail = await fbGet<ApiTeam & { squad?: ApiPlayer[] }>(
                    `/teams/${team.id}`
                )
                if (teamDetail.squad?.length) {
                    for (const player of teamDetail.squad) {
                        await upsertPlayer(player, team.id)
                        playersFound++
                    }
                }
            } catch {
                // 403 on national teams or other restricted endpoints — skip silently
                teamsFailed++
            }
        }

        await logSync("squads", season, competitionCode, true)
        return { teams: data.teams.length, players: playersFound, skipped: teamsFailed }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        await logSync("squads", season, competitionCode, false, message)
        throw err
    }
}

// ─── Sync season for one competition ─────────────────────────────────────────
// Fetches competition metadata from the API and upserts the current season row.

export async function syncCompetitionSeason(competitionCode: string): Promise<number> {
    const comp = await prisma.footballCompetition.findUnique({ where: { code: competitionCode } })
    if (!comp) throw new Error(`Competition ${competitionCode} not seeded — run seedCompetitions first`)

    const data = await fbGet<ApiCompetition>(`/competitions/${competitionCode}`)

    // Update emblem on competition
    await prisma.footballCompetition.update({
        where: { code: competitionCode },
        data: { emblemUrl: data.emblem ?? null, isCurrent: true },
    })

    const s = data.currentSeason
    if (!s) throw new Error(`No current season found for ${competitionCode}`)

    // Derive year from startDate e.g. "2024-08-16" → 2024
    const year = parseInt(s.startDate.slice(0, 4))

    await prisma.footballSeason.upsert({
        where: { competitionId_year: { competitionId: comp.id, year } },
        update: {
            startDate: s.startDate,
            endDate: s.endDate,
            currentMatchday: s.currentMatchday ?? null,
            isCurrent: true,
        },
        create: {
            id: s.id,
            competitionId: comp.id,
            year,
            startDate: s.startDate,
            endDate: s.endDate,
            currentMatchday: s.currentMatchday ?? null,
            isCurrent: true,
        },
    })

    // Mark all other seasons for this competition as not current
    await prisma.footballSeason.updateMany({
        where: { competitionId: comp.id, id: { not: s.id } },
        data: { isCurrent: false },
    })

    return s.id
}

// ─── Sync standings ───────────────────────────────────────────────────────────

export async function syncStandings(competitionCode: string, seasonId: number) {
    const seasonStr = String(seasonId)
    try {
        const season = await prisma.footballSeason.findUnique({ where: { id: seasonId } })
        if (!season) throw new Error(`Season ${seasonId} not found`)

        // Use season.year (from startDate) e.g. PL 2024/25 -> year=2024
        const data = await fbGet<{ standings: ApiStandingTable[] }>(
            `/competitions/${competitionCode}/standings?season=${season.year}`
        )

        for (const table of data.standings) {
            for (const row of table.table) {
                await upsertTeam(row.team)

                await prisma.footballStanding.upsert({
                    where: {
                        seasonId_teamId_stage_group_type: {
                            seasonId,
                            teamId: row.team.id,
                            stage: table.stage,
                            group: table.group ?? "",
                            type: table.type,
                        },
                    },
                    update: {
                        position: row.position,
                        playedGames: row.playedGames,
                        won: row.won,
                        draw: row.draw,
                        lost: row.lost,
                        points: row.points,
                        goalsFor: row.goalsFor,
                        goalsAgainst: row.goalsAgainst,
                        goalDiff: row.goalDifference,
                        form: row.form ?? null,
                    },
                    create: {
                        seasonId,
                        teamId: row.team.id,
                        stage: table.stage,
                        group: table.group ?? null,
                        type: table.type,
                        position: row.position,
                        playedGames: row.playedGames,
                        won: row.won,
                        draw: row.draw,
                        lost: row.lost,
                        points: row.points,
                        goalsFor: row.goalsFor,
                        goalsAgainst: row.goalsAgainst,
                        goalDiff: row.goalDifference,
                        form: row.form ?? null,
                    },
                })
            }
        }

        await logSync("standings", seasonStr, competitionCode, true)
        return { tables: data.standings.length }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        await logSync("standings", seasonStr, competitionCode, false, message)
        throw err
    }
}

// ─── Sync matches (fixtures + results) ───────────────────────────────────────

export async function syncMatches(competitionCode: string, seasonId: number) {
    const seasonStr = String(seasonId)
    try {
        const season = await prisma.footballSeason.findUnique({ where: { id: seasonId } })
        if (!season) throw new Error(`Season ${seasonId} not found`)

        const data = await fbGet<{ matches: ApiMatch[] }>(
            `/competitions/${competitionCode}/matches`
        )

        for (const m of data.matches) {
            // Ensure both teams exist
            await upsertTeam(m.homeTeam)
            await upsertTeam(m.awayTeam)

            const referee = m.referees?.[0] ?? null

            // Upcoming fixtures return null for score sub-objects — safe-access all of them
            const ft = m.score?.fullTime ?? {}
            const ht = m.score?.halfTime ?? {}
            const et = m.score?.extraTime ?? {}
            const pen = m.score?.penalties ?? {}

            const scoreFields = {
                scoreFullHome: ft.home ?? null,
                scoreFullAway: ft.away ?? null,
                scoreHalfHome: ht.home ?? null,
                scoreHalfAway: ht.away ?? null,
                scoreExtraHome: et.home ?? null,
                scoreExtraAway: et.away ?? null,
                scorePenHome: pen.home ?? null,
                scorePenAway: pen.away ?? null,
                winner: m.score?.winner ?? null,
            }

            await prisma.footballMatch.upsert({
                where: { id: m.id },
                update: {
                    utcDate: m.utcDate,
                    status: m.status,
                    matchday: m.matchday ?? null,
                    stage: m.stage,
                    group: m.group ?? null,
                    lastUpdated: m.lastUpdated,
                    ...scoreFields,
                    refereeName: referee?.name ?? null,
                },
                create: {
                    id: m.id,
                    seasonId,
                    homeTeamId: m.homeTeam.id,
                    awayTeamId: m.awayTeam.id,
                    utcDate: m.utcDate,
                    status: m.status,
                    matchday: m.matchday ?? null,
                    stage: m.stage,
                    group: m.group ?? null,
                    lastUpdated: m.lastUpdated,
                    ...scoreFields,
                    refereeId: referee?.id ?? null,
                    refereeName: referee?.name ?? null,
                },
            })
        }

        await logSync("matches", seasonStr, competitionCode, true)
        return { matches: data.matches.length }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        await logSync("matches", seasonStr, competitionCode, false, message)
        throw err
    }
}

// ─── Sync match events (goals, cards, subs) for finished matches ──────────────
// Fetches individual match detail for each FINISHED match that has no events yet.
// Rate-limited — free tier allows ~10 req/min. We add a small delay between calls.

export async function syncMatchEvents(seasonId: number) {
    const seasonStr = String(seasonId)
    try {
        // Find finished matches with no events synced yet
        const matches = await prisma.footballMatch.findMany({
            where: {
                seasonId,
                status: "FINISHED",
                events: { none: {} },
            },
            select: { id: true },
        })

        let synced = 0
        let failed = 0

        for (const match of matches) {
            try {
                const data = await fbGet<{ match: ApiMatch }>(`/matches/${match.id}`)
                const m = data.match

                const allEvents: ApiMatchEvent[] = [
                    ...(m.goals ?? []),
                    ...(m.bookings ?? []),
                    ...(m.substitutions ?? []),
                ]

                for (const ev of allEvents) {
                    // Determine team side
                    let teamSide: string | null = null
                    if (ev.team) {
                        teamSide = ev.team.id === m.homeTeam.id ? "HOME" : "AWAY"
                    }

                    // Upsert player if we have an id
                    const playerRecord = ev.player ?? ev.playerOut ?? null
                    if (playerRecord?.id) {
                        await prisma.footballPlayer.upsert({
                            where: { id: playerRecord.id },
                            update: { name: playerRecord.name },
                            create: { id: playerRecord.id, name: playerRecord.name },
                        })
                    }

                    await prisma.footballMatchEvent.create({
                        data: {
                            matchId: match.id,
                            playerId: playerRecord?.id ?? null,
                            playerName: playerRecord?.name ?? null,
                            minute: ev.minute ?? null,
                            extraMinute: ev.extraTime ?? null,
                            type: ev.type,
                            detail: ev.detail ?? null,
                            teamSide,
                            assistName: ev.assistPlayer?.name ?? null,
                        },
                    })
                }

                synced++
                // Polite delay to respect free tier rate limits
                await new Promise(r => setTimeout(r, 700))
            } catch {
                failed++
            }
        }

        await logSync("match_events", seasonStr, null, true)
        return { total: matches.length, synced, failed }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        await logSync("match_events", seasonStr, null, false, message)
        throw err
    }
}

// ─── Sync top scorers ─────────────────────────────────────────────────────────

export async function syncScorers(competitionCode: string, seasonId: number) {
    const seasonStr = String(seasonId)
    try {
        const data = await fbGet<{ scorers: ApiScorer[] }>(
            `/competitions/${competitionCode}/scorers?limit=50`
        )

        let position = 1
        for (const s of data.scorers) {
            // Upsert team
            await upsertTeam(s.team)

            // Upsert player (minimal — full squad sync handled separately)
            await prisma.footballPlayer.upsert({
                where: { id: s.player.id },
                update: {
                    name: s.player.name,
                    firstName: s.player.firstName ?? null,
                    lastName: s.player.lastName ?? null,
                    nationality: s.player.nationality ?? null,
                    position: s.player.position ?? null,
                    teamId: s.team.id,
                },
                create: {
                    id: s.player.id,
                    name: s.player.name,
                    firstName: s.player.firstName ?? null,
                    lastName: s.player.lastName ?? null,
                    dateOfBirth: s.player.dateOfBirth ?? null,
                    nationality: s.player.nationality ?? null,
                    position: s.player.position ?? null,
                    teamId: s.team.id,
                },
            })

            await prisma.footballScorer.upsert({
                where: { seasonId_playerId: { seasonId, playerId: s.player.id } },
                update: {
                    teamId: s.team.id,
                    position,
                    goals: s.goals,
                    assists: s.assists ?? null,
                    penalties: s.penalties ?? null,
                    playedMatches: s.playedMatches ?? null,
                },
                create: {
                    seasonId,
                    playerId: s.player.id,
                    teamId: s.team.id,
                    position,
                    goals: s.goals,
                    assists: s.assists ?? null,
                    penalties: s.penalties ?? null,
                    playedMatches: s.playedMatches ?? null,
                },
            })

            position++
        }

        await logSync("scorers", seasonStr, competitionCode, true)
        return { scorers: data.scorers.length }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        await logSync("scorers", seasonStr, competitionCode, false, message)
        throw err
    }
}

// ─── Sync one competition (full) ──────────────────────────────────────────────
// Runs: season → squads → standings → matches → scorers
// Does NOT sync match events (slow, rate-limited) — call syncMatchEvents separately.

export async function syncCompetition(competitionCode: string) {
    const results: Record<string, unknown> = { competition: competitionCode }

    try {
        // 1. Season metadata
        const seasonId = await syncCompetitionSeason(competitionCode)
        results.seasonId = seasonId

        // 2. Squads (teams + players)
        const squadsResult = await syncSquads(competitionCode)
        results.squads = squadsResult

        // 3. Standings — tournaments (EC, WC) may not have a standings endpoint
        try {
            const standingsResult = await syncStandings(competitionCode, seasonId)
            results.standings = standingsResult
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err)
            results.standings = { skipped: true, reason: msg }
        }

        // 4. Matches
        const matchesResult = await syncMatches(competitionCode, seasonId)
        results.matches = matchesResult

        // 5. Top scorers — may not exist for all tournaments
        try {
            const scorersResult = await syncScorers(competitionCode, seasonId)
            results.scorers = scorersResult
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err)
            results.scorers = { skipped: true, reason: msg }
        }

        await logSync("full_competition", String(seasonId), competitionCode, true)
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        results.error = message
        await logSync("full_competition", "unknown", competitionCode, false, message)
        throw err
    }

    return results
}

// ─── Sync all Phase 1 competitions ───────────────────────────────────────────

export async function syncAllPhase1() {
    // Ensure all competition rows exist first
    await seedCompetitions()

    const results: Record<string, unknown> = {}

    for (const comp of FOOTBALL_COMPETITIONS_PHASE1) {
        try {
            results[comp.code] = await syncCompetition(comp.code)
        } catch (err: unknown) {
            results[comp.code] = { error: err instanceof Error ? err.message : String(err) }
        }
    }

    return results
}

// ─── Sync current matchday only (fast refresh) ───────────────────────────────
// Refreshes standings + matches for all active Phase 1 competitions.
// Use this for scheduled/cron refreshes once initial data is loaded.

export async function syncCurrentMatchday() {
    const results: Record<string, unknown> = {}

    for (const comp of FOOTBALL_COMPETITIONS_PHASE1) {
        try {
            const competition = await prisma.footballCompetition.findUnique({
                where: { code: comp.code },
                include: { seasons: { where: { isCurrent: true } } },
            })

            if (!competition || !competition.seasons[0]) {
                results[comp.code] = "not seeded"
                continue
            }

            const seasonId = competition.seasons[0].id

            const [standings, matches, scorers] = await Promise.allSettled([
                syncStandings(comp.code, seasonId),
                syncMatches(comp.code, seasonId),
                syncScorers(comp.code, seasonId),
            ])

            results[comp.code] = {
                standings: standings.status === "fulfilled" ? standings.value : standings.reason,
                matches: matches.status === "fulfilled" ? matches.value : matches.reason,
                scorers: scorers.status === "fulfilled" ? scorers.value : scorers.reason,
            }
        } catch (err: unknown) {
            results[comp.code] = { error: err instanceof Error ? err.message : String(err) }
        }
    }

    return results
}