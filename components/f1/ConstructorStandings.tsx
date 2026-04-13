"use client"

import { useState } from "react"
import Link from "next/link"
import { getTeamColor, getFlagEmoji } from "@/types/f1/f1-api"
import {
    TEAM_SHORT,
    DRIVER_IMAGES,
    TEAM_CARS,
    TEAM_LOGOS,
    FALLBACK_CAR,
    FALLBACK_DRIVER,
    FALLBACK_LOGO,
} from "@/lib/fi/f1-constants"
import type { DriverStanding, ConstructorStanding } from "@/types/f1"


// ─────────────────────────────────────────────
// TOP CONSTRUCTOR CARD (unchanged)
// ─────────────────────────────────────────────
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
    const medalColors = ["#F5C842", "#C0C0C0", "#CD7F32"]
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
                {/* Dark overlay */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)",
                        zIndex: 1,
                    }}
                />

                {/* Watermark position number */}
                <div
                    style={{
                        position: "absolute",
                        right: "-10px",
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

                {/* Car image */}
                <img
                    src={carSrc}
                    alt={standing.constructor.name}
                    style={{
                        position: "absolute",
                        right: "-10px",
                        bottom: "10px",
                        height: "65%",
                        width: "auto",
                        objectFit: "contain",
                        objectPosition: "bottom right",
                        zIndex: 3,
                    }}
                    onError={(e) => {
                        ; (e.target as HTMLImageElement).src = FALLBACK_CAR
                    }}
                />

                {/* Content */}
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
                    {/* Top — logo left, medal right */}
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
                                // color: medalColors[rank - 1],
                                letterSpacing: "0.1em",
                            }}
                        >
                            {medalLabels[rank - 1]}
                        </span>
                    </div>

                    {/* Bottom — name + points */}
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
                                color: medalColors[rank - 1],
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
                        {/* Points bar */}
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
                                    backgroundColor: medalColors[rank - 1],
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}


// ─────────────────────────────────────────────
// CONSTRUCTOR STANDINGS SECTION
// ─────────────────────────────────────────────
export const ConstructorStandingsOnly = ({ constructorStandings }: { constructorStandings: ConstructorStanding[] }) => {
    const [showAll, setShowAll] = useState(false)
    const visible = showAll ? constructorStandings : constructorStandings.slice(0, 10)

    return (
        <div className="bg-black p-6 mb-10">
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                }}
                className=""
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                        style={{
                            width: "4px",
                            height: "24px",
                            backgroundColor: "var(--color-f1-red)",
                        }}
                    />
                    <h2
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            color: "#ffffff",
                            margin: 0,
                        }}
                    >  STANDINGS

                    </h2>
                </div>
                <Link
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
                </Link>
            </div>

        </div>
    )
}
