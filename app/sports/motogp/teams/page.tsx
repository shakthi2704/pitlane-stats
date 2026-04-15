"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import F1Loader from "@/components/f1/F1Loader"
import { CURRENT_SEASON, MOTOGP_AVAILABLE_SEASONS } from "@/lib/motogp/motogp-constants"
import { getConstructorColor } from "@/components/motogp/MotoGPRiderStandings"
import { getTeamBike, MOTOGP_BIKE_PLACEHOLDER } from "@/lib/motogp/bike-images"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Rider {
    id: string
    fullName: string
    number?: number | null
    nationality?: string | null
    photoUrl?: string | null
    position: number
    points: number
}

interface Team {
    id: string
    name: string
    color?: string | null
    position: number
    points: number
    wins: number
    riders: Rider[]
}

type ClassFilter = "MotoGP" | "Moto2" | "Moto3"

// ─── Helpers ──────────────────────────────────────────────────────────────────


const MEDAL_COLORS = ["#F5C842", "#C0C0C0", "#CD7F32"]
const CLASS_TABS: ClassFilter[] = ["MotoGP", "Moto2", "Moto3"]

function getFlagEmoji(iso: string): string {
    if (!iso || iso.length !== 2) return ""
    return iso.toUpperCase().replace(/./g, c =>
        String.fromCodePoint(c.charCodeAt(0) + 127397)
    )
}

// function teamColor(team: Team): string {
//     // Prefer DB color, fall back to constructor color map
//     return team.color ?? getConstructorColor(team.name)
// }

function teamColor(team: Team): string {
    const name = team.name.toLowerCase()

    if (name.includes("ducati")) return getConstructorColor("Ducati")
    if (name.includes("yamaha")) return getConstructorColor("Yamaha")
    if (name.includes("honda")) return getConstructorColor("Honda")
    if (name.includes("ktm")) return getConstructorColor("KTM")
    if (name.includes("aprilia")) return getConstructorColor("Aprilia")
    if (name.includes("suzuki")) return getConstructorColor("Suzuki")

    return "#444444"
}
// ─── Top 3 Card ───────────────────────────────────────────────────────────────

