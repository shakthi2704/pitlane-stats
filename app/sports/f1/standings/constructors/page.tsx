"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { getTeamColor, getFlagEmoji } from "@/types/f1/f1-api"
import type { DriverStanding } from "@/types/f1"

const SEASONS = Array.from({ length: 8 }, (_, i) => String(2025 - i))

const DRIVER_IMAGES: Record<string, string> = {
  norris: "/F1/drivers/lando-norris.avif",
  max_verstappen: "/F1/drivers/max-verstappen.avif",
  piastri: "/F1/drivers/oscar-piastri.avif",
  russell: "/F1/drivers/george-russell.avif",
  leclerc: "/F1/drivers/charles-leclerc.avif",
  hamilton: "/F1/drivers/lewis-hamilton.avif",
  sainz: "/F1/drivers/carlos-sainz.avif",
  alonso: "/F1/drivers/fernando-alonso.avif",
  albon: "/F1/drivers/alex-albon.avif",
  antonelli: "/F1/drivers/kimi-antonelli.avif",
}

const TEAM_LOGOS: Record<string, string> = {
  mclaren: "/F1/logos/mclarenlogowhite.webp",
  mercedes: "/F1/logos/mercedeslogowhite.webp",
  red_bull: "/F1/logos/redbullracinglogowhite.webp",
  ferrari: "/F1/logos/ferrarilogolight.webp",
  williams: "/F1/logos/williamslogowhite.webp",
  rb: "/F1/logos/racingbullslogowhite.webp",
  aston_martin: "/F1/logos/astonmartinlogowhite.webp",
  haas: "/F1/logos/haaslogowhite.webp",
  kick_sauber: "/F1/logos/audilogowhite.webp",
  alpine: "/F1/logos/alpinelogowhite.webp",
}

const FALLBACK = "/F1/drivers/placeholder.svg"

