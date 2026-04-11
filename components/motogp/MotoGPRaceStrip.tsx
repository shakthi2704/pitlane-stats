"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"


const MOTOGP_RED = "#E3001B"
interface MotoGPEvent {
    id: string
    name: string
    shortName: string
    sponsoredName?: string | null
    dateStart: string
    dateEnd: string
    status?: string | null
    circuit?: {
        name: string
        place?: string | null
        nation?: string | null
    } | null
}

const MotoGPRaceStrip = ({ events }: { events: MotoGPEvent[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const today = new Date().toISOString().split("T")[0]
    const nextIdx = events.findIndex(e => e.dateEnd >= today)
    const highlightIdx = nextIdx === -1 ? events.length - 1 : nextIdx

    // Auto-scroll to next/current event
    useEffect(() => {
        if (scrollRef.current && highlightIdx > 0) {
            const card = scrollRef.current.children[highlightIdx] as HTMLElement
            if (card) scrollRef.current.scrollLeft = card.offsetLeft - 120
        }
    }, [highlightIdx])

    // Track scroll position for arrow visibility
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
    }, [events])

    const scroll = (dir: "left" | "right") => {
        scrollRef.current?.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" })
    }

    const ArrowBtn = ({ dir }: { dir: "left" | "right" }) => (
        <button
            onClick={() => scroll(dir)}
            style={{
                position: "absolute",
                [dir]: 0,
                top: 0, bottom: 0,
                zIndex: 10,
                width: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: dir === "left"
                    ? "linear-gradient(90deg, #000 60%, transparent 100%)"
                    : "linear-gradient(270deg, #000 60%, transparent 100%)",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.6)",
            }}
        >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                    d={dir === "left" ? "M10 12L6 8L10 4" : "M6 12L10 8L6 4"}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    )

    return (
        <div
            style={{
                backgroundColor: "#000",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                width: "100%",
                position: "relative",
            }}
        >
            {canScrollLeft && <ArrowBtn dir="left" />}
            {canScrollRight && <ArrowBtn dir="right" />}

            {/* Scrollable strip */}
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
                {events.map((event, i) => {
                    const isPast = event.dateEnd < today
                    const isNext = i === highlightIdx
                    const nation = event.circuit?.nation ?? event.shortName ?? "—"
                    const dateStr = new Date(event.dateEnd).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short",
                    })

                    return (
                        <Link
                            key={event.id}
                            href={`/sports/motogp/races/${event.id}`}
                            style={{ flexShrink: 0, display: "block" }}
                        >
                            <div
                                style={{
                                    position: "relative",
                                    display: "flex",
                                    flexDirection: "column",
                                    padding: "12px 20px",
                                    borderRight: "1px solid rgba(255,255,255,0.05)",
                                    borderBottom: isNext
                                        ? `2px solid ${MOTOGP_RED}`
                                        : "2px solid transparent",
                                    minWidth: "120px",
                                    cursor: "pointer",
                                    backgroundColor: isNext
                                        ? `${MOTOGP_RED}0d`  // 5% opacity
                                        : "transparent",
                                    transition: "background-color 0.2s",
                                }}
                                onMouseEnter={e => {
                                    if (!isNext) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.03)"
                                }}
                                onMouseLeave={e => {
                                    if (!isNext) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
                                }}
                            >
                                {/* Short country/nation label */}
                                <span
                                    style={{
                                        fontSize: "9px",
                                        fontWeight: 600,
                                        letterSpacing: "0.2em",
                                        textTransform: "uppercase",
                                        marginBottom: "4px",
                                        color: isNext ? MOTOGP_RED : "rgba(255,255,255,0.2)",
                                        fontFamily: "var(--font-display)",
                                    }}
                                >
                                    {nation}
                                </span>

                                {/* Event short name */}
                                <span
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: "0.8rem",
                                        fontWeight: 400,
                                        lineHeight: 1.2,
                                        color: isPast
                                            ? "rgba(255,255,255,0.3)"
                                            : isNext
                                                ? "#ffffff"
                                                : "rgba(255,255,255,0.65)",
                                    }}
                                >
                                    {event.circuit?.place ?? nation}
                                </span>

                                {/* Date */}
                                <span
                                    style={{
                                        fontSize: "10px",
                                        color: "rgba(255,255,255,0.25)",
                                        marginTop: "2px",
                                    }}
                                >
                                    {dateStr}
                                </span>

                                {/* Status dot */}
                                <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                                    {isNext && (
                                        <div
                                            style={{
                                                width: "6px", height: "6px",
                                                borderRadius: "50%",
                                                backgroundColor: MOTOGP_RED,
                                            }}
                                        />
                                    )}
                                    {isPast && !isNext && (
                                        <div
                                            style={{
                                                width: "6px", height: "6px",
                                                borderRadius: "50%",
                                                backgroundColor: "rgba(255,255,255,0.15)",
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default MotoGPRaceStrip