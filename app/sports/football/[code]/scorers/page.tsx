"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Loader from "@/components/layout/Loader"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Competition {
    code: string
    name: string
    emblemUrl: string | null
}

interface Season {
    id: number
    year: number
    currentMatchday: number | null
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
        firstName: string | null
        lastName: string | null
        nationality: string | null
        position: string | null
        dateOfBirth: string | null
    }
    team: {
        id: number
        name: string
        shortName: string | null
        tla: string | null
        crestUrl: string | null
    } | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getFlagEmoji = (nationality: string | null): string => {
    if (!nationality) return ""
    // Common nationality → ISO2 map
    const map: Record<string, string> = {
        "England": "GB", "Spain": "ES", "Germany": "DE", "France": "FR",
        "Italy": "IT", "Portugal": "PT", "Brazil": "BR", "Argentina": "AR",
        "Netherlands": "NL", "Belgium": "BE", "Poland": "PL", "Norway": "NO",
        "Sweden": "SE", "Denmark": "DK", "Switzerland": "CH", "Austria": "AT",
        "Croatia": "HR", "Serbia": "RS", "Morocco": "MA", "Senegal": "SN",
        "Nigeria": "NG", "Ghana": "GH", "Ivory Coast": "CI", "Colombia": "CO",
        "Uruguay": "UY", "Mexico": "MX", "Japan": "JP", "South Korea": "KR",
        "Australia": "AU", "United States": "US", "Canada": "CA",
        "Czech Republic": "CZ", "Slovakia": "SK", "Hungary": "HU",
        "Romania": "RO", "Ukraine": "UA", "Russia": "RU", "Turkey": "TR",
        "Greece": "GR", "Scotland": "GB", "Wales": "GB", "Ireland": "IE",
        "Ecuador": "EC", "Chile": "CL", "Peru": "PE", "Venezuela": "VE",
        "Paraguay": "PY", "Bolivia": "BO", "Algeria": "DZ", "Tunisia": "TN",
        "Cameroon": "CM", "Egypt": "EG", "South Africa": "ZA",
    }
    const iso2 = map[nationality]
    if (!iso2) return ""
    return iso2.toUpperCase().replace(/./g, (c) =>
        String.fromCodePoint(c.charCodeAt(0) + 127397)
    )
}

const MEDAL = ["🥇", "🥈", "🥉"]

// Generate a consistent color from a name string
const nameToColor = (name: string): string => {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 55%, 38%)`
}

const getInitials = (name: string): string => {
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const PlayerAvatar = ({ name, photoUrl, size = 72 }: { name: string; photoUrl?: string | null; size?: number }) => {
    const color = nameToColor(name)
    const initials = getInitials(name)
    if (photoUrl) {
        return (
            <img
                src={photoUrl}
                alt={name}
                style={{
                    width: size, height: size, borderRadius: "50%",
                    objectFit: "cover", objectPosition: "top",
                    border: `2px solid ${color}`,
                }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
            />
        )
    }
    return (
        <div
            style={{
                width: size, height: size, borderRadius: "50%",
                backgroundColor: color,
                border: `2px solid ${color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
            }}
        >
            <span style={{
                fontFamily: "var(--font-display)",
                fontSize: size * 0.32,
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "0.05em",
            }}>
                {initials}
            </span>
        </div>
    )
}

// ─── Top 3 Podium ─────────────────────────────────────────────────────────────

