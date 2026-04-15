"use client"

import { useEffect, useState } from "react"
import MotoGPHero from "@/components/motogp/MotoGPHero"
import MotoGPRaceStrip from "@/components/motogp/MotoGPRaceStrip"
import MotoGPRiderStandings from "@/components/motogp/MotoGPRiderStandings"
import MotoGPConstructorStandings from "@/components/motogp/MotoGPConstructorStandings"
import MotoGPLastRace from "@/components/motogp/MotoGPLastRace"
import { CURRENT_SEASON } from "@/lib/motogp/motogp-constants"
import Loader from "@/components/layout/Loader"
import MotoGPNews from "@/components/motogp/MotoGPNews"


type Category = "MotoGP" | "Moto2" | "Moto3"

interface MotoGPEvent {
    id: string
    name: string
    shortName: string
    sponsoredName?: string | null
    dateStart: string
    dateEnd: string
    status?: string | null
    circuit?: { name: string; place?: string | null; nation?: string | null } | null
}

interface RiderStanding {
    position: number
    points: number
    raceWins: number
    podiums: number
    sprintWins: number
    teamName?: string | null
    constructorName?: string | null
    rider: { id: string; fullName: string; nationality?: string | null; number?: number | null; photoUrl?: string | null }
}

interface ConstructorStanding {
    position: number
    points: number
    wins: number
    constructor: { id: string; name: string }
}

interface RaceResult {
    position?: number | null
    status?: string | null
    points?: number | null
    time?: string | null
    gapFirst?: string | null
    totalLaps?: number | null
    averageSpeed?: number | null
    rider: { id: string; fullName: string; nationality?: string | null; number?: number | null; photoUrl?: string | null }
    team?: { id: string; name: string } | null
    constructor?: { id: string; name: string } | null
}

export default function MotoGPPage() {
    const [loading, setLoading] = useState(true)
    const [events, setEvents] = useState<MotoGPEvent[]>([])
    const [nextEvent, setNextEvent] = useState<MotoGPEvent | null>(null)
    const [lastEvent, setLastEvent] = useState<MotoGPEvent | null>(null)
    const [lastRaceResults, setLastRaceResults] = useState<RaceResult[]>([])
    const [category, setCategory] = useState<Category>("MotoGP")
    const [riderStandings, setRiderStandings] = useState<RiderStanding[]>([])
    const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([])
    const [standingsLoading, setStandingsLoading] = useState(false)

    const today = new Date().toISOString().split("T")[0]

    // Load events + last race results once
    useEffect(() => {
        fetch(`/api/motogp/events?year=${CURRENT_SEASON}&category=MotoGP`)
            .then(r => r.json())
            .then(async data => {
                const all: MotoGPEvent[] = data.events ?? []
                setEvents(all)
                setNextEvent(all.find(e => e.dateEnd >= today) ?? null)

                // Last finished event
                const past = all.filter(e => e.dateEnd < today && e.status === "FINISHED")
                const last = past[past.length - 1] ?? null
                setLastEvent(last)

                // Fetch last race results
                if (last) {
                    const eventData = await fetch(`/api/motogp/events/${last.id}?sessions=race`)
                        .then(r => r.json())
                    const raceSessions = eventData.event?.sessions ?? []
                    const raceSession = raceSessions.find((s: { type: string }) => s.type === "RAC")
                    if (raceSession) {
                        setLastRaceResults(raceSession.results ?? [])
                    }
                }
            })
            .catch(err => console.error("[MotoGP] events:", err))
            .finally(() => setLoading(false))
    }, [])

    // Load standings when category changes
    useEffect(() => {
        setStandingsLoading(true)
        Promise.all([
            fetch(`/api/motogp/rider-standings?year=${CURRENT_SEASON}&category=${category}`).then(r => r.json()),
            fetch(`/api/motogp/constructor-standings?year=${CURRENT_SEASON}&category=${category}`).then(r => r.json()),
        ])
            .then(([riderData, constructorData]) => {
                setRiderStandings(riderData.standings ?? [])
                setConstructorStandings(constructorData.standings ?? [])
            })
            .catch(err => console.error("[MotoGP] standings:", err))
            .finally(() => setStandingsLoading(false))
    }, [category])

    if (loading) return <Loader message="LOADING MOTOGP..." />

    return (
        <>
            <MotoGPHero nextEvent={nextEvent} />
            <MotoGPRaceStrip events={events} />

            <div className="max-w-7xl mx-auto px-6 py-12 mt-10">
                <MotoGPRiderStandings
                    standings={riderStandings}
                    category={category}
                    onCategoryChange={setCategory}
                    loading={standingsLoading}
                />

                <MotoGPConstructorStandings
                    standings={constructorStandings}
                    category={category}
                    onCategoryChange={setCategory}
                    loading={standingsLoading}
                />
                <MotoGPLastRace
                    event={lastEvent}
                    results={lastRaceResults}
                />
                <MotoGPNews />
            </div>
        </>
    )
}