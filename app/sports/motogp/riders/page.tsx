"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import F1Loader from "@/components/f1/F1Loader"
import { MOTOGP_RED, CURRENT_SEASON, MOTOGP_AVAILABLE_SEASONS } from "@/lib/motogp/motogp-constants"
import { getConstructorColor } from "@/components/motogp/MotoGPRiderStandings"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Rider {
    id: string
    fullName: string
    firstName?: string | null
    lastName?: string | null
    nationality?: string | null
    number?: number | null
    photoUrl?: string | null
    category: string
    teamName?: string | null
    constructorName?: string | null
    position: number
    points: number
    raceWins: number
    podiums: number
}

type ClassFilter = "MotoGP" | "Moto2" | "Moto3"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FALLBACK_PHOTO = "/F1/drivers/placeholder.svg"
const MEDAL_COLORS = ["#F5C842", "#C0C0C0", "#CD7F32"]
const CLASS_TABS: ClassFilter[] = ["MotoGP", "Moto2", "Moto3"]

function getFlagEmoji(iso: string): string {
    if (!iso || iso.length !== 2) return ""
    return iso.toUpperCase().replace(/./g, c =>
        String.fromCodePoint(c.charCodeAt(0) + 127397)
    )
}

function getNames(rider: Rider) {
    const parts = rider.fullName.split(" ")
    const first = rider.firstName ?? parts[0]
    const last = rider.lastName ?? (parts.slice(1).join(" ") || parts[0])
    return { first, last }
}

// ─── Top 3 Card ───────────────────────────────────────────────────────────────

