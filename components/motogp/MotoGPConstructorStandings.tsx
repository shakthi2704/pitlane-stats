"use client"

import { useState } from "react"
import Link from "next/link"
import { getConstructorColor } from "@/components/motogp/MotoGPRiderStandings"
import { getConstructorBike, MOTOGP_BIKE_PLACEHOLDER } from "@/lib/motogp/bike-images"

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Top 3 constructor card ───────────────────────────────────────────────────

const TopConstructorCard = ({
    standing,
    rank,
}: {
    standing: ConstructorStanding
    rank: number
}) => {
    const color = getConstructorColor(standing.constructor.name)
    const heights = ["240px", "210px", "200px"]
    const labels = ["1ST", "2ND", "3RD"]

    return (
        <Link
            href={`/sports/motogp/standings/constructors`}
            style={{ textDecoration: "none", flex: rank === 1 ? "1.2" : "1" }}
        >
            <div
                style={{
                    position: "relative",
                    height: heights[rank - 1],
                    overflow: "hidden",
                    cursor: "pointer",
                    backgroundColor: color,
                    isolation: "isolate",
                    transition: "transform 0.2s, box-shadow 0.2s",
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
                {/* Gradient overlay */}
                <div style={{
                    position: "absolute", inset: 0, zIndex: 1,
                    background: "linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)",
                }} />

                {/* Rank watermark */}
                <div style={{
                    position: "absolute", right: "-0px", bottom: "-20px",
                    fontFamily: "var(--font-display)", fontSize: "12rem",
                    fontWeight: 900, lineHeight: 1,
                    color: "rgba(0,0,0,0.4)", zIndex: 2,
                    userSelect: "none", pointerEvents: "none",
                }}>
                    {rank}
                </div>

                {/* Constructor name — top right */}
                <div style={{
                    position: "absolute", right: "12px", top: "12px",
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2rem, 5vw, 3rem)",
                    fontWeight: 900, lineHeight: 1,
                    color: "rgba(255,255,255,0.20)",
                    zIndex: 2, userSelect: "none",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                }}>
                    {standing.constructor.name}
                </div>

                {/* Bike image */}
                <img
                    src={getConstructorBike(standing.constructor.name)}
                    alt={standing.constructor.name}
                    style={{
                        position: "absolute",
                        right: "40px", bottom: "10px",
                        height: "75%", width: "auto",
                        objectFit: "contain",
                        zIndex: 3,
                        filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.5))",
                        opacity: 0.92,
                    }}
                    onError={e => { (e.target as HTMLImageElement).src = MOTOGP_BIKE_PLACEHOLDER }}
                />

                {/* Content */}
                <div style={{
                    position: "relative", zIndex: 5,
                    padding: "14px 16px", height: "100%",
                    display: "flex", flexDirection: "column",
                    justifyContent: "space-between",
                }}>
                    {/* Top — rank label */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{
                            width: "0px", height: "32px",
                            backgroundColor: "rgba(255,255,255,0.5)",
                        }} />
                        <span style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.75rem", fontWeight: 700,
                            letterSpacing: "0.1em",
                            color: "rgba(255,255,255,0.7)",
                        }}>
                            {labels[rank - 1]}
                        </span>
                    </div>

                    {/* Bottom — name + stats */}
                    <div>
                        <p style={{
                            fontFamily: "var(--font-display)",
                            fontSize: rank === 1 ? "1.8rem" : "1.4rem",
                            fontWeight: 700, color: "#fff",
                            margin: "0 0 6px 0",
                            textTransform: "uppercase",
                        }}>
                            {standing.constructor.name}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <p style={{
                                fontFamily: "var(--font-inter)",
                                fontSize: "1rem", fontWeight: 700, margin: 0,
                            }}>
                                {standing.points}{" "}
                                <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.6)" }}>PTS</span>
                            </p>
                            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                                {standing.wins} {standing.wins === 1 ? "win" : "wins"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────
type Category = "MotoGP" | "Moto2" | "Moto3"

interface Props {
    standings: ConstructorStanding[]
    loading?: boolean
    category: Category
    onCategoryChange: (category: Category) => void
}

const MotoGPConstructorStandings = ({ standings, loading }: Props) => {
    const [showAll, setShowAll] = useState(false)

    const top3 = standings.slice(0, 3)
    const rest = standings.slice(3)
    const visible = showAll ? rest : rest.slice(0, 7)
    const maxPts = standings[0]?.points ?? 1

    return (
        <div className="bg-black p-6 mb-10">
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
                <div style={{ width: "4px", height: "24px", backgroundColor: "var(--accent)", marginRight: "12px" }} />
                <h2 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem", fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color: "#ffffff", margin: 0,
                }}>
                    Constructor Standings
                </h2>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.3)" }}>
                    Loading standings...
                </div>
            ) : standings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.3)" }}>
                    No constructor standings available yet.
                </div>
            ) : (
                <>
                    {/* Top 3 cards — P2 / P1 / P3 */}
                    <div style={{ display: "flex", gap: "8px", marginBottom: "24px", alignItems: "flex-end" }}>
                        {[top3[1], top3[0], top3[2]].map((s, idx) => {
                            if (!s) return null
                            const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3
                            return <TopConstructorCard key={s.constructor.id} standing={s} rank={rank} />
                        })}
                    </div>

                    {/* Table */}
                    <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>

                        {/* Header */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "3rem 1rem 1fr 5rem 4rem",
                            padding: "10px 16px",
                            backgroundColor: "rgba(255,255,255,0.03)",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}>
                            {["POS.", "", "CONSTRUCTOR", "WINS", "PTS"].map(h => (
                                <span key={h} style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "10px", fontWeight: 600,
                                    letterSpacing: "0.15em", textTransform: "uppercase",
                                    color: "rgba(255,255,255,0.4)",
                                }}>
                                    {h}
                                </span>
                            ))}
                        </div>

                        {/* Top 3 rows */}
                        {top3.map(s => {
                            const color = getConstructorColor(s.constructor.name)
                            const pct = (s.points / maxPts) * 100
                            return (
                                <Link
                                    key={s.constructor.id}
                                    href="/sports/motogp/standings/constructors"
                                    style={{ textDecoration: "none", display: "block" }}
                                >
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "3rem 1rem 1fr 5rem 4rem",
                                            alignItems: "center",
                                            padding: "12px 16px",
                                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                                            cursor: "pointer", transition: "background-color 0.15s",
                                        }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.03)"}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
                                    >
                                        <span style={{
                                            fontFamily: "var(--font-display)",
                                            fontSize: "0.9rem", fontWeight: 700, color: "#fff",
                                        }}>
                                            {s.position}
                                        </span>
                                        <div style={{
                                            width: "10px", height: "10px",
                                            borderRadius: "50%", backgroundColor: color,
                                        }} />
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{
                                                fontSize: "0.85rem", fontWeight: 700, color: "#fff",
                                                margin: "0 0 3px 0",
                                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                            }}>
                                                {s.constructor.name}
                                            </p>
                                            <div style={{
                                                height: "2px",
                                                backgroundColor: "rgba(255,255,255,0.05)",
                                                maxWidth: "180px", overflow: "hidden",
                                            }}>
                                                <div style={{ height: "100%", width: `${pct}%`, backgroundColor: color }} />
                                            </div>
                                        </div>
                                        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                                            {s.wins} wins
                                        </span>
                                        <span style={{
                                            fontFamily: "var(--font-inter)",
                                            fontSize: "0.9rem", fontWeight: 700,
                                            color: "#fff", textAlign: "right",
                                        }}>
                                            {s.points}
                                        </span>
                                    </div>
                                </Link>
                            )
                        })}

                        <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />

                        {/* Remaining rows */}
                        {visible.map(s => {
                            const color = getConstructorColor(s.constructor.name)
                            const pct = (s.points / maxPts) * 100
                            return (
                                <Link
                                    key={s.constructor.id}
                                    href="/sports/motogp/standings/constructors"
                                    style={{ textDecoration: "none", display: "block" }}
                                >
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "3rem 1rem 1fr 5rem 4rem",
                                            alignItems: "center",
                                            padding: "12px 16px",
                                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                                            cursor: "pointer", transition: "background-color 0.15s",
                                        }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.03)"}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
                                    >
                                        <span style={{
                                            fontFamily: "var(--font-display)",
                                            fontSize: "0.9rem", fontWeight: 700,
                                            color: "rgba(255,255,255,0.5)",
                                        }}>
                                            {s.position}
                                        </span>
                                        <div style={{
                                            width: "10px", height: "10px",
                                            borderRadius: "50%", backgroundColor: color,
                                        }} />
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{
                                                fontSize: "0.85rem", fontWeight: 700,
                                                color: "rgba(255,255,255,0.5)",
                                                margin: "0 0 3px 0",
                                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                            }}>
                                                {s.constructor.name}
                                            </p>
                                            <div style={{
                                                height: "2px",
                                                backgroundColor: "rgba(255,255,255,0.05)",
                                                maxWidth: "180px", overflow: "hidden",
                                            }}>
                                                <div style={{ height: "100%", width: `${pct}%`, backgroundColor: color }} />
                                            </div>
                                        </div>
                                        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>
                                            {s.wins} wins
                                        </span>
                                        <span style={{
                                            fontFamily: "var(--font-inter)",
                                            fontSize: "0.9rem", fontWeight: 700,
                                            color: "rgba(255,255,255,0.7)",
                                            textAlign: "right",
                                        }}>
                                            {s.points}
                                        </span>
                                    </div>
                                </Link>
                            )
                        })}

                        {/* Show all toggle */}
                        {rest.length > 7 && (
                            <button
                                onClick={() => setShowAll(v => !v)}
                                style={{
                                    width: "100%", padding: "12px",
                                    background: "none", border: "none", cursor: "pointer",
                                    fontFamily: "var(--font-display)",
                                    fontSize: "11px", fontWeight: 600,
                                    letterSpacing: "0.15em", textTransform: "uppercase",
                                    color: "rgba(255,255,255,0.3)",
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", gap: "6px",
                                    transition: "color 0.2s",
                                }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#fff"}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"}
                            >
                                {showAll ? "Show less ↑" : `Show all ${standings.length} constructors ↓`}
                            </button>
                        )}
                    </div>

                    {/* View full standings */}
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                        <Link
                            href="/sports/motogp/standings/constructors"
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "12px", fontWeight: 600,
                                letterSpacing: "0.15em", textTransform: "uppercase",
                                color: "#fff", textDecoration: "none",
                                padding: "12px 32px",
                                border: "1px solid rgba(255,255,255,0.2)",
                                transition: "all 0.2s", display: "inline-block",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)"
                                    ; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.4)"
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
                                    ; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)"
                            }}
                        >
                            View Full Standings
                        </Link>
                    </div>
                </>
            )}
        </div>
    )
}

export default MotoGPConstructorStandings