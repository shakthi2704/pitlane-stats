import { NextRequest, NextResponse } from "next/server"
import {
    seedCategories,
    syncSeasons,
    syncMotoGPSeason,
    syncCurrentSeason,
    syncHistoricalSeasons,
    syncEventResults,
    syncRiderPhotos,
} from "@/lib/motogp-sync"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}))
        const { type = "current", year, fromYear, toYear, eventId, categoryId } = body

        let result: unknown

        switch (type) {
            case "seed":
                await seedCategories()
                result = await syncSeasons()
                break

            case "current":
                result = await syncCurrentSeason()
                break

            case "season":
                if (!year) return NextResponse.json({ error: "year is required" }, { status: 400 })
                result = await syncMotoGPSeason(parseInt(year))
                break

            case "historical":
                result = await syncHistoricalSeasons(
                    fromYear ? parseInt(fromYear) : 2015,
                    toYear ? parseInt(toYear) : 2022
                )
                break

            case "event":
                if (!eventId || !categoryId)
                    return NextResponse.json({ error: "eventId and categoryId required" }, { status: 400 })
                result = await syncEventResults(eventId, categoryId, String(year ?? ""), true)
                break

            case "photos":
                if (!year) return NextResponse.json({ error: "year is required" }, { status: 400 })
                result = await syncRiderPhotos(parseInt(year))
                break

            default:
                return NextResponse.json({ error: `Unknown sync type: ${type}` }, { status: 400 })
        }

        return NextResponse.json({ ok: true, type, result })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        console.error("[MotoGP Sync] Error:", message)
        return NextResponse.json({ ok: false, error: message }, { status: 500 })
    }
}