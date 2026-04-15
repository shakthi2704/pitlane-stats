"use client"

import { useState } from "react"
import Link from "next/link"
import { getTeamColor, getFlagEmoji } from "@/types/f1/f1-api"
import {
    DRIVER_IMAGES,
    FALLBACK_DRIVER,
} from "@/lib/f1/f1-constants"
import type { DriverStanding } from "@/types/f1"
import { TEAM_LOGOS, TEAM_SHORT, TEAM_CARS, FALLBACK_CAR, FALLBACK_LOGO } from "@/lib/f1/f1-constants"
import type { ConstructorStanding } from "@/types/f1"


const TopDriverCard = ({
    standing,
    rank,
}: {
    standing: DriverStanding
    rank: number
}) => {
    const teamColor = getTeamColor(standing.constructorId)
    const imgSrc = DRIVER_IMAGES[standing.driverId] ?? FALLBACK_DRIVER

    const teamShort =
        TEAM_SHORT[standing.constructorId] ??
        standing.constructorId.toUpperCase().slice(0, 3)

    const logoSrc = TEAM_LOGOS[standing.constructorId] ?? null

    const medalLabels = ["1ST", "2ND", "3RD"]
    const heights = ["240px", "210px", "200px"]

    return (
        <Link
            href={`/sports/f1/drivers/${standing.driverId}`}
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
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(-4px)"
                    el.style.boxShadow = `0 16px 40px ${teamColor}50`
                }}
                onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(0)"
                    el.style.boxShadow = "none"
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(120deg, rgba(0,0,0,0.65) 20%, rgba(0,0,0,0.2) 90%, rgba(0,0,0,0.0) 100%)",
                        zIndex: 1,
                    }}
                />

                <div
                    style={{
                        position: "absolute",
                        right: "-10px",
                        bottom: "-20px",
                        fontFamily: "var(--font-display)",
                        fontSize: "12rem",
                        fontWeight: 900,
                        lineHeight: 1,
                        color: "rgba(0,0,0,0.25)",
                        zIndex: 3,
                        userSelect: "none",
                        pointerEvents: "none",
                    }}
                >
                    {rank}
                </div>

                <img
                    src={imgSrc}
                    alt={standing.driver.familyName}
                    style={{
                        position: "absolute",
                        right: 0,
                        bottom: 0,
                        height: "100%",
                        width: "auto",
                        objectFit: "contain",
                        objectPosition: "top right",
                        zIndex: 1,
                    }}
                    onError={(e) => {
                        ; (e.target as HTMLImageElement).src = FALLBACK_DRIVER
                    }}
                />

                <div
                    style={{
                        position: "relative",
                        zIndex: 5,
                        padding: "14px 16px",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        <span
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "12px",
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                color: "rgba(255,255,255,0.9)",
                                backgroundColor: "rgba(0,0,0,0.35)",
                                padding: "3px 8px",
                            }}
                        >
                            {teamShort}
                        </span>
                    </div>

                    <div>
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

                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "18px" }}>
                                {getFlagEmoji(standing.driver.nationality ?? "")}
                            </span>
                            <p
                                style={{
                                    fontSize: "1rem",
                                    color: "rgba(255,255,255,0.65)",
                                    margin: 0,
                                    fontFamily: "var(--font-display)",
                                }}
                            >
                                {standing.driver.givenName}
                            </p>
                        </div>

                        <p
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: rank === 1 ? "1.8rem" : "1.4rem",
                                fontWeight: 700,
                                color: "#fff",
                                margin: 0,
                            }}
                        >
                            {standing.driver.familyName.toUpperCase()}
                        </p>

                        <p
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "1rem",
                                fontWeight: 700,
                                marginTop: "6px",
                            }}
                        >
                            {standing.points}{" "}
                            <span
                                style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.6)" }}
                            >
                                PTS
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    )
}

const F1DriverStandings = ({
    standings,
}: {
    standings: DriverStanding[]
}) => {
    const [showAll, setShowAll] = useState(false)
    const visibleDrivers = showAll ? standings : standings.slice(3)

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
                        DRIVER STANDINGS
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
                {[standings[1], standings[0], standings[2]].map((s, idx) => {
                    if (!s) return null
                    const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3
                    return <TopDriverCard key={s.driverId} standing={s} rank={rank} />
                })}
            </div>

            {/* Driver table */}
            <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "3rem 2.5rem 1fr 1fr 1fr 4rem",
                        padding: "10px 16px",
                        backgroundColor: "rgba(255,255,255,0.03)",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    {["POS.", "", "DRIVER", "NATIONALITY", "TEAM", "PTS"].map((h) => (
                        <span
                            key={h}
                            style={{
                                fontFamily: "var(--font-)",
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
                {visibleDrivers.map((s, i) => {
                    const teamColor = getTeamColor(s.constructorId)
                    const imgSrc = DRIVER_IMAGES[s.driverId] ?? FALLBACK_DRIVER
                    return (
                        <Link
                            key={s.driverId}
                            href={`/sports/f1/drivers/${s.driverId}`}
                            style={{ textDecoration: "none", display: "block" }}
                        >
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "3rem 2.5rem 1fr 1fr 1fr 4rem",
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
                                        fontFamily: "var(--font-roboto-mono)",
                                        fontSize: "0.9rem",
                                        fontWeight: 700,
                                        color: i < 3 ? "#ffffff" : "rgba(255,255,255,0.4)",
                                    }}
                                >
                                    {s.position}
                                </span>
                                <div
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        overflow: "hidden",
                                        backgroundColor: teamColor + "40",
                                        border: `1px solid ${teamColor}60`,
                                    }}
                                >
                                    <img
                                        src={imgSrc}
                                        alt={s.driver.familyName}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            objectPosition: "top",
                                        }}
                                        onError={(e) =>
                                            ((e.target as HTMLImageElement).src = FALLBACK_DRIVER)
                                        }
                                    />
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span
                                        style={{
                                            fontFamily: "var(--font-roboto)",
                                            fontSize: "0.85rem",
                                            fontWeight: 700,
                                            color: "#ffffff",
                                        }}
                                    >
                                        {s.driver.givenName} {s.driver.familyName}
                                    </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{ fontSize: "14px" }}>
                                        {getFlagEmoji(s.driver.nationality ?? "")}
                                    </span>
                                    <span
                                        style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}
                                    >
                                        {s.driver.nationality}
                                    </span>
                                </div>
                                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                                    {s.constructorName}
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
                    {showAll ? "Show less ↑" : `Show all ${standings.length} drivers ↓`}
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

export default F1DriverStandings