import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { MOTOGP_CATEGORIES } from "@/lib/motogp-sync"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get("year") ?? "2025")
    const cat = searchParams.get("category") ?? "MotoGP"
    const filter = searchParams.get("filter") ?? "all" // all | upcoming | past

    const categoryId = MOTOGP_CATEGORIES[cat as keyof typeof MOTOGP_CATEGORIES]?.id
        ?? MOTOGP_CATEGORIES.MotoGP.id

    const season = await prisma.motoGPSeason.findFirst({ where: { year } })
    if (!season) return NextResponse.json({ year, events: [] })

    const today = new Date().toISOString().split("T")[0]

    const where: Record<string, unknown> = {
        seasonId: season.id,
        categoryId,
        isTest: false,
    }

    if (filter === "past") where.dateEnd = { lte: today }
    if (filter === "upcoming") where.dateEnd = { gt: today }

    const events = await prisma.motoGPEvent.findMany({
        where,
        orderBy: { dateEnd: "asc" },
        include: { circuit: true },
    })

    return NextResponse.json({ year, category: cat, events })
}