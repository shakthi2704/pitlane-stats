"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getTeamColor, getFlagEmoji } from "@/types/f1/f1-api"
import { DRIVER_IMAGES, FALLBACK_DRIVER } from "@/lib/fi/f1-constants"
import { CIRCUIT_STATIC } from "@/lib/fi/circuit-data"
import { MapPinCheckInside } from "lucide-react"
import F1Loader from "@/components/f1/F1Loader"

interface Circuit {
  circuitId: string
  circuitName: string
  locality: string | null
  country: string | null
  lat: string | null
  lng: string | null
  races: Race[]
}

interface Race {
  id: number
  season: string
  round: number
  raceName: string
  date: string
  results: RaceResult[]
}

interface RaceResult {
  positionText: string
  points: number | null
  time: string | null
  status: string | null
  driver: {
    driverId: string
    givenName: string
    familyName: string
    nationality: string | null
  }
  constructor: {
    constructorId: string
    name: string
  }
}

const CircuitMap = ({
  circuitId,
  geojsonFile,
  lat,
  lng,
}: {
  circuitId: string
  geojsonFile: string | null
  lat: string | null
  lng: string | null
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return

    let map: any = null

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default
        // await import("leaflet/dist/leaflet.css")

        if (map) return

        map = L.map(mapRef.current!, {
          center: [parseFloat(lat), parseFloat(lng)],
          zoom: 15,
          zoomControl: true,
          attributionControl: false,
        })

        // Dark tile layer
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          // "https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",

          {
            maxZoom: 15,
          },
        ).addTo(map)

        // Load GeoJSON if available
        if (geojsonFile) {
          try {
            const res = await fetch(
              `/F1/circuits/geojson/${encodeURIComponent(geojsonFile)}`,
            )
            if (res.ok) {
              const data = await res.json()
              L.geoJSON(data, {
                style: {
                  color: "#E10600",
                  weight: 3,
                  opacity: 0.9,
                },
              }).addTo(map)
            }
          } catch { }
        }

        // Circuit marker
        L.circleMarker([parseFloat(lat), parseFloat(lng)], {
          radius: 6,
          fillColor: "#E10600",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 1,
        }).addTo(map)
      } catch (e) {
        setError(true)
      }
    }

    initMap()

    return () => {
      if (map) {
        map.remove()
        map = null
      }
    }
  }, [lat, lng, geojsonFile])

  if (error) {
    return (
      <div
        style={{
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "11px",
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Map unavailable
        </p>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      style={{
        height: "400px",
        width: "100%",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    />
  )
}

const StatBox = ({
  label,
  value,
  sub,
}: {
  label: string
  value: string | number
  sub?: string
}) => (
  <div
    style={{
      backgroundColor: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      padding: "16px",
    }}
  >
    <p
      style={{
        fontSize: "10px",
        color: "rgba(255,255,255,0.25)",
        margin: "0 0 4px 0",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        fontFamily: "var(--font-display)",
      }}
    >
      {label}
    </p>
    <p
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "1.4rem",
        fontWeight: 700,
        color: "#ffffff",
        margin: 0,
        lineHeight: 1,
      }}
    >
      {value}
    </p>
    {sub && (
      <p
        style={{
          fontSize: "0.7rem",
          color: "rgba(255,255,255,0.3)",
          margin: "4px 0 0 0",
        }}
      >
        {sub}
      </p>
    )}
  </div>
)

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

export default function CircuitDetailPage() {
  const params = useParams()
  const circuitId = params.id as string

  const [circuit, setCircuit] = useState<Circuit | null>(null)
  const [loading, setLoading] = useState(true)

  const staticData = CIRCUIT_STATIC[circuitId] ?? null

  useEffect(() => {
    fetch(`/api/f1/circuits/${circuitId}`)
      .then((r) => r.json())
      .then((data) => setCircuit(data.circuit ?? null))
      .finally(() => setLoading(false))
  }, [circuitId])

  if (loading) {
    return (
      <div style={{ padding: "80px" }}>
        {loading && <F1Loader message="LOADING CIRCUIT DETAILS..." />}
      </div>
    )
  }
  if (!circuit) {
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
            CIRCUIT NOT FOUND
          </p>
          <Link
            href="/sports/f1/circuits"
            style={{
              color: "var(--color-f1-red)",
              textDecoration: "none",
              fontSize: "0.85rem",
            }}
          >
            ← Back to Circuits
          </Link>
        </div>
      </div>
    )
  }
  const races = [...(circuit.races ?? [])].sort(
    (a, b) => parseInt(b.season) - parseInt(a.season),
  )
  return (
    <div>
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-10">
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
              href="/sports/f1/circuits"
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.3)",
                textDecoration: "none",
                fontFamily: "var(--font-display)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Circuits
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
              {circuit.circuitId}
            </span>
          </div>
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
            Formula 1 Circuit
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
            {circuit.circuitName.toUpperCase()}
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.875rem",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <MapPinCheckInside size={16} className="text-f1-red" />
            {circuit.locality}, {circuit.country}
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-14"></div>
      <section className="max-w-7xl mx-auto">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "6px",
          }}
        >
          <CircuitMap
            circuitId={circuitId}
            geojsonFile={staticData?.geojson ?? null}
            lat={circuit.lat}
            lng={circuit.lng}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px",
              }}
            >
              <StatBox label="Track Length" value={staticData?.length ?? "—"} />
              <StatBox label="Race Laps" value={staticData?.laps ?? "—"} />
              <StatBox label="Corners" value={staticData?.corners ?? "—"} />
              <StatBox label="DRS Zones" value={staticData?.drsZones ?? "—"} />
              <StatBox
                label="First Grand Prix"
                value={staticData?.firstGP ?? "—"}
              />
              <StatBox
                label="Total GPs Held"
                value={races.length}
                sub={`${races[races.length - 1]?.season ?? "?"} – ${races[0]?.season ?? "?"}`}
              />
            </div>
            {staticData && (
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: "32px 16px",
                }}
              >
                <p
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.25)",
                    margin: "0 0 4px 0",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Lap Record
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: "#03954a",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {staticData.lapRecord}
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.4)",
                    margin: "4px 0 0 0",
                  }}
                >
                  {staticData.lapRecordHolder} · {staticData.lapRecordYear}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto mt-10">
        <SectionHeader title={`GRAND PRIX HISTORY · ${races.length} RACES`} />

        <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "5rem 1fr 1fr 1fr 6rem",
              padding: "10px 16px",
              backgroundColor: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {["YEAR", "WINNER", "TEAM", "NATIONALITY", "TIME"].map((h) => (
              <span
                key={h}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.50)",
                }}
              >
                {h}
              </span>
            ))}
          </div>
          {races.map((race) => {
            const winner = race.results?.find((r) => r.positionText === "1")
            if (!winner) return null
            const teamColor = getTeamColor(winner.constructor.constructorId)
            const imgSrc =
              DRIVER_IMAGES[winner.driver.driverId] ?? FALLBACK_DRIVER

            return (
              <Link
                key={race.id}
                href={`/sports/f1/races/${race.round}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "5rem 1fr 1fr 1fr 6rem",
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
                  {/* Year */}
                  <span
                    style={{
                      fontFamily: "var(--font-roboro-mono)",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: "#ffffff",
                    }}
                  >
                    {race.season}
                  </span>

                  {/* Winner */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        backgroundColor: teamColor + "40",
                        border: `1px solid ${teamColor}60`,
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={imgSrc}
                        alt={winner.driver.familyName}
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <div
                        style={{
                          width: "3px",
                          height: "18px",
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
                        {winner.driver.givenName[0]}. {winner.driver.familyName}
                      </span>
                    </div>
                  </div>

                  {/* Team */}
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {winner.constructor.name}
                  </span>

                  {/* Nationality */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>
                      {getFlagEmoji(winner.driver.nationality ?? "")}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      {winner.driver.nationality}
                    </span>
                  </div>

                  {/* Time */}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.78rem",
                      color: "rgba(255,255,255,0.4)",
                      textAlign: "right",
                    }}
                  >
                    {winner.time ?? "—"}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
