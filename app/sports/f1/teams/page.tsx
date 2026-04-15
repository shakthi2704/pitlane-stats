"use client"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { getTeamColor, getFlagEmoji } from "@/types/f1/f1-api"
import type { ConstructorStanding, DriverStanding } from "@/types/f1"
import {
  TEAM_CARS,
  TEAM_LOGOS,
  DRIVER_IMAGES,
  FALLBACK_DRIVER,
  AVAILABLE_SEASONS,
  CURRENT_SEASON,
  FALLBACK_CAR,
} from "@/lib/f1/f1-constants"
import F1Loader from "@/components/f1/F1Loader"

const SEASONS = AVAILABLE_SEASONS


const TopTeamCard = ({
  standing,
  drivers,
  isLeader,
}: {
  standing: ConstructorStanding
  drivers: DriverStanding[]
  isLeader: boolean
}) => {
  const teamColor = getTeamColor(standing.constructorId)
  const carSrc = TEAM_CARS[standing.constructorId] ?? FALLBACK_CAR

  return (
    <Link
      href={`/sports/f1/teams/${standing.constructorId}`}
      style={{ textDecoration: "none", flex: isLeader ? "1.2" : "1" }}
    >
      <div
        style={{
          position: "relative",
          height: isLeader ? "300px" : "270px",
          overflow: "hidden",
          backgroundColor: teamColor,
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
              "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.05) 100%)",
            zIndex: 1,
          }}
        />

        {/* Position watermark */}
        <div
          style={{
            position: "absolute",
            right: "-8px",
            bottom: "-16px",
            fontFamily: "var(--font-display)",
            fontSize: "9rem",
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

        {/* Car image */}
        {carSrc && (
          <img
            src={carSrc}
            alt={standing.constructor.name}
            style={{
              position: "absolute",
              right: "0px",
              bottom: "50px",
              height: "55%",
              width: "auto",
              objectFit: "contain",

              zIndex: 3,
              filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.5))",
            }}
            onError={(e) => {
              ; (e.target as HTMLImageElement).src = FALLBACK_CAR
            }}
          />
        )}

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
          {/* Top */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            {/* Position */}
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              P{standing.position}
            </span>

            {/* Logo + Team Name */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >



              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: isLeader ? "1.8rem" : "1.4rem",
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                {standing.constructor.name.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Bottom */}
          <div>

            {drivers.length > 0 && (
              <div
                style={{ display: "flex", gap: "24px" }}
              >
                {drivers.map((d) => (
                  <div
                    key={d.driverId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {/* <img
                      src={DRIVER_IMAGES[d.driverId] ?? FALLBACK_DRIVER}
                      alt={d.driver.familyName}
                      style={{
                        width: "20px",
                        height: "20px",
                        objectFit: "contain",
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.3)",
                      }}
                      onError={(e) => {
                        ; (e.target as HTMLImageElement).src = FALLBACK_DRIVER
                      }}
                    /> */}
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.80rem",
                        color: "rgba(255,255,255,0.7)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {d.driver.code ??
                        d.driver.familyName.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}


            <div
              style={{
                display: "flex",
                gap: "16px",
                paddingTop: "10px",
                borderTop: "2px solid rgba(255,255,255,0.15)",
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
                      i === 0 ? "2px solid rgba(255,255,255,0.15)" : "none",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      fontWeight: 700,
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

const TeamCard = ({
  standing,
  drivers,
}: {
  standing: ConstructorStanding
  drivers: DriverStanding[]
}) => {
  const teamColor = getTeamColor(standing.constructorId)
  const carSrc = TEAM_CARS[standing.constructorId] ?? null
  const logoSrc = TEAM_LOGOS[standing.constructorId] ?? null
  const medalColors = ["#F5C842", "#C0C0C0", "#CD7F32"]
  const medalColor =
    medalColors[standing.position - 1] ?? "rgba(255,255,255,0.6)"
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <Link
      href={`/sports/f1/teams/${standing.constructorId}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          position: "relative",
          height: "240px",
          overflow: "hidden",
          backgroundColor: teamColor,
          isolation: "isolate",
          // transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = "translateY(-4px)"
          el.style.boxShadow = `0 16px 32px ${teamColor}40`
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = "translateY(0)"
          el.style.boxShadow = "none"
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

        {/* Position watermark */}
        <div
          style={{
            position: "absolute",
            right: "-8px",
            bottom: "-12px",
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

        {/* Car */}
        {carSrc && (
          <img
            src={carSrc}
            alt={standing.constructor.name}
            style={{
              position: "absolute",
              right: "0px",
              bottom: "48px",
              height: "45%",
              width: "auto",
              objectFit: "contain",
              zIndex: 3,
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
            }}
            onError={(e) => {
              ; (e.target as HTMLImageElement).src = FALLBACK_CAR
            }}
          />
        )}

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 4,
            padding: "16px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Top section: Logo + Team Name + Position */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            {/* Logo + Team Name */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={standing.constructor.name}
                  style={{
                    height: "28px",
                    width: "auto",
                    objectFit: "contain",
                    filter: "brightness(0) invert(1)",
                    opacity: 0.9,
                  }}
                  onError={(e) => {
                    ; (e.target as HTMLImageElement).src = FALLBACK_CAR
                  }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "11px",
                    color: "#fff",
                    background: "rgba(0,0,0,0.35)",
                    padding: "2px 8px",
                  }}
                >
                  {standing.constructor.name.slice(0, 3).toUpperCase()}
                </span>
              )}

              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                {standing.constructor.name.toUpperCase()}
              </span>
            </div>

            {/* Position */}
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: medalColor,
                letterSpacing: "0.05em",
              }}
            >
              P{standing.position}
            </span>
          </div>

          {/* Bottom section */}
          <div>
            {drivers.length > 0 && (
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                {drivers.map((d) => (
                  <div
                    key={d.driverId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {/* <span style={{ fontSize: "12px" }}>
                      {getFlagEmoji(d.driver.nationality ?? "")}
                    </span> */}
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.6rem",
                        color: "rgba(255,255,255,0.6)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {d.driver.code ??
                        d.driver.familyName.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "16px",
                paddingTop: "8px",
                borderTop: "1px solid rgba(255,255,255,0.12)",
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
                      i === 0 ? "1px solid rgba(255,255,255,0.12)" : "none",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1rem",
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
                      color: "rgba(255,255,255,0.3)",
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

export default function TeamsPage() {
  const [season, setSeason] = useState(CURRENT_SEASON)
  const [standings, setStandings] = useState<ConstructorStanding[]>([])
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([])
  const [loading, setLoading] = useState(true)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/f1/constructor-standings?season=${season}`).then((r) =>
        r.json(),
      ),
      fetch(`/api/f1/driver-standings?season=${season}`).then((r) => r.json()),
    ])
      .then(([cData, dData]) => {
        setStandings(cData.standings ?? [])
        setDriverStandings(dData.standings ?? [])
      })
      .finally(() => setLoading(false))
  }, [season])

  // Group drivers by constructorId
  const driversByTeam = driverStandings.reduce<
    Record<string, DriverStanding[]>
  >((acc, d) => {
    if (!acc[d.constructorId]) acc[d.constructorId] = []
    acc[d.constructorId].push(d)
    return acc
  }, {})

  const top3 = standings.slice(0, 3)
  const rest = standings.slice(3)

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(
    Boolean,
  ) as ConstructorStanding[]


  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })
  }

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })
  }

  return (
    <div>
      {/* Header */}
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
                  color: "var(--accent)",
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
                TEAMS
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: "0.875rem",
                  margin: 0,
                }}
              >
                {season} FIA Formula One World Championship · {standings.length}{" "}
                constructors
              </p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
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
                          ? "var(--accent)"
                          : "rgba(255,255,255,0.1)",
                      backgroundColor:
                        season === s ? "var(--accent)" : "transparent",
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
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading && <F1Loader message="LOADING TEAMS..." />}

        {!loading && standings.length > 0 && (
          <>
            {/* Top 3 */}
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
                    backgroundColor: "var(--accent)",
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
                {podiumOrder.map((s) => (
                  <TopTeamCard
                    key={s.constructorId}
                    standing={s}
                    drivers={driversByTeam[s.constructorId] ?? []}
                    isLeader={s.position === 1}
                  />
                ))}
              </div>
            </div>

            {/* Rest */}
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
                    ALL TEAMS
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
                    <TeamCard
                      key={s.constructorId}
                      standing={s}
                      drivers={driversByTeam[s.constructorId] ?? []}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!loading && standings.length === 0 && (
          <div style={{ padding: "80px 0", textAlign: "center" }}>
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
