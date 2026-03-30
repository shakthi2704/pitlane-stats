"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getTeamColor, getFlagEmoji } from "@/types/f1/f1-api"
import {
  DRIVER_IMAGES,
  FALLBACK_DRIVER,
  TEAM_LOGOS,
} from "@/lib/fi/f1-constants"
import F1Loader from "@/components/f1/F1Loader"
import { CIRCUIT_STATIC } from "@/lib/fi/circuit-data"

interface Circuit {
  circuitId: string
  circuitName: string
  locality: string | null
  country: string | null
  lat: string | null
  lng: string | null
  races: Race[]
}

interface RaceResult {
  position: number | null
  positionText: string
  points: number | null
  time: string | null
  status: string | null
  grid: number | null
  laps: number | null
  fastestLapTime: string | null
  fastestLapRank: number | null
  fastestLapNumber: number | null
  fastestLapSpeed: string | null
  driver: {
    driverId: string
    code: string | null
    givenName: string
    familyName: string
    nationality: string | null
  }
  constructor: {
    constructorId: string
    name: string
  }
}

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
    lat: string | null
    lng: string | null
  }
  results: RaceResult[]
}

interface LapTime {
  id: number
  lapNumber: number
  driverId: string
  time: string
  timeMs: number | null
  position: number | null
  driver: {
    driverId: string
    code: string | null
    givenName: string
    familyName: string
  }
}

const SEASON = "2025"

