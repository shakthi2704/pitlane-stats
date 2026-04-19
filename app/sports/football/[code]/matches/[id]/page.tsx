"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Loader from "@/components/layout/Loader"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Team {
    id: number
    name: string
    shortName: string | null
    tla: string | null
    crestUrl: string | null
    country: string | null
}

interface MatchEvent {
    id: number
    minute: number | null
    extraMinute: number | null
    type: string        // "GOAL" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION" | "YELLOW_RED_CARD"
    detail: string | null
    teamSide: string | null  // "HOME" | "AWAY"
    playerName: string | null
    assistName: string | null
    player: {
        id: number
        name: string
        position: string | null
        shirtNumber: number | null
    } | null
}

interface Score {
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
    extraTime: { home: number | null; away: number | null }
    penalties: { home: number | null; away: number | null }
    winner: string | null
}

interface Match {
    id: number
    utcDate: string
    status: string
    matchday: number | null
    stage: string
    group: string | null
    refereeName: string | null
    score: Score
    homeTeam: Team
    awayTeam: Team
    events: MatchEvent[]
    homeEvents: MatchEvent[]
    awayEvents: MatchEvent[]
    competition: {
        id: number
        code: string
        name: string
        emblemUrl: string | null
    }
    season: { id: number; year: number }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDateTime = (utcDate: string) =>
    new Date(utcDate).toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    })

