"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { MOTOGP_RED, FALLBACK_RIDER } from "@/lib/motogp/motogp-constants"
import { getConstructorColor } from "@/components/motogp/MotoGPRiderStandings"
import { getMotoGPCircuitStatic } from "@/lib/motogp/circuit-data"
import Loader from "@/components/layout/Loader"
import { MapPinCheckInside } from "lucide-react"


// ─── Types ────────────────────────────────────────────────────────────────────

interface CircuitDetail {
    id: string
    name: string
    place?: string | null
    nation?: string | null
    legacyId?: number | null
}

interface RaceHistory {
    eventId: string
    eventName: string
    year: number
    dateStart: string
    dateEnd: string
    winner: {
        riderId: string
        riderName: string
        nationality?: string | null
        constructorName?: string | null
        teamName?: string | null
        time?: string | null
        photoUrl?: string | null
    } | null
}


// ─── Nation → ISO2 ───────────────────────────────────────────────────────────

const NATION_TO_ISO2: Record<string, string> = {
    SPA: "ES", ITA: "IT", FRA: "FR", GBR: "GB", GER: "DE",
    NED: "NL", POR: "PT", AME: "US", ARG: "AR", AUS: "AU",
    JPN: "JP", MAL: "MY", THA: "TH", IND: "IN", IDN: "ID",
    QAT: "QA", KAZ: "KZ", FIN: "FI", AUT: "AT", CZE: "CZ",
    RSM: "SM", AND: "AD", CAT: "ES", VAL: "ES", ARA: "ES",
    MAS: "MY", CHN: "CN", SAF: "ZA", BRA: "BR", MEX: "MX",
    CAN: "CA", USA: "US", PRC: "CN", TUT: "TN",
}

function getFlagEmoji(nation: string | null | undefined): string {
    if (!nation) return "🏁"
    const iso2 = NATION_TO_ISO2[nation.toUpperCase()] ?? (nation.length === 2 ? nation : null)
    if (!iso2) return "🏁"
    return iso2.toUpperCase().replace(/./g, c => String.fromCodePoint(c.charCodeAt(0) + 127397))
}

function getNationalityFlag(iso2: string | null | undefined): string {
    if (!iso2 || iso2.length !== 2) return ""
    return iso2.toUpperCase().replace(/./g, c => String.fromCodePoint(c.charCodeAt(0) + 127397))
}

// ─── Leaflet Map — geocodes via known coords then Nominatim fallback ────────────

const CIRCUIT_COORDS: Record<string, [number, number]> = {
    "Circuit de Barcelona-Catalunya": [41.5700, 2.2611],
    "Circuito de Jerez - Ángel Nieto": [36.7104, -6.0329],
    "Circuit Ricardo Tormo": [39.4889, -0.6317],
    "Motorland Aragón": [41.1631, -0.2517],
    "Autodromo del Mugello": [43.9975, 11.3719],
    "Autodromo Internazionale del Mugello": [43.9975, 11.3719],
    "Misano World Circuit Marco Simoncelli": [43.9653, 12.6839],
    "Sachsenring": [50.7897, 12.6886],
    "Circuit Bugatti": [47.9497, 0.2206],
    "Autódromo Internacional do Algarve": [37.2275, -8.6267],
    "Autodromo Internacional do Algarve": [37.2275, -8.6267],
    "TT Circuit Assen": [52.9625, 6.5236],
    "Red Bull Ring": [47.2197, 14.7647],
    "Automotodrom Brno": [49.1689, 16.5472],
    "Autódromo Termas de Río Hondo": [-27.5167, -64.8667],
    "Phillip Island Grand Prix Circuit": [-38.5000, 145.2311],
    "Twin Ring Motegi": [36.5372, 140.1997],
    "Mobility Resort Motegi": [36.5372, 140.1997],
    "Sepang International Circuit": [2.7606, 101.7381],
    "Chang International Circuit": [14.9503, 102.9228],
    "Lusail International Circuit": [25.4900, 51.4542],
    "Sokol International Racetrack": [51.0833, 71.4167],
    "Mandalika International Street Circuit": [-8.8892, 116.3022],
    "Buddh International Circuit": [28.3487, 77.5313],
    "Circuit of the Americas": [30.1328, -97.6411],
    "Autódromo Internacional Nelson Piquet": [-22.9756, -43.3956],
    "Autódromo Hermanos Rodríguez": [19.4042, -99.0907],
}


