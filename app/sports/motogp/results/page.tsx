"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import F1Loader from "@/components/f1/F1Loader"
import { CURRENT_SEASON, MOTOGP_AVAILABLE_SEASONS } from "@/lib/motogp/motogp-constants"
import { getConstructorColor } from "@/components/motogp/MotoGPRiderStandings"

// ─── Types ────────────────────────────────────────────────────────────────────

type ClassFilter = "MotoGP" | "Moto2" | "Moto3"

interface PodiumRider {
    position: number | null
    riderId: string
    riderName: string
    nationality?: string | null
    number?: number | null
    photoUrl?: string | null
    constructorName?: string | null
    time?: string | null
    points?: number | null
}

interface SprintWinner {
    riderId: string
    riderName: string
    constructorName?: string | null
}

interface RaceResult {
    eventId: string
    name: string
    shortName: string
    dateStart: string
    dateEnd: string
    isPast: boolean
    status?: string | null
    circuit: {
        name: string
        place?: string | null
        nation?: string | null
    }
    podium: PodiumRider[]
    sprintWinner: SprintWinner | null
    hasResults: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FALLBACK_PHOTO = "/F1/drivers/placeholder.svg"
const MEDAL_COLORS = ["#F5C842", "#C0C0C0", "#CD7F32"]
const CLASS_TABS: ClassFilter[] = ["MotoGP", "Moto2", "Moto3"]

function getFlagEmoji(nation: string | null | undefined): string {
    if (!nation) return "🏁"
    const NATION_TO_ISO2: Record<string, string> = {
        SPA: "ES", ITA: "IT", FRA: "FR", GBR: "GB", GER: "DE",
        NED: "NL", POR: "PT", AME: "US", ARG: "AR", AUS: "AU",
        JPN: "JP", MAL: "MY", THA: "TH", IND: "IN", IDN: "ID",
        QAT: "QA", KAZ: "KZ", AUT: "AT", CZE: "CZ", RSM: "SM",
        CHN: "CN", BRA: "BR", MEX: "MX", USA: "US",
    }
    const iso2 = NATION_TO_ISO2[nation.toUpperCase()] ?? (nation.length === 2 ? nation : null)
    if (!iso2) return "🏁"
    return iso2.toUpperCase().replace(/./g, c => String.fromCodePoint(c.charCodeAt(0) + 127397))
}

function getRiderFlag(iso2: string | null | undefined): string {
    if (!iso2 || iso2.length !== 2) return ""
    return iso2.toUpperCase().replace(/./g, c => String.fromCodePoint(c.charCodeAt(0) + 127397))
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
    })
}

// ─── Podium mini ─────────────────────────────────────────────────────────────

