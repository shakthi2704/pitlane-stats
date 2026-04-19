"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Loader from "@/components/layout/Loader"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Competition {
    id: number
    code: string
    name: string
    shortName: string | null
    emblemUrl: string | null
    type: string
}

interface Season {
    id: number
    year: number
    currentMatchday: number | null
    startDate: string | null
    endDate: string | null
}

interface Team {
    id: number
    name: string
    shortName: string | null
    tla: string | null
    crestUrl: string | null
}

interface Standing {
    position: number
    team: Team
    playedGames: number
    won: number
    draw: number
    lost: number
    points: number
    goalsFor: number
    goalsAgainst: number
    goalDiff: number
    form: string | null
}

interface Match {
    id: number
    utcDate: string
    status: string
    matchday: number | null
    homeTeam: Team
    awayTeam: Team
    scoreFullHome: number | null
    scoreFullAway: number | null
    winner: string | null
}

interface Scorer {
    position: number | null
    goals: number
    assists: number | null
    penalties: number | null
    playedMatches: number | null
    player: {
        id: number
        name: string
        nationality: string | null
        position: string | null
    }
    team: {
        id: number
        name: string
        shortName: string | null
        crestUrl: string | null
    } | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (utcDate: string) => {
    const d = new Date(utcDate)
    return d.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
    })
}

const formatTime = (utcDate: string) => {
    const d = new Date(utcDate)
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

const formColor = (result: string) => {
    if (result === "W") return "#00B04F"
    if (result === "L") return "#e53e3e"
    return "rgba(255,255,255,0.2)"
}

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({
    title,
    linkHref,
    linkLabel,
}: {
    title: string
    linkHref?: string
    linkLabel?: string
}) => (
    <div
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
        }}
    >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
                style={{
                    width: "4px",
                    height: "28px",
                    backgroundColor: "var(--accent)",
                    flexShrink: 0,
                }}
            />
            <h2
                style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                    fontWeight: 400,
                    color: "#ffffff",
                    margin: 0,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                }}
            >
                {title}
            </h2>
        </div>
        {linkHref && linkLabel && (
            <Link
                href={linkHref}
                style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    textDecoration: "none",
                    border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                    padding: "4px 10px",
                }}
            >
                {linkLabel} →
            </Link>
        )}
    </div>
)

// ─── Standings Preview ────────────────────────────────────────────────────────

const StandingsPreview = ({
    standings,
    code,
    hasStandings,
}: {
    standings: Standing[]
    code: string
    hasStandings: boolean
}) => {
    if (!hasStandings) {
        return (
            <div
                style={{
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderTop: "3px solid var(--accent)",
                    padding: "40px",
                    textAlign: "center",
                }}
            >
                <p
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.2)",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        margin: 0,
                    }}
                >
                    No standings available
                </p>
            </div>
        )
    }

    return (
        <div
            style={{
                border: "1px solid rgba(255,255,255,0.07)",
                borderTop: "3px solid var(--accent)",
            }}
        >
            {/* Table header */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "2rem 1fr 2.5rem 2.5rem 2.5rem 2.5rem 2.5rem 3rem",
                    padding: "8px 16px",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    gap: "4px",
                }}
            >
                {["#", "Club", "P", "W", "D", "L", "GD", "PTS"].map((h, i) => (
                    <span
                        key={i}
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "9px",
                            fontWeight: 600,
                            letterSpacing: "0.15em",
                            color: "rgba(255,255,255,0.25)",
                            textAlign: i > 1 ? "center" : undefined,
                        }}
                    >
                        {h}
                    </span>
                ))}
            </div>

            {/* Rows — top 6 only */}
            {standings.slice(0, 8).map((s) => (
                <Link
                    key={s.team.id}
                    href={`/sports/football/teams/${s.team.id}`}
                    style={{ textDecoration: "none", display: "block" }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "2rem 1fr 2.5rem 2.5rem 2.5rem 2.5rem 2.5rem 3rem",
                            padding: "10px 16px",
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            alignItems: "center",
                            gap: "4px",
                            cursor: "pointer",
                            transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "transparent")
                        }
                    >
                        {/* Position */}
                        <span
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                color: s.position <= 4
                                    ? "var(--accent)"
                                    : "rgba(255,255,255,0.5)",
                            }}
                        >
                            {s.position}
                        </span>

                        {/* Club */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                            {s.team.crestUrl && (
                                <img
                                    src={s.team.crestUrl}
                                    alt={s.team.name}
                                    style={{ width: "20px", height: "20px", objectFit: "contain", flexShrink: 0 }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                                />
                            )}
                            <span
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "0.82rem",
                                    color: "#ffffff",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {s.team.shortName ?? s.team.name}
                            </span>
                        </div>

                        {/* Stats */}
                        {[s.playedGames, s.won, s.draw, s.lost, s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff].map((val, i) => (
                            <span
                                key={i}
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "0.8rem",
                                    color: "rgba(255,255,255,0.45)",
                                    textAlign: "center",
                                }}
                            >
                                {val}
                            </span>
                        ))}

                        {/* Points */}
                        <span
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "0.9rem",
                                fontWeight: 700,
                                color: "#ffffff",
                                textAlign: "center",
                            }}
                        >
                            {s.points}
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    )
}

