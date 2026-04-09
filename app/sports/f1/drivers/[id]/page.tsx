"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import F1Loader from "@/components/f1/F1Loader"
import { getTeamColor, getFlagEmoji } from "@/types/f1/f1-api"
import {
  DRIVER_IMAGES,
  TEAM_LOGOS,
  FALLBACK_DRIVER,
  AVAILABLE_SEASONS,
} from "@/lib/fi/f1-constants"


const SEASONS = AVAILABLE_SEASONS

interface DriverProfile {
  driver: {
    driverId: string
    code: string | null
    givenName: string
    familyName: string
    nationality: string | null
    permanentNumber: string | null
    dateOfBirth: string | null
  }
  constructorId: string
  constructorName: string
  currentStanding: {
    position: number
    points: number
    wins: number
    season: string
  } | null
  seasonStats: {
    podiums: number
    pointsFinishes: number
    fastestLaps: number
    dnfs: number
  }
  careerHistory: {
    season: string
    position: number
    points: number
    wins: number
    constructorId: string
    constructorName: string
  }[]
  careerTotals: {
    races: number
    points: number
    wins: number
    podiums: number
    fastestLaps: number
    championships: number
  }
  teammate: {
    driverId: string
    driver: { givenName: string; familyName: string; code: string | null }
    position: number
    points: number
    wins: number
  } | null
}

interface RaceResult {
  round: number
  raceId: number
  raceName: string
  circuit: string
  country: string
  date: string
  position: number | null
  positionText: string
  grid: number | null
  points: number | null
  laps: number | null
  status: string | null
  time: string | null
  fastestLapTime: string | null
  fastestLapRank: number | null
  constructorId: string
  constructorName: string
  h2h: {
    teammatePos: number | null
    teammateId: string
    teammateName: string
  } | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function posOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function driverAge(dob: string | null): string {
  if (!dob) return "—"
  return Math.floor(
    (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  ).toString()
}

function posColor(pos: number | null): string {
  if (!pos) return "rgba(255,255,255,0.25)"
  if (pos === 1) return "#F5C842"
  if (pos <= 3) return "#C0C0C0"
  if (pos <= 10) return "#4ade80"
  return "rgba(255,255,255,0.35)"
}

type Tab = "results" | "h2h" | "career"

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DriverDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [season, setSeason] = useState("2025")
  const [profile, setProfile] = useState<DriverProfile | null>(null)
  const [results, setResults] = useState<RaceResult[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("results")
  const scrollRef = useRef<HTMLDivElement>(null)

  const load = useCallback(
    async (s: string) => {
      setLoading(true)
      try {
        const [pRes, rRes] = await Promise.all([
          fetch(`/api/f1/drivers/${id}?season=${s}`),
          fetch(`/api/f1/drivers/${id}/season-results?season=${s}`),
        ])
        const [pData, rData] = await Promise.all([pRes.json(), rRes.json()])
        setProfile(pData.error ? null : pData)
        setResults(rData.results ?? [])
      } finally {
        setLoading(false)
      }
    },
    [id],
  )

  useEffect(() => {
    load(season)
  }, [load, season])

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
  if (loading) return <F1Loader message="LOADING DRIVER..." />

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
          DRIVER NOT FOUND
        </p>
        <Link
          href="/sports/f1/drivers"
          style={{
            fontFamily: "var(--font-sans)",
            color: "#555",
            fontSize: "0.85rem",
            textDecoration: "none",
          }}
        >
          ← Back to Drivers
        </Link>
      </div>
    )
  }

  const {
    driver,
    constructorId,
    constructorName,
    currentStanding,
    seasonStats,
    careerHistory,
    careerTotals,
    teammate,
  } = profile

  const teamColor = getTeamColor(constructorId)
  const driverImg = DRIVER_IMAGES[driver.driverId] ?? FALLBACK_DRIVER
  const teamLogo = TEAM_LOGOS[constructorId] ?? null

