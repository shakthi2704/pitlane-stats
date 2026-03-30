export interface DriverStanding {
    position: number
    points: number
    wins: number
    driverId: string
    constructorId: string
    constructorName: string
    driver: {
        code: string | null
        givenName: string
        familyName: string
        nationality: string | null
        permanentNumber: string | null  // ← add this
    }
}

export interface ConstructorStanding {
    position: number
    points: number
    wins: number
    constructorId: string
    constructor: {
        name: string
        nationality: string | null
    }
}

export interface Race {
    id: number
    season: string
    round: number
    raceName: string
    date: string
    time: string | null
    circuit: {
        circuitId: string
        circuitName: string
        locality: string | null
        country: string | null
    }
}

export interface RaceResult {
    position: number | null
    positionText: string
    points: number | null
    time: string | null
    status: string | null
    grid: number | null
    laps: number | null
    fastestLapTime: string | null
    fastestLapRank: number | null
    driver: {
        driverId: string
        code: string | null
        givenName: string
        familyName: string
        nationality: string | null
    }
    constructor: {
        constructorId: string
        name: string
    }
}

export interface ConstructorStanding {
    position: number
    points: number
    wins: number
    constructorId: string
    constructor: {
        name: string
        nationality: string | null
    }
}
