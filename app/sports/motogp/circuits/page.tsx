"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import F1Loader from "@/components/f1/F1Loader"
import { MOTOGP_RED, CURRENT_SEASON, MOTOGP_AVAILABLE_SEASONS } from "@/lib/motogp/motogp-constants"
import { getConstructorColor } from "@/components/motogp/MotoGPRiderStandings"
import { getMotoGPCircuitStatic } from "@/lib/motogp/circuit-data"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Circuit {
    circuitId: string
    circuitName: string
    place?: string | null
    nation?: string | null
    eventId: string
    eventName: string
    shortName: string
    dateStart: string
    dateEnd: string
    status?: string | null
    isPast: boolean
    isNext: boolean
    winner?: {
        riderId: string
        riderName: string
        constructorName?: string | null
    } | null
}

// ─── Nation → ISO2 ───────────────────────────────────────────────────────────

const NATION_TO_ISO2: Record<string, string> = {
    SPA: "ES", ITA: "IT", FRA: "FR", GBR: "GB", GER: "DE",
    NED: "NL", POR: "PT", AME: "US", ARG: "AR", AUS: "AU",
    JPN: "JP", MAL: "MY", THA: "TH", IND: "IN", IDN: "ID",
    QAT: "QA", KAZ: "KZ", FIN: "FI", AUT: "AT", CZE: "CZ",
    RSM: "SM", AND: "AD", CAT: "ES", VAL: "ES", ARA: "ES",
    TUT: "TN", MAS: "MY", CHN: "CN", SAF: "ZA", BRE: "BR",
    BRA: "BR", MEX: "MX", CAN: "CA", USA: "US", PRC: "CN",
}