const TopTeamCard = ({ team, isLeader }: { team: Team; isLeader: boolean }) => {
    const color = teamColor(team)
    const medalColor = MEDAL_COLORS[team.position - 1] ?? MEDAL_COLORS[0]

    return (
        <Link
            href={`/sports/motogp/teams/${team.id}`}
            style={{ textDecoration: "none", flex: isLeader ? "1.2" : "1" }}
        >
            <div
                style={{
                    position: "relative",
                    height: isLeader ? "300px" : "270px",
                    overflow: "hidden",
                    backgroundColor: color,
                    isolation: "isolate",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(-4px)"
                    el.style.boxShadow = `0 20px 40px ${color}50`
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(0)"
                    el.style.boxShadow = "none"
                }}
            >
                {/* Gradient */}
                <div style={{
                    position: "absolute", inset: 0, zIndex: 1,
                    background: "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.05) 100%)",
                }} />

                {/* Position watermark */}
                <div style={{
                    position: "absolute", right: "-8px", bottom: "-16px",
                    fontFamily: "var(--font-display)", fontSize: "9rem",
                    fontWeight: 900, lineHeight: 1, color: "rgba(0,0,0,0.2)",
                    zIndex: 2, userSelect: "none", pointerEvents: "none",
                }}>
                    {team.position}
                </div>

                {/* Team bike */}
                <img
                    src={getTeamBike(team.name)}
                    alt={team.name}
                    style={{
                        position: "absolute",
                        right: "-10px", bottom: "20px",
                        height: isLeader ? "75%" : "68%",
                        width: "auto",
                        objectFit: "contain",
                        objectPosition: "bottom right",
                        zIndex: 3,
                        filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.5))",
                        opacity: 0.92,
                    }}
                    onError={e => { (e.target as HTMLImageElement).src = MOTOGP_BIKE_PLACEHOLDER }}
                />

                {/* Content */}
                <div style={{
                    position: "relative", zIndex: 4, padding: "18px",
                    height: "100%", display: "flex", flexDirection: "column",
                    justifyContent: "space-between",
                }}>
                    {/* Top */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{
                            fontFamily: "var(--font-display)", fontSize: "1.4rem",
                            fontWeight: 700, letterSpacing: "0.1em", color: medalColor,
                        }}>
                            P{team.position}
                        </span>
                        <span style={{
                            fontFamily: "var(--font-display)",
                            fontSize: isLeader ? "1.6rem" : "1.2rem",
                            fontWeight: 800, color: "#fff", lineHeight: 1,
                            textTransform: "uppercase",
                        }}>
                            {team.name.toUpperCase()}
                        </span>
                    </div>

                    {/* Bottom */}
                    <div>
                        {/* Rider names */}
                        {team.riders.length > 0 && (
                            <div style={{ display: "flex", gap: "16px", marginBottom: "8px" }}>
                                {team.riders.map(r => {
                                    const parts = r.fullName.split(" ")
                                    const lastName = parts.slice(1).join(" ") || parts[0]
                                    return (
                                        <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            {r.nationality && <span style={{ fontSize: "11px" }}>{getFlagEmoji(r.nationality)}</span>}
                                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.06em" }}>
                                                {lastName.toUpperCase()}
                                            </span>
                                            {r.number != null && (
                                                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}>
                                                    #{r.number}
                                                </span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "16px", paddingTop: "10px", borderTop: "2px solid rgba(255,255,255,0.15)" }}>
                            {[
                                { label: "PTS", value: team.points },
                                { label: "WINS", value: team.wins },
                            ].map((s, i) => (
                                <div key={s.label} style={{ paddingRight: i === 0 ? "16px" : 0, borderRight: i === 0 ? "2px solid rgba(255,255,255,0.15)" : "none" }}>
                                    <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, margin: 0, lineHeight: 1, color: "#fff" }}>
                                        {s.value}
                                    </p>
                                    <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", margin: "2px 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                        {s.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

// ─── Regular Team Card ────────────────────────────────────────────────────────

const TeamCard = ({ team }: { team: Team }) => {
    const color = teamColor(team)
    const medalColor = MEDAL_COLORS[team.position - 1]

    return (
        <Link href={`/sports/motogp/teams/${team.id}`} style={{ textDecoration: "none" }}>
            <div
                style={{
                    position: "relative", height: "240px", overflow: "hidden",
                    backgroundColor: color, isolation: "isolate",
                    cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(-4px)"
                    el.style.boxShadow = `0 16px 32px ${color}40`
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(0)"
                    el.style.boxShadow = "none"
                }}
            >
                <div style={{
                    position: "absolute", inset: 0, zIndex: 1,
                    background: "linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
                }} />

                {/* Position watermark */}
                <div style={{
                    position: "absolute", right: "-8px", bottom: "-12px",
                    fontFamily: "var(--font-display)", fontSize: "6rem",
                    fontWeight: 900, lineHeight: 1, color: "rgba(0,0,0,0.2)",
                    zIndex: 2, userSelect: "none", pointerEvents: "none",
                }}>
                    {team.position}
                </div>

                {/* Team bike */}
                <img
                    src={getTeamBike(team.name)}
                    alt={team.name}
                    style={{
                        position: "absolute",
                        right: "-8px", bottom: "16px",
                        height: "68%", width: "auto",
                        objectFit: "contain", objectPosition: "bottom right",
                        zIndex: 3,
                        filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.5))",
                        opacity: 0.9,
                    }}
                    onError={e => { (e.target as HTMLImageElement).src = MOTOGP_BIKE_PLACEHOLDER }}
                />

                {/* Content */}
                <div style={{
                    position: "relative", zIndex: 4, padding: "16px",
                    height: "100%", display: "flex", flexDirection: "column",
                    justifyContent: "space-between",
                }}>
                    {/* Top */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{
                            fontFamily: "var(--font-display)", fontSize: "1rem",
                            fontWeight: 800, color: "#fff", textTransform: "uppercase",
                        }}>
                            {team.name.toUpperCase()}
                        </span>
                        <span style={{
                            fontFamily: "var(--font-display)", fontSize: "0.9rem",
                            fontWeight: 700, color: medalColor ?? "rgba(255,255,255,0.5)",
                        }}>
                            P{team.position}
                        </span>
                    </div>

                    {/* Bottom */}
                    <div>
                        {team.riders.length > 0 && (
                            <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                                {team.riders.map(r => {
                                    const parts = r.fullName.split(" ")
                                    const lastName = parts.slice(1).join(" ") || parts[0]
                                    return (
                                        <span key={r.id} style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", color: "rgba(255,255,255,0.6)", letterSpacing: "0.06em" }}>
                                            {lastName.toUpperCase()}
                                        </span>
                                    )
                                })}
                            </div>
                        )}
                        <div style={{ display: "flex", gap: "16px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                            {[
                                { label: "PTS", value: team.points },
                                { label: "WINS", value: team.wins },
                            ].map((s, i) => (
                                <div key={s.label} style={{ paddingRight: i === 0 ? "16px" : 0, borderRight: i === 0 ? "1px solid rgba(255,255,255,0.12)" : "none" }}>
                                    <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: medalColor ?? "#fff", margin: 0, lineHeight: 1 }}>
                                        {s.value}
                                    </p>
                                    <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", margin: "2px 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                        {s.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MotoGPTeamsPage() {
    const [season, setSeason] = useState(CURRENT_SEASON)
    const [classFilter, setClassFilter] = useState<ClassFilter>("MotoGP")
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setLoading(true)
        fetch(`/api/motogp/teams?year=${season}&category=${classFilter}`)
            .then(r => r.json())
            .then(data => setTeams(data.teams ?? []))
            .catch(err => console.error("[MotoGP] teams:", err))
            .finally(() => setLoading(false))
    }, [season, classFilter])

    const top3 = teams.slice(0, 3)
    const rest = teams.slice(3)
    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean) as Team[]

    const scrollLeft = () => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })
    const scrollRight = () => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })

    return (
        <div>
            {/* Header */}
            <div style={{
                background: "linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 100%)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                padding: "48px 0 0",
            }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", marginBottom: "28px" }}>
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
                                margin: "0 0 8px", lineHeight: 0.9, letterSpacing: "-0.03em",
                            }}>
                                TEAMS
                            </h1>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem", margin: 0 }}>
                                {season} FIM MotoGP™ World Championship · {teams.length} teams
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
                    <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        {CLASS_TABS.map(cls => (
                            <button
                                key={cls}
                                onClick={() => setClassFilter(cls)}
                                style={{
                                    fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 600,
                                    letterSpacing: "0.12em", textTransform: "uppercase",
                                    padding: "10px 20px", background: "none", border: "none",
                                    cursor: "pointer", transition: "color 0.2s", marginBottom: "-1px",
                                    color: classFilter === cls ? "#ffffff" : "rgba(255,255,255,0.3)",
                                    borderBottom: classFilter === cls ? "2px solid var(--accent)" : "2px solid transparent",
                                }}
                            >
                                {cls}™
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                {loading && <F1Loader message="LOADING TEAMS..." />}

                {!loading && teams.length === 0 && (
                    <div style={{ padding: "80px 0", textAlign: "center" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>
                            NO DATA AVAILABLE FOR {season} {classFilter}™
                        </p>
                    </div>
                )}

                {!loading && teams.length > 0 && (
                    <>
                        {/* Championship leaders — P2 / P1 / P3 */}
                        <div style={{ marginBottom: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                <div style={{ width: "4px", height: "22px", backgroundColor: "var(--accent)" }} />
                                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "#ffffff", margin: 0, letterSpacing: "0.05em" }}>
                                    CHAMPIONSHIP LEADERS
                                </h2>
                            </div>
                            <div style={{ display: "flex", gap: "6px", alignItems: "flex-end" }}>
                                {podiumOrder.map(t => (
                                    <TopTeamCard key={t.id} team={t} isLeader={t.position === 1} />
                                ))}
                            </div>
                        </div>

                        {/* Rest */}
                        {rest.length > 0 && (
                            <div style={{ marginTop: "24px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                    <div style={{ width: "4px", height: "22px", backgroundColor: "rgba(255,255,255,0.2)" }} />
                                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.6)", margin: 0, letterSpacing: "0.05em" }}>
                                        ALL TEAMS
                                    </h2>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "6px" }}>
                                    {rest.map(t => <TeamCard key={t.id} team={t} />)}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}