export default function DriverStandingsPage() {
  const [season, setSeason] = useState("2025")
  const [standings, setStandings] = useState<DriverStanding[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/f1/driver-standings?season=${season}`)
      .then((r) => r.json())
      .then((data) => setStandings(data.standings ?? []))
      .finally(() => setLoading(false))
  }, [season])

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
            DRIVER STANDINGS
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: "0.85rem",
              marginTop: "8px",
            }}
          >
            {season} FIA Formula One World Championship
          </p>
        </div>

        {/* Season selector */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {SEASONS.map((s) => (
            <button
              key={s}
              onClick={() => setSeason(s)}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "12px",
                fontWeight: 600,
                padding: "6px 14px",
                cursor: "pointer",
                border: "1px solid",
                transition: "all 0.2s",
                borderColor:
                  season === s
                    ? "var(--color-f1-red)"
                    : "rgba(255,255,255,0.1)",
                backgroundColor:
                  season === s ? "var(--color-f1-red)" : "transparent",
                color: season === s ? "#ffffff" : "rgba(255,255,255,0.4)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Champion card */}
      {leader && !loading && (
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
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              overflow: "hidden",
              backgroundColor: getTeamColor(leader.constructorId) + "40",
              border: `2px solid ${getTeamColor(leader.constructorId)}`,
            }}
          >
            <img
              src={DRIVER_IMAGES[leader.driverId] ?? FALLBACK}
              alt={leader.driver.familyName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top",
              }}
              onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "11px",
                color: "#F5C842",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                margin: "0 0 2px 0",
              }}
            >
              {season} Championship Leader
            </p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
              }}
            >
              {leader.driver.givenName} {leader.driver.familyName}
            </p>
            <p
              style={{
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.4)",
                margin: "2px 0 0 0",
              }}
            >
              {leader.constructorName} ·{" "}
              {getFlagEmoji(leader.driver.nationality ?? "")}{" "}
              {leader.driver.nationality}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.5rem",
                fontWeight: 700,
                color: "#F5C842",
                margin: 0,
                lineHeight: 1,
              }}
            >
              {leader.points}
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
              Points
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.7)",
                margin: 0,
                lineHeight: 1,
              }}
            >
              {leader.wins}
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
            gridTemplateColumns: "3rem 3rem 1fr 1fr 1fr 5rem 5rem 6rem",
            padding: "12px 16px",
            backgroundColor: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {[
            "POS.",
            "NO.",
            "DRIVER",
            "NATIONALITY",
            "TEAM",
            "WINS",
            "GAP",
            "PTS",
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

        {/* Loading */}
        {loading && (
          <div style={{ padding: "60px 16px", textAlign: "center" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "2px solid var(--color-f1-red)",
                borderTopColor: "transparent",
                animation: "spin 1s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "11px",
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.15em",
              }}
            >
              LOADING...
            </p>
          </div>
        )}

        {/* Rows */}
        {!loading &&
          standings.map((s, i) => {
            const teamColor = getTeamColor(s.constructorId)
            const logoSrc = TEAM_LOGOS[s.constructorId] ?? null
            const imgSrc = DRIVER_IMAGES[s.driverId] ?? FALLBACK
            const gap =
              i === 0 ? "—" : `-${(leader.points - s.points).toFixed(0)}`
            const isTop3 = i < 3

            return (
              <Link
                key={s.driverId}
                href={`/sports/f1/drivers/${s.driverId}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "3rem 3rem 1fr 1fr 1fr 5rem 5rem 6rem",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    transition: "background-color 0.15s",
                    backgroundColor: isTop3 ? `${teamColor}08` : "transparent",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      "rgba(255,255,255,0.04)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      isTop3 ? `${teamColor}08` : "transparent")
                  }
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

                  {/* Driver number */}
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: teamColor,
                      opacity: 0.8,
                    }}
                  >
                    {s.driver.permanentNumber ?? "—"}
                  </span>

                  {/* Driver */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        backgroundColor: teamColor + "30",
                        border: `1px solid ${teamColor}50`,
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={imgSrc}
                        alt={s.driver.familyName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "top",
                        }}
                        onError={(e) =>
                          ((e.target as HTMLImageElement).src = FALLBACK)
                        }
                      />
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          color: "#ffffff",
                          margin: 0,
                        }}
                      >
                        {s.driver.givenName[0]}. {s.driver.familyName}
                      </p>
                      <div
                        style={{
                          width: "3px",
                          height: "0",
                          display: "inline-block",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        width: "3px",
                        height: "20px",
                        backgroundColor: teamColor,
                        flexShrink: 0,
                      }}
                    />
                  </div>

                  {/* Nationality */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>
                      {getFlagEmoji(s.driver.nationality ?? "")}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      {s.driver.nationality}
                    </span>
                  </div>

                  {/* Team with logo */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {logoSrc && (
                      <img
                        src={logoSrc}
                        alt={s.constructorName}
                        style={{
                          height: "16px",
                          width: "auto",
                          objectFit: "contain",
                          filter: "brightness(0) invert(1)",
                          opacity: 0.6,
                        }}
                        onError={(e) =>
                          ((e.target as HTMLImageElement).style.display =
                            "none")
                        }
                      />
                    )}
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      {s.constructorName}
                    </span>
                  </div>

                  {/* Wins */}
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: s.wins > 0 ? "#ffffff" : "rgba(255,255,255,0.25)",
                    }}
                  >
                    {s.wins}
                  </span>

                  {/* Gap */}
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: i === 0 ? "#F5C842" : "rgba(255,255,255,0.35)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {gap}
                  </span>

                  {/* Points */}
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#ffffff",
                      textAlign: "right",
                    }}
                  >
                    {s.points}
                  </span>
                </div>
              </Link>
            )
          })}

        {/* Empty state */}
        {!loading && standings.length === 0 && (
          <div style={{ padding: "60px 16px", textAlign: "center" }}>
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
        )}
      </div>
    </div>
  )
}