const TopRiderCard = ({ rider }: { rider: Rider }) => {
    const color = getConstructorColor(rider.constructorName ?? "")
    const medalColor = MEDAL_COLORS[rider.position - 1] ?? MEDAL_COLORS[0]
    const { first, last } = getNames(rider)
    const flag = getFlagEmoji(rider.nationality ?? "")

    return (
        <Link
            href={`/sports/motogp/riders/${rider.id}`}
            style={{ textDecoration: "none", flex: rider.position === 1 ? "1.2" : "1" }}
        >
            <div
                style={{
                    position: "relative", height: "280px",
                    overflow: "hidden", backgroundColor: color,
                    isolation: "isolate",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(-4px)"
                    el.style.boxShadow = `0 20px 40px ${color}50`
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(0)"
                    el.style.boxShadow = "none"
                }}
            >
                <div style={{
                    position: "absolute", inset: 0, zIndex: 1,
                    background: "linear-gradient(120deg, rgba(0,0,0,0.65) 20%, rgba(0,0,0,0.2) 90%, transparent 100%)",
                }} />
                <div style={{
                    position: "absolute", right: "-10px", bottom: "-20px",
                    fontFamily: "var(--font-display)", fontSize: "11rem",
                    fontWeight: 900, lineHeight: 1, color: "rgba(0,0,0,0.2)",
                    zIndex: 2, userSelect: "none", pointerEvents: "none",
                }}>
                    {rider.position}
                </div>
                <img
                    src={rider.photoUrl ?? FALLBACK_PHOTO}
                    alt={rider.fullName}
                    style={{
                        position: "absolute", right: 0, bottom: 0,
                        height: "100%", width: "auto",
                        objectFit: "contain", objectPosition: "bottom right",
                        zIndex: 3,
                    }}
                    onError={e => { (e.target as HTMLImageElement).src = FALLBACK_PHOTO }}
                />
                <div style={{
                    position: "relative", zIndex: 4, padding: "18px",
                    height: "100%", display: "flex", flexDirection: "column",
                    justifyContent: "space-between",
                }}>
                    {/* Top */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{
                                fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 700,
                                color: "rgba(255,255,255,0.9)", backgroundColor: "rgba(0,0,0,0.4)",
                                padding: "2px 8px",
                            }}>
                                {rider.constructorName ?? "—"}
                            </span>
                            {rider.number != null && (
                                <span style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                                    #{rider.number}
                                </span>
                            )}
                        </div>
                        <span style={{
                            fontFamily: "var(--font-display)", fontSize: "1.5rem",
                            fontWeight: 700, color: medalColor, letterSpacing: "0.05em",
                        }}>
                            P{rider.position}
                        </span>
                    </div>
                    {/* Bottom */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                            <span style={{ fontSize: "28px" }}>{flag}</span>
                            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", margin: 0, fontFamily: "var(--font-display)" }}>
                                {first.toUpperCase()}
                            </p>
                        </div>
                        <p style={{
                            fontFamily: "var(--font-display)", fontSize: "1.8rem",
                            fontWeight: 700, color: "#fff", margin: "0 0 8px", lineHeight: 1,
                        }}>
                            {last.toUpperCase()}
                        </p>
                        <div style={{ display: "flex", gap: "16px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                            {[
                                { label: "PTS", value: rider.points },
                                { label: "WINS", value: rider.raceWins },
                                { label: "POD", value: rider.podiums },
                            ].map((s, i) => (
                                <div key={s.label} style={{
                                    paddingRight: i < 2 ? "16px" : 0,
                                    borderRight: i < 2 ? "1px solid rgba(255,255,255,0.15)" : "none",
                                }}>
                                    <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: medalColor, margin: 0, lineHeight: 1 }}>
                                        {s.value}
                                    </p>
                                    <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", margin: "2px 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                        {s.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

// ─── Regular Card ─────────────────────────────────────────────────────────────

const RiderCard = ({ rider }: { rider: Rider }) => {
    const color = getConstructorColor(rider.constructorName ?? "")
    const medalColor = MEDAL_COLORS[rider.position - 1]
    const { first, last } = getNames(rider)
    const flag = getFlagEmoji(rider.nationality ?? "")

    return (
        <Link href={`/sports/motogp/riders/${rider.id}`} style={{ textDecoration: "none" }}>
            <div
                style={{
                    position: "relative", height: "240px",
                    overflow: "hidden", backgroundColor: color + "40",
                    isolation: "isolate",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(-4px)"
                    el.style.boxShadow = `0 16px 32px ${color}40`
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(0)"
                    el.style.boxShadow = "none"
                }}
            >
                <div style={{
                    position: "absolute", inset: 0, zIndex: 1,
                    background: "linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
                }} />
                <div style={{
                    position: "absolute", right: "-8px", bottom: "-16px",
                    fontFamily: "var(--font-display)", fontSize: "6rem",
                    fontWeight: 900, lineHeight: 1, color: "rgba(0,0,0,0.2)",
                    zIndex: 2, userSelect: "none", pointerEvents: "none",
                }}>
                    {rider.position}
                </div>
                <img
                    src={rider.photoUrl ?? FALLBACK_PHOTO}
                    alt={rider.fullName}
                    style={{
                        position: "absolute", right: 0, bottom: 0,
                        height: "85%", width: "auto",
                        objectFit: "contain", objectPosition: "bottom right",
                        zIndex: 3,
                    }}
                    onError={e => { (e.target as HTMLImageElement).src = FALLBACK_PHOTO }}
                />
                <div style={{
                    position: "relative", zIndex: 4, padding: "14px",
                    height: "100%", display: "flex", flexDirection: "column",
                    justifyContent: "space-between",
                }}>
                    {/* Top */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                        <span style={{
                            fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700,
                            color: "rgba(255,255,255,0.85)", backgroundColor: "rgba(0,0,0,0.4)",
                            padding: "2px 7px",
                        }}>
                            {rider.constructorName ?? "—"}
                        </span>
                        <span style={{
                            fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700,
                            color: medalColor ?? "rgba(255,255,255,0.5)", letterSpacing: "0.05em",
                        }}>
                            P{rider.position}
                        </span>
                    </div>
                    {/* Bottom */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                            <span style={{ fontSize: "20px" }}>{flag}</span>
                            <p style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.55)", margin: 0, fontFamily: "var(--font-display)" }}>
                                {first.toUpperCase()}
                            </p>
                        </div>
                        <p style={{
                            fontFamily: "var(--font-display)", fontSize: "1.15rem",
                            fontWeight: 700, color: "#fff", margin: "0 0 6px", lineHeight: 1,
                        }}>
                            {last.toUpperCase()}
                        </p>
                        <div style={{ display: "flex", gap: "12px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                            {[
                                { label: "PTS", value: rider.points },
                                { label: "WINS", value: rider.raceWins },
                            ].map((s, i) => (
                                <div key={s.label} style={{
                                    paddingRight: i === 0 ? "12px" : 0,
                                    borderRight: i === 0 ? "1px solid rgba(255,255,255,0.12)" : "none",
                                }}>
                                    <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: medalColor ?? "#fff", margin: 0, lineHeight: 1 }}>
                                        {s.value}
                                    </p>
                                    <p style={{ fontSize: "8px", color: "rgba(255,255,255,0.3)", margin: "2px 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                        {s.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MotoGPRidersPage() {
    const [allRiders, setAllRiders] = useState<Rider[]>([])
    const [loading, setLoading] = useState(true)
    const [classFilter, setClassFilter] = useState<ClassFilter>("MotoGP")
    const [season, setSeason] = useState(CURRENT_SEASON)
    const scrollRef = useRef<HTMLDivElement>(null)

    const scrollLeft = () => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })
    const scrollRight = () => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })

    useEffect(() => {
        setLoading(true)
        fetch(`/api/motogp/riders?year=${season}&category=all`)
            .then(r => r.json())
            .then(data => setAllRiders(data.riders ?? []))
            .catch(err => console.error("[MotoGP] riders:", err))
            .finally(() => setLoading(false))
    }, [season])

    const riders = allRiders.filter(r => r.category.replace("™", "") === classFilter)
    const top3 = riders.slice(0, 3)
    const rest = riders.slice(3)

    const counts = {
        MotoGP: allRiders.filter(r => r.category.replace("™", "") === "MotoGP").length,
        Moto2: allRiders.filter(r => r.category.replace("™", "") === "Moto2").length,
        Moto3: allRiders.filter(r => r.category.replace("™", "") === "Moto3").length,
    }

    return (
        <div>
            {/* Header */}
            <div style={{
                background: "linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 100%)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                padding: "48px 0 0",
            }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", marginBottom: "28px" }}>
                        <div>
                            <p style={{
                                fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600,
                                letterSpacing: "0.2em", textTransform: "uppercase",
                                color: MOTOGP_RED, marginBottom: "8px",
                            }}>
                                MotoGP™
                            </p>
                            <h1 style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                                fontWeight: 700, color: "#ffffff",
                                margin: "0 0 8px", lineHeight: 0.9, letterSpacing: "-0.03em",
                            }}>
                                RIDERS
                            </h1>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem", margin: 0 }}>
                                {season} FIM MotoGP™ World Championship · {riders.length} riders
                            </p>
                        </div>

                        {/* Season selector */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button onClick={scrollLeft} style={{ cursor: "pointer", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white" }}>◀</button>
                            <div
                                ref={scrollRef}
                                style={{ display: "flex", gap: "8px", overflowX: "auto", scrollBehavior: "smooth", whiteSpace: "nowrap", maxWidth: "220px", scrollbarWidth: "none" }}
                            >
                                {MOTOGP_AVAILABLE_SEASONS.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSeason(s)}
                                        style={{
                                            flex: "0 0 auto",
                                            fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 600,
                                            padding: "6px 14px", cursor: "pointer", border: "1px solid", transition: "all 0.2s",
                                            borderColor: season === s ? MOTOGP_RED : "rgba(255,255,255,0.1)",
                                            backgroundColor: season === s ? MOTOGP_RED : "transparent",
                                            color: season === s ? "#ffffff" : "rgba(255,255,255,0.4)",
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <button onClick={scrollRight} style={{ cursor: "pointer", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white" }}>▶</button>
                        </div>
                    </div>

                    {/* Class tabs */}
                    <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        {CLASS_TABS.map(cls => (
                            <button
                                key={cls}
                                onClick={() => setClassFilter(cls)}
                                style={{
                                    fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 600,
                                    letterSpacing: "0.12em", textTransform: "uppercase",
                                    padding: "10px 20px", background: "none", border: "none",
                                    cursor: "pointer", transition: "color 0.2s", marginBottom: "-1px",
                                    color: classFilter === cls ? "#ffffff" : "rgba(255,255,255,0.3)",
                                    borderBottom: classFilter === cls ? `2px solid ${MOTOGP_RED}` : "2px solid transparent",
                                }}
                            >
                                {cls}™
                                <span style={{
                                    marginLeft: "6px", fontSize: "9px",
                                    color: classFilter === cls ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.2)",
                                }}>
                                    {counts[cls]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                {loading ? (
                    <F1Loader message="LOADING RIDERS..." />
                ) : riders.length === 0 ? (
                    <div style={{ padding: "80px", textAlign: "center" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>
                            NO RIDERS FOUND FOR {classFilter}™
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Championship leaders — P2 / P1 / P3 */}
                        <div style={{ marginBottom: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                <div style={{ width: "4px", height: "22px", backgroundColor: MOTOGP_RED }} />
                                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "#ffffff", margin: 0, letterSpacing: "0.05em" }}>
                                    CHAMPIONSHIP LEADERS
                                </h2>
                            </div>
                            <div style={{ display: "flex", gap: "6px", alignItems: "flex-end" }}>
                                {[top3[1], top3[0], top3[2]].map(r => {
                                    if (!r) return null
                                    return <TopRiderCard key={r.id} rider={r} />
                                })}
                            </div>
                        </div>

                        {/* Rest */}
                        {rest.length > 0 && (
                            <div style={{ marginTop: "24px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                    <div style={{ width: "4px", height: "22px", backgroundColor: "rgba(255,255,255,0.2)" }} />
                                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.6)", margin: 0, letterSpacing: "0.05em" }}>
                                        ALL RIDERS
                                    </h2>
                                </div>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                                    gap: "6px",
                                }}>
                                    {rest.map(r => <RiderCard key={r.id} rider={r} />)}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}