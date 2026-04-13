import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { MOTOGP_CATEGORIES } from "@/lib/motogp-sync"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get("year") ?? new Date().getFullYear().toString())

    const categoryId = MOTOGP_CATEGORIES.MotoGP.id

    const season = await prisma.motoGPSeason.findFirst({ where: { year } })
    if (!season) return NextResponse.json({ year, circuits: [] })

    // Get all non-test events for the season with their circuits
    const events = await prisma.motoGPEvent.findMany({
        where: { seasonId: season.id, categoryId, isTest: false },
        orderBy: { dateStart: "asc" },
        include: {
            circuit: true,
            sessions: {
                where: { type: "RAC" },
                take: 1,
                include: {
                    results: {
                        where: { position: 1 },
                        take: 1,
                        include: { rider: true, constructor: true },
                    },
                },
            },
        },
    })

    const today = new Date().toISOString().split("T")[0]

    const circuits = events.map(ev => {
        const raceSession = ev.sessions[0]
        const winner = raceSession?.results[0]
        return {
            circuitId: ev.circuit?.id ?? ev.id,
            circuitName: ev.circuit?.name ?? "—",
            place: ev.circuit?.place ?? null,
            nation: ev.circuit?.nation ?? null,
            eventId: ev.id,
            eventName: ev.sponsoredName ?? ev.name,
            shortName: ev.shortName,
            dateStart: ev.dateStart,
            dateEnd: ev.dateEnd,
            status: ev.status,
            isPast: ev.dateEnd < today,
            isNext: ev.dateEnd >= today,
            winner: winner ? {
                riderId: winner.rider.id,
                riderName: winner.rider.fullName,
                constructorName: winner.constructor?.name ?? null,
            } : null,
        }
    })

    return NextResponse.json({ year, circuits })
}