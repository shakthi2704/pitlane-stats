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
    stage: string
    group: string | null
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formColor = (result: string) => {
    if (result === "W") return "var(--accent)"
    if (result === "L") return "#e53e3e"
    return "rgba(255,255,255,0.15)"
}

// European spots — top 4 CL, 5th EL, 6th ECL, bottom 3 relegation (for leagues)
const getRowAccent = (position: number, total: number) => {
    if (position <= 4) return "var(--accent)"
    if (position === 5) return "#F97316"  // Europa League orange
    if (position === 6) return "#8B5CF6"  // ECL purple
    if (position > total - 3) return "#e53e3e" // relegation red
    return null
}

// ─── Standing Row ─────────────────────────────────────────────────────────────

const StandingRow = ({
    s,
    total,
    showForm,
}: {
    s: Standing
    total: number
    showForm: boolean
}) => {
    const accent = getRowAccent(s.position, total)
    const formArr = s.form ? s.form.split(",").filter(Boolean).slice(-5) : []

    return (
        <Link
            href={`/sports/football/teams/${s.team.id}`}
            style={{ textDecoration: "none", display: "block" }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: showForm
                        ? "2.5rem 1fr 3rem 3rem 3rem 3rem 3rem 3rem 6rem 3.5rem"
                        : "2.5rem 1fr 3rem 3rem 3rem 3rem 3rem 3rem 3.5rem",
                    padding: "11px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    alignItems: "center",
                    gap: "4px",
                    cursor: "pointer",
                    transition: "background-color 0.15s",
                    borderLeft: accent ? `2px solid ${accent}` : "2px solid transparent",
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
                        color: accent ?? "rgba(255,255,255,0.4)",
                        textAlign: "center",
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
                            style={{ width: "22px", height: "22px", objectFit: "contain", flexShrink: 0 }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                        />
                    )}
                    <div style={{ minWidth: 0 }}>
                        <span
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "0.85rem",
                                color: "#ffffff",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "block",
                            }}
                        >
                            {s.team.name}
                        </span>
                        {s.team.tla && (
                            <span
                                style={{
                                    fontSize: "0.68rem",
                                    color: "rgba(255,255,255,0.25)",
                                    fontFamily: "var(--font-display)",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                {s.team.tla}
                            </span>
                        )}
                    </div>
                </div>

                {/* P W D L GF GA GD */}
                {[
                    s.playedGames,
                    s.won,
                    s.draw,
                    s.lost,
                    s.goalsFor,
                    s.goalsAgainst,
                    s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff,
                ].map((val, i) => (
                    <span
                        key={i}
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.82rem",
                            color: i === 6
                                ? (s.goalDiff > 0
                                    ? "var(--accent)"
                                    : s.goalDiff < 0
                                        ? "#e53e3e"
                                        : "rgba(255,255,255,0.4)")
                                : "rgba(255,255,255,0.45)",
                            textAlign: "center",
                        }}
                    >
                        {val}
                    </span>
                ))}

                {/* Form */}
                {showForm && (
                    <div style={{ display: "flex", gap: "2px", justifyContent: "center" }}>
                        {formArr.length === 0
                            ? <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.15)" }}>—</span>
                            : formArr.map((r, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: "16px",
                                        height: "16px",
                                        backgroundColor: formColor(r),
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "8px",
                                        fontFamily: "var(--font-display)",
                                        fontWeight: 700,
                                        color: r === "D" ? "rgba(255,255,255,0.6)" : "#ffffff",
                                    }}
                                >
                                    {r}
                                </div>
                            ))
                        }
                    </div>
                )}

                {/* Points */}
                <span
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#ffffff",
                        textAlign: "center",
                    }}
                >
                    {s.points}
                </span>
            </div>
        </Link>
    )
}

// ─── Legend ───────────────────────────────────────────────────────────────────