// ─── Match Row ────────────────────────────────────────────────────────────────

const MatchRow = ({ match, code }: { match: Match; code: string }) => {
    const isFinished = match.status === "FINISHED"
    const date = formatDate(match.utcDate)
    const time = formatTime(match.utcDate)

    return (
        <Link
            href={`/sports/football/${code}/matches/${match.id}`}
            style={{ textDecoration: "none", display: "block" }}
        >
            <div
                style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                }
            >
                {/* Row 1: Date · status · matchday */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        marginBottom: "8px",
                    }}
                >
                    <span
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "10px",
                            color: "rgba(255,255,255,0.4)",
                            letterSpacing: "0.06em",
                        }}
                    >
                        {date}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "10px" }}>·</span>
                    <span
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "10px",
                            color: isFinished ? "var(--accent)" : "rgba(255,255,255,0.3)",
                            letterSpacing: "0.06em",
                        }}
                    >
                        {isFinished ? "FT" : time}
                    </span>
                    {match.matchday && (
                        <>
                            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "10px" }}>·</span>
                            <span
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "9px",
                                    color: "rgba(255,255,255,0.2)",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                MD {match.matchday}
                            </span>
                        </>
                    )}
                </div>

                {/* Row 2: Home · Score · Away */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    {/* Home team */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            justifyContent: "flex-end",
                            minWidth: 0,
                        }}
                    >
                        <span
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "0.82rem",
                                color: match.winner === "HOME_TEAM" ? "#ffffff" : "rgba(255,255,255,0.6)",
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
                                style={{ width: "22px", height: "22px", objectFit: "contain", flexShrink: 0 }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                            />
                        )}
                    </div>

                    {/* Score / vs */}
                    <div
                        style={{
                            textAlign: "center",
                            minWidth: "60px",
                            padding: "4px 10px",
                            backgroundColor: isFinished ? "rgba(255,255,255,0.05)" : "transparent",
                            border: "1px solid rgba(255,255,255,0.08)",
                        }}
                    >
                        <span
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "0.9rem",
                                fontWeight: 700,
                                color: isFinished ? "#ffffff" : "rgba(255,255,255,0.25)",
                                letterSpacing: "0.08em",
                            }}
                        >
                            {isFinished
                                ? `${match.scoreFullHome} - ${match.scoreFullAway}`
                                : "vs"}
                        </span>
                    </div>

                    {/* Away team */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            minWidth: 0,
                        }}
                    >
                        {match.awayTeam.crestUrl && (
                            <img
                                src={match.awayTeam.crestUrl}
                                alt={match.awayTeam.name}
                                style={{ width: "22px", height: "22px", objectFit: "contain", flexShrink: 0 }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                            />
                        )}
                        <span
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "0.82rem",
                                color: match.winner === "AWAY_TEAM" ? "#ffffff" : "rgba(255,255,255,0.6)",
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
            </div>
        </Link>
    )
}

// ─── Scorers Preview ─────────────────────────────────────────────────────────

