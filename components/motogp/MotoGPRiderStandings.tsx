"use client"

import { useState } from "react"
import Link from "next/link"
import { MOTOGP_RED } from "@/lib/motogp/motogp-constants"

// ─── Constructor colors ───────────────────────────────────────────────────────

const CONSTRUCTOR_COLORS: Record<string, string> = {
    Ducati: "#CC0000",
    Honda: "#E4001B",
    Yamaha: "#003CB4",
    KTM: "#FF6600",
    Aprilia: "#008F39",
    Suzuki: "#1B4FBF",
    Kalex: "#2A2A6E",
    Triumph: "#005A9C",
    CFMoto: "#0057A8",
}

export function getConstructorColor(name: string): string {
    return CONSTRUCTOR_COLORS[name] ?? "#444444"
}

// ─── Rider photo URL from uuid ────────────────────────────────────────────────

export function getRiderPhotoUrl(uuid: string, year: number | string = new Date().getFullYear()): string {
    if (!uuid) return "/F1/drivers/placeholder.svg"
    return `https://photos.motogp.com/riders/${uuid[0]}/${uuid[1]}/${uuid}/${year}/profile/main.png`
}

// ─── Flag emoji helper ────────────────────────────────────────────────────────

function getFlagEmoji(iso: string): string {
    if (!iso || iso.length !== 2) return ""
    return iso.toUpperCase().replace(/./g, c =>
        String.fromCodePoint(c.charCodeAt(0) + 127397)
    )
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Rider {
    id: string
    fullName: string
    nationality?: string | null
    number?: number | null
    photoUrl?: string | null
}

interface RiderStanding {
    position: number
    points: number
    raceWins: number
    podiums: number
    sprintWins: number
    teamName?: string | null
    constructorName?: string | null
    rider: Rider
}

// ─── Top 3 podium card ────────────────────────────────────────────────────────

const TopRiderCard = ({ standing, rank }: { standing: RiderStanding; rank: number }) => {
    const color = getConstructorColor(standing.constructorName ?? "")
    // const photoUrl = getRiderPhotoUrl(standing.rider.id)
    const photoUrl = standing.rider.photoUrl ?? "/F1/drivers/placeholder.svg"
    const nameParts = standing.rider.fullName.split(" ")
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(" ")
    const heights = ["240px", "210px", "200px"]
    const labels = ["1ST", "2ND", "3RD"]

    return (
        <Link
            href={`/sports/motogp/riders/${standing.rider.id}`}
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
                    background: "linear-gradient(120deg, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.2) 90%, transparent 100%)",
                }} />

                {/* Rank watermark */}
                <div style={{
                    position: "absolute", right: "-10px", bottom: "-20px",
                    fontFamily: "var(--font-display)", fontSize: "12rem",
                    fontWeight: 900, lineHeight: 1,
                    color: "rgba(0,0,0,0.25)", zIndex: 3,
                    userSelect: "none", pointerEvents: "none",
                }}>
                    {rank}
                </div>

                {/* Rider photo */}
                <img
                    src={photoUrl}
                    alt={standing.rider.fullName}
                    style={{
                        position: "absolute", right: 0, bottom: 0,
                        height: "100%", width: "auto",
                        objectFit: "contain", objectPosition: "bottom right",
                        zIndex: 2,
                    }}
                    onError={e => {
                        (e.target as HTMLImageElement).src = "/F1/drivers/placeholder.svg"
                    }}
                />

                {/* Content */}
                <div style={{
                    position: "relative", zIndex: 5,
                    padding: "14px 16px", height: "100%",
                    display: "flex", flexDirection: "column",
                    justifyContent: "space-between",
                }}>
                    {/* Constructor + number */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "11px", fontWeight: 700,
                            letterSpacing: "0.1em",
                            color: "rgba(255,255,255,0.9)",
                            backgroundColor: "rgba(0,0,0,0.4)",
                            padding: "3px 8px",
                        }}>
                            {standing.constructorName ?? "—"}
                        </span>
                        {standing.rider.number && (
                            <span style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "11px", color: "rgba(255,255,255,0.5)",
                            }}>
                                #{standing.rider.number}
                            </span>
                        )}
                    </div>

                    {/* Rider info */}
                    <div>
                        <span style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.75rem", fontWeight: 700,
                            letterSpacing: "0.1em",
                            color: "rgba(255,255,255,0.7)",
                        }}>
                            {labels[rank - 1]}
                        </span>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                            <span style={{ fontSize: "18px" }}>
                                {getFlagEmoji(standing.rider.nationality ?? "")}
                            </span>
                            <p style={{
                                fontSize: "1rem",
                                color: "rgba(255,255,255,0.65)",
                                margin: 0,
                                fontFamily: "var(--font-display)",
                            }}>
                                {firstName}
                            </p>
                        </div>

                        <p style={{
                            fontFamily: "var(--font-display)",
                            fontSize: rank === 1 ? "1.8rem" : "1.4rem",
                            fontWeight: 700, color: "#fff", margin: 0,
                        }}>
                            {lastName.toUpperCase()}
                        </p>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px" }}>
                            <p style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "1rem", fontWeight: 700, margin: 0,
                            }}>
                                {standing.points}{" "}
                                <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.6)" }}>PTS</span>
                            </p>
                            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                                {standing.raceWins}W · {standing.podiums}P
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