const CircuitMap = ({ circuitName, place }: { circuitName: string; place?: string | null }) => {
    const mapRef = useRef<HTMLDivElement>(null)
    const [coords, setCoords] = useState<[number, number] | null>(null)
    const [geocoding, setGeocoding] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const known = CIRCUIT_COORDS[circuitName]
        if (known) {
            setCoords(known)
            setGeocoding(false)
            return
        }

        const query = encodeURIComponent(`${circuitName}${place ? " " + place : ""} motorsport circuit`)

        fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
            headers: { "Accept-Language": "en" },
        })
            .then(r => r.json())
            .then(data => {
                if (data[0]) {
                    setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)])
                } else {
                    setError(true)
                }
            })
            .catch(() => setError(true))
            .finally(() => setGeocoding(false))
    }, [circuitName, place])

    useEffect(() => {
        if (!coords || !mapRef.current || geocoding) return

        let map: import("leaflet").Map | null = null

        const initMap = async () => {
            try {
                const L = await import("leaflet")

                const mapInstance = L.map(mapRef.current!, {
                    center: coords,
                    zoom: 14,
                    zoomControl: true,
                    attributionControl: false,
                })

                L.tileLayer(
                    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
                    { maxZoom: 19 }
                ).addTo(mapInstance)

                L.circleMarker(coords, {
                    radius: 10,
                    fillColor: "var(--accent)",
                    color: "#fff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 1,
                })
                    .bindPopup(`<strong>${circuitName}</strong>`)
                    .addTo(mapInstance)

                map = mapInstance
            } catch {
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
    }, [coords, geocoding, circuitName])

    if (error) {
        return (
            <div style={{ height: "380px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Map unavailable
                </p>
            </div>
        )
    }

    return (
        <div style={{ position: "relative", height: "380px", border: "1px solid rgba(255,255,255,0.06)" }}>
            {geocoding && (
                <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(10,10,10,0.85)" }}>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                        Locating circuit...
                    </p>
                </div>
            )}
            <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
        </div>
    )
}
const StatBox = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
    <div style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "16px" }}>
        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "var(--font-display)" }}>
            {label}
        </p>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "#ffffff", margin: 0, lineHeight: 1 }}>
            {value}
        </p>
        {sub && <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", margin: "4px 0 0" }}>{sub}</p>}
    </div>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MotoGPCircuitDetailPage() {
    const params = useParams()
    const id = params?.id as string

    const [circuit, setCircuit] = useState<CircuitDetail | null>(null)
    const [history, setHistory] = useState<RaceHistory[]>([])
    const [totalRaces, setTotalRaces] = useState(0)
    const [loading, setLoading] = useState(true)



    useEffect(() => {
        if (!id) return
        fetch(`/api/motogp/circuits/${id}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) return
                setCircuit(data.circuit)
                setHistory(data.history ?? [])
                setTotalRaces(data.totalRaces ?? 0)
            })
            .catch(err => console.error("[MotoGP] circuit detail:", err))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <Loader message="LOADING CIRCUIT..." />

    if (!circuit) return (
        <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
            <p style={{ fontFamily: "var(--font-display)", color: "var(--accent)", fontSize: "1.5rem", letterSpacing: "0.1em" }}>CIRCUIT NOT FOUND</p>
            <Link href="/sports/motogp/circuits" style={{ fontFamily: "var(--font-sans)", color: "#555", fontSize: "0.85rem", textDecoration: "none" }}>← Back to Circuits</Link>
        </div>
    )

    const flag = getFlagEmoji(circuit.nation)

    const validHistory = history
        .filter(ev => ev.winner !== null)
        .sort((a, b) => b.year - a.year) // latest first

    const firstYear = validHistory.length > 0
        ? validHistory[validHistory.length - 1].year
        : null

    const lastYear = validHistory.length > 0
        ? validHistory[0].year
        : null

    const winnerCount: Record<
        string,
        { name: string; count: number; constructorName: string | null }
    > = {}

    for (const ev of validHistory) {
        if (!ev.winner) continue
        const key = ev.winner.riderId
        if (!winnerCount[key]) {
            winnerCount[key] = {
                name: ev.winner.riderName,
                count: 0,
                constructorName: ev.winner.constructorName ?? null,
            }
        }
        winnerCount[key].count++
    }
    const topWinner = Object.values(winnerCount).sort((a, b) => b.count - a.count)[0]

    // Static track data
    const staticData = getMotoGPCircuitStatic(circuit.name)

    // Build StatBox items — richer when static data is available
    const statBoxItems = staticData
        ? [
            { label: "Circuit Length", value: staticData.length },
            { label: "Corners", value: staticData.corners },
            { label: "First MotoGP Race", value: staticData.firstGP },
            { label: "Most Recent", value: lastYear ?? "—" },
            { label: "Total MotoGP Races", value: totalRaces },
            { label: "Lap Record", value: staticData.lapRecord, sub: `${staticData.lapRecordHolder} (${staticData.lapRecordYear})` },
        ]
        : [
            { label: "Total MotoGP Races", value: totalRaces },
            { label: "First MotoGP Race", value: firstYear ?? "—" },
            { label: "Most Recent", value: lastYear ?? "—" },
            { label: "Nation", value: circuit.nation ? `${flag} ${circuit.nation}` : "—" },
        ]

    return (
        <div>
            {/* Header */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="max-w-7xl mx-auto px-6 py-10">
                    {/* Breadcrumb */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "16px",
                        }}
                    >
                        {[
                            { label: "MOTOGP", href: "/sports/motogp" },
                            { label: "CIRCUITS", href: "/sports/motogp/circuits" },
                            { label: circuit.name.toUpperCase(), href: null },
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
                                            fontSize: "11px",
                                            color: "rgba(255,255,255,0.3)",
                                            textDecoration: "none",
                                            letterSpacing: "0.1em",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span
                                        style={{
                                            fontFamily: "var(--font-display)",
                                            fontSize: "11px",
                                            color: "rgba(255,255,255,0.6)",
                                            letterSpacing: "0.1em",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {crumb.label}
                                    </span>
                                )}
                                {i < arr.length - 1 && (
                                    <span
                                        style={{
                                            color: "rgba(255,255,255,0.2)",
                                            fontSize: "11px",
                                        }}
                                    >
                                        /
                                    </span>
                                )}
                            </span>
                        ))}
                    </div>

                    <p
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: "var(--accent)",
                            margin: "0 0 6px",
                        }}
                    >
                        MotoGP™ Circuit
                    </p>
                    <h1
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
                            fontWeight: 700,
                            color: "#ffffff",
                            margin: "0 0 8px",
                            lineHeight: 1,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        {circuit.name.toUpperCase()}
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
                        <MapPinCheckInside size={16} style={{ color: "var(--accent)" }} />
                        {[circuit.place, circuit.nation]
                            .filter(Boolean)
                            .join(" · ")
                            .toUpperCase()}
                    </p>
                </div>
            </div>

            {/* Map + stats */}
            <section className="max-w-7xl mx-auto px-6 py-10">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 360px",
                        gap: "6px",
                        alignItems: "start",
                    }}
                >
                    <CircuitMap circuitName={circuit.name} place={circuit.place} />

                    <div
                        style={{ display: "flex", flexDirection: "column", gap: "6px" }}
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "6px",
                            }}
                        >
                            {statBoxItems.map(item => (
                                <StatBox
                                    key={item.label}
                                    label={item.label}
                                    value={item.value}
                                    sub={"sub" in item ? item.sub : undefined}
                                />
                            ))}
                        </div>

                        {/* Most successful rider */}
                        {topWinner && (
                            <div
                                style={{
                                    backgroundColor: "rgba(255,255,255,0.02)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    borderLeft: "3px solid var(--accent)",
                                    padding: "16px",
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: "10px",
                                        color: "rgba(255,255,255,0.25)",
                                        margin: "0 0 8px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.12em",
                                        fontFamily: "var(--font-display)",
                                    }}
                                >
                                    Most Wins Here
                                </p>
                                <p
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: "1.3rem",
                                        fontWeight: 700,
                                        color: "#fff",
                                        margin: "0 0 2px",
                                        lineHeight: 1,
                                    }}
                                >
                                    {topWinner.name
                                        .split(" ")
                                        .slice(1)
                                        .join(" ")
                                        .toUpperCase() || topWinner.name.toUpperCase()}
                                </p>
                                <p
                                    style={{
                                        fontSize: "0.75rem",
                                        color: "rgba(255,255,255,0.4)",
                                        margin: 0,
                                    }}
                                >
                                    {topWinner.count} {topWinner.count === 1 ? "win" : "wins"}
                                    {topWinner.constructorName
                                        ? ` · ${topWinner.constructorName}`
                                        : ""}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Race history */}
            <section className="max-w-7xl mx-auto px-6 pb-16">
                {/* Section header */}
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
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: "#fff",
                            margin: 0,
                            letterSpacing: "0.05em",
                        }}
                    >
                        GRAND PRIX HISTORY · {totalRaces} RACES
                    </h2>
                </div>

                {validHistory.length === 0 ? (
                    <div
                        style={{
                            padding: "60px",
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
                            NO RACE HISTORY AVAILABLE
                        </p>
                    </div>
                ) : (
                    <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                        {/* Table header */}
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
                                        color: "rgba(255,255,255,0.25)",
                                    }}
                                >
                                    {h}
                                </span>
                            ))}
                        </div>

                        {validHistory.map((ev) => {
                            // const w = ev.winner
                            // const color = w?.constructorName
                            //     ? getConstructorColor(w.constructorName)
                            //     : "rgba(255,255,255,0.15)"
                            // const winnerLastName = w
                            //     ? w.riderName.split(" ").slice(1).join(" ") || w.riderName
                            //     : null
                            const w = ev.winner

                            const color = w?.constructorName
                                ? getConstructorColor(w.constructorName)
                                : "rgba(255,255,255,0.15)"

                            return (
                                <Link
                                    key={ev.eventId}
                                    href={`/sports/motogp/races/${ev.eventId}`}
                                    style={{ textDecoration: "none", display: "block" }}
                                >
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "5rem 1fr 1fr 1fr 6rem",
                                            alignItems: "center",
                                            padding: "12px 16px",
                                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                                            // borderLeft: `3px solid ${color}`,
                                            transition: "background-color 0.15s",
                                            cursor: "pointer",
                                        }}
                                        onMouseEnter={(e) =>
                                        ((
                                            e.currentTarget as HTMLElement
                                        ).style.backgroundColor = "rgba(255,255,255,0.03)")
                                        }
                                        onMouseLeave={(e) =>
                                        ((
                                            e.currentTarget as HTMLElement
                                        ).style.backgroundColor = "transparent")
                                        }
                                    >
                                        {/* Year */}
                                        <span
                                            style={{
                                                fontFamily: "var(--font-inter)",
                                                fontSize: "0.9rem",
                                                fontWeight: 700,
                                                color: "#ffffff",
                                            }}
                                        >
                                            {ev.year}
                                        </span>

                                        {/* Winner */}
                                        {w ? (
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

                                                {/* Rider Image */}
                                                <img
                                                    src={w.photoUrl || FALLBACK_RIDER}
                                                    alt={w.riderName}
                                                    onError={(e) => {
                                                        const img = e.currentTarget
                                                        img.src = FALLBACK_RIDER
                                                    }}
                                                    style={{
                                                        width: "28px",
                                                        height: "28px",
                                                        borderRadius: "50%",
                                                        objectFit: "cover",
                                                        border: "1px solid rgba(255,255,255,0.2)",
                                                    }}
                                                />

                                                {/* Name */}
                                                <div>
                                                    <span
                                                        style={{
                                                            fontFamily: "var(--font-inter)",
                                                            fontSize: "0.85rem",
                                                            fontWeight: 700,
                                                            color: "#ffffff",
                                                        }}
                                                    >
                                                        {w.riderName}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>
                                        )}

                                        {/* Constructor */}
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                            }}
                                        >

                                            <span
                                                style={{
                                                    fontSize: "0.8rem",
                                                    color: "rgba(255,255,255,0.5)",
                                                    fontFamily: "var(--font-inter)",
                                                }}
                                            >
                                                {/* {w?.constructorName ?? "—"} */}
                                                {w?.teamName ?? "—"}
                                            </span>
                                        </div>

                                        {/* Team */}

                                        {/* <span
                                            style={{
                                                fontSize: "0.78rem",
                                                color: "rgba(255,255,255,0.3)",
                                            }}
                                        >
                                           {w?.teamName ?? "—"}
                                            {w?.nationality ? getNationalityFlag(w.nationality) : "—"}
                                        </span> */}
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <span style={{ fontSize: "14px" }}>
                                                {getFlagEmoji(w?.nationality ?? "")}
                                            </span>
                                            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-inter)", }}>
                                                {w?.nationality ?? "—"}
                                            </span>
                                        </div>

                                        {/* Time */}
                                        <span
                                            style={{
                                                fontFamily: "var(--font-inter)",
                                                fontSize: "0.75rem",
                                                color: "rgba(255,255,255,0.5)",

                                            }}
                                        >
                                            {w?.time ?? "—"}
                                        </span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}