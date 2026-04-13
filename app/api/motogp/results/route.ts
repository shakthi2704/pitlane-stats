import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { MOTOGP_CATEGORIES } from "@/lib/motogp-sync"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get("year") ?? new Date().getFullYear().toString())
    const cat = searchParams.get("category") ?? "MotoGP"

    const categoryId = MOTOGP_CATEGORIES[cat as keyof typeof MOTOGP_CATEGORIES]?.id
        ?? MOTOGP_CATEGORIES.MotoGP.id

    const season = await prisma.motoGPSeason.findFirst({ where: { year } })
    if (!season) return NextResponse.json({ year, races: [] })

    const today = new Date().toISOString().split("T")[0]

    const events = await prisma.motoGPEvent.findMany({
        where: { seasonId: season.id, categoryId, isTest: false },
        orderBy: { dateStart: "asc" },
        include: {
            circuit: true,
            sessions: {
                where: { type: { in: ["RAC", "SPR"] } },
                include: {
                    results: {
                        orderBy: { position: "asc" },
                        take: 3,
                        include: {
                            rider: true,
                            constructor: true,
                        },
                    },
                },
            },
        },
    })

    const races = events.map(ev => {
        const isPast = ev.dateEnd < today
        const raceSession = ev.sessions.find(s => s.type === "RAC")
        const sprintSession = ev.sessions.find(s => s.type === "SPR")

        const podium = (raceSession?.results ?? []).slice(0, 3).map(r => ({
            position: r.position,
            riderId: r.rider.id,
            riderName: r.rider.fullName,
            nationality: r.rider.nationality,
            number: r.rider.number,
            photoUrl: r.rider.photoUrl,
            constructorName: r.constructor?.name ?? null,
            time: r.time,
            points: r.points,
        }))

        const sprintWinner = sprintSession?.results[0] ?? null

        return {
            eventId: ev.id,
            name: ev.sponsoredName ?? ev.name,
            shortName: ev.shortName,
            dateStart: ev.dateStart,
            dateEnd: ev.dateEnd,
            isPast,
            status: ev.status,
            circuit: {
                name: ev.circuit?.name ?? "—",
                place: ev.circuit?.place ?? null,
                nation: ev.circuit?.nation ?? null,
            },
            podium,
            sprintWinner: sprintWinner ? {
                riderId: sprintWinner.rider.id,
                riderName: sprintWinner.rider.fullName,
                constructorName: sprintWinner.constructor?.name ?? null,
            } : null,
            hasResults: podium.length > 0,
        }
    })

    return NextResponse.json({ year, category: cat, races })
}