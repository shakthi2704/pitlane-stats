"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import F1Loader from "@/components/f1/F1Loader"
import { CIRCUIT_STATIC } from "@/lib/fi/circuit-data"
import { CIRCUIT_COLORS, CIRCUIT_IMAGES } from "@/lib/fi/f1-constants"

interface Circuit {
  circuitId: string
  circuitName: string
  locality: string | null
  country: string | null
  lat: string | null
  lng: string | null
}

const getColor = (id: string) => CIRCUIT_COLORS[id] ?? "#E10600"
const getImage = (id: string) => CIRCUIT_IMAGES[id] ?? null

export default function CircuitsPage() {
  const [circuits, setCircuits] = useState<Circuit[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/f1/circuits")
      .then(r => r.json())
      .then(data => setCircuits(data.circuits ?? []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = circuits.filter(c =>
    c.circuitName.toLowerCase().includes(search.toLowerCase()) ||
    c.country?.toLowerCase().includes(search.toLowerCase()) ||
    c.locality?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "48px 0 0" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", marginBottom: "28px" }}>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-f1-red)", marginBottom: "8px" }}>
                Formula 1
              </p>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 700, color: "#ffffff", margin: "0 0 8px", lineHeight: 0.9, letterSpacing: "-0.03em" }}>
                CIRCUITS
              </h1>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem", margin: 0 }}>
                {filtered.length} circuits in the Formula 1 database
              </p>
            </div>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", fontSize: "14px", pointerEvents: "none" }}>🔍</span>
              <input
                type="text"
                placeholder="Search circuits, countries..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", padding: "10px 14px 10px 36px",
                  fontSize: "0.85rem", outline: "none", width: "260px",
                  fontFamily: "var(--font-sans)", transition: "border-color 0.2s",
                }}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--color-f1-red)"}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "16px", padding: 0, lineHeight: 1 }}>×</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading && <F1Loader message="LOADING CIRCUITS..." />}

        {!loading && filtered.length === 0 && (
          <div style={{ padding: "80px", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>
              {search ? `NO CIRCUITS MATCHING "${search.toUpperCase()}"` : "NO CIRCUITS FOUND"}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
            {filtered.map(circuit => {
              const color = getColor(circuit.circuitId)
              const imgSrc = getImage(circuit.circuitId)
              const staticData = CIRCUIT_STATIC[circuit.circuitId]

              return (
                <Link key={circuit.circuitId} href={`/sports/f1/circuits/${circuit.circuitId}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderTop: `3px solid ${color}`,
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = "translateY(-5px)"
                      el.style.boxShadow = `0 16px 40px ${color}25`
                      el.style.borderColor = `${color}88`
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = "translateY(0)"
                      el.style.boxShadow = "none"
                      el.style.borderColor = "rgba(255,255,255,0.07)"
                    }}
                  >
                    {/* Image area */}
                    <div style={{ position: "relative", height: "150px", backgroundColor: `${color}18`, overflow: "hidden" }}>
                      {imgSrc ? (
                        <>
                          <img
                            src={imgSrc}
                            alt={circuit.circuitName}
                            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.75, transition: "opacity 0.2s" }}
                            onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                          />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.05) 100%)" }} />
                        </>
                      ) : (
                        /* No image — show color block with circuit name watermark */
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontFamily: "var(--font-display)", fontSize: "3.5rem", fontWeight: 900, color: color, opacity: 0.12, textTransform: "uppercase", letterSpacing: "-0.03em", userSelect: "none" }}>
                            {circuit.circuitId.slice(0, 3).toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Country bottom-left */}
                      <div style={{ position: "absolute", bottom: "12px", left: "14px" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 800, color: "#fff", margin: 0, textTransform: "uppercase" }}>
                          {circuit.country}
                        </p>
                      </div>

                      {/* Lap record badge top-right */}
                      {staticData?.lapRecord && (
                        <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                          <span style={{ fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 600, letterSpacing: "0.08em", color: "#4ade80", backgroundColor: "rgba(0,0,0,0.65)", padding: "2px 7px", border: "1px solid rgba(74,222,128,0.3)" }}>
                            🟢 {staticData.lapRecord}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ padding: "14px" }}>
                      <p style={{ fontFamily: "var(--font-display)", fontSize: "0.88rem", fontWeight: 700, color: "#fff", margin: "0 0 3px", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {circuit.circuitName}
                      </p>
                      <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: "0 0 10px" }}>
                        📍 {circuit.locality}
                      </p>

                      {/* Stats row */}
                      <div style={{ display: "flex", gap: "0", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                        {staticData ? (
                          <>
                            {[
                              { label: "LENGTH", value: staticData.length },
                              { label: "LAPS", value: staticData.laps },
                              { label: "CORNERS", value: staticData.corners },
                            ].map((s, i) => (
                              <div key={s.label} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                                <p style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1 }}>
                                  {s.value}
                                </p>
                                <p style={{ fontFamily: "var(--font-display)", fontSize: "8px", fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", margin: "3px 0 0", textTransform: "uppercase" }}>
                                  {s.label}
                                </p>
                              </div>
                            ))}
                          </>
                        ) : (
                          <p style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
                            First GP —
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}