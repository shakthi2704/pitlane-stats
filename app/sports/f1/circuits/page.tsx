"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CIRCUIT_STATIC } from "@/lib/fi/circuit-data"
import { CIRCUIT_COLORS } from "@/lib/fi/f1-constants"
import F1Loader from "@/components/f1/F1Loader"

interface Circuit {
  circuitId: string
  circuitName: string
  locality: string | null
  country: string | null
  lat: string | null
  lng: string | null
}

const getColor = (id: string) => CIRCUIT_COLORS[id] ?? "#E10600"

export default function CircuitsPage() {
  const [circuits, setCircuits] = useState<Circuit[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/f1/circuits")
      .then((r) => r.json())
      .then((data) => setCircuits(data.circuits ?? []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = circuits.filter(
    (c) =>
      c.circuitName.toLowerCase().includes(search.toLowerCase()) ||
      c.country?.toLowerCase().includes(search.toLowerCase()) ||
      c.locality?.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <div>
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "48px 0 40px",
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
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
            CIRCUITS
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "0.875rem",
              margin: "0 0 28px 0",
            }}
          >
            {circuits.length} circuits in the Formula 1 database
          </p>
          <div style={{ position: "relative", maxWidth: "360px" }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.3)",
                pointerEvents: "none",
              }}
            >
              <circle
                cx="6"
                cy="6"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M9.5 9.5L13 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search circuits, countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 16px 10px 36px",
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#ffffff",
                fontFamily: "var(--font-sans)",
                fontSize: "0.875rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                ((e.target as HTMLInputElement).style.borderColor =
                  "var(--color-f1-red)")
              }
              onBlur={(e) =>
                ((e.target as HTMLInputElement).style.borderColor =
                  "rgba(255,255,255,0.1)")
              }
            />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-10">
          {loading && (
            <div style={{ padding: "80px" }}>
              {loading && <F1Loader message="LOADING CIRCUITS..." />}
            </div>
          )}

          {!loading && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "6px",
              }}
            >
              {filtered.map((circuit) => {
                const staticData = CIRCUIT_STATIC[circuit.circuitId]
                const color = getColor(circuit.circuitId)

                return (
                  <Link
                    key={circuit.circuitId}
                    href={`/sports/f1/circuits/${circuit.circuitId}`}
                    style={{ textDecoration: "none" }}
                  >
                    {/* Content */}
                    <div style={{ position: "relative", zIndex: 1 }}>
                      {/* Image with text overlay */}
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "140px",
                          overflow: "hidden",
                        }}
                      >
                        {/* Background image */}
                        <img
                          src={`/F1/circuits/${circuit.circuitId}.jpg`}
                          alt={circuit.circuitName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement
                            img.style.display = "none"
                          }}
                        />

                        {/* Gradient overlay */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: `linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)`,
                          }}
                        />

                        {/* Text */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: "12px 16px",
                          }}
                        >
                          <p>{circuit.country}</p>
                          <p>{circuit.circuitName}</p>
                          <p>📍 {circuit.locality}</p>
                        </div>
                      </div>

                      {/* Stats below image */}
                      <div style={{ padding: "14px 16px" }}></div>
                    </div>{" "}
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
                NO CIRCUITS FOUND FOR "{search}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
