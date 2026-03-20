"use client"

import Link from "next/link"
import { getTeamColor } from "@/lib/f1-api"
import type { ConstructorStanding } from "@/components/types/f1"

interface ConstructorStandingsSectionProps {
    standings: ConstructorStanding[]
}


const posStyles = [
    { label: "1ST", textColor: "#F5C842", border: "rgba(245,200,66,0.25)" },
    { label: "2ND", textColor: "#C0C0C0", border: "rgba(192,192,192,0.2)" },
    { label: "3RD", textColor: "#CD7F32", border: "rgba(205,127,50,0.2)" },
]

const ConstructorStandingsSection = ({ standings }: ConstructorStandingsSectionProps) => {
    const top3 = standings.slice(0, 3)
    const rest = standings.slice(3)
    const max = standings[0]?.points ?? 1

    return (
        <div>
            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-[var(--color-f1-red)]" />
                    <h2
                        className="text-2xl font-bold text-white"
                        style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
                    >
                        CONSTRUCTOR STANDINGS
                    </h2>
                </div>
                <Link
                    href="/sports/f1/standings"
                    className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-white/30 hover:text-white transition-colors"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    Full Standings
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M1 6H11M6 1L11 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
            </div>

            {/* Top 3 atmospheric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {top3.map((s, idx) => {
                    const teamColor = getTeamColor(s.constructorId)
                    const style = posStyles[idx]
                    const pct = (s.points / max) * 100

                    return (
                        <Link key={s.constructorId} href={`/sports/f1/standings`}>
                            <div
                                className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1"
                                style={{
                                    background: `linear-gradient(135deg, ${teamColor}30 0%, ${teamColor}08 50%, rgba(0,0,0,0) 100%)`,
                                    border: `1px solid ${style.border}`,
                                    isolation: "isolate",
                                    minHeight: "200px",
                                }}
                            >
                                {/* Top border in team color */}
                                <div
                                    className="absolute top-0 left-0 right-0 h-[3px]"
                                    style={{ backgroundColor: teamColor }}
                                />

                                {/* Large watermark position number */}
                                <div
                                    className="absolute -right-3 -bottom-6 font-bold leading-none select-none pointer-events-none"
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: "8rem",
                                        color: teamColor,
                                        opacity: 0.07,
                                    }}
                                >
                                    {idx + 1}
                                </div>

                                {/* Atmospheric glow */}
                                <div
                                    className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover:opacity-60"
                                    style={{ backgroundColor: teamColor, opacity: 0.2 }}
                                />

                                <div className="relative z-10 p-5 flex flex-col h-full">
                                    {/* Position label */}
                                    <span
                                        className="text-3xl font-bold mb-3"
                                        style={{ fontFamily: "var(--font-display)", color: style.textColor }}
                                    >
                                        {style.label}
                                    </span>

                                    {/* Team name */}
                                    <div className="flex-1">
                                        <p className="text-white/40 text-xs mb-1">{s.constructor.nationality ?? ""}</p>
                                        <p
                                            className="font-bold text-white leading-tight"
                                            style={{
                                                fontFamily: "var(--font-display)",
                                                fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
                                            }}
                                        >
                                            {s.constructor.name.toUpperCase()}
                                        </p>
                                        <p className="text-xs text-white/30 mt-1">{s.wins} wins this season</p>
                                    </div>

                                    {/* Points + bar */}
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <div className="flex items-baseline gap-1 mb-2">
                                            <span
                                                className="text-3xl font-bold"
                                                style={{ fontFamily: "var(--font-display)", color: teamColor }}
                                            >
                                                {s.points}
                                            </span>
                                            <span className="text-xs text-white/30 uppercase tracking-widest ml-1">PTS</span>
                                        </div>
                                        {/* Points bar */}
                                        <div className="h-1 bg-white/5 overflow-hidden">
                                            <div
                                                className="h-full transition-all duration-1000"
                                                style={{ width: `${pct}%`, backgroundColor: teamColor }}
                                            />
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
                <div
                    className="grid px-4 py-2"
                    style={{
                        gridTemplateColumns: "2rem 1.5rem 1fr 5rem 4rem",
                        background: "rgba(255,255,255,0.03)",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    {["POS", "", "CONSTRUCTOR", "WINS", "PTS"].map(h => (
                        <span
                            key={h}
                            className="text-[10px] font-semibold tracking-widest text-white/25 uppercase"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            {h}
                        </span>
                    ))}
                </div>

                {rest.map((s) => {
                    const teamColor = getTeamColor(s.constructorId)
                    const pct = (s.points / max) * 100

                    return (
                        <Link key={s.constructorId} href="/sports/f1/standings">
                            <div
                                className="grid items-center px-4 py-3 hover:bg-white/[0.03] transition-colors"
                                style={{
                                    gridTemplateColumns: "2rem 1.5rem 1fr 5rem 4rem",
                                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                                }}
                            >
                                <span
                                    className="text-sm font-bold text-white/30"
                                    style={{ fontFamily: "var(--font-display)" }}
                                >
                                    {s.position}
                                </span>

                                {/* Team color dot */}
                                <div
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: teamColor }}
                                />

                                {/* Name + bar */}
                                <div className="min-w-0 pr-4">
                                    <p
                                        className="text-sm font-bold text-white truncate mb-1"
                                        style={{ fontFamily: "var(--font-display)" }}
                                    >
                                        {s.constructor.name}
                                    </p>
                                    <div className="h-0.5 bg-white/5 overflow-hidden">
                                        <div
                                            className="h-full"
                                            style={{ width: `${pct}%`, backgroundColor: teamColor }}
                                        />
                                    </div>
                                </div>

                                <span className="text-xs text-white/35">{s.wins} wins</span>

                                <span
                                    className="text-sm font-bold text-right"
                                    style={{ fontFamily: "var(--font-display)", color: teamColor }}
                                >
                                    {s.points}
                                </span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default ConstructorStandingsSection