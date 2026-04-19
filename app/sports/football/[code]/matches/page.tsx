"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Loader from "@/components/layout/Loader"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Competition {
    code: string
    name: string
    emblemUrl: string | null
    type: string
}

interface Season {
    id: number
    year: number
    currentMatchday: number | null
}

interface Team {
    id: number
    name: string
    shortName: string | null
    tla: string | null
    crestUrl: string | null
}

interface Match {
    id: number
    utcDate: string
    status: string
    matchday: number | null
    stage: string
    homeTeam: Team
    awayTeam: Team
    scoreFullHome: number | null
    scoreFullAway: number | null
    scoreHalfHome: number | null
    scoreHalfAway: number | null
    winner: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (utcDate: string) =>
    new Date(utcDate).toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
    })

const formatTime = (utcDate: string) =>
    new Date(utcDate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

const STATUS_LABEL: Record<string, string> = {
    FINISHED: "FT",
    IN_PLAY: "LIVE",
    PAUSED: "HT",
    TIMED: "",
    SCHEDULED: "",
    POSTPONED: "PPD",
    CANCELLED: "CAN",
    SUSPENDED: "SUS",
}

// Group matches by date string
const groupByDate = (matches: Match[]) => {
    const groups: Record<string, Match[]> = {}
    for (const m of matches) {
        const key = formatDate(m.utcDate)
        if (!groups[key]) groups[key] = []
        groups[key].push(m)
    }
    return groups
}

// ─── Match Card ───────────────────────────────────────────────────────────────

const MatchCard = ({ match, code }: { match: Match; code: string }) => {
    const isFinished = match.status === "FINISHED"
    const isLive = match.status === "IN_PLAY" || match.status === "PAUSED"
    const time = formatTime(match.utcDate)
    const statusLabel = STATUS_LABEL[match.status] ?? match.status

    return (
        <Link
            href={`/sports/football/${code}/matches/${match.id}`}
            style={{ textDecoration: "none", display: "block" }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 120px 1fr",
                    alignItems: "center",
                    padding: "14px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    gap: "12px",
                    cursor: "pointer",
                    transition: "background-color 0.15s",
                    borderLeft: isLive ? "2px solid #f59e0b" : "2px solid transparent",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                }
            >
                {/* Home team */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-end", minWidth: 0 }}>
                    <span
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.88rem",
                            color: match.winner === "HOME_TEAM" ? "#ffffff" : "rgba(255,255,255,0.65)",
                            fontWeight: match.winner === "HOME_TEAM" ? 700 : 400,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {match.homeTeam.shortName ?? match.homeTeam.name}
                    </span>
                    {match.homeTeam.crestUrl && (
                        <img
                            src={match.homeTeam.crestUrl}
                            alt={match.homeTeam.name}
                            style={{ width: "26px", height: "26px", objectFit: "contain", flexShrink: 0 }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                        />
                    )}
                </div>

                {/* Score / time block */}
                <div style={{ textAlign: "center" }}>
                    {isFinished ? (
                        <>
                            <div
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "1.3rem",
                                    fontWeight: 700,
                                    color: "#ffffff",
                                    letterSpacing: "0.05em",
                                    lineHeight: 1,
                                }}
                            >
                                {match.scoreFullHome} — {match.scoreFullAway}
                            </div>
                            <div
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "9px",
                                    color: "var(--accent)",
                                    letterSpacing: "0.15em",
                                    marginTop: "4px",
                                }}
                            >
                                FT
                                {match.scoreHalfHome !== null && (
                                    <span style={{ color: "rgba(255,255,255,0.25)", marginLeft: "6px" }}>
                                        ({match.scoreHalfHome}–{match.scoreHalfAway})
                                    </span>
                                )}
                            </div>
                        </>
                    ) : isLive ? (
                        <>
                            <div
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "1.3rem",
                                    fontWeight: 700,
                                    color: "#f59e0b",
                                    letterSpacing: "0.05em",
                                    lineHeight: 1,
                                }}
                            >
                                {match.scoreFullHome ?? 0} — {match.scoreFullAway ?? 0}
                            </div>
                            <div
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "9px",
                                    color: "#f59e0b",
                                    letterSpacing: "0.15em",
                                    marginTop: "4px",
                                }}
                            >
                                {statusLabel}
                            </div>
                        </>
                    ) : (
                        <>
                            <div
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "1.1rem",
                                    fontWeight: 400,
                                    color: "rgba(255,255,255,0.25)",
                                    letterSpacing: "0.1em",
                                    lineHeight: 1,
                                }}
                            >
                                vs
                            </div>
                            <div
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "11px",
                                    color: "rgba(255,255,255,0.45)",
                                    letterSpacing: "0.08em",
                                    marginTop: "4px",
                                }}
                            >
                                {statusLabel || time}
                            </div>
                        </>
                    )}
                </div>

                {/* Away team */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    {match.awayTeam.crestUrl && (
                        <img
                            src={match.awayTeam.crestUrl}
                            alt={match.awayTeam.name}
                            style={{ width: "26px", height: "26px", objectFit: "contain", flexShrink: 0 }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                        />
                    )}
                    <span
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.88rem",
                            color: match.winner === "AWAY_TEAM" ? "#ffffff" : "rgba(255,255,255,0.65)",
                            fontWeight: match.winner === "AWAY_TEAM" ? 700 : 400,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {match.awayTeam.shortName ?? match.awayTeam.name}
                    </span>
                </div>
            </div>
        </Link>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MatchesPage() {
    const params = useParams()
    const code = (params.code as string).toUpperCase()

    const [loading, setLoading] = useState(true)
    const [competition, setCompetition] = useState<Competition | null>(null)
    const [season, setSeason] = useState<Season | null>(null)
    const [matches, setMatches] = useState<Match[]>([])
    const [matchdays, setMatchdays] = useState<number[]>([])
    const [selectedMatchday, setSelectedMatchday] = useState<number | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Initial load — get matchdays list + current matchday matches
    useEffect(() => {
        if (!code) return
        setLoading(true)

        fetch(`/api/football/matches?competition=${code}&limit=10`)
            .then((r) => r.json())
            .then((data) => {
                setCompetition(data.competition ?? null)
                setSeason(data.season ?? null)
                setMatchdays(data.matchdays ?? [])

                const currentMD = data.season?.currentMatchday ?? null
                setSelectedMatchday(currentMD)
            })
            .catch((err) => console.error("[Football] matches init:", err))
            .finally(() => setLoading(false))
    }, [code])

    // Fetch matches when selected matchday changes
    useEffect(() => {
        if (!code || selectedMatchday === null) return

        fetch(`/api/football/matches?competition=${code}&matchday=${selectedMatchday}&limit=20`)
            .then((r) => r.json())
            .then((data) => setMatches(data.matches ?? []))
            .catch((err) => console.error("[Football] matches fetch:", err))
    }, [code, selectedMatchday])

    // Scroll selected matchday pill into view
    useEffect(() => {
        if (!scrollRef.current || selectedMatchday === null) return
        const btn = scrollRef.current.querySelector(`[data-md="${selectedMatchday}"]`) as HTMLElement
        btn?.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" })
    }, [matchdays, selectedMatchday])

    if (loading) return <Loader message={`LOADING ${code} MATCHES...`} />

    const grouped = groupByDate(matches)

    return (
        <div>
            {/* ── Header ── */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#0a0a0a" }}>
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        {competition?.emblemUrl && (
                            <img
                                src={competition.emblemUrl}
                                alt={competition.name}
                                style={{ width: "48px", height: "48px", objectFit: "contain" }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                            />
                        )}
                        <div>
                            <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "var(--accent)", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 6px" }}>
                                {season?.year ? `${season.year}/${String(season.year + 1).slice(2)} Season` : ""}
                            </p>
                            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 4vw, 2.8rem)", fontWeight: 400, color: "#ffffff", margin: 0, lineHeight: 1 }}>
                                {competition?.name?.toUpperCase() ?? code} — MATCHES
                            </h1>
                        </div>
                    </div>
                </div>

                {/* ── Matchday Selector ── */}
                {matchdays.length > 0 && (
                    <div
                        style={{
                            borderTop: "1px solid rgba(255,255,255,0.05)",
                            backgroundColor: "rgba(255,255,255,0.02)",
                        }}
                    >
                        <div className="max-w-7xl mx-auto px-6">
                            <div
                                ref={scrollRef}
                                style={{
                                    display: "flex",
                                    overflowX: "auto",
                                    scrollbarWidth: "none",
                                    gap: "2px",
                                    padding: "8px 0",
                                }}
                            >
                                {matchdays.map((md) => (
                                    <button
                                        key={md}
                                        data-md={md}
                                        onClick={() => setSelectedMatchday(md)}
                                        style={{
                                            flexShrink: 0,
                                            fontFamily: "var(--font-display)",
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            letterSpacing: "0.08em",
                                            padding: "6px 12px",
                                            cursor: "pointer",
                                            border: "1px solid",
                                            borderColor: selectedMatchday === md
                                                ? "var(--accent)"
                                                : "rgba(255,255,255,0.08)",
                                            backgroundColor: selectedMatchday === md
                                                ? "var(--accent)"
                                                : "transparent",
                                            color: selectedMatchday === md
                                                ? "#ffffff"
                                                : "rgba(255,255,255,0.35)",
                                            transition: "all 0.15s",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        MD {md}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Matches ── */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                {matches.length === 0 ? (
                    <div style={{ padding: "80px", textAlign: "center" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                            No matches for matchday {selectedMatchday}
                        </p>
                    </div>
                ) : (
                    <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderTop: "3px solid var(--accent)" }}>
                        {Object.entries(grouped).map(([date, dayMatches]) => (
                            <div key={date}>
                                {/* Date header */}
                                <div
                                    style={{
                                        padding: "8px 20px",
                                        backgroundColor: "rgba(255,255,255,0.03)",
                                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                    }}
                                >
                                    <div style={{ width: "3px", height: "14px", backgroundColor: "var(--accent)" }} />
                                    <span
                                        style={{
                                            fontFamily: "var(--font-display)",
                                            fontSize: "10px",
                                            fontWeight: 600,
                                            letterSpacing: "0.15em",
                                            color: "rgba(255,255,255,0.5)",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {date}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "var(--font-display)",
                                            fontSize: "9px",
                                            color: "rgba(255,255,255,0.2)",
                                            letterSpacing: "0.1em",
                                        }}
                                    >
                                        {dayMatches.length} {dayMatches.length === 1 ? "match" : "matches"}
                                    </span>
                                </div>

                                {/* Match cards for this date */}
                                {dayMatches.map((m) => (
                                    <MatchCard key={m.id} match={m} code={code} />
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}