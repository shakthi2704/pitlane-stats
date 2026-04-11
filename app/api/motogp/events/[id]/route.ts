
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params
    const { searchParams } = new URL(req.url)
    // Which session types to include in results
    // Default: RAC + SPR only. Pass ?sessions=all for everything
    const sessionFilter = searchParams.get("sessions") ?? "race"

    const event = await prisma.motoGPEvent.findUnique({
        where: { id },
        include: {
            circuit: true,
            category: true,
            season: true,
            sessions: {
                orderBy: { date: "asc" },
                include: {
                    results: {
                        orderBy: { position: "asc" },
                        include: {
                            rider: true,
                            team: true,
                            constructor: true,
                        },
                    },
                },
            },
        },
    })

    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 })

    // Filter sessions based on query param
    const targetTypes = sessionFilter === "all"
        ? undefined
        : ["RAC", "SPR"]

    const filteredSessions = targetTypes
        ? event.sessions.filter(s => targetTypes.includes(s.type))
        : event.sessions

    return NextResponse.json({
        event: {
            ...event,
            sessions: filteredSessions,
        },
    })
}