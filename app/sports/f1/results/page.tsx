"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { getTeamColor, getCountryFlag, getFlagEmoji } from "@/types/f1/f1-api"
import { DRIVER_IMAGES, FALLBACK_DRIVER, AVAILABLE_SEASONS, CURRENT_SEASON } from "@/lib/fi/f1-constants"
import F1Loader from "@/components/f1/F1Loader"


const SEASONS = AVAILABLE_SEASONS


interface PodiumDriver {
    position: number | null
    driverId: string
    driverCode: string | null
    givenName: string
    familyName: string
    nationality: string | null
    constructorId: string
    constructorName: string
    time: string | null
    points: number | null
}

interface FastestLap {
    driverId: string
    driverCode: string | null
    familyName: string
    constructorId: string
    time: string | null
}

interface RaceResult {
    id: number
    round: number
    season: string
    raceName: string
    date: string
    isPast: boolean
    circuit: {
        circuitId: string
        circuitName: string
        locality: string | null
        country: string | null
    }
    podium: PodiumDriver[]
    fastestLap: FastestLap | null
    totalResults: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = new Date().toISOString().split("T")[0]

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
    })
}

const medalColors = ["#F5C842", "#C0C0C0", "#CD7F32"]

// ─── Podium mini display ──────────────────────────────────────────────────────