const formatTime = (utcDate: string) =>
    new Date(utcDate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

const minuteLabel = (e: MatchEvent) => {
    if (e.minute === null) return ""
    return e.extraMinute ? `${e.minute}+${e.extraMinute}'` : `${e.minute}'`
}

// Event icon + color
const EVENT_CONFIG: Record<string, { icon: string; color: string }> = {
    GOAL: { icon: "⚽", color: "var(--accent)" },
    OWN_GOAL: { icon: "⚽", color: "#e53e3e" },
    PENALTY: { icon: "⚽", color: "var(--accent)" },
    MISSED_PENALTY: { icon: "✗", color: "#e53e3e" },
    YELLOW_CARD: { icon: "🟨", color: "#f59e0b" },
    RED_CARD: { icon: "🟥", color: "#e53e3e" },
    YELLOW_RED_CARD: { icon: "🟥", color: "#f59e0b" },
    SUBSTITUTION: { icon: "↕", color: "rgba(255,255,255,0.4)" },
}

const getEventConfig = (type: string, detail: string | null) => {
    if (type === "GOAL") {
        if (detail === "Own Goal") return EVENT_CONFIG.OWN_GOAL
        if (detail === "Penalty") return EVENT_CONFIG.PENALTY
    }
    if (type === "YELLOW_RED_CARD") return EVENT_CONFIG.YELLOW_RED_CARD
    return EVENT_CONFIG[type] ?? { icon: "•", color: "rgba(255,255,255,0.3)" }
}

// ─── Score Header ─────────────────────────────────────────────────────────────

const ScoreHeader = ({ match }: { match: Match }) => {
    const isFinished = match.status === "FINISHED"
    const isLive = match.status === "IN_PLAY" || match.status === "PAUSED"
    const { score } = match

    return (
        <div
            style={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                backgroundColor: "#0a0a0a",
            }}
        >
            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Competition breadcrumb */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
                    {match.competition.emblemUrl && (
                        <img
                            src={match.competition.emblemUrl}
                            alt={match.competition.name}
                            style={{ width: "20px", height: "20px", objectFit: "contain" }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                        />
                    )}
                    <Link
                        href={`/sports/football/${match.competition.code}`}
                        style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "var(--accent)", letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none" }}
                    >
                        {match.competition.name}
                    </Link>
                    <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>·</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
                        {match.matchday ? `Matchday ${match.matchday}` : match.stage}
                    </span>
                    {isLive && (
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "10px", color: "#f59e0b", letterSpacing: "0.15em", border: "1px solid #f59e0b40", padding: "2px 8px" }}>
                            LIVE
                        </span>
                    )}
                </div>

                {/* Teams + Score */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        alignItems: "center",
                        gap: "24px",
                    }}
                >
                    {/* Home team */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                        {match.homeTeam.crestUrl && (
                            <img
                                src={match.homeTeam.crestUrl}
                                alt={match.homeTeam.name}
                                style={{ width: "72px", height: "72px", objectFit: "contain" }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                            />
                        )}
                        <h2
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "clamp(1rem, 2.5vw, 1.6rem)",
                                fontWeight: score.winner === "HOME_TEAM" ? 700 : 400,
                                color: score.winner === "HOME_TEAM" ? "#ffffff" : "rgba(255,255,255,0.7)",
                                margin: 0,
                                textAlign: "right",
                                letterSpacing: "0.02em",
                            }}
                        >
                            {match.homeTeam.name}
                        </h2>
                    </div>

                    {/* Score block */}
                    <div style={{ textAlign: "center", minWidth: "140px" }}>
                        {isFinished || isLive ? (
                            <>
                                <div
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: "clamp(2.5rem, 6vw, 4rem)",
                                        fontWeight: 700,
                                        color: isLive ? "#f59e0b" : "#ffffff",
                                        lineHeight: 1,
                                        letterSpacing: "0.05em",
                                    }}
                                >
                                    {score.fullTime.home ?? 0} — {score.fullTime.away ?? 0}
                                </div>
                                <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "2px" }}>
                                    {isFinished && (
                                        <span style={{ fontFamily: "var(--font-display)", fontSize: "10px", color: "var(--accent)", letterSpacing: "0.2em" }}>
                                            FULL TIME
                                        </span>
                                    )}
                                    {score.halfTime.home !== null && (
                                        <span style={{ fontFamily: "var(--font-display)", fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
                                            HT: {score.halfTime.home} — {score.halfTime.away}
                                        </span>
                                    )}
                                    {score.extraTime.home !== null && (
                                        <span style={{ fontFamily: "var(--font-display)", fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
                                            AET: {score.extraTime.home} — {score.extraTime.away}
                                        </span>
                                    )}
                                    {score.penalties.home !== null && (
                                        <span style={{ fontFamily: "var(--font-display)", fontSize: "10px", color: "#f59e0b", letterSpacing: "0.1em" }}>
                                            PEN: {score.penalties.home} — {score.penalties.away}
                                        </span>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
                                    vs
                                </div>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
                                    {formatTime(match.utcDate)}
                                </div>
                            </>
                        )}

                        {/* Date */}
                        <div style={{ marginTop: "8px", fontFamily: "var(--font-display)", fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>
                            {formatDateTime(match.utcDate)}
                        </div>
                    </div>

                    {/* Away team */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
                        {match.awayTeam.crestUrl && (
                            <img
                                src={match.awayTeam.crestUrl}
                                alt={match.awayTeam.name}
                                style={{ width: "72px", height: "72px", objectFit: "contain" }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                            />
                        )}
                        <h2
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "clamp(1rem, 2.5vw, 1.6rem)",
                                fontWeight: score.winner === "AWAY_TEAM" ? 700 : 400,
                                color: score.winner === "AWAY_TEAM" ? "#ffffff" : "rgba(255,255,255,0.7)",
                                margin: 0,
                                textAlign: "left",
                                letterSpacing: "0.02em",
                            }}
                        >
                            {match.awayTeam.name}
                        </h2>
                    </div>
                </div>

                {/* Referee */}
                {match.refereeName && (
                    <p style={{ fontFamily: "var(--font-display)", fontSize: "10px", color: "rgba(255,255,255,0.2)", textAlign: "center", margin: "16px 0 0", letterSpacing: "0.1em" }}>
                        Referee: {match.refereeName}
                    </p>
                )}
            </div>
        </div>
    )
}

// ─── Events Timeline ──────────────────────────────────────────────────────────

const EventRow = ({ event, side }: { event: MatchEvent; side: "home" | "away" }) => {
    const cfg = getEventConfig(event.type, event.detail)
    const isHome = side === "home"
    const name = event.playerName ?? event.player?.name ?? "Unknown"
    const isGoal = event.type === "GOAL"
    const isSub = event.type === "SUBSTITUTION"

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 60px 1fr",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.03)",
            }}
        >
            {/* Home side content */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", paddingRight: "12px" }}>
                {isHome && (
                    <>
                        <div style={{ textAlign: "right", minWidth: 0 }}>
                            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.82rem", color: isGoal ? "#ffffff" : "rgba(255,255,255,0.6)", fontWeight: isGoal ? 700 : 400, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {isSub ? `↑ ${name}` : name}
                            </p>
                            {event.assistName && (
                                <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", margin: "1px 0 0", fontFamily: "var(--font-display)" }}>
                                    Ast: {event.assistName}
                                </p>
                            )}
                            {isSub && event.assistName && (
                                <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", margin: "1px 0 0", fontFamily: "var(--font-display)" }}>
                                    ↓ {event.assistName}
                                </p>
                            )}
                            {event.detail && event.detail !== "Normal Goal" && !isSub && (
                                <p style={{ fontSize: "0.68rem", color: cfg.color, margin: "1px 0 0", fontFamily: "var(--font-display)", letterSpacing: "0.06em" }}>
                                    {event.detail}
                                </p>
                            )}
                        </div>
                        <span style={{ fontSize: "1rem", flexShrink: 0 }}>{cfg.icon}</span>
                    </>
                )}
            </div>

            {/* Minute — center */}
            <div style={{ textAlign: "center" }}>
                <span
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: isGoal ? cfg.color : "rgba(255,255,255,0.3)",
                        letterSpacing: "0.06em",
                    }}
                >
                    {minuteLabel(event)}
                </span>
            </div>

            {/* Away side content */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "12px" }}>
                {!isHome && (
                    <>
                        <span style={{ fontSize: "1rem", flexShrink: 0 }}>{cfg.icon}</span>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.82rem", color: isGoal ? "#ffffff" : "rgba(255,255,255,0.6)", fontWeight: isGoal ? 700 : 400, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {isSub ? `↑ ${name}` : name}
                            </p>
                            {event.assistName && !isSub && (
                                <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", margin: "1px 0 0", fontFamily: "var(--font-display)" }}>
                                    Ast: {event.assistName}
                                </p>
                            )}
                            {isSub && event.assistName && (
                                <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", margin: "1px 0 0", fontFamily: "var(--font-display)" }}>
                                    ↓ {event.assistName}
                                </p>
                            )}
                            {event.detail && event.detail !== "Normal Goal" && !isSub && (
                                <p style={{ fontSize: "0.68rem", color: cfg.color, margin: "1px 0 0", fontFamily: "var(--font-display)", letterSpacing: "0.06em" }}>
                                    {event.detail}
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

const EventsTimeline = ({ match }: { match: Match }) => {
    const hasEvents = match.events.length > 0

    // Separate goals from other events for the summary
    const goals = match.events.filter((e) => e.type === "GOAL")
    const cards = match.events.filter((e) => e.type === "YELLOW_CARD" || e.type === "RED_CARD" || e.type === "YELLOW_RED_CARD")
    const subs = match.events.filter((e) => e.type === "SUBSTITUTION")

    return (
        <div>
            {/* Stats summary bar */}
            {hasEvents && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "1px",
                        marginBottom: "24px",
                        border: "1px solid rgba(255,255,255,0.07)",
                        backgroundColor: "rgba(255,255,255,0.04)",
                    }}
                >
                    {[
                        { label: "Goals", home: match.homeEvents.filter(e => e.type === "GOAL").length, away: match.awayEvents.filter(e => e.type === "GOAL").length, icon: "⚽" },
                        { label: "Yellow Cards", home: match.homeEvents.filter(e => e.type === "YELLOW_CARD").length, away: match.awayEvents.filter(e => e.type === "YELLOW_CARD").length, icon: "🟨" },
                        { label: "Red Cards", home: match.homeEvents.filter(e => e.type === "RED_CARD" || e.type === "YELLOW_RED_CARD").length, away: match.awayEvents.filter(e => e.type === "RED_CARD" || e.type === "YELLOW_RED_CARD").length, icon: "🟥" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            style={{
                                backgroundColor: "#0f0f0f",
                                padding: "14px 16px",
                                display: "grid",
                                gridTemplateColumns: "1fr auto 1fr",
                                alignItems: "center",
                                gap: "8px",
                                textAlign: "center",
                            }}
                        >
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", textAlign: "right" }}>{stat.home}</span>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                                <span style={{ fontSize: "1rem" }}>{stat.icon}</span>
                                <span style={{ fontFamily: "var(--font-display)", fontSize: "8px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{stat.label}</span>
                            </div>
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", textAlign: "left" }}>{stat.away}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Timeline */}
            <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderTop: "3px solid var(--accent)" }}>
                {/* Header */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 60px 1fr",
                        padding: "10px 0",
                        backgroundColor: "rgba(255,255,255,0.03)",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "right", paddingRight: "12px" }}>
                        {match.homeTeam.shortName ?? match.homeTeam.name}
                    </span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textAlign: "center" }}>MIN</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", paddingLeft: "12px" }}>
                        {match.awayTeam.shortName ?? match.awayTeam.name}
                    </span>
                </div>

                {!hasEvents ? (
                    <div style={{ padding: "40px", textAlign: "center" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>
                            {match.status === "FINISHED"
                                ? "No event data available for this match"
                                : "Events will appear here during the match"}
                        </p>
                    </div>
                ) : (
                    <div style={{ padding: "0 16px" }}>
                        {/* First half */}
                        {match.events.filter(e => (e.minute ?? 0) <= 45).length > 0 && (
                            <>
                                <div style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <span style={{ fontFamily: "var(--font-display)", fontSize: "9px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.15em", textTransform: "uppercase" }}>First Half</span>
                                </div>
                                {match.events
                                    .filter(e => (e.minute ?? 0) <= 45)
                                    .map((e) => (
                                        <EventRow key={e.id} event={e} side={e.teamSide === "HOME" ? "home" : "away"} />
                                    ))}
                            </>
                        )}

                        {/* Second half */}
                        {match.events.filter(e => (e.minute ?? 0) > 45 && (e.minute ?? 0) <= 90).length > 0 && (
                            <>
                                <div style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", marginTop: "4px" }}>
                                    <span style={{ fontFamily: "var(--font-display)", fontSize: "9px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Second Half</span>
                                </div>
                                {match.events
                                    .filter(e => (e.minute ?? 0) > 45 && (e.minute ?? 0) <= 90)
                                    .map((e) => (
                                        <EventRow key={e.id} event={e} side={e.teamSide === "HOME" ? "home" : "away"} />
                                    ))}
                            </>
                        )}

                        {/* Extra time */}
                        {match.events.filter(e => (e.minute ?? 0) > 90).length > 0 && (
                            <>
                                <div style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", marginTop: "4px" }}>
                                    <span style={{ fontFamily: "var(--font-display)", fontSize: "9px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Extra Time</span>
                                </div>
                                {match.events
                                    .filter(e => (e.minute ?? 0) > 90)
                                    .map((e) => (
                                        <EventRow key={e.id} event={e} side={e.teamSide === "HOME" ? "home" : "away"} />
                                    ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MatchDetailPage() {
    const params = useParams()
    const code = (params.code as string).toUpperCase()
    const id = params.id as string

    const [loading, setLoading] = useState(true)
    const [match, setMatch] = useState<Match | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return
        setLoading(true)

        fetch(`/api/football/matches/${id}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.error) setError(data.error)
                else setMatch(data.match)
            })
            .catch((err) => {
                console.error("[Football] match detail:", err)
                setError("Failed to load match")
            })
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <Loader message="LOADING MATCH..." />

    if (error || !match) {
        return (
            <div style={{ padding: "80px", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                    {error ?? "Match not found"}
                </p>
                <Link
                    href={`/sports/football/${code}/matches`}
                    style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "var(--accent)", letterSpacing: "0.1em", textDecoration: "none", display: "block", marginTop: "16px" }}
                >
                    ← Back to Matches
                </Link>
            </div>
        )
    }

    return (
        <div>
            <ScoreHeader match={match} />

            <div className="max-w-7xl mx-auto px-6 py-10">
                <EventsTimeline match={match} />

                {/* Back link */}
                <div style={{ marginTop: "32px", textAlign: "center" }}>
                    <Link
                        href={`/sports/football/${code}/matches`}
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "11px",
                            color: "rgba(255,255,255,0.3)",
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            textDecoration: "none",
                            border: "1px solid rgba(255,255,255,0.08)",
                            padding: "8px 20px",
                            transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                    >
                        ← All Matches
                    </Link>
                </div>
            </div>
        </div>
    )
}