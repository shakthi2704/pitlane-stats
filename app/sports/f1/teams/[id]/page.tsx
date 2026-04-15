"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import F1Loader from "@/components/f1/F1Loader"
import { getTeamColor, getFlagEmoji } from "@/types/f1/f1-api"
import {
  TEAM_CARS,
  TEAM_LOGOS,
  DRIVER_IMAGES,
  FALLBACK_DRIVER,
  AVAILABLE_SEASONS,
  CURRENT_SEASON,
} from "@/lib/f1/f1-constants"

const SEASONS = AVAILABLE_SEASONS

interface TeamProfile {
  constructor: {
    constructorId: string
    name: string
    nationality: string | null
  }
  hasSeasonData: boolean
  standing: {
    position: number
    points: number
    wins: number
    season: string
  } | null
  drivers: {
    driverId: string
    driver: {
      givenName: string
      familyName: string
      code: string | null
      nationality: string | null
      permanentNumber: string | null
    }
    position: number
    points: number
    wins: number
  }[]
  raceResults: {
    round: number
    raceName: string
    circuit: string
    country: string
    date: string
    drivers: {
      driverId: string
      driverName: string
      driverCode: string | null
      position: number | null
      positionText: string
      grid: number | null
      points: number | null
      status: string | null
      time: string | null
      fastestLapRank: number | null
      fastestLapTime: string | null
    }[]
  }[]
  careerHistory: {
    season: string
    position: number
    points: number
    wins: number
  }[]
  careerTotals: {
    seasons: number
    championships: number
    wins: number
    podiums: number
    fastestLaps: number
    points: number
  }
}

function posOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function posColor(pos: number | null): string {
  if (!pos) return "rgba(255,255,255,0.25)"
  if (pos === 1) return "#F5C842"
  if (pos <= 3) return "#C0C0C0"
  if (pos <= 10) return "#4ade80"
  return "rgba(255,255,255,0.35)"
}

