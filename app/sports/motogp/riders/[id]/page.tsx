"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import F1Loader from "@/components/f1/F1Loader"
import { MOTOGP_RED, MOTOGP_AVAILABLE_SEASONS, CURRENT_SEASON } from "@/lib/motogp/motogp-constants"
import { getConstructorColor } from "@/components/motogp/MotoGPRiderStandings"

// ─── Types ────────────────────────────────────────────────────────────────────

interface RiderProfile {
    rider: {
        id: string
        fullName: string
        firstName?: string | null
        lastName?: string | null
        nationality?: string | null
        number?: number | null
        photoUrl?: string | null
        birthDate?: string | null
        birthCity?: string | null
        category: string
    }
    currentStanding: {
        position: number
        points: number
        raceWins: number
        podiums: number
        sprintWins: number
        teamName?: string | null
        constructorName?: string | null
        category: string
    } | null
    seasonStats: {
        races: number
        dnfs: number
        pointsFinishes: number
        bestFinish: number
        sprintRaces: number
    }
    raceResults: {
        sessionId: string
        sessionType: string
        eventId: string
        eventName: string
        shortName: string
        circuitName: string
        nation: string
        date?: string | null
        position?: number | null
        status?: string | null
        points?: number | null
        time?: string | null
        gapFirst?: string | null
        totalLaps?: number | null
        averageSpeed?: number | null
        constructorName?: string | null
        teamName?: string | null
    }[]
    careerHistory: {
        year: number
        position: number
        points: number
        raceWins: number
        podiums: number
        sprintWins: number
        teamName?: string | null
        constructorName?: string | null
        category: string
    }[]
    careerTotals: {
        seasons: number
        wins: number
        podiums: number
        sprintWins: number
        points: number
        championships: number
    }
}

type Tab = "results" | "career"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FALLBACK_PHOTO = "/F1/drivers/placeholder.svg"

function getFlagEmoji(iso: string): string {
    if (!iso || iso.length !== 2) return ""
    return iso.toUpperCase().replace(/./g, c =>
        String.fromCodePoint(c.charCodeAt(0) + 127397)
    )
}

