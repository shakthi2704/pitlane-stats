import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params

    const circuit = await prisma.f1Circuit.findUnique({
        where: { circuitId: id },
        include: {
            races: {
                orderBy: { season: "desc" },
                include: {
                    results: {
                        where: { position: 1 },
                        include: {
                            driver: true,
                            constructor: true,
                        },
                    },
                },
            },
        },
    })

    if (!circuit) {
        return NextResponse.json({ error: "Circuit not found" }, { status: 404 })
    }

    return NextResponse.json({ circuit })
}
