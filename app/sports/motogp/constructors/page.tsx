"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import F1Loader from "@/components/f1/F1Loader"
import { MOTOGP_RED, MOTOGP_AVAILABLE_SEASONS, CURRENT_SEASON } from "@/lib/motogp/motogp-constants"
import { getConstructorColor } from "@/components/motogp/MotoGPRiderStandings"

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "MotoGP" | "Moto2" | "Moto3"

interface Constructor {
    id: string
    name: string
}

interface ConstructorStanding {
    position: number
    points: number
    wins: number
    constructor: Constructor
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = ["MotoGP", "Moto2", "Moto3"]
const MEDAL_COLORS = ["#F5C842", "#C0C0C0", "#CD7F32"]

// Known constructors with extra context
const CONSTRUCTOR_ORIGINS: Record<string, string> = {
    Ducati: "🇮🇹 Italy",
    Honda: "🇯🇵 Japan",
    Yamaha: "🇯🇵 Japan",
    KTM: "🇦🇹 Austria",
    Aprilia: "🇮🇹 Italy",
    Suzuki: "🇯🇵 Japan",
    Kalex: "🇩🇪 Germany",
    Triumph: "🇬🇧 United Kingdom",
    CFMoto: "🇨🇳 China",
}

// ─── Leader Banner ────────────────────────────────────────────────────────────

const LeaderBanner = ({ standing, season, category }: {
    standing: ConstructorStanding
    season: string
    category: Category
}) => {
    const color = getConstructorColor(standing.constructor.name)
    const origin = CONSTRUCTOR_ORIGINS[standing.constructor.name]

    return (
        <div style={{
            position: "relative",
            overflow: "hidden",
            marginBottom: "32px",
            backgroundColor: `${color}14`,
            border: `1px solid ${color}44`,
            borderLeft: `4px solid ${color}`,
            padding: "24px",
        }}>
            {/* Large constructor name watermark */}
            <div style={{
                position: "absolute", right: "-10px", top: "50%",
                transform: "translateY(-50%)",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(4rem, 12vw, 8rem)",
                fontWeight: 900, color: "rgba(255,255,255,0.03)",
                userSelect: "none", pointerEvents: "none",
                textTransform: "uppercase", whiteSpace: "nowrap",
                letterSpacing: "-0.02em",
            }}>
                {standing.constructor.name}
            </div>

            <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
                {/* Color slab */}
                <div style={{
                    width: "72px", height: "72px", flexShrink: 0,
                    backgroundColor: color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <span style={{
                        fontFamily: "var(--font-display)", fontSize: "1.8rem",
                        fontWeight: 900, color: "rgba(255,255,255,0.9)",
                        textTransform: "uppercase", letterSpacing: "-0.03em",
                    }}>
                        {standing.constructor.name.slice(0, 2).toUpperCase()}
                    </span>
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                    <p style={{
                        fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600,
                        letterSpacing: "0.2em", textTransform: "uppercase",
                        color: color, margin: "0 0 4px",
                    }}>
                        🏆 {season} {category}™ Constructor Leader
                    </p>
                    <p style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                        fontWeight: 900, color: "#fff",
                        margin: "0 0 4px", letterSpacing: "-0.02em", textTransform: "uppercase",
                    }}>
                        {standing.constructor.name}
                    </p>
                    {origin && (
                        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
                            {origin}
                        </p>
                    )}
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                    {[
                        { label: "Points", value: standing.points, accent: color },
                        { label: "Wins", value: standing.wins, accent: "rgba(255,255,255,0.8)" },
                    ].map(stat => (
                        <div key={stat.label} style={{ textAlign: "right" }}>
                            <p style={{
                                fontFamily: "var(--font-display)", fontSize: "2.4rem", fontWeight: 700,
                                color: stat.accent, margin: 0, lineHeight: 1,
                            }}>
                                {stat.value}
                            </p>
                            <p style={{
                                fontSize: "9px", fontFamily: "var(--font-display)",
                                color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em",
                                textTransform: "uppercase", margin: "3px 0 0",
                            }}>
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─── Table Row ────────────────────────────────────────────────────────────────

const ConstructorRow = ({ s, i, maxPts, leaderPts }: {
    s: ConstructorStanding
    i: number
    maxPts: number
    leaderPts: number
}) => {
    const color = getConstructorColor(s.constructor.name)
    const pct = maxPts > 0 ? (s.points / maxPts) * 100 : 0
    const gap = i === 0 ? "—" : `−${(leaderPts - s.points).toFixed(0)}`
    const isTop3 = i < 3
    const origin = CONSTRUCTOR_ORIGINS[s.constructor.name]

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "3rem 3.5rem 1fr 6rem 5rem 5rem",
                alignItems: "center",
                padding: "14px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                borderLeft: `3px solid ${isTop3 ? color : "transparent"}`,
                backgroundColor: isTop3 ? `${color}08` : "transparent",
                transition: "background-color 0.15s",
                gap: "8px",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = isTop3 ? `${color}08` : "transparent"}
        >
            {/* Position */}
            <span style={{
                fontFamily: "var(--font-display)",
                fontSize: isTop3 ? "1.2rem" : "1rem",
                fontWeight: 900,
                color: isTop3 ? MEDAL_COLORS[i] : "rgba(255,255,255,0.3)",
            }}>
                {s.position}
            </span>

            {/* Color slab */}
            <div style={{
                width: "44px", height: "44px",
                backgroundColor: color,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
            }}>
                <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.75rem", fontWeight: 900,
                    color: "rgba(255,255,255,0.9)",
                    textTransform: "uppercase",
                    letterSpacing: "-0.02em",
                }}>
                    {s.constructor.name.slice(0, 3).toUpperCase()}
                </span>
            </div>

            {/* Name + origin + bar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.95rem", fontWeight: 800,
                    color: isTop3 ? "#ffffff" : "rgba(255,255,255,0.8)",
                    textTransform: "uppercase", letterSpacing: "0.02em",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                    {s.constructor.name}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {origin && (
                        <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>
                            {origin}
                        </span>
                    )}
                    {/* Points bar */}
                    <div style={{
                        flex: 1, height: "2px", maxWidth: "120px",
                        backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden",
                    }}>
                        <div style={{
                            height: "100%", width: `${pct}%`,
                            backgroundColor: color, transition: "width 0.6s ease",
                        }} />
                    </div>
                    <span style={{
                        fontSize: "0.65rem", color: "rgba(255,255,255,0.2)",
                        fontFamily: "var(--font-display)", whiteSpace: "nowrap",
                    }}>
                        {pct.toFixed(0)}%
                    </span>
                </div>
            </div>

            {/* Wins */}
            <span style={{
                fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700,
                color: s.wins > 0 ? "#ffffff" : "rgba(255,255,255,0.2)",
                textAlign: "center",
            }}>
                {s.wins || "—"}
            </span>

            {/* Gap */}
            <span style={{
                fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 600,
                color: i === 0 ? color : "rgba(255,255,255,0.4)",
                textAlign: "right",
            }}>
                {gap}
            </span>

            {/* Points */}
            <div style={{ textAlign: "right" }}>
                <span style={{
                    fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 900,
                    color: isTop3 ? "#ffffff" : "rgba(255,255,255,0.7)",
                }}>
                    {s.points}
                </span>
                <span style={{
                    fontFamily: "var(--font-display)", fontSize: "9px",
                    color: "rgba(255,255,255,0.3)", marginLeft: "3px",
                }}>
                    PTS
                </span>
            </div>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MotoGPConstructorStandingsPage() {
    const [season, setSeason] = useState(CURRENT_SEASON)
    const [category, setCategory] = useState<Category>("MotoGP")
    const [standings, setStandings] = useState<ConstructorStanding[]>([])
    const [loading, setLoading] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setLoading(true)
        fetch(`/api/motogp/constructor-standings?year=${season}&category=${category}`)
            .then(r => r.json())
            .then(data => setStandings(data.standings ?? []))
            .catch(err => console.error("[MotoGP] constructor standings:", err))
            .finally(() => setLoading(false))
    }, [season, category])

    const leader = standings[0]
    const leaderPts = leader?.points ?? 0
    const maxPts = leaderPts || 1

    const scrollLeft = () => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })
    const scrollRight = () => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })

    return (
        <div>
            {/* Page header */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "48px 0 36px" }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                        <div>
                            <p style={{
                                fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600,
                                letterSpacing: "0.2em", textTransform: "uppercase",
                                color: MOTOGP_RED, marginBottom: "8px",
                            }}>
                                MotoGP™ World Championship
                            </p>
                            <h1 style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "clamp(2rem, 5vw, 4rem)",
                                fontWeight: 800, color: "#ffffff",
                                margin: "0 0 8px", lineHeight: 0.95, letterSpacing: "-0.03em",
                            }}>
                                CONSTRUCTOR STANDINGS
                            </h1>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", margin: 0 }}>
                                {season} Season · {standings.length} constructors
                            </p>
                        </div>

                        {/* Season selector */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button onClick={scrollLeft} style={{ cursor: "pointer", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white" }}>◀</button>
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
                                            borderColor: season === s ? MOTOGP_RED : "rgba(255,255,255,0.1)",
                                            backgroundColor: season === s ? MOTOGP_RED : "transparent",
                                            color: season === s ? "#ffffff" : "rgba(255,255,255,0.4)",
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <button onClick={scrollRight} style={{ cursor: "pointer", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white" }}>▶</button>
                        </div>
                    </div>

                    {/* Class + sibling tabs */}
                    <div style={{ display: "flex", gap: "0", marginTop: "28px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                style={{
                                    fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 600,
                                    letterSpacing: "0.12em", textTransform: "uppercase",
                                    padding: "10px 20px", background: "none", border: "none", cursor: "pointer",
                                    transition: "color 0.2s", marginBottom: "-1px",
                                    color: category === cat ? "#ffffff" : "rgba(255,255,255,0.3)",
                                    borderBottom: category === cat ? `2px solid ${MOTOGP_RED}` : "2px solid transparent",
                                }}
                            >
                                {cat}™
                            </button>
                        ))}
                        <Link
                            href="/sports/motogp/standings/riders"
                            style={{
                                marginLeft: "auto",
                                fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600,
                                letterSpacing: "0.1em", textTransform: "uppercase",
                                padding: "10px 16px", textDecoration: "none",
                                color: "rgba(255,255,255,0.3)",
                                borderBottom: "2px solid transparent",
                                transition: "color 0.2s",
                                display: "flex", alignItems: "center",
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#fff"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"}
                        >
                            ← Riders
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
                {loading ? (
                    <F1Loader message="LOADING STANDINGS..." />
                ) : standings.length === 0 ? (
                    <div style={{ padding: "80px", textAlign: "center" }}>
                        <p style={{
                            fontFamily: "var(--font-display)", fontSize: "11px",
                            color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em",
                        }}>
                            NO DATA AVAILABLE FOR {season} {category}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Leader banner */}
                        {leader && <LeaderBanner standing={leader} season={season} category={category} />}

                        {/* Top 3 cards — P2 / P1 / P3 podium order */}
                        {standings.length >= 2 && (
                            <div style={{
                                display: "flex", gap: "8px",
                                marginBottom: "32px", alignItems: "flex-end",
                            }}>
                                {([
                                    { s: standings[1], rank: 2, h: "220px" },
                                    { s: standings[0], rank: 1, h: "260px" },
                                    { s: standings[2], rank: 3, h: "200px" },
                                ] as const).filter(x => x.s).map(({ s, rank, h }) => {
                                    const color = getConstructorColor(s.constructor.name)
                                    return (
                                        <div
                                            key={s.constructor.id}
                                            style={{
                                                flex: rank === 1 ? "1.2" : "1",
                                                height: h, position: "relative",
                                                overflow: "hidden", backgroundColor: color,
                                                border: `1px solid ${color}66`,
                                                transition: "transform 0.2s, box-shadow 0.2s",
                                                cursor: "default",
                                            }}
                                            onMouseEnter={e => {
                                                const el = e.currentTarget as HTMLElement
                                                el.style.transform = "translateY(-4px)"
                                                el.style.boxShadow = `0 16px 40px ${color}50`
                                            }}
                                            onMouseLeave={e => {
                                                const el = e.currentTarget as HTMLElement
                                                el.style.transform = "translateY(0)"
                                                el.style.boxShadow = "none"
                                            }}
                                        >
                                            {/* Gradient */}
                                            <div style={{
                                                position: "absolute", inset: 0,
                                                background: "linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 100%)",
                                            }} />

                                            {/* Constructor name watermark */}
                                            <div style={{
                                                position: "absolute", right: "-8px", bottom: "-16px",
                                                fontFamily: "var(--font-display)",
                                                fontSize: "clamp(3rem, 10vw, 7rem)",
                                                fontWeight: 900, color: "rgba(0,0,0,0.25)",
                                                userSelect: "none", pointerEvents: "none",
                                                textTransform: "uppercase", letterSpacing: "-0.03em",
                                            }}>
                                                {s.constructor.name}
                                            </div>

                                            {/* Content */}
                                            <div style={{
                                                position: "relative", zIndex: 2,
                                                padding: "16px", height: "100%",
                                                display: "flex", flexDirection: "column",
                                                justifyContent: "space-between",
                                            }}>
                                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                                    <span style={{
                                                        fontFamily: "var(--font-display)", fontSize: "0.75rem",
                                                        fontWeight: 700, letterSpacing: "0.1em",
                                                        color: "rgba(255,255,255,0.7)",
                                                    }}>
                                                        {["1ST", "2ND", "3RD"][rank - 1]}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p style={{
                                                        fontFamily: "var(--font-display)",
                                                        fontSize: rank === 1 ? "1.8rem" : "1.3rem",
                                                        fontWeight: 900, color: "#fff",
                                                        margin: "0 0 6px",
                                                        textTransform: "uppercase", lineHeight: 1,
                                                    }}>
                                                        {s.constructor.name}
                                                    </p>
                                                    <div style={{ display: "flex", gap: "14px", alignItems: "baseline" }}>
                                                        <span style={{
                                                            fontFamily: "var(--font-display)",
                                                            fontSize: "1.1rem", fontWeight: 700,
                                                        }}>
                                                            {s.points}
                                                            <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.6)", marginLeft: "3px" }}>PTS</span>
                                                        </span>
                                                        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
                                                            {s.wins} {s.wins === 1 ? "win" : "wins"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Full table */}
                        <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                            {/* Header */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "3rem 3.5rem 1fr 6rem 5rem 5rem",
                                padding: "10px 16px",
                                backgroundColor: "rgba(255,255,255,0.03)",
                                borderBottom: "1px solid rgba(255,255,255,0.06)",
                                gap: "8px",
                            }}>
                                {["POS", "", "CONSTRUCTOR", "WINS", "GAP", "PTS"].map((h, i) => (
                                    <span key={i} style={{
                                        fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 600,
                                        letterSpacing: "0.15em", textTransform: "uppercase",
                                        color: "rgba(255,255,255,0.25)",
                                        textAlign: i >= 3 ? "right" : undefined,
                                    }}>
                                        {h}
                                    </span>
                                ))}
                            </div>

                            {standings.map((s, i) => (
                                <ConstructorRow
                                    key={s.constructor.id}
                                    s={s}
                                    i={i}
                                    maxPts={maxPts}
                                    leaderPts={leaderPts}
                                />
                            ))}
                        </div>

                        {/* Footer note */}
                        <p style={{
                            fontSize: "0.72rem", color: "rgba(255,255,255,0.2)",
                            textAlign: "center", marginTop: "20px",
                            fontFamily: "var(--font-display)", letterSpacing: "0.08em",
                        }}>
                            {category}™ · {season} FIM World Championship · Constructor standings
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}