"use client"

import { useState } from "react"
import Link from "next/link"
import { getTeamColor, getFlagEmoji } from "@/lib/f1-api"
import SectionHeader from "./SectionHeader"
import type { DriverStanding } from "@/components/types/f1"



const DRIVER_IMAGES: Record<string, string> = {
    max_verstappen:
        "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png",
    norris:
        "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png",
    leclerc:
        "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png",
    piastri:
        "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png",
    sainz:
        "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png",
    hamilton:
        "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png",
    russell:
        "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png",
    alonso:
        "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png",
    perez:
        "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png",
}

const getDriverImage = (driverId: string): string => {
    return (
        DRIVER_IMAGES[driverId] ??
        `https://ui-avatars.com/api/?name=${driverId}&background=1a1a1a&color=fff&size=200`
    )
}

const DriverStandingsSection = ({
    standings,
}: {
    standings: DriverStanding[]
}) => {
    const [showAll, setShowAll] = useState(false)

    const top3 = standings.slice(0, 3)
    const rest = standings.slice(3)
    const visible = showAll ? rest : rest.slice(0, 7)

    const posStyles = [
        { pos: "1ST", color: "#F5C842", bg: "rgba(245,200,66,0.08)", border: "rgba(245,200,66,0.2)" },
        { pos: "2ND", color: "#C0C0C0", bg: "rgba(192,192,192,0.06)", border: "rgba(192,192,192,0.15)" },
        { pos: "3RD", color: "#CD7F32", bg: "rgba(205,127,50,0.06)", border: "rgba(205,127,50,0.15)" },
    ]

    return (
        <div>
            <SectionHeader title="2025 SEASON" href="/sports/f1/standings" label="Full Standings" />

            {/* Tabs */}
            <div className="flex items-center gap-0 mb-6 border-b border-white/5">
                <button
                    className="px-4 py-2 text-xs font-semibold tracking-widest uppercase border-b-2 border-[var(--color-f1-red)] text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    Drivers
                </button>
                <Link
                    href="/sports/f1/standings"
                    className="px-4 py-2 text-xs font-semibold tracking-widest uppercase border-b-2 border-transparent text-white/30 hover:text-white transition-colors"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    Teams
                </Link>
            </div>

            {/* Top 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {top3.map((s, idx) => {
                    const style = posStyles[idx]
                    const teamColor = getTeamColor(s.constructorId)

                    return (
                        <Link key={s.driverId} href={`/sports/f1/drivers/${s.driverId}`}>
                            <div
                                className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1"
                                style={{
                                    background: style.bg,
                                    border: `1px solid ${style.border}`,
                                    isolation: "isolate",
                                }}
                            >
                                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: teamColor }} />

                                <div
                                    className="absolute -right-2 -bottom-4 font-bold leading-none select-none pointer-events-none"
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: "7rem",
                                        color: style.color,
                                        opacity: 0.08,
                                    }}
                                >
                                    {idx + 1}
                                </div>

                                <div className="relative z-10 p-5 flex gap-4">
                                    <div className="w-16 h-20 shrink-0 overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
                                        <img
                                            src={getDriverImage(s.driverId)}
                                            alt={s.driver.familyName}
                                            className="w-full h-full object-cover object-top"
                                            onError={(e) => {
                                                ; (e.target as HTMLImageElement).style.display = "none"
                                            }}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <span
                                            className="text-xs font-bold"
                                            style={{ color: style.color, fontFamily: "var(--font-display)" }}
                                        >
                                            {style.pos}
                                        </span>
                                        <p className="text-white/50 text-xs mt-1">
                                            {getFlagEmoji(s.driver.nationality ?? "")}
                                        </p>
                                        <p className="text-white/60 text-sm mt-0.5">{s.driver.givenName}</p>
                                        <p
                                            className="text-white font-bold leading-tight"
                                            style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}
                                        >
                                            {s.driver.familyName}
                                        </p>
                                        <p className="text-white/30 text-xs mt-1 truncate">{s.constructorName}</p>
                                    </div>
                                </div>

                                <div
                                    className="px-5 pb-4 flex items-baseline gap-1"
                                    style={{ borderTop: `1px solid ${style.border}` }}
                                >
                                    <span
                                        className="text-3xl font-bold"
                                        style={{ fontFamily: "var(--font-display)", color: style.color }}
                                    >
                                        {s.points}
                                    </span>
                                    <span className="text-xs text-white/30 uppercase tracking-widest ml-1">
                                        PTS
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Table */}
            <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <div
                    className="grid px-4 py-2"
                    style={{
                        gridTemplateColumns: "2rem 1.5rem 1fr 1fr 4rem",
                        background: "rgba(255,255,255,0.03)",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    {["POS", "", "DRIVER", "TEAM", "PTS"].map((h) => (
                        <span
                            key={h}
                            className="text-[10px] font-semibold tracking-widest text-white/25 uppercase"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            {h}
                        </span>
                    ))}
                </div>

                {visible.map((s) => {
                    const teamColor = getTeamColor(s.constructorId)

                    return (
                        <Link key={s.driverId} href={`/sports/f1/drivers/${s.driverId}`}>
                            <div
                                className="grid items-center px-4 py-3 hover:bg-white/[0.03] transition-colors"
                                style={{
                                    gridTemplateColumns: "2rem 1.5rem 1fr 1fr 4rem",
                                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                                }}
                            >
                                <span className="text-sm font-bold text-white/40" style={{ fontFamily: "var(--font-display)" }}>
                                    {s.position}
                                </span>
                                <span className="text-sm">
                                    {getFlagEmoji(s.driver.nationality ?? "")}
                                </span>
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-0.5 h-5 shrink-0" style={{ backgroundColor: teamColor }} />
                                    <span className="text-sm font-semibold text-white truncate">
                                        {s.driver.givenName[0]}.{" "}
                                        <span className="font-bold">{s.driver.familyName}</span>
                                    </span>
                                </div>
                                <span className="text-xs text-white/35 truncate">{s.constructorName}</span>
                                <span className="text-sm font-bold text-white text-right" style={{ fontFamily: "var(--font-display)" }}>
                                    {s.points}
                                </span>
                            </div>
                        </Link>
                    )
                })}

                <button
                    onClick={() => setShowAll((v) => !v)}
                    className="w-full py-3 text-xs font-semibold tracking-widest uppercase text-white/25 hover:text-white hover:bg-white/[0.03] transition-all flex items-center justify-center gap-2"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    {showAll ? "SHOW LESS ↑" : "SHOW ALL ↓"}
                </button>
            </div>
        </div>
    )
}

export default DriverStandingsSection