const PodiumCard = ({ result, rank }: { result: RaceResult; rank: number }) => {
  const teamColor = getTeamColor(result.constructor.constructorId)
  const imgSrc = DRIVER_IMAGES[result.driver.driverId] ?? FALLBACK_DRIVER
  const logoSrc = TEAM_LOGOS[result.constructor.constructorId] ?? null
  const medalColors = ["#F5C842", "#C0C0C0", "#CD7F32"]
  const medalColor = medalColors[rank - 1]
  const heights = ["320px", "280px", "260px"]

  return (
    <div
      style={{
        position: "relative",
        height: heights[rank - 1],
        overflow: "hidden",
        backgroundColor: teamColor,
        isolation: "isolate",
        flex: rank === 1 ? "1.3" : "1",
      }}
    >
      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.0) 100%)",
          zIndex: 1,
        }}
      />

      {/* Watermark number */}
      <div
        style={{
          position: "absolute",
          right: "-15px",
          bottom: "-25px",
          fontFamily: "var(--font-display)",
          fontSize: "12rem",
          fontWeight: 900,
          lineHeight: 1,
          color: "rgba(0,0,0,0.2)",
          zIndex: 2,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {rank}
      </div>

      {/* Driver image */}
      <img
        src={imgSrc}
        alt={result.driver.familyName}
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          height: "100%",
          width: "auto",
          objectFit: "contain",
          objectPosition: "top right",
          zIndex: 3,
        }}
        onError={(e) => {
          ;(e.target as HTMLImageElement).src = FALLBACK_DRIVER
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 4,
          padding: "20px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top — logo + position */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={result.constructor.name}
              style={{
                height: "28px",
                width: "auto",
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
                opacity: 0.9,
              }}
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = "none"
              }}
            />
          ) : (
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "11px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.9)",
                backgroundColor: "rgba(0,0,0,0.35)",
                padding: "2px 8px",
              }}
            >
              {result.constructor.name.slice(0, 3).toUpperCase()}
            </span>
          )}
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 700,
              color: medalColor,
              letterSpacing: "0.1em",
            }}
          >
            P{rank}
          </span>
        </div>

        {/* Bottom — driver info + stats */}
        <div>
          {/* Flag + first name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "2px",
            }}
          >
            <span style={{ fontSize: "20px" }}>
              {getFlagEmoji(result.driver.nationality ?? "")}
            </span>
            <p
              style={{
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.65)",
                margin: 0,
              }}
            >
              {result.driver.givenName}
            </p>
          </div>

          {/* Last name */}
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: rank === 1 ? "1.8rem" : "1.5rem",
              fontWeight: 700,
              color: "#ffffff",
              margin: "0 0 4px 0",
              lineHeight: 1,
            }}
          >
            {result.driver.familyName.toUpperCase()}
          </p>

          {/* Team */}
          <p
            style={{
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.5)",
              margin: "0 0 12px 0",
            }}
          >
            {result.constructor.name}
          </p>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: "0",
              borderTop: "1px solid rgba(255,255,255,0.15)",
              paddingTop: "12px",
            }}
          >
            {[
              { label: "Time", value: result.time ?? result.status ?? "—" },
              { label: "Grid", value: result.grid ? `P${result.grid}` : "—" },
              { label: "Pts", value: `+${result.points ?? 0}` },
              ...(result.fastestLapRank === 1
                ? [{ label: "FL", value: result.fastestLapTime ?? "⚡" }]
                : []),
            ].map((stat, i, arr) => (
              <div
                key={stat.label}
                style={{
                  flex: 1,
                  paddingRight: i < arr.length - 1 ? "12px" : 0,
                  borderRight:
                    i < arr.length - 1
                      ? "1px solid rgba(255,255,255,0.15)"
                      : "none",
                  marginRight: i < arr.length - 1 ? "12px" : 0,
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: stat.label === "FL" ? "#a855f7" : medalColor,
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontSize: "0.6rem",
                    color: "rgba(255,255,255,0.35)",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const SectionHeader = ({ title }: { title: string }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "16px",
    }}
  >
    <div
      style={{
        width: "4px",
        height: "22px",
        backgroundColor: "var(--color-f1-red)",
      }}
    />
    <h2
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "1.2rem",
        fontWeight: 700,
        color: "#ffffff",
        margin: 0,
      }}
    >
      {title}
    </h2>
  </div>
)

export default function RaceDetailPage() {
  const params = useParams()
  const round = params.round as string

  const [race, setRace] = useState<Race | null>(null)
  const [lapTimes, setLapTimes] = useState<LapTime[]>([])
  const [loadingRace, setLoadingRace] = useState(true)
  const [loadingLaps, setLoadingLaps] = useState(false)
  const [showAllResults, setShowAllResults] = useState(false)
  const [showLaps, setShowLaps] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<string>("all")

  useEffect(() => {
    setLoadingRace(true)
    fetch(`/api/f1/race-results?season=${SEASON}&round=${round}`)
      .then((r) => r.json())
      .then((data) => setRace(data.race ?? null))
      .finally(() => setLoadingRace(false))
  }, [round])

  const loadLapTimes = () => {
    if (lapTimes.length > 0) {
      setShowLaps(true)
      return
    }
    setLoadingLaps(true)
    fetch(`/api/f1/lap-times?season=${SEASON}&round=${round}`)
      .then((r) => r.json())
      .then((data) => setLapTimes(data.lapTimes ?? []))
      .finally(() => {
        setLoadingLaps(false)
        setShowLaps(true)
      })
  }

  if (loadingRace) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <F1Loader message="Loading Race Data..." />
      </div>
    )
  }

  if (!race) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            RACE NOT FOUND
          </p>
          <Link
            href="/sports/f1/races"
            style={{
              color: "var(--color-f1-red)",
              textDecoration: "none",
              fontSize: "0.85rem",
            }}
          >
            ← Back to Calendar
          </Link>
        </div>
      </div>
    )
  }

  const results = race.results ?? []
  const podium = [results[1], results[0], results[2]]
  const tableResults = showAllResults ? results : results.slice(3, 13)
  const fastestLap = results.find((r) => r.fastestLapRank === 1)

  // Group lap times by driver for filtering
  const drivers = Array.from(new Set(lapTimes.map((l) => l.driverId)))
    .map((id) => lapTimes.find((l) => l.driverId === id)?.driver)
    .filter(Boolean)

  const filteredLaps =
    selectedDriver === "all"
      ? lapTimes.slice(0, 200)
      : lapTimes.filter((l) => l.driverId === selectedDriver)

  const fastestLapMs = Math.min(
    ...filteredLaps.map((l) => l.timeMs ?? Infinity),
  )

  return (
    <div>
      {/* Hero banner */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-10 ">
          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <Link
              href="/sports/f1"
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.3)",
                textDecoration: "none",
                fontFamily: "var(--font-display)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              F1
            </Link>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>
              /
            </span>
            <Link
              href="/sports/f1/races"
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.3)",
                textDecoration: "none",
                fontFamily: "var(--font-display)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Races
            </Link>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>
              /
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.6)",
                fontFamily: "var(--font-display)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Round {race.round}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
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
                  margin: "0 0 6px 0",
                }}
              >
                Round {race.round} · {race.season} Season
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: "0 0 8px 0",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {race.raceName.toUpperCase()}
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "0.875rem",
                  margin: 0,
                }}
              >
                📍 {race.circuit.circuitName} · {race.circuit.locality},{" "}
                {race.circuit.country}
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: "0.8rem",
                  margin: "4px 0 0 0",
                }}
              >
                🗓{" "}
                {new Date(race.date).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Quick stats */}
            <div style={{ display: "flex", gap: "24px" }}>
              {[
                { label: "Round", value: race.round },
                { label: "Laps", value: results[0]?.laps ?? "—" },
                { label: "Drivers", value: results.length },
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      color: "#ffffff",
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.3)",
                      margin: "4px 0 0 0",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-14 bg-black">
        {results.length > 0 && (
          <section>
            <SectionHeader title="PODIUM" />
            <div
              style={{ display: "flex", gap: "6px", alignItems: "flex-end" }}
            >
              {podium.map((r, idx) => {
                if (!r) return null
                const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3
                return (
                  <PodiumCard key={r.driver.driverId} result={r} rank={rank} />
                )
              })}
            </div>
          </section>
        )}

        {fastestLap && (
          <section>
            <SectionHeader title="FASTEST LAP" />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "16px 20px",
                backgroundColor: "rgba(168,85,247,0.08)",
                border: "1px solid rgba(168,85,247,0.2)",
                borderLeft: "3px solid #a855f7",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  backgroundColor:
                    getTeamColor(fastestLap.constructor.constructorId) + "40",
                  border: `1px solid ${getTeamColor(fastestLap.constructor.constructorId)}50`,
                  flexShrink: 0,
                }}
              >
                <img
                  src={
                    DRIVER_IMAGES[fastestLap.driver.driverId] ?? FALLBACK_DRIVER
                  }
                  alt={fastestLap.driver.familyName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "top",
                  }}
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src = FALLBACK_DRIVER)
                  }
                />
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "11px",
                    color: "#a855f7",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    margin: "0 0 2px 0",
                  }}
                >
                  ⚡ Fastest Lap
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#ffffff",
                    margin: 0,
                  }}
                >
                  {fastestLap.driver.givenName} {fastestLap.driver.familyName}
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "rgba(255,255,255,0.4)",
                    margin: "2px 0 0 0",
                  }}
                >
                  {fastestLap.constructor.name} · Lap{" "}
                  {fastestLap.fastestLapNumber}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: "#a855f7",
                    margin: 0,
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {fastestLap.fastestLapTime}
                </p>
                {fastestLap.fastestLapSpeed && (
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.3)",
                      margin: "2px 0 0 0",
                    }}
                  >
                    {fastestLap.fastestLapSpeed} km/h avg
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── RACE RESULTS ── */}
        {results.length > 0 && (
          <section>
            <SectionHeader title="RACE RESULTS" />
            <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              {/* Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "3rem 2.5rem 1fr 1fr 3rem 3rem 3rem 6rem",
                  padding: "10px 16px",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {[
                  "POS.",
                  "",
                  "DRIVER",
                  "TEAM",
                  "GRD",
                  "LAPS",
                  "PTS",
                  "TIME / GAP",
                ].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.25)",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Top 3 always visible */}
              {results.slice(0, 3).map((r, i) => {
                const teamColor = getTeamColor(r.constructor.constructorId)
                const imgSrc =
                  DRIVER_IMAGES[r.driver.driverId] ?? FALLBACK_DRIVER
                const isFastest = r.fastestLapRank === 1
                return (
                  <Link
                    key={r.driver.driverId}
                    href={`/sports/f1/drivers/${r.driver.driverId}`}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "3rem 2.5rem 1fr 1fr 3rem 3rem 3rem 6rem",
                        alignItems: "center",
                        padding: "12px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        backgroundColor: `${teamColor}08`,
                        transition: "background-color 0.15s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        ((
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor = "rgba(255,255,255,0.05)")
                      }
                      onMouseLeave={(e) =>
                        ((
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor = `${teamColor}08`)
                      }
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "#ffffff",
                        }}
                      >
                        {r.positionText}
                      </span>
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          backgroundColor: teamColor + "40",
                          border: `1px solid ${teamColor}60`,
                        }}
                      >
                        <img
                          src={imgSrc}
                          alt={r.driver.familyName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "top",
                          }}
                          onError={(e) =>
                            ((e.target as HTMLImageElement).src =
                              FALLBACK_DRIVER)
                          }
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "3px",
                            height: "20px",
                            backgroundColor: teamColor,
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <span
                            style={{
                              fontFamily: "var(--font-roboto-mono)",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "#ffffff",
                            }}
                          >
                            {getFlagEmoji(r.driver.nationality ?? "")}{" "}
                            {r.driver.givenName[0]}. {r.driver.familyName}
                          </span>
                          {isFastest && (
                            <span
                              style={{
                                marginLeft: "6px",
                                color: "#a855f7",
                                fontSize: "0.7rem",
                              }}
                            >
                              ⚡
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        {r.constructor.name}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        P{r.grid ?? "—"}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        {r.laps}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: r.points ? "#ffffff" : "rgba(255,255,255,0.3)",
                        }}
                      >
                        {r.points ?? 0}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.78rem",
                          color: "rgba(255,255,255,0.5)",
                          textAlign: "right",
                        }}
                      >
                        {r.time ?? r.status}
                      </span>
                    </div>
                  </Link>
                )
              })}

              {/* Rest of results */}
              {tableResults.map((r) => {
                const teamColor = getTeamColor(r.constructor.constructorId)
                const imgSrc =
                  DRIVER_IMAGES[r.driver.driverId] ?? FALLBACK_DRIVER
                const isFastest = r.fastestLapRank === 1
                return (
                  <Link
                    key={r.driver.driverId}
                    href={`/sports/f1/drivers/${r.driver.driverId}`}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "3rem 2.5rem 1fr 1fr 3rem 3rem 3rem 6rem",
                        alignItems: "center",
                        padding: "12px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        transition: "background-color 0.15s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        ((
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor = "rgba(255,255,255,0.03)")
                      }
                      onMouseLeave={(e) =>
                        ((
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor = "transparent")
                      }
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        {r.positionText}
                      </span>
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          backgroundColor: teamColor + "40",
                          border: `1px solid ${teamColor}60`,
                        }}
                      >
                        <img
                          src={imgSrc}
                          alt={r.driver.familyName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "top",
                          }}
                          onError={(e) =>
                            ((e.target as HTMLImageElement).src =
                              FALLBACK_DRIVER)
                          }
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "3px",
                            height: "20px",
                            backgroundColor: teamColor,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "var(--font-roboto-mono)",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            color: "#ffffff",
                          }}
                        >
                          {getFlagEmoji(r.driver.nationality ?? "")}{" "}
                          {r.driver.givenName[0]}. {r.driver.familyName}
                          {isFastest && (
                            <span
                              style={{
                                marginLeft: "6px",
                                color: "#a855f7",
                                fontSize: "0.7rem",
                              }}
                            >
                              ⚡
                            </span>
                          )}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        {r.constructor.name}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        P{r.grid ?? "—"}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        {r.laps}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: r.points ? "#ffffff" : "rgba(255,255,255,0.3)",
                        }}
                      >
                        {r.points ?? 0}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.78rem",
                          color: "rgba(255,255,255,0.5)",
                          textAlign: "right",
                        }}
                      >
                        {r.time ?? r.status}
                      </span>
                    </div>
                  </Link>
                )
              })}

              <button
                onClick={() => setShowAllResults((v) => !v)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.3)",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "#ffffff")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "rgba(255,255,255,0.3)")
                }
              >
                {showAllResults
                  ? "Show Less ↑"
                  : `Show All ${results.length} Drivers ↓`}
              </button>
            </div>
          </section>
        )}

        {/* ── GRID VS FINISH ── */}
        {results.length > 0 && (
          <section>
            <SectionHeader title="GRID vs FINISH" />
            <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "3rem 1fr 6rem 6rem 4rem",
                  padding: "10px 16px",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {["FIN.", "DRIVER", "STARTED", "FINISHED", "DIFF"].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.25)",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
              {results.slice(0, 10).map((r) => {
                const teamColor = getTeamColor(r.constructor.constructorId)
                const diff = (r.grid ?? 0) - (r.position ?? 0)
                const diffColor =
                  diff > 0
                    ? "#22c55e"
                    : diff < 0
                      ? "#ef4444"
                      : "rgba(255,255,255,0.3)"
                const diffLabel =
                  diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : "—"
                return (
                  <div
                    key={r.driver.driverId}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "3rem 1fr 6rem 6rem 4rem",
                      alignItems: "center",
                      padding: "10px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      {r.positionText}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "3px",
                          height: "16px",
                          backgroundColor: teamColor,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: "#ffffff",
                        }}
                      >
                        {r.driver.givenName[0]}. {r.driver.familyName}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.82rem",
                        color: "rgba(255,255,255,0.4)",
                        textAlign: "center",
                      }}
                    >
                      P{r.grid ?? "—"}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.82rem",
                        color: "rgba(255,255,255,0.4)",
                        textAlign: "center",
                      }}
                    >
                      P{r.position ?? r.positionText}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: diffColor,
                        textAlign: "center",
                      }}
                    >
                      {diffLabel}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── LAP TIMES ── */}
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "4px",
                  height: "22px",
                  backgroundColor: "var(--color-f1-red)",
                }}
              />
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: 0,
                }}
              >
                LAP TIMES
              </h2>
            </div>
            {!showLaps && (
              <button
                onClick={loadLapTimes}
                disabled={loadingLaps}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  backgroundColor: "var(--color-f1-red)",
                  border: "none",
                  padding: "8px 20px",
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                  opacity: loadingLaps ? 0.6 : 1,
                }}
              >
                {loadingLaps ? "Loading..." : "Load Lap Times"}
              </button>
            )}
          </div>

          {showLaps && lapTimes.length > 0 && (
            <>
              {/* Driver filter */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                  marginBottom: "12px",
                }}
              >
                <button
                  onClick={() => setSelectedDriver("all")}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "4px 12px",
                    border: "1px solid",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    borderColor:
                      selectedDriver === "all"
                        ? "var(--color-f1-red)"
                        : "rgba(255,255,255,0.1)",
                    backgroundColor:
                      selectedDriver === "all"
                        ? "var(--color-f1-red)"
                        : "transparent",
                    color:
                      selectedDriver === "all"
                        ? "#ffffff"
                        : "rgba(255,255,255,0.4)",
                  }}
                >
                  All
                </button>
                {drivers.map(
                  (d) =>
                    d && (
                      <button
                        key={d.driverId}
                        onClick={() => setSelectedDriver(d.driverId)}
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          padding: "4px 12px",
                          border: "1px solid",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          borderColor:
                            selectedDriver === d.driverId
                              ? "var(--color-f1-red)"
                              : "rgba(255,255,255,0.1)",
                          backgroundColor:
                            selectedDriver === d.driverId
                              ? "var(--color-f1-red)"
                              : "transparent",
                          color:
                            selectedDriver === d.driverId
                              ? "#ffffff"
                              : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {d.code ?? d.familyName.slice(0, 3).toUpperCase()}
                      </button>
                    ),
                )}
              </div>

              <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "4rem 4rem 1fr 6rem 6rem",
                    padding: "10px 16px",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {["LAP", "POS.", "DRIVER", "TIME", "DELTA"].map((h) => (
                    <span
                      key={h}
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "10px",
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.25)",
                      }}
                    >
                      {h}
                    </span>
                  ))}
                </div>
                {filteredLaps.slice(0, 100).map((l, i) => {
                  const teamColor = getTeamColor(
                    results.find((r) => r.driver.driverId === l.driverId)
                      ?.constructor.constructorId ?? "",
                  )
                  const isFastest =
                    l.timeMs === fastestLapMs && fastestLapMs !== Infinity
                  const delta =
                    l.timeMs && fastestLapMs !== Infinity
                      ? l.timeMs - fastestLapMs
                      : null
                  return (
                    <div
                      key={`${l.lapNumber}-${l.driverId}-${i}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "4rem 4rem 1fr 6rem 6rem",
                        alignItems: "center",
                        padding: "8px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                        backgroundColor: isFastest
                          ? "rgba(168,85,247,0.06)"
                          : "transparent",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        {l.lapNumber}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.3)",
                        }}
                      >
                        P{l.position ?? "—"}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <div
                          style={{
                            width: "2px",
                            height: "14px",
                            backgroundColor: teamColor,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            color: "#ffffff",
                          }}
                        >
                          {l.driver.code ??
                            l.driver.familyName.slice(0, 3).toUpperCase()}
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.82rem",
                          fontWeight: isFastest ? 700 : 400,
                          color: isFastest ? "#a855f7" : "#ffffff",
                        }}
                      >
                        {l.time} {isFastest && "⚡"}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.75rem",
                          color:
                            delta === 0 ? "#a855f7" : "rgba(255,255,255,0.3)",
                        }}
                      >
                        {delta === null
                          ? "—"
                          : delta === 0
                            ? "—"
                            : `+${(delta / 1000).toFixed(3)}s`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {showLaps && lapTimes.length === 0 && (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.15em",
                }}
              >
                NO LAP TIME DATA AVAILABLE
              </p>
            </div>
          )}
        </section>

        {/* ── CIRCUIT INFO ── */}
        <section>
          <SectionHeader title="CIRCUIT INFO" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px",
            }}
          >
            {/* Circuit SVG */}
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                minHeight: "200px",
              }}
            >
              <img
                src={`/circuits/${race.circuit.circuitId}.svg`}
                alt={race.circuit.circuitName}
                style={{
                  maxHeight: "180px",
                  width: "auto",
                  maxWidth: "100%",
                  filter: "brightness(0) invert(1)",
                  opacity: 0.7,
                }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement
                  img.style.display = "none"
                  const p = document.createElement("p")
                  p.textContent = "Circuit layout not available"
                  p.style.cssText =
                    "font-family:var(--font-display);font-size:11px;color:rgba(255,255,255,0.2);letter-spacing:0.1em;text-transform:uppercase;text-align:center;"
                  img.parentNode?.appendChild(p)
                }}
              />
            </div>

            {/* Circuit stats */}
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "20px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: "0 0 4px 0",
                }}
              >
                {race.circuit.circuitName}
              </p>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.4)",
                  margin: "0 0 20px 0",
                }}
              >
                📍 {race.circuit.locality}, {race.circuit.country}
              </p>
              {race.circuit.lat && race.circuit.lng && (
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.25)",
                    margin: "0 0 16px 0",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {parseFloat(race.circuit.lat).toFixed(4)}°N,{" "}
                  {parseFloat(race.circuit.lng).toFixed(4)}°E
                </p>
              )}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                {[
                  { label: "Race Laps", value: results[0]?.laps ?? "—" },
                  {
                    label: "Race Date",
                    value: new Date(race.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  },
                  { label: "Circuit ID", value: race.circuit.circuitId },
                  { label: "Season Round", value: `${race.round} / 24` },
                ].map((item) => (
                  <div key={item.label}>
                    <p
                      style={{
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.25)",
                        margin: "0 0 2px 0",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        color: "#ffffff",
                        margin: 0,
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
