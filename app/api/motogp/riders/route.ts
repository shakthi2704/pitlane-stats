import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { MOTOGP_CATEGORIES } from "@/lib/motogp-sync"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get("year") ?? new Date().getFullYear().toString())
    const cat = searchParams.get("category") ?? "all" // all | MotoGP | Moto2 | Moto3

    const season = await prisma.motoGPSeason.findFirst({ where: { year } })
    if (!season) return NextResponse.json({ year, riders: [] })

    // Build category filter
    const categoryIds = cat === "all"
        ? Object.values(MOTOGP_CATEGORIES).map(c => c.id)
        : [MOTOGP_CATEGORIES[cat as keyof typeof MOTOGP_CATEGORIES]?.id].filter(Boolean) as string[]

    // Fetch standings for the season — each standing has rider + team/constructor context
    const standings = await prisma.motoGPRiderStanding.findMany({
        where: {
            seasonId: season.id,
            categoryId: { in: categoryIds },
        },
        orderBy: [
            { categoryId: "asc" },
            { position: "asc" },
        ],
        include: {
            rider: true,
            category: true,
        },
    })

    // Shape into rider cards — one entry per rider per class
    const riders = standings.map(s => ({
        id: s.rider.id,
        fullName: s.rider.fullName,
        firstName: s.rider.firstName,
        lastName: s.rider.lastName,
        nationality: s.rider.nationality,
        number: s.rider.number,
        photoUrl: s.rider.photoUrl,
        birthDate: s.rider.birthDate,
        birthCity: s.rider.birthCity,
        category: s.category.name,       // "MotoGP™" | "Moto2™" | "Moto3™"
        categoryId: s.categoryId,
        teamName: s.teamName,
        constructorName: s.constructorName,
        position: s.position,
        points: s.points,
        raceWins: s.raceWins,
        podiums: s.podiums,
    }))

    return NextResponse.json({ year, category: cat, riders })
}