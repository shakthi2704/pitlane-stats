"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import F1Loader from "@/components/f1/F1Loader"
import { getConstructorColor } from "@/components/motogp/MotoGPRiderStandings"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Rider {
    id: string
    fullName: string
    nationality?: string | null
    number?: number | null
    photoUrl?: string | null
}

interface Result {
    position?: number | null
    status?: string | null
    points?: number | null
    time?: string | null
    gapFirst?: string | null
    gapPrev?: string | null
    totalLaps?: number | null
    averageSpeed?: number | null
    bestLapTime?: string | null
    topSpeed?: number | null
    rider: Rider
    team?: { id: string; name: string } | null
    constructor?: { id: string; name: string } | null
}

interface Session {
    id: string
    type: string
    sessionNumber?: number | null
    date?: string | null
    status?: string | null
    results: Result[]
}

interface Event {
    id: string
    name: string
    shortName: string
    sponsoredName?: string | null
    dateStart: string
    dateEnd: string
    status?: string | null
    circuit?: {
        name: string
        place?: string | null
        nation?: string | null
    } | null
    category?: { name: string } | null
    season?: { year: number } | null
    sessions: Session[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFlagEmoji(iso: string): string {
    if (!iso || iso.length !== 2) return "🏁"
    return iso.toUpperCase().replace(/./g, c =>
        String.fromCodePoint(c.charCodeAt(0) + 127397)
    )
}

const SESSION_LABELS: Record<string, string> = {
    FP: "Free Practice",
    PR: "Practice",
    Q: "Qualifying",
    SPR: "Sprint",
    WUP: "Warm Up",
    RAC: "Race",
}

function sessionLabel(s: Session): string {
    const base = SESSION_LABELS[s.type] ?? s.type
    if (s.sessionNumber && s.sessionNumber > 1) return `${base} ${s.sessionNumber}`
    return base
}

function sessionShortLabel(s: Session): string {
    if (s.sessionNumber && s.sessionNumber > 1) return `${s.type}${s.sessionNumber}`
    return s.type
}

const FALLBACK_PHOTO = "/F1/drivers/placeholder.svg"

const SESSION_ORDER = ["FP", "PR", "Q", "SPR", "WUP", "RAC"]

function sortSessions(sessions: Session[]): Session[] {
    return [...sessions].sort((a, b) => {
        const ai = SESSION_ORDER.indexOf(a.type)
        const bi = SESSION_ORDER.indexOf(b.type)
        if (ai !== bi) return ai - bi
        return (a.sessionNumber ?? 0) - (b.sessionNumber ?? 0)
    })
}

// ─── Podium Card ──────────────────────────────────────────────────────────────

const PodiumCard = ({ result, rank }: { result: Result; rank: number }) => {
    const color = getConstructorColor(result.constructor?.name ?? "")
    const photoUrl = result.rider.photoUrl ?? FALLBACK_PHOTO
    const nameParts = result.rider.fullName.split(" ")
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(" ")
    const heights = ["280px", "250px", "230px"]
    const medalColors = ["#F5C842", "#C0C0C0", "#CD7F32"]
    const labels = ["1ST", "2ND", "3RD"]

    return (
        <Link href={`/sports/motogp/riders/${result.rider.id}`} style={{ textDecoration: "none", flex: rank === 1 ? "1.2" : "1" }}>
            <div
                style={{
                    position: "relative", height: heights[rank - 1], overflow: "hidden",
                    cursor: "pointer", backgroundColor: color,
                    border: `1px solid ${color}66`,
                    alignSelf: "flex-end",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)" }}
            >
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85) 100%)" }} />

                {/* Rider photo */}
                <img
                    src={photoUrl}
                    alt={result.rider.fullName}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                    onError={e => { (e.target as HTMLImageElement).src = FALLBACK_PHOTO }}
                />

                {/* Medal + position */}
                <div style={{ position: "absolute", top: "10px", left: "10px" }}>
                    <div style={{
                        width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
                        backgroundColor: medalColors[rank - 1], fontFamily: "var(--font-display)",
                        fontSize: "11px", fontWeight: 800, color: "#000",
                    }}>
                        {labels[rank - 1]}
                    </div>
                </div>

                {/* Number */}
                {result.rider.number != null && (
                    <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                        <span style={{
                            fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 800,
                            color: "rgba(255,255,255,0.6)", backgroundColor: "rgba(0,0,0,0.5)", padding: "2px 6px",
                        }}>
                            #{result.rider.number}
                        </span>
                    </div>
                )}

                {/* Info overlay */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 14px 14px" }}>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.5)", margin: "0 0 2px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {result.constructor?.name}
                    </p>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 500, color: "rgba(255,255,255,0.35)", margin: "0 0 4px", textTransform: "uppercase" }}>
                        {firstName}
                    </p>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, color: "#fff", margin: "0 0 6px", lineHeight: 1, textTransform: "uppercase" }}>
                        {lastName}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {result.time && (
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>
                                {result.time}
                            </span>
                        )}
                        {result.points != null && (
                            <span style={{
                                fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700,
                                color: color, backgroundColor: `${color}22`, padding: "2px 6px",
                            }}>
                                +{result.points} PTS
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}

// ─── Results Table ────────────────────────────────────────────────────────────

const ResultsTable = ({ results, isRace }: { results: Result[]; isRace: boolean }) => {
    if (!results.length) return (
        <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em" }}>
                NO RESULTS AVAILABLE
            </p>
        </div>
    )

    return (
        <div style={{ overflowX: "auto" }}>
            {/* Header row */}
            <div style={{
                display: "grid",
                gridTemplateColumns: isRace
                    ? "3rem 2rem 1fr 6rem 6rem 5rem 5rem"
                    : "3rem 2rem 1fr 6rem 6rem",
                padding: "8px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}>
                {["POS", "#", "RIDER / TEAM", isRace ? "GAP" : "TIME", isRace ? "LAPS" : "GAP", ...(isRace ? ["SPEED", "PTS"] : [])].map(h => (
                    <span key={h} style={{
                        fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 600,
                        letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase",
                    }}>
                        {h}
                    </span>
                ))}
            </div>

            {results.map((r, i) => {
                const color = getConstructorColor(r.constructor?.name ?? "")
                const flag = getFlagEmoji(r.rider.nationality ?? "")
                const isRetired = r.status === "DNF" || r.status === "DNS" || r.status === "DSQ"
                const nameParts = r.rider.fullName.split(" ")
                const lastName = nameParts.slice(1).join(" ") || nameParts[0]

                return (
                    <Link
                        key={r.rider.id + i}
                        href={`/sports/motogp/riders/${r.rider.id}`}
                        style={{ textDecoration: "none", display: "block" }}
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: isRace
                                    ? "3rem 2rem 1fr 6rem 6rem 5rem 5rem"
                                    : "3rem 2rem 1fr 6rem 6rem",
                                alignItems: "center",
                                padding: "12px 16px",
                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                                borderLeft: `3px solid ${isRetired ? "rgba(255,255,255,0.1)" : color}`,
                                transition: "background-color 0.15s",
                                opacity: isRetired ? 0.5 : 1,
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.03)"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
                        >
                            {/* Position */}
                            <span style={{
                                fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 800,
                                color: i < 3 ? ["#F5C842", "#C0C0C0", "#CD7F32"][i] : "rgba(255,255,255,0.5)",
                            }}>
                                {isRetired ? r.status : (r.position ?? "—")}
                            </span>

                            {/* Number */}
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 700, color: color }}>
                                {r.rider.number ?? "—"}
                            </span>

                            {/* Rider */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                                <span style={{
                                    fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700,
                                    color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                }}>
                                    {flag} {lastName.toUpperCase()}
                                </span>
                                <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {r.team?.name ?? r.constructor?.name ?? "—"}
                                </span>
                            </div>

                            {/* Gap / Time */}
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", color: "rgba(255,255,255,0.55)" }}>
                                {isRace ? (r.gapFirst ? `+${r.gapFirst}` : (i === 0 ? r.time ?? "—" : "—")) : (r.time ?? "—")}
                            </span>

                            {/* Laps / Gap */}
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                                {isRace ? (r.totalLaps ?? "—") : (r.gapFirst ? `+${r.gapFirst}` : "—")}
                            </span>

                            {/* Race-only: speed */}
                            {isRace && (
                                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>
                                    {r.averageSpeed ? `${r.averageSpeed.toFixed(1)}` : "—"}
                                </span>
                            )}

                            {/* Race-only: points */}
                            {isRace && (
                                <span style={{
                                    fontFamily: "var(--font-display)", fontSize: "0.8rem", fontWeight: 700,
                                    color: r.points ? color : "rgba(255,255,255,0.2)",
                                }}>
                                    {r.points ?? "—"}
                                </span>
                            )}
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MotoGPRaceDetailPage() {
    const params = useParams()
    const id = params?.id as string

    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeSession, setActiveSession] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return
        fetch(`/api/motogp/events/${id}?sessions=all`)
            .then(r => r.json())
            .then(data => {
                const ev: Event = data.event
                if (ev) {
                    setEvent(ev)
                    // Only consider sessions that have results
                    const sorted = sortSessions(ev.sessions)
                    const withResults = sorted.filter(s => s.results.length > 0)
                    const rac = withResults.find(s => s.type === "RAC")
                    const spr = withResults.find(s => s.type === "SPR")
                    setActiveSession((rac ?? spr ?? withResults[0])?.id ?? null)
                }
            })
            .catch(err => console.error("[MotoGP] event detail:", err))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <F1Loader message="LOADING RACE DATA..." />
    if (!event) return (
        <div style={{ padding: "120px", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>EVENT NOT FOUND</p>
        </div>
    )

    const sorted = sortSessions(event.sessions).filter(s => s.results.length > 0)
    const currentSession = sorted.find(s => s.id === activeSession) ?? sorted[0]
    const isRace = currentSession?.type === "RAC" || currentSession?.type === "SPR"

    const raceSession = sorted.find(s => s.type === "RAC")
    const podium = raceSession?.results?.slice(0, 3) ?? []

    const flag = getFlagEmoji(event.circuit?.nation ?? "")

    // All sessions sorted for the schedule view (upcoming events)
    const allSessions = sortSessions(event.sessions)
    const isUpcoming = sorted.length === 0

    // Countdown to race day
    const raceDate = allSessions.find(s => s.type === "RAC")?.date ?? event.dateEnd
    const msUntilRace = new Date(raceDate).getTime() - Date.now()
    const daysUntil = Math.floor(msUntilRace / (1000 * 60 * 60 * 24))
    const hoursUntil = Math.floor((msUntilRace % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    return (
        <div>
            {/* Hero header */}
            <div style={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                padding: "48px 0 0",
                position: "relative", overflow: "hidden",
            }}>
                {/* Background flag */}
                <div style={{
                    position: "absolute", right: "5%", top: "50%", transform: "translateY(-50%)",
                    fontSize: "220px", opacity: 0.04, userSelect: "none", pointerEvents: "none",
                    filter: "blur(4px)",
                }}>
                    {flag}
                </div>

                <div className="max-w-7xl mx-auto px-6">
                    {/* Breadcrumb */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                        <Link href="/sports/motogp" style={{ textDecoration: "none" }}>
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", color: "var(--accent)", textTransform: "uppercase" }}>
                                MotoGP™
                            </span>
                        </Link>
                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px" }}>›</span>
                        <Link href="/sports/motogp/races" style={{ textDecoration: "none" }}>
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                                Calendar
                            </span>
                        </Link>
                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px" }}>›</span>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                            {event.shortName}
                        </span>
                    </div>

                    {/* Title */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "48px" }}>{flag}</span>
                        <div>
                            <p style={{
                                fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600,
                                letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "6px",
                            }}>
                                {event.season?.year} · {event.category?.name ?? "MotoGP™"}
                            </p>
                            <h1 style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
                                fontWeight: 800, color: "#ffffff",
                                margin: 0, lineHeight: 0.95, letterSpacing: "-0.02em",
                            }}>
                                {event.sponsoredName ?? event.name}
                            </h1>
                        </div>
                    </div>

                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", margin: "0 0 32px" }}>
                        {event.circuit?.name}
                        {event.circuit?.place ? ` · ${event.circuit.place}` : ""}
                        {event.circuit?.nation ? `, ${event.circuit.nation}` : ""}
                        {" · "}
                        {new Date(event.dateStart).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
                        {" – "}
                        {new Date(event.dateEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </p>

                    {/* Session tabs — only when results exist */}
                    {!isUpcoming && (
                        <div style={{ display: "flex", gap: "0", overflowX: "auto", scrollbarWidth: "none" }}>
                            {sorted.filter(s => s.results.length > 0).map(s => {
                                const isActive = s.id === activeSession
                                const hasResults = s.results.length > 0
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => setActiveSession(s.id)}
                                        style={{
                                            fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600,
                                            letterSpacing: "0.12em", textTransform: "uppercase",
                                            padding: "10px 16px", background: "none", border: "none", cursor: "pointer",
                                            whiteSpace: "nowrap", transition: "color 0.2s", marginBottom: "-1px",
                                            color: isActive ? "#ffffff" : hasResults ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)",
                                            borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                                            opacity: hasResults ? 1 : 0.5,
                                        }}
                                    >
                                        {sessionShortLabel(s)}
                                        {!hasResults && <span style={{ marginLeft: "4px", fontSize: "8px", opacity: 0.5 }}>–</span>}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* Upcoming: show "RACE WEEKEND" label in place of tabs */}
                    {isUpcoming && (
                        <div style={{ paddingBottom: "20px" }}>
                            <span style={{
                                fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600,
                                letterSpacing: "0.15em", textTransform: "uppercase",
                                color: "var(--accent)", borderBottom: "2px solid var(--accent)",
                                paddingBottom: "10px",
                            }}>
                                Race Weekend Schedule
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* ── UPCOMING EVENT VIEW ─────────────────────────────── */}
                {isUpcoming && (
                    <div>
                        {/* Countdown */}
                        {msUntilRace > 0 && (
                            <div style={{
                                display: "flex", alignItems: "center", gap: "1px",
                                marginBottom: "40px",
                            }}>
                                {[
                                    { value: daysUntil, label: "Days" },
                                    { value: hoursUntil, label: "Hours" },
                                ].map((unit, i) => (
                                    <div key={unit.label} style={{
                                        padding: "20px 32px",
                                        backgroundColor: i === 0
                                            ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                                            : "rgba(255,255,255,0.03)",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                        borderTop: i === 0 ? "2px solid var(--accent)" : "2px solid rgba(255,255,255,0.08)",
                                        textAlign: "center",
                                    }}>
                                        <div style={{ fontFamily: "var(--font-display)", fontSize: "3rem", fontWeight: 800, color: i === 0 ? "var(--accent)" : "#fff", lineHeight: 1 }}>
                                            {unit.value}
                                        </div>
                                        <div style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "6px" }}>
                                            {unit.label}
                                        </div>
                                    </div>
                                ))}
                                <div style={{ padding: "20px 32px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderTop: "2px solid rgba(255,255,255,0.08)" }}>
                                    <div style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>
                                        Until Race Day
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.25)", marginTop: "4px" }}>
                                        {new Date(raceDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Session schedule */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                            <div style={{ width: "4px", height: "22px", backgroundColor: "var(--accent" }} />
                            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                Weekend Schedule
                            </h2>
                        </div>

                        {allSessions.length === 0 ? (
                            <div style={{ padding: "48px 24px", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                                <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>
                                    SESSION SCHEDULE NOT YET AVAILABLE
                                </p>
                            </div>
                        ) : (
                            <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                                {/* Header */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 8rem 8rem", padding: "10px 16px", backgroundColor: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                    {["SESSION", "DATE", "TIME (LOCAL)"].map(h => (
                                        <span key={h} style={{ fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
                                            {h}
                                        </span>
                                    ))}
                                </div>
                                {allSessions.map(s => {
                                    const sessionDate = s.date ? new Date(s.date) : null
                                    const isRaceSession = s.type === "RAC"
                                    const isSprintSession = s.type === "SPR"
                                    const isPast = sessionDate ? sessionDate < new Date() : false
                                    return (
                                        <div
                                            key={s.id}
                                            style={{
                                                display: "grid", gridTemplateColumns: "1fr 8rem 8rem",
                                                alignItems: "center", padding: "14px 16px",
                                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                                                borderLeft: `3px solid ${isRaceSession
                                                    ? "var(--accent)"
                                                    : isSprintSession
                                                        ? "color-mix(in srgb, var(--accent) 50%, transparent)"
                                                        : "rgba(255,255,255,0.1)"
                                                    }`,
                                                opacity: isPast ? 0.45 : 1,
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <span style={{
                                                    fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: isRaceSession ? 800 : 600,
                                                    color: isRaceSession ? "#ffffff" : isSprintSession ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.65)",
                                                }}>
                                                    {sessionLabel(s)}
                                                </span>
                                                {isRaceSession && (
                                                    <span style={{
                                                        fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 700,
                                                        letterSpacing: "0.1em", color: "#fff",
                                                        backgroundColor: "var(--accent)", padding: "2px 8px",
                                                    }}>
                                                        RACE
                                                    </span>
                                                )}
                                                {isSprintSession && (
                                                    <span style={{
                                                        fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 700,
                                                        letterSpacing: "0.1em", color: "var(--accent)",
                                                        border: "1px solid color-mix(in srgb, var(--accent) 40%, transparent)",
                                                        padding: "2px 8px",
                                                    }}>
                                                        SPRINT
                                                    </span>
                                                )}
                                                {isPast && (
                                                    <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-display)", letterSpacing: "0.08em" }}>
                                                        COMPLETE
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", color: "rgba(255,255,255,0.45)" }}>
                                                {sessionDate ? sessionDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) : "—"}
                                            </span>
                                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", color: "rgba(255,255,255,0.45)" }}>
                                                {sessionDate ? sessionDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Results pending notice */}
                        <div
                            style={{
                                marginTop: "24px",
                                padding: "16px 20px",
                                border: "1px solid rgba(255,255,255,0.06)",
                                borderLeft: "3px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                                backgroundColor: "rgba(255,255,255,0.01)",
                            }}
                        >
                            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
                                🏁 Race results will appear here once the event is completed
                            </p>
                        </div>
                    </div>
                )}

                {/* ── RESULTS VIEW ────────────────────────────────────── */}
                {!isUpcoming && (<>
                    {currentSession?.type === "RAC" && podium.length > 0 && (
                        <div style={{ marginBottom: "40px" }}>
                            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "300px" }}>
                                {/* Reorder to P2 / P1 / P3 */}
                                {[
                                    { data: podium[1], rank: 2 },
                                    { data: podium[0], rank: 1 },
                                    { data: podium[2], rank: 3 },
                                ].filter(x => x.data).map(({ data, rank }) => (
                                    <PodiumCard key={data.rider.id} result={data} rank={rank} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Session label */}
                    {currentSession && (
                        <div style={{ marginBottom: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "4px", height: "24px", backgroundColor: "var(--accent)" }} />
                                <h2 style={{
                                    fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700,
                                    color: "#ffffff", margin: 0, letterSpacing: "0.05em", textTransform: "uppercase",
                                }}>
                                    {sessionLabel(currentSession)}
                                </h2>
                                {currentSession.date && (
                                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
                                        {new Date(currentSession.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                                    </span>
                                )}
                                <span style={{
                                    fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 600,
                                    letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)",
                                    border: "1px solid rgba(255,255,255,0.1)", padding: "2px 8px",
                                }}>
                                    {currentSession.results.length} RIDERS
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Results panel */}
                    <div style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        {currentSession && (
                            <ResultsTable results={currentSession.results} isRace={isRace} />
                        )}
                    </div>
                </>)}
            </div>
        </div>
    )
}