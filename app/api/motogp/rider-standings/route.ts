import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { MOTOGP_CATEGORIES } from "@/lib/motogp-sync"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get("year") ?? "2025")
    const cat = searchParams.get("category") ?? "MotoGP" // MotoGP | Moto2 | Moto3
    const limit = parseInt(searchParams.get("limit") ?? "50")

    const categoryId = MOTOGP_CATEGORIES[cat as keyof typeof MOTOGP_CATEGORIES]?.id
        ?? MOTOGP_CATEGORIES.MotoGP.id

    const season = await prisma.motoGPSeason.findFirst({ where: { year } })
    if (!season) return NextResponse.json({ year, standings: [] })

    const standings = await prisma.motoGPRiderStanding.findMany({
        where: { seasonId: season.id, categoryId },
        orderBy: { position: "asc" },
        take: limit,
        include: { rider: true },
    })

    return NextResponse.json({ year, category: cat, standings })
}