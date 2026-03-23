"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import type { Race } from "@/components/types/f1"

const RaceStripSection = ({ races }: { races: Race[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)
    const today = new Date().toISOString().split("T")[0]
    const nextIdx = races.findIndex(r => r.date >= today)
    const highlightIdx = nextIdx === -1 ? races.length - 1 : nextIdx

    useEffect(() => {
        if (scrollRef.current && highlightIdx > 0) {
            const card = scrollRef.current.children[highlightIdx] as HTMLElement
            if (card) scrollRef.current.scrollLeft = card.offsetLeft - 120
        }
    }, [highlightIdx])

    const updateScrollButtons = () => {
        if (!scrollRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
    }

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        el.addEventListener("scroll", updateScrollButtons)
        updateScrollButtons()
        return () => el.removeEventListener("scroll", updateScrollButtons)
    }, [races])

    const scroll = (dir: "left" | "right") => {
        if (!scrollRef.current) return
        scrollRef.current.scrollBy({
            left: dir === "left" ? -400 : 400,
            behavior: "smooth",
        })
    }

    return (
        <div style={{ backgroundColor: "#111111", borderBottom: "1px solid rgba(255,255,255,0.05)", width: "100%", position: "relative" }}>

            {/* Left arrow */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll("left")}
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        zIndex: 10,
                        width: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(90deg, #111111 60%, transparent 100%)",
                        border: "none",
                        cursor: "pointer",
                        color: "rgba(255,255,255,0.6)",
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            )}

            {/* Right arrow */}
            {canScrollRight && (
                <button
                    onClick={() => scroll("right")}
                    style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        bottom: 0,
                        zIndex: 10,
                        width: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(270deg, #111111 60%, transparent 100%)",
                        border: "none",
                        cursor: "pointer",
                        color: "rgba(255,255,255,0.6)",
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            )}

            {/* Scroll container */}
            <div
                ref={scrollRef}
                style={{
                    display: "flex",
                    overflowX: "scroll",
                    overflowY: "hidden",
                    WebkitOverflowScrolling: "touch",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    width: "100%",
                    paddingLeft: "40px",
                    paddingRight: "40px",
                }}
            >
                {races.map((race, i) => {
                    const isPast = race.date < today
                    const isNext = i === highlightIdx

                    return (
                        <Link
                            key={race.id}
                            href={`/sports/f1/races/${race.round}`}
                            style={{ flexShrink: 0, display: "block" }}
                        >
                            <div
                                style={{
                                    position: "relative",
                                    display: "flex",
                                    flexDirection: "column",
                                    padding: "12px 20px",
                                    borderRight: "1px solid rgba(255,255,255,0.05)",
                                    borderBottom: isNext ? "2px solid var(--color-f1-red)" : "2px solid transparent",
                                    minWidth: "130px",
                                    cursor: "pointer",
                                    backgroundColor: isNext ? "rgba(225,6,0,0.05)" : "transparent",
                                    transition: "background-color 0.2s",
                                }}
                                onMouseEnter={e => {
                                    if (!isNext) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.03)"
                                }}
                                onMouseLeave={e => {
                                    if (!isNext) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
                                }}
                            >
                                <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px", color: isNext ? "var(--color-f1-red)" : "rgba(255,255,255,0.2)", fontFamily: "var(--font-display)" }}>
                                    R{race.round}
                                </span>
                                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", fontWeight: 700, lineHeight: 1.2, color: isPast ? "rgba(255,255,255,0.3)" : isNext ? "#ffffff" : "rgba(255,255,255,0.65)" }}>
                                    {race.circuit.country}
                                </span>
                                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>
                                    {new Date(race.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                </span>
                                <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                                    {isNext && <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--color-f1-red)" }} />}
                                    {isPast && !isNext && <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)" }} />}
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