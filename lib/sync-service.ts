import { prisma } from "@/lib/prisma"
import {
    getDriverStandings,
    getConstructorStandings,
    getRaceSchedule,
    getRaceResults,
    getLapTimes,
} from "@/lib/f1-api"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeToMs(t: string): number {
    if (!t) return 0
    const parts = t.split(":")
    if (parts.length === 2) {
        return Math.round(parseFloat(parts[0]) * 60000 + parseFloat(parts[1]) * 1000)
    }
    return Math.round(parseFloat(t) * 1000)
}

async function logSync(
    dataType: string,
    season: string,
    round: string | null,
    success: boolean,
    error?: string
) {
    await prisma.syncLog.create({
        data: { sport: "f1", dataType, season, round, success, error },
    })
}

// ─── Stale check ─────────────────────────────────────────────────────────────

export async function isStale(
    dataType: string,
    season: string,
    round?: string
): Promise<boolean> {
    const staleMinutes = parseInt(process.env.SYNC_STALE_MINUTES ?? "60")
    const threshold = new Date(Date.now() - staleMinutes * 60 * 1000)

    const last = await prisma.syncLog.findFirst({
        where: {
            sport: "f1",
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

// ─── Sync driver standings ────────────────────────────────────────────────────

export async function syncDriverStandings(season: string) {
    try {
        const standings = await getDriverStandings(season)
        if (!standings.length) return { synced: 0 }

        for (const s of standings) {
            const d = s.Driver
            const c = s.Constructors[0]

            await prisma.f1Driver.upsert({
                where: { driverId: d.driverId },
                update: {
                    code: d.code,
                    permanentNumber: d.permanentNumber,
                    givenName: d.givenName,
                    familyName: d.familyName,
                    nationality: d.nationality,
                },
                create: {
                    driverId: d.driverId,
                    code: d.code,
                    permanentNumber: d.permanentNumber,
                    givenName: d.givenName,
                    familyName: d.familyName,
                    nationality: d.nationality,
                },
            })

            if (c) {
                await prisma.f1Constructor.upsert({
                    where: { constructorId: c.constructorId },
                    update: { name: c.name, nationality: c.nationality },
                    create: { constructorId: c.constructorId, name: c.name, nationality: c.nationality },
                })
            }

            await prisma.f1DriverStanding.upsert({
                where: { season_driverId: { season, driverId: d.driverId } },
                update: {
                    round: "latest",
                    position: parseInt(s.position),
                    points: parseFloat(s.points),
                    wins: parseInt(s.wins),
                    constructorId: c?.constructorId ?? "unknown",
                    constructorName: c?.name ?? "Unknown",
                },
                create: {
                    season,
                    round: "latest",
                    position: parseInt(s.position),
                    points: parseFloat(s.points),
                    wins: parseInt(s.wins),
                    driverId: d.driverId,
                    constructorId: c?.constructorId ?? "unknown",
                    constructorName: c?.name ?? "Unknown",
                },
            })
        }

        await logSync("driver_standings", season, null, true)
        return { synced: standings.length }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        await logSync("driver_standings", season, null, false, message)
        throw err
    }
}

// ─── Sync constructor standings ───────────────────────────────────────────────

export async function syncConstructorStandings(season: string) {
    try {
        const standings = await getConstructorStandings(season)
        if (!standings.length) return { synced: 0 }

        for (const s of standings) {
            const c = s.Constructor

            await prisma.f1Constructor.upsert({
                where: { constructorId: c.constructorId },
                update: { name: c.name, nationality: c.nationality },
                create: { constructorId: c.constructorId, name: c.name, nationality: c.nationality },
            })

            await prisma.f1ConstructorStanding.upsert({
                where: { season_constructorId: { season, constructorId: c.constructorId } },
                update: {
                    round: "latest",
                    position: parseInt(s.position),
                    points: parseFloat(s.points),
                    wins: parseInt(s.wins),
                },
                create: {
                    season,
                    round: "latest",
                    position: parseInt(s.position),
                    points: parseFloat(s.points),
                    wins: parseInt(s.wins),
                    constructorId: c.constructorId,
                },
            })
        }

        await logSync("constructor_standings", season, null, true)
        return { synced: standings.length }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        await logSync("constructor_standings", season, null, false, message)
        throw err
    }
}

// ─── Sync race schedule ───────────────────────────────────────────────────────

export async function syncRaceSchedule(season: string) {
    try {
        const races = await getRaceSchedule(season)
        if (!races.length) return { synced: 0 }

        for (const race of races) {
            const cir = race.Circuit

            await prisma.f1Circuit.upsert({
                where: { circuitId: cir.circuitId },
                update: {
                    circuitName: cir.circuitName,
                    locality: cir.Location.locality,
                    country: cir.Location.country,
                    lat: cir.Location.lat,
                    lng: cir.Location.long,
                },
                create: {
                    circuitId: cir.circuitId,
                    circuitName: cir.circuitName,
                    locality: cir.Location.locality,
                    country: cir.Location.country,
                    lat: cir.Location.lat,
                    lng: cir.Location.long,
                },
            })

            await prisma.f1Race.upsert({
                where: { season_round: { season, round: parseInt(race.round) } },
                update: {
                    raceName: race.raceName,
                    date: race.date,
                    time: race.time ?? null,
                    circuitId: cir.circuitId,
                },
                create: {
                    season,
                    round: parseInt(race.round),
                    raceName: race.raceName,
                    date: race.date,
                    time: race.time ?? null,
                    circuitId: cir.circuitId,
                },
            })
        }

        await logSync("races", season, null, true)
        return { synced: races.length }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        await logSync("races", season, null, false, message)
        throw err
    }
}

// ─── Sync race results ────────────────────────────────────────────────────────

export async function syncRaceResults(season: string, round: string) {
    try {
        const raceData = await getRaceResults(season, round)
        if (!raceData?.Results?.length) return { synced: 0 }

        const cir = raceData.Circuit

        await prisma.f1Circuit.upsert({
            where: { circuitId: cir.circuitId },
            update: {
                circuitName: cir.circuitName,
                locality: cir.Location.locality,
                country: cir.Location.country,
            },
            create: {
                circuitId: cir.circuitId,
                circuitName: cir.circuitName,
                locality: cir.Location.locality,
                country: cir.Location.country,
            },
        })

        const dbRace = await prisma.f1Race.upsert({
            where: { season_round: { season, round: parseInt(round) } },
            update: {
                raceName: raceData.raceName,
                date: raceData.date,
                circuitId: cir.circuitId,
            },
            create: {
                season,
                round: parseInt(round),
                raceName: raceData.raceName,
                date: raceData.date,
                time: raceData.time ?? null,
                circuitId: cir.circuitId,
            },
        })

        for (const r of raceData.Results) {
            await prisma.f1Driver.upsert({
                where: { driverId: r.Driver.driverId },
                update: {
                    code: r.Driver.code,
                    givenName: r.Driver.givenName,
                    familyName: r.Driver.familyName,
                },
                create: {
                    driverId: r.Driver.driverId,
                    code: r.Driver.code,
                    givenName: r.Driver.givenName,
                    familyName: r.Driver.familyName,
                },
            })

            await prisma.f1Constructor.upsert({
                where: { constructorId: r.Constructor.constructorId },
                update: { name: r.Constructor.name },
                create: { constructorId: r.Constructor.constructorId, name: r.Constructor.name },
            })

            await prisma.f1RaceResult.upsert({
                where: { raceId_driverId: { raceId: dbRace.id, driverId: r.Driver.driverId } },
                update: {
                    position: r.position ? parseInt(r.position) : null,
                    positionText: r.position ?? r.status ?? "?",
                    number: r.number,
                    grid: r.grid ? parseInt(r.grid) : null,
                    laps: r.laps ? parseInt(r.laps) : null,
                    status: r.status,
                    points: r.points ? parseFloat(r.points) : null,
                    time: r.Time?.time ?? null,
                    constructorId: r.Constructor.constructorId,
                    fastestLapRank: r.FastestLap?.rank ? parseInt(r.FastestLap.rank) : null,
                    fastestLapNumber: r.FastestLap?.lap ? parseInt(r.FastestLap.lap) : null,
                    fastestLapTime: r.FastestLap?.Time?.time ?? null,
                    fastestLapSpeed: r.FastestLap?.AverageSpeed?.speed ?? null,
                },
                create: {
                    raceId: dbRace.id,
                    driverId: r.Driver.driverId,
                    constructorId: r.Constructor.constructorId,
                    position: r.position ? parseInt(r.position) : null,
                    positionText: r.position ?? r.status ?? "?",
                    number: r.number,
                    grid: r.grid ? parseInt(r.grid) : null,
                    laps: r.laps ? parseInt(r.laps) : null,
                    status: r.status,
                    points: r.points ? parseFloat(r.points) : null,
                    time: r.Time?.time ?? null,
                    fastestLapRank: r.FastestLap?.rank ? parseInt(r.FastestLap.rank) : null,
                    fastestLapNumber: r.FastestLap?.lap ? parseInt(r.FastestLap.lap) : null,
                    fastestLapTime: r.FastestLap?.Time?.time ?? null,
                    fastestLapSpeed: r.FastestLap?.AverageSpeed?.speed ?? null,
                },
            })
        }

        await logSync("race_results", season, round, true)
        return { synced: raceData.Results.length }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        await logSync("race_results", season, round, false, message)
        throw err
    }
}

// ─── Sync lap times ───────────────────────────────────────────────────────────

export async function syncLapTimes(season: string, round: string) {
    try {
        const laps = await getLapTimes(season, round)
        if (!laps.length) return { synced: 0 }

        const dbRace = await prisma.f1Race.findUnique({
            where: { season_round: { season, round: parseInt(round) } },
        })

        if (!dbRace) {
            throw new Error(`Race ${season} R${round} not found. Sync race schedule first.`)
        }

        let count = 0
        for (const lap of laps) {
            for (const timing of lap.Timings) {
                await prisma.f1LapTime.upsert({
                    where: {
                        raceId_lapNumber_driverId: {
                            raceId: dbRace.id,
                            lapNumber: parseInt(lap.number),
                            driverId: timing.driverId,
                        },
                    },
                    update: {
                        position: timing.position ? parseInt(timing.position) : null,
                        time: timing.time,
                        timeMs: timeToMs(timing.time),
                    },
                    create: {
                        raceId: dbRace.id,
                        lapNumber: parseInt(lap.number),
                        driverId: timing.driverId,
                        position: timing.position ? parseInt(timing.position) : null,
                        time: timing.time,
                        timeMs: timeToMs(timing.time),
                    },
                })
                count++
            }
        }

        await logSync("lap_times", season, round, true)
        return { synced: count }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        await logSync("lap_times", season, round, false, message)
        throw err
    }
}

// ─── Full season sync ─────────────────────────────────────────────────────────

export async function syncFullSeason(season: string) {
    const results: Record<string, unknown> = {}

    results.driverStandings = await syncDriverStandings(season)
    results.constructorStandings = await syncConstructorStandings(season)
    results.races = await syncRaceSchedule(season)

    const races = await prisma.f1Race.findMany({
        where: {
            season,
            date: { lt: new Date().toISOString().split("T")[0] },
        },
        orderBy: { round: "asc" },
    })

    const resultsSynced: number[] = []
    for (const race of races) {
        const r = await syncRaceResults(season, String(race.round))
        resultsSynced.push(r.synced)
    }

    results.raceResults = {
        races: races.length,
        totalResults: resultsSynced.reduce((a, b) => a + b, 0),
    }

    return results
}