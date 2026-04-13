"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import F1Loader from "@/components/f1/F1Loader"
import { MOTOGP_RED, MOTOGP_AVAILABLE_SEASONS, CURRENT_SEASON } from "@/lib/motogp/motogp-constants"
import { getConstructorColor } from "@/components/motogp/MotoGPRiderStandings"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Rider {
    id: string
    fullName: string
    firstName?: string | null
    lastName?: string | null
    nationality?: string | null
    number?: number | null
    photoUrl?: string | null
    position: number
    points: number
    raceWins: number
    podiums: number
    constructorName?: string | null
}

interface EventResult {
    eventId: string
    eventName: string
    shortName: string
    nation: string
    date?: string | null
    results: {
        riderId: string
        riderName: string
        riderNumber?: number | null
        sessionType: string
        position?: number | null
        status?: string | null
        points?: number | null
        time?: string | null
        gapFirst?: string | null
    }[]
}

interface TeamProfile {
    team: { id: string; name: string; color?: string | null }
    standing: { position: number; points: number; wins: number } | null
    riders: Rider[]
    raceResults: EventResult[]
    careerHistory: { year: number; position: number; points: number; wins: number }[]
    careerTotals: { seasons: number; wins: number; points: number; championships: number }
}

type Tab = "results" | "career"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FALLBACK_PHOTO = "/F1/drivers/placeholder.svg"
const BIKE_PLACEHOLDER = "/motogp/bikes/placeholder.svg"
const MEDAL_COLORS = ["#F5C842", "#C0C0C0", "#CD7F32"]

function getFlagEmoji(iso: string): string {
    if (!iso || iso.length !== 2) return ""
    return iso.toUpperCase().replace(/./g, c =>
        String.fromCodePoint(c.charCodeAt(0) + 127397)
    )
}

