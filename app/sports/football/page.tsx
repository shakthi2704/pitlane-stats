"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Loader from "@/components/layout/Loader"

const ACCENT = "#00B04F"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CurrentSeason {
    id: number
    year: number
    startDate: string | null
    endDate: string | null
    currentMatchday: number | null
    _count: {
        matches: number
        standings: number
        scorers: number
    }
}

interface Competition {
    id: number
    code: string
    name: string
    shortName: string | null
    emblemUrl: string | null
    country: string | null
    countryCode: string | null
    type: string          // "LEAGUE" | "CUP" | "TOURNAMENT"
    plan: string          // "TIER_ONE" | "TIER_TWO"
    isCurrent: boolean
    currentSeason: CurrentSeason | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Football-data.org uses 3-letter codes — map to ISO 3166-1 alpha-2 for flag emoji
const CODE3_TO_ISO2: Record<string, string> = {
    ENG: "GB",
    ESP: "ES",
    GER: "DE",
    ITA: "IT",
    FRA: "FR",
    NLD: "NL",
    POR: "PT",
    BRA: "BR",
    SCO: "GB",
    NIR: "GB",
    WAL: "GB",
}

const getFlagEmoji = (code3: string | null): string => {
    if (!code3) return "🌍"
    const iso2 = CODE3_TO_ISO2[code3]
    if (!iso2) return "🌍"
    return iso2
        .toUpperCase()
        .replace(/./g, (c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
}

const SECTION_CONFIG: Record<string, { label: string; description: string }> = {
    LEAGUE: {
        label: "Leagues",
        description: "Domestic football leagues",
    },
    CUP: {
        label: "Cups",
        description: "Knockout & continental competitions",
    },
    TOURNAMENT: {
        label: "Tournaments",
        description: "International tournaments",
    },
}

// ─── Competition Card ─────────────────────────────────────────────────────────

const CompetitionCard = ({ competition: c }: { competition: Competition }) => {
    const [hovered, setHovered] = useState(false)
    const isActive = c.plan === "TIER_ONE"
    const season = c.currentSeason
    const flag = getFlagEmoji(c.countryCode)
    const matchday = season?.currentMatchday

    return (
        <Link
            href={isActive ? `/sports/football/${c.code}` : "#"}
            style={{ textDecoration: "none", display: "block" }}
            onClick={!isActive ? (e) => e.preventDefault() : undefined}
        >
            <div
                onMouseEnter={() => isActive && setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderTop: `3px solid ${isActive ? "var(--accent)" : "rgba(255,255,255,0.1)"}`,
                    backgroundColor: "#0f0f0f",
                    padding: "20px",
                    cursor: isActive ? "pointer" : "default",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    transform: hovered ? "translateY(-5px)" : "translateY(0)",
                    boxShadow: hovered
                        ? `0 8px 32px ${ACCENT}22`
                        : "none",
                    opacity: isActive ? 1 : 0.45,
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Coming Soon badge */}
                {!isActive && (
                    <div
                        style={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            fontFamily: "var(--font-display)",
                            fontSize: "9px",
                            fontWeight: 600,
                            letterSpacing: "0.15em",
                            color: "rgba(255,255,255,0.3)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            padding: "2px 8px",
                        }}
                    >
                        COMING SOON
                    </div>
                )}

                {/* Emblem + flag row */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "14px",
                    }}
                >
                    {/* Emblem */}
                    <div
                        style={{
                            width: "44px",
                            height: "44px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        {c.emblemUrl ? (
                            <img
                                src={c.emblemUrl}
                                alt={c.name}
                                style={{
                                    width: "44px",
                                    height: "44px",
                                    objectFit: "contain",
                                    filter: !isActive ? "grayscale(1)" : undefined,
                                }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none"
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: "44px",
                                    height: "44px",
                                    backgroundColor: `${ACCENT}20`,
                                    border: `1px solid ${ACCENT}40`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontFamily: "var(--font-display)",
                                    fontSize: "11px",
                                    color: ACCENT,
                                }}
                            >
                                {c.code}
                            </div>
                        )}
                    </div>

                    {/* Flag */}
                    <span style={{ fontSize: "1.4rem" }}>{flag}</span>
                </div>

                {/* Name */}
                <p
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.95rem",
                        fontWeight: 400,
                        color: "#ffffff",
                        margin: "0 0 4px",
                        letterSpacing: "0.02em",
                        lineHeight: 1.2,
                    }}
                >
                    {c.name}
                </p>

                {/* Country */}
                <p
                    style={{
                        fontSize: "0.72rem",
                        color: "rgba(255,255,255,0.35)",
                        margin: "0 0 14px",
                        fontFamily: "var(--font-display)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                    }}
                >
                    {c.country ?? "International"}
                </p>

                {/* Season stats */}
                {season && isActive ? (
                    <div
                        style={{
                            display: "flex",
                            gap: "16px",
                            paddingTop: "12px",
                            borderTop: "1px solid rgba(255,255,255,0.05)",
                        }}
                    >
                        {matchday && (
                            <div>
                                <p
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: "1rem",
                                        fontWeight: 700,
                                        color: ACCENT,
                                        margin: 0,
                                        lineHeight: 1,
                                    }}
                                >
                                    MD {matchday}
                                </p>
                                <p
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: "9px",
                                        color: "rgba(255,255,255,0.25)",
                                        letterSpacing: "0.12em",
                                        margin: "3px 0 0",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    Current
                                </p>
                            </div>
                        )}
                        <div>
                            <p
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "1rem",
                                    fontWeight: 700,
                                    color: "#ffffff",
                                    margin: 0,
                                    lineHeight: 1,
                                }}
                            >
                                {season._count.matches}
                            </p>
                            <p
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "9px",
                                    color: "rgba(255,255,255,0.25)",
                                    letterSpacing: "0.12em",
                                    margin: "3px 0 0",
                                    textTransform: "uppercase",
                                }}
                            >
                                Matches
                            </p>
                        </div>
                        <div>
                            <p
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "1rem",
                                    fontWeight: 700,
                                    color: "#ffffff",
                                    margin: 0,
                                    lineHeight: 1,
                                }}
                            >
                                {season._count.standings}
                            </p>
                            <p
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "9px",
                                    color: "rgba(255,255,255,0.25)",
                                    letterSpacing: "0.12em",
                                    margin: "3px 0 0",
                                    textTransform: "uppercase",
                                }}
                            >
                                Teams
                            </p>
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            paddingTop: "12px",
                            borderTop: "1px solid rgba(255,255,255,0.05)",
                        }}
                    >
                        <p
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "9px",
                                color: "rgba(255,255,255,0.2)",
                                letterSpacing: "0.12em",
                                margin: 0,
                                textTransform: "uppercase",
                            }}
                        >
                            {c.type === "TOURNAMENT" && !season
                                ? "No active season"
                                : "No data yet"}
                        </p>
                    </div>
                )}
            </div>
        </Link>
    )
}

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ type }: { type: string }) => {
    const config = SECTION_CONFIG[type] ?? { label: type, description: "" }
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "20px",
            }}
        >
            <div
                style={{
                    width: "4px",
                    height: "32px",
                    backgroundColor: ACCENT,
                    flexShrink: 0,
                }}
            />
            <div>
                <h2
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.1rem",
                        fontWeight: 400,
                        color: "#ffffff",
                        margin: 0,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                    }}
                >
                    {config.label}
                </h2>
                <p
                    style={{
                        fontSize: "0.72rem",
                        color: "rgba(255,255,255,0.3)",
                        margin: 0,
                        fontFamily: "var(--font-display)",
                        letterSpacing: "0.08em",
                    }}
                >
                    {config.description}
                </p>
            </div>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FootballPage() {
    const [competitions, setCompetitions] = useState<Competition[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/football/competitions")
            .then((r) => r.json())
            .then((data) => setCompetitions(data.competitions ?? []))
            .catch((err) => console.error("[Football] competitions:", err))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <Loader message="LOADING FOOTBALL..." />

    const order: Competition["type"][] = ["LEAGUE", "CUP", "TOURNAMENT"]
    const grouped = order.reduce<Record<string, Competition[]>>((acc, type) => {
        const items = competitions.filter((c) => c.type === type)
        if (items.length > 0) acc[type] = items
        return acc
    }, {})

    const totalActive = competitions.filter((c) => c.plan === "TIER_ONE").length

    return (
        <div>
            {/* ── Hero ── */}
            <div
                style={{
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    backgroundColor: "#0a0a0a",
                }}
            >
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <p
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: ACCENT,
                            marginBottom: "10px",
                        }}
                    >
                        PitLane Stats
                    </p>
                    <h1
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
                            fontWeight: 400,
                            color: "#ffffff",
                            margin: "0 0 12px",
                            lineHeight: 1,
                            letterSpacing: "-0.01em",
                        }}
                    >
                        FOOTBALL
                    </h1>
                    <p
                        style={{
                            color: "rgba(255,255,255,0.35)",
                            fontSize: "0.9rem",
                            margin: 0,
                            fontFamily: "var(--font-display)",
                            letterSpacing: "0.04em",
                        }}
                    >
                        {totalActive} competitions — standings, fixtures & top scorers
                    </p>
                </div>
            </div>

            {/* ── Competition Sections ── */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {Object.entries(grouped).map(([type, items]) => (
                    <section key={type} style={{ marginBottom: "52px" }}>
                        <SectionHeader type={type} />
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                                gap: "1px",
                                backgroundColor: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.04)",
                            }}
                        >
                            {items.map((c) => (
                                <div key={c.code} style={{ backgroundColor: "#0a0a0a" }}>
                                    <CompetitionCard competition={c} />
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {competitions.length === 0 && (
                    <div style={{ padding: "80px", textAlign: "center" }}>
                        <p
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "11px",
                                color: "rgba(255,255,255,0.2)",
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                            }}
                        >
                            No competitions found — run the seed sync first
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}