function getFlagEmoji(nation: string | null | undefined): string {
    if (!nation) return "🏁"
    const iso2 = NATION_TO_ISO2[nation.toUpperCase()] ?? (nation.length === 2 ? nation : null)
    if (!iso2) return "🏁"
    return iso2.toUpperCase().replace(/./g, c => String.fromCodePoint(c.charCodeAt(0) + 127397))
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

// ─── Circuit Card ─────────────────────────────────────────────────────────────

const CircuitCard = ({ circuit, index }: { circuit: Circuit; index: number }) => {
    const flag = getFlagEmoji(circuit.nation)
    const staticData = getMotoGPCircuitStatic(circuit.circuitName)
    const constructorColor = circuit.winner?.constructorName
        ? getConstructorColor(circuit.winner.constructorName)
        : "var(--accent)"
    const winnerParts = circuit.winner?.riderName.split(" ") ?? []
    const winnerLast = winnerParts.slice(1).join(" ") || winnerParts[0] || ""

    const accentColor = circuit.isPast && circuit.winner
        ? constructorColor
        : circuit.isNext && !circuit.isPast
            ? "var(--accent)"
            : "rgba(255,255,255,0.08)"

    return (
        <Link href={`/sports/motogp/circuits/${circuit.circuitId}`} style={{ textDecoration: "none" }}>
            <div
                style={{
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderTop: `3px solid ${accentColor}`,
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(-5px)"
                    el.style.boxShadow = `0 16px 40px ${accentColor}30`
                    el.style.borderColor = `${accentColor}70`
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(0)"
                    el.style.boxShadow = "none"
                    el.style.borderColor = "rgba(255,255,255,0.07)"
                }}
            >
                {/* Visual area */}
                <div style={{
                    position: "relative", height: "150px",
                    backgroundColor: "rgba(255,255,255,0.02)",
                    overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <div style={{
                        fontSize: "110px",
                        opacity: circuit.isPast ? 0.07 : 0.12,
                        filter: "blur(3px)",
                        userSelect: "none",
                        lineHeight: 1,
                    }}>
                        {flag}
                    </div>
                    <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(0deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.4) 55%, rgba(10,10,10,0.1) 100%)"
                    }} />

                    {/* Round badge */}
                    <div style={{ position: "absolute", top: "10px", left: "12px" }}>
                        <span style={{
                            fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600,
                            letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)",
                            backgroundColor: "rgba(0,0,0,0.65)", padding: "3px 8px",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}>
                            {String(index + 1).padStart(2, "0")}
                        </span>
                    </div>

                    {/* Status badge */}
                    <div style={{ position: "absolute", top: "10px", right: "12px" }}>
                        {circuit.isNext && !circuit.isPast && (
                            <span style={{
                                fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 700,
                                letterSpacing: "0.12em", textTransform: "uppercase",
                                color: "#fff", padding: "3px 8px",
                                background: `linear-gradient(135deg, ${MOTOGP_RED}, ${MOTOGP_RED}cc)`,
                                boxShadow: `0 4px 12px ${MOTOGP_RED}55`,
                            }}>
                                NEXT
                            </span>
                        )}
                        {!circuit.isNext && staticData?.lapRecord && (
                            <span style={{
                                fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 600,
                                letterSpacing: "0.08em", color: "#4ade80",
                                backgroundColor: "rgba(0,0,0,0.65)", padding: "2px 7px",
                                border: "1px solid rgba(74,222,128,0.3)",
                            }}>
                                🟢 {staticData.lapRecord}
                            </span>
                        )}
                    </div>

                    {/* Nation label */}
                    <div style={{ position: "absolute", bottom: "12px", left: "14px" }}>
                        <p style={{
                            fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 800,
                            color: circuit.isPast ? "rgba(255,255,255,0.55)" : "#fff",
                            margin: 0, textTransform: "uppercase",
                        }}>
                            {circuit.nation ?? circuit.place ?? "—"}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: "14px" }}>
                    <p style={{
                        fontFamily: "var(--font-display)", fontSize: "0.88rem", fontWeight: 700,
                        color: circuit.isPast ? "rgba(255,255,255,0.55)" : "#fff",
                        margin: "0 0 3px", lineHeight: 1.2,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                        {circuit.eventName}
                    </p>
                    <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: "0 0 10px" }}>
                        📍 {[circuit.circuitName, circuit.place].filter(Boolean).join(" · ")}
                    </p>

                    {/* Stats row */}
                    <div style={{ display: "flex", gap: "0", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                        {staticData ? (
                            <>
                                {[
                                    { label: "LENGTH", value: staticData.length },
                                    { label: "CORNERS", value: staticData.corners },
                                    { label: "FIRST GP", value: staticData.firstGP },
                                ].map((s, i) => (
                                    <div key={s.label} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                                        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1 }}>
                                            {s.value}
                                        </p>
                                        <p style={{ fontFamily: "var(--font-display)", fontSize: "8px", fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", margin: "3px 0 0", textTransform: "uppercase" }}>
                                            {s.label}
                                        </p>
                                    </div>
                                ))}
                            </>
                        ) : circuit.isPast && circuit.winner ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: "12px" }}>🏆</span>
                                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.78rem", fontWeight: 700, color: constructorColor }}>
                                    {winnerLast.toUpperCase()}
                                </span>
                                {circuit.winner.constructorName && (
                                    <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)" }}>
                                        · {circuit.winner.constructorName}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <p style={{
                                fontFamily: "var(--font-display)", fontSize: "0.7rem",
                                color: circuit.isNext && !circuit.isPast ? "var(--accent)" : "rgba(255,255,255,0.25)",
                                margin: 0, letterSpacing: "0.06em",
                            }}>
                                🗓 {formatDateRange(circuit.dateStart, circuit.dateEnd)}
                                {circuit.isNext && !circuit.isPast && " · Up Next"}
                            </p>
                        )}
                    </div>

                    {/* Winner strip — below stats when static data is present */}
                    {staticData && circuit.isPast && circuit.winner && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                            <span style={{ fontSize: "11px" }}>🏆</span>
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700, color: constructorColor }}>
                                {winnerLast.toUpperCase()}
                            </span>
                            {circuit.winner.constructorName && (
                                <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>
                                    · {circuit.winner.constructorName}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Upcoming date — below stats for known circuits */}
                    {staticData && !circuit.isPast && (
                        <p style={{
                            fontFamily: "var(--font-display)", fontSize: "0.7rem",
                            color: circuit.isNext && !circuit.isPast ? MOTOGP_RED : "rgba(255,255,255,0.25)",
                            margin: "8px 0 0", letterSpacing: "0.06em",
                        }}>
                            🗓 {formatDateRange(circuit.dateStart, circuit.dateEnd)}
                            {circuit.isNext && !circuit.isPast && " · Up Next"}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MotoGPCircuitsPage() {
    const [season, setSeason] = useState(CURRENT_SEASON)
    const [circuits, setCircuits] = useState<Circuit[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<"all" | "past" | "upcoming">("all")
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setLoading(true)
        fetch(`/api/motogp/circuits?year=${season}`)
            .then(r => r.json())
            .then(data => setCircuits(data.circuits ?? []))
            .catch(err => console.error("[MotoGP] circuits:", err))
            .finally(() => setLoading(false))
    }, [season])

    const filtered = circuits.filter(c => {
        if (filter === "past") return c.isPast
        if (filter === "upcoming") return !c.isPast
        return true
    })

    const pastCount = circuits.filter(c => c.isPast).length
    const upcomingCount = circuits.filter(c => !c.isPast).length

    const scrollLeft = () => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })
    const scrollRight = () => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })

    return (
        <div>
            {/* Header */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "48px 0 0" }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", marginBottom: "28px" }}>
                        <div>
                            <p style={{
                                fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600,
                                letterSpacing: "0.2em", textTransform: "uppercase",
                                color: MOTOGP_RED, marginBottom: "8px",
                            }}>
                                MotoGP™
                            </p>
                            <h1 style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                                fontWeight: 700, color: "#ffffff",
                                margin: "0 0 8px", lineHeight: 0.9, letterSpacing: "-0.03em",
                            }}>
                                CIRCUITS
                            </h1>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem", margin: 0 }}>
                                {season} MotoGP™ World Championship · {circuits.length} venues
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

                    {/* Filter tabs */}
                    <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        {([
                            { key: "all", label: `All ${circuits.length}` },
                            { key: "upcoming", label: `Upcoming ${upcomingCount}` },
                            { key: "past", label: `Completed ${pastCount}` },
                        ] as const).map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                style={{
                                    fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600,
                                    letterSpacing: "0.12em", textTransform: "uppercase",
                                    padding: "10px 18px", background: "none", border: "none",
                                    cursor: "pointer", transition: "color 0.2s", marginBottom: "-1px",
                                    color: filter === tab.key ? "#ffffff" : "rgba(255,255,255,0.3)",
                                    borderBottom: filter === tab.key ? `2px solid ${MOTOGP_RED}` : "2px solid transparent",
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
                {loading ? (
                    <F1Loader message="LOADING CIRCUITS..." />
                ) : filtered.length === 0 ? (
                    <div style={{ padding: "80px", textAlign: "center" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>
                            NO CIRCUITS FOUND
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "12px",
                    }}>
                        {filtered.map((c) => (
                            <CircuitCard key={c.circuitId} circuit={c} index={circuits.indexOf(c)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}