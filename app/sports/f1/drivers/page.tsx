"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getTeamColor, getFlagEmoji } from "@/types/f1/f1-api"
import type { DriverStanding } from "@/types/f1"
import {
  DRIVER_IMAGES,
  TEAM_CARS,
  FALLBACK_DRIVER,
  AVAILABLE_SEASONS,
  CURRENT_SEASON,
  TEAM_LOGOS,
} from "@/lib/fi/f1-constants"
import F1Loader from "@/components/f1/F1Loader"

const TopDriverCard = ({ standing }: { standing: DriverStanding }) => {
  const teamColor = getTeamColor(standing.constructorId)
  const imgSrc = DRIVER_IMAGES[standing.driverId] ?? FALLBACK_DRIVER
  const logoSrc = TEAM_LOGOS[standing.constructorId] ?? null
  const medalColors = ["#F5C842", "#C0C0C0", "#CD7F32"]
  const medalColor = medalColors[(standing.position ?? 1) - 1] ?? "#F5C842"

  return (
    <Link
      href={`/sports/f1/drivers/${standing.driverId}`}
      style={{
        textDecoration: "none",
        flex: standing.position === 1 ? "1.2" : "1",
      }}
    >
      <div
        style={{
          position: "relative",
          height: "280px",
          overflow: "hidden",
          backgroundColor: teamColor,
          isolation: "isolate",
          transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"
          ;(e.currentTarget as HTMLElement).style.boxShadow =
            `0 20px 40px ${teamColor}50`
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.transform = "translateY(0)"
          ;(e.currentTarget as HTMLElement).style.boxShadow = "none"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%)",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "-10px",
            bottom: "-20px",
            fontFamily: "var(--font-display)",
            fontSize: "11rem",
            fontWeight: 900,
            lineHeight: 1,
            color: "rgba(0,0,0,0.2)",
            zIndex: 2,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {standing.position}
        </div>
        <img
          src={imgSrc}
          alt={standing.driver.familyName}
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
        <div
          style={{
            position: "relative",
            zIndex: 4,
            padding: "18px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Top */}
          {/* <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={standing.constructorName}
                style={{
                  height: "48px",
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
                {standing.constructorName.slice(0, 3).toUpperCase()}
              </span>
            )}
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: medalColor,
                letterSpacing: "0.1em",
              }}
            >
              P{standing.position}
            </span>
          </div> */}
          {/* Top */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "16px",
            }}
          >
            {/* Team logo */}
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={standing.constructorName}
                style={{
                  height: "48px",
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
                {standing.constructorName.slice(0, 3).toUpperCase()}
              </span>
            )}

            {/* Position badge */}
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: medalColor,
                letterSpacing: "0.1em",
              }}
            >
              P{standing.position}
            </span>
          </div>
          {/* Bottom */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "2px",
              }}
            >
              <span style={{ fontSize: "32px" }}>
                {getFlagEmoji(standing.driver.nationality ?? "")}
              </span>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.6)",
                  margin: 0,
                  fontFamily: "var(--font-roboto-mono)",
                }}
              >
                {standing.driver.givenName}
              </p>
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "#ffffff",
                margin: "0 0 8px 0",
                lineHeight: 1,
              }}
            >
              {standing.driver.familyName.toUpperCase()}
            </p>
            <div
              style={{
                display: "flex",
                gap: "16px",
                paddingTop: "10px",
                borderTop: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {[
                { label: "PTS", value: standing.points },
                { label: "WINS", value: standing.wins },
              ].map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    paddingRight: i === 0 ? "16px" : 0,
                    borderRight:
                      i === 0 ? "1px solid rgba(255,255,255,0.15)" : "none",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: medalColor,
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </p>
                  <p
                    style={{
                      fontSize: "9px",
                      color: "rgba(255,255,255,0.35)",
                      margin: "2px 0 0 0",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

const DriverCard = ({ standing }: { standing: DriverStanding }) => {
  const teamColor = getTeamColor(standing.constructorId)
  const imgSrc = DRIVER_IMAGES[standing.driverId] ?? FALLBACK_DRIVER
  const logoSrc = TEAM_LOGOS[standing.constructorId] ?? null
  const medalColors = ["#F5C842", "#C0C0C0", "#CD7F32"]
  const medalColor = medalColors[(standing.position ?? 1) - 1] ?? "#F5C842"

  return (
    <Link
      href={`/sports/f1/drivers/${standing.driverId}`}
      style={{
        textDecoration: "none",
        flex: standing.position === 1 ? "1.2" : "1",
      }}
    >
      <div
        style={{
          position: "relative",
          height: "280px",
          overflow: "hidden",
          backgroundColor: teamColor + "50",
          isolation: "isolate",
          transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = "translateY(-4px)"
          el.style.boxShadow = `0 20px 40px ${teamColor}50`
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = "translateY(0)"
          el.style.boxShadow = "none"
        }}
      >
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%)",
            zIndex: 1,
          }}
        />
        {/* Faint position watermark */}
        <div
          style={{
            position: "absolute",
            right: "-10px",
            bottom: "-20px",
            fontFamily: "var(--font-display)",
            fontSize: "6rem",
            fontWeight: 900,
            lineHeight: 1,
            color: "rgba(0,0,0,0.2)",
            zIndex: 2,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {standing.position}
        </div>

        {/* Driver image */}
        <img
          src={imgSrc}
          alt={standing.driver.familyName}
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            height: "80%",
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
            padding: "18px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Top: logo + position badge */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={standing.constructorName}
                style={{
                  height: "32px",
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
                {standing.constructorName.slice(0, 3).toUpperCase()}
              </span>
            )}

            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
                fontWeight: 700,
                color: medalColor,
                letterSpacing: "0.05em",
              }}
            >
              P{standing.position}
            </span>
          </div>

          {/* Bottom: driver info */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "2px",
              }}
            >
              <span style={{ fontSize: "24px" }}>
                {getFlagEmoji(standing.driver.nationality ?? "")}
              </span>
              <p
                style={{
                  fontSize: "0.5rem",
                  color: "rgba(255,255,255,0.6)",
                  margin: 0,
                  fontFamily: "var(--font-roboto-mono)",
                }}
              >
                {standing.driver.givenName}
              </p>
            </div>

            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "#ffffff",
                margin: "0 0 8px 0",
                lineHeight: 1,
              }}
            >
              {standing.driver.familyName.toUpperCase()}
            </p>

            <div
              style={{
                display: "flex",
                gap: "16px",
                paddingTop: "10px",
                borderTop: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {[
                { label: "PTS", value: standing.points },
                { label: "WINS", value: standing.wins },
              ].map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    paddingRight: i === 0 ? "16px" : 0,
                    borderRight:
                      i === 0 ? "1px solid rgba(255,255,255,0.15)" : "none",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: medalColor,
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </p>
                  <p
                    style={{
                      fontSize: "9px",
                      color: "rgba(255,255,255,0.35)",
                      margin: "2px 0 0 0",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
export default function DriversPage() {
  const [season, setSeason] = useState(CURRENT_SEASON)
  const [standings, setStandings] = useState<DriverStanding[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/f1/driver-standings?season=${season}`)
      .then((r) => r.json())
      .then((data) => setStandings(data.standings ?? []))
      .finally(() => setLoading(false))
  }, [season])

  const top3 = standings.slice(0, 3)
  const rest = standings.slice(3)

  return (
    <div>
      <div
        style={{
          background: "linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 100%)",
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
                DRIVERS
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: "0.875rem",
                  margin: 0,
                }}
              >
                {season} FIA Formula One World Championship · {standings.length}{" "}
                drivers
              </p>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {AVAILABLE_SEASONS.map((s) => (
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
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading && <F1Loader message="LOADING DRIVERS..." />}
        {!loading && standings.length > 0 && (
          <>
            <div style={{ marginBottom: "8px" }}>
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
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#ffffff",
                    margin: 0,
                    letterSpacing: "0.05em",
                  }}
                >
                  CHAMPIONSHIP LEADERS
                </h2>
              </div>
              <div
                style={{ display: "flex", gap: "6px", alignItems: "flex-end" }}
              >
                {[top3[1], top3[0], top3[2]].map((s, idx) => {
                  if (!s) return null
                  return <TopDriverCard key={s.driverId} standing={s} />
                })}
              </div>
            </div>

            {/* Rest of drivers */}
            {rest.length > 0 && (
              <div style={{ marginTop: "24px" }}>
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
                      backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                  />
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.6)",
                      margin: 0,
                      letterSpacing: "0.05em",
                    }}
                  >
                    ALL DRIVERS
                  </h2>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "6px",
                  }}
                >
                  {rest.map((s) => (
                    <DriverCard key={s.driverId} standing={s} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
