import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { MOTOGP_CATEGORIES } from "@/lib/motogp-sync"

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params

    const circuit = await prisma.motoGPCircuit.findUnique({ where: { id } })
    if (!circuit) return NextResponse.json({ error: "Circuit not found" }, { status: 404 })

    const categoryId = MOTOGP_CATEGORIES.MotoGP.id

    // All MotoGP events at this circuit, ordered newest first
    const events = await prisma.motoGPEvent.findMany({
        where: { circuitId: id, categoryId, isTest: false },
        orderBy: { dateStart: "desc" },
        include: {
            season: true,
            sessions: {
                where: { type: "RAC" },
                take: 1,
                include: {
                    results: {
                        where: { position: 1 },
                        take: 1,
                        include: {
                            rider: true,
                            constructor: true,
                            team: true,
                        },
                    },
                },
            },
        },
    })

    const history = events.map(ev => {
        const winner = ev.sessions[0]?.results[0]
        return {
            eventId: ev.id,
            eventName: ev.sponsoredName ?? ev.name,
            year: ev.season.year,
            dateStart: ev.dateStart,
            dateEnd: ev.dateEnd,
            winner: winner ? {
                riderId: winner.rider.id,
                riderName: winner.rider.fullName,
                nationality: winner.rider.nationality,
                constructorName: winner.constructor?.name ?? null,
                teamName: winner.team?.name ?? null,
                time: winner.time,
            } : null,
        }
    })

    return NextResponse.json({
        circuit: {
            id: circuit.id,
            name: circuit.name,
            place: circuit.place,
            nation: circuit.nation,
            legacyId: circuit.legacyId,
        },
        history,
        totalRaces: history.length,
    })
}