const TopThree = ({ scorers }: { scorers: Scorer[] }) => {
    const top = scorers.slice(0, 3)
    if (top.length === 0) return null

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1px",
                marginBottom: "32px",
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderTop: "3px solid var(--accent)",
            }}
        >
            {top.map((s, i) => (
                <Link
                    key={s.player.id}
                    href={`/sports/football/players/${s.player.id}`}
                    style={{ textDecoration: "none" }}
                >
                    <div
                        style={{
                            backgroundColor: "#0f0f0f",
                            padding: "24px 20px",
                            textAlign: "center",
                            cursor: "pointer",
                            transition: "background-color 0.15s",
                            height: "100%",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#0f0f0f")
                        }
                    >
                        {/* Avatar */}
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                            <PlayerAvatar name={s.player.name} size={i === 0 ? 80 : 64} />
                        </div>

                        {/* Medal */}
                        <div style={{ fontSize: "1.6rem", marginBottom: "6px" }}>
                            {MEDAL[i]}
                        </div>

                        {/* Goals — big number */}
                        <div
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: i === 0 ? "3.5rem" : "2.8rem",
                                fontWeight: 700,
                                color: i === 0 ? "var(--accent)" : "#ffffff",
                                lineHeight: 1,
                                marginBottom: "4px",
                            }}
                        >
                            {s.goals}
                        </div>
                        <div
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "9px",
                                color: "rgba(255,255,255,0.25)",
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                                marginBottom: "12px",
                            }}
                        >
                            Goals
                        </div>

                        {/* Player name */}
                        <p
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "0.9rem",
                                fontWeight: 400,
                                color: "#ffffff",
                                margin: "0 0 4px",
                                letterSpacing: "0.04em",
                            }}
                        >
                            {getFlagEmoji(s.player.nationality)} {s.player.name}
                        </p>

                        {/* Club */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                            {s.team?.crestUrl && (
                                <img
                                    src={s.team.crestUrl}
                                    alt={s.team.name}
                                    style={{ width: "16px", height: "16px", objectFit: "contain" }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                                />
                            )}
                            <span
                                style={{
                                    fontSize: "0.72rem",
                                    color: "rgba(255,255,255,0.35)",
                                    fontFamily: "var(--font-display)",
                                    letterSpacing: "0.06em",
                                }}
                            >
                                {s.team?.shortName ?? s.team?.name ?? "—"}
                            </span>
                        </div>

                        {/* Assists + penalties */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: "16px",
                                marginTop: "12px",
                                paddingTop: "12px",
                                borderTop: "1px solid rgba(255,255,255,0.06)",
                            }}
                        >
                            {[
                                { label: "Ast", value: s.assists ?? 0 },
                                { label: "Pen", value: s.penalties ?? 0 },
                            ].map((stat) => (
                                <div key={stat.label}>
                                    <p style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1 }}>
                                        {stat.value}
                                    </p>
                                    <p style={{ fontFamily: "var(--font-display)", fontSize: "8px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "3px 0 0" }}>
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}

// ─── Table Row ────────────────────────────────────────────────────────────────

const ScorerRow = ({ s, rank }: { s: Scorer; rank: number }) => (
    <Link
        href={`/sports/football/players/${s.player.id}`}
        style={{ textDecoration: "none", display: "block" }}
    >
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "2.5rem 1fr 7rem 3.5rem 3.5rem 3.5rem 3.5rem",
                padding: "11px 16px",
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
                    color: rank <= 3 ? "var(--accent)" : "rgba(255,255,255,0.3)",
                    textAlign: "center",
                }}
            >
                {rank}
            </span>

            {/* Player */}
            <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "13px" }}>{getFlagEmoji(s.player.nationality)}</span>
                    <span
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.85rem",
                            color: "#ffffff",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {s.player.name}
                    </span>
                </div>
                <span
                    style={{
                        fontSize: "0.68rem",
                        color: "rgba(255,255,255,0.25)",
                        fontFamily: "var(--font-display)",
                        letterSpacing: "0.06em",
                    }}
                >
                    {s.player.position ?? "—"}
                </span>
            </div>

            {/* Club */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                {s.team?.crestUrl && (
                    <img
                        src={s.team.crestUrl}
                        alt={s.team.name}
                        style={{ width: "18px", height: "18px", objectFit: "contain", flexShrink: 0 }}
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
                    fontSize: "1rem",
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
                    fontSize: "0.85rem",
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

            {/* Matches played */}
            <span
                style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.2)",
                    textAlign: "center",
                }}
            >
                {s.playedMatches ?? "—"}
            </span>
        </div>
    </Link>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScorersPage() {
    const params = useParams()
    const code = (params.code as string).toUpperCase()

    const [loading, setLoading] = useState(true)
    const [competition, setCompetition] = useState<Competition | null>(null)
    const [season, setSeason] = useState<Season | null>(null)
    const [scorers, setScorers] = useState<Scorer[]>([])

    useEffect(() => {
        if (!code) return
        setLoading(true)

        fetch(`/api/football/scorers?competition=${code}&limit=50`)
            .then((r) => r.json())
            .then((data) => {
                setCompetition(data.competition ?? null)
                setSeason(data.season ?? null)
                setScorers(data.scorers ?? [])
            })
            .catch((err) => console.error("[Football] scorers:", err))
            .finally(() => setLoading(false))
    }, [code])

    if (loading) return <Loader message={`LOADING ${code} SCORERS...`} />

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
                                {competition?.name?.toUpperCase() ?? code} — TOP SCORERS
                            </h1>
                            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", margin: "6px 0 0", letterSpacing: "0.06em" }}>
                                {scorers.length} players
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
                {scorers.length === 0 ? (
                    <div style={{ padding: "80px", textAlign: "center" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                            No scorer data available
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Top 3 podium */}
                        <TopThree scorers={scorers} />

                        {/* Full table — from rank 4 onward */}
                        <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderTop: "3px solid var(--accent)" }}>
                            {/* Header */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "2.5rem 1fr 7rem 3.5rem 3.5rem 3.5rem 3.5rem",
                                    padding: "8px 16px",
                                    backgroundColor: "rgba(255,255,255,0.03)",
                                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                                    gap: "4px",
                                }}
                            >
                                {["#", "Player", "Club", "G", "A", "P", "MP"].map((h, i) => (
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

                            {/* Rows — all 50 */}
                            {scorers.map((s, i) => (
                                <ScorerRow key={s.player.id} s={s} rank={i + 1} />
                            ))}
                        </div>

                        {/* Footer note */}
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "9px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em", textAlign: "center", marginTop: "20px", textTransform: "uppercase" }}>
                            G = Goals · A = Assists · P = Penalties · MP = Matches Played
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}