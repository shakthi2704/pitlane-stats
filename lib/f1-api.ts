const BASE = "https://api.jolpi.ca/ergast/f1"

export interface DriverStanding {
    position: string
    points: string
    wins: string
    Driver: {
        driverId: string
        code: string
        givenName: string
        familyName: string
        nationality: string
        permanentNumber?: string
    }
    Constructors: Array<{ name: string; constructorId: string; nationality?: string }>
}

export interface ConstructorStanding {
    position: string
    points: string
    wins: string
    Constructor: {
        constructorId: string
        name: string
        nationality: string
    }
}

export interface Race {
    season: string
    round: string
    raceName: string
    Circuit: {
        circuitId: string
        circuitName: string
        Location: { locality: string; country: string; lat?: string; long?: string }
    }
    date: string
    time?: string
    Results?: RaceResult[]
}

export interface RaceResult {
    position: string
    number: string
    points: string
    Driver: { code: string; givenName: string; familyName: string; driverId: string }
    Constructor: { name: string; constructorId: string }
    Time?: { time: string }
    status: string
    FastestLap?: {
        rank: string
        lap: string
        Time: { time: string }
        AverageSpeed: { speed: string; units: string }
    }
    grid: string
    laps: string
}

export interface LapTime {
    number: string
    Timings: Array<{ driverId: string; position: string; time: string }>
}

export async function getDriverStandings(year: string): Promise<DriverStanding[]> {
    const res = await fetch(`${BASE}/${year}/driverstandings.json`, { next: { revalidate: 300 } })
    const data = await res.json()
    const list = data?.MRData?.StandingsTable?.StandingsLists?.[0]
    return list?.DriverStandings ?? []
}

export async function getConstructorStandings(year: string): Promise<ConstructorStanding[]> {
    const res = await fetch(`${BASE}/${year}/constructorstandings.json`, { next: { revalidate: 300 } })
    const data = await res.json()
    const list = data?.MRData?.StandingsTable?.StandingsLists?.[0]
    return list?.ConstructorStandings ?? []
}

export async function getRaceSchedule(year: string): Promise<Race[]> {
    const res = await fetch(`${BASE}/${year}.json`, { next: { revalidate: 300 } })
    const data = await res.json()
    return data?.MRData?.RaceTable?.Races ?? []
}

export async function getRaceResults(year: string, round: string): Promise<Race | null> {
    const res = await fetch(`${BASE}/${year}/${round}/results.json`, { next: { revalidate: 300 } })
    const data = await res.json()
    const races = data?.MRData?.RaceTable?.Races ?? []
    return races[0] ?? null
}

export async function getLapTimes(year: string, round: string): Promise<LapTime[]> {
    // Fetch all laps (paginated, 100 laps per page max - get first 70 laps)
    const res = await fetch(`${BASE}/${year}/${round}/laps.json?limit=100`, { next: { revalidate: 300 } })
    const data = await res.json()
    return data?.MRData?.RaceTable?.Races?.[0]?.Laps ?? []
}

export async function getAvailableSeasons(): Promise<string[]> {
    // Return recent seasons
    const currentYear = new Date().getFullYear()
    const seasons: string[] = []
    for (let y = currentYear; y >= 2010; y--) {
        seasons.push(String(y))
    }
    return seasons
}

// Team color mapping for known constructors
export const TEAM_COLORS: Record<string, string> = {
    red_bull: "#3671C6",
    ferrari: "#E8002D",
    mercedes: "#27F4D2",
    mclaren: "#FF8000",
    aston_martin: "#229971",
    alpine: "#0093CC",
    williams: "#64C4FF",
    rb: "#6692FF",
    kick_sauber: "#52E252",
    haas: "#B6BABD",
    // Legacy
    alphatauri: "#5E8FAA",
    alfa: "#C92D4B",
    renault: "#FFF500",
    racing_point: "#F596C8",
    force_india: "#F596C8",
}

export function getTeamColor(constructorId: string): string {
    return TEAM_COLORS[constructorId] ?? "#888888"
}

export function getFlagEmoji(nationality: string): string {
    const flags: Record<string, string> = {
        Dutch: "🇳🇱", British: "🇬🇧", Spanish: "🇪🇸", Monegasque: "🇲🇨",
        Mexican: "🇲🇽", Australian: "🇦🇺", Canadian: "🇨🇦", Finnish: "🇫🇮",
        French: "🇫🇷", German: "🇩🇪", Japanese: "🇯🇵", Thai: "🇹🇭",
        Chinese: "🇨🇳", American: "🇺🇸", Danish: "🇩🇰", Italian: "🇮🇹",
        Brazilian: "🇧🇷", Argentine: "🇦🇷", Swiss: "🇨🇭", NewZealander: "🇳🇿",
        Austrian: "🇦🇹", Belgian: "🇧🇪", Polish: "🇵🇱"
    }
    return flags[nationality] ?? "🏁"
}