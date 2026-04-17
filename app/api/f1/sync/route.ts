import { NextRequest, NextResponse } from "next/server"
import {
    syncDriverStandings,
    syncConstructorStandings,
    syncRaceSchedule,
    syncRaceResults,
    syncLapTimes,
    syncFullSeason,
} from "@/lib/f1-sync"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}))
        const { season = "2025", type = "full", round } = body

        let result: unknown

        switch (type) {
            case "driver_standings":
                result = await syncDriverStandings(season)
                break
            case "constructor_standings":
                result = await syncConstructorStandings(season)
                break
            case "races":
                result = await syncRaceSchedule(season)
                break
            case "race_results":
                if (!round) return NextResponse.json({ error: "round is required for race_results sync" }, { status: 400 })
                result = await syncRaceResults(season, round)
                break
            case "lap_times":
                if (!round) return NextResponse.json({ error: "round is required for lap_times sync" }, { status: 400 })
                result = await syncLapTimes(season, round)
                break
            case "full":
            default:
                result = await syncFullSeason(season)
                break
        }

        return NextResponse.json({ ok: true, season, type, result })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        console.error("[F1 Sync] Error:", message)
        return NextResponse.json({ ok: false, error: message }, { status: 500 })
    }
}