const Legend = ({ type }: { type: string }) => {
    if (type !== "LEAGUE") return null
    return (
        <div
            style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                padding: "12px 16px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                backgroundColor: "rgba(255,255,255,0.02)",
            }}
        >
            {[
                { color: "var(--accent)", label: "UEFA Champions League" },
                { color: "#F97316", label: "UEFA Europa League" },
                { color: "#8B5CF6", label: "UEFA Conference League" },
                { color: "#e53e3e", label: "Relegation" },
            ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "10px", height: "10px", backgroundColor: item.color, flexShrink: 0 }} />
                    <span
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "9px",
                            color: "rgba(255,255,255,0.3)",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                        }}
                    >
                        {item.label}
                    </span>
                </div>
            ))}
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StandingsPage() {
    const params = useParams()
    const code = (params.code as string).toUpperCase()

    const [loading, setLoading] = useState(true)
    const [competition, setCompetition] = useState<Competition | null>(null)
    const [season, setSeason] = useState<Season | null>(null)
    const [standings, setStandings] = useState<Standing[]>([])
    const [viewType, setViewType] = useState<"TOTAL" | "HOME" | "AWAY">("TOTAL")
    const [groups, setGroups] = useState<string[]>([])

    useEffect(() => {
        setLoading(true)
        fetch(`/api/football/standings?competition=${code}&type=${viewType}`)
            .then((r) => r.json())
            .then((data) => {
                setCompetition(data.competition ?? null)
                setSeason(data.season ?? null)
                setGroups(data.groups ?? [])

                // Deduplicate by team id (keep first occurrence per team)
                const raw: Standing[] = data.standings ?? []
                const seen = new Set<number>()
                const deduped = raw.filter((s) => {
                    if (seen.has(s.team.id)) return false
                    seen.add(s.team.id)
                    return true
                })
                setStandings(deduped)
            })
            .catch((err) => console.error("[Football] standings:", err))
            .finally(() => setLoading(false))
    }, [code, viewType])

    const hasForm = standings.some((s) => s.form && s.form.length > 0)
    const hasGroups = groups.length > 1

    // Group standings by group label (for tournaments like WC/EC)
    const grouped = hasGroups
        ? groups.reduce<Record<string, Standing[]>>((acc, g) => {
            acc[g] = standings.filter((s) => s.group === g)
            return acc
        }, {})
        : { "": standings }

    return (
        <div>
            {/* ── Page Header ── */}
            <div
                style={{
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    backgroundColor: "#0a0a0a",
                }}
            >
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
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
                                <p
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: "11px",
                                        color: "var(--accent)",
                                        letterSpacing: "0.2em",
                                        textTransform: "uppercase",
                                        margin: "0 0 6px",
                                    }}
                                >
                                    {season?.year
                                        ? `${season.year}/${String(season.year + 1).slice(2)} Season`
                                        : ""}
                                </p>
                                <h1
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: "clamp(1.6rem, 4vw, 2.8rem)",
                                        fontWeight: 400,
                                        color: "#ffffff",
                                        margin: 0,
                                        lineHeight: 1,
                                        letterSpacing: "-0.01em",
                                    }}
                                >
                                    {competition?.name?.toUpperCase() ?? code} — STANDINGS
                                </h1>
                                {season?.currentMatchday && (
                                    <p style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", margin: "6px 0 0", letterSpacing: "0.06em" }}>
                                        Matchday {season.currentMatchday}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* TOTAL / HOME / AWAY toggle */}
                        <div style={{ display: "flex", gap: "0" }}>
                            {(["TOTAL", "HOME", "AWAY"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setViewType(t)}
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        letterSpacing: "0.12em",
                                        textTransform: "uppercase",
                                        padding: "8px 16px",
                                        cursor: "pointer",
                                        border: "1px solid",
                                        borderColor: viewType === t ? "var(--accent)" : "rgba(255,255,255,0.1)",
                                        backgroundColor: viewType === t ? "var(--accent)" : "transparent",
                                        color: viewType === t ? "#ffffff" : "rgba(255,255,255,0.4)",
                                        transition: "all 0.15s",
                                        marginLeft: "-1px",
                                    }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                {loading ? (
                    <Loader message="LOADING STANDINGS..." />
                ) : standings.length === 0 ? (
                    <div style={{ padding: "80px", textAlign: "center" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                            No standings available for this competition
                        </p>
                    </div>
                ) : (
                    Object.entries(grouped).map(([group, rows]) => (
                        <div key={group || "main"} style={{ marginBottom: hasGroups ? "40px" : "0" }}>
                            {/* Group label for tournaments */}
                            {hasGroups && group && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        marginBottom: "12px",
                                    }}
                                >
                                    <div style={{ width: "4px", height: "24px", backgroundColor: "var(--accent)" }} />
                                    <h2
                                        style={{
                                            fontFamily: "var(--font-display)",
                                            fontSize: "0.9rem",
                                            fontWeight: 400,
                                            color: "#ffffff",
                                            margin: 0,
                                            letterSpacing: "0.1em",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        Group {group}
                                    </h2>
                                </div>
                            )}

                            <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderTop: "3px solid var(--accent)" }}>
                                {/* Table header */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: hasForm
                                            ? "2.5rem 1fr 3rem 3rem 3rem 3rem 3rem 3rem 6rem 3.5rem"
                                            : "2.5rem 1fr 3rem 3rem 3rem 3rem 3rem 3rem 3.5rem",
                                        padding: "8px 16px",
                                        backgroundColor: "rgba(255,255,255,0.03)",
                                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                                        gap: "4px",
                                    }}
                                >
                                    {[
                                        "#", "Club", "P", "W", "D", "L", "GF", "GA", "GD",
                                        ...(hasForm ? ["Form"] : []),
                                        "PTS",
                                    ].map((h, i) => (
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

                                {/* Rows */}
                                {rows.map((s) => (
                                    <StandingRow
                                        key={s.team.id}
                                        s={s}
                                        total={rows.length}
                                        showForm={hasForm}
                                    />
                                ))}

                                {/* Legend */}
                                <Legend type={competition?.type ?? ""} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}