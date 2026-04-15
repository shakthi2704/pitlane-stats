"use client"

import { useState } from "react"
import Link from "next/link"
import { getTeamColor } from "@/types/f1/f1-api"
import {
    TEAM_CARS,
    TEAM_LOGOS,
    FALLBACK_CAR,
    FALLBACK_LOGO,
} from "@/lib/f1/f1-constants"
import type { ConstructorStanding } from "@/types/f1"


const TopConstructorCard = ({
    standing,
    rank,
}: {
    standing: ConstructorStanding
    rank: number
}) => {
    const teamColor = getTeamColor(standing.constructorId)
    const carSrc = TEAM_CARS[standing.constructorId] ?? FALLBACK_CAR
    const logoSrc = TEAM_LOGOS[standing.constructorId] ?? null
    const medalLabels = ["1ST", "2ND", "3RD"]
    const heights = ["240px", "210px", "200px"]

    return (
        <Link
            href="/sports/f1/standings"
            style={{ textDecoration: "none", flex: rank === 1 ? "1.2" : "1" }}
        >
            <div
                style={{
                    position: "relative",
                    height: heights[rank - 1],
                    overflow: "hidden",
                    cursor: "pointer",
                    backgroundColor: teamColor,
                    isolation: "isolate",
                    transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                    ; (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"
                        ; (e.currentTarget as HTMLElement).style.boxShadow =
                            `0 16px 40px ${teamColor}50`
                }}
                onMouseLeave={(e) => {
                    ; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"
                        ; (e.currentTarget as HTMLElement).style.boxShadow = "none"
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)",
                        zIndex: 1,
                    }}
                />

                <div
                    style={{
                        position: "absolute",
                        right: "0px",
                        bottom: "-20px",
                        fontFamily: "var(--font-display)",
                        fontSize: "12rem",
                        fontWeight: 900,
                        lineHeight: 1,
                        color: "rgba(0,0,0,0.4)",
                        zIndex: 2,
                        userSelect: "none",
                        pointerEvents: "none",
                    }}
                >
                    {rank}
                </div>
                <div style={{
                    position: "absolute", right: "12px", top: "12px",
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2rem, 5vw, 3rem)",
                    fontWeight: 900, lineHeight: 1,
                    color: "rgba(255,255,255,0.20)",
                    zIndex: 2, userSelect: "none",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                }}>
                    {standing.constructor.name}
                </div>
                <img
                    src={carSrc}
                    alt={standing.constructor.name}
                    style={{
                        position: "absolute",
                        right: "-5px",
                        bottom: "10px",
                        height: "30%",
                        width: "auto",
                        objectFit: "contain",
                        objectPosition: "bottom right",
                        zIndex: 3,

                    }}
                    onError={(e) => {
                        ; (e.target as HTMLImageElement).src = FALLBACK_CAR
                    }}
                />

                <div
                    style={{
                        position: "relative",
                        zIndex: 4,
                        padding: "14px 16px",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                        }}
                    >
                        {logoSrc ? (
                            <img
                                src={logoSrc}
                                alt={standing.constructor.name}
                                style={{
                                    height: "48px",
                                    width: "auto",
                                    objectFit: "contain",
                                    filter: "brightness(0) invert(1)",
                                    opacity: 0.9,
                                }}
                                onError={(e) => {
                                    ; (e.target as HTMLImageElement).style.display = "none"
                                }}
                            />
                        ) : (
                            <span
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    color: "rgba(255,255,255,0.9)",
                                    backgroundColor: "rgba(0,0,0,0.35)",
                                    padding: "3px 8px",
                                }}
                            >
                                {standing.constructor.name.slice(0, 3).toUpperCase()}
                            </span>
                        )}
                        <span
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                            }}
                        >
                            {medalLabels[rank - 1]}
                        </span>
                    </div>

                    <div>
                        <p
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: rank === 1 ? "1.4rem" : "1.2rem",
                                fontWeight: 700,
                                color: "#ffffff",
                                margin: 0,
                                lineHeight: 1.1,
                            }}
                        >
                            {standing.constructor.name.toUpperCase()}
                        </p>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                margin: "4px 0 8px 0",
                            }}
                        >
                            <span
                                style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}
                            >
                                {standing.wins} {standing.wins === 1 ? "win" : "wins"} ·{" "}
                                {standing.constructor.nationality}
                            </span>
                        </div>
                        <p
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "1rem",
                                fontWeight: 700,
                                color: "#fff",
                                margin: "0 0 6px 0",
                            }}
                        >
                            {standing.points}{" "}
                            <span
                                style={{
                                    fontSize: "0.65rem",
                                    fontWeight: 400,
                                    color: "rgba(255,255,255,0.6)",
                                }}
                            >
                                PTS
                            </span>
                        </p>
                        <div
                            style={{
                                height: "3px",
                                backgroundColor: "rgba(0,0,0,0.3)",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    width: `${Math.min((standing.points / 900) * 100, 100)}%`,
                                    backgroundColor: "#fff",
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

const F1ConstructorStandings = ({
    constructorStandings,
}: {
    constructorStandings: ConstructorStanding[]
}) => {
    const [showAll, setShowAll] = useState(false)
    const visibleConstructors = showAll
        ? constructorStandings
        : constructorStandings.slice(0, 10)
    const maxPts = constructorStandings[0]?.points ?? 1

    return (
        <div className="bg-black p-6 mb-10">
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                        style={{
                            width: "4px",
                            height: "24px",
                            backgroundColor: "var(--accent)",
                        }}
                    />
                    <h2
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            color: "#ffffff",
                            margin: 0,
                            textTransform: "uppercase",
                        }}
                    >
                        CONSTRUCTOR STANDINGS
                    </h2>
                </div>
                {/* <Link
                    href="/sports/f1/standings"
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.3)",
                        textDecoration: "none",
                    }}
                >
                    Full Standings →
                </Link> */}
            </div>

            {/* Top 3 podium cards */}
            <div
                style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "24px",
                    alignItems: "flex-end",
                }}
            >
                {[
                    constructorStandings[1],
                    constructorStandings[0],
                    constructorStandings[2],
                ].map((s, idx) => {
                    if (!s) return null
                    const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3
                    return (
                        <TopConstructorCard
                            key={s.constructorId}
                            standing={s}
                            rank={rank}
                        />
                    )
                })}
            </div>

            {/* Constructor table */}
            <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "3rem 1rem 1fr 5rem 4rem",
                        padding: "10px 16px",
                        backgroundColor: "rgba(255,255,255,0.03)",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    {["POS.", "", "CONSTRUCTOR", "WINS", "PTS"].map((h) => (
                        <span
                            key={h}
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "10px",
                                fontWeight: 600,
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                                color: "rgba(255,255,255,0.50)",
                            }}
                        >
                            {h}
                        </span>
                    ))}
                </div>
                {visibleConstructors.map((s, i) => {
                    const teamColor = getTeamColor(s.constructorId)
                    const logoSrc = TEAM_LOGOS[s.constructorId] ?? FALLBACK_LOGO
                    const pct = (s.points / maxPts) * 100
                    return (
                        <Link
                            key={s.constructorId}
                            href="/sports/f1/standings"
                            style={{ textDecoration: "none", display: "block" }}
                        >
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "3rem 1rem 1fr 5rem 4rem",
                                    alignItems: "center",
                                    padding: "12px 16px",
                                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                                    transition: "background-color 0.15s",
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) =>
                                ((e.currentTarget as HTMLElement).style.backgroundColor =
                                    "rgba(255,255,255,0.03)")
                                }
                                onMouseLeave={(e) =>
                                ((e.currentTarget as HTMLElement).style.backgroundColor =
                                    "transparent")
                                }
                            >
                                <span
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: "0.9rem",
                                        fontWeight: 700,
                                        color: i < 3 ? "#ffffff" : "rgba(255,255,255,0.5)",
                                    }}
                                >
                                    {s.position}
                                </span>
                                <div
                                    style={{
                                        width: "10px",
                                        height: "10px",
                                        borderRadius: "50%",
                                        backgroundColor: teamColor,
                                    }}
                                />
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        minWidth: 0,
                                    }}
                                >
                                    {/* <img
                                        src={logoSrc}
                                        alt={s.constructor.name}
                                        style={{
                                            height: "32px",
                                            width: "auto",
                                            objectFit: "contain",
                                            flexShrink: 0,
                                        }}
                                        onError={(e) =>
                                            ((e.target as HTMLImageElement).style.display = "none")
                                        }
                                    /> */}
                                    <div style={{ minWidth: 0 }}>
                                        <p
                                            style={{
                                                fontFamily: "var(--font-inter)",
                                                fontSize: "0.85rem",
                                                fontWeight: 700,
                                                color: i < 3 ? "#ffffff" : "rgba(255,255,255,0.5)",
                                                margin: "0 0 3px 0",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {s.constructor.name}
                                        </p>
                                        <div
                                            style={{
                                                height: "2px",
                                                backgroundColor: "rgba(255,255,255,0.05)",
                                                overflow: "hidden",
                                                maxWidth: "180px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: "100%",
                                                    width: `${pct}%`,
                                                    backgroundColor: teamColor,
                                                    fontFamily: "var(--font-inter)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <span
                                    style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}
                                >
                                    {s.wins} wins
                                </span>
                                <span
                                    style={{
                                        fontFamily: "var(--font-inter)",
                                        fontSize: "0.9rem",
                                        fontWeight: 700,
                                        color: "#ffffff",
                                        textAlign: "right",
                                    }}
                                >
                                    {s.points}
                                </span>
                            </div>
                        </Link>
                    )
                })}
                <button
                    onClick={() => setShowAll((v) => !v)}
                    style={{
                        width: "100%",
                        padding: "12px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "var(--font-display)",
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "#ffffff")
                    }
                    onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                        "rgba(255,255,255,0.3)")
                    }
                >
                    {showAll
                        ? "Show less ↑"
                        : `Show all ${constructorStandings.length} teams ↓`}
                </button>
            </div>

            {/* View full standings button */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                <Link
                    href="/sports/f1/standings"
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "12px",
                        fontWeight: 600,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "#ffffff",
                        textDecoration: "none",
                        padding: "12px 32px",
                        border: "1px solid rgba(255,255,255,0.2)",
                        transition: "all 0.2s",
                        display: "inline-block",
                    }}
                    onMouseEnter={(e) => {
                        ; (e.currentTarget as HTMLElement).style.backgroundColor =
                            "rgba(255,255,255,0.05)"
                            ; (e.currentTarget as HTMLElement).style.borderColor =
                                "rgba(255,255,255,0.4)"
                    }}
                    onMouseLeave={(e) => {
                        ; (e.currentTarget as HTMLElement).style.backgroundColor =
                            "transparent"
                            ; (e.currentTarget as HTMLElement).style.borderColor =
                                "rgba(255,255,255,0.2)"
                    }}
                >
                    View Full Standings
                </Link>
            </div>
        </div>
    )
}

export default F1ConstructorStandings