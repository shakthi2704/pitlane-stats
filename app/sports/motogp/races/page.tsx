"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import F1Loader from "@/components/f1/F1Loader"
import { MOTOGP_AVAILABLE_SEASONS } from "@/lib/motogp/motogp-constants"

interface MotoGPEvent {
    id: string
    name: string
    shortName: string
    sponsoredName?: string | null
    dateStart: string
    dateEnd: string
    status?: string | null
    isTest: boolean
    circuit?: {
        name: string
        place?: string | null
        nation?: string | null
    } | null
}

function getFlagEmoji(iso: string): string {
    if (!iso || iso.length !== 2) return "🏁"
    return iso.toUpperCase().replace(/./g, c =>
        String.fromCodePoint(c.charCodeAt(0) + 127397)
    )
}

function formatDateRange(start: string, end: string): string {
    const s = new Date(start)
    const e = new Date(end)
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
    if (s.getMonth() === e.getMonth()) {
        return `${s.getDate()}–${e.toLocaleDateString("en-GB", opts)}`
    }
    return `${s.toLocaleDateString("en-GB", opts)} – ${e.toLocaleDateString("en-GB", opts)}`
}

const today = new Date().toISOString().split("T")[0]

export default function MotoGPRacesPage() {
    const currentYear = new Date().getFullYear().toString()
    const [season, setSeason] = useState(currentYear)
    const [events, setEvents] = useState<MotoGPEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<"all" | "past" | "upcoming">("upcoming")
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setLoading(true)
        fetch(`/api/motogp/events?year=${season}&category=MotoGP`)
            .then(r => r.json())
            .then(data => setEvents((data.events ?? []).filter((e: MotoGPEvent) => !e.isTest)))
            .catch(err => console.error("[MotoGP] races:", err))
            .finally(() => setLoading(false))
    }, [season])

    const nextIdx = events.findIndex(e => e.dateEnd >= today)

    const filtered = events.filter(e => {
        if (filter === "past") return e.dateEnd < today
        if (filter === "upcoming") return e.dateEnd >= today
        return true
    })

    const pastCount = events.filter(e => e.dateEnd < today).length
    const upcomingCount = events.filter(e => e.dateEnd >= today).length

    const scrollLeft = () => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })
    const scrollRight = () => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })

    return (
        <div>
            {/* Header */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "48px 0 36px" }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                        <div>
                            <p style={{
                                fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600,
                                letterSpacing: "0.2em", textTransform: "uppercase",
                                color: "var(--accent)", marginBottom: "8px",
                            }}>
                                MotoGP™
                            </p>
                            <h1 style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                                fontWeight: 700, color: "#ffffff",
                                margin: "0 0 8px 0", lineHeight: 0.9, letterSpacing: "-0.03em",
                            }}>
                                {season} CALENDAR
                            </h1>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem", margin: 0 }}>
                                {events.length} rounds · {pastCount} completed · {upcomingCount} remaining
                            </p>
                        </div>

                        {/* Season selector */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button
                                onClick={scrollLeft}
                                style={{ cursor: "pointer", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white" }}
                            >◀</button>
                            <div
                                ref={scrollRef}
                                style={{ display: "flex", gap: "8px", overflowX: "auto", scrollBehavior: "smooth", whiteSpace: "nowrap", maxWidth: "220px", scrollbarWidth: "none" }}
                            >
                                {MOTOGP_AVAILABLE_SEASONS.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSeason(s)}
                                        style={{
                                            flex: "0 0 auto",
                                            fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 600,
                                            padding: "6px 14px", cursor: "pointer", border: "1px solid", transition: "all 0.2s",
                                            borderColor: season === s ? "var(--accent)" : "rgba(255,255,255,0.1)",
                                            backgroundColor: season === s ? "var(--accent)" : "transparent",
                                            color: season === s ? "#ffffff" : "rgba(255,255,255,0.4)",
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={scrollRight}
                                style={{ cursor: "pointer", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white" }}
                            >▶</button>
                        </div>
                    </div>

                    {/* Filter tabs */}
                    <div style={{ display: "flex", gap: "0", marginTop: "24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        {([
                            { key: "upcoming", label: `Upcoming ${upcomingCount}` },
                            { key: "past", label: `Completed ${pastCount}` },
                            { key: "all", label: `All ${events.length}` },
                        ] as const).map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                style={{
                                    fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600,
                                    letterSpacing: "0.12em", textTransform: "uppercase",
                                    padding: "10px 16px", background: "none", border: "none", cursor: "pointer",
                                    transition: "color 0.2s", marginBottom: "-1px",
                                    color: filter === tab.key ? "#ffffff" : "rgba(255,255,255,0.3)",
                                    borderBottom: filter === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                {loading && <F1Loader message="LOADING CALENDAR..." />}

                {!loading && filtered.length === 0 && (
                    <div style={{ padding: "80px", textAlign: "center" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>
                            NO EVENTS FOUND
                        </p>
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                        {filtered.map((event) => {
                            const isPast = event.dateEnd < today
                            const isNext = events.indexOf(event) === nextIdx
                            const isFinished = event.status === "FINISHED"
                            const flag = getFlagEmoji(event.circuit?.nation ?? "")

                            return (
                                <Link
                                    key={event.id}
                                    href={`/sports/motogp/races/${event.id}`}
                                    style={{ textDecoration: "none" }}
                                >
                                    <div
                                        style={{
                                            position: "relative",
                                            overflow: "hidden",
                                            background: isNext
                                                ? "linear-gradient(180deg, color-mix(in srgb, var(--accent) 8%, transparent), rgba(0,0,0,0.9))"
                                                : "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.9))",
                                            border: "1px solid",
                                            borderColor: isNext
                                                ? "color-mix(in srgb, var(--accent) 40%, transparent)"
                                                : "rgba(255,255,255,0.08)",
                                            transition: "all 0.25s ease",
                                            cursor: "pointer",
                                        }}
                                        onMouseEnter={e => {
                                            const el = e.currentTarget as HTMLElement
                                            el.style.transform = "translateY(-6px) scale(1.01)"
                                            el.style.boxShadow = isNext
                                                ? "0 20px 50px color-mix(in srgb, var(--accent) 25%, transparent)"
                                                : "0 16px 40px rgba(0,0,0,0.6)"
                                        }}
                                        onMouseLeave={e => {
                                            const el = e.currentTarget as HTMLElement
                                            el.style.transform = "translateY(0) scale(1)"
                                            el.style.boxShadow = "none"
                                        }}
                                    >
                                        {/* Top accent bar */}
                                        <div style={{
                                            height: "3px",
                                            backgroundColor: isNext
                                                ? "var(--accent)"
                                                : isPast
                                                    ? "rgba(255,255,255,0.08)"
                                                    : "rgba(255,255,255,0.04)",
                                        }} />

                                        {/* Header area — flag + nation */}
                                        <div style={{ position: "relative", height: "130px", backgroundColor: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
                                            {/* Big flag emoji background */}
                                            <div style={{
                                                position: "absolute", inset: 0,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: "100px", opacity: isPast ? 0.12 : 0.18,
                                                filter: "blur(2px)",
                                            }}>
                                                {flag}
                                            </div>

                                            {/* Gradient */}
                                            <div style={{
                                                position: "absolute", inset: 0,
                                                background: "linear-gradient(0deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.4) 60%, rgba(10,10,10,0.1) 100%)",
                                            }} />

                                            {/* Round badge */}
                                            <div style={{ position: "absolute", top: "10px", left: "12px" }}>
                                                <span style={{
                                                    fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600,
                                                    letterSpacing: "0.1em", color: "rgba(255,255,255,0.7)",
                                                    backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
                                                    border: "1px solid rgba(255,255,255,0.1)", padding: "3px 8px",
                                                }}>
                                                    {event.shortName}
                                                </span>
                                            </div>

                                            {/* Status badge */}
                                            <div style={{ position: "absolute", top: "10px", right: "12px" }}>
                                                {isNext && (
                                                    <span style={{
                                                        fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 700,
                                                        letterSpacing: "0.12em", textTransform: "uppercase",
                                                        color: "#ffffff", padding: "3px 8px",
                                                        background: "linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 80%, transparent))",
                                                        boxShadow: "0 4px 12px color-mix(in srgb, var(--accent) 40%, transparent)",
                                                    }}>
                                                        NEXT
                                                    </span>
                                                )}
                                                {isFinished && !isNext && (
                                                    <span style={{
                                                        fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 600,
                                                        letterSpacing: "0.12em", textTransform: "uppercase",
                                                        color: "rgba(255,255,255,0.5)", padding: "3px 8px",
                                                        backgroundColor: "rgba(255,255,255,0.08)",
                                                        border: "1px solid rgba(255,255,255,0.1)",
                                                    }}>
                                                        ✓ DONE
                                                    </span>
                                                )}
                                                {isPast && !isFinished && !isNext && (
                                                    <span style={{
                                                        fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 600,
                                                        letterSpacing: "0.12em", textTransform: "uppercase",
                                                        color: "rgba(255,255,255,0.4)", padding: "3px 8px",
                                                        backgroundColor: "rgba(255,255,255,0.05)",
                                                        border: "1px solid rgba(255,255,255,0.08)",
                                                    }}>
                                                        PAST
                                                    </span>
                                                )}
                                            </div>

                                            {/* Nation + circuit */}
                                            <div style={{ position: "absolute", bottom: "12px", left: "14px", right: "14px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span style={{ fontSize: "22px" }}>{flag}</span>
                                                    <p style={{
                                                        fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 800,
                                                        color: isPast ? "rgba(255,255,255,0.6)" : "#ffffff", margin: 0,
                                                    }}>
                                                        {event.circuit?.nation ?? event.circuit?.place ?? "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div style={{ padding: "16px" }}>
                                            <p style={{
                                                fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700,
                                                color: isPast ? "rgba(255,255,255,0.6)" : "#ffffff",
                                                margin: "0 0 4px 0", lineHeight: 1.2,
                                            }}>
                                                {event.sponsoredName ?? event.name}
                                            </p>

                                            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", margin: "0 0 12px 0" }}>
                                                {event.circuit?.name}
                                                {event.circuit?.place ? ` · ${event.circuit.place}` : ""}
                                            </p>

                                            {/* Footer */}
                                            <div style={{ paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                                                <p style={{
                                                    fontFamily: "var(--font-display)", fontSize: "0.72rem",
                                                    color: isNext ? "var(--accent)" : "rgba(255,255,255,0.3)",
                                                    margin: 0, letterSpacing: "0.08em",
                                                }}>
                                                    🗓 {formatDateRange(event.dateStart, event.dateEnd)}
                                                    {!isPast && !isNext && <span style={{ color: "rgba(255,255,255,0.2)", marginLeft: "8px" }}>· Upcoming</span>}
                                                    {isNext && <span style={{ marginLeft: "8px" }}>· Up Next</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}