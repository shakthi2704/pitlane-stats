"use client"

import { useState } from "react"
import Link from "next/link"
import { getTeamColor, getFlagEmoji } from "@/lib/f1-api"
import type { DriverStanding, ConstructorStanding } from "@/components/types/f1"

const TEAM_SHORT: Record<string, string> = {
    mclaren: "MCL", mercedes: "MER", red_bull: "RBR", ferrari: "FER",
    williams: "WIL", rb: "RB", aston_martin: "AM", haas: "HAA",
    kick_sauber: "SAU", alpine: "ALP",
}

const DRIVER_IMAGES: Record<string, string> = {
    albon: "/F1/drivers/alexander-albon.avif",
    lindblad: "/F1/drivers/arvid-lindblad.avif",
    sainz: "/F1/drivers/carlos-sainz.avif",
    leclerc: "/F1/drivers/charles-leclerc.avif",
    ocon: "/F1/drivers/esteban-ocon.avif",
    alonso: "/F1/drivers/fernando-alonso.avif",
    colapinto: "/F1/drivers/franco-colapinto.avif",
    bortoleto: "/F1/drivers/gabriel-bortoleto.avif",
    russell: "/F1/drivers/george-russell.avif",
    hadjar: "/F1/drivers/isack-hadjar.avif",
    antonelli: "/F1/drivers/kimi-antonelli.avif",
    stroll: "/F1/drivers/lance-stroll.avif",
    norris: "/F1/drivers/lando-norris.avif",
    hamilton: "/F1/drivers/lewis-hamilton.avif",
    lawson: "/F1/drivers/liam-lawson.avif",
    max_verstappen: "/F1/drivers/max-verstappen.avif",
    hulkenberg: "/F1/drivers/nico-hulkenberg.avif",
    bearman: "/F1/drivers/oliver-bearman.avif",
    piastri: "/F1/drivers/oscar-piastri.avif",
    gasly: "/F1/drivers/pierre-gasly.avif",
    perez: "/F1/drivers/sergio-perez.avif",
    bottas: "/F1/drivers/valtteri-bottas.avif",
};

const TEAM_CARS: Record<string, string> = {
    mclaren: "/F1/team/2026mclarencarright.avif",
    mercedes: "/F1/team/2026mercedescarright.avif",
    red_bull: "/F1/team/2026redbullracingcarright.avif",
    ferrari: "/F1/team/2026ferraricarright.avif",
    williams: "/F1/team/2026williamscarright.avif",
    rb: "/F1/team/2026racingbullscarright.avif",
    aston_martin: "/F1/team/2026astonmartincarright.avif",
    haas: "/F1/team/2026haascarright.avif",
    kick_sauber: "/F1/team/2026audicarright.avif",
    alpine: "/F1/team/2026alpinecarright.avif",
}

const TEAM_LOGOS: Record<string, string> = {
    mclaren: "/F1/logos/mclarenlogowhite.webp",
    mercedes: "/F1/logos/mercedeslogowhite.webp",
    red_bull: "/F1/logos/redbullracinglogowhite.webp",
    ferrari: "/F1/logos/ferrarilogolight.webp",
    williams: "/F1/logos/williamslogowhite.webp",
    rb: "/F1/logos/racingbullslogowhite.webp",
    aston_martin: "/F1/logos/astonmartinlogowhite.webp",
    haas: "/F1/logos/haaslogowhite.webp",
    kick_sauber: "/F1/logos/audilogowhite.webp",
    alpine: "/F1/logos/alpinelogowhite.webp",
}

const FALLBACK_IMAGE = "/F1/drivers/placeholder.svg"
const FALLBACK_CAR = "/F1/drivers/placeholder.svg"

