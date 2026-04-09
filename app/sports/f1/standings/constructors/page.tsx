"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { getTeamColor, getFlagEmoji } from "@/types/f1/f1-api"
import type { ConstructorStanding } from "@/types/f1"
import {
  TEAM_LOGOS,
  TEAM_CARS,
  FALLBACK_CAR,
  CURRENT_SEASON,
  AVAILABLE_SEASONS,
  FALLBACK_LOGO
} from "@/lib/fi/f1-constants"
import F1Loader from "@/components/f1/F1Loader"

const SEASONS = AVAILABLE_SEASONS

export default function ConstructorStandingsPage() {
  const [season, setSeason] = useState(CURRENT_SEASON)
  const [standings, setStandings] = useState<ConstructorStanding[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/f1/constructor-standings?season=${season}`)
      .then((r) => r.json())
      .then((data) => setStandings(data.standings ?? []))
      .finally(() => setLoading(false))
  }, [season])

  useEffect(() => {
    if (!scrollRef.current) return
    const activeBtn = scrollRef.current.querySelector<HTMLElement>('[data-active="true"]')
    activeBtn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }, [season])

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })

  const leader = standings[0]

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "32px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-f1-red)",
              marginBottom: "6px",
            }}
          >
            Formula 1
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            CONSTRUCTOR STANDINGS
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem", marginTop: "8px" }}>
            {season} FIA Formula One World Championship
          </p>
        </div>

        {/* Season selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={scrollLeft}
            style={{ cursor: "pointer", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white" }}
          >
            ◀
          </button>
          <div
            ref={scrollRef}
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              scrollBehavior: "smooth",
              whiteSpace: "nowrap",
              maxWidth: "200px",
              scrollbarWidth: "none",
            }}
          >
            {SEASONS.map((s) => (
              <button
                key={s}
                data-active={season === s}
                onClick={() => setSeason(s)}
                style={{
                  flex: "0 0 auto",
                  fontFamily: "var(--font-display)",
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "6px 14px",
                  cursor: "pointer",
                  border: "1px solid",
                  transition: "all 0.2s",
                  borderColor: season === s ? "var(--color-f1-red)" : "rgba(255,255,255,0.1)",
                  backgroundColor: season === s ? "var(--color-f1-red)" : "transparent",
                  color: season === s ? "#ffffff" : "rgba(255,255,255,0.4)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={scrollRight}
            style={{ cursor: "pointer", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white" }}
          >
            ▶
          </button>
        </div>
      </div>

      {loading ? (
        <F1Loader message="LOADING CONSTRUCTORS..." />
      ) : (
        <div>
          {/* Leader card */}
          {leader && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "16px 20px",
                marginBottom: "24px",
                backgroundColor: "rgba(245,200,66,0.06)",
                border: "1px solid rgba(245,200,66,0.2)",
                borderLeft: "3px solid #F5C842",
              }}
            >
              {/* Team car thumbnail */}
              <div style={{ width: "120px", height: "72px", position: "relative", flexShrink: 0 }}>
                <img
                  src={TEAM_LOGOS[leader.constructorId] ?? FALLBACK_LOGO}
                  alt={leader.constructor.name}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK_CAR)}
                />
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "#F5C842", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 2px 0" }}>
                  {season} Championship Leader
                </p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 400, color: "#ffffff", margin: 0 }}>
                  {leader.constructor.name}
                </p>
                <p style={{ fontSize: "1.1rem", color: "rgba(192, 192, 192, 0.9)", margin: "2px 0 0 0", fontFamily: "var(--font-display)" }}>
                  {getFlagEmoji(leader.constructor.nationality ?? "")} {leader.constructor.nationality}
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 700, color: "#F5C842", margin: 0, lineHeight: 1 }}>
                  {leader.points}
                </p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", margin: "2px 0 0 0" }}>
                  Points
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1 }}>
                  {leader.wins}
                </p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", margin: "2px 0 0 0" }}>
                  Wins
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "3rem 1fr 1fr 5rem 5rem 6rem",
                padding: "12px 16px",
                backgroundColor: "rgba(255,255,255,0.03)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {["POS.", "CONSTRUCTOR", "NATIONALITY", "WINS", "GAP", "PTS"].map((h) => (
                <span
                  key={h}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.25)",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {standings.map((s, i) => {
              const teamColor = getTeamColor(s.constructorId)
              const logoSrc = TEAM_LOGOS[s.constructorId] ?? null
              const gap = i === 0 ? "—" : `-${(leader.points - s.points).toFixed(0)}`
              const isTop3 = i < 3

              return (
                <Link
                  key={s.constructorId}
                  href={`/sports/f1/teams/${s.constructorId}`}
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "3rem 1fr 1fr 5rem 5rem 6rem",
                      alignItems: "center",
                      padding: "12px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      transition: "background-color 0.15s",
                      backgroundColor: isTop3 ? `${teamColor}08` : "transparent",
                      cursor: "pointer",
                      borderLeft: `3px solid ${isTop3 ? teamColor : "transparent"}`,
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = isTop3 ? `${teamColor}08` : "transparent")}
                  >
                    {/* Position */}
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: isTop3 ? "#ffffff" : "rgba(255,255,255,0.35)",
                      }}
                    >
                      {s.position}
                    </span>

                    {/* Constructor name + logo */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {logoSrc && (
                        <img
                          src={logoSrc}
                          alt={s.constructor.name}
                          style={{ height: "20px", width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.7, flexShrink: 0 }}
                          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                        />
                      )}
                      <div>
                        <p style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.9rem", fontWeight: 400, color: "#ffffff", margin: 0 }}>
                          {s.constructor.name}
                        </p>
                      </div>
                      {/* <div style={{ width: "3px", height: "20px", backgroundColor: teamColor, flexShrink: 0 }} /> */}
                    </div>

                    {/* Nationality */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "16px" }}>{getFlagEmoji(s.constructor.nationality ?? "")}</span>
                      <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>{s.constructor.nationality}</span>
                    </div>

                    {/* Wins */}
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: s.wins > 0 ? "#ffffff" : "rgba(255,255,255,0.25)" }}>
                      {s.wins}
                    </span>

                    {/* Gap */}
                    <span style={{ fontSize: "0.85rem", color: i === 0 ? "#F5C842" : "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
                      {gap}
                    </span>

                    {/* Points */}
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "#ffffff", textAlign: "right" }}>
                      {s.points}
                    </span>
                  </div>
                </Link>
              )
            })}

            {/* Empty state */}
            {standings.length === 0 && (
              <div style={{ padding: "60px 16px", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>
                  NO DATA AVAILABLE FOR {season}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}