  // H2H
  const h2hRaces = results.filter(
    (r) => r.h2h?.teammatePos != null && r.position != null,
  )
  const h2hWins = h2hRaces.filter(
    (r) => r.position! < r.h2h!.teammatePos!,
  ).length
  const h2hLosses = h2hRaces.filter(
    (r) => r.position! > r.h2h!.teammatePos!,
  ).length
  const teammateName =
    results.find((r) => r.h2h?.teammateName)?.h2h?.teammateName ??
    (teammate
      ? `${teammate.driver.givenName} ${teammate.driver.familyName}`
      : "Teammate")
  const teammateDriverId =
    results.find((r) => r.h2h?.teammateId)?.h2h?.teammateId ??
    teammate?.driverId

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
      {/* ── HERO ── full bleed bg, constrained content ── */}
      <div
        style={{
          position: "relative",
          // background: `linear-gradient(110deg, ${teamColor}18 0%, ${teamColor}08 40%, #0a0a0a 65%)`,
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

        {/* Constrained content + photo side by side */}
        <div
          className="max-w-7xl"
          style={{
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "stretch",
            minHeight: "380px",
          }}
        >
          {/* Left: text content */}
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
                { label: "DRIVERS", href: "/sports/f1/drivers" },
                { label: driver.familyName.toUpperCase(), href: null },
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

            {/* Team logo + badges */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}
            >
              {teamLogo && (
                <Image
                  src={teamLogo}
                  alt={constructorName}
                  width={72}
                  height={24}
                  style={{
                    objectFit: "contain",
                    filter: "brightness(0) invert(1)",
                    opacity: 0.5,
                  }}
                />
              )}
              {driver.permanentNumber && (
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.72rem",
                    color: teamColor,
                    border: `1px solid ${teamColor}44`,
                    padding: "3px 10px",
                    letterSpacing: "0.08em",
                  }}
                >
                  #{driver.permanentNumber}
                </span>
              )}
              {driver.code && (
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.72rem",
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "3px 10px",
                    letterSpacing: "0.14em",
                  }}
                >
                  {driver.code}
                </span>
              )}
            </div>

            {/* Name */}
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(0.85rem, 1.8vw, 1.1rem)",
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                {driver.givenName}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.8rem, 5.5vw, 4.5rem)",
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                  textTransform: "uppercase",
                  lineHeight: 0.9,
                }}
              >
                {driver.familyName}
              </div>
            </div>

            {/* Meta */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "32px",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>
                {getFlagEmoji(driver.nationality ?? "")}
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
                {driver.nationality}
              </span>
              <span style={{ color: "#1e1e1e" }}>·</span>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  color: teamColor,
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {constructorName}
              </span>
              {driver.dateOfBirth && (
                <>
                  <span style={{ color: "#1e1e1e" }}>·</span>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      color: "rgba(255,255,255,0.25)",
                      fontSize: "0.78rem",
                    }}
                  >
                    Age {driverAge(driver.dateOfBirth)}
                  </span>
                </>
              )}
            </div>

            {/* Stat strip — matches standings leader card style */}
            {currentStanding && (
              <div style={{ display: "flex", gap: "1px" }}>
                {[
                  {
                    label: `${season} Position`,
                    value: posOrdinal(currentStanding.position),
                  },
                  { label: "Points", value: currentStanding.points },
                  { label: "Wins", value: currentStanding.wins },
                  { label: "Podiums", value: seasonStats.podiums },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    style={{
                      padding: "14px 20px",
                      backgroundColor:
                        i === 0 ? `${teamColor}15` : "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderTop:
                        i === 0
                          ? `2px solid ${teamColor}`
                          : "2px solid rgba(255,255,255,0.08)",
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

          {/* Right: driver photo — contained in the grid */}
          <div
            style={{
              position: "relative",
              width: "320px",
              flexShrink: 0,
              alignSelf: "flex-end",
            }}
          >
            {/* Big number behind photo */}
            {driver.permanentNumber && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontSize: "24rem",
                  color: teamColor,
                  opacity: 0.07,
                  lineHeight: 1,
                  userSelect: "none",
                  pointerEvents: "none",
                  letterSpacing: "-0.05em",
                }}
              >
                {driver.permanentNumber}
              </div>
            )}
            <div style={{ position: "relative", height: "380px" }}>
              <Image
                src={driverImg}
                alt={driver.familyName}
                fill
                priority
                style={{
                  objectFit: "contain",
                  objectPosition: "bottom center",
                }}
                onError={(e) => {
                  ; (e.target as HTMLImageElement).src = FALLBACK_DRIVER
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div
        className="max-w-7xl"
        style={{ margin: "0 auto", padding: "32px 24px" }}
      >
        {/* Controls row — tabs left, season pills right — matches standings page */}
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
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {(["results", "h2h", "career"] as Tab[]).map((t) => (
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
                  borderBottom:
                    tab === t
                      ? `2px solid ${teamColor}`
                      : "2px solid transparent",
                  padding: "10px 16px",
                  cursor: "pointer",
                  marginBottom: "-1px",
                  transition: "color 0.2s",
                }}
              >
                {t === "results"
                  ? "Race Results"
                  : t === "h2h"
                    ? "Head to Head"
                    : "Career"}
              </button>
            ))}
          </div>

          {/* Season pills — same style as standings page */}
          {/* Season pills */}
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
                    flex: "0 0 auto",
                    fontFamily: "var(--font-display)",
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "6px 14px",
                    cursor: "pointer",
                    border: "1px solid",
                    transition: "all 0.2s",
                    borderColor: season === s ? teamColor : "rgba(255,255,255,0.1)",
                    // backgroundColor: season === s ? teamColor : "transparent",
                    color: season === s ? teamColor : "rgba(255,255,255,0.4)",
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
        </div>

        {/* ── RACE RESULTS TAB ── */}
        {tab === "results" && (
          <div>
            {/* Section label */}
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: teamColor,
                marginBottom: "6px",
              }}
            >
              Formula 1
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                fontWeight: 700,
                color: "#ffffff",
                margin: "0 0 4px 0",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {season} RACE BY RACE
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: "0.85rem",
                marginBottom: "24px",
              }}
            >
              {season} FIA Formula One World Championship
            </p>

            {/* Extra stats strip */}
            <div
              style={{
                display: "flex",
                gap: "1px",
                marginBottom: "28px",
                backgroundColor: "rgba(255,200,66,0.06)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderLeft: `3px solid ${teamColor}`,
                padding: "16px 20px",
                alignItems: "center",
              }}
            >
              {[
                { label: "Points Finishes", value: seasonStats.pointsFinishes },
                { label: "Fastest Laps", value: seasonStats.fastestLaps },
                { label: "DNFs", value: seasonStats.dnfs },
              ].map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    borderLeft:
                      i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#ffffff",
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.3)",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      marginTop: "2px",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {results.length === 0 ? (
              <div
                style={{
                  padding: "60px 16px",
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
                  NO DATA AVAILABLE FOR {season}
                </p>
              </div>
            ) : (
              <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                {/* Header */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "3rem 1fr 3.5rem 3.5rem 3.5rem 4rem 9rem 6rem",
                    padding: "10px 16px",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {[
                    "RD",
                    "RACE",
                    "GRID",
                    "POS",
                    "PTS",
                    "LAPS",
                    "TIME / STATUS",
                    "FL",
                  ].map((h) => (
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

                {results.map((r, i) => (
                  <div
                    key={r.round}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "3rem 1fr 3.5rem 3.5rem 3.5rem 4rem 9rem 6rem",
                      alignItems: "center",
                      padding: "12px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      transition: "background-color 0.15s",
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.04)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.2)",
                      }}
                    >
                      {r.round}
                    </span>

                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.88rem",
                          color: "#fff",
                          fontWeight: 400,
                        }}
                      >
                        {r.raceName.replace("Grand Prix", "GP").toUpperCase()}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.72rem",
                          color: "rgba(255,255,255,0.3)",
                          marginTop: "1px",
                        }}
                      >
                        {r.country}
                      </div>
                    </div>

                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.85rem",
                        color: "rgba(255,255,255,0.3)",
                      }}
                    >
                      {r.grid ?? "—"}
                    </span>

                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: posColor(r.position),
                      }}
                    >
                      {r.positionText}
                    </span>

                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        color:
                          (r.points ?? 0) > 0
                            ? "#ffffff"
                            : "rgba(255,255,255,0.2)",
                      }}
                    >
                      {r.points ?? 0}
                    </span>

                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.82rem",
                        color: "rgba(255,255,255,0.35)",
                      }}
                    >
                      {r.laps ?? "—"}
                    </span>

                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.78rem",
                        color:
                          r.status === "Finished"
                            ? "rgba(255,255,255,0.35)"
                            : "#f87171",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.time || r.status || "—"}
                    </span>

                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.75rem",
                        color:
                          r.fastestLapRank === 1
                            ? "#4ade80"
                            : "rgba(255,255,255,0.2)",
                        fontWeight: r.fastestLapRank === 1 ? 700 : 400,
                      }}
                    >
                      {r.fastestLapTime ?? "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── H2H TAB ── */}
        {tab === "h2h" && (
          <div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: teamColor,
                marginBottom: "6px",
              }}
            >
              Formula 1
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                fontWeight: 700,
                color: "#ffffff",
                margin: "0 0 4px 0",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              HEAD TO HEAD
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: "0.85rem",
                marginBottom: "24px",
              }}
            >
              {driver.familyName} vs {teammateName} · {constructorName} ·{" "}
              {season}
            </p>

            {/* Scoreboard */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "20px",
                marginBottom: "24px",
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderLeft: `3px solid ${teamColor}`,
              }}
            >
              {/* Driver */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={driverImg}
                  alt={driver.familyName}
                  fill
                  style={{ objectFit: "contain" }}
                  onError={(e) => {
                    ; (e.target as HTMLImageElement).src = FALLBACK_DRIVER
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "11px",
                    color: teamColor,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    margin: "0 0 2px 0",
                  }}
                >
                  {season} Teammate Battle
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.3rem",
                    fontWeight: 400,
                    color: "#ffffff",
                    margin: 0,
                  }}
                >
                  {driver.givenName} {driver.familyName}
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "rgba(255,255,255,0.4)",
                    margin: "2px 0 0 0",
                  }}
                >
                  {constructorName} · {getFlagEmoji(driver.nationality ?? "")}{" "}
                  {driver.nationality}
                </p>
              </div>
              {/* Score */}
              <div style={{ textAlign: "center", padding: "0 24px" }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "3rem",
                    fontWeight: 700,
                    color: teamColor,
                    lineHeight: 1,
                  }}
                >
                  {h2hWins}{" "}
                  <span
                    style={{
                      color: "rgba(255,255,255,0.2)",
                      fontSize: "1.5rem",
                    }}
                  >
                    —
                  </span>{" "}
                  {h2hLosses}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.3)",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginTop: "4px",
                  }}
                >
                  {h2hRaces.length} classified races
                </div>
                {/* Bar */}
                {h2hRaces.length > 0 && (
                  <div
                    style={{
                      height: "3px",
                      background: "rgba(255,255,255,0.08)",
                      marginTop: "10px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${(h2hWins / h2hRaces.length) * 100}%`,
                        background: teamColor,
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                )}
              </div>
              {/* Teammate */}
              <div style={{ textAlign: "right", flex: 1 }}>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.3)",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    margin: "0 0 2px 0",
                  }}
                >
                  Teammate
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.3rem",
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.6)",
                    margin: 0,
                  }}
                >
                  {teammateName.toUpperCase()}
                </p>
              </div>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={DRIVER_IMAGES[teammateDriverId ?? ""] ?? FALLBACK_DRIVER}
                  alt={teammateName}
                  fill
                  style={{ objectFit: "contain" }}
                  onError={(e) => {
                    ; (e.target as HTMLImageElement).src = FALLBACK_DRIVER
                  }}
                />
              </div>
            </div>

            {/* H2H table */}
            {h2hRaces.length === 0 ? (
              <div
                style={{
                  padding: "60px 16px",
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
                  NO H2H DATA FOR {season}
                </p>
              </div>
            ) : (
              <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 5rem 5rem 5rem 7rem",
                    padding: "10px 16px",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {[
                    "Race",
                    driver.code ?? driver.familyName,
                    teammate?.driver.code ?? "TM",
                    "Gap",
                    "Ahead",
                  ].map((h) => (
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
                {h2hRaces.map((r, i) => {
                  const driverAhead = r.position! < r.h2h!.teammatePos!
                  const gap = Math.abs(r.position! - r.h2h!.teammatePos!)
                  return (
                    <div
                      key={r.round}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 5rem 5rem 5rem 7rem",
                        alignItems: "center",
                        padding: "12px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        transition: "background-color 0.15s",
                      }}
                      onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "rgba(255,255,255,0.04)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.88rem",
                            color: "#fff",
                            fontWeight: 400,
                          }}
                        >
                          {r.raceName.replace("Grand Prix", "GP").toUpperCase()}
                        </div>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "rgba(255,255,255,0.3)",
                            marginTop: "1px",
                          }}
                        >
                          {r.country}
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          color: posColor(r.position),
                        }}
                      >
                        {r.position}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          color: posColor(r.h2h!.teammatePos),
                        }}
                      >
                        {r.h2h!.teammatePos}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.85rem",
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        {gap}P
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "10px",
                          letterSpacing: "0.12em",
                          color: driverAhead
                            ? teamColor
                            : "rgba(255,255,255,0.3)",
                          border: `1px solid ${driverAhead ? teamColor : "rgba(255,255,255,0.1)"}`,
                          padding: "3px 10px",
                          textTransform: "uppercase",
                          display: "inline-block",
                        }}
                      >
                        {driverAhead
                          ? (driver.code ?? driver.familyName)
                          : (teammate?.driver.code ?? "TM")}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CAREER TAB ── */}
        {tab === "career" && (
          <div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: teamColor,
                marginBottom: "6px",
              }}
            >
              Formula 1
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                fontWeight: 700,
                color: "#ffffff",
                margin: "0 0 4px 0",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              CAREER STATISTICS
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: "0.85rem",
                marginBottom: "24px",
              }}
            >
              All-time Formula One record
            </p>

            {/* Career totals — leader card style */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "16px 20px",
                marginBottom: "28px",
                backgroundColor: "rgba(245,200,66,0.06)",
                border: "1px solid rgba(245,200,66,0.15)",
                borderLeft: "3px solid #F5C842",
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  label: "Championships",
                  value: careerTotals.championships,
                  color: "#F5C842",
                },
                {
                  label: "Race Starts",
                  value: careerTotals.races,
                  color: "#ffffff",
                },
                { label: "Wins", value: careerTotals.wins, color: "#ffffff" },
                {
                  label: "Podiums",
                  value: careerTotals.podiums,
                  color: "#C0C0C0",
                },
                {
                  label: "Points",
                  value: careerTotals.points,
                  color: "#ffffff",
                },
                {
                  label: "Fastest Laps",
                  value: careerTotals.fastestLaps,
                  color: "#a855f7",
                },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  style={{
                    flex: 1,
                    minWidth: "80px",
                    textAlign: i === 0 ? "left" : "center",
                    borderLeft:
                      i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    padding: i > 0 ? "0 16px" : "0 16px 0 0",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: i === 0 ? "2.5rem" : "2rem",
                      fontWeight: 700,
                      color: stat.color,
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
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      margin: "2px 0 0 0",
                    }}
                  >
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
                  gridTemplateColumns: "5rem 1fr 6rem 6rem 5rem",
                  padding: "10px 16px",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {["Season", "Team", "Position", "Points", "Wins"].map((h) => (
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
              {careerHistory.map((ch, i) => {
                const tc = getTeamColor(ch.constructorId)
                const isChamp = ch.position === 1
                return (
                  <div
                    key={ch.season}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "5rem 1fr 6rem 6rem 5rem",
                      alignItems: "center",
                      padding: "13px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      backgroundColor: isChamp
                        ? "rgba(245,200,66,0.05)"
                        : "transparent",
                      transition: "background-color 0.15s",
                    }}
                    onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.04)")
                    }
                    onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = isChamp
                      ? "rgba(245,200,66,0.05)"
                      : "transparent")
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          color: isChamp ? "#F5C842" : "#ffffff",
                        }}
                      >
                        {ch.season}
                      </span>
                      {isChamp && (
                        <span style={{ fontSize: "0.75rem" }}>🏆</span>
                      )}
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
                          height: "14px",
                          background: tc,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.85rem",
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        {ch.constructorName}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        color: posColor(ch.position),
                      }}
                    >
                      {posOrdinal(ch.position)}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        color: "#ffffff",
                      }}
                    >
                      {ch.points}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        color:
                          ch.wins > 0 ? "#F5C842" : "rgba(255,255,255,0.2)",
                      }}
                    >
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
