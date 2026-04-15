"use client"

import { useEffect, useState } from "react"
import F1Hero from "@/components/f1/F1Hero"
import F1RaceStrip from "@/components/f1/F1RaceStrip"


import type {
  Race,
  DriverStanding,
  ConstructorStanding,
  RaceResult,
} from "@/types/f1"

import { CURRENT_SEASON } from "@/lib/f1/f1-constants"
import Loader from "@/components/layout/Loader"
import F1News from "@/components/f1/F1News"
import F1LastRace from "@/components/f1/F1LastRace"

import F1DriverStandings from "@/components/f1/F1DriverStandings"
import ConstructorStandingsSection from "@/components/f1/F1ConstructorStandings"
import F1ConstructorStandings from "@/components/f1/F1ConstructorStandings"

const SEASON = CURRENT_SEASON

export default function F1Page() {
  const [loading, setLoading] = useState(true)
  const [standingsLoading, setStandingsLoading] = useState(false)

  const [races, setRaces] = useState<Race[]>([])
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([])
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([])
  const [lastRace, setLastRace] = useState<Race | null>(null)
  const [lastRaceResults, setLastRaceResults] = useState<RaceResult[]>([])

  const today = new Date().toISOString().split("T")[0]


  useEffect(() => {
    setLoading(true)

    fetch(`/api/f1/races?season=${SEASON}`)
      .then((r) => r.json())
      .then((racesData) => {
        const allRaces: Race[] = racesData.races ?? []
        setRaces(allRaces)

        const pastRaces = allRaces.filter((r) => r.date < today)
        const last = pastRaces[pastRaces.length - 1]

        if (last) {
          setLastRace(last)

          fetch(`/api/f1/race-results?season=${SEASON}&round=${last.round}`)
            .then((r) => r.json())
            .then((data) =>
              setLastRaceResults(data.race?.results ?? [])
            )
        }
      })
      .finally(() => setLoading(false))
  }, [])


  useEffect(() => {
    setStandingsLoading(true)

    Promise.all([
      fetch(`/api/f1/driver-standings?season=${SEASON}`).then((r) => r.json()),
      fetch(`/api/f1/constructor-standings?season=${SEASON}`).then((r) => r.json()),
    ])
      .then(([driverData, constructorData]) => {
        setDriverStandings(driverData.standings ?? [])
        setConstructorStandings(constructorData.standings ?? [])
      })
      .catch((err) => console.error("[F1] standings:", err))
      .finally(() => setStandingsLoading(false))
  }, [])

  const nextRace = races.find((r) => r.date >= today) ?? null

  if (loading) return <Loader message="Data loading..." />

  return (
    <>
      <F1Hero nextRace={nextRace} />
      <F1RaceStrip races={races} />

      <div className="max-w-7xl mx-auto px-6 py-12 mt-10">

        <F1DriverStandings standings={driverStandings} />
        <F1ConstructorStandings constructorStandings={constructorStandings} />

        <F1LastRace race={lastRace} results={lastRaceResults}
          loading={standingsLoading} />
        <F1News />
      </div>
    </>
  )
}