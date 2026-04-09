"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { AVAILABLE_SEASONS, CIRCUIT_IMAGES, CURRENT_SEASON } from "@/lib/fi/f1-constants"
import F1Loader from "@/components/f1/F1Loader"
import { getCountryFlag } from "@/types/f1/f1-api"

const SEASONS = AVAILABLE_SEASONS

interface Race {
  id: number
  season: string
  round: number
  raceName: string
  date: string
  time: string | null
  circuit: {
    circuitId: string
    circuitName: string
    locality: string | null
    country: string | null
  }
  results: {
    positionText: string
    driver: {
      givenName: string
      familyName: string
      nationality: string | null
    }
    constructor: { name: string }
    time: string | null
    status: string | null
  }[]
}

const getMonth = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", { month: "short" }).toUpperCase()

const getDay = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", { day: "numeric" })

const today = new Date().toISOString().split("T")[0]

export default function RacesPage() {
  const [season, setSeason] = useState(CURRENT_SEASON)
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "past" | "upcoming">("upcoming")
  const scrollRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    setLoading(true)
    fetch(`/api/f1/races?season=${season}`)
      .then((r) => r.json())
      .then((data) => setRaces(data.races ?? []))
      .finally(() => setLoading(false))
  }, [season])

  const nextIdx = races.findIndex((r) => r.date >= today)

  const filtered = races.filter((r) => {
    if (filter === "past") return r.date < today
    if (filter === "upcoming") return r.date >= today
    return true
  })

  const pastCount = races.filter((r) => r.date < today).length
  const upcomingCount = races.filter((r) => r.date >= today).length

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })


  return (
    <div>
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "48px 0 36px",
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "20px",
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
                  marginBottom: "8px",
                }}
              >
                Formula 1
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.5rem, 6vw, 5rem)",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: "0 0 8px 0",
                  lineHeight: 0.9,
                  letterSpacing: "-0.03em",
                }}
              >
                {season} CALENDAR
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: "0.875rem",
                  margin: 0,
                }}
              >
                {races.length} rounds · {pastCount} completed · {upcomingCount}{" "}
                remaining
              </p>
            </div>

            {/* Season selector */}
            {/* Season pills */}
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
                {SEASONS.map(s => (
                  <button
                    key={s}
                    data-active={season === s}
                    onClick={() => setSeason(s)}
                    style={{
                      flex: "0 0 auto",
                      fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 600,
                      padding: "6px 14px", cursor: "pointer", border: "1px solid", transition: "all 0.2s",
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

          {/* Filter tabs */}
          <div
            style={{
              display: "flex",
              gap: "0",
              marginTop: "24px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {(
              [
                { key: "upcoming", label: `Upcoming ${upcomingCount}` },
                { key: "past", label: `Completed ${pastCount}` },
                { key: "all", label: `All ${races.length}` },


              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "10px 16px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "color 0.2s",
                  marginBottom: "-1px",
                  color:
                    filter === tab.key ? "#ffffff" : "rgba(255,255,255,0.3)",
                  borderBottom:
                    filter === tab.key
                      ? "2px solid var(--color-f1-red)"
                      : "2px solid transparent",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading && <F1Loader message="LOADING CALENDAR..." />}

        {!loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {filtered.map((race, i) => {
              const past = race.date < today
              const next = races.indexOf(race) === nextIdx
              const winner = race.results?.find((r) => r.positionText === "1")
              const flag = getCountryFlag(race.circuit.country)

              return (
                <Link
                  key={race.id}
                  href={`/sports/f1/races/${race.round}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      background: next
                        ? "linear-gradient(180deg, rgba(27, 209, 7, 0.08), rgba(0,0,0,0.9))"
                        : "linear-gradient(180deg, rgba(19, 168, 86, 0.02), rgba(0,0,0,0.9))",
                      border: "1px solid",
                      borderColor: next
                        ? "rgba(36, 214, 9, 0.4)"
                        : "rgba(255,255,255,0.08)",
                      backdropFilter: "blur(6px)",
                      transition: "all 0.25s ease",
                      cursor: "pointer",
                      isolation: "isolate",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = "translateY(-6px) scale(1.01)"
                      el.style.boxShadow = next
                        ? "0 20px 50px rgba(13, 210, 69, 0.25)"
                        : "0 16px 40px rgba(0,0,0,0.6)"
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = "translateY(0) scale(1)"
                      el.style.boxShadow = "none"
                    }}
                  >
                    {/* Top bar */}
                    <div
                      style={{
                        height: "3px",
                        backgroundColor: next
                          ? "var(--color-f1-red)"
                          : past
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(255,255,255,0.04)",
                      }}
                    />

                    {/* Image */}
                    <div
                      style={{
                        position: "relative",
                        height: "150px",
                        overflow: "hidden",
                        backgroundColor: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <img
                        src={`/F1/circuits/images/${race.circuit.circuitId}.avif`}
                        alt={race.circuit.circuitName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          opacity: past ? 0.45 : 0.85,
                          transform: "scale(1.05)",
                          transition: "transform 0.4s ease",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                      {/* Gradient overlay */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.05) 100%)",
                        }}
                      />

                      {/* Country */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "12px",
                          left: "14px",
                          right: "14px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span style={{ fontSize: "20px" }}>{flag}</span>
                          <p
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: "1rem",
                              fontWeight: 800,
                              color: "#ffffff",
                              margin: 0,
                            }}
                          >
                            {race.circuit.country}
                          </p>
                        </div>
                      </div>

                      {/* Round */}
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "12px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "10px",
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            color: "rgba(255,255,255,0.7)",
                            backgroundColor: "rgba(0,0,0,0.7)",
                            backdropFilter: "blur(4px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            padding: "3px 8px",
                          }}
                        >
                          R{race.round}
                        </span>
                      </div>

                      {/* Status */}
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "12px",
                        }}
                      >
                        {next && (
                          <span
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: "9px",
                              fontWeight: 700,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              color: "#ffffff",
                              padding: "3px 8px",
                              background:
                                "linear-gradient(135deg, #E10600, #ff2a2a)",
                              boxShadow: "0 4px 12px rgba(225,6,0,0.4)",
                            }}
                          >
                            NEXT
                          </span>
                        )}

                        {past && !next && (
                          <span
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: "9px",
                              fontWeight: 600,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              color: "rgba(255, 255, 255, 0.5)",
                              padding: "3px 8px",
                              backgroundColor: "rgba(2, 255, 78, 0.39)",
                              border: "1px solid rgba(255,255,255,0.1)",
                            }}
                          >
                            ✓ DONE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: "16px" }}>
                      <p
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: past ? "rgba(255,255,255,0.65)" : "#ffffff",
                          margin: "0 0 6px 0",
                          lineHeight: 1.2,
                        }}
                      >
                        {race.raceName}
                      </p>

                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(255,255,255,0.35)",
                          margin: "0 0 2px 0",
                        }}
                      >
                        {race.circuit.circuitName}
                      </p>

                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(255,255,255,0.3)",
                          margin: "0 0 12px 0",
                        }}
                      >
                        🗓{" "}
                        {new Date(race.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>

                      {/* Footer */}
                      {past && winner ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            paddingTop: "12px",
                            borderTop: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <span style={{ fontSize: "14px" }}>🏆</span>
                          <span
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              color: "#F5C842",
                            }}
                          >
                            {winner.driver.givenName[0]}.{" "}
                            {winner.driver.familyName}
                          </span>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: "rgba(255,255,255,0.35)",
                            }}
                          >
                            · {winner.constructor.name}
                          </span>
                        </div>
                      ) : !past ? (
                        <div
                          style={{
                            paddingTop: "12px",
                            borderTop: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <p
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: "0.72rem",
                              color: next
                                ? "var(--color-f1-red)"
                                : "rgba(255, 255, 255, 0.25)",
                              margin: 0,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                            }}
                          >
                            {next ? "🔴 Up next" : "Upcoming"}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: "80px", textAlign: "center" }}>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "11px",
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.15em",
              }}
            >
              NO RACES FOUND
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
