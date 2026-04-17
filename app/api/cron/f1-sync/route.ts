import { NextRequest, NextResponse } from "next/server"
import { syncDriverStandings, syncConstructorStandings, syncRaceSchedule } from "@/lib/f1-sync"

/**
 * Cron endpoint — call this on a schedule (e.g. every hour).
 * 
 * Protect it with CRON_SECRET env var.
 * Example cron call:
 *   GET https://yourdomain.com/api/cron/f1-sync?token=YOUR_SECRET&season=2025
 * 
 * With cron-job.org, Vercel Cron, GitHub Actions, or any scheduler.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")
    const season = searchParams.get("season") ?? new Date().getFullYear().toString()

    // Token guard (skip if CRON_SECRET not set — only in local dev)
    if (process.env.CRON_SECRET && token !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const start = Date.now()
    const results: Record<string, unknown> = {}
    const errors: string[] = []

    try {
        results.driverStandings = await syncDriverStandings(season)
    } catch (e) {
        errors.push(`driverStandings: ${e instanceof Error ? e.message : String(e)}`)
    }

    try {
        results.constructorStandings = await syncConstructorStandings(season)
    } catch (e) {
        errors.push(`constructorStandings: ${e instanceof Error ? e.message : String(e)}`)
    }

    try {
        results.races = await syncRaceSchedule(season)
    } catch (e) {
        errors.push(`races: ${e instanceof Error ? e.message : String(e)}`)
    }

    const duration = Date.now() - start

    console.log(`[Cron] F1 sync for ${season} completed in ${duration}ms`, { results, errors })

    return NextResponse.json({
        ok: errors.length === 0,
        season,
        duration,
        results,
        errors,
    })
}