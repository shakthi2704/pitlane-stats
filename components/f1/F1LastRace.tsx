"use client"

import Link from "next/link"
import { getTeamColor, getFlagEmoji } from "@/types/f1/f1-api"
import type { Race, RaceResult } from "@/types/f1"
import {
  TEAM_SHORT,
  DRIVER_IMAGES,
  TEAM_CARS,
  TEAM_LOGOS,
  FALLBACK_CAR,
  FALLBACK_DRIVER,
  FALLBACK_LOGO,
  CURRENT_SEASON,
} from "@/lib/f1/f1-constants"

const medalColors = ["#F5C842", "#C0C0C0", "#CD7F32"]
const heights = ["280px", "250px", "240px"]


const PodiumCard = ({ result, rank }: { result: RaceResult; rank: number }) => {
  const teamColor = getTeamColor(result.constructor.constructorId)
  const imgSrc = DRIVER_IMAGES[result.driver.driverId] ?? FALLBACK_DRIVER
  const logoSrc = TEAM_LOGOS[result.constructor.constructorId] ?? null
  const posLabel = `P${rank}`
  const timeDisplay = result.time

  return (
    <Link
      href={`/sports/f1/drivers/${result.driver.driverId}`}
      style={{ textDecoration: "none", flex: rank === 1 ? "1.2" : "1" }}
    >
      <div
        style={{
          position: "relative",
          height: heights[rank - 1],
          overflow: "hidden",
          cursor: "pointer",
          backgroundColor: teamColor,
          isolation: "isolate",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          ; (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"
            ; (e.currentTarget as HTMLElement).style.boxShadow =
              `0 16px 40px ${teamColor}50`
        }}
        onMouseLeave={(e) => {
          ; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"
            ; (e.currentTarget as HTMLElement).style.boxShadow = "none"
        }}
      >
        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
          }}
        />

        {/* Big rank watermark */}
        <div
          style={{
            position: "absolute",
            right: "-5px",
            bottom: "-20px",
            fontFamily: "var(--font-display)",
            fontSize: "9rem",
            fontWeight: 900,
            color: "rgba(0,0,0,0.3)",
            zIndex: 2,
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
            objectFit: "contain",
            zIndex: 3,
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 4,
            padding: "14px 16px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start", // ✅ FIXED
          }}
        >
          {/* TOP */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "11px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.9)",
                backgroundColor: "rgba(0,0,0,0.4)",
                padding: "2px 8px",
              }}
            >
              {result.constructor.name}
            </span>

            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.9)",
                letterSpacing: "0.1em",
              }}
            >
              {posLabel}
            </span>
          </div>

          {/* DRIVER INFO (pushed DOWN) */}
          <div
            style={{
              marginTop: "68px", // or even 0
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "2px",
              }}
            >
              <span style={{ fontSize: "16px" }}>
                {getFlagEmoji(result.driver.nationality ?? "")}
              </span>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.65)",
                  margin: 0,
                }}
              >
                {result.driver.givenName}
              </p>
            </div>

            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: rank === 1 ? "1.4rem" : "1.2rem",
                fontWeight: 700,
                color: "#fff",
                margin: 0,
              }}
            >
              {result.driver.familyName.toUpperCase()}
            </p>

            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.8rem",
                color: "#fff",
                margin: "6px 0 0 0",
              }}
            >
              {timeDisplay ?? result.status}
            </p>
          </div>

          {/* BOTTOM BAR */}
          <div
            style={{
              marginTop: "auto",
              display: "flex",
              gap: "10px",
              paddingTop: "8px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {[
              { label: "Grid", value: result.grid ? `P${result.grid}` : "—" },
              { label: "Laps", value: result.laps ?? "—" },
              { label: "Pts", value: `+${result.points ?? 0}` },
            ].map((item, i) => (
              <div key={item.label} style={{ display: "flex", gap: "10px" }}>
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#fff",
                      margin: 0,
                    }}
                  >
                    {item.value}
                  </p>
                  <p
                    style={{
                      fontSize: "0.6rem",
                      color: "rgba(255,255,255,0.35)",
                      margin: 0,
                    }}
                  >
                    {item.label}
                  </p>
                </div>

                {i < 2 && (
                  <div
                    style={{
                      width: "1px",
                      height: "20px",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}

const F1LastRace = ({
  race,
  results,
  loading,
}: {
  race: Race | null
  results: RaceResult[]
  loading: boolean

}) => {
  if (!race || results.length === 0) return null


  // const top3 = results.slice(0, 3)
  const podiumOrder = [results[1], results[0], results[2]]
  const tableResults = results.slice(3)


  const formatGap = (gap?: string | null) => {
    if (!gap) return null

    const num = Number(gap)
    if (Number.isNaN(num)) return null
    if (num === 0) return null

    return `+${gap}`
  }
  return (
    <div className="bg-black p-6 mb-10 ">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "4px",
              height: "24px",
              backgroundColor: "var(--accent)",
            }}
          />
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
            }}
          >
            LAST RACE
          </h2>
        </div>
        <Link
          href={`/sports/f1/races/${race.round}`}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            textDecoration: "none",
          }}
        >
          Full Results →
        </Link>
      </div>
      <div
        style={{
          padding: "14px 16px",
          marginBottom: "20px",
          borderLeft: "3px solid var(--accent)",
          backgroundColor: `color-mix(in srgb, var(--accent) 10%, transparent)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
            }}
          >
            {race.raceName}
          </p>
          <p
            style={{
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.7)",
              margin: "4px 0 0 0",
              fontFamily: "var(--font-roboto)",
            }}
          >
            {race.circuit.locality}, {race.circuit.country} · Round {race.round}{" "}
            ·{" "}
            {new Date(race.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Link
          href={`/sports/f1/races/${race.round}`}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#ffffff",
            textDecoration: "none",
            padding: "8px 16px",
            border: "1px solid rgba(255,255,255,0.2)",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            ; (e.currentTarget as HTMLElement).style.backgroundColor =
              "rgba(255,255,255,0.05)"
              ; (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,0.4)"
          }}
          onMouseLeave={(e) => {
            ; (e.currentTarget as HTMLElement).style.backgroundColor =
              "transparent"
              ; (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,0.2)"
          }}
        >
          Full Results
        </Link>
      </div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          alignItems: "flex-end",
        }}
      >
        {podiumOrder.map((r, idx) => {
          if (!r) return null
          const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3
          return <PodiumCard key={r.driver.driverId} result={r} rank={rank} />
        })}
      </div>
      <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "3rem 2.5rem 1fr 1fr 1fr 6rem",
            padding: "10px 16px",
            backgroundColor: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {["POS.", "", "DRIVER", "NATIONALITY", "TEAM", "TIME / GAP"].map(
            (h) => (
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
            ),
          )}
        </div>
        {tableResults.map((r, i) => {
          const teamColor = getTeamColor(r.constructor.constructorId)
          const imgSrc = DRIVER_IMAGES[r.driver.driverId] ?? FALLBACK_DRIVER
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
                  gridTemplateColumns: "3rem 2.5rem 1fr 1fr 1fr 6rem",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  transition: "background-color 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor =
                  "rgba(255,255,255,0.03)")
                }
                onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor =
                  "transparent")
                }
              >
                {/* Position */}
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

                {/* Avatar */}
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
                      ((e.target as HTMLImageElement).src = FALLBACK_DRIVER)
                    }
                  />
                </div>

                {/* Driver name */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >

                  <span
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#ffffff",
                    }}
                  >
                    {r.driver.givenName[0]}. {r.driver.familyName}
                    {/* {isFastest && (
                      <span
                        style={{
                          marginLeft: "6px",
                          color: "#a855f7",
                          fontSize: "0.7rem",
                        }}
                      >
                        ⚡
                      </span>
                    )} */}
                  </span>
                </div>

                {/* Nationality */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <span style={{ fontSize: "14px" }}>
                    {getFlagEmoji(r.driver.nationality ?? "")}
                  </span>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {r.driver.nationality}
                  </span>
                </div>

                {/* Team */}
                <span
                  style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}
                >
                  {r.constructor.name}
                </span>

                {/* Time / gap */}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
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
        <Link
          href={`/sports/f1/races/${race.round}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "12px",
            fontFamily: "var(--font-display)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            textDecoration: "none",
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
          View Full Results →
        </Link>
      </div>
    </div>
  )
}

export default F1LastRace
