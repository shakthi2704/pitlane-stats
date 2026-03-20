import Link from "next/link"
import { getTeamColor, getFlagEmoji } from "@/lib/f1-api"
import SectionHeader from "./SectionHeader"
import type { Race, RaceResult } from "@/components/types/f1"

interface LastRaceSectionProps {
    race: Race | null
    results: RaceResult[]
}

const LastRaceSection = ({ race, results }: LastRaceSectionProps) => {
    if (!race || results.length === 0) return null
    const rest = results.slice(3, 10)

    const podiumOrder = [
        { r: results[1], medal: "🥈", border: "border-zinc-400/20", bg: "bg-zinc-400/10" },
        { r: results[0], medal: "🥇", border: "border-yellow-400/20", bg: "bg-yellow-400/10" },
        { r: results[2], medal: "🥉", border: "border-amber-600/20", bg: "bg-amber-600/10" },
    ]

    return (
        <div>
            <SectionHeader
                title="Last Race"
                href={`/sports/f1/races/${race.round}`}
                label="Full Results"
            />

            {/* Race info */}
            <div className="p-4 border border-white/5 bg-white/[0.02] mb-6">
                <p
                    className="text-lg font-black text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    {race.raceName}
                </p>
                <p className="text-xs text-white/30 mt-0.5">
                    {race.circuit.locality}, {race.circuit.country} · Round {race.round} ·{" "}
                    {new Date(race.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                    })}
                </p>
            </div>

            {/* Podium */}
            <div className="grid grid-cols-3 gap-2 mb-6">
                {podiumOrder.map(({ r, medal, border, bg }) => {
                    if (!r) return null
                    const teamColor = getTeamColor(r.constructor.constructorId)

                    return (
                        <div
                            key={r.driver.driverId}
                            className={`border ${border} ${bg} p-3 text-center`}
                        >
                            <div className="text-2xl mb-2">{medal}</div>
                            <div
                                className="w-6 h-0.5 mx-auto mb-2"
                                style={{ backgroundColor: teamColor }}
                            />
                            <p
                                className="text-sm font-black text-white"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                {r.driver.familyName}
                            </p>
                            <p className="text-[10px] text-white/30 mt-0.5">
                                {r.constructor.name}
                            </p>
                            <p className="text-xs text-white/40 mt-1 font-mono">
                                {r.time ?? r.status}
                            </p>
                        </div>
                    )
                })}
            </div>

            {/* Positions 4–10 */}
            <div className="border border-white/5">
                {rest.map((r) => {
                    const teamColor = getTeamColor(r.constructor.constructorId)
                    const isFastest = r.fastestLapRank === 1

                    return (
                        <div
                            key={r.driver.driverId}
                            className="flex items-center gap-4 px-4 py-2.5 border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                        >
                            <span
                                className="w-5 text-sm font-bold text-white/30 text-center"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                {r.positionText}
                            </span>

                            <div
                                className="w-0.5 h-6 rounded-full shrink-0"
                                style={{ backgroundColor: teamColor }}
                            />

                            <div className="flex-1">
                                <p className="text-sm font-bold text-white">
                                    {getFlagEmoji(r.driver.nationality ?? "")}{" "}
                                    {r.driver.givenName[0]}. {r.driver.familyName}
                                    {isFastest && (
                                        <span className="ml-1 text-purple-400 text-xs">⚡</span>
                                    )}
                                </p>
                                <p className="text-xs text-white/25">
                                    {r.constructor.name}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-xs font-mono text-white/40">
                                    {r.time ?? r.status}
                                </p>
                                <p className="text-xs text-white/25">
                                    {r.points} pts
                                </p>
                            </div>
                        </div>
                    )
                })}

                <Link
                    href={`/sports/f1/races/${race.round}`}
                    className="flex items-center justify-center gap-2 py-3 text-xs font-bold tracking-widest uppercase text-white/30 hover:text-white hover:bg-white/[0.03] transition-all"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    View Full Results →
                </Link>
            </div>
        </div>
    )
}

export default LastRaceSection