const ScorersPreview = ({ scorers, code }: { scorers: Scorer[]; code: string }) => (
    <div
        style={{
            border: "1px solid rgba(255,255,255,0.07)",
            borderTop: "3px solid var(--accent)",
        }}
    >
        {/* Header row */}
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "2rem 1fr 6rem 3.5rem 3.5rem 3.5rem",
                padding: "8px 16px",
                backgroundColor: "rgba(255,255,255,0.03)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                gap: "4px",
            }}
        >
            {["#", "Player", "Club", "G", "A", "P"].map((h, i) => (
                <span
                    key={i}
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "9px",
                        fontWeight: 600,
                        letterSpacing: "0.15em",
                        color: "rgba(255,255,255,0.25)",
                        textAlign: i > 1 ? "center" : undefined,
                    }}
                >
                    {h}
                </span>
            ))}
        </div>

        {scorers.length === 0 ? (
            <p
                style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.2)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "24px 16px",
                    margin: 0,
                    textAlign: "center",
                }}
            >
                No scorer data available
            </p>
        ) : (
            scorers.map((s, i) => (
                <Link
                    key={s.player.id}
                    href={`/sports/football/players/${s.player.id}`}
                    style={{ textDecoration: "none", display: "block" }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "2rem 1fr 6rem 3.5rem 3.5rem 3.5rem",
                            padding: "10px 16px",
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            alignItems: "center",
                            gap: "4px",
                            cursor: "pointer",
                            transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "transparent")
                        }
                    >
                        {/* Rank */}
                        <span
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                color: i < 3 ? "var(--accent)" : "rgba(255,255,255,0.35)",
                            }}
                        >
                            {i + 1}
                        </span>

                        {/* Player name */}
                        <span
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "0.82rem",
                                color: "#ffffff",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {s.player.name}
                        </span>

                        {/* Club with crest */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                            {s.team?.crestUrl && (
                                <img
                                    src={s.team.crestUrl}
                                    alt={s.team.name}
                                    style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: 0 }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                                />
                            )}
                            <span
                                style={{
                                    fontSize: "0.72rem",
                                    color: "rgba(255,255,255,0.35)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {s.team?.shortName ?? s.team?.name ?? "—"}
                            </span>
                        </div>

                        {/* Goals */}
                        <span
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "0.9rem",
                                fontWeight: 700,
                                color: "#ffffff",
                                textAlign: "center",
                            }}
                        >
                            {s.goals}
                        </span>

                        {/* Assists */}
                        <span
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "0.82rem",
                                color: "rgba(255,255,255,0.45)",
                                textAlign: "center",
                            }}
                        >
                            {s.assists ?? "—"}
                        </span>

                        {/* Penalties */}
                        <span
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "0.82rem",
                                color: "rgba(255,255,255,0.3)",
                                textAlign: "center",
                            }}
                        >
                            {s.penalties ?? "—"}
                        </span>
                    </div>
                </Link>
            ))
        )}
    </div>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompetitionOverviewPage() {
    const params = useParams()
    const code = (params.code as string).toUpperCase()

    const [loading, setLoading] = useState(true)
    const [competition, setCompetition] = useState<Competition | null>(null)
    const [season, setSeason] = useState<Season | null>(null)
    const [standings, setStandings] = useState<Standing[]>([])
    const [recentMatches, setRecentMatches] = useState<Match[]>([])
    const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([])
    const [scorers, setScorers] = useState<Scorer[]>([])

    useEffect(() => {
        if (!code) return
        setLoading(true)

        Promise.all([
            fetch(`/api/football/standings?competition=${code}&type=TOTAL`).then((r) => r.json()),
            fetch(`/api/football/matches?competition=${code}&status=FINISHED&limit=5`).then((r) => r.json()),
            fetch(`/api/football/matches?competition=${code}&status=TIMED&limit=3`).then((r) => r.json()),
            fetch(`/api/football/scorers?competition=${code}&limit=5`).then((r) => r.json()),
        ])
            .then(([standingsData, recentData, upcomingData, scorersData]) => {
                setCompetition(standingsData.competition ?? recentData.competition ?? null)
                setSeason(standingsData.season ?? recentData.season ?? null)
                const raw: Standing[] = standingsData.standings ?? []
                const seen = new Set<number>()
                const deduped = raw.filter(s => { if (seen.has(s.team.id)) return false; seen.add(s.team.id); return true })
                setStandings(deduped)

                // Recent = last 5 finished, most recent first
                const finished: Match[] = recentData.matches ?? []
                setRecentMatches([...finished].reverse().slice(0, 5))

                setUpcomingMatches(upcomingData.matches ?? [])
                setScorers(scorersData.scorers ?? [])
            })
            .catch((err) => console.error("[Football] overview:", err))
            .finally(() => setLoading(false))
    }, [code])

    if (loading) return <Loader message={`LOADING ${code}...`} />

    const hasStandings = standings.length > 0

    return (
        <div>
            {/* ── Competition Header ── */}
            <div
                style={{
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    backgroundColor: "#0a0a0a",
                }}
            >
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        {/* Emblem */}
                        {competition?.emblemUrl && (
                            <img
                                src={competition.emblemUrl}
                                alt={competition.name}
                                style={{ width: "64px", height: "64px", objectFit: "contain" }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                            />
                        )}

                        <div style={{ flex: 1 }}>
                            <p
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    letterSpacing: "0.2em",
                                    textTransform: "uppercase",
                                    color: "var(--accent)",
                                    margin: "0 0 6px",
                                }}
                            >
                                {/* {season?.year ?? ""} Season */}
                                {season?.year ? `${season.year}/${String(season.year + 1).slice(2)} Season` : ""}
                            </p>
                            <h1
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "clamp(1.8rem, 4vw, 3rem)",
                                    fontWeight: 400,
                                    color: "#ffffff",
                                    margin: "0 0 6px",
                                    lineHeight: 1,
                                    letterSpacing: "-0.01em",
                                }}
                            >
                                {competition?.name?.toUpperCase() ?? code}
                            </h1>
                            {season?.currentMatchday && (
                                <p
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: "0.8rem",
                                        color: "rgba(255,255,255,0.35)",
                                        margin: 0,
                                        letterSpacing: "0.06em",
                                    }}
                                >
                                    Matchday {season.currentMatchday}
                                </p>
                            )}
                        </div>

                        {/* Quick nav pills */}
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {[
                                { label: "Standings", href: `/sports/football/${code}/standings` },
                                { label: "Matches", href: `/sports/football/${code}/matches` },
                                { label: "Scorers", href: `/sports/football/${code}/scorers` },
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: "10px",
                                        fontWeight: 600,
                                        letterSpacing: "0.12em",
                                        textTransform: "uppercase",
                                        color: "rgba(255,255,255,0.5)",
                                        textDecoration: "none",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        padding: "6px 12px",
                                        transition: "color 0.2s, border-color 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        const el = e.currentTarget as HTMLElement
                                        el.style.color = "#ffffff"
                                        el.style.borderColor = "var(--accent)"
                                    }}
                                    onMouseLeave={(e) => {
                                        const el = e.currentTarget as HTMLElement
                                        el.style.color = "rgba(255,255,255,0.5)"
                                        el.style.borderColor = "rgba(255,255,255,0.1)"
                                    }}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 380px",
                        gap: "32px",
                        alignItems: "start",
                    }}
                >
                    {/* ── Left: Standings Preview ── */}
                    <div>
                        <SectionHeader
                            title="Standings"
                            linkHref={`/sports/football/${code}/standings`}
                            linkLabel="Full Table"
                        />
                        <StandingsPreview
                            standings={standings}
                            code={code}
                            hasStandings={hasStandings}
                        />
                        <div style={{ marginTop: "32px" }}>
                            <SectionHeader
                                title="Top Scorers"
                                linkHref={`/sports/football/${code}/scorers`}
                                linkLabel="Full List"
                            />
                            <ScorersPreview scorers={scorers} code={code} />
                        </div>
                    </div>

                    {/* ── Right: Matches ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                        {/* Recent Results */}
                        <div>
                            <SectionHeader
                                title="Recent Results"
                                linkHref={`/sports/football/${code}/matches`}
                                linkLabel="All Matches"
                            />
                            <div
                                style={{
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    borderTop: "3px solid var(--accent)",
                                }}
                            >
                                {recentMatches.length === 0 ? (
                                    <p
                                        style={{
                                            fontFamily: "var(--font-display)",
                                            fontSize: "10px",
                                            color: "rgba(255,255,255,0.2)",
                                            letterSpacing: "0.12em",
                                            textTransform: "uppercase",
                                            padding: "24px 16px",
                                            margin: 0,
                                            textAlign: "center",
                                        }}
                                    >
                                        No results yet
                                    </p>
                                ) : (
                                    recentMatches.map((m) => (
                                        <MatchRow key={m.id} match={m} code={code} />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Upcoming Fixtures */}
                        <div>
                            <SectionHeader
                                title="Upcoming"
                                linkHref={`/sports/football/${code}/matches`}
                                linkLabel="Full Schedule"
                            />
                            <div
                                style={{
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    borderTop: "3px solid rgba(255,255,255,0.15)",
                                }}
                            >
                                {upcomingMatches.length === 0 ? (
                                    <p
                                        style={{
                                            fontFamily: "var(--font-display)",
                                            fontSize: "10px",
                                            color: "rgba(255,255,255,0.2)",
                                            letterSpacing: "0.12em",
                                            textTransform: "uppercase",
                                            padding: "24px 16px",
                                            margin: 0,
                                            textAlign: "center",
                                        }}
                                    >
                                        No upcoming fixtures
                                    </p>
                                ) : (
                                    upcomingMatches.map((m) => (
                                        <MatchRow key={m.id} match={m} code={code} />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Top Scorers Preview ── */}
            {/* <div className="max-w-7xl mx-auto px-6 pb-12">
                <SectionHeader
                    title="Top Scorers"
                    linkHref={`/sports/football/${code}/scorers`}
                    linkLabel="Full List"
                />
                <ScorersPreview scorers={scorers} code={code} />
            </div> */}
        </div>
    )
}