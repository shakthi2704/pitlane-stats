import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/football/teams/[id]
// Returns team profile + full squad grouped by position.
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const teamId = parseInt(id)

        if (isNaN(teamId)) {
            return NextResponse.json({ error: "Invalid team id" }, { status: 400 })
        }

        const team = await prisma.footballTeam.findUnique({
            where: { id: teamId },
            include: {
                players: {
                    orderBy: [
                        { position: "asc" },
                        { shirtNumber: "asc" },
                    ],
                    select: {
                        id: true,
                        name: true,
                        firstName: true,
                        lastName: true,
                        dateOfBirth: true,
                        nationality: true,
                        position: true,
                        shirtNumber: true,
                        marketValue: true,
                    },
                },
            },
        })

        if (!team) {
            return NextResponse.json({ error: `Team ${teamId} not found` }, { status: 404 })
        }

        // Group squad by position for easier UI rendering
        const positionOrder = ["Goalkeeper", "Defence", "Midfield", "Offence"]
        const squad: Record<string, typeof team.players> = {}
        for (const pos of positionOrder) {
            const players = team.players.filter((p) => p.position === pos)
            if (players.length > 0) squad[pos] = players
        }
        // Catch any players with null/unknown position
        const unknown = team.players.filter(
            (p) => !p.position || !positionOrder.includes(p.position)
        )
        if (unknown.length > 0) squad["Other"] = unknown

        return NextResponse.json({
            team: {
                id: team.id,
                name: team.name,
                shortName: team.shortName,
                tla: team.tla,
                crestUrl: team.crestUrl,
                country: team.country,
                founded: team.founded,
                venue: team.venue,
                website: team.website,
                colors: team.colors,
            },
            squad,
            totalPlayers: team.players.length,
        })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        console.error("[Football] team GET error:", message)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}