function riderAge(dob: string | null | undefined): string {
    if (!dob) return "—"
    return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toString()
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

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MotoGPRiderDetailPage() {
    const params = useParams()
    const id = params?.id as string

    const [season, setSeason] = useState(CURRENT_SEASON)
    const [profile, setProfile] = useState<RiderProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<Tab>("results")
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        fetch(`/api/motogp/riders/${id}?year=${season}`)
            .then(r => r.json())
            .then(data => setProfile(data.error ? null : data))
            .catch(err => console.error("[MotoGP] rider detail:", err))
            .finally(() => setLoading(false))
    }, [id, season])

    const scrollLeft = () => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })
    const scrollRight = () => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })

    if (loading) return <F1Loader message="LOADING RIDER..." />

    if (!profile) return (
        <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
            <p style={{ fontFamily: "var(--font-display)", color: MOTOGP_RED, fontSize: "1.5rem", letterSpacing: "0.1em" }}>
                RIDER NOT FOUND
            </p>
            <Link href="/sports/motogp/riders" style={{ fontFamily: "var(--font-sans)", color: "#555", fontSize: "0.85rem", textDecoration: "none" }}>
                ← Back to Riders
            </Link>
        </div>
    )

    const { rider, currentStanding, seasonStats, raceResults, careerHistory, careerTotals } = profile
    const color = getConstructorColor(currentStanding?.constructorName ?? careerHistory[0]?.constructorName ?? "")
    const nameParts = rider.fullName.split(" ")
    const firstName = rider.firstName ?? nameParts[0]
    const lastName = rider.lastName ?? (nameParts.slice(1).join(" ") || nameParts[0])
    const flag = getFlagEmoji(rider.nationality ?? "")

    // separate races and sprints for the results tab
    const races = raceResults.filter(r => r.sessionType === "RAC")
    const sprints = raceResults.filter(r => r.sessionType === "SPR")

    return (
        <div>
            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <div style={{
                position: "relative",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                overflow: "hidden",
            }}>
                <div className="max-w-7xl" style={{ margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "stretch", minHeight: "380px" }}>

                    {/* Left: content */}
                    <div style={{ flex: 1, padding: "48px 0 40px", position: "relative", zIndex: 2 }}>

                        {/* Breadcrumb */}
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "24px" }}>
                            {[
                                { label: "MOTOGP", href: "/sports/motogp" },
                                { label: "RIDERS", href: "/sports/motogp/riders" },
                                { label: lastName.toUpperCase(), href: null },
                            ].map((crumb, i, arr) => (
                                <span key={crumb.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    {crumb.href ? (
                                        <Link href={crumb.href} style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", color: "#444", textDecoration: "none", letterSpacing: "0.12em" }}>
                                            {crumb.label}
                                        </Link>
                                    ) : (
                                        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", color: MOTOGP_RED, letterSpacing: "0.12em" }}>
                                            {crumb.label}
                                        </span>
                                    )}
                                    {i < arr.length - 1 && <span style={{ color: "#222", fontSize: "0.7rem" }}>/</span>}
                                </span>
                            ))}
                        </div>

                        {/* Badges */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
                            {currentStanding?.constructorName && (
                                <span style={{
                                    fontFamily: "var(--font-display)", fontSize: "0.72rem",
                                    color: color, border: `1px solid ${color}44`,
                                    padding: "3px 10px", letterSpacing: "0.08em",
                                }}>
                                    {currentStanding.constructorName}
                                </span>
                            )}
                            {rider.number != null && (
                                <span style={{
                                    fontFamily: "var(--font-display)", fontSize: "0.72rem",
                                    color: color, border: `1px solid ${color}44`,
                                    padding: "3px 10px", letterSpacing: "0.08em",
                                }}>
                                    #{rider.number}
                                </span>
                            )}
                            <span style={{
                                fontFamily: "var(--font-display)", fontSize: "0.72rem",
                                color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)",
                                padding: "3px 10px", letterSpacing: "0.08em",
                            }}>
                                {rider.category.replace("™", "")}™
                            </span>
                        </div>

                        {/* Name */}
                        <div style={{ marginBottom: "12px" }}>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(0.85rem, 1.8vw, 1.1rem)", color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                                {firstName}
                            </div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 5.5vw, 4.5rem)", color: "#ffffff", letterSpacing: "-0.01em", textTransform: "uppercase", lineHeight: 0.9 }}>
                                {lastName}
                            </div>
                        </div>

                        {/* Meta */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "32px" }}>
                            <span style={{ fontSize: "1.2rem" }}>{flag}</span>
                            <span style={{ fontFamily: "var(--font-sans)", color: "rgba(255,255,255,0.35)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                {rider.nationality}
                            </span>
                            {currentStanding?.teamName && (
                                <>
                                    <span style={{ color: "#1e1e1e" }}>·</span>
                                    <span style={{ fontFamily: "var(--font-sans)", color: color, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        {currentStanding.teamName}
                                    </span>
                                </>
                            )}
                            {rider.birthDate && (
                                <>
                                    <span style={{ color: "#1e1e1e" }}>·</span>
                                    <span style={{ fontFamily: "var(--font-sans)", color: "rgba(255,255,255,0.25)", fontSize: "0.78rem" }}>
                                        Age {riderAge(rider.birthDate)}
                                    </span>
                                </>
                            )}
                            {rider.birthCity && (
                                <>
                                    <span style={{ color: "#1e1e1e" }}>·</span>
                                    <span style={{ fontFamily: "var(--font-sans)", color: "rgba(255,255,255,0.2)", fontSize: "0.78rem" }}>
                                        {rider.birthCity}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Stat strip */}
                        {currentStanding && (
                            <div style={{ display: "flex", gap: "1px" }}>
                                {[
                                    { label: `${season} Position`, value: posOrdinal(currentStanding.position) },
                                    { label: "Points", value: currentStanding.points },
                                    { label: "Wins", value: currentStanding.raceWins },
                                    { label: "Podiums", value: currentStanding.podiums },
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
                    </div>

                    {/* Right: photo */}
                    <div style={{ position: "relative", width: "320px", flexShrink: 0, alignSelf: "flex-end" }}>
                        {/* Number watermark */}
                        {rider.number != null && (
                            <div style={{
                                position: "absolute", inset: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontFamily: "var(--font-display)", fontSize: "20rem",
                                color: color, opacity: 0.07, lineHeight: 1,
                                userSelect: "none", pointerEvents: "none", letterSpacing: "-0.05em",
                            }}>
                                {rider.number}
                            </div>
                        )}
                        <div style={{ position: "relative", height: "380px" }}>
                            <img
                                src={rider.photoUrl ?? FALLBACK_PHOTO}
                                alt={rider.fullName}
                                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom center" }}
                                onError={e => { (e.target as HTMLImageElement).src = FALLBACK_PHOTO }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── BODY ─────────────────────────────────────────────────────── */}
            <div className="max-w-7xl" style={{ margin: "0 auto", padding: "32px 24px" }}>

                {/* Controls row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>

                    {/* Tabs */}
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
                                    padding: "10px 16px", cursor: "pointer",
                                    marginBottom: "-1px", transition: "color 0.2s",
                                }}
                            >
                                {t === "results" ? "Race Results" : "Career"}
                            </button>
                        ))}
                    </div>

                    {/* Season selector */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button onClick={scrollLeft} style={{ cursor: "pointer", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white" }}>◀</button>
                        <div ref={scrollRef} style={{ display: "flex", gap: "8px", overflowX: "auto", scrollBehavior: "smooth", whiteSpace: "nowrap", maxWidth: "200px", scrollbarWidth: "none" }}>
                            {MOTOGP_AVAILABLE_SEASONS.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSeason(s)}
                                    style={{
                                        flex: "0 0 auto", fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 600,
                                        padding: "6px 14px", cursor: "pointer", border: "1px solid", transition: "all 0.2s",
                                        borderColor: season === s ? color : "rgba(255,255,255,0.1)",
                                        color: season === s ? color : "rgba(255,255,255,0.4)",
                                        backgroundColor: "transparent",
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <button onClick={scrollRight} style={{ cursor: "pointer", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white" }}>▶</button>
                    </div>
                </div>

                {/* ── RESULTS TAB ─────────────────────────────────────────── */}
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

                        {/* Season stats strip */}
                        <div style={{
                            display: "flex", gap: "1px", marginBottom: "28px",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderLeft: `3px solid ${color}`,
                            padding: "16px 20px", alignItems: "center",
                            backgroundColor: `${color}08`,
                        }}>
                            {[
                                { label: "Races", value: seasonStats.races },
                                { label: "Points Finishes", value: seasonStats.pointsFinishes },
                                { label: "Best Finish", value: seasonStats.bestFinish < 99 ? posOrdinal(seasonStats.bestFinish) : "—" },
                                { label: "DNFs", value: seasonStats.dnfs },
                                { label: "Sprint Races", value: seasonStats.sprintRaces },
                            ].map((s, i) => (
                                <div key={s.label} style={{ flex: 1, textAlign: "center", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                                    <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, color: "#ffffff", lineHeight: 1 }}>
                                        {s.value}
                                    </div>
                                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "2px" }}>
                                        {s.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {races.length === 0 ? (
                            <div style={{ padding: "60px 16px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>
                                    NO RACE DATA FOR {season}
                                </p>
                            </div>
                        ) : (
                            <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                                {/* Header */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 4rem 4rem 4rem 5rem 5rem", padding: "10px 16px", backgroundColor: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                    {["RACE", "POS", "PTS", "LAPS", "GAP", "AVG SPD"].map(h => (
                                        <span key={h} style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
                                            {h}
                                        </span>
                                    ))}
                                </div>
                                {races.map(r => {
                                    const isRetired = r.status === "DNF" || r.status === "DNS" || r.status === "INSTND"
                                    // Find matching sprint if any
                                    const sprint = sprints.find(s => s.eventId === r.eventId)
                                    return (
                                        <div key={r.sessionId}>
                                            <div
                                                style={{
                                                    display: "grid", gridTemplateColumns: "1fr 4rem 4rem 4rem 5rem 5rem",
                                                    alignItems: "center", padding: "12px 16px",
                                                    borderBottom: sprint ? "none" : "1px solid rgba(255,255,255,0.04)",
                                                    transition: "background-color 0.15s",
                                                    borderLeft: `3px solid ${color}`,
                                                    opacity: isRetired ? 0.6 : 1,
                                                }}
                                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)"}
                                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
                                            >
                                                <div>
                                                    <div style={{ fontFamily: "var(--font-display)", fontSize: "0.88rem", color: "#fff", fontWeight: 600 }}>
                                                        {r.eventName.toUpperCase()}
                                                    </div>
                                                    <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginTop: "1px" }}>
                                                        {getFlagEmoji(r.nation)} {r.circuitName} · {formatDate(r.date)}
                                                    </div>
                                                </div>
                                                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, color: isRetired ? "#f87171" : posColor(r.position) }}>
                                                    {isRetired ? r.status : (r.position ?? "—")}
                                                </span>
                                                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: (r.points ?? 0) > 0 ? "#ffffff" : "rgba(255,255,255,0.2)" }}>
                                                    {r.points ?? 0}
                                                </span>
                                                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.35)" }}>
                                                    {r.totalLaps ?? "—"}
                                                </span>
                                                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
                                                    {r.gapFirst ? `+${r.gapFirst}` : (r.position === 1 ? r.time ?? "—" : "—")}
                                                </span>
                                                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>
                                                    {r.averageSpeed ? `${r.averageSpeed.toFixed(1)}` : "—"}
                                                </span>
                                            </div>
                                            {/* Sprint sub-row */}
                                            {sprint && (
                                                <div
                                                    style={{
                                                        display: "grid", gridTemplateColumns: "1fr 4rem 4rem 4rem 5rem 5rem",
                                                        alignItems: "center", padding: "8px 16px 12px 28px",
                                                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                                                        borderLeft: `3px solid ${color}44`,
                                                        backgroundColor: "rgba(255,255,255,0.01)",
                                                    }}
                                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.03)"}
                                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.01)"}
                                                >
                                                    <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-display)", letterSpacing: "0.1em" }}>
                                                        ↳ SPRINT
                                                    </div>
                                                    <span style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700, color: posColor(sprint.position) }}>
                                                        {sprint.status === "DNF" ? "DNF" : (sprint.position ?? "—")}
                                                    </span>
                                                    <span style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700, color: (sprint.points ?? 0) > 0 ? "#fff" : "rgba(255,255,255,0.2)" }}>
                                                        {sprint.points ?? 0}
                                                    </span>
                                                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>
                                                        {sprint.totalLaps ?? "—"}
                                                    </span>
                                                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
                                                        {sprint.gapFirst ? `+${sprint.gapFirst}` : (sprint.position === 1 ? sprint.time ?? "—" : "—")}
                                                    </span>
                                                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>
                                                        {sprint.averageSpeed ? `${sprint.averageSpeed.toFixed(1)}` : "—"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
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
                            CAREER STATISTICS
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem", marginBottom: "24px" }}>
                            All-time MotoGP World Championship record
                        </p>

                        {/* Career totals */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: "20px",
                            padding: "16px 20px", marginBottom: "28px",
                            backgroundColor: "rgba(245,200,66,0.06)",
                            border: "1px solid rgba(245,200,66,0.15)",
                            borderLeft: "3px solid #F5C842",
                            flexWrap: "wrap",
                        }}>
                            {[
                                { label: "Championships", value: careerTotals.championships, color: "#F5C842" },
                                { label: "Seasons", value: careerTotals.seasons, color: "#ffffff" },
                                { label: "Wins", value: careerTotals.wins, color: "#ffffff" },
                                { label: "Podiums", value: careerTotals.podiums, color: "#C0C0C0" },
                                { label: "Sprint Wins", value: careerTotals.sprintWins, color: MOTOGP_RED },
                                { label: "Points", value: Math.round(careerTotals.points), color: "#ffffff" },
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

                        {/* Season-by-season table */}
                        {careerHistory.length === 0 ? (
                            <div style={{ padding: "60px 16px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>
                                    NO CAREER DATA AVAILABLE
                                </p>
                            </div>
                        ) : (
                            <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "5rem 4rem 1fr 5rem 6rem 6rem 5rem", padding: "10px 16px", backgroundColor: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                    {["Season", "Class", "Constructor", "Pos", "Points", "Wins", "POD"].map(h => (
                                        <span key={h} style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
                                            {h}
                                        </span>
                                    ))}
                                </div>
                                {careerHistory.map(ch => {
                                    const c = getConstructorColor(ch.constructorName ?? "")
                                    const isChamp = ch.position === 1
                                    return (
                                        <div
                                            key={`${ch.year}-${ch.category}`}
                                            style={{
                                                display: "grid", gridTemplateColumns: "5rem 4rem 1fr 5rem 6rem 6rem 5rem",
                                                alignItems: "center", padding: "13px 16px",
                                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                                                backgroundColor: isChamp ? "rgba(245,200,66,0.05)" : "transparent",
                                                transition: "background-color 0.15s",
                                            }}
                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)"}
                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = isChamp ? "rgba(245,200,66,0.05)" : "transparent"}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, color: isChamp ? "#F5C842" : "#ffffff" }}>
                                                    {ch.year}
                                                </span>
                                                {isChamp && <span style={{ fontSize: "0.75rem" }}>🏆</span>}
                                            </div>
                                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em" }}>
                                                {ch.category.replace("™", "")}
                                            </span>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <div style={{ width: "3px", height: "14px", background: c, flexShrink: 0 }} />
                                                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>
                                                    {ch.constructorName ?? "—"}
                                                </span>
                                            </div>
                                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: posColor(ch.position) }}>
                                                {posOrdinal(ch.position)}
                                            </span>
                                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: "#ffffff" }}>
                                                {Math.round(ch.points)}
                                            </span>
                                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: ch.raceWins > 0 ? "#F5C842" : "rgba(255,255,255,0.2)" }}>
                                                {ch.raceWins}
                                            </span>
                                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: ch.podiums > 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)" }}>
                                                {ch.podiums}
                                            </span>
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