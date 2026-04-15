"use client"

import { CURRENT_SEASON } from "@/lib/motogp/motogp-constants"
import { useEffect, useState } from "react"



interface MotoGPEvent {
    id: string
    name: string
    shortName: string
    sponsoredName?: string | null
    dateStart: string
    dateEnd: string
    circuit?: {
        name: string
        place?: string | null
        nation?: string | null
    } | null
}


const useCountdown = (targetDate: string | null) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

    useEffect(() => {
        if (!targetDate) return
        const target = new Date(targetDate).getTime()

        const tick = () => {
            const diff = target - Date.now()
            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
                return
            }
            setTimeLeft({
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
            })
        }

        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [targetDate])

    return timeLeft
}


const MotoGPHero = ({ nextEvent }: { nextEvent: MotoGPEvent | null }) => {

    const countdown = useCountdown(nextEvent ? nextEvent.dateEnd : null)
    return (
        <div className="relative w-full overflow-hidden" style={{ minHeight: "520px" }}>
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('/motogp/hero/hero-motogp-2.jpg')`, backgroundColor: "#0a0a0a" }}
            />
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 65%, rgba(0,0,0,0.15) 100%)",
                }}
            />

            <div
                className="absolute inset-0"
                style={{
                    background:
                        "linear-gradient(0deg, color-mix(in srgb, var(--accent) 23%, transparent) 1%, transparent 5%)",
                }}
            />

            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--accent)] opacity-30" />
            <div
                className="relative z-10 max-w-7xl mx-auto px-6 py-14 flex flex-col justify-between"
                style={{ minHeight: "520px" }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="px-2 py-1 text-white text-xs font-bold tracking-widest bg-[var(--accent)]"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        MOTOGP
                    </div>
                    <span
                        className="text-white/70 text-xs tracking-widest uppercase"
                        style={{ fontFamily: "var(--font-sans)" }}
                    >
                        {CURRENT_SEASON} Season World Championship
                    </span>
                </div>
                <div className="mt-8">
                    <p className="text-[var(--accent)] text-xs tracking-[0.3em] uppercase mb-3 font-semibold">
                        MotoGP World Championship
                    </p>
                    <h1
                        className="text-white leading-none mb-4"
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "clamp(3.5rem, 8vw, 7rem)",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        FULL THROTTLE.
                        <br />
                        <span style={{ color: "var(--accent)" }}>NO LIMITS.</span>
                    </h1>
                    <p className="text-white/75 text-base max-w-sm leading-relaxed">
                        Live standings, race results and rider stats for MotoGP, Moto2 and Moto3.
                    </p>
                </div>
                {nextEvent && (
                    <div className="bg-black/30 py-2 mt-10 flex flex-col sm:flex-row sm:items-end gap-6">
                        {/* Race info */}
                        <div className="pl-4" style={{ borderLeft: "2px solidvar(--accent)" }}>
                            <p
                                className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-1"
                                style={{ color: 'var(--accent)' }}
                            >
                                Next Race
                            </p>
                            <p
                                className="text-white text-2xl leading-tight mb-0.5"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                {(nextEvent.sponsoredName ?? nextEvent.name).toUpperCase()}
                            </p>
                            <p className="text-white/75 text-sm">
                                {nextEvent.circuit?.place ?? nextEvent.circuit?.name ?? "—"}
                                {nextEvent.circuit?.nation ? `, ${nextEvent.circuit.nation}` : ""} ·{" "}
                                {new Date(nextEvent.dateEnd).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                        </div>

                        {/* Countdown blocks */}
                        <div className="flex items-center gap-1 sm:ml-auto">
                            {[
                                { value: countdown.days, label: "D" },
                                { value: countdown.hours, label: "H" },
                                { value: countdown.minutes, label: "M" },
                                { value: countdown.seconds, label: "S" },
                            ].map((unit, i) => (
                                <div key={unit.label} className="flex items-center">
                                    <div
                                        className="text-center px-3 py-2 bg-black/60 border border-white/10 min-w-[56px]"

                                    >
                                        <div
                                            className="text-3xl font-bold text-white/60 tabular-nums leading-none"
                                            style={{ fontFamily: "var(--font-display)" }}
                                        >
                                            {String(unit.value).padStart(2, "0")}
                                        </div>
                                        <div className="text-[11px] text-white/50 tracking-widest mt-0.5 uppercase">
                                            {unit.label}
                                        </div>
                                    </div>
                                    {i < 3 && (
                                        <span className="text-white/60 font-bold mx-0.5 text-lg">:</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {!nextEvent && (
                    <div className="mt-10 pl-4" style={{ borderLeft: "2px solid var(--accent)}" }}>
                        <p className="text-white/50 text-sm">Season schedule loading...</p>
                    </div>
                )}
            </div>
        </div>


    )
}

export default MotoGPHero