"use client"

import { useEffect, useState } from "react"
import HeroSection from "@/components/f1/HeroSection"
import RaceStripSection from "@/components/f1/RaceStripSection"
import DriverStandingsSection from "@/components/f1/DriverStandingsSection"
import ConstructorStandingsSection from "@/components/f1/ConstructorStandingsSection"
import LastRaceSection from "@/components/f1/LastRaceSection"
import PartnersSection from "@/components/f1/PartnersSection"
import type { Race, DriverStanding, ConstructorStanding, RaceResult } from "@/components/types/f1"

const SEASON = "2025"

export default function F1Page() {
    const [races, setRaces] = useState<Race[]>([])
    const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([])
    const today = new Date().toISOString().split("T")[0]
    const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([])
    const [lastRace, setLastRace] = useState<Race | null>(null)
    const [lastRaceResults, setLastRaceResults] = useState<RaceResult[]>([])

    useEffect(() => {
        fetch(`/api/f1/races?season=${SEASON}`)
            .then(r => r.json())
            .then(data => setRaces(data.races ?? []))

        fetch(`/api/f1/driver-standings?season=${SEASON}`)
            .then(r => r.json())
            .then(data => setDriverStandings(data.standings ?? []))

        fetch(`/api/f1/constructor-standings?season=${SEASON}`)
            .then(r => r.json())
            .then(data => setConstructorStandings(data.standings ?? []))

        fetch(`/api/f1/driver-standings?season=${SEASON}`)
            .then(r => r.json())
            .then(data => setDriverStandings(data.standings ?? []))

        fetch(`/api/f1/constructor-standings?season=${SEASON}`)
            .then(r => r.json())
            .then(data => setConstructorStandings(data.standings ?? []))

        fetch(`/api/f1/races?season=${SEASON}`)  // keep only this one
            .then(r => r.json())
            .then(data => {
                const allRaces: Race[] = data.races ?? []
                setRaces(allRaces)
                const pastRaces = allRaces.filter(r => r.date < today)
                const last = pastRaces[pastRaces.length - 1]
                if (last) {
                    setLastRace(last)
                    fetch(`/api/f1/race-results?season=${SEASON}&round=${last.round}`)
                        .then(r => r.json())
                        .then(data => setLastRaceResults(data.race?.results ?? []))
                }
            })
    }, [])



    const nextRace = races.find(r => r.date >= today) ?? null

    return (
        <>
            <HeroSection nextRace={nextRace} />
            <RaceStripSection races={races} />

            <div className="max-w-7xl mx-auto px-6">
                <DriverStandingsSection standings={driverStandings} />
                <ConstructorStandingsSection standings={constructorStandings} />
                <LastRaceSection race={lastRace} results={lastRaceResults} />
                <PartnersSection />
            </div>
        </>
    )
}