// ─── Top 3 Driver Card ────────────────────────────────────────────────────────
const TopDriverCard = ({ standing, rank }: { standing: DriverStanding; rank: number }) => {
    const teamColor = getTeamColor(standing.constructorId)
    const imgSrc = DRIVER_IMAGES[standing.driverId] ?? FALLBACK_IMAGE
    const teamShort = TEAM_SHORT[standing.constructorId] ?? standing.constructorId.toUpperCase().slice(0, 3)
    const logoSrc = TEAM_LOGOS[standing.constructorId] ?? null
    const medalColors = ["#F5C842", "#C0C0C0", "#CD7F32"]
    const medalLabels = ["1ST", "2ND", "3RD"]
    const heights = ["240px", "210px", "200px"]

    return (
        <Link href={`/sports/f1/drivers/${standing.driverId}`} style={{ textDecoration: "none", flex: rank === 1 ? "1.2" : "1" }}>
            <div
                style={{ position: "relative", height: heights[rank - 1], overflow: "hidden", cursor: "pointer", backgroundColor: teamColor, isolation: "isolate", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { ; (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${teamColor}50` }}
                onMouseLeave={e => { ; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none" }}
            >
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.0) 100%)", zIndex: 1 }} />
                <div style={{ position: "absolute", right: "-10px", bottom: "-20px", fontFamily: "var(--font-display)", fontSize: "9rem", fontWeight: 900, lineHeight: 1, color: "rgba(0,0,0,0.2)", zIndex: 2, userSelect: "none", pointerEvents: "none" }}>{rank}</div>
                <img
                    src={imgSrc}
                    alt={standing.driver.familyName}
                    style={{ position: "absolute", right: 0, bottom: 0, height: "100%", width: "auto", objectFit: "contain", objectPosition: "top right", zIndex: 3 }}
                    onError={e => { ; (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
                />
                <div style={{ position: "relative", zIndex: 4, padding: "14px 16px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    {/* Team logo top left */}
                    <div>
                        {logoSrc ? (
                            <img src={logoSrc} alt={teamShort} style={{ height: "35px", width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.9 }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                        ) : (
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.9)", backgroundColor: "rgba(0,0,0,0.35)", padding: "3px 8px" }}>{teamShort}</span>
                        )}
                    </div>
                    <div>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700, color: medalColors[rank - 1], letterSpacing: "0.1em", display: "block", marginBottom: "2px" }}>{medalLabels[rank - 1]}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                            <span style={{ fontSize: "18px" }}>{getFlagEmoji(standing.driver.nationality ?? "")}</span>
                            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.2 }}>{standing.driver.givenName}</p>
                        </div>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: rank === 1 ? "1.4rem" : "1.2rem", fontWeight: 700, color: "#ffffff", margin: 0, lineHeight: 1.1 }}>{standing.driver.familyName}</p>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: medalColors[rank - 1], margin: "6px 0 0 0" }}>
                            {standing.points}{" "}<span style={{ fontSize: "0.65rem", fontWeight: 400, color: "rgba(255,255,255,0.6)" }}>PTS</span>
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    )
}

// ─── Top 3 Constructor Card ───────────────────────────────────────────────────
const TopConstructorCard = ({ standing, rank }: { standing: ConstructorStanding; rank: number }) => {
    const teamColor = getTeamColor(standing.constructorId)
    const carSrc = TEAM_CARS[standing.constructorId] ?? FALLBACK_CAR
    const logoSrc = TEAM_LOGOS[standing.constructorId] ?? null
    const medalColors = ["#F5C842", "#C0C0C0", "#CD7F32"]
    const medalLabels = ["1ST", "2ND", "3RD"]
    const heights = ["240px", "210px", "200px"]

    return (
        <Link href="/sports/f1/standings" style={{ textDecoration: "none", flex: rank === 1 ? "1.2" : "1" }}>
            <div
                style={{ position: "relative", height: heights[rank - 1], overflow: "hidden", cursor: "pointer", backgroundColor: teamColor, isolation: "isolate", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { ; (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${teamColor}50` }}
                onMouseLeave={e => { ; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none" }}
            >
                {/* Dark overlay */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)", zIndex: 1 }} />

                {/* Watermark position number */}
                <div style={{ position: "absolute", right: "-10px", bottom: "-20px", fontFamily: "var(--font-display)", fontSize: "9rem", fontWeight: 900, lineHeight: 1, color: "rgba(0,0,0,0.2)", zIndex: 2, userSelect: "none", pointerEvents: "none" }}>{rank}</div>

                {/* Car image */}
                <img
                    src={carSrc}
                    alt={standing.constructor.name}
                    style={{ position: "absolute", right: "-10px", bottom: "10px", height: "65%", width: "auto", objectFit: "contain", objectPosition: "bottom right", zIndex: 3 }}
                    onError={e => { ; (e.target as HTMLImageElement).src = FALLBACK_CAR }}
                />

                {/* Content */}
                <div style={{ position: "relative", zIndex: 4, padding: "14px 16px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    {/* Top — logo left, medal right */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        {logoSrc ? (
                            <img src={logoSrc} alt={standing.constructor.name} style={{ height: "30px", width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.9 }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                        ) : (
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.9)", backgroundColor: "rgba(0,0,0,0.35)", padding: "3px 8px" }}>{standing.constructor.name.slice(0, 3).toUpperCase()}</span>
                        )}
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700, color: medalColors[rank - 1], letterSpacing: "0.1em" }}>{medalLabels[rank - 1]}</span>
                    </div>

                    {/* Bottom — name + points */}
                    <div>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: rank === 1 ? "1.4rem" : "1.2rem", fontWeight: 700, color: "#ffffff", margin: 0, lineHeight: 1.1 }}>
                            {standing.constructor.name.toUpperCase()}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "4px 0 8px 0" }}>
                            <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
                                {standing.wins} {standing.wins === 1 ? "win" : "wins"} · {standing.constructor.nationality}
                            </span>
                        </div>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: medalColors[rank - 1], margin: "0 0 6px 0" }}>
                            {standing.points}{" "}<span style={{ fontSize: "0.65rem", fontWeight: 400, color: "rgba(255,255,255,0.6)" }}>PTS</span>
                        </p>
                        {/* Points bar */}
                        <div style={{ height: "3px", backgroundColor: "rgba(0,0,0,0.3)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${Math.min((standing.points / 900) * 100, 100)}%`, backgroundColor: medalColors[rank - 1] }} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const DriverStandingsSection = ({
    standings,
    constructorStandings = [],
}: {
    standings: DriverStanding[]
    constructorStandings?: ConstructorStanding[]
}) => {
    const [activeTab, setActiveTab] = useState<"drivers" | "teams">("drivers")
    const [showAll, setShowAll] = useState(false)

    const visibleDrivers = showAll ? standings : standings.slice(0, 10)
    const visibleConstructors = showAll ? constructorStandings : constructorStandings.slice(0, 10)
    const maxPts = constructorStandings[0]?.points ?? 1

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "4px", height: "24px", backgroundColor: "var(--color-f1-red)" }} />
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                        2025 {activeTab === "drivers" ? "DRIVER" : "CONSTRUCTOR"} STANDINGS
                    </h2>
                </div>
                <Link href="/sports/f1/standings" style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
                    Full Standings →
                </Link>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "20px" }}>
                {(["drivers", "teams"] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setShowAll(false) }}
                        style={{
                            fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600,
                            letterSpacing: "0.15em", textTransform: "uppercase",
                            color: activeTab === tab ? "#ffffff" : "rgba(255,255,255,0.3)",
                            background: "none", border: "none",
                            borderBottom: activeTab === tab ? "2px solid var(--color-f1-red)" : "2px solid transparent",
                            padding: "10px 16px", cursor: "pointer", marginBottom: "-1px",
                            transition: "color 0.2s",
                        }}
                    >
                        {tab === "drivers" ? "Drivers" : "Teams"}
                    </button>
                ))}
            </div>

            {/* ── DRIVERS TAB ── */}
            {activeTab === "drivers" && (
                <>
                    {/* Top 3 podium cards */}
                    <div style={{ display: "flex", gap: "8px", marginBottom: "24px", alignItems: "flex-end" }}>
                        {[standings[1], standings[0], standings[2]].map((s, idx) => {
                            if (!s) return null
                            const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3
                            return <TopDriverCard key={s.driverId} standing={s} rank={rank} />
                        })}
                    </div>

                    {/* Driver table */}
                    <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "3rem 2.5rem 1fr 1fr 1fr 4rem", padding: "10px 16px", backgroundColor: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            {["POS.", "", "DRIVER", "NATIONALITY", "TEAM", "PTS"].map(h => (
                                <span key={h} style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>{h}</span>
                            ))}
                        </div>
                        {visibleDrivers.map((s, i) => {
                            const teamColor = getTeamColor(s.constructorId)
                            const imgSrc = DRIVER_IMAGES[s.driverId] ?? FALLBACK_IMAGE
                            return (
                                <Link key={s.driverId} href={`/sports/f1/drivers/${s.driverId}`} style={{ textDecoration: "none", display: "block" }}>
                                    <div
                                        style={{ display: "grid", gridTemplateColumns: "3rem 2.5rem 1fr 1fr 1fr 4rem", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background-color 0.15s", cursor: "pointer" }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.03)"}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
                                    >
                                        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: i < 3 ? "#ffffff" : "rgba(255,255,255,0.4)" }}>{s.position}</span>
                                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", overflow: "hidden", backgroundColor: teamColor + "40", border: `1px solid ${teamColor}60` }}>
                                            <img src={imgSrc} alt={s.driver.familyName} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} onError={e => (e.target as HTMLImageElement).src = FALLBACK_IMAGE} />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div style={{ width: "3px", height: "20px", backgroundColor: teamColor, flexShrink: 0 }} />
                                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }}>{s.driver.givenName[0]}. {s.driver.familyName}</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <span style={{ fontSize: "14px" }}>{getFlagEmoji(s.driver.nationality ?? "")}</span>
                                            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>{s.driver.nationality}</span>
                                        </div>
                                        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>{s.constructorName}</span>
                                        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: "#ffffff", textAlign: "right" }}>{s.points}</span>
                                    </div>
                                </Link>
                            )
                        })}
                        <button
                            onClick={() => setShowAll(v => !v)}
                            style={{ width: "100%", padding: "12px", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "color 0.2s" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ffffff"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"}
                        >
                            {showAll ? "Show less ↑" : `Show all ${standings.length} drivers ↓`}
                        </button>
                    </div>
                </>
            )}

            {/* ── TEAMS TAB ── */}
            {activeTab === "teams" && (
                <>
                    {/* Top 3 constructor cards */}
                    <div style={{ display: "flex", gap: "8px", marginBottom: "24px", alignItems: "flex-end" }}>
                        {[constructorStandings[1], constructorStandings[0], constructorStandings[2]].map((s, idx) => {
                            if (!s) return null
                            const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3
                            return <TopConstructorCard key={s.constructorId} standing={s} rank={rank} />
                        })}
                    </div>

                    {/* Constructor table */}
                    <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "3rem 1rem 1fr 5rem 4rem", padding: "10px 16px", backgroundColor: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            {["POS.", "", "CONSTRUCTOR", "WINS", "PTS"].map(h => (
                                <span key={h} style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>{h}</span>
                            ))}
                        </div>
                        {visibleConstructors.map((s, i) => {
                            const teamColor = getTeamColor(s.constructorId)
                            const carSrc = TEAM_CARS[s.constructorId] ?? FALLBACK_CAR
                            const pct = (s.points / maxPts) * 100
                            return (
                                <Link key={s.constructorId} href="/sports/f1/standings" style={{ textDecoration: "none", display: "block" }}>
                                    <div
                                        style={{ display: "grid", gridTemplateColumns: "3rem 1rem 1fr 5rem 4rem", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background-color 0.15s", cursor: "pointer" }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.03)"}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
                                    >
                                        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: i < 3 ? "#ffffff" : "rgba(255,255,255,0.4)" }}>{s.position}</span>
                                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: teamColor }} />
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                                            {/* Mini car image */}
                                            <img
                                                src={carSrc}
                                                alt={s.constructor.name}
                                                style={{ height: "24px", width: "auto", objectFit: "contain", flexShrink: 0 }}
                                                onError={e => (e.target as HTMLImageElement).style.display = "none"}
                                            />
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700, color: "#ffffff", margin: "0 0 3px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.constructor.name}</p>
                                                <div style={{ height: "2px", backgroundColor: "rgba(255,255,255,0.05)", overflow: "hidden", maxWidth: "180px" }}>
                                                    <div style={{ height: "100%", width: `${pct}%`, backgroundColor: teamColor }} />
                                                </div>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>{s.wins} wins</span>
                                        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: "#ffffff", textAlign: "right" }}>{s.points}</span>
                                    </div>
                                </Link>
                            )
                        })}
                        <button
                            onClick={() => setShowAll(v => !v)}
                            style={{ width: "100%", padding: "12px", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "color 0.2s" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ffffff"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"}
                        >
                            {showAll ? "Show less ↑" : `Show all ${constructorStandings.length} teams ↓`}
                        </button>
                    </div>
                </>
            )}

            {/* View full standings button */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                <Link
                    href="/sports/f1/standings"
                    style={{ fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ffffff", textDecoration: "none", padding: "12px 32px", border: "1px solid rgba(255,255,255,0.2)", transition: "all 0.2s", display: "inline-block" }}
                    onMouseEnter={e => { ; (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.4)" }}
                    onMouseLeave={e => { ; (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)" }}
                >
                    View Full Standings
                </Link>
            </div>
        </div>
    )
}

export default DriverStandingsSection