type Tab = "results" | "career"

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [season, setSeason] = useState(CURRENT_SEASON)
  const [profile, setProfile] = useState<TeamProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("results")
  const scrollRef = useRef<HTMLDivElement>(null)

  const load = useCallback(
    async (s: string) => {
      setLoading(true)
      try {
        const res = await fetch(`/api/f1/teams/${id}?season=${s}`)
        const data = await res.json()
        setProfile(data.error ? null : data)
      } finally {
        setLoading(false)
      }
    },
    [id],
  )

  useEffect(() => {
    load(season)
  }, [load, season])

  // Scroll active season button into view — runs after render so ref is always available
  useEffect(() => {
    if (!scrollRef.current) return
    const activeBtn = scrollRef.current.querySelector<HTMLElement>('[data-active="true"]')
    activeBtn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }, [season])

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })
  }

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })
  }

  // Season selector — reused in both loading and loaded states
  const seasonSelector = (teamColor: string = "#E10600") => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <button
        onClick={scrollLeft}
        style={{
          cursor: "pointer",
          padding: "6px 10px",
          border: "1px solid rgba(255,255,255,0.1)",
          background: "transparent",
          color: "white",
        }}
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
              fontFamily: "var(--font-display)",
              fontSize: "12px",
              fontWeight: 600,
              padding: "6px 14px",
              cursor: "pointer",
              border: "2px solid",
              transition: "all 0.2s",
              borderColor: season === s ? teamColor : "rgba(255,255,255,0.1)",
              // backgroundColor: season === s ? teamColor : "transparent",
              color: season === s ? "#ffffff" : "rgba(255,255,255,0.4)",
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <button
        onClick={scrollRight}
        style={{
          cursor: "pointer",
          padding: "6px 10px",
          border: "1px solid rgba(255,255,255,0.1)",
          background: "transparent",
          color: "white",
        }}
      >
        ▶
      </button>
    </div>
  )

  // ── LOADING STATE — keep scrollRef mounted ──
  if (loading) {
    return (
      <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
        {/* Season selector stays mounted so scrollRef is always in the DOM */}
        <div style={{ display: "none" }}>
          {seasonSelector()}
        </div>
        <F1Loader message="LOADING TEAM..." />
      </div>
    )
  }

  if (!profile) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            color: "#E10600",
            fontSize: "1.5rem",
            letterSpacing: "0.1em",
          }}
        >
          TEAM NOT FOUND
        </p>
        <Link
          href="/sports/f1/teams"
          style={{
            fontFamily: "var(--font-sans)",
            color: "#555",
            fontSize: "0.85rem",
            textDecoration: "none",
          }}
        >
          ← Back to Teams
        </Link>
      </div>
    )
  }

  const {
    constructor: team,
    hasSeasonData,
    standing,
    drivers,
    raceResults,
    careerHistory,
    careerTotals,
  } = profile
  const teamColor = getTeamColor(team.constructorId)
  const carSrc = TEAM_CARS[team.constructorId] ?? null
  const logoSrc = TEAM_LOGOS[team.constructorId] ?? null

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
      {/* ── HERO ── */}
      <div
        style={{
          position: "relative",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        {/* <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "3px",
            background: teamColor,
          }}
        /> */}

        <div
          className="max-w-7xl"
          style={{
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "stretch",
            minHeight: "360px",
          }}
        >
          {/* Left: info */}
          <div
            style={{
              flex: 1,
              padding: "48px 0 40px",
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* Breadcrumb */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              {[
                { label: "F1", href: "/sports/f1" },
                { label: "TEAMS", href: "/sports/f1/teams" },
                { label: team.name.toUpperCase(), href: null },
              ].map((crumb, i, arr) => (
                <span
                  key={crumb.label}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.65rem",
                        color: "#444",
                        textDecoration: "none",
                        letterSpacing: "0.12em",
                      }}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.65rem",
                        color: teamColor,
                        letterSpacing: "0.12em",
                      }}
                    >
                      {crumb.label}
                    </span>
                  )}
                  {i < arr.length - 1 && (
                    <span style={{ color: "#222", fontSize: "0.7rem" }}>/</span>
                  )}
                </span>
              ))}
            </div>

            {/* Logo */}
            {logoSrc && (
              <div style={{ marginBottom: "16px" }}>
                <Image
                  src={logoSrc}
                  alt={team.name}
                  width={100}
                  height={32}
                  style={{
                    objectFit: "contain",
                    filter: "brightness(0) invert(1)",
                    opacity: 0.55,
                  }}
                />
              </div>
            )}

            {/* Team name */}
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2rem, 5vw, 4rem)",
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                  textTransform: "uppercase",
                  lineHeight: 0.9,
                  fontWeight: 700,
                }}
              >
                {team.name}
              </div>
            </div>

            {/* Meta */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "28px",
              }}
            >
              {team.nationality && (
                <>
                  <span style={{ fontSize: "1.2rem" }}>
                    {getFlagEmoji(team.nationality)}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      color: "rgba(255,255,255,0.35)",
                      fontSize: "0.78rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {team.nationality}
                  </span>
                  <span style={{ color: "#1e1e1e" }}>·</span>
                </>
              )}
              {drivers.map((d, i) => (
                <span
                  key={d.driverId}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  {i > 0 && <span style={{ color: "#1e1e1e" }}>·</span>}
                  <Link
                    href={`/sports/f1/drivers/${d.driverId}`}
                    style={{
                      fontFamily: "var(--font-sans)",
                      color: teamColor,
                      fontSize: "0.78rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      textDecoration: "none",
                    }}
                  >
                    {d.driver.givenName} {d.driver.familyName}
                  </Link>
                </span>
              ))}
            </div>

            {/* Stat strip */}
            {standing && (
              <div style={{ display: "flex", gap: "1px" }}>
                {[
                  { label: `${season} Position`, value: posOrdinal(standing.position) },
                  { label: "Points", value: standing.points },
                  { label: "Wins", value: standing.wins },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    style={{
                      padding: "14px 20px",
                      backgroundColor: i === 0 ? `${teamColor}15` : "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderTop: i === 0 ? `2px solid ${teamColor}` : "2px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: i === 0 ? "1.8rem" : "1.5rem",
                        color: i === 0 ? teamColor : "#ffffff",
                        lineHeight: 1,
                        fontWeight: 700,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.6rem",
                        color: "rgba(255,255,255,0.25)",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        marginTop: "5px",
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: car image + driver photos */}
          <div
            style={{
              position: "relative",
              width: "380px",
              flexShrink: 0,
              alignSelf: "stretch",
            }}
          >
            {/* Car image — top 65% */}
            {carSrc && (
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "65%" }}>
                <Image
                  src={carSrc}
                  alt={team.name}
                  fill
                  priority
                  style={{
                    objectFit: "contain",
                    objectPosition: "center right",
                  }}
                />
              </div>
            )}

            {/* Driver photos — bottom 45%, side by side */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "45%",
                display: "flex",
                alignItems: "flex-end",
                zIndex: 2,
              }}
            >
              {drivers.map((d, i) => (
                <div
                  key={d.driverId}
                  style={{
                    position: "relative",
                    flex: 1,
                    height: "100%",
                    borderLeft: i > 0 ? `1px solid ${teamColor}30` : "none",
                    overflow: "hidden",
                  }}
                >
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    height: "2px",
                    background: teamColor,
                    opacity: i === 0 ? 1 : 0.35,
                    zIndex: 4,
                  }} />
                  <Image
                    src={DRIVER_IMAGES[d.driverId] ?? FALLBACK_DRIVER}
                    alt={d.driver.familyName}
                    fill
                    style={{
                      objectFit: "contain",
                      objectPosition: "bottom center",
                      filter: `brightness(${i === 0 ? 1 : 0.75})`,
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_DRIVER
                    }}
                  />
                  <div style={{
                    position: "absolute",
                    bottom: 0, left: 0, right: 0,
                    padding: "20px 10px 10px",
                    background: "linear-gradient(to top, rgba(10,10,10,0.92) 65%, transparent)",
                    zIndex: 3,
                  }}>
                    <div style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.55rem",
                      color: teamColor,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}>
                      #{d.driver.permanentNumber}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "#fff",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      lineHeight: 1,
                      paddingBottom: "2px",
                    }}>
                      {d.driver.familyName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── DRIVERS STRIP ── */}
      {drivers.length > 0 && (
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div
            className="max-w-7xl"
            style={{
              margin: "0 auto",
              padding: "20px 24px",
              display: "flex",
              gap: "2px",
            }}
          >
            {drivers.map((d) => (
              <Link
                key={d.driverId}
                href={`/sports/f1/drivers/${d.driverId}`}
                style={{ textDecoration: "none", flex: 1 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 20px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderTop: `2px solid ${teamColor}`,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                >
                  <div style={{ width: "48px", height: "48px", position: "relative", flexShrink: 0 }}>
                    <Image
                      src={DRIVER_IMAGES[d.driverId] ?? FALLBACK_DRIVER}
                      alt={d.driver.familyName}
                      fill
                      style={{ objectFit: "contain" }}
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_DRIVER }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", color: teamColor, letterSpacing: "0.1em", marginBottom: "2px" }}>
                      {d.driver.permanentNumber ? `#${d.driver.permanentNumber}` : d.driver.code}
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "#fff", fontWeight: 400 }}>
                      {d.driver.givenName} {d.driver.familyName}
                    </div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                      {getFlagEmoji(d.driver.nationality ?? "")} {d.driver.nationality}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "#fff", fontWeight: 700, lineHeight: 1 }}>
                      {d.points}
                    </div>
                    <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "2px" }}>
                      PTS
                    </div>
                  </div>
                  <div style={{ textAlign: "right", paddingLeft: "16px", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "rgba(255,255,255,0.6)", fontWeight: 400, lineHeight: 1 }}>
                      {posOrdinal(d.position)}
                    </div>
                    <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "2px" }}>
                      STANDING
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── NO DATA BANNER ── */}
      {!hasSeasonData && (
        <div className="max-w-7xl" style={{ margin: "0 auto", padding: "16px 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 20px",
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderLeft: "3px solid #555",
            }}
          >
            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
              ⚠️ No data synced for {season} — career history only
            </p>
          </div>
        </div>
      )}

      {/* ── BODY ── */}
      <div className="max-w-7xl" style={{ margin: "0 auto", padding: "32px 24px" }}>
        {/* Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {(["results", "career"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: tab === t ? "#ffffff" : "rgba(255,255,255,0.3)",
                  background: "none",
                  border: "none",
                  borderBottom: tab === t ? `2px solid ${teamColor}` : "2px solid transparent",
                  padding: "10px 16px",
                  cursor: "pointer",
                  marginBottom: "-1px",
                  transition: "color 0.2s",
                }}
              >
                {t === "results" ? "Race Results" : "Career"}
              </button>
            ))}
          </div>

          {/* Season selector with scrollRef always mounted here */}
          {seasonSelector(teamColor)}
        </div>

        {/* ── RACE RESULTS TAB ── */}
        {tab === "results" && (
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "6px" }}>
              Formula 1
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "#ffffff", margin: "0 0 4px 0", lineHeight: 1, letterSpacing: "-0.02em" }}>
              {season} RACE BY RACE
            </h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem", marginBottom: "24px" }}>
              {season} FIA Formula One World Championship
            </p>

            {raceResults.length === 0 ? (
              <div style={{ padding: "60px 16px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>
                  NO DATA AVAILABLE FOR {season}
                </p>
              </div>
            ) : (
              <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "3rem 1fr 5rem 5rem 5rem 5rem 5rem",
                    padding: "10px 16px",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {["RD", "RACE", "DRIVER", "GRID", "POS", "PTS", "FL"].map((h) => (
                    <span key={h} style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
                      {h}
                    </span>
                  ))}
                </div>

                {raceResults.map((race, ri) =>
                  race.drivers.map((d, di) => (
                    <div
                      key={`${race.round}-${d.driverId}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "3rem 1fr 5rem 5rem 5rem 5rem 5rem",
                        alignItems: "center",
                        padding: "11px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        backgroundColor: di === 0 && ri % 2 === 0 ? "transparent" : di === 0 ? "rgba(255,255,255,0.01)" : `${teamColor}06`,
                        transition: "background-color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = di === 0 && ri % 2 === 0 ? "transparent" : di === 0 ? "rgba(255,255,255,0.01)" : `${teamColor}06`)}
                    >
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", color: "rgba(255,255,255,0.2)" }}>
                        {di === 0 ? race.round : ""}
                      </span>
                      <div>
                        {di === 0 && (
                          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", color: "#fff", fontWeight: 400 }}>
                            {race.raceName.replace("Grand Prix", "GP").toUpperCase()}
                          </div>
                        )}
                        {di === 0 && (
                          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginTop: "1px" }}>
                            {race.country}
                          </div>
                        )}
                      </div>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", color: teamColor, letterSpacing: "0.06em" }}>
                        {d.driverCode ?? d.driverName.split(" ").slice(-1)[0].slice(0, 3).toUpperCase()}
                      </span>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", color: "rgba(255,255,255,0.3)" }}>
                        {d.grid ?? "—"}
                      </span>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, color: posColor(d.position) }}>
                        {d.positionText}
                      </span>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: (d.points ?? 0) > 0 ? "#ffffff" : "rgba(255,255,255,0.2)" }}>
                        {d.points ?? 0}
                      </span>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: d.fastestLapRank === 1 ? "#1ad009" : "rgba(255,255,255,0.2)", fontWeight: d.fastestLapRank === 1 ? 700 : 400 }}>
                        {d.fastestLapTime ?? "—"}
                      </span>
                    </div>
                  )),
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CAREER TAB ── */}
        {tab === "career" && (
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "6px" }}>
              Formula 1
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "#ffffff", margin: "0 0 4px 0", lineHeight: 1, letterSpacing: "-0.02em" }}>
              CONSTRUCTOR HISTORY
            </h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem", marginBottom: "24px" }}>
              All-time Formula One record
            </p>

            {/* Career totals */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0",
                padding: "16px 20px",
                marginBottom: "28px",
                backgroundColor: "rgba(245,200,66,0.06)",
                border: "1px solid rgba(245,200,66,0.15)",
                borderLeft: "3px solid #F5C842",
                flexWrap: "wrap",
              }}
            >
              {[
                { label: "Championships", value: careerTotals.championships, color: "#F5C842" },
                { label: "Seasons", value: careerTotals.seasons, color: "#fff" },
                { label: "Wins", value: careerTotals.wins, color: "#fff" },
                { label: "Podiums", value: careerTotals.podiums, color: "#C0C0C0" },
                { label: "Points", value: careerTotals.points, color: "#fff" },
                { label: "Fastest Laps", value: careerTotals.fastestLaps, color: "#1ad009" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  style={{
                    flex: 1,
                    minWidth: "80px",
                    textAlign: i === 0 ? "left" : "center",
                    borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    padding: i > 0 ? "0 16px" : "0 16px 0 0",
                  }}
                >
                  <p style={{ fontFamily: "var(--font-display)", fontSize: i === 0 ? "2.5rem" : "2rem", fontWeight: 700, color: stat.color, margin: 0, lineHeight: 1 }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", margin: "2px 0 0 0" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Season table */}
            <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "5rem 6rem 6rem 5rem",
                  padding: "10px 16px",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {["Season", "Position", "Points", "Wins"].map((h) => (
                  <span key={h} style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
                    {h}
                  </span>
                ))}
              </div>
              {careerHistory.map((ch) => {
                const isChamp = ch.position === 1
                return (
                  <div
                    key={ch.season}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "5rem 6rem 6rem 5rem",
                      alignItems: "center",
                      padding: "13px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      backgroundColor: isChamp ? "rgba(245,200,66,0.05)" : "transparent",
                      transition: "background-color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isChamp ? "rgba(245,200,66,0.05)" : "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 400, color: isChamp ? "#F5C842" : "#ffffff" }}>
                        {ch.season}
                      </span>
                      {isChamp && <span style={{ fontSize: "0.75rem" }}>🏆</span>}
                    </div>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 400, color: posColor(ch.position) }}>
                      {posOrdinal(ch.position)}
                    </span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 400, color: "#ffffff" }}>
                      {ch.points}
                    </span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 400, color: ch.wins > 0 ? "#F5C842" : "rgba(255,255,255,0.2)" }}>
                      {ch.wins}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}