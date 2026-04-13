"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import F1Loader from "@/components/f1/F1Loader"
import { MOTOGP_RED, CURRENT_SEASON, MOTOGP_AVAILABLE_SEASONS } from "@/lib/motogp/motogp-constants"
import { getConstructorColor } from "@/components/motogp/MotoGPRiderStandings"

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

// ─── Nation → ISO2 map for flag emojis ───────────────────────────────────────
// MotoGP uses 3-letter nation codes; map to ISO2 for flag emoji

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
    const constructorColor = circuit.winner?.constructorName
        ? getConstructorColor(circuit.winner.constructorName)
        : MOTOGP_RED
    const winnerParts = circuit.winner?.riderName.split(" ") ?? []
    const winnerLast = winnerParts.slice(1).join(" ") || winnerParts[0] || ""

    return (
        <Link href={`/sports/motogp/circuits/${circuit.circuitId}`} style={{ textDecoration: "none" }}>
            <div
                style={{
                    position: "relative",
                    overflow: "hidden",
                    background: circuit.isNext && !circuit.isPast
                        ? `linear-gradient(180deg, ${MOTOGP_RED}14, rgba(0,0,0,0.9))`
                        : "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.9))",
                    border: "1px solid",
                    borderColor: circuit.isNext && !circuit.isPast
                        ? `${MOTOGP_RED}55`
                        : "rgba(255,255,255,0.07)",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(-5px)"
                    el.style.boxShadow = circuit.isNext && !circuit.isPast
                        ? `0 16px 40px ${MOTOGP_RED}30`
                        : "0 12px 32px rgba(0,0,0,0.6)"
                    el.style.borderColor = circuit.isNext && !circuit.isPast
                        ? `${MOTOGP_RED}88`
                        : "rgba(255,255,255,0.15)"
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(0)"
                    el.style.boxShadow = "none"
                    el.style.borderColor = circuit.isNext && !circuit.isPast
                        ? `${MOTOGP_RED}55`
                        : "rgba(255,255,255,0.07)"
                }}
            >
                {/* Top accent bar */}
                <div style={{
                    height: "3px",
                    backgroundColor: circuit.isNext && !circuit.isPast
                        ? MOTOGP_RED
                        : circuit.isPast
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(255,255,255,0.04)",
                }} />

                {/* Flag area */}
                <div style={{
                    position: "relative", height: "110px",
                    backgroundColor: "rgba(255,255,255,0.02)",
                    overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    {/* Giant blurred flag */}
                    <div style={{ fontSize: "90px", opacity: circuit.isPast ? 0.1 : 0.15, filter: "blur(2px)", userSelect: "none" }}>
                        {flag}
                    </div>
                    {/* Gradient */}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.3) 60%, rgba(10,10,10,0.05) 100%)" }} />

                    {/* Round number */}
                    <div style={{ position: "absolute", top: "10px", left: "12px" }}>
                        <span style={{
                            fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600,
                            letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)",
                            backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
                            border: "1px solid rgba(255,255,255,0.1)", padding: "3px 8px",
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
                        {circuit.isPast && circuit.status === "FINISHED" && (
                            <span style={{
                                fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 600,
                                letterSpacing: "0.1em", textTransform: "uppercase",
                                color: "rgba(255,255,255,0.4)", padding: "3px 8px",
                                backgroundColor: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.1)",
                            }}>
                                ✓ DONE
                            </span>
                        )}
                    </div>

                    {/* Nation + flag */}
                    <div style={{ position: "absolute", bottom: "10px", left: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "20px" }}>{flag}</span>
                        <span style={{
                            fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 800,
                            color: circuit.isPast ? "rgba(255,255,255,0.55)" : "#fff",
                        }}>
                            {circuit.nation ?? circuit.place ?? "—"}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: "14px" }}>
                    <p style={{
                        fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700,
                        color: circuit.isPast ? "rgba(255,255,255,0.55)" : "#fff",
                        margin: "0 0 3px", lineHeight: 1.2,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                        {circuit.eventName}
                    </p>
                    <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", margin: "0 0 10px" }}>
                        {circuit.circuitName}
                        {circuit.place ? ` · ${circuit.place}` : ""}
                    </p>

                    {/* Footer */}
                    <div style={{ paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                        {circuit.isPast && circuit.winner ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: "12px" }}>🏆</span>
                                <span style={{
                                    fontFamily: "var(--font-display)", fontSize: "0.78rem", fontWeight: 700,
                                    color: constructorColor,
                                }}>
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
                                color: circuit.isNext && !circuit.isPast ? MOTOGP_RED : "rgba(255,255,255,0.25)",
                                margin: 0, letterSpacing: "0.06em",
                            }}>
                                🗓 {formatDateRange(circuit.dateStart, circuit.dateEnd)}
                                {circuit.isNext && !circuit.isPast && " · Up Next"}
                            </p>
                        )}
                    </div>
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
                                            borderColor: season === s ? MOTOGP_RED : "rgba(255,255,255,0.1)",
                                            backgroundColor: season === s ? MOTOGP_RED : "transparent",
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
                        {filtered.map((c, i) => (
                            <CircuitCard key={c.circuitId} circuit={c} index={circuits.indexOf(c)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}