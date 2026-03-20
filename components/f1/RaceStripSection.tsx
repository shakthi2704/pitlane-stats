"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import type { Race } from "@/components/types/f1"

const RaceStripSection = ({ races }: { races: Race[] }) => {

    const scrollRef = useRef<HTMLDivElement>(null)
    const today = new Date().toISOString().split("T")[0]
    const nextIdx = races.findIndex(r => r.date >= today)


    useEffect(() => {
        if (scrollRef.current && nextIdx > 0) {
            const card = scrollRef.current.children[nextIdx] as HTMLElement
            if (card) scrollRef.current.scrollLeft = card.offsetLeft - 120
        }
    }, [nextIdx])

    return (
        <div
            className="bg-[#111111] border-b border-white/5"
            style={{ maxWidth: "100vw", overflow: "hidden" }}
        >
            <div
                ref={scrollRef}
                className="flex shrink-0 scrollbar-none"
                style={{
                    overflowX: "scroll",
                    WebkitOverflowScrolling: "touch",
                    maxWidth: "100%",
                    width: "100%",
                }}
            >
                {races.map((race, i) => {
                    const isPast = race.date < today
                    const isNext = i === nextIdx
                    return (
                        <Link key={race.id}
                            href={`/sports/f1/races/${race.round}`}
                            className="flex-none shrink-0" >
                            <div
                                className="relative flex flex-col px-5 py-3 border-r border-white/5 transition-all duration-200 hover:bg-white/[0.04] min-w-[130px] cursor-pointer"
                                style={{
                                    borderBottom: isNext
                                        ? "2px solid var(--color-f1-red)"
                                        : "2px solid transparent",
                                }}
                            >
                                {/* Round label */}
                                <span
                                    className="text-[9px] font-semibold tracking-[0.2em] uppercase mb-1"
                                    style={{ color: isNext ? "var(--color-f1-red)" : "rgba(255,255,255,0.2)" }}
                                >
                                    Round {race.round}
                                </span>

                                {/* Country */}
                                <span
                                    className="text-sm font-bold leading-tight truncate"
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        color: isPast ? "rgba(255,255,255,0.3)" : isNext ? "#fff" : "rgba(255,255,255,0.65)",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    {race.circuit.country}
                                </span>

                                {/* Date */}
                                <span className="text-[10px] text-white/25 mt-0.5">
                                    {new Date(race.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                </span>

                                {/* Status dot */}
                                <div className="absolute top-3 right-3">
                                    {isNext && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-f1-red)] animate-pulse" />}
                                    {isPast && <div className="w-1.5 h-1.5 rounded-full bg-white/15" />}
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default RaceStripSection