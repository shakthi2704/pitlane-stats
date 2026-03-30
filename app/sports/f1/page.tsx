"use client"

import { useEffect, useState } from "react"
import HeroSection from "@/components/f1/HeroSection"
import RaceStripSection from "@/components/f1/RaceStripSection"
import DriverStandingsSection from "@/components/f1/DriverStandingsSection"
import LastRaceSection from "@/components/f1/LastRaceSection"
import PartnersSection from "@/components/f1/PartnersSection"
import type {
  Race,
  DriverStanding,
  ConstructorStanding,
  RaceResult,
} from "@/types/f1"
import F1Loader from "@/components/f1/F1Loader"

const SEASON = "2025"

export default function F1Page() {
  const [loading, setLoading] = useState(true)
  const [races, setRaces] = useState<Race[]>([])
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([])
  const [constructorStandings, setConstructorStandings] = useState<
    ConstructorStanding[]
  >([])
  const [lastRace, setLastRace] = useState<Race | null>(null)
  const [lastRaceResults, setLastRaceResults] = useState<RaceResult[]>([])

  const today = new Date().toISOString().split("T")[0]

  // useEffect(() => {
  //   fetch(`/api/f1/races?season=${SEASON}`)
  //     .then((r) => r.json())
  //     .then((data) => setRaces(data.races ?? []))

  //   fetch(`/api/f1/driver-standings?season=${SEASON}`)
  //     .then((r) => r.json())
  //     .then((data) => setDriverStandings(data.standings ?? []))

  //   fetch(`/api/f1/constructor-standings?season=${SEASON}`)
  //     .then((r) => r.json())
  //     .then((data) => setConstructorStandings(data.standings ?? []))

  //   fetch(`/api/f1/races?season=${SEASON}`)
  //     .then((r) => r.json())
  //     .then((data) => {
  //       const allRaces: Race[] = data.races ?? []
  //       setRaces(allRaces)
  //       const pastRaces = allRaces.filter((r) => r.date < today)
  //       const last = pastRaces[pastRaces.length - 1]
  //       if (last) {
  //         setLastRace(last)
  //         fetch(`/api/f1/race-results?season=${SEASON}&round=${last.round}`)
  //           .then((r) => r.json())
  //           .then((data) => setLastRaceResults(data.race?.results ?? []))
  //       }
  //     })
  // }, [])
  useEffect(() => {
    setLoading(true)

    Promise.all([
      fetch(`/api/f1/races?season=${SEASON}`).then((r) => r.json()),
      fetch(`/api/f1/driver-standings?season=${SEASON}`).then((r) => r.json()),
      fetch(`/api/f1/constructor-standings?season=${SEASON}`).then((r) =>
        r.json(),
      ),
    ])
      .then(([racesData, driverData, constructorData]) => {
        const allRaces: Race[] = racesData.races ?? []
        setRaces(allRaces)

        const pastRaces = allRaces.filter((r) => r.date < today)
        const last = pastRaces[pastRaces.length - 1]
        if (last) {
          setLastRace(last)
          fetch(`/api/f1/race-results?season=${SEASON}&round=${last.round}`)
            .then((r) => r.json())
            .then((data) => setLastRaceResults(data.race?.results ?? []))
        }

        setDriverStandings(driverData.standings ?? [])
        setConstructorStandings(constructorData.standings ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  const nextRace = races.find((r) => r.date >= today) ?? null

  return (
    <>
      {loading && <F1Loader message="LOADING DATA..." />}
      {!loading && (
        <>
          <HeroSection nextRace={nextRace} />
          <RaceStripSection races={races} />
          <div className="max-w-7xl mx-auto px-6 py-12 mt-10">
            <DriverStandingsSection
              standings={driverStandings}
              constructorStandings={constructorStandings}
            />
            <LastRaceSection race={lastRace} results={lastRaceResults} />
            {/* <PartnersSection /> */}
          </div>
        </>
      )}
    </>
  )
}
