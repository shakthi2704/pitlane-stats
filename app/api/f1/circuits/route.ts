import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const circuits = await prisma.f1Circuit.findMany({
        orderBy: { country: "asc" },
        include: {
            _count: { select: { races: true } },
        },
    })

    return NextResponse.json({ circuits })
}