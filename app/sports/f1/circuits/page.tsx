"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { CIRCUIT_STATIC } from "@/lib/fi/circuit-data"
import {
  CIRCUIT_COLORS,
  CIRCUIT_IMAGES,
} from "@/lib/fi/f1-constants"
import F1Loader from "@/components/f1/F1Loader"
import { MapPinCheckInside } from "lucide-react"

interface Circuit {
  circuitId: string
  circuitName: string
  locality: string | null
  country: string | null
  lat: string | null
  lng: string | null
}

const getColor = (id: string) => CIRCUIT_COLORS[id] ?? "#E10600"


function CircuitImage({
  circuitId,
  alt,
}: {
  circuitId: string
  alt: string
}) {
  const getCircuitImage = (id: string) =>
    CIRCUIT_IMAGES[id] ?? `/F1/circuits/${id}.jpg`

  const [src, setSrc] = useState(getCircuitImage(circuitId))

  return (
    <Image
      src={src}
      alt={alt}
      fill
      style={{ objectFit: "cover" }}
      onError={() => {
        if (src !== "/F1/circuits/fallback.jpg") {
          setSrc("/F1/circuits/fallback.jpg")
        }
      }}
    />
  )
}

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
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              fontWeight: 700,
              color: "#ffffff",
              margin: "0 0 8px 0",
              lineHeight: 0.9,
            }}
          >
            CIRCUITS
          </h1>

          <p style={{ color: "rgba(255,255,255,0.3)" }}>
            {circuits.length} circuits in the Formula 1 database
          </p>

          <input
            type="text"
            placeholder="Search circuits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              marginTop: "20px",
              padding: "10px",
              width: "300px",
              background: "#111",
              color: "#fff",
              border: "1px solid #333",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          {loading && (
            <div style={{ padding: "80px" }}>
              <F1Loader message="LOADING CIRCUITS..." />
            </div>
          )}

          {!loading && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px",
              }}
            >
              {filtered.map((circuit) => {
                const color = getColor(circuit.circuitId)

                return (
                  <Link
                    key={circuit.circuitId}
                    href={`/sports/f1/circuits/${circuit.circuitId}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "140px",
                          overflow: "hidden",
                        }}
                      >
                        {/* ✅ IMAGE COMPONENT */}
                        <CircuitImage
                          circuitId={circuit.circuitId}
                          alt={circuit.circuitName}
                        />

                        {/* overlay */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(0deg, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)",
                          }}
                        />

                        {/* text */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: "12px 16px",
                            color: "#cccccc",
                          }}
                        >
                          <p style={{
                            fontFamily: "var(--font-display)",
                          }}>{circuit.country?.toUpperCase()}</p>
                          <p>{circuit.circuitName}</p>
                          <p style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <MapPinCheckInside size={16} className="text-f1-red" />
                            {circuit.locality}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ padding: "80px", textAlign: "center" }}>
              <p style={{ color: "rgba(255,255,255,0.3)" }}>
                NO CIRCUITS FOUND FOR "{search}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}