function posOrdinal(n: number): string {
    const s = ["th", "st", "nd", "rd"]
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function posColor(pos: number | null | undefined): string {
    if (!pos) return "rgba(255,255,255,0.25)"
    if (pos === 1) return "#F5C842"
    if (pos <= 3) return "#C0C0C0"
    if (pos <= 10) return "#4ade80"
    return "rgba(255,255,255,0.45)"
}

function riderLastName(r: Rider): string {
    const parts = r.fullName.split(" ")
    return r.lastName ?? (parts.slice(1).join(" ") || parts[0])
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MotoGPTeamDetailPage() {
    const params = useParams()
    const id = params?.id as string

    const [season, setSeason] = useState(CURRENT_SEASON)
    const [profile, setProfile] = useState<TeamProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<Tab>("results")
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        fetch(`/api/motogp/teams/${id}?year=${season}`)
            .then(r => r.json())
            .then(data => setProfile(data.error ? null : data))
            .catch(err => console.error("[MotoGP] team detail:", err))
            .finally(() => setLoading(false))
    }, [id, season])

    const scrollLeft = () => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })
    const scrollRight = () => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })

    const seasonSelector = (color: string) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={scrollLeft} style={{ cursor: "pointer", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white" }}>◀</button>
            <div ref={scrollRef} style={{ display: "flex", gap: "8px", overflowX: "auto", scrollBehavior: "smooth", whiteSpace: "nowrap", maxWidth: "200px", scrollbarWidth: "none" }}>
                {MOTOGP_AVAILABLE_SEASONS.map(s => (
                    <button
                        key={s}
                        data-active={season === s}
                        onClick={() => setSeason(s)}
                        style={{
                            flex: "0 0 auto", fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 600,
                            padding: "6px 14px", cursor: "pointer", border: "2px solid", transition: "all 0.2s",
                            borderColor: season === s ? color : "rgba(255,255,255,0.1)",
                            color: season === s ? "#ffffff" : "rgba(255,255,255,0.4)",
                            backgroundColor: "transparent",
                        }}
                    >
                        {s}
                    </button>
                ))}
            </div>
            <button onClick={scrollRight} style={{ cursor: "pointer", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white" }}>▶</button>
        </div>
    )

    if (loading) return (
        <div>
            <div style={{ display: "none" }}>{seasonSelector(MOTOGP_RED)}</div>
            <F1Loader message="LOADING TEAM..." />
        </div>
    )

    if (!profile) return (
        <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
            <p style={{ fontFamily: "var(--font-display)", color: MOTOGP_RED, fontSize: "1.5rem", letterSpacing: "0.1em" }}>TEAM NOT FOUND</p>
            <Link href="/sports/motogp/teams" style={{ fontFamily: "var(--font-sans)", color: "#555", fontSize: "0.85rem", textDecoration: "none" }}>
                ← Back to Teams
            </Link>
        </div>
    )

    const { team, standing, riders, raceResults, careerHistory, careerTotals } = profile
    const color = team.color ?? getConstructorColor(team.name)

    return (
        <div>
            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <div style={{ position: "relative", borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div className="max-w-7xl" style={{ margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "stretch", minHeight: "360px" }}>

                    {/* Left */}
                    <div style={{ flex: 1, padding: "48px 0 40px", position: "relative", zIndex: 2 }}>

                        {/* Breadcrumb */}
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "24px" }}>
                            {[
                                { label: "MOTOGP", href: "/sports/motogp" },
                                { label: "TEAMS", href: "/sports/motogp/teams" },
                                { label: team.name.toUpperCase(), href: null },
                            ].map((crumb, i, arr) => (
                                <span key={crumb.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    {crumb.href ? (
                                        <Link href={crumb.href} style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", color: "#444", textDecoration: "none", letterSpacing: "0.12em" }}>
                                            {crumb.label}
                                        </Link>
                                    ) : (
                                        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", color: color, letterSpacing: "0.12em" }}>
                                            {crumb.label}
                                        </span>
                                    )}
                                    {i < arr.length - 1 && <span style={{ color: "#222", fontSize: "0.7rem" }}>/</span>}
                                </span>
                            ))}
                        </div>

                        {/* Team name */}
                        <div style={{ marginBottom: "12px" }}>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", color: "#ffffff", letterSpacing: "-0.01em", textTransform: "uppercase", lineHeight: 0.9, fontWeight: 700 }}>
                                {team.name}
                            </div>
                        </div>

                        {/* Meta — rider links */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "28px" }}>
                            {riders.map((r, i) => (
                                <span key={r.id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    {i > 0 && <span style={{ color: "#1e1e1e" }}>·</span>}
                                    <Link href={`/sports/motogp/riders/${r.id}`} style={{ fontFamily: "var(--font-sans)", color: color, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", textDecoration: "none" }}>
                                        {r.fullName}
                                    </Link>
                                </span>
                            ))}
                        </div>

                        {/* Stat strip */}
                        {standing && (
                            <div style={{ display: "flex", gap: "1px" }}>
                                {[
                                    { label: `${season} Position`, value: posOrdinal(standing.position) },
                                    { label: "Points", value: standing.points },
                                    { label: "Wins", value: standing.wins },
                                ].map((stat, i) => (
                                    <div key={stat.label} style={{
                                        padding: "14px 20px",
                                        backgroundColor: i === 0 ? `${color}15` : "rgba(255,255,255,0.03)",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                        borderTop: i === 0 ? `2px solid ${color}` : "2px solid rgba(255,255,255,0.08)",
                                    }}>
                                        <div style={{ fontFamily: "var(--font-display)", fontSize: i === 0 ? "1.8rem" : "1.5rem", color: i === 0 ? color : "#ffffff", lineHeight: 1, fontWeight: 700 }}>
                                            {stat.value}
                                        </div>
                                        <div style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: "5px" }}>
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!standing && (
                            <div style={{ padding: "14px 20px", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "3px solid rgba(255,255,255,0.15)", display: "inline-block" }}>
                                <p style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
                                    No standings data for {season}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right: bike placeholder + rider photos */}
                    <div style={{ position: "relative", width: "380px", flexShrink: 0, alignSelf: "stretch" }}>
                        {/* Bike placeholder — top 60% */}
                        <div style={{
                            position: "absolute", top: "10%", left: 0, right: 0, height: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            opacity: 0.15,
                        }}>
                            <div style={{
                                fontFamily: "var(--font-display)", fontSize: "7rem", fontWeight: 900,
                                color: color, textTransform: "uppercase", letterSpacing: "-0.05em",
                                userSelect: "none",
                            }}>
                                {team.name.slice(0, 3).toUpperCase()}
                            </div>
                        </div>

                        {/* Rider photos — bottom 45% */}
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", display: "flex", alignItems: "flex-end", zIndex: 2 }}>
                            {riders.slice(0, 2).map((r, i) => (
                                <div key={r.id} style={{
                                    position: "relative", flex: 1, height: "100%",
                                    borderLeft: i > 0 ? `1px solid ${color}30` : "none",
                                    overflow: "hidden",
                                }}>
                                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: color, opacity: i === 0 ? 1 : 0.35, zIndex: 4 }} />
                                    <img
                                        src={r.photoUrl ?? FALLBACK_PHOTO}
                                        alt={r.fullName}
                                        style={{
                                            position: "absolute", inset: 0, width: "100%", height: "100%",
                                            objectFit: "contain", objectPosition: "bottom center",
                                            filter: `brightness(${i === 0 ? 1 : 0.75})`,
                                        }}
                                        onError={e => { (e.target as HTMLImageElement).src = FALLBACK_PHOTO }}
                                    />
                                    <div style={{
                                        position: "absolute", bottom: 0, left: 0, right: 0,
                                        padding: "20px 10px 10px",
                                        background: "linear-gradient(to top, rgba(10,10,10,0.92) 65%, transparent)",
                                        zIndex: 3,
                                    }}>
                                        <div style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", color: color, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                            {r.number != null ? `#${r.number}` : ""}
                                        </div>
                                        <div style={{ fontFamily: "var(--font-display)", fontSize: "0.82rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1 }}>
                                            {riderLastName(r)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RIDERS STRIP ─────────────────────────────────────────────── */}
            {riders.length > 0 && (
                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="max-w-7xl" style={{ margin: "0 auto", padding: "20px 24px", display: "flex", gap: "2px" }}>
                        {riders.map(r => (
                            <Link key={r.id} href={`/sports/motogp/riders/${r.id}`} style={{ textDecoration: "none", flex: 1 }}>
                                <div
                                    style={{
                                        display: "flex", alignItems: "center", gap: "14px",
                                        padding: "14px 20px",
                                        background: "rgba(255,255,255,0.03)",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                        borderTop: `2px solid ${color}`,
                                        transition: "background 0.15s",
                                    }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"}
                                >
                                    {/* Photo */}
                                    <div style={{ width: "48px", height: "48px", flexShrink: 0, overflow: "hidden", position: "relative", backgroundColor: `${color}20` }}>
                                        <img
                                            src={r.photoUrl ?? FALLBACK_PHOTO}
                                            alt={r.fullName}
                                            style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom" }}
                                            onError={e => { (e.target as HTMLImageElement).src = FALLBACK_PHOTO }}
                                        />
                                    </div>
                                    {/* Info */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", color: color, letterSpacing: "0.1em", marginBottom: "2px" }}>
                                            {r.number != null ? `#${r.number}` : r.constructorName}
                                        </div>
                                        <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "#fff", fontWeight: 400 }}>
                                            {r.fullName}
                                        </div>
                                        <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                                            {getFlagEmoji(r.nationality ?? "")} {r.nationality}
                                        </div>
                                    </div>
                                    {/* Points */}
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "#fff", fontWeight: 700, lineHeight: 1 }}>{r.points}</div>
                                        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "2px" }}>PTS</div>
                                    </div>
                                    {/* Standing */}
                                    <div style={{ textAlign: "right", paddingLeft: "16px", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
                                        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "rgba(255,255,255,0.6)", fontWeight: 400, lineHeight: 1 }}>{posOrdinal(r.position)}</div>
                                        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "2px" }}>STANDING</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* ── BODY ─────────────────────────────────────────────────────── */}
            <div className="max-w-7xl" style={{ margin: "0 auto", padding: "32px 24px" }}>
                {/* Controls */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        {(["results", "career"] as Tab[]).map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                style={{
                                    fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600,
                                    letterSpacing: "0.15em", textTransform: "uppercase",
                                    color: tab === t ? "#ffffff" : "rgba(255,255,255,0.3)",
                                    background: "none", border: "none",
                                    borderBottom: tab === t ? `2px solid ${color}` : "2px solid transparent",
                                    padding: "10px 16px", cursor: "pointer", marginBottom: "-1px", transition: "color 0.2s",
                                }}
                            >
                                {t === "results" ? "Race Results" : "Career"}
                            </button>
                        ))}
                    </div>
                    {seasonSelector(color)}
                </div>

                {/* ── RESULTS TAB ──────────────────────────────────────────── */}
                {tab === "results" && (
                    <div>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: color, marginBottom: "6px" }}>
                            MotoGP™
                        </p>
                        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "#ffffff", margin: "0 0 4px", lineHeight: 1, letterSpacing: "-0.02em" }}>
                            {season} RACE BY RACE
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem", marginBottom: "24px" }}>
                            {season} FIM MotoGP™ World Championship
                        </p>

                        {raceResults.length === 0 ? (
                            <div style={{ padding: "60px 16px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>
                                    NO DATA AVAILABLE FOR {season}
                                </p>
                            </div>
                        ) : (
                            <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                                {/* Header */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 5rem 4rem 4rem 4rem 5rem", padding: "10px 16px", backgroundColor: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                    {["RACE", "RIDER", "TYPE", "POS", "PTS", "GAP"].map(h => (
                                        <span key={h} style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
                                            {h}
                                        </span>
                                    ))}
                                </div>

                                {raceResults.map((ev, ei) =>
                                    ev.results.map((r, ri) => {
                                        const isRetired = r.status === "DNF" || r.status === "DNS" || r.status === "INSTND"
                                        const isSprint = r.sessionType === "SPR"
                                        const nameParts = r.riderName.split(" ")
                                        const lastName = nameParts.slice(1).join(" ") || nameParts[0]
                                        return (
                                            <div
                                                key={`${ev.eventId}-${r.riderId}-${r.sessionType}`}
                                                style={{
                                                    display: "grid", gridTemplateColumns: "1fr 5rem 4rem 4rem 4rem 5rem",
                                                    alignItems: "center", padding: "11px 16px",
                                                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                                                    borderLeft: `3px solid ${isSprint ? color + "80" : color}`,
                                                    backgroundColor: isSprint ? "rgba(255,255,255,0.01)" : "transparent",
                                                    opacity: isRetired ? 0.6 : 1,
                                                    transition: "background-color 0.15s",
                                                }}
                                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)"}
                                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = isSprint ? "rgba(255,255,255,0.01)" : "transparent"}
                                            >
                                                <div>
                                                    {ri === 0 || (ri > 0 && ev.results[ri - 1].riderId !== r.riderId && ev.results[ri - 1].sessionType === r.sessionType) ? (
                                                        <>
                                                            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", color: "#fff", fontWeight: 600 }}>
                                                                {ev.eventName.toUpperCase()}
                                                            </div>
                                                            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginTop: "1px" }}>
                                                                {getFlagEmoji(ev.nation)} {ev.shortName}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-display)", letterSpacing: "0.08em" }}>
                                                            ↳
                                                        </div>
                                                    )}
                                                </div>
                                                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", color: color, letterSpacing: "0.06em" }}>
                                                    {lastName.toUpperCase()}
                                                    {r.riderNumber != null && <span style={{ color: "rgba(255,255,255,0.3)", marginLeft: "4px" }}>#{r.riderNumber}</span>}
                                                </span>
                                                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.72rem", letterSpacing: "0.08em", color: isSprint ? MOTOGP_RED : "rgba(255,255,255,0.4)" }}>
                                                    {r.sessionType}
                                                </span>
                                                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, color: isRetired ? "#f87171" : posColor(r.position) }}>
                                                    {isRetired ? r.status : (r.position ?? "—")}
                                                </span>
                                                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: (r.points ?? 0) > 0 ? "#fff" : "rgba(255,255,255,0.2)" }}>
                                                    {r.points ?? 0}
                                                </span>
                                                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>
                                                    {r.gapFirst ? `+${r.gapFirst}` : (r.position === 1 ? r.time ?? "—" : "—")}
                                                </span>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── CAREER TAB ──────────────────────────────────────────── */}
                {tab === "career" && (
                    <div>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: color, marginBottom: "6px" }}>
                            MotoGP™
                        </p>
                        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "#ffffff", margin: "0 0 4px", lineHeight: 1, letterSpacing: "-0.02em" }}>
                            TEAM HISTORY
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem", marginBottom: "24px" }}>
                            All-time MotoGP World Championship record
                        </p>

                        {/* Career totals */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: "0",
                            padding: "16px 20px", marginBottom: "28px",
                            backgroundColor: "rgba(245,200,66,0.06)",
                            border: "1px solid rgba(245,200,66,0.15)",
                            borderLeft: "3px solid #F5C842", flexWrap: "wrap",
                        }}>
                            {[
                                { label: "Championships", value: careerTotals.championships, color: "#F5C842" },
                                { label: "Seasons", value: careerTotals.seasons, color: "#fff" },
                                { label: "Wins", value: careerTotals.wins, color: "#fff" },
                                { label: "Points", value: Math.round(careerTotals.points), color: "#fff" },
                            ].map((stat, i) => (
                                <div key={stat.label} style={{
                                    flex: 1, minWidth: "80px",
                                    textAlign: i === 0 ? "left" : "center",
                                    borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                                    padding: i > 0 ? "0 16px" : "0 16px 0 0",
                                }}>
                                    <p style={{ fontFamily: "var(--font-display)", fontSize: i === 0 ? "2.5rem" : "2rem", fontWeight: 700, color: stat.color, margin: 0, lineHeight: 1 }}>
                                        {stat.value}
                                    </p>
                                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", margin: "2px 0 0" }}>
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Season table */}
                        {careerHistory.length === 0 ? (
                            <div style={{ padding: "60px 16px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>NO CAREER DATA AVAILABLE</p>
                            </div>
                        ) : (
                            <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "5rem 6rem 6rem 5rem", padding: "10px 16px", backgroundColor: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                    {["Season", "Position", "Points", "Wins"].map(h => (
                                        <span key={h} style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
                                            {h}
                                        </span>
                                    ))}
                                </div>
                                {careerHistory.map(ch => {
                                    const isChamp = ch.position === 1
                                    return (
                                        <div
                                            key={ch.year}
                                            style={{
                                                display: "grid", gridTemplateColumns: "5rem 6rem 6rem 5rem",
                                                alignItems: "center", padding: "13px 16px",
                                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                                                backgroundColor: isChamp ? "rgba(245,200,66,0.05)" : "transparent",
                                                transition: "background-color 0.15s",
                                            }}
                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)"}
                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = isChamp ? "rgba(245,200,66,0.05)" : "transparent"}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 400, color: isChamp ? "#F5C842" : "#ffffff" }}>{ch.year}</span>
                                                {isChamp && <span style={{ fontSize: "0.75rem" }}>🏆</span>}
                                            </div>
                                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", color: posColor(ch.position) }}>{posOrdinal(ch.position)}</span>
                                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", color: "#ffffff" }}>{Math.round(ch.points)}</span>
                                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", color: ch.wins > 0 ? "#F5C842" : "rgba(255,255,255,0.2)" }}>{ch.wins}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}