const PodiumMini = ({ rider, position }: { rider: PodiumRider; position: number }) => {
    const color = getConstructorColor(rider.constructorName ?? "")
    const medalColor = MEDAL_COLORS[position - 1] ?? "#888"
    const nameParts = rider.riderName.split(" ")
    const lastName = nameParts.slice(1).join(" ") || nameParts[0]

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", color: medalColor, minWidth: "16px", fontWeight: 700 }}>
                P{position}
            </span>
            <div style={{
                width: "22px", height: "22px", overflow: "hidden", flexShrink: 0,
                backgroundColor: `${color}40`, border: `1px solid ${color}60`,
            }}>
                <img
                    src={rider.photoUrl ?? FALLBACK_PHOTO}
                    alt={rider.riderName}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                    onError={e => { (e.target as HTMLImageElement).src = FALLBACK_PHOTO }}
                />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.78rem", fontWeight: 400, color: "#fff" }}>
                {lastName.toUpperCase()}
            </span>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MotoGPResultsPage() {
    const [season, setSeason] = useState(CURRENT_SEASON)
    const [category, setCategory] = useState<ClassFilter>("MotoGP")
    const [races, setRaces] = useState<RaceResult[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<"past" | "upcoming" | "all">("past")
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setLoading(true)
        fetch(`/api/motogp/results?year=${season}&category=${category}`)
            .then(r => r.json())
            .then(data => setRaces(data.races ?? []))
            .catch(err => console.error("[MotoGP] results:", err))
            .finally(() => setLoading(false))
    }, [season, category])

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
            {/* Header */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "48px 0 0" }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", marginBottom: "24px" }}>
                        <div>
                            <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "8px" }}>
                                MotoGP™
                            </p>
                            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 700, color: "#ffffff", margin: "0 0 8px", lineHeight: 0.9, letterSpacing: "-0.03em" }}>
                                {season} RESULTS
                            </h1>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem", margin: 0 }}>
                                {races.length} rounds · {pastCount} completed · {upcomingCount} remaining
                            </p>
                        </div>

                        {/* Season selector */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button onClick={scrollLeft} style={{ cursor: "pointer", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white" }}>◀</button>
                            <div ref={scrollRef} style={{ display: "flex", gap: "8px", overflowX: "auto", scrollBehavior: "smooth", whiteSpace: "nowrap", maxWidth: "220px", scrollbarWidth: "none" }}>
                                {MOTOGP_AVAILABLE_SEASONS.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSeason(s)}
                                        style={{
                                            flex: "0 0 auto", fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 600,
                                            padding: "6px 14px", cursor: "pointer", border: "1px solid", transition: "all 0.2s",
                                            borderColor: season === s ? "var(--accent)" : "rgba(255,255,255,0.1)",
                                            backgroundColor: season === s ? "var(--accent)" : "transparent",
                                            color: season === s ? "#fff" : "rgba(255,255,255,0.4)",
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <button onClick={scrollRight} style={{ cursor: "pointer", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white" }}>▶</button>
                        </div>
                    </div>

                    {/* Class tabs + filter tabs */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        {/* Class tabs */}
                        <div style={{ display: "flex" }}>
                            {CLASS_TABS.map(cls => (
                                <button
                                    key={cls}
                                    onClick={() => setCategory(cls)}
                                    style={{
                                        fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 600,
                                        letterSpacing: "0.12em", textTransform: "uppercase",
                                        padding: "10px 18px", background: "none", border: "none",
                                        cursor: "pointer", transition: "color 0.2s", marginBottom: "-1px",
                                        color: category === cls ? "#fff" : "rgba(255,255,255,0.3)",
                                        borderBottom: category === cls ? "2px solid var(--accent)" : "2px solid transparent",
                                    }}
                                >
                                    {cls}™
                                </button>
                            ))}
                        </div>

                        {/* Filter tabs */}
                        <div style={{ display: "flex" }}>
                            {([
                                { key: "past", label: `Results ${pastCount}` },
                                { key: "upcoming", label: `Upcoming ${upcomingCount}` },
                                { key: "all", label: `All ${races.length}` },
                            ] as const).map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key)}
                                    style={{
                                        fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600,
                                        letterSpacing: "0.12em", textTransform: "uppercase",
                                        padding: "10px 14px", background: "none", border: "none",
                                        cursor: "pointer", transition: "color 0.2s", marginBottom: "-1px",
                                        color: filter === tab.key ? "#fff" : "rgba(255,255,255,0.3)",
                                        borderBottom: filter === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading && <F1Loader message="LOADING RESULTS..." />}

                {!loading && filtered.length === 0 && (
                    <div style={{ padding: "80px 0", textAlign: "center" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>
                            NO {filter === "upcoming" ? "UPCOMING RACES" : "RESULTS"} FOR {season} {category}™
                        </p>
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                        {/* Table header */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "3rem 2rem 1fr 9rem 1fr 1fr 1fr 7rem",
                            padding: "10px 16px",
                            backgroundColor: "rgba(255,255,255,0.03)",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}>
                            {["RD", "", "GRAND PRIX", "DATE", "WINNER", "2ND", "3RD", "SPRINT"].map(h => (
                                <span key={h} style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
                                    {h}
                                </span>
                            ))}
                        </div>

                        {filtered.map((race, i) => {
                            const isNext = race.eventId === nextRace?.eventId
                            const flag = getFlagEmoji(race.circuit.nation)
                            const p1 = race.podium[0]
                            const p2 = race.podium[1]
                            const p3 = race.podium[2]
                            const sprintLastName = race.sprintWinner?.riderName.split(" ").slice(1).join(" ") || race.sprintWinner?.riderName
                            const sprintColor = race.sprintWinner?.constructorName ? getConstructorColor(race.sprintWinner.constructorName) : "var(--accent)"

                            return (
                                <Link
                                    key={race.eventId}
                                    href={`/ sports / motogp / races / ${race.eventId}`}
                                    style={{ textDecoration: "none", display: "block" }}
                                >
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "3rem 2rem 1fr 9rem 1fr 1fr 1fr 7rem",
                                            alignItems: "center",
                                            padding: "14px 16px",
                                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                                            borderLeft: isNext ? "3px solid var(--accent)" : "3px solid transparent",
                                            backgroundColor: isNext
                                                ? "color-mix(in srgb, var(--accent) 3%, transparent)"
                                                : !race.isPast
                                                    ? "rgba(255,255,255,0.01)"
                                                    : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                                            transition: "background-color 0.15s",
                                            cursor: "pointer",
                                        }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)"}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = isNext
                                            ? "color-mix(in srgb, var(--accent) 3%, transparent)"
                                            : !race.isPast ? "rgba(255,255,255,0.01)"
                                                : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"}
                                    >
                                        {/* Round */}
                                        <span style={{
                                            fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700,
                                            color: race.isPast ? "rgba(255,255,255,0.5)" : isNext ? "var(--accent)" : "rgba(255,255,255,0.25)",
                                        }}>
                                            {i + 1}
                                        </span>

                                        {/* Flag */}
                                        <span style={{ fontSize: "1.1rem" }}>{flag}</span>

                                        {/* Race name */}
                                        <div>
                                            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 400, color: race.isPast ? "#fff" : "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {race.name.toUpperCase()}
                                            </div>
                                            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
                                                {race.circuit.name}{race.circuit.place ? `, ${race.circuit.place}` : ""}
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div>
                                            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.5)" }}>
                                                {formatDate(race.dateEnd)}
                                            </div>
                                            {isNext && (
                                                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", color: "var(--accent)", letterSpacing: "0.1em", marginTop: "2px" }}>
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
                                        {p1 ? <PodiumMini rider={p1} position={1} /> : <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.75rem" }}>—</span>}

                                        {/* P2 */}
                                        {p2 ? <PodiumMini rider={p2} position={2} /> : <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.75rem" }}>—</span>}

                                        {/* P3 */}
                                        {p3 ? <PodiumMini rider={p3} position={3} /> : <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.75rem" }}>—</span>}

                                        {/* Sprint winner */}
                                        {race.sprintWinner ? (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700, color: sprintColor }}>
                                                    {sprintLastName?.toUpperCase()}
                                                </span>
                                                {race.sprintWinner.constructorName && (
                                                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>
                                                        {race.sprintWinner.constructorName}
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