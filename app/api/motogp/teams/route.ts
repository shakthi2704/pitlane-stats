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
    if (!season) return NextResponse.json({ year, teams: [] })

    // Team standings with team info
    const teamStandings = await prisma.motoGPTeamStanding.findMany({
        where: { seasonId: season.id, categoryId },
        orderBy: { position: "asc" },
        include: { team: true },
    })

    // Rider standings — to show which riders are on each team
    const riderStandings = await prisma.motoGPRiderStanding.findMany({
        where: { seasonId: season.id, categoryId },
        orderBy: { position: "asc" },
        include: { rider: true },
    })

    // Group riders by teamName (denormalised string on riderStanding)
    const ridersByTeam: Record<string, { id: string; fullName: string; number: number | null; nationality: string | null; photoUrl: string | null; position: number; points: number }[]> = {}
    for (const rs of riderStandings) {
        const key = rs.teamName ?? "unknown"
        if (!ridersByTeam[key]) ridersByTeam[key] = []
        ridersByTeam[key].push({
            id: rs.rider.id,
            fullName: rs.rider.fullName,
            number: rs.rider.number,
            nationality: rs.rider.nationality,
            photoUrl: rs.rider.photoUrl,
            position: rs.position,
            points: rs.points,
        })
    }

    const teams = teamStandings.map(ts => ({
        id: ts.team.id,
        name: ts.team.name,
        color: ts.team.color,
        textColor: ts.team.textColor,
        position: ts.position,
        points: ts.points,
        wins: ts.wins,
        riders: ridersByTeam[ts.team.name] ?? [],
    }))

    return NextResponse.json({ year, category: cat, teams })
}