const PodiumMini = ({ driver, position }: { driver: PodiumDriver; position: number }) => {
    const teamColor = getTeamColor(driver.constructorId)
    const imgSrc = DRIVER_IMAGES[driver.driverId] ?? FALLBACK_DRIVER
    const medalColor = medalColors[position - 1] ?? "#888"



    return (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{
                fontFamily: "var(--font-display)", fontSize: "0.65rem",
                color: medalColor, minWidth: "16px", fontWeight: 700,
            }}>P{position}</span>
            <div style={{
                width: "22px", height: "22px", borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                backgroundColor: teamColor + "40", border: `1px solid ${teamColor}60`,
            }}>
                <img src={imgSrc} alt={driver.familyName}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_DRIVER }} />
            </div>
            <div>
                <span style={{
                    fontFamily: "var(--font-display)", fontSize: "0.78rem",
                    fontWeight: 400, color: "#fff",
                }}>
                    {driver.familyName.toUpperCase()}
                </span>

            </div>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
    const [season, setSeason] = useState(CURRENT_SEASON)
    const [races, setRaces] = useState<RaceResult[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<"all" | "past" | "upcoming">("past")
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setLoading(true)
        fetch(`/api/f1/results?season=${season}`)
            .then(r => r.json())
            .then(data => setRaces(data.races ?? []))
            .finally(() => setLoading(false))
    }, [season])

    const scrollLeft = () => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })
    const scrollRight = () => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })


    const filtered = races.filter(r => {
        if (filter === "past") return r.isPast
        if (filter === "upcoming") return !r.isPast
        return true
    })

    const pastCount = races.filter(r => r.isPast).length
    const upcomingCount = races.filter(r => !r.isPast).length
    const nextRace = races.find(r => !r.isPast)

    return (
        <div>
            {/* ── HEADER ── */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "48px 0 0" }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", marginBottom: "24px" }}>
                        <div>
                            <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-f1-red)", marginBottom: "8px" }}>
                                Formula 1
                            </p>
                            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 700, color: "#ffffff", margin: "0 0 8px 0", lineHeight: 0.9, letterSpacing: "-0.03em" }}>
                                {season} RESULTS
                            </h1>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem", margin: 0 }}>
                                {races.length} rounds · {pastCount} completed · {upcomingCount} remaining
                            </p>
                        </div>

                        {/* Season pills */}
                        {/* Season pills */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button
                                onClick={scrollLeft}
                                style={{ cursor: "pointer", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white" }}
                            >
                                ◀
                            </button>

                            <div
                                ref={scrollRef}
                                style={{
                                    display: "flex",
                                    gap: "8px",
                                    overflowX: "auto",
                                    scrollBehavior: "smooth",
                                    whiteSpace: "nowrap",
                                    maxWidth: "200px",
                                    scrollbarWidth: "none",
                                }}
                            >
                                {SEASONS.map(s => (
                                    <button
                                        key={s}
                                        data-active={season === s}
                                        onClick={() => setSeason(s)}
                                        style={{
                                            flex: "0 0 auto",
                                            fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 600,
                                            padding: "6px 14px", cursor: "pointer", border: "1px solid", transition: "all 0.2s",
                                            borderColor: season === s ? "var(--color-f1-red)" : "rgba(255,255,255,0.1)",
                                            backgroundColor: season === s ? "var(--color-f1-red)" : "transparent",
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
                            >
                                ▶
                            </button>
                        </div>
                    </div>

                    {/* Filter tabs */}
                    <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        {([
                            { key: "past", label: `Results ${pastCount}` },
                            { key: "upcoming", label: `Upcoming ${upcomingCount}` },
                            { key: "all", label: `All ${races.length}` },
                        ] as const).map(tab => (
                            <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
                                fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600,
                                letterSpacing: "0.12em", textTransform: "uppercase",
                                padding: "10px 16px", background: "none", border: "none",
                                cursor: "pointer", transition: "color 0.2s", marginBottom: "-1px",
                                color: filter === tab.key ? "#ffffff" : "rgba(255,255,255,0.3)",
                                borderBottom: filter === tab.key ? "2px solid var(--color-f1-red)" : "2px solid transparent",
                            }}>{tab.label}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── BODY ── */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading && <F1Loader message="LOADING RESULTS..." />}

                {!loading && filtered.length === 0 && (
                    <div style={{ padding: "80px 0", textAlign: "center" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>
                            NO {filter === "upcoming" ? "UPCOMING RACES" : "RESULTS"} FOR {season}
                        </p>
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>

                        {/* Table header */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "3.5rem 3rem 1fr 8rem 1fr 1fr 1fr 6rem",
                            padding: "10px 16px",
                            backgroundColor: "rgba(255,255,255,0.03)",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}>
                            {["RD", "", "GRAND PRIX", "DATE", "WINNER", "2ND", "3RD", "FASTEST LAP"].map(h => (
                                <span key={h} style={{
                                    fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600,
                                    letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
                                }}>{h}</span>
                            ))}
                        </div>

                        {/* Rows */}
                        {filtered.map((race, i) => {
                            const isNext = race.id === nextRace?.id
                            const p1 = race.podium[0]
                            const p2 = race.podium[1]
                            const p3 = race.podium[2]
                            const flag = getCountryFlag(race.circuit.country)

                            return (
                                <Link
                                    key={race.id}
                                    href={`/sports/f1/races/${race.round}`}
                                    style={{ textDecoration: "none", display: "block" }}
                                >
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "3.5rem 3rem 1fr 8rem 1fr 1fr 1fr 6rem",
                                            alignItems: "center",
                                            padding: "14px 16px",
                                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                                            borderLeft: isNext ? "3px solid var(--color-f1-red)" : "3px solid transparent",
                                            backgroundColor: isNext
                                                ? "rgba(225,6,0,0.04)"
                                                : !race.isPast
                                                    ? "rgba(255,255,255,0.01)"
                                                    : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                                            transition: "background-color 0.15s",
                                            cursor: "pointer",
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)")}
                                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = isNext
                                            ? "rgba(225,6,0,0.04)"
                                            : !race.isPast ? "rgba(255,255,255,0.01)"
                                                : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)")}
                                    >
                                        {/* Round */}
                                        <span style={{
                                            fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700,
                                            color: race.isPast ? "rgba(255,255,255,0.5)" : isNext ? "var(--color-f1-red)" : "rgba(255,255,255,0.25)",
                                        }}>{race.round}</span>

                                        {/* Flag */}
                                        <span style={{ fontSize: "1.2rem" }}>{flag}</span>

                                        {/* Race name */}
                                        <div>
                                            <div style={{
                                                fontFamily: "var(--font-display)", fontSize: "0.88rem",
                                                fontWeight: 400, color: race.isPast ? "#fff" : "rgba(255,255,255,0.4)",
                                            }}>
                                                {race.raceName.replace("Grand Prix", "GP").toUpperCase()}
                                            </div>
                                            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
                                                {race.circuit.locality}, {race.circuit.country}
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div>
                                            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.5)" }}>
                                                {formatDate(race.date)}
                                            </div>
                                            {isNext && (
                                                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", color: "var(--color-f1-red)", letterSpacing: "0.1em", marginTop: "2px" }}>
                                                    ● NEXT RACE
                                                </div>
                                            )}
                                            {!race.isPast && !isNext && (
                                                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", marginTop: "2px" }}>
                                                    UPCOMING
                                                </div>
                                            )}
                                        </div>

                                        {/* P1 */}
                                        {p1 ? <PodiumMini driver={p1} position={1} /> : <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.75rem" }}>—</span>}

                                        {/* P2 */}
                                        {p2 ? <PodiumMini driver={p2} position={2} /> : <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.75rem" }}>—</span>}

                                        {/* P3 */}
                                        {p3 ? <PodiumMini driver={p3} position={3} /> : <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.75rem" }}>—</span>}

                                        {/* Fastest lap */}
                                        {race.fastestLap ? (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                                <span style={{
                                                    fontFamily: "var(--font-display)", fontSize: "0.75rem",
                                                    fontWeight: 700, color: "rgba(8, 255, 99, 0.72)",
                                                }}>
                                                    {race.fastestLap.driverCode ?? race.fastestLap.familyName.slice(0, 3).toUpperCase()}
                                                </span>
                                                {race.fastestLap.time && (
                                                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>
                                                        {race.fastestLap.time}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.75rem" }}>—</span>
                                        )}
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