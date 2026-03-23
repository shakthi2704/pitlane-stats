import Link from "next/link"
import { getTeamColor } from "@/lib/f1-api"
import type { ConstructorStanding } from "@/components/types/f1"

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

const FALLBACK_CAR = "/F1/drivers/placeholder.svg"

const ConstructorStandingsSection = ({ standings }: { standings: ConstructorStanding[] }) => {
    const max = standings[0]?.points ?? 1
    const top3 = standings.slice(0, 3)
    const rest = standings.slice(3)

    const medalColors = ["#F5C842", "#C0C0C0", "#CD7F32"]
    const medalLabels = ["1ST", "2ND", "3RD"]
    const heights = ["240px", "210px", "200px"]

    // Podium order: 2nd, 1st, 3rd
    const podiumOrder = [standings[1], standings[0], standings[2]]

    return (
        <div>
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "4px", height: "24px", backgroundColor: "var(--color-f1-red)" }} />
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                        2025 CONSTRUCTOR STANDINGS
                    </h2>
                </div>
                <Link href="/sports/f1/standings" style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
                    Full Standings →
                </Link>
            </div>

            {/* Top 3 cards — podium order */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px", alignItems: "flex-end" }}>
                {podiumOrder.map((s, idx) => {
                    if (!s) return null
                    const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3
                    const teamColor = getTeamColor(s.constructorId)
                    const carSrc = TEAM_CARS[s.constructorId] ?? FALLBACK_CAR
                    const logoSrc = TEAM_LOGOS[s.constructorId] ?? null

                    return (
                        <Link
                            key={s.constructorId}
                            href="/sports/f1/standings"
                            style={{ textDecoration: "none", flex: rank === 1 ? "1.2" : "1" }}
                        >
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
                                    alt={s.constructor.name}
                                    style={{ position: "absolute", right: "-10px", bottom: "10px", height: "60%", width: "auto", objectFit: "contain", objectPosition: "bottom right", zIndex: 3 }}
                                    onError={e => { ; (e.target as HTMLImageElement).src = FALLBACK_CAR }}
                                />

                                {/* Content */}
                                <div style={{ position: "relative", zIndex: 4, padding: "14px 16px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>

                                    {/* Top — logo left, medal right */}
                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                        {logoSrc ? (
                                            <img
                                                src={logoSrc}
                                                alt={s.constructor.name}
                                                style={{ height: "30px", width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.9 }}
                                                onError={e => { ; (e.target as HTMLImageElement).style.display = "none" }}
                                            />
                                        ) : (
                                            <span style={{ fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.9)", backgroundColor: "rgba(0,0,0,0.35)", padding: "3px 8px" }}>
                                                {s.constructor.name.slice(0, 3).toUpperCase()}
                                            </span>
                                        )}
                                        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700, color: medalColors[rank - 1], letterSpacing: "0.1em" }}>
                                            {medalLabels[rank - 1]}
                                        </span>
                                    </div>

                                    {/* Bottom — name + nationality + points + bar */}
                                    <div>
                                        <p style={{ fontFamily: "var(--font-display)", fontSize: rank === 1 ? "1.4rem" : "1.2rem", fontWeight: 700, color: "#ffffff", margin: 0, lineHeight: 1.1 }}>
                                            {s.constructor.name.toUpperCase()}
                                        </p>
                                        <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", margin: "4px 0 8px 0" }}>
                                            {s.wins} {s.wins === 1 ? "win" : "wins"} · {s.constructor.nationality}
                                        </p>
                                        <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: medalColors[rank - 1], margin: "0 0 6px 0" }}>
                                            {s.points}{" "}
                                            <span style={{ fontSize: "0.65rem", fontWeight: 400, color: "rgba(255,255,255,0.6)" }}>PTS</span>
                                        </p>
                                        <div style={{ height: "3px", backgroundColor: "rgba(0,0,0,0.3)", overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${Math.min((s.points / (standings[0]?.points ?? 1)) * 100, 100)}%`, backgroundColor: medalColors[rank - 1] }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Rest of constructors table */}
            <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                {/* Header */}
                <div style={{ display: "grid", gridTemplateColumns: "3rem 1rem 1fr 5rem 4rem", padding: "10px 16px", backgroundColor: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["POS.", "", "CONSTRUCTOR", "WINS", "PTS"].map(h => (
                        <span key={h} style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>{h}</span>
                    ))}
                </div>

                {rest.map((s, i) => {
                    const teamColor = getTeamColor(s.constructorId)
                    const logoSrc = TEAM_LOGOS[s.constructorId] ?? null
                    const pct = (s.points / max) * 100

                    return (
                        <Link key={s.constructorId} href="/sports/f1/standings" style={{ textDecoration: "none", display: "block" }}>
                            <div
                                style={{ display: "grid", gridTemplateColumns: "3rem 1rem 1fr 5rem 4rem", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background-color 0.15s", cursor: "pointer" }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.03)"}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
                            >
                                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>{s.position}</span>

                                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: teamColor }} />

                                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                                    {logoSrc && (
                                        <img
                                            src={logoSrc}
                                            alt={s.constructor.name}
                                            style={{ height: "20px", width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.7, flexShrink: 0 }}
                                            onError={e => (e.target as HTMLImageElement).style.display = "none"}
                                        />
                                    )}
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700, color: "#ffffff", margin: "0 0 3px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {s.constructor.name}
                                        </p>
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
            </div>

            {/* View full standings */}
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

export default ConstructorStandingsSection