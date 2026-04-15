export interface MotoGPCircuitStaticData {
    length: string        // "4.263 km"
    corners: number
    lapRecord: string     // "1:46.188"
    lapRecordHolder: string
    lapRecordYear: number
    firstGP: number
    rightCorners?: number
    leftCorners?: number
}

// Keys match MotoGPCircuit.name values from the DB
export const MOTOGP_CIRCUIT_STATIC: Record<string, MotoGPCircuitStaticData> = {
    "Circuito de Jerez - Ángel Nieto": {
        length: "4.423 km", corners: 13, lapRecord: "1:37.097",
        lapRecordHolder: "Marc Márquez", lapRecordYear: 2019, firstGP: 1987,
        rightCorners: 7, leftCorners: 6,
    },
    "Autodromo del Mugello": {
        length: "5.245 km", corners: 15, lapRecord: "1:46.188",
        lapRecordHolder: "Marc Márquez", lapRecordYear: 2023, firstGP: 1991,
        rightCorners: 6, leftCorners: 9,
    },
    "Autodromo Internazionale del Mugello": {
        length: "5.245 km", corners: 15, lapRecord: "1:46.188",
        lapRecordHolder: "Marc Márquez", lapRecordYear: 2023, firstGP: 1991,
        rightCorners: 6, leftCorners: 9,
    },
    "Circuit de Barcelona-Catalunya": {
        length: "4.657 km", corners: 16, lapRecord: "1:42.469",
        lapRecordHolder: "Jorge Lorenzo", lapRecordYear: 2016, firstGP: 1992,
        rightCorners: 9, leftCorners: 7,
    },
    "TT Circuit Assen": {
        length: "4.555 km", corners: 18, lapRecord: "1:33.022",
        lapRecordHolder: "Jorge Lorenzo", lapRecordYear: 2015, firstGP: 1949,
        rightCorners: 9, leftCorners: 9,
    },
    "Sachsenring": {
        length: "3.671 km", corners: 13, lapRecord: "1:21.228",
        lapRecordHolder: "Marc Márquez", lapRecordYear: 2019, firstGP: 1998,
        rightCorners: 3, leftCorners: 10,
    },
    "Circuit Bugatti": {
        length: "4.185 km", corners: 14, lapRecord: "1:32.583",
        lapRecordHolder: "Marc Márquez", lapRecordYear: 2023, firstGP: 2000,
        rightCorners: 7, leftCorners: 7,
    },
    "Red Bull Ring": {
        length: "4.318 km", corners: 10, lapRecord: "1:23.827",
        lapRecordHolder: "Brad Binder", lapRecordYear: 2021, firstGP: 1996,
        rightCorners: 7, leftCorners: 3,
    },
    "Autódromo Internacional do Algarve": {
        length: "4.592 km", corners: 15, lapRecord: "1:39.456",
        lapRecordHolder: "Jack Miller", lapRecordYear: 2021, firstGP: 2020,
        rightCorners: 7, leftCorners: 8,
    },
    "Autodromo Internacional do Algarve": {
        length: "4.592 km", corners: 15, lapRecord: "1:39.456",
        lapRecordHolder: "Jack Miller", lapRecordYear: 2021, firstGP: 2020,
        rightCorners: 7, leftCorners: 8,
    },
    "Circuit Ricardo Tormo": {
        length: "4.005 km", corners: 14, lapRecord: "1:30.980",
        lapRecordHolder: "Jorge Lorenzo", lapRecordYear: 2015, firstGP: 1999,
        rightCorners: 9, leftCorners: 5,
    },
    "Motorland Aragón": {
        length: "5.077 km", corners: 17, lapRecord: "1:47.149",
        lapRecordHolder: "Jorge Lorenzo", lapRecordYear: 2016, firstGP: 2010,
        rightCorners: 10, leftCorners: 7,
    },
    "Misano World Circuit Marco Simoncelli": {
        length: "4.226 km", corners: 16, lapRecord: "1:31.629",
        lapRecordHolder: "Marc Márquez", lapRecordYear: 2017, firstGP: 2007,
        rightCorners: 9, leftCorners: 7,
    },
    "Autódromo Termas de Río Hondo": {
        length: "4.806 km", corners: 14, lapRecord: "1:38.923",
        lapRecordHolder: "Marc Márquez", lapRecordYear: 2014, firstGP: 2014,
        rightCorners: 7, leftCorners: 7,
    },
    "Phillip Island Grand Prix Circuit": {
        length: "4.448 km", corners: 12, lapRecord: "1:27.899",
        lapRecordHolder: "Marc Márquez", lapRecordYear: 2013, firstGP: 1989,
        rightCorners: 4, leftCorners: 8,
    },
    "Twin Ring Motegi": {
        length: "4.801 km", corners: 14, lapRecord: "1:43.790",
        lapRecordHolder: "Marc Márquez", lapRecordYear: 2018, firstGP: 1999,
        rightCorners: 9, leftCorners: 5,
    },
    "Mobility Resort Motegi": {
        length: "4.801 km", corners: 14, lapRecord: "1:43.790",
        lapRecordHolder: "Marc Márquez", lapRecordYear: 2018, firstGP: 1999,
        rightCorners: 9, leftCorners: 5,
    },
    "Sepang International Circuit": {
        length: "5.542 km", corners: 15, lapRecord: "1:59.053",
        lapRecordHolder: "Jorge Lorenzo", lapRecordYear: 2015, firstGP: 1999,
        rightCorners: 7, leftCorners: 8,
    },
    "Chang International Circuit": {
        length: "4.554 km", corners: 12, lapRecord: "1:30.459",
        lapRecordHolder: "Marc Márquez", lapRecordYear: 2019, firstGP: 2018,
        rightCorners: 5, leftCorners: 7,
    },
    "Lusail International Circuit": {
        length: "5.380 km", corners: 16, lapRecord: "1:53.380",
        lapRecordHolder: "Jorge Martin", lapRecordYear: 2023, firstGP: 2004,
        rightCorners: 6, leftCorners: 10,
    },
    "Autódromo Hermanos Rodríguez": {
        length: "4.304 km", corners: 17, lapRecord: "1:58.833",
        lapRecordHolder: "Johann Zarco", lapRecordYear: 2019, firstGP: 2015,
        rightCorners: 9, leftCorners: 8,
    },
    "Mandalika International Street Circuit": {
        length: "4.031 km", corners: 17, lapRecord: "1:31.208",
        lapRecordHolder: "Francesco Bagnaia", lapRecordYear: 2022, firstGP: 2021,
        rightCorners: 10, leftCorners: 7,
    },
    "Buddh International Circuit": {
        length: "5.140 km", corners: 16, lapRecord: "1:43.714",
        lapRecordHolder: "Marc Márquez", lapRecordYear: 2023, firstGP: 2023,
        rightCorners: 8, leftCorners: 8,
    },
    "Circuit of the Americas": {
        length: "5.513 km", corners: 20, lapRecord: "2:02.369",
        lapRecordHolder: "Marc Márquez", lapRecordYear: 2015, firstGP: 2013,
        rightCorners: 9, leftCorners: 11,
    },
    "Autódromo Internacional Nelson Piquet": {
        length: "4.933 km", corners: 22, lapRecord: "1:34.973",
        lapRecordHolder: "Marc Márquez", lapRecordYear: 2014, firstGP: 1987,
        rightCorners: 10, leftCorners: 12,
    },
    "Sokol International Racetrack": {
        length: "4.702 km", corners: 14, lapRecord: "1:40.222",
        lapRecordHolder: "Francesco Bagnaia", lapRecordYear: 2023, firstGP: 2023,
        rightCorners: 8, leftCorners: 6,
    },
    "Automotodrom Brno": {
        length: "5.403 km", corners: 14, lapRecord: "1:56.027",
        lapRecordHolder: "Marc Márquez", lapRecordYear: 2019, firstGP: 1965,
        rightCorners: 6, leftCorners: 8,
    },
}

export function getMotoGPCircuitStatic(circuitName: string): MotoGPCircuitStaticData | null {
    return MOTOGP_CIRCUIT_STATIC[circuitName] ?? null
}