// ─── Main standings section ───────────────────────────────────────────────────

type Category = "MotoGP" | "Moto2" | "Moto3"

interface Props {
    standings: RiderStanding[]
    category: Category
    onCategoryChange: (cat: Category) => void
    loading?: boolean
}

const MotoGPRiderStandings = ({ standings, category, onCategoryChange, loading }: Props) => {
    const [showAll, setShowAll] = useState(false)
    const CATEGORIES: Category[] = ["MotoGP", "Moto2", "Moto3"]

    const top3 = standings.slice(0, 3)
    const rest = standings.slice(3)
    const visible = showAll ? rest : rest.slice(0, 7)
    const maxPts = standings[0]?.points ?? 1

    return (
        <div style={{ marginBottom: "48px" }}>

            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "4px", height: "24px", backgroundColor: MOTOGP_RED }} />
                    <h2 style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.1rem", fontWeight: 700,
                        letterSpacing: "0.08em", textTransform: "uppercase",
                        color: "#ffffff", margin: 0,
                    }}>
                        Rider Standings
                    </h2>
                </div>

                {/* Category tabs */}
                <div style={{ display: "flex", gap: "4px" }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => onCategoryChange(cat)}
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "11px", fontWeight: 600,
                                letterSpacing: "0.1em", textTransform: "uppercase",
                                padding: "6px 14px", border: "none", cursor: "pointer",
                                transition: "all 0.15s",
                                backgroundColor: category === cat ? 'var(--accent)' : "rgba(255,255,255,0.06)",
                                color: category === cat ? "#fff" : "rgba(255,255,255,0.4)",
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.3)" }}>
                    Loading standings...
                </div>
            ) : (
                <>
                    {/* Top 3 podium cards — P2 / P1 / P3 order */}
                    <div style={{ display: "flex", gap: "8px", marginBottom: "24px", alignItems: "flex-end" }}>
                        {[top3[1], top3[0], top3[2]].map((s, idx) => {
                            if (!s) return null
                            const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3
                            return <TopRiderCard key={s.rider.id} standing={s} rank={rank} />
                        })}
                    </div>

                    {/* Standings table */}
                    <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>

                        {/* Table header */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "3rem 1.5rem 1fr 5rem 5rem 4rem",
                            padding: "10px 16px",
                            backgroundColor: "rgba(255,255,255,0.03)",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}>
                            {["POS.", "", "RIDER", "WINS", "PODIUMS", "PTS"].map(h => (
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
                        {top3.map((s, i) => {
                            const color = getConstructorColor(s.constructorName ?? "")
                            const pct = (s.points / maxPts) * 100
                            return (
                                <Link
                                    key={s.rider.id}
                                    href={`/sports/motogp/riders/${s.rider.id}`}
                                    style={{ textDecoration: "none", display: "block" }}
                                >
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "3rem 1.5rem 1fr 5rem 5rem 4rem",
                                            alignItems: "center",
                                            padding: "12px 16px",
                                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                                            cursor: "pointer",
                                            transition: "background-color 0.15s",
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
                                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                                            <span style={{
                                                fontSize: "0.85rem", fontWeight: 700,
                                                color: "#fff", whiteSpace: "nowrap",
                                                overflow: "hidden", textOverflow: "ellipsis",
                                            }}>
                                                {s.rider.fullName}
                                            </span>
                                            <div style={{
                                                height: "2px", marginTop: "4px",
                                                backgroundColor: "rgba(255,255,255,0.05)",
                                                maxWidth: "160px", overflow: "hidden",
                                            }}>
                                                <div style={{ height: "100%", width: `${pct}%`, backgroundColor: color }} />
                                            </div>
                                        </div>
                                        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                                            {s.raceWins}
                                        </span>
                                        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                                            {s.podiums}
                                        </span>
                                        <span style={{
                                            fontFamily: "var(--font-display)",
                                            fontSize: "0.9rem", fontWeight: 700,
                                            color: "#fff", textAlign: "right",
                                        }}>
                                            {s.points}
                                        </span>
                                    </div>
                                </Link>
                            )
                        })}

                        {/* Divider */}
                        <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />

                        {/* Remaining rows */}
                        {visible.map((s, i) => {
                            const color = getConstructorColor(s.constructorName ?? "")
                            const pct = (s.points / maxPts) * 100
                            return (
                                <Link
                                    key={s.rider.id}
                                    href={`/sports/motogp/riders/${s.rider.id}`}
                                    style={{ textDecoration: "none", display: "block" }}
                                >
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "3rem 1.5rem 1fr 5rem 5rem 4rem",
                                            alignItems: "center",
                                            padding: "12px 16px",
                                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                                            cursor: "pointer",
                                            transition: "background-color 0.15s",
                                        }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.03)"}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
                                    >
                                        <span style={{
                                            fontFamily: "var(--font-display)",
                                            fontSize: "0.9rem", fontWeight: 700,
                                            color: "rgba(255,255,255,0.4)",
                                        }}>
                                            {s.position}
                                        </span>
                                        <div style={{
                                            width: "10px", height: "10px",
                                            borderRadius: "50%", backgroundColor: color,
                                        }} />
                                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                                            <span style={{
                                                fontSize: "0.85rem", fontWeight: 700,
                                                color: "rgba(255,255,255,0.7)",
                                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                            }}>
                                                {s.rider.fullName}
                                            </span>
                                            <div style={{
                                                height: "2px", marginTop: "4px",
                                                backgroundColor: "rgba(255,255,255,0.05)",
                                                maxWidth: "160px", overflow: "hidden",
                                            }}>
                                                <div style={{ height: "100%", width: `${pct}%`, backgroundColor: color }} />
                                            </div>
                                        </div>
                                        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>
                                            {s.raceWins}
                                        </span>
                                        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>
                                            {s.podiums}
                                        </span>
                                        <span style={{
                                            fontFamily: "var(--font-display)",
                                            fontSize: "0.9rem", fontWeight: 700,
                                            color: "rgba(255,255,255,0.7)", textAlign: "right",
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
                                {showAll ? "Show less ↑" : `Show all ${standings.length} riders ↓`}
                            </button>
                        )}
                    </div>

                    {/* View full standings link */}
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                        <Link
                            href="/sports/motogp/standings/riders"
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

export default MotoGPRiderStandings