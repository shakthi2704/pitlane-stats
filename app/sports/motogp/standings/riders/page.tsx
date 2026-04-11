"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import F1Loader from "@/components/f1/F1Loader"
import { MOTOGP_RED, MOTOGP_AVAILABLE_SEASONS, CURRENT_SEASON } from "@/lib/motogp/motogp-constants"
import { getConstructorColor } from "@/components/motogp/MotoGPRiderStandings"

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "MotoGP" | "Moto2" | "Moto3"

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
    sprintPodiums: number
    teamName?: string | null
    constructorName?: string | null
    rider: Rider
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFlagEmoji(iso: string): string {
    if (!iso || iso.length !== 2) return ""
    return iso.toUpperCase().replace(/./g, c =>
        String.fromCodePoint(c.charCodeAt(0) + 127397)
    )
}

const FALLBACK_PHOTO = "/F1/drivers/placeholder.svg"

const MEDAL_COLORS = ["#F5C842", "#C0C0C0", "#CD7F32"]

const CATEGORIES: Category[] = ["MotoGP", "Moto2", "Moto3"]

// ─── Champion Banner ──────────────────────────────────────────────────────────

const ChampionBanner = ({ standing, season }: { standing: RiderStanding; season: string }) => {
    const color = getConstructorColor(standing.constructorName ?? "")
    const nameParts = standing.rider.fullName.split(" ")
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(" ")
    const photoUrl = standing.rider.photoUrl ?? FALLBACK_PHOTO

    return (
        <div style={{
            position: "relative",
            overflow: "hidden",
            marginBottom: "32px",
            backgroundColor: `${color}14`,
            border: `1px solid ${color}44`,
            borderLeft: `4px solid ${color}`,
        }}>
            {/* Subtle bg photo */}
            <div style={{
                position: "absolute", right: 0, top: 0, bottom: 0,
                width: "260px", overflow: "hidden", pointerEvents: "none",
            }}>
                <img
                    src={photoUrl}
                    alt={standing.rider.fullName}
                    style={{
                        position: "absolute", right: "-10px", bottom: 0,
                        height: "120%", width: "auto",
                        objectFit: "contain", objectPosition: "bottom right",
                        opacity: 0.15, filter: "grayscale(30%)",
                    }}
                    onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                />
                <div style={{
                    position: "absolute", inset: 0,
                    background: `linear-gradient(90deg, ${color}14 0%, transparent 100%)`,
                }} />
            </div>

            <div style={{ position: "relative", zIndex: 1, padding: "20px 24px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                {/* Photo */}
                <div style={{
                    width: "64px", height: "64px", overflow: "hidden", flexShrink: 0,
                    backgroundColor: `${color}30`, border: `2px solid ${color}66`,
                }}>
                    <img
                        src={photoUrl}
                        alt={standing.rider.fullName}
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                        onError={e => { (e.target as HTMLImageElement).src = FALLBACK_PHOTO }}
                    />
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                    <p style={{
                        fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600,
                        letterSpacing: "0.2em", textTransform: "uppercase",
                        color: color, margin: "0 0 4px",
                    }}>
                        🏆 {season} Championship Leader
                    </p>
                    <p style={{
                        fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800,
                        color: "#fff", margin: "0 0 2px", letterSpacing: "-0.01em",
                    }}>
                        {firstName} <span style={{ color }}>{lastName.toUpperCase()}</span>
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", margin: 0 }}>
                        {getFlagEmoji(standing.rider.nationality ?? "")} {standing.rider.nationality}
                        {standing.constructorName ? ` · ${standing.constructorName}` : ""}
                        {standing.teamName ? ` · ${standing.teamName}` : ""}
                    </p>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                    {[
                        { label: "Points", value: standing.points, color: color },
                        { label: "Wins", value: standing.raceWins, color: "rgba(255,255,255,0.8)" },
                        { label: "Podiums", value: standing.podiums, color: "rgba(255,255,255,0.6)" },
                    ].map(stat => (
                        <div key={stat.label} style={{ textAlign: "right" }}>
                            <p style={{
                                fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700,
                                color: stat.color, margin: 0, lineHeight: 1,
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

const StandingRow = ({ s, i, maxPts, leaderPts, showSprint }: {
    s: RiderStanding
    i: number
    maxPts: number
    leaderPts: number
    showSprint: boolean
}) => {
    const color = getConstructorColor(s.constructorName ?? "")
    const pct = maxPts > 0 ? (s.points / maxPts) * 100 : 0
    const gap = i === 0 ? "—" : `−${(leaderPts - s.points).toFixed(0)}`
    const isTop3 = i < 3
    const nameParts = s.rider.fullName.split(" ")
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(" ") || nameParts[0]
    const photoUrl = s.rider.photoUrl ?? FALLBACK_PHOTO
    const flag = getFlagEmoji(s.rider.nationality ?? "")

    const cols = showSprint
        ? "3rem 2.5rem 2.5rem 1fr 5rem 4rem 4rem 4rem 5rem"
        : "3rem 2.5rem 2.5rem 1fr 5rem 4rem 4rem 5rem"

    return (
        <Link href={`/sports/motogp/riders/${s.rider.id}`} style={{ textDecoration: "none", display: "block" }}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: cols,
                    alignItems: "center",
                    padding: "10px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    borderLeft: `3px solid ${isTop3 ? color : "transparent"}`,
                    backgroundColor: isTop3 ? `${color}08` : "transparent",
                    cursor: "pointer",
                    transition: "background-color 0.15s",
                    gap: "4px",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = isTop3 ? `${color}08` : "transparent"}
            >
                {/* Position */}
                <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: isTop3 ? "1.1rem" : "0.95rem",
                    fontWeight: 800,
                    color: isTop3 ? MEDAL_COLORS[i] : "rgba(255,255,255,0.35)",
                }}>
                    {s.position}
                </span>

                {/* Number */}
                <span style={{
                    fontFamily: "var(--font-display)", fontSize: "0.8rem", fontWeight: 700, color: color,
                }}>
                    {s.rider.number != null ? `#${s.rider.number}` : "—"}
                </span>

                {/* Photo */}
                <div style={{
                    width: "32px", height: "32px", overflow: "hidden",
                    backgroundColor: `${color}20`, border: `1px solid ${color}40`, flexShrink: 0,
                }}>
                    <img
                        src={photoUrl}
                        alt={s.rider.fullName}
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                        onError={e => { (e.target as HTMLImageElement).src = FALLBACK_PHOTO }}
                    />
                </div>

                {/* Name + team + bar */}
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "13px" }}>{flag}</span>
                        <span style={{
                            fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700,
                            color: isTop3 ? "#ffffff" : "rgba(255,255,255,0.8)",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                            {firstName[0]}. {lastName.toUpperCase()}
                        </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                            fontSize: "0.68rem", color: "rgba(255,255,255,0.3)",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                            {s.constructorName}
                        </span>
                        {/* Points bar */}
                        <div style={{
                            flex: 1, height: "2px", maxWidth: "100px",
                            backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden",
                        }}>
                            <div style={{
                                height: "100%", width: `${pct}%`,
                                backgroundColor: color, transition: "width 0.6s ease",
                            }} />
                        </div>
                    </div>
                </div>

                {/* Team */}
                <span style={{
                    fontSize: "0.72rem", color: "rgba(255,255,255,0.3)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                    {s.teamName ?? "—"}
                </span>

                {/* Wins */}
                <span style={{
                    fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700,
                    color: s.raceWins > 0 ? "#ffffff" : "rgba(255,255,255,0.2)",
                    textAlign: "center",
                }}>
                    {s.raceWins || "—"}
                </span>

                {/* Podiums */}
                <span style={{
                    fontFamily: "var(--font-display)", fontSize: "0.85rem",
                    color: s.podiums > 0 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)",
                    textAlign: "center",
                }}>
                    {s.podiums || "—"}
                </span>

                {/* Sprint wins — conditional column */}
                {showSprint && (
                    <span style={{
                        fontFamily: "var(--font-display)", fontSize: "0.8rem",
                        color: s.sprintWins > 0 ? MOTOGP_RED : "rgba(255,255,255,0.15)",
                        textAlign: "center",
                    }}>
                        {s.sprintWins || "—"}
                    </span>
                )}

                {/* Gap */}
                <div style={{ textAlign: "right" }}>
                    <span style={{
                        fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700,
                        color: i === 0 ? color : "rgba(255,255,255,0.5)",
                    }}>
                        {gap}
                    </span>
                    <div style={{ marginTop: "3px" }}>
                        <span style={{
                            fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 800,
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
            </div>
        </Link>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MotoGPRiderStandingsPage() {
    const [season, setSeason] = useState(CURRENT_SEASON)
    const [category, setCategory] = useState<Category>("MotoGP")
    const [standings, setStandings] = useState<RiderStanding[]>([])
    const [loading, setLoading] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setLoading(true)
        fetch(`/api/motogp/rider-standings?year=${season}&category=${category}&limit=50`)
            .then(r => r.json())
            .then(data => setStandings(data.standings ?? []))
            .catch(err => console.error("[MotoGP] rider standings:", err))
            .finally(() => setLoading(false))
    }, [season, category])

    const leader = standings[0]
    const maxPts = leader?.points ?? 1
    const leaderPts = leader?.points ?? 0

    // Show sprint column for MotoGP (sprint races started 2023)
    const showSprint = category === "MotoGP" && parseInt(season) >= 2023
    const hasSprints = showSprint && standings.some(s => s.sprintWins > 0)

    const headerCols = showSprint
        ? "3rem 2.5rem 2.5rem 1fr 5rem 4rem 4rem 4rem 5rem"
        : "3rem 2.5rem 2.5rem 1fr 5rem 4rem 4rem 5rem"

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
                                RIDER STANDINGS
                            </h1>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", margin: 0 }}>
                                {season} Season · {standings.length} riders
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

                    {/* Class tabs */}
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
                        {/* Link to constructor standings */}
                        <Link
                            href="/sports/motogp/standings/constructors"
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
                            Constructor →
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
                        {/* Champion banner */}
                        {leader && <ChampionBanner standing={leader} season={season} />}

                        {/* Sprint stats callout — only if sprint data exists */}
                        {hasSprints && (
                            <div style={{
                                display: "flex", gap: "1px",
                                marginBottom: "24px", overflow: "hidden",
                                border: "1px solid rgba(255,255,255,0.06)",
                            }}>
                                {[
                                    { label: "Sprint Wins Leader", value: standings.reduce((a, b) => a.sprintWins > b.sprintWins ? a : b) },
                                    { label: "Sprint Podiums Leader", value: standings.reduce((a, b) => a.sprintPodiums > b.sprintPodiums ? a : b) },
                                ].map(({ label, value }) => {
                                    const c = getConstructorColor(value.constructorName ?? "")
                                    const parts = value.rider.fullName.split(" ")
                                    return (
                                        <Link key={label} href={`/sports/motogp/riders/${value.rider.id}`} style={{ textDecoration: "none", flex: 1 }}>
                                            <div style={{
                                                padding: "14px 20px", backgroundColor: "rgba(255,255,255,0.02)",
                                                borderLeft: `3px solid ${c}`, cursor: "pointer",
                                                transition: "background-color 0.15s",
                                            }}
                                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)"}
                                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.02)"}
                                            >
                                                <p style={{
                                                    fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 600,
                                                    letterSpacing: "0.15em", textTransform: "uppercase",
                                                    color: MOTOGP_RED, margin: "0 0 4px",
                                                }}>
                                                    {label}
                                                </p>
                                                <p style={{
                                                    fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700,
                                                    color: "#fff", margin: 0,
                                                }}>
                                                    {parts[0][0]}. {parts.slice(1).join(" ").toUpperCase()}
                                                    <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginLeft: "8px" }}>
                                                        {label.includes("Wins") ? `${value.sprintWins} wins` : `${value.sprintPodiums} podiums`}
                                                    </span>
                                                </p>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}

                        {/* Table */}
                        <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                            {/* Header */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: headerCols,
                                padding: "10px 16px",
                                backgroundColor: "rgba(255,255,255,0.03)",
                                borderBottom: "1px solid rgba(255,255,255,0.06)",
                                gap: "4px",
                            }}>
                                {[
                                    "POS", "#", "", "RIDER",
                                    "TEAM", "WINS", "POD",
                                    ...(showSprint ? ["SPR"] : []),
                                    "PTS",
                                ].map((h, i) => (
                                    <span key={i} style={{
                                        fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 600,
                                        letterSpacing: "0.15em", textTransform: "uppercase",
                                        color: "rgba(255,255,255,0.25)",
                                        textAlign: i > 4 ? "center" : undefined,
                                    }}>
                                        {h}
                                    </span>
                                ))}
                            </div>

                            {/* Rows */}
                            {standings.map((s, i) => (
                                <StandingRow
                                    key={s.rider.id}
                                    s={s}
                                    i={i}
                                    maxPts={maxPts}
                                    leaderPts={leaderPts}
                                    showSprint={showSprint}
                                />
                            ))}
                        </div>

                        {/* Footer note */}
                        <p style={{
                            fontSize: "0.72rem", color: "rgba(255,255,255,0.2)",
                            textAlign: "center", marginTop: "20px",
                            fontFamily: "var(--font-display)", letterSpacing: "0.08em",
                        }}>
                            {category}™ · {season} FIM World Championship
                            {showSprint ? " · SPR = Sprint Race Wins" : ""}
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}