"use client"

import Link from "next/link"
import { FALLBACK_RIDER } from "@/lib/motogp/motogp-constants"
import { getConstructorColor } from "@/components/motogp/MotoGPRiderStandings"


// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFlagEmoji(iso: string): string {
    if (!iso || iso.length !== 2) return ""
    return iso.toUpperCase().replace(/./g, c =>
        String.fromCodePoint(c.charCodeAt(0) + 127397)
    )
}


// ─── Types ────────────────────────────────────────────────────────────────────

interface Rider {
    id: string
    fullName: string
    nationality?: string | null
    number?: number | null
    photoUrl?: string | null
}

interface RaceResult {
    position?: number | null
    status?: string | null
    points?: number | null
    time?: string | null
    gapFirst?: string | null
    totalLaps?: number | null
    averageSpeed?: number | null
    rider: Rider
    team?: { id: string; name: string } | null
    constructor?: { id: string; name: string } | null
}

interface Event {
    id: string
    name: string
    shortName?: string | null
    sponsoredName?: string | null
    dateEnd: string
    circuit?: { name: string; place?: string | null; nation?: string | null } | null
}

// ─── Podium card ─────────────────────────────────────────────────────────────

const PodiumCard = ({ result, rank, eventId }: { result: RaceResult; rank: number; eventId: string }) => {
    const color = getConstructorColor(result.constructor?.name ?? "")
    const photoUrl = result.rider.photoUrl ?? FALLBACK_RIDER
    const nameParts = result.rider.fullName.split(" ")
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(" ")
    const heights = ["280px", "250px", "240px"]
    const medalColors = ["#F5C842", "#C0C0C0", "#CD7F32"]

    return (
        <Link
            href={`/sports/motogp/riders/${result.rider.id}`}
            style={{ textDecoration: "none", flex: rank === 1 ? "1.2" : "1" }}
        >
            <div
                style={{
                    position: "relative",
                    height: heights[rank - 1],
                    overflow: "hidden",
                    cursor: "pointer",
                    backgroundColor: color,
                    isolation: "isolate",
                    transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(-4px)"
                    el.style.boxShadow = `0 16px 40px ${color}50`
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(0)"
                    el.style.boxShadow = "none"
                }}
            >
                {/* Gradient overlay */}
                <div style={{
                    position: "absolute", inset: 0, zIndex: 1,
                    background: "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
                }} />

                {/* Rank watermark */}
                <div style={{
                    position: "absolute", right: "5px", bottom: "-20px",
                    fontFamily: "var(--font-display)", fontSize: "9rem",
                    fontWeight: 900, lineHeight: 1,
                    color: "rgba(0,0,0,0.3)", zIndex: 2,
                    userSelect: "none", pointerEvents: "none",
                }}>
                    {rank}
                </div>

                {/* Rider photo */}
                <img
                    src={photoUrl}
                    alt={result.rider.fullName}
                    style={{
                        position: "absolute", right: 0, bottom: 0,
                        height: "100%", width: "auto",
                        objectFit: "contain", objectPosition: "bottom right",
                        zIndex: 3,
                    }}
                    onError={e => { (e.target as HTMLImageElement).src = FALLBACK_RIDER }}
                />

                {/* Content */}
                <div style={{
                    position: "relative", zIndex: 4,
                    padding: "14px 16px", height: "100%",
                    display: "flex", flexDirection: "column",
                    justifyContent: "space-between",
                }}>
                    {/* Top — constructor + position */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <span style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "11px", fontWeight: 700,
                            color: "rgba(255,255,255,0.9)",
                            backgroundColor: "rgba(0,0,0,0.4)",
                            padding: "2px 8px",
                        }}>
                            {result.constructor?.name ?? "—"}
                        </span>
                        <span style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.85rem", fontWeight: 700,
                            color: "rgba(255,255,255,0.9)",
                            letterSpacing: "0.1em",
                        }}>
                            P{rank}
                        </span>
                    </div>

                    {/* Bottom — name + time + stats */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                            <span style={{ fontSize: "16px" }}>
                                {getFlagEmoji(result.rider.nationality ?? "")}
                            </span>
                            <p style={{
                                fontFamily: "var(--font-display)", fontSize: "0.75rem",
                                color: "rgba(255,255,255,0.65)", margin: 0,
                            }}>
                                {firstName}
                            </p>
                        </div>

                        <p style={{
                            fontFamily: "var(--font-display)",
                            fontSize: rank === 1 ? "1.4rem" : "1.2rem",
                            fontWeight: 700, color: "#fff",
                            margin: 0, lineHeight: 1.1,
                        }}>
                            {lastName.toUpperCase()}
                        </p>

                        <p style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.8rem", fontWeight: 400,
                            color: "#fff",
                            margin: "6px 0 0 0",
                        }}>
                            {rank === 1 ? result.time : result.gapFirst ? `+${result.gapFirst}` : result.time ?? result.status}
                        </p>

                        {/* Stats bar */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            paddingTop: "8px",
                            borderTop: "1px solid rgba(255,255,255,0.1)",
                            marginTop: "auto",
                        }}>
                            {[
                                { label: "Laps", value: result.totalLaps ?? "—" },
                                { label: "Pts", value: `+${result.points ?? 0}` },
                                { label: "Avg", value: result.averageSpeed ? `${result.averageSpeed}` : "—" },
                            ].map(item => (
                                <div key={item.label} style={{ textAlign: "center" }}>
                                    <p style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: "0.75rem", fontWeight: 700,
                                        color: "#fff", margin: 0,
                                    }}>
                                        {item.value}
                                    </p>
                                    <p style={{
                                        fontSize: "9px", color: "rgba(255,255,255,0.4)",
                                        margin: 0, letterSpacing: "0.1em", textTransform: "uppercase",
                                    }}>
                                        {item.label}
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

// ─── Main component ───────────────────────────────────────────────────────────


type Category = "MotoGP" | "Moto2" | "Moto3"

interface Props {
    event: Event | null
    results: RaceResult[]
}

const MotoGPLastRace = ({ event, results }: Props) => {
    if (!event || results.length === 0) return null


    // const top3 = results.slice(0, 3)
    const podiumOrder = [results[1], results[0], results[2]]
    const tableResults = results.slice(3)

    type Value = string | number | null | undefined;

    const formatPosition = (v: Value): string => {
        if (v === null || v === undefined) return "";

        const s = String(v).trim();

        if (!s) return "";

        if (["OUTSTND", "N/A", "NA", "-"].includes(s)) return "";

        return s;
    };
    const isZeroGap = (v: any) =>
        v == null ||
        Number(v) === 0;
    return (
        <div className="bg-black p-6 mb-10 ">

            {/* Section header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
            }}>
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
                        }}
                    >
                        LAST RACE
                    </h2>
                </div>

                <Link
                    href={`/sports/motogp/races/${event.id}`}
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
                    Full Results →
                </Link>
            </div>
            <div
                style={{
                    padding: "14px 16px",
                    marginBottom: "20px",
                    borderLeft: "3px solid var(--accent)",
                    backgroundColor: `color-mix(in srgb, var(--accent) 10%, transparent)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >

                <div>
                    <p
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: "#ffffff",
                            margin: 0,
                        }}
                    >
                        {event.sponsoredName}
                    </p>

                    <p
                        style={{
                            fontSize: "0.8rem",
                            color: "rgba(255,255,255,0.7)",
                            margin: "4px 0 0 0",
                            fontFamily: "var(--font-roboto)",
                        }}
                    >
                        {new Date(event.dateEnd).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                    </p>
                </div>

                {/* RIGHT CTA (like F1) */}
                <Link
                    href={`/sports/motogp/races/${event.id}`} // adjust if needed
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "#ffffff",
                        textDecoration: "none",
                        padding: "8px 16px",
                        border: "1px solid rgba(255,255,255,0.2)",
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement
                        el.style.backgroundColor = "rgba(255,255,255,0.05)"
                        el.style.borderColor = "rgba(255,255,255,0.4)"
                    }}
                    onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement
                        el.style.backgroundColor = "transparent"
                        el.style.borderColor = "rgba(255,255,255,0.2)"
                    }}
                >
                    Full Results
                </Link>
            </div>
            {/* Podium cards — P2 / P1 / P3 */}
            <div
                style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "24px",
                    alignItems: "flex-end",
                }}
            >
                {podiumOrder.map((r, idx) => {
                    if (!r) return null
                    const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3
                    return <PodiumCard key={r.rider.id} result={r} rank={rank} eventId={event.id} />
                })}
            </div>

            {/* Results table */}
            <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>

                {/* Header */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "3rem 2.5rem 1fr 1fr 1fr 7rem",
                    padding: "10px 16px",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}>
                    {["POS.", "", "RIDER", "NATIONALITY", "CONSTRUCTOR", "TIME / GAP"].map(h => (
                        <span key={h} style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "10px", fontWeight: 600,
                            letterSpacing: "0.15em", textTransform: "uppercase",
                            color: "rgba(255,255,255,0.25)",
                        }}>
                            {h}
                        </span>
                    ))}
                </div>

                {/* Rows */}
                {tableResults.map((r, i) => {
                    const color = getConstructorColor(r.constructor?.name ?? "")
                    const photoUrl = r.rider.photoUrl ?? FALLBACK_RIDER
                    const nameParts = r.rider.fullName.split(" ")
                    const initial = nameParts[0]?.[0] ?? ""
                    const lastName = nameParts.slice(1).join(" ")

                    return (
                        <Link
                            key={r.rider.id}
                            href={`/sports/motogp/riders/${r.rider.id}`}
                            style={{ textDecoration: "none", display: "block" }}
                        >
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "3rem 2.5rem 1fr 1fr 1fr 7rem",
                                    alignItems: "center",
                                    padding: "10px 16px",
                                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                                    cursor: "pointer", transition: "background-color 0.15s",
                                }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.03)"}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
                            >
                                {/* Position */}
                                <span style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "0.9rem", fontWeight: 700,
                                    color: i < 3 ? "#fff" : "rgba(255,255,255,0.4)",
                                }}>
                                    {formatPosition(r.position) ||
                                        formatPosition(r.status) ||
                                        "—"}
                                </span>

                                {/* Avatar */}
                                <div style={{
                                    width: "28px", height: "28px",
                                    borderRadius: "50%", overflow: "hidden",
                                    backgroundColor: `${color}40`,
                                    border: `1px solid ${color}60`,
                                }}>
                                    <img
                                        src={photoUrl}
                                        alt={r.rider.fullName}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            objectPosition: "top",
                                        }}
                                        onError={e => { (e.target as HTMLImageElement).src = FALLBACK_RIDER }}
                                    />
                                </div>

                                {/* Rider name */}
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

                                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", fontFamily: "var(--font-inter)", }}>
                                        {initial}. {lastName}
                                    </span>
                                </div>

                                {/* Nationality */}
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{ fontSize: "14px" }}>
                                        {getFlagEmoji(r.rider.nationality ?? "")}
                                    </span>
                                    <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                                        {r.rider.nationality}
                                    </span>
                                </div>

                                {/* Constructor */}
                                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                                    {r.constructor?.name ?? "—"}
                                </span>

                                {/* Time / gap */}
                                <span style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "0.8rem", color: "rgba(255,255,255,0.5)",
                                    textAlign: "right",
                                }}>
                                    {i === 0
                                        ? (r.time ?? "—")
                                        : (r.gapFirst && Number(r.gapFirst) !== 0
                                            ? `+${r.gapFirst}`
                                            : (r.status ?? "—"))
                                    }
                                </span>
                            </div>
                        </Link>
                    )
                })}

                {/* View full results */}
                <Link
                    href={`/sports/motogp/races/${event.id}`}
                    style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "center", gap: "6px",
                        padding: "12px",
                        fontFamily: "var(--font-display)",
                        fontSize: "11px", fontWeight: 600,
                        letterSpacing: "0.15em", textTransform: "uppercase",
                        color: "rgba(255,255,255,0.3)",
                        textDecoration: "none", transition: "color 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#fff"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"}
                >
                    View Full Results →
                </Link>
            </div>
        </div>
    )
}

export default MotoGPLastRace