"use client"

import { useEffect, useState } from "react"
import type { Race } from "@/types/f1"
import { CURRENT_SEASON } from "@/lib/fi/f1-constants"



const useCountdown = (targetDate: string | null) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

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

const HeroSection = ({ nextRace }: { nextRace: Race | null }) => {
  const targetDate = nextRace
    ? `${nextRace.date}T${nextRace.time ?? "12:00:00"}`
    : null

  const countdown = useCountdown(targetDate)

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ minHeight: "520px" }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/F1/hero/hero-f1-3.jpg')`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.1) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(0deg, rgba(239, 13, 13, 0.23) 1%, transparent 5%)",
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--color-f1-red)]" />
      <div
        className="relative z-10 max-w-7xl mx-auto px-6 py-14 flex flex-col justify-between"
        style={{ minHeight: "520px" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-f1-red)]">
            <span
              className="text-white text-xs font-bold tracking-widest"
              style={{ fontFamily: "var(--font-display)" }}
            >
              F1
            </span>
          </div>
          <span
            className="text-white/90 text-xs tracking-widest uppercase"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {CURRENT_SEASON} Season
          </span>
        </div>
        <div className="mt-8">
          <p className="text-[var(--color-f1-red)] text-xs tracking-[0.3em] uppercase mb-3 font-semibold">
            Formula 1 World Championship
          </p>
          <h1
            className="text-white leading-none mb-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3.5rem, 8vw, 7rem)",
              letterSpacing: "-0.02em",
            }}
          >
            LIGHTS OUT.
            <br />
            <span style={{ color: "var(--color-f1-red)" }}>AWAY WE GO.</span>
          </h1>
          <p className="text-white/80 text-base max-w-sm leading-relaxed">
            Live standings, race results, lap times and circuit stats — all in
            one place.
          </p>
        </div>
        {nextRace && (
          <div className="bg-black/70 mt-10 flex flex-col sm:flex-row sm:items-end gap-6">
            {/* Race info */}
            <div className="border-l-2 border-[var(--color-f1-red)] pl-4">
              <p className="text-[var(--color-f1-red)] text-[10px] font-semibold tracking-[0.25em] uppercase mb-1">
                Next Race · Round {nextRace.round}
              </p>
              <p
                className="text-white text-2xl leading-tight mb-0.5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {nextRace.raceName}
              </p>
              <p className="text-white/80 text-sm">
                {nextRace.circuit.locality}, {nextRace.circuit.country} ·{" "}
                {new Date(nextRace.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-1 sm:ml-auto">
              {[
                { value: countdown.days, label: "D" },
                { value: countdown.hours, label: "H" },
                { value: countdown.minutes, label: "M" },
                { value: countdown.seconds, label: "S" },
              ].map((unit, i) => (
                <div key={unit.label} className="flex items-center">
                  <div className="text-center px-3 py-2 bg-black/60 border border-white/10 min-w-[56px]">
                    <div
                      className="text-3xl font-bold text-white/60 tabular-nums leading-none"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {String(unit.value).padStart(2, "0")}
                    </div>
                    <div className="text-[12px] text-white/60 tracking-widest mt-0.5 uppercase">
                      {unit.label}
                    </div>
                  </div>
                  {i < 3 && (
                    <span className="text-white font-bold mx